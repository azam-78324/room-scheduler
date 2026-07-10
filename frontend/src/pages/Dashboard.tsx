import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import '../styles/dashboard.css';

interface Booking {
  id: string;
  title: string;
  room_id: string;
  start_time: string;
  end_time: string;
}

const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/bookings`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUpcomingBookings(response.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name}! 👋</h1>
      
      <div className="dashboard-grid">
        <div className="card">
          <h2>Quick Actions</h2>
          <button onClick={() => navigate('/rooms')} className="btn btn-primary">Browse Rooms</button>
          <button onClick={() => navigate('/my-bookings')} className="btn btn-secondary">My Bookings</button>
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="btn btn-admin">Admin Dashboard</button>
          )}
        </div>

        <div className="card">
          <h2>Upcoming Bookings</h2>
          {loading ? (
            <p>Loading...</p>
          ) : upcomingBookings.length > 0 ? (
            <ul className="booking-list">
              {upcomingBookings.map((booking) => (
                <li key={booking.id}>
                  <strong>{booking.title}</strong>
                  <p>{new Date(booking.start_time).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming bookings</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
