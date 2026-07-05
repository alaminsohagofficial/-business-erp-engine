const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// public ফোল্ডারকে স্ট্যাটিক ডিরেক্টরি হিসেবে সেট করা
app.use(express.static(path.join(__dirname, 'public')));

// যেকোনো রিকোয়েস্ট আসলেই সরাসরি index.html ফাইলটি লোড হবে
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
