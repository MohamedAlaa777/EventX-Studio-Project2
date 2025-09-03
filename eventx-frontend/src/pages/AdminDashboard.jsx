import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [editId, setEditId] = useState(null);

  const [stats, setStats] = useState({
    revenue: 0,
    ticketsSold: 0,
    ageGroups: {},
    gender: {},
  });

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Fetch events
  const fetchEvents = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  // Fetch analytics stats
  const fetchStats = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/events/${editId}`,
          { title, date, venue, price, seats },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditId(null);
      } else {
        await axios.post(
          "http://localhost:5000/api/events",
          { title, date, venue, price, seats },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchEvents();
      setTitle(""); setDate(""); setVenue(""); setPrice(""); setSeats("");
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  const handleEdit = (ev) => {
    setEditId(ev._id);
    setTitle(ev.title);
    setDate(ev.date.split("T")[0]);
    setVenue(ev.venue);
    setPrice(ev.price);
    setSeats(ev.seats);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const handleAllocateSeat = async (eventId) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/events/allocate-seat",
        { eventId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Seat ${data.seatNumber} allocated successfully!`);
    } catch (err) {
      console.error("Error allocating seat:", err.response?.data || err.message);
      alert("Failed to allocate seat");
    }
  };

  // Prepare chart data
  const ageData = {
    labels: Object.keys(stats.ageGroups),
    datasets: [{ label: "Attendees by Age", data: Object.values(stats.ageGroups), backgroundColor: "rgba(75, 192, 192, 0.6)" }],
  };

  const genderData = {
    labels: Object.keys(stats.gender),
    datasets: [{ label: "Attendees by Gender", data: Object.values(stats.gender), backgroundColor: ["#36A2EB", "#FF6384"] }],
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Event Form */}
      <form className="mb-6 flex gap-2" onSubmit={handleCreateOrUpdate}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded" />
        <input placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="border p-2 rounded" />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded" />
        <input type="number" placeholder="Seats" value={seats} onChange={(e) => setSeats(e.target.value)} className="border p-2 rounded" />
        <button className={`p-2 rounded ${editId ? "bg-yellow-500" : "bg-green-500"} text-white`}>{editId ? "Update" : "Add Event"}</button>
      </form>

      {/* Events Table */}
      <table className="w-full border mb-8">
        <thead>
          <tr className="border-b">
            <th>Title</th><th>Date</th><th>Venue</th><th>Price</th><th>Seats</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev._id} className="border-b text-center">
              <td>{ev.title}</td>
              <td>{new Date(ev.date).toLocaleDateString()}</td>
              <td>{ev.venue}</td>
              <td>{ev.price}</td>
              <td>{ev.seats}</td>
              <td className="flex justify-center gap-2">
                <button className="bg-blue-500 text-white p-1 rounded" onClick={() => handleAllocateSeat(ev._id)}>Allocate Seat</button>
                <button className="bg-yellow-500 text-white p-1 rounded" onClick={() => handleEdit(ev)}>Edit</button>
                <button className="bg-red-500 text-white p-1 rounded" onClick={() => handleDelete(ev._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Analytics */}
      <div className="mb-4">
        <p>Total Revenue: ${stats.revenue}</p>
        <p>Tickets Sold: {stats.ticketsSold}</p>
      </div>
      <div className="flex gap-8">
        <div className="w-1/2"><Bar data={ageData} /></div>
        <div className="w-1/2"><Pie data={genderData} /></div>
      </div>
    </div>
  );
}
