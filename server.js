const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT) || 4173;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "bookings.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jsx": "text/babel; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
};

const readBookings = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read bookings:", error);
    return [];
  }
};

const writeBookings = (bookings) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf8");
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

const serveFile = (res, pathname) => {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const normalizedPath = path.normalize(safePath).replace(/^([.][.][/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { message: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        sendJson(res, 404, { message: "Not found" });
      } else {
        sendJson(res, 500, { message: "Server error" });
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/bookings" && req.method === "GET") {
    return sendJson(res, 200, readBookings());
  }

  if (url.pathname === "/api/bookings" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const { name, studentId, university, departure, destination, date, time, seatNumber } = payload;

      if (![name, studentId, university, departure, destination, date, time, seatNumber].every(Boolean)) {
        return sendJson(res, 400, {
          message: "Please provide all booking fields, including seat number.",
        });
      }

      const bookings = readBookings();
      const seatAlreadyTaken = bookings.some(
        (booking) =>
          booking.date === date &&
          booking.time === time &&
          booking.departure === departure &&
          booking.destination === destination &&
          String(booking.seatNumber) === String(seatNumber)
      );

      if (seatAlreadyTaken) {
        return sendJson(res, 409, {
          message: `Seat ${seatNumber} is already booked for this trip and time slot.`,
        });
      }

      const newBooking = {
        id: Date.now().toString(),
        name,
        studentId,
        university,
        departure,
        destination,
        date,
        time,
        seatNumber: String(seatNumber),
      };

      bookings.unshift(newBooking);
      writeBookings(bookings);
      return sendJson(res, 201, newBooking);
    } catch (_error) {
      return sendJson(res, 400, { message: "Invalid JSON payload." });
    }
  }

  if (url.pathname === "/api/bookings" && req.method === "DELETE") {
    writeBookings([]);
    return sendJson(res, 200, { message: "All bookings cleared." });
  }

  if (req.method === "GET") {
    return serveFile(res, url.pathname);
  }

  return sendJson(res, 405, { message: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`Campus Bus Booking server running on http://localhost:${PORT}`);
});
