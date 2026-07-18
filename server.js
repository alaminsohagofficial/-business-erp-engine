const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ফ্রন্টএন্ডের HTML ফাইলটি যদি রুটে থাকে তবে তা সার্ভ করার জন্য
app.use(express.static(__dirname));

// জেমিনি এআই অ্যানালিটিক্স এন্ডপয়েন্ট
app.post('/api/gemini-insight', async (req, res) => {
    try {
        // ড্যাশবোর্ডের ফিন্যান্সিয়াল ডেটা
        const data = {
            totalSales: 28649996.98,
            totalPaid: 22221029.92,
            totalPurchase: 30026974.70,
            customerDue: 6428967.06
        };

        // এখানে আপনার জেমিনি এআই ইঞ্জিন বা কাস্টম প্রম্পটের লজিক বসবে
        // আপাতত একটি ডাইনামিক অ্যানালিটিক্যাল রেসপন্স পাঠানো হচ্ছে:
        const insight = `🤖 Salsabilah Amin Ltd. - Gemini AI Financial Report:

1. Cash Flow Alert: আপনার মোট পারচেজ (৳30.02M) মোট সেলস (৳28.64M) এর চেয়ে বেশি। অর্থাৎ ইনভেন্টরিতে ক্যাশ ব্লক হয়ে আছে।
2. Liquidity Risk: মোট বিক্রির প্রায় 22.4% টাকা (৳6.42M) কাস্টমার ডিউ হিসেবে আটকে আছে। 
3. Recommendation: নতুন পারচেজ সাময়িক কমিয়ে বকেয়া টাকা (Due Collection) তোলার দিকে ফোকাস করলে কোম্পানির ক্যাশ ফ্লো দ্রুত পজিটিভ হবে।`;

        res.json({ insight });
    } catch (error) {
        res.status(500).json({ insight: "AI Engine processing failed." });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`ERP Engine running on port ${PORT}`);
});
