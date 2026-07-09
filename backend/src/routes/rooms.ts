import { Router, Request, Response } from 'express';
import { pool, redisClient } from '../index';

const router = Router();

interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  is_active: boolean;
}

// Get all rooms with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { capacity, location, search } = req.query;

    let query = 'SELECT * FROM rooms WHERE is_active = true';
    const params: any[] = [];

    if (capacity) {
      query += ` AND capacity >= $${params.length + 1}`;
      params.push(parseInt(capacity as string));
    }

    if (location) {
      query += ` AND location ILIKE $${params.length + 1}`;
      params.push(`%${location}%`);
    }

    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR location ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get room by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get room availability for a date
router.get('/:id/availability', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    // Check cache first
    const cacheKey = `room:${id}:availability:${date}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Query bookings for the date
    const result = await pool.query(
      `SELECT start_time, end_time FROM bookings 
       WHERE room_id = $1 
       AND DATE(start_time) = $2 
       AND status != 'cancelled'
       ORDER BY start_time ASC`,
      [id, date]
    );

    // Calculate available slots (9 AM to 6 PM, 30-min slots)
    const bookings = result.rows;
    const availableSlots = generateAvailableSlots(bookings);

    // Cache for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(availableSlots));

    res.json(availableSlots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function generateAvailableSlots(bookings: any[]) {
  const slots = [];
  const startHour = 9;
  const endHour = 18;
  const duration = 30; // minutes

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += duration) {
      const slotStart = new Date();
      slotStart.setHours(hour, minute, 0);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      const isBooked = bookings.some(
        (booking) =>
          new Date(booking.start_time) < slotEnd &&
          new Date(booking.end_time) > slotStart
      );

      if (!isBooked) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
      }
    }
  }

  return slots;
}

export default router;
