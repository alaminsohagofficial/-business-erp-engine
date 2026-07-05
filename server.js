const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// এক্সেল শিট থেকে সংগৃহীত রিয়াল ডাটা
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

// জেমিনি এআই অ্যাসিস্ট্যান্ট এন্ডপয়েন্ট (ইনস্ট্যান্ট অ্যানালাইসিস লজিক)
app.post('/api/gemini-insight', (req, res) => {
    const insights = `🤖 SALSABILAH AMIN LTD. - Gemini AI Financial Report:\n\n` +
                     `১. ক্যাশ লক অ্যালার্ট: আপনার মোট বিক্রয় (৳২.৮৬ কোটি) এবং মোট ক্রয় (৳৩.০০ কোটি) প্রায় সমান। এর অর্থ হলো বিক্রয়ের বড় অংশ ইনভেন্টরি বা পারচেসে পুনরায় আটকে যাচ্ছে।\n` +
                     `২. বকেয়া ঝুঁকি: কাস্টমার বকেয়া ৳৬৪.২৮ লাখ টাকা দ্রুত তোলার ব্যবস্থা নিন। এটি আপনার লিকুইড ক্যাশ ফ্লো বাড়াতে সাহায্য করবে।\n` +
                     `৩. সাপ্লায়ার লায়াবিলিটি: সাপ্লায়ারদের কাছে ৳৫০.২৭ লাখ টাকা বকেয়া রয়েছে, যা সেলস রেভিনিউ থেকে ধাপে ধাপে অ্যাডজাস্ট করা প্রয়োজন।`;
    res.json({ insight: insights });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
