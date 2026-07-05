const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// সব ফাইল সরাসরি মেইন ডিরেক্টরি থেকে লোড হবে
app.use(express.static(__dirname));

// আপনার এক্সেল ফাইল থেকে নেওয়া আসল বিজনেস ডাটা
const erpData = {
    totalSales: 28649996.98,
    totalPaid: 22221029.92,
    customerDue: 6428967.06,
    totalPurchases: 30026974.70,
    supplierDue: 5027923.60
};

// ডাটা এপিআই এন্ডপয়েন্ট
app.get('/api/dashboard-data', (req, res) => {
    res.json(erpData);
});

// জেমিনি এআই অ্যানালাইসিস এন্ডপয়েন্ট
app.post('/api/gemini-insight', (req, res) => {
    const insights = `🤖 SALSABILAH AMIN LTD. - Gemini AI Financial Report:\n\n` +
                     `১. ইনভেন্টরি লক অ্যালার্ট: আপনার মোট বিক্রয় (৳২.৮৬ কোটি) এবং মোট ক্রয় (৳৩.০০ কোটি) প্রায় কাছাকাছি। এর মানে ব্যবসার লিকুইড মানি স্টক বা পারচেসে আটকে আছে।\n` +
                     `২. কাস্টমার বকেয়া: বাজারে আপনার ৳৬৪.২৮ লাখ টাকা বকেয়া রয়েছে। ক্যাশ ফ্লো বাড়াতে এই টাকা দ্রুত তোলা দরকার।\n` +
                     `৩. সাপ্লায়ার লায়াবিলিটি: সাপ্লায়ারদের কাছে বকেয়া ৳৫০.২৭ লাখ টাকা সেলস রেভিনিউ থেকে ধাপে ধাপে অ্যাডজাস্ট করতে হবে।`;
    res.json({ insight: insights });
});

// সরাসরি মেইন ডিরেক্টরির index.html ফাইলটি রেন্ডার হবে
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
