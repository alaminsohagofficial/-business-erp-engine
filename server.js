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

// আসল ডাটা অবজেক্ট
const erpData = {
    totalSales: 28649996.98,
    totalPaid: 22221029.92,
    customerDue: 6428967.06,
    totalPurchases: 30026974.70,
    supplierDue: 5027923.60
};

// এপিআই রুটগুলোকে সবার উপরে রাখতে হবে, যাতে এক্সপ্রেস আগে এগুলো প্রসেস করে
app.get('/api/dashboard-data', (req, res) => {
    return res.status(200).json(erpData);
});

app.post('/api/gemini-insight', (req, res) => {
    const insights = `🤖 SALSABILAH AMIN LTD. - Gemini AI Financial Report:\n\n` +
                     `১. ইনভেন্টরি লক অ্যালার্ট: মোট বিক্রয় (৳২.৮৬ কোটি) এবং মোট ক্রয় (৳৩.০০ কোটি) কাছাকাছি। রানিং ক্যাশ স্টক বা পারচেসে আটকে আছে।\n` +
                     `২. কাস্টমার বকেয়া: বাজারে ৳৬৪.২৮ লাখ টাকা বকেয়া রয়েছে। ক্যাশ ফ্লো বাড়াতে দ্রুত কালেকশন প্রয়োজন।\n` +
                     `৩. সাপ্লায়ার লায়াবিলিটি: সাপ্লায়ারদের কাছে বকেয়া ৳৫০.২৭ লাখ টাকা সেলস রেভিনিউ থেকে অ্যাডজাস্ট করতে হবে।`;
    return res.status(200).json({ insight: insights });
});

// স্ট্যাটিক ফাইলের জন্য নির্দিষ্ট রুট (কনফ্লিক্ট এড়ানোর জন্য)
app.use(express.static(__dirname));

// বাকি সব রিকোয়েস্টের জন্য ইনডেক্স ফাইল
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
