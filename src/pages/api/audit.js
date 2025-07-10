import db from '../../../db/database';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const logs = db.prepare(`
        SELECT 
          a.id,
          a.listing_id,
          a.listing_title,
          a.action,
          a.performed_by,
          a.details,
          a.timestamp
        FROM audit_logs a
        ORDER BY a.timestamp DESC
      `).all();

      res.status(200).json(logs);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
