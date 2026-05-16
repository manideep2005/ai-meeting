const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'meetings.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS meetings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            transcript TEXT,
            summary TEXT,
            action_items TEXT,
            decisions TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

const saveMeeting = (meeting) => {
    return new Promise((resolve, reject) => {
        const { title, transcript, summary, action_items, decisions } = meeting;
        db.run(
            `INSERT INTO meetings (title, transcript, summary, action_items, decisions) VALUES (?, ?, ?, ?, ?)`,
            [title || 'Untitled Meeting', transcript, summary, JSON.stringify(action_items), JSON.stringify(decisions)],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

const getMeetings = (query = '') => {
    return new Promise((resolve, reject) => {
        const sql = query 
            ? `SELECT * FROM meetings WHERE title LIKE ? OR transcript LIKE ? ORDER BY created_at DESC`
            : `SELECT * FROM meetings ORDER BY created_at DESC`;
        const params = query ? [`%${query}%`, `%${query}%`] : [];
        
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else {
                resolve(rows.map(row => ({
                    ...row,
                    action_items: JSON.parse(row.action_items),
                    decisions: JSON.parse(row.decisions)
                })));
            }
        });
    });
};

const getMeetingById = (id) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM meetings WHERE id = ?`, [id], (err, row) => {
            if (err) reject(err);
            else if (!row) resolve(null);
            else {
                resolve({
                    ...row,
                    action_items: JSON.parse(row.action_items),
                    decisions: JSON.parse(row.decisions)
                });
            }
        });
    });
};

const deleteMeeting = (id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM meetings WHERE id = ?`, [id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

module.exports = { saveMeeting, getMeetings, getMeetingById, deleteMeeting };
