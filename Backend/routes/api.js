const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Helper to read JSON files
const getData = (filename) => {
    const filePath = path.join(__dirname, '../data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// GET all engines
router.get('/engines', (req, res) => {
    try {
        const engines = getData('engines.json');
        res.json(engines);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load engines' });
    }
});

// GET all quizzes
router.get('/quizzes', (req, res) => {
    try {
        const quizzes = getData('quizzes.json');
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load quizzes' });
    }
});

// GET terminal sequences
router.get('/terminal', (req, res) => {
    try {
        const terminal = getData('terminal.json');
        res.json(terminal);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load terminal sequences' });
    }
});

// POST assistant query
router.post('/assistant', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    try {
        const knowledge = getData('knowledge.json');
        const lowerQuery = query.toLowerCase();
        
        let match = "default";
        const keys = Object.keys(knowledge).sort((a,b) => b.length - a.length);

        for (const key of keys) {
            if (lowerQuery.includes(key)) {
                match = key;
                break;
            }
        }

        const response = knowledge[match] || { 
            answer: "I'm not familiar with that term yet! Try asking about **Pistons**, **Torque**, or **Turbo**.",
            link: null 
        };

        // Simulate "Real AI" by adding some dynamic prefixing
        const prefixes = ["REDLINE REPORT: ", "Analyzing telemetry... ", "Database ping: ", "Carbon Insight: "];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        res.json({
            text: prefix + response.answer,
            link: response.link,
            match: match
        });

    } catch (err) {
        res.status(500).json({ error: 'Assistant logic failed' });
    }
});

module.exports = router;
