import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("upcoming"); // filter: upcoming | active | closed
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const { data } = await axios.get("https://eventx-studio-project2.onrender.com/api/events", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEvents(data);
  };

  useEffect(() => { fetchEvents(); }, []);

  const today = new Date();
  today.setHours(0,0,0,0); // normalize to midnight for date comparison

  const filteredEvents = events
    .filter(ev => {
      const evDate = new Date(ev.date);
      evDate.setHours(0,0,0,0);

      if (filter === "upcoming") return evDate > today;
      if (filter === "active") return evDate.getTime() === today.getTime();
      if (filter === "closed") return evDate < today;
      return true;
    })
    .filter(ev => ev.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Browse Events</h1>

      <div className="flex gap-2 mb-4">
        <button
          className={`p-2 rounded ${filter === "upcoming" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`p-2 rounded ${filter === "active" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={`p-2 rounded ${filter === "closed" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setFilter("closed")}
        >
          Closed
        </button>
      </div>

      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-2 mb-4 rounded w-full"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map(ev => {
          const evDate = new Date(ev.date);
          evDate.setHours(0,0,0,0);
          const isPast = evDate < today;

          return (
            <div
              key={ev._id}
              className={`border p-4 rounded shadow ${isPast ? "opacity-50" : ""}`}
            >
              <h2 className="text-xl font-bold">{ev.title}</h2>
              <p>Date: {new Date(ev.date).toLocaleDateString()}</p>
              <p>Venue: {ev.venue}</p>
              <p>Seats available: {ev.seats - ev.bookedSeats}</p>

              {!isPast && (
                <button
                  className="bg-blue-500 text-white p-2 rounded mt-2"
                  onClick={() => navigate(`/event/${ev._id}`)}
                >
                  View Details
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
