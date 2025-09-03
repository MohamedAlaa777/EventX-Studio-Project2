import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function UserDashboard() {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("events"); // "events" | "tickets"
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/events/upcoming",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        setErrorMessage("Failed to fetch events. Please try again.");
      }
    };
    fetchEvents();
  }, [token]);

  // Fetch user tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/events/my-tickets", 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTickets(data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setErrorMessage("No tickets found or route does not exist.");
      }
    };
    if (activeTab === "tickets") fetchTickets();
  }, [activeTab, token]);

  // Handle booking
  const handleBookTicket = async () => {
    if (!selectedSeat) return alert("Please enter a seat number.");
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/events/book",
        { eventId: selectedEvent._id, seatNumber: selectedSeat },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookingSuccess({
        event: selectedEvent,
        seat: data.seatNumber,
        qrCodeData: data.ticketId || data._id || "TICKET",
      });

      setSelectedEvent(null);
      setSelectedSeat("");
    } catch (error) {
      console.error("Booking failed:", error);
      alert(error.response?.data?.message || "Booking failed. Try another seat.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === "events" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("events")}
        >
          Browse Events
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "tickets" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("tickets")}
        >
          My Tickets
        </button>
      </div>

      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

      {/* Events List */}
      {activeTab === "events" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Venue: {event.venue}</p>
              <p>Seats Available: {event.seats - event.bookedSeats}</p>
              <p>Price: ${event.price}</p>
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                onClick={() => setSelectedEvent(event)}
              >
                Book Ticket
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tickets List */}
      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{ticket.event.title}</h2>
              <p>Date: {new Date(ticket.event.date).toLocaleDateString()}</p>
              <p>Seat: {ticket.seat}</p>
              <div className="mt-4 flex justify-center">
                <QRCodeCanvas value={ticket.qrCode} size={150} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal Pop-up */}
      {selectedEvent && (
        <div
          className="absolute z-50 bg-white border rounded shadow-lg p-4 w-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">{selectedEvent.title}</h2>
            <input
              type="text"
              placeholder="Enter Seat Number"
              value={selectedSeat}
              onChange={(e) => setSelectedSeat(e.target.value)}
              className="border p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={() => setSelectedEvent(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={handleBookTicket}
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Pop-up QR */}
      {bookingSuccess && (
        <div
          className="absolute z-50 bg-white border rounded shadow-lg p-4 w-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          onClick={() => setBookingSuccess(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">Booking Confirmed!</h2>
            <p>
              Event: {bookingSuccess.event.title} <br />
              Seat: {bookingSuccess.seat}
            </p>
            <div className="mt-4 flex justify-center">
              <QRCodeCanvas value={bookingSuccess.qrCode} size={200} />
            </div>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
              onClick={() => setBookingSuccess(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
