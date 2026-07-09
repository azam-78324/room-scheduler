import { Router, Request, Response } from 'express';
import { pool, redisClient } from '../index';
import { authenticate } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

interface CreateBookingRequest {
  room_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

// Create booking
router.post('/', async (req: Request<{}, {}, CreateBookingRequest>, res: Response) => {
  try {
    const { room_id, start_time, end_time, title } = req.body;
    const userId = req.userId;

    // Validate input
    if (!room_id || !start_time || !end_time || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for conflicts
    const conflicts = await pool.query(
      `SELECT * FROM bookings 
       WHERE room_id = $1 
       AND start_time < $3 
       AND end_time > $2 
       AND status != 'cancelled'`,
      [room_id, start_time, end_time]
    );

    if (conflicts.rows.length > 0) {
      return res.status(409).json({ error: 'Room is already booked for this time' });
    }

    // Create booking
    const bookingId = uuidv4();
    await pool.query(
      `INSERT INTO bookings (id, user_id, room_id, start_time, end_time, title, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [bookingId, userId, room_id, start_time, end_time, title, 'confirmed']
    );

    // Invalidate cache
    const date = new Date(start_time).toISOString().split('T')[0];
    await redisClient.del(`room:${room_id}:availability:${date}`);

    res.status(201).json({
      id: bookingId,
      message: 'Booking created successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user bookings
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    let query = 'SELECT * FROM bookings WHERE user_id = $1';
    const params: any[] = [userId];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ' ORDER BY start_time DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update status
    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', id]);

    // Invalidate cache
    const date = new Date(booking.rows[0].start_time).toISOString().split('T')[0];
    await redisClient.del(`room:${booking.rows[0].room_id}:availability:${date}`);

    res.json({ message: 'Booking cancelled' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
