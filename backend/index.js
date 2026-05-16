const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ollamaService = require('./services/ollamaService');
const db = require('./db');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// Helper to extract title from text
const extractTitle = (text) => {
    const lines = text.split('\n');
    for (let line of lines) {
        if (line.toLowerCase().includes('title:')) {
            return line.split(':')[1].trim();
        }
    }
    return 'Untitled Meeting';
};

// Endpoints
app.post('/process', async (req, res) => {
    try {
        const { text, title: manualTitle } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });
        
        const analysis = await ollamaService.processMeeting(text);
        const title = manualTitle || extractTitle(text);
        
        const meetingId = await db.saveMeeting({
            title,
            transcript: text,
            ...analysis
        });
        
        res.json({ id: meetingId, ...analysis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File is required" });
        
        const text = req.file.buffer.toString('utf-8');
        const analysis = await ollamaService.processMeeting(text);
        const title = req.body.title || req.file.originalname.split('.')[0];
        
        const meetingId = await db.saveMeeting({
            title,
            transcript: text,
            ...analysis
        });
        
        res.json({ id: meetingId, ...analysis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/meetings', async (req, res) => {
    try {
        const { q } = req.query;
        const meetings = await db.getMeetings(q);
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/meetings/:id', async (req, res) => {
    try {
        const meeting = await db.getMeetingById(req.params.id);
        if (!meeting) return res.status(404).json({ error: "Meeting not found" });
        res.json(meeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/generate-email', async (req, res) => {
    try {
        const { summary, action_items } = req.body;
        const email = await ollamaService.generateEmail(summary, action_items);
        res.json({ email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/chat', async (req, res) => {
    try {
        const { meetingId, question } = req.body;
        const meeting = await db.getMeetingById(meetingId);
        if (!meeting) return res.status(404).json({ error: "Meeting not found" });
        
        const answer = await ollamaService.chatWithMeeting(meeting.transcript, question);
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/meetings/:id', async (req, res) => {
    try {
        const result = await db.deleteMeeting(req.params.id);
        if (result === 0) return res.status(404).json({ error: "Meeting not found" });
        res.json({ message: "Meeting deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
