const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Path to the local chat dataset
const CHAT_DATA_PATH = path.join(__dirname, 'chat_data.json');
let chatData = [];

// Load the chat data into memory
function loadChatData() {
    try {
        if (fs.existsSync(CHAT_DATA_PATH)) {
            const fileContent = fs.readFileSync(CHAT_DATA_PATH, 'utf8');
            chatData = JSON.parse(fileContent);
            console.log(`Loaded ${chatData.length} chat records from local dataset.`);
        } else {
            console.warn('chat_data.json not found. Creating a placeholder.');
            chatData = [
                { question: "hello", answer: "Hello! I am Jnana, your offline AI assistant. I'm searching through my local knowledge base." },
                { question: "how are you", answer: "I'm functioning perfectly within my local environment!" }
            ];
            fs.writeFileSync(CHAT_DATA_PATH, JSON.stringify(chatData, null, 2));
        }
    } catch (error) {
        console.error('Error loading chat data:', error);
        chatData = [];
    }
}

loadChatData();

// Simple search function to find the best match
function findBestMatch(prompt) {
    if (!chatData || chatData.length === 0) return "I'm sorry, my knowledge base is currently empty.";

    const query = prompt.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    for (const record of chatData) {
        let score = 0;
        const question = (record.question || "").toLowerCase();

        // Simple keyword matching
        const words = query.split(/\s+/);
        words.forEach(word => {
            if (word.length > 2 && question.includes(word)) {
                score++;
            }
        });

        // Exact match bonus
        if (question === query) score += 10;
        // Prefix match bonus
        else if (question.startsWith(query)) score += 5;

        if (score > highestScore) {
            highestScore = score;
            bestMatch = record.answer;
        }
    }

    return bestMatch || "I couldn't find a specific answer for that in my local records. Can you try rephrasing?";
}

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Searching for: ${prompt}`);

    // Simulate some "thinking" time for a better UX
    setTimeout(() => {
        const response = findBestMatch(prompt);
        res.json({ response });
    }, 500);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Gemini API key removed. Running in local search mode.');
});
