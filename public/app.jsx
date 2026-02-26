const { useEffect, useState } = React;

const initialForm = {
  name: "",
  studentId: "",
  university: "",
  departure: "",
  destination: "",
  date: "",
  time: "",
  seatNumber: "",
};

function App() {
  const [formData, setFormData] = useState(initialForm);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    const response = await fetch("/api/bookings");
    const data = await response.json();
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const allFieldsFilled = Object.values(formData).every((value) => String(value).trim());
    if (!allFieldsFilled) {
      setMessage("Please fill in every field before submitting.");
      return;
    }

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.message || "Could not complete booking.");
      return;
    }

    setMessage(`Booking successful! Seat ${payload.seatNumber} reserved.`);
    setFormData(initialForm);
    fetchBookings();
  };

  const clearBookings = async () => {
    await fetch("/api/bookings", { method: "DELETE" });
    setMessage("All bookings have been cleared.");
    fetchBookings();
  };

  return (
    <>
      <header className="hero">
        <div className="hero__content">
          <h1>Campus Bus Booking</h1>
          <p>
            Book your bus home in minutes. Designed for university students with real-time seat
            selection.
          </p>
        </div>
      </header>

      <main className="container">
        <section className="card">
          <h2>Book a Seat</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Full Name
              <input name="name" value={formData.name} onChange={handleChange} required />
            </label>

            <label>
              Student ID
              <input name="studentId" value={formData.studentId} onChange={handleChange} required />
            </label>

            <label>
              University
              <input name="university" value={formData.university} onChange={handleChange} required />
            </label>

            <label>
              Departure Campus
              <input name="departure" value={formData.departure} onChange={handleChange} required />
            </label>

            <label>
              Destination City
              <input name="destination" value={formData.destination} onChange={handleChange} required />
            </label>

            <div className="row">
              <label>
                Travel Date
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </label>

              <label>
                Time Slot
                <select name="time" value={formData.time} onChange={handleChange} required>
                  <option value="">Select time</option>
                  <option>06:30 AM</option>
                  <option>09:00 AM</option>
                  <option>12:30 PM</option>
                  <option>03:00 PM</option>
                  <option>06:30 PM</option>
                </select>
              </label>
            </div>

            <label>
              Seat Number
              <input
                type="number"
                min="1"
                max="60"
                name="seatNumber"
                value={formData.seatNumber}
                onChange={handleChange}
                placeholder="e.g. 14"
                required
              />
            </label>

            <button type="submit">Confirm Booking</button>
            <p className="message" role="status" aria-live="polite">
              {message}
            </p>
          </form>
        </section>

        <section className="card">
          <div className="bookings-header">
            <h2>Your Bookings</h2>
            <button className="secondary" onClick={clearBookings}>
              Clear All
            </button>
          </div>

          <ul className="bookings-list">
            {bookings.length === 0 ? (
              <li className="empty">No bookings yet. Add your first trip above.</li>
            ) : (
              bookings.map((booking) => (
                <li key={booking.id} className="booking-item">
                  <p>
                    <strong>{booking.name}</strong> ({booking.studentId})
                  </p>
                  <p>{booking.university}</p>
                  <p>
                    {booking.departure} → {booking.destination}
                  </p>
                  <p>
                    {booking.date} at {booking.time}
                  </p>
                  <p>
                    <strong>Seat:</strong> {booking.seatNumber}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
