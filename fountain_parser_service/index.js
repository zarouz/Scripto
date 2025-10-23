const express = require('express');
// This is the corrected import line, using destructuring to get the named export
const { Fountain } = require('fountain-js');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.post('/parse', (req, res) => {
    const { fountain_text } = req.body;

    if (!fountain_text) {
        return res.status(400).json({ error: 'Request body must contain "fountain_text" key.' });
    }

    try {
        const fountain = new Fountain();
        const output = fountain.parse(fountain_text);
        const html = output.html.script;
        res.status(200).json({ html });
    } catch (error) {
        console.error('--- FOUNTAIN PARSER ERROR ---', error);
        res.status(500).json({ error: 'Failed to parse Fountain text.', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`🖋️ Fountain Parser Service listening on http://localhost:${port}`);
});