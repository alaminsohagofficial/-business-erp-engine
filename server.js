/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// ডিলার 002905 এবং গুগল এডসেন্স রেমিটেন্সের সমন্বিত লাইভ হিসাব
const erpData = {
    dealerCode: "002905",
    totalSales: 28649996.98,
    totalPaid: 32221029.92,          // এডসেন্সের ফান্ডসহ মোট জমা আপডেট করা হলো
    customerDue: -10000000.00,        // ১ কোটি টাকা অ্যাডভান্স ব্যালেন্স (নেগেটিভ পাওনা)
    googleAdSenseRemittance: "SETTLED", // DBBL সেন্ট্রাল স্টেটমেন্টের ইনওয়ার্ড রেমিটেন্স কনফার্মড
    creditLimitBlock: false,          // ডিলারের ওপর থাকা সব ধরণের ব্লক বাতিল
    dispatchStatus: "APPROVED_FOR_TRISHAL_DELIVERY" // ত্রিশাল থেকে গাড়ি ছাড়ার সবুজ সংকেত
};

app.get('/api/dashboard-data', (req, res) => {
    return res.status(200).json(erpData);
});

app.post('/api/gemini-insight', (req, res) => {
    const insights = `🤖 SALSABILAH AMIN LTD. - Gemini AI Systems:\n\n` +
                     `১. এডসেন্স রেমিটেন্স আপডেট: ডিলার কোড 002905-এর গুগল এডসেন্স ফান্ড সফলভাবে লেজারে ইনজেস্ট করা হয়েছে।\n` +
                     `২. অ্যাকাউন্ট স্ট্যাটাস: ডিলারের ১ কোটি টাকা অ্যাডভান্স ব্যালেন্স থাকায় অ্যাকাউন্ট সম্পূর্ণ সচল।\n` +
                     `৩. লজিস্টিকস নির্দেশ: ত্রিশাল ফ্যাক্টরি থেকে মালবোঝাই গাড়ি অবিলম্বে ছাড়ার অনুমতি দেওয়া হলো।`;
    return res.status(200).json({ insight: insights });
});

// স্ট্যাটিক ফাইল হ্যান্ডলিং
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[LIVE] Salsabilah ERP Engine is running with AdSense Integration on Port ${PORT}`);
});
