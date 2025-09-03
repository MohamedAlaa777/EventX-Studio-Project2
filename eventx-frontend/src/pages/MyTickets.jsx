import { useEffect, useState } from "react";
import axios from "axios";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    const { data } = await axios.get("http://localhost:5000/api/events/my-tickets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTickets(data);
  };

  useEffect(() => { fetchTickets(); }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">My Tickets</h1>
      {tickets.map((t, i) => (
  <div key={i} className="border p-4 mb-4 rounded shadow">
    <h2 className="text-xl font-bold">{t.event.title}</h2>
    <p>Date: {new Date(t.event.date).toLocaleDateString()}</p>
    <p>Venue: {t.event.venue}</p>
    <p>Seat Number: {t.seat}</p>
    <img src={t.qrCodeData} alt="QR Code" className="mt-2" />
  </div>
))}

    </div>
  );
}
