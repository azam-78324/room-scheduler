import { Router, Request, Response } from 'express';
import { pool } from '../index';
import { authorize } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const requireAdmin = authorize(['admin']);

interface CreateRoomRequest {
  name: string;
  location: string;
  capacity: number;
  amenities?: string[];
}

// Create room (admin only)
router.post('/rooms', requireAdmin, async (req: Request<{}, {}, CreateRoomRequest>, res: Response) => {
  try {
    const { name, location, capacity, amenities } = req.body;

    if (!name || !location || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const roomId = uuidv4();
    await pool.query(
      `INSERT INTO rooms (id, name, location, capacity, amenities, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [roomId, name, location, capacity, JSON.stringify(amenities || []), true]
    );

    res.status(201).json({ id: roomId, message: 'Room created' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update room (admin only)
router.put('/rooms/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, capacity, amenities, is_active } = req.body;

    await pool.query(
      `UPDATE rooms SET name = $1, location = $2, capacity = $3, amenities = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [name, location, capacity, JSON.stringify(amenities || []), is_active, id]
    );

    res.json({ message: 'Room updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete room (admin only)
router.delete('/rooms/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE rooms SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    res.json({ message: 'Room deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics (admin only)
router.get('/analytics', requireAdmin, async (req: Request, res: Response) => {
  try {
    const totalRooms = await pool.query('SELECT COUNT(*) FROM rooms WHERE is_active = true');
    const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings WHERE status = $1', ['confirmed']);
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');

    const roomUtilization = await pool.query(`
      SELECT r.id, r.name, COUNT(b.id) as booking_count
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id AND b.status = 'confirmed'
      WHERE r.is_active = true
      GROUP BY r.id, r.name
      ORDER BY booking_count DESC
    `);

    res.json({
      summary: {
        total_rooms: parseInt(totalRooms.rows[0].count),
        total_bookings: parseInt(totalBookings.rows[0].count),
        total_users: parseInt(totalUsers.rows[0].count),
      },
      room_utilization: roomUtilization.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
