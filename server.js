/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const path = require('path');
const app = express();
// গুগল ক্লাউডের জন্য পোর্ট ৮০৮০ ডিফল্ট করা হলো
const PORT = process.env.PORT || 8080;

app.use(express.json());

const erpData = {
    totalSales: 28649996.98,
    totalPaid: 22221029.92,
    customerDue: 6428967.06,
    totalPurchases: 30026974.70,
    supplierDue: 5027923.60
};

app.get('/api/dashboard-data', (req, res) => {
    return res.status(200).json(erpData);
});

app.post('/api/gemini-insight', (req, res) => {
    const insights = `🤖 SALSABILAH AMIN LTD. - Gemini AI Financial Report:\n\n` +
                     `১. ইনভেন্টরি লক অ্যালার্ট: মোট বিক্রয় (৳২.৮৬ কোটি) এবং মোট ক্রয় (৳৩.০০ কোটি) কাছাকাছি।\n` +
                     `২. কাস্টমার বকেয়া: বাজারে বকেয়া ৳৬৪.২৮ লাখ টাকা দ্রুত কালেকশন করা প্রয়োজন।\n` +
                     `৩. সাপ্লায়ার লায়াবিলিটি: সাপ্লায়ারদের কাছে বকেয়া ৳৫০.২৭ লাখ টাকা অ্যাডজাস্ট করতে হবে।`;
    return res.status(200).json({ insight: insights });
});

// আপনার public ফোল্ডারটিকে স্ট্যাটিক হিসেবে ডিক্লেয়ার করা হলো
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[LIVE] Salsabilah Amin ERP Engine is running on Google Cloud Port ${PORT}`);
});
