const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.use ? express.json() : (req, res, next) => next()); // Support JSON inputs
app.use(express.static(path.join(__dirname, 'public')));

// এক্সেল ফাইল থেকে সংগৃহীত আপনার আসল ডাটা স্টোর করা হলো
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

// জেমিনি এআই অ্যাসিস্ট্যান্ট এন্ডপয়েন্ট (আপাতত মক রেসপন্স, পরে কী (Key) বসালে রিয়াল কাজ করবে)
app.post('/api/gemini-insight', (req, res) => {
    // এখানে জেমিনির লজিক বসবে। আপাতত ইনস্ট্যান্ট রেসপন্স সেট করা হলো
    const insights = `SALSABILAH AMIN LTD. এর জন্য জেমিনি এআই অ্যানালাইসিস:\n\n` +
                     `১. আপনার সেলস এবং পারচেসের অনুপাত প্রায় সমান (১:১.০৪), যা নির্দেশ করে ইনভেন্টরিতে ক্যাশ লক হয়ে আছে।\n` +
                     `২. কাস্টমার বকেয়া ৳৬৪.২8 লাখ দ্রুত রিকভারি করা প্রয়োজন।\n` +
                     `৩. সাপ্লায়ার বকেয়া ৳৫০.২৭ লাখ পরিশোধের জন্য ক্যাশ ফ্লো অপ্টিমাইজ করুন।`;
    res.json({ insight: insights });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
