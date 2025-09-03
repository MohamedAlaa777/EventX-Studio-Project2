import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [seatNumber, setSeatNumber] = useState("");
  const [qrCode, setQrCode] = useState("");
  const token = localStorage.getItem("token");

  const fetchEvent = async () => {
    const { data } = await axios.get(`http://localhost:5000/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEvent(data);
  };

  useEffect(() => { fetchEvent(); }, []);

  const handleBook = async () => {
    const { data } = await axios.post("http://localhost:5000/api/events/book",
      { eventId: id, seatNumber },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setQrCode(data.qrCode);
    alert(`Ticket booked! Seat: ${data.seatNumber}`);
  };

  if (!event) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      <p>{event.description}</p>
      <p>Date: {new Date(event.date).toLocaleDateString()}</p>
      <p>Venue: {event.venue}</p>
      <p>Price: ${event.price}</p>
      <p>Seats available: {event.seats - event.bookedSeats}</p>

      <div className="mt-4 flex gap-2">
        <input
          type="number"
          placeholder="Select Seat Number"
          value={seatNumber}
          onChange={e => setSeatNumber(e.target.value)}
          className="border p-2 rounded"
        />
        <button className="bg-green-500 text-white p-2 rounded" onClick={handleBook}>
          Book Ticket
        </button>
      </div>

      {qrCode && <div className="mt-4">
        <p>QR Code for entry:</p>
        <img src={qrCode} alt="QR Code" />
      </div>}
    </div>
  );
}
