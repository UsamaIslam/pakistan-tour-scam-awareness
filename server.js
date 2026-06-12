const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5180;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        
        // Create table for user reports/comments
        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            operator TEXT NOT NULL,
            trip_date TEXT NOT NULL,
            rating INTEGER NOT NULL,
            issue TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (tableErr) => {
            if (tableErr) {
                console.error('Error creating reports table:', tableErr.message);
            } else {
                console.log('Reports table verified.');
            }
        });

        // Create table for tour companies
        db.run(`CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )`, (compErr) => {
            if (compErr) {
                console.error('Error creating companies table:', compErr.message);
            } else {
                console.log('Companies table verified.');
                // Seed companies if empty
                db.get('SELECT COUNT(*) AS count FROM companies', (err, row) => {
                    if (err) {
                        console.error('Error checking companies count:', err.message);
                    } else if (row.count === 0) {
                        const defaultCompanies = [
                            'Tour Edge',
                            'Tours Avenue',
                            'Both Companies (Tour Edge & Tours Avenue)',
                            'Hunza Adventure Tours',
                            'The Mad Hatters',
                            'Apricot Tours',
                            'Eventica Travels',
                            'IBEX Global Tours',
                            'Crossroads Adventure',
                            'Pakistan Guided Tours',
                            'Adventure Planners',
                            'Karakoram Expeditions',
                            'Rover Pakistan',
                            'Adventure Travel Pakistan',
                            'GoZayaan',
                            'Sastaticket'
                        ];
                        const stmt = db.prepare('INSERT OR IGNORE INTO companies (name) VALUES (?)');
                        defaultCompanies.forEach((company) => {
                            stmt.run(company);
                        });
                        stmt.finalize();
                        console.log('Default companies seeded.');
                    }
                });
            }
        });
    }
});

// API: Get all companies
app.get('/api/companies', (req, res) => {
    db.all('SELECT * FROM companies ORDER BY name ASC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API: Get all reports
app.get('/api/comments', (req, res) => {
    db.all('SELECT * FROM reports ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API: Submit a new report
app.post('/api/comments', (req, res) => {
    const { name, operator, trip_date, rating, issue, website_url } = req.body;

    // Honeypot spam prevention: if website_url is filled, treat it as spam
    if (website_url) {
        console.warn('Spam detected via honeypot field. Silent rejection.');
        return res.status(201).json({
            id: 999999,
            name,
            operator,
            trip_date,
            rating: parseInt(rating, 10),
            issue,
            created_at: new Date().toISOString()
        });
    }

    // Simple validation
    if (!name || !operator || !trip_date || !rating || !issue) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    const query = `INSERT INTO reports (name, operator, trip_date, rating, issue) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name.trim(), operator.trim(), trip_date.trim(), parsedRating, issue.trim()], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Dynamically add the new operator to companies table if it doesn't exist
        const formattedOperator = operator.trim();
        if (formattedOperator && formattedOperator !== 'Other Operator') {
            db.run('INSERT OR IGNORE INTO companies (name) VALUES (?)', [formattedOperator], (compErr) => {
                if (compErr) {
                    console.error('Failed to dynamic seed operator:', compErr.message);
                }
            });
        }

        res.status(201).json({
            id: this.lastID,
            name,
            operator,
            trip_date,
            rating: parsedRating,
            issue,
            created_at: new Date().toISOString()
        });
    });
});

// Fallback for HTML5 Routing/Direct access
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
