import { useEffect, useState } from "react";
import axios from "axios";

export default function UpcomingNotifications() {
  const [events, setEvents] = useState([]);
  const [notified, setNotified] = useState([]); // track already notified events
  const token = localStorage.getItem("token");

  // Fetch events once
  const fetchEvents = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter events in next 3 days
  const upcoming = events.filter(ev => {
    const evDate = new Date(ev.date);
    evDate.setHours(0, 0, 0, 0);
    const diffDays = (evDate - today) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
  });

  // Fire notifications once
  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        upcoming.forEach(ev => {
          if (!notified.includes(ev._id)) {
            new Notification(`Upcoming Event: ${ev.title}`, {
              body: `Happening on ${new Date(ev.date).toLocaleDateString()}`,
            });
          }
        });
        setNotified(upcoming.map(ev => ev._id));
      }
    });
  }, [upcoming, notified]);

  if (upcoming.length === 0) return null;

  return (
    <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 mb-4">
      <h3 className="font-bold mb-2">Upcoming Events</h3>
      <ul>
        {upcoming.map(ev => (
          <li key={ev._id}>
            {ev.title} - {new Date(ev.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
