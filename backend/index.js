const bcrypt = require('bcrypt');
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
    const [rows] = await pool.query(
      'SELECT id, username, created_at FROM user ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (HASH PASSWORD)
app.post('/api/users', async (req, res) => {
  try {
    const { username, pass } = req.body;
    if (!username || !pass) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const hashedPass = await bcrypt.hash(pass, 10);
    const [result] = await pool.query(
      'INSERT INTO user (username, pass) VALUES (?, ?)',
      [username, hashedPass]
    );

    res.json({
      id: result.insertId,
      username,
      message: 'User created successfully'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, pass FROM user WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.pass);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({
      id: user.id,
      username: user.username,
      message: 'Login successful'
    });
  } catch (error) {
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
      ORDER BY id ASC
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

function parseAddress(address) {
  if (!address) return null;
  // Split by commas
  const parts = address.split(',').map(p => p.trim());
  if (parts.length < 3) return null;

  const street = parts[0];                // 2009 Alston Ave
  const city = parts[1];                  // Fort Worth
  const stateZip = parts[2].split(' ');   // TX 76110
  const state = stateZip[0];
  const zip = stateZip[1] || '';

  return { street, city, state, zip };
}

function buildSearchPeopleFreeUrl(address) {
  const parsed = parseAddress(address);
  if (!parsed) return null;

  const { street, city, state } = parsed;

  // Extract street number & name
  const streetParts = street.split(' ');
  const streetNumber = streetParts.shift();        // 2009
  const streetName = streetParts.join(' ');        // Alston Ave

  const citySlug = city.toLowerCase().replace(/\s+/g, '-');
  const streetSlug = streetName.toLowerCase().replace(/\s+/g, '-');
  const stateSlug = state.toLowerCase();

  return `https://www.searchpeoplefree.com/address/${stateSlug}/${citySlug}/${streetSlug}/${streetNumber}`;
}

function buildTruePeopleSearchUrl(address) {
  const parsed = parseAddress(address);
  if (!parsed) return null;

  const { street, city, state, zip } = parsed;
  const streetEncoded = encodeURIComponent(street);
  const cityStateZipEncoded = encodeURIComponent(`${city}, ${state} ${zip}`);

  return `https://www.truepeoplesearch.com/resultaddress?streetaddress=${streetEncoded}&citystatezip=${cityStateZipEncoded}`;
}

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
      const truePeopleUrl = buildTruePeopleSearchUrl(row.address);
      const searchPeopleFreeUrl = buildSearchPeopleFreeUrl(row.address);

      return [
        row.name || null,
        row.address || null,
        fastUrl,
        truePeopleUrl,
        searchPeopleFreeUrl,
        batch
      ];
    });

    const [result] = await pool.query(
      `
      INSERT INTO data (raw_name, raw_address, fastpeoplesearch_url, truepeoplesearch_url, searchpeoplefree_url, batch)
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

// Get data with filters - FIXED USER FILTERING
app.get('/api/data', async (req, res) => {
  try {
    const { status, batch, scraped_by, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT d.*, u.username as scraped_by_name FROM data d LEFT JOIN user u ON d.scraped_by = u.id WHERE 1=1';
    const params = [];

    // Status filter
    if (status === 'pending') {
      query += ' AND d.status IS NULL';
    } else if (status && status !== 'all') {
      query += ' AND d.status = ?';
      params.push(status);
    }

    // Batch filter
    if (batch && batch !== 'all') {
      query += ' AND d.batch = ?';
      params.push(batch);
    }

    // USER FILTER - FIXED: Parse as integer and filter properly
    if (scraped_by && scraped_by !== 'all') {
      const userId = parseInt(scraped_by, 10);
      if (!isNaN(userId)) {
        query += ' AND d.scraped_by = ?';
        params.push(userId);
      }
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    
    // Total count for pagination - WITH SAME FILTERS
    let countQuery = 'SELECT COUNT(*) as total FROM data d WHERE 1=1';
    const countParams = [];
    
    if (status === 'pending') { 
      countQuery += ' AND d.status IS NULL'; 
    } else if (status && status !== 'all') { 
      countQuery += ' AND d.status = ?'; 
      countParams.push(status); 
    }
    
    if (batch && batch !== 'all') { 
      countQuery += ' AND d.batch = ?'; 
      countParams.push(batch); 
    }

    // USER FILTER IN COUNT - FIXED
    if (scraped_by && scraped_by !== 'all') { 
      const userId = parseInt(scraped_by, 10);
      if (!isNaN(userId)) {
        countQuery += ' AND d.scraped_by = ?'; 
        countParams.push(userId); 
      }
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({ 
      data: rows, 
      total, 
      limit: parseInt(limit), 
      offset: parseInt(offset) 
    });
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

// =============================================
// for bulkscraper.cloud (project1)
// Log usage for a user
app.post('/api/usage/log', async (req, res) => {
  try {
    const { user_id, base_url, pages_scraped, input_tokens, output_tokens } = req.body;

    if (!user_id || !base_url) {
      return res.status(400).json({ error: 'User ID and Base URL are required' });
    }

    await pool.query(
      'INSERT INTO bulk_usage (user_id, base_url, pages_scraped, input_tokens, output_tokens) VALUES (?, ?, ?, ?, ?)',
      [user_id, base_url, pages_scraped || 0, input_tokens || 0, output_tokens || 0]
    );

    res.json({ message: 'Usage logged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get usage stats (Optional: for your admin dashboard later)
app.get('/api/usage/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.username, b.user_id, b.base_url, b.pages_scraped, b.input_tokens, b.output_tokens, b.created_at 
      FROM bulk_usage b 
      JOIN user u ON b.user_id = u.id 
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