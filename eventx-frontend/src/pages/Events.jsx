import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const { data } = await axios.get("http://localhost:5000/api/events/upcoming", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEvents(data);
  };

  useEffect(() => { fetchEvents(); }, []);

  const filtered = events.filter(ev => ev.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Upcoming Events</h1>
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-2 mb-4 rounded w-full"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ev => (
          <div key={ev._id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-bold">{ev.title}</h2>
            <p>Date: {new Date(ev.date).toLocaleDateString()}</p>
            <p>Venue: {ev.venue}</p>
            <p>Seats available: {ev.seats - ev.bookedSeats}</p>
            <button
              className="bg-blue-500 text-white p-2 rounded mt-2"
              onClick={() => navigate(`/event/${ev._id}`)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
