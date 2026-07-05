const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// স্ট্যাটিক ফাইল ফোল্ডার লিংক করা
app.use(express.static(path.join(__dirname, 'public')));

// ড্যাশবোর্ডের মূল রুট
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
