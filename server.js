const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// সরাসরি index.html ফাইলটি রেন্ডার করার জন্য
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
