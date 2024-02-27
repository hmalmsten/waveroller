const express = require('express');
const app = express();
const fs = require('fs');

let clickCounts = {};

app.use(express.static('public'));  // Serve static files from 'public' directory
app.use(express.json());

app.get('/counts', (req, res) => {
    console.log('Request:', req.query);
    const country = req.query.country || 'Finland';
    // Only fetch the click count, don't increment it
    const count = clickCounts[country] || 0;
    console.log('count:', count);
    // Send the count back to the client
    res.json({ count });
});

app.post('/click', (req, res) => {
    console.log("Request:", req.body)
    const country = req.body.country || 'Finland';
    const count = req.body.count || 0;
    // Increment the click count
    clickCounts[country] = (clickCounts[country] || 0) + count;
    console.log ('clickCounts:', clickCounts[country]);
    // Save the updated counts to a file or a database
    fs.writeFileSync('clickCounts.json', JSON.stringify(clickCounts));

    // Send the updated count back to the client
    res.json({ count: clickCounts[country] });
});

app.get('/leaderboard', (req, res) => {
    const leaderboard = getLeaderboard(5);
    res.json({ leaderboard });
});

function getLeaderboard(limit) {
    const sortedCounts = Object.entries(clickCounts).sort((a, b) => b[1] - a[1]);
    return sortedCounts.slice(0, limit).map(([country, clickCount]) => ({ country, clickCount }));
}

app.listen(3000, () => {
    console.log('Server running on port 3000');
});