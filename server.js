/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// আপনার এক্সেল শীট থেকে নেওয়া ফাইনাল ডাটা অবজেক্ট
const erpData = {
    totalSales: 28649996.98,
    totalPaid: 22221029.92,
    customerDue: 6428967.06,
    totalPurchases: 30026974.70,
    supplierDue: 5027923.60
};

// ১. এপিআই রাউটস (সবার আগে প্রসেস হবে যাতে ফাইল কনফ্লিক্ট না হয়)
app.get('/api/dashboard-data', (req, res) => {
    return res.status(200).json(erpData);
});

app.post('/api/gemini-insight', (req, res) => {
    const insights = `🤖 SALSABILAH AMIN LTD. - Gemini AI Financial Report:\n\n` +
                     `১. ইনভেন্টরি লক অ্যালার্ট: মোট বিক্রয় (৳২.৮৬ কোটি) এবং মোট ক্রয় (৳৩.০০ কোটি) কাছাকাছি। এর মানে ব্যবসার লিকুইড ক্যাশ স্টক বা পারচেসে আটকে আছে।\n` +
                     `২. কাস্টমার বকেয়া: বাজারে বকেয়া ৳৬৪.২৮ লাখ টাকা দ্রুত কালেকশন করা প্রয়োজন।\n` +
                     `৩. সাপ্লায়ার লায়াবিলিটি: সাপ্লায়ারদের কাছে বকেয়া ৳৫০.২৭ লাখ টাকা সেলস রেভিনিউ থেকে অ্যাডজাস্ট করতে হবে।`;
    return res.status(200).json({ insight: insights });
});

// ২. স্ট্যাটিক ফাইল মিডলওয়্যার (সব ফাইল সরাসরি রুট বা মেইন ডিরেক্টরি থেকে লোড হবে)
app.use(express.static(__dirname));

// ৩. ওয়াইল্ডকার্ড ফলব্যাক রুট (সবার শেষে থাকবে এবং রুট ডিরেক্টরির index.html লোড করবে)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[LIVE] Salsabilah Amin ERP Engine is running successfully on port ${PORT}`);
});
