import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function EventDetails({ id: propId }) {
  const { id: routeId } = useParams();
  const id = propId || routeId;
  const [event, setEvent] = useState(null);
  const [seatNumber, setSeatNumber] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchEvent = async () => {
    const { data } = await axios.get(`https://eventx-studio-project2.onrender.com/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEvent(data);
  };

  useEffect(() => { fetchEvent(); }, []);

  const handleBook = async () => {
    setMessage(""); // reset message

    if (!seatNumber) {
      setMessage("Please select a seat number");
      return;
    }

    const seatNum = Number(seatNumber);

    if (seatNum < 1 || seatNum > event.seats) {
      setMessage(`Please select a seat number between 1 and ${event.seats}`);
      return;
    }

    const seatTaken = event.tickets.some(t => t.seatNumber === seatNum);
    if (seatTaken) {
      setMessage("This seat is already booked!");
      return;
    }

    const paymentSuccess = window.confirm(`Pay $${event.price} for seat ${seatNum}?`);
    if (!paymentSuccess) {
      setMessage("Payment failed. Try again.");
      return;
    }

    try {
      const { data } = await axios.post(
        "https://eventx-studio-project2.onrender.com/api/events/book",
        { eventId: id, seatNumber: seatNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrCode(data.qrCodeData); 
      setMessage(`Payment successful! Ticket booked for seat ${data.seatNumber}`);

      // Update local event state to prevent duplicate booking without refetch
      setEvent(prev => ({
        ...prev,
        tickets: [...prev.tickets, { seatNumber: seatNum }],
        bookedSeats: prev.bookedSeats + 1 // dynamically update bookedSeats
      }));
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      <p className="mb-2">{event.description}</p>
      <p>Date: {new Date(event.date).toLocaleDateString()}</p>
      <p>Venue: {event.venue}</p>
      <p>Price: ${event.price}</p>
      <p>Seats available: {event.seats - event.bookedSeats}</p>
      <p>Popularity: {event.tickets.length} ticket(s) booked</p> 

      <div className="mt-4 flex gap-2">
        <input
          type="number"
          placeholder="Select Seat Number"
          value={seatNumber}
          onChange={e => setSeatNumber(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          className="bg-green-500 text-white p-2 rounded"
          onClick={handleBook}
        >
          Book Ticket
        </button>
      </div>

      {message && <p className="mt-4 font-semibold">{message}</p>}

      {qrCode && (
        <div className="mt-4">
          <p>QR Code for entry:</p>
          <img src={qrCode} alt="QR Code" />
        </div>
      )}
    </div>
  );
}
