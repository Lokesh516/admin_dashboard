import db from '../../../db/database';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const listings = db.prepare('SELECT * FROM listings').all();
    return res.status(200).json(listings);
  }

  if (req.method === 'PATCH') {
    const { id, action, performed_by } = req.body;

    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const newStatus =
      action === 'approve'
        ? 'approved'
        : action === 'reject'
        ? 'rejected'
        : 'pending';

    db.prepare('UPDATE listings SET status = ? WHERE id = ?').run(newStatus, id);

    const details = `Status changed to "${newStatus}"`;

    db.prepare(`
      INSERT INTO audit_logs (listing_id, listing_title, action, performed_by, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, listing.title, action, performed_by || 'unknown', details);

    const updated = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    return res.status(200).json(updated);
  }

  if (req.method === 'PUT') {
    const { id, title, price, performed_by } = req.body;

    const old = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    if (!old) return res.status(404).json({ error: 'Listing not found' });

    if (old.title === title && old.price === price) {
      return res.status(200).json(old);
    }

    db.prepare('UPDATE listings SET title = ?, price = ? WHERE id = ?').run(title, price, id);

    const details = `Title: "${old.title}" → "${title}", Price: ₹${old.price} → ₹${price}"`;

    db.prepare(`
      INSERT INTO audit_logs (listing_id, listing_title, action, performed_by, details)
      VALUES (?, ?, 'edit', ?, ?)
    `).run(id, title, performed_by || 'unknown', details);

    const updated = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    return res.status(200).json(updated);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
