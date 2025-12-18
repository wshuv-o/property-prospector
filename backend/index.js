// F:\Imtiaj Sajin\property-prospector\backend\index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'Database connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============ USER ENDPOINTS ============

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, created_at FROM user ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const { username, pass } = req.body;
    if (!username || !pass) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const [result] = await pool.query(
      'INSERT INTO user (username, pass) VALUES (?, ?)',
      [username, pass]
    );
    res.json({ id: result.insertId, username, message: 'User created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM user WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DATA ENDPOINTS ============

// Get top N data rows (minimal fields for scraping)
app.get('/api/data/top/:limit', async (req, res) => {
  try {
    let { limit } = req.params;

    limit = parseInt(limit, 10);

    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: 'Invalid limit value' });
    }

    // Safety cap (optional but recommended)
    if (limit > 100) limit = 100;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        raw_name,
        fastpeoplesearch_url,
        truepeoplesearch_url,
        searchpeoplefree_url
      FROM data
      WHERE status IS NULL
      ORDER BY created_at ASC
      LIMIT ?
      `,
      [limit]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update scraped data (emails, numbers, user who worked)
app.patch('/api/data/:id/update', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      scraped_name,
      scraped_emails,
      scraped_numbers,
      best_email,
      best_number,
      status,
      scrapped_from,
      scraped_by,
      profile_url
    } = req.body;

    if (!scraped_by) {
      return res.status(400).json({ error: 'scraped_by (user id) is required' });
    }

    const fields = [];
    const values = [];

    if (scraped_name !== undefined) {
      fields.push('scraped_name = ?');
      values.push(scraped_name);
    }

    if (scraped_emails !== undefined) {
      fields.push('scraped_emails = ?');
      values.push(scraped_emails);
    }

    if (scraped_numbers !== undefined) {
      fields.push('scraped_numbers = ?');
      values.push(scraped_numbers);
    }

    if (best_email !== undefined) {
      fields.push('best_email = ?');
      values.push(best_email);
    }

    if (best_number !== undefined) {
      fields.push('best_number = ?');
      values.push(best_number);
    }

    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }

    if (scrapped_from !== undefined) {
      fields.push('scrapped_from = ?');
      values.push(scrapped_from);
    }

    if (profile_url !== undefined) {
      fields.push('profile_url = ?');
      values.push(profile_url);
    }

    // Always update who worked & time
    fields.push('scraped_by = ?');
    values.push(scraped_by);

    fields.push('scraped_at = NOW()');

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE data SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data row not found' });
    }

    res.json({ message: 'Scraped data updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



function buildFastPeopleSearchUrl(address) {
  if (!address) return null;

  // Replace the first comma+space with underscore
  let urlPart = address.replace(', ', '_');

  // Replace the second comma+space (if any) with hyphen
  const commaIndex = urlPart.indexOf(', ');
  if (commaIndex !== -1) {
    urlPart = urlPart.replace(', ', '-');
  }

  // Replace remaining spaces with hyphens
  urlPart = urlPart.replace(/\s+/g, '-');

  return 'https://www.fastpeoplesearch.com/address/' + urlPart.toLowerCase();
}


// Upload data (batch insert)
app.post('/api/data/upload', async (req, res) => {
  try {
    const { rows, batchCode } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const batch = batchCode || `batch_${Date.now()}`;

    // Insert batch record
    await pool.query(
      `
      INSERT INTO batch (batch_code, total_rows)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE total_rows = total_rows + ?
      `,
      [batch, rows.length, rows.length]
    );

    // Prepare values for bulk insert
    const values = rows.map(row => {
      const fastUrl = buildFastPeopleSearchUrl(row.address);

      return [
        row.name || null,
        row.address || null,
        fastUrl,
        batch
      ];
    });

    const [result] = await pool.query(
      `
      INSERT INTO data (raw_name, raw_address, fastpeoplesearch_url, batch)
      VALUES ?
      `,
      [values]
    );

    res.json({
      message: 'Data uploaded successfully',
      insertedCount: result.affectedRows,
      batchCode: batch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get data with filters
app.get('/api/data', async (req, res) => {
  try {
    const { status, batch, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT d.*, u.username as scraped_by_name FROM data d LEFT JOIN user u ON d.scraped_by = u.id WHERE 1=1';
    const params = [];

    if (status === 'pending') {
      query += ' AND d.status IS NULL';
    } else if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    if (batch) {
      query += ' AND d.batch = ?';
      params.push(batch);
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM data WHERE 1=1';
    const countParams = [];
    
    if (status === 'pending') {
      countQuery += ' AND status IS NULL';
    } else if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (batch) {
      countQuery += ' AND batch = ?';
      countParams.push(batch);
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({ data: rows, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    // 1. Overall stats (Lifetime)
    const [[overall]] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IS NULL THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
      FROM data
    `);

    // 2. Today's Stats (Current Data)
    const [[today]] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        IFNULL(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END), 0) as completed,
        IFNULL(SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END), 0) as errors
      FROM data
      WHERE DATE(scraped_at) = CURDATE()
    `);

    // 3. Detailed Performance Log (Grouped by Date & User)
    const [performance] = await pool.query(`
      SELECT 
        u.username,
        DATE(d.scraped_at) as date,
        COUNT(CASE WHEN d.status = 'done' THEN 1 END) as completed,
        COUNT(CASE WHEN d.status = 'error' THEN 1 END) as errors
      FROM data d
      JOIN user u ON d.scraped_by = u.id
      WHERE d.scraped_at IS NOT NULL
      GROUP BY u.username, DATE(d.scraped_at)
      ORDER BY date DESC, completed DESC
    `);

    // 4. List of all users (For the filter dropdown)
    const [users] = await pool.query('SELECT username FROM user ORDER BY username ASC');

    // 5. Chart Data (Last 30 Days)
    const [byDate] = await pool.query(`
      SELECT 
        DATE(scraped_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
      FROM data
      WHERE scraped_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(scraped_at)
      ORDER BY date DESC
    `);

    // 6. Recent Batches
    const [batches] = await pool.query(`
      SELECT 
        b.batch_code,
        b.total_rows,
        b.created_at,
        MAX(d.scraped_at) as last_scraped_at,
        COUNT(CASE WHEN d.status = 'done' THEN 1 END) as completed,
        COUNT(CASE WHEN d.status = 'error' THEN 1 END) as errors
      FROM batch b
      LEFT JOIN data d ON b.batch_code = d.batch
      GROUP BY b.id
      ORDER BY last_scraped_at DESC
      LIMIT 10
    `);

    res.json({ overall, today, performance, users, byDate, batches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get batches
app.get('/api/batches', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.*,
        COUNT(CASE WHEN d.status = 'done' THEN 1 END) as completed,
        COUNT(CASE WHEN d.status IS NULL THEN 1 END) as pending
      FROM batch b
      LEFT JOIN data d ON b.batch_code = d.batch
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
