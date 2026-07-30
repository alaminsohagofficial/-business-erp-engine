require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google OAuth2 Client
const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/auth/google/callback`
);

// Middleware Setup
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Import Dynamic Reconciliation Routes
try {
    const reconciliationRoutes = require('./routes/reconciliationRoutes');
    app.use('/api/reconcile', reconciliationRoutes);
} catch (error) {
    console.warn("⚠️ Warning: './routes/reconciliationRoutes' not found. Skipping dynamic route registration.");
}

// ==========================================
// 🔐 GOOGLE OAUTH 2.0 AUTHENTICATION ROUTES
// ==========================================

// 1. Redirect User to Google Sign-In Page
app.get('/auth/google', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    });
    res.redirect(authUrl);
});

// 2. Handle Google OAuth Callback
app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ success: false, message: 'Authorization code missing.' });
    }

    try {
        // Exchange authorization code for access token
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Retrieve user profile information
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const userProfile = await userResponse.json();

        // Pass authenticated user context back to frontend dashboard
        res.redirect(`/?login=success&email=${encodeURIComponent(userProfile.email)}&name=${encodeURIComponent(userProfile.name)}`);
    } catch (error) {
        console.error('❌ Google OAuth Authentication Error:', error);
        res.status(500).json({ success: false, message: 'Google Authentication Failed', error: error.message });
    }
});

// ==========================================
// ১. মিনিস্টার (Minister MyOne Group) GET API
// ==========================================
app.get('/api/reconcile/minister', (req, res) => {
    const ministerLidLedger = [
        { date: "06-Jul-2026", traceId: "100NEXP26187M597", lid: "LID01976788453", amount: 238000.00, status: "SETTLED" },
        { date: "07-Jul-2026", traceId: "100NEXP26188M616", lid: "LID01996890123", amount: 270000.00, status: "SETTLED" },
        { date: "07-Jul-2026", traceId: "100NEXP26188M584", lid: "LID01996889539", amount: 230000.00, status: "SETTLED" },
        { date: "08-Jul-2026", traceId: "100NXN126189M586", lid: "LID01998640246", amount: 297000.00, status: "SETTLED" },
        { date: "08-Jul-2026", traceId: "100NXN126189M591", lid: "LID01938788435", amount: 285000.00, status: "SETTLED" },
        { date: "12-Jul-2026", traceId: "100NEXP26193M601", lid: "LID01996914258", amount: 300000.00, status: "SETTLED" },
        { date: "12-Jul-2026", traceId: "100NEXP26193M602", lid: "LID01996987412", amount: 300000.00, status: "SETTLED" }
    ];

    const totalMinister = ministerLidLedger.reduce((sum, item) => sum + item.amount, 0);

    res.json({
        success: true,
        dealerCode: "DEAL002905",
        dealerName: "SR Electronics Park / Salsabilah Amin Limited",
        verificationRef: "DBBL/HO/SYS-AUDIT/2026/10924",
        totalReconciledAmount: totalMinister,
        status: "100% OK / SETTLED",
        transactions: ministerLidLedger
    });
});

// ==========================================
// ২. বাটারফ্লাই (Butterfly Marketing Ltd) GET API
// ==========================================
app.get('/api/reconcile/butterfly', (req, res) => {
    const butterflyLedger = [
        { date: "06-JUL-26", traceId: "100NXN126187M630", narration: "PA-PP2026/0630", amount: 200000.00, status: "SETTLED" },
        { date: "06-JUL-26", traceId: "100NXN126187M642", narration: "Ref: 3000002272", amount: 200000.00, status: "SETTLED" },
        { date: "06-JUL-26", traceId: "100NXN126187M620", narration: "PA-PP2026/0620", amount: 300000.00, status: "SETTLED" },
        { date: "07-JUL-26", traceId: "100NXN126188M636", narration: "Core Reference", amount: 229000.00, status: "SETTLED" },
        { date: "10-JUL-26", traceId: "100NEXP26191M100", narration: "Fund Transfer", amount: 100000.00, status: "SETTLED" }
    ];

    const totalButterfly = butterflyLedger.reduce((sum, item) => sum + item.amount, 0);

    res.json({
        success: true,
        company: "Butterfly Marketing Limited",
        dealerCode: "3000002272",
        totalDepositedAdvance: totalButterfly,
        currentBlockedOrder: 650000.00,
        varianceAdjustment: 76210.00,
        status: "SETTLED",
        transactions: butterflyLedger
    });
});

// Root Page Serving
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Server Initialization
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Engine running on port ${PORT}`);
});
