import { useState } from "react";
import Events from "./Events";
import MyTickets from "./MyTickets";
import EventDetails from "./EventDetails";
import UpcomingNotifications from "../components/UpcomingNotifications"; // import it

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("events"); // events, myTickets, eventDetails
  const [selectedEventId, setSelectedEventId] = useState(null);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>

      {/* Upcoming Notifications */}
      <UpcomingNotifications />

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`p-2 rounded ${activeTab === "events" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>
        <button
          className={`p-2 rounded ${activeTab === "myTickets" ? "bg-green-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("myTickets")}
        >
          My Tickets
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === "events" && (
        <Events onSelectEvent={id => {
          setSelectedEventId(id);
          setActiveTab("eventDetails");
        }} />
      )}

      {activeTab === "myTickets" && <MyTickets />}

      {activeTab === "eventDetails" && selectedEventId && (
        <EventDetails id={selectedEventId} />
      )}
    </div>
  );
}
