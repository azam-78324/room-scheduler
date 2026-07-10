import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/rooms.css';

interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
}

const RoomBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    capacity: '',
    location: '',
    search: '',
  });

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.capacity) params.append('capacity', filters.capacity);
      if (filters.location) params.append('location', filters.location);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/rooms?${params.toString()}`
      );
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rooms-container">
      <h1>Available Rooms 🏢</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or location"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          type="number"
          placeholder="Minimum capacity"
          value={filters.capacity}
          onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
      </div>

      {loading ? (
        <p>Loading rooms...</p>
      ) : rooms.length > 0 ? (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card">
              <h3>{room.name}</h3>
              <p><strong>Location:</strong> {room.location}</p>
              <p><strong>Capacity:</strong> {room.capacity} people</p>
              {room.amenities && room.amenities.length > 0 && (
                <p><strong>Amenities:</strong> {room.amenities.join(', ')}</p>
              )}
              <button onClick={() => navigate(`/book/${room.id}`)} className="btn btn-book">Book Room</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No rooms found matching your criteria</p>
      )}
    </div>
  );
};

export default RoomBrowser;
