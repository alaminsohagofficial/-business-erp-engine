const { Pool } = require('pg');

// আপনার PostgreSQL কানেকশন স্ট্রিং (এনভায়রনমেন্ট ভেরিয়েবল থেকে নেওয়া ভালো)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/your_database'
});

// ১. ডাটাবেজ থেকে নির্দিষ্ট ডিলারের ডেটা তুলে আনার ডায়নামিক রাউট (GET)
app.get('/api/sap/butterfly/dealer/:dealer_reference', async (req, res) => {
    const { dealer_reference } = req.params;

    try {
        const query = `
            SELECT * FROM sap_dealer_staging 
            WHERE dealer_reference = $1;
        `;
        const result = await pool.query(query, [dealer_reference]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Dealer record with reference ${dealer_reference} not found in database.`
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Database query execution failed",
            error: error.message
        });
    }
});

// ২. বাটারফ্লাই বা SAP থেকে আসা নতুন ট্রানজেকশন ডেটা ইনসার্ট/আপডেট করার রাউট (POST)
app.post('/api/sap/butterfly/sync-dealer', async (req, res) => {
    const {
        dealer_reference, base_lead_id, company_name, transaction_id,
        transaction_date, amount, currency, batch_total, sap_module,
        special_gl_indicator, posting_status, next_action
    } = req.body;

    try {
        // UPSERT লজিক: ডেটা থাকলে আপডেট হবে, না থাকলে নতুন ইনসার্ট হবে
        const query = `
            INSERT INTO sap_dealer_staging 
            (dealer_reference, base_lead_id, company_name, transaction_id, transaction_date, amount, currency, batch_total, sap_module, special_gl_indicator, posting_status, next_action, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            ON CONFLICT (dealer_reference) 
            DO UPDATE SET 
                transaction_id = EXCLUDED.transaction_id,
                transaction_date = EXCLUDED.transaction_date,
                amount = EXCLUDED.amount,
                posting_status = EXCLUDED.posting_status,
                next_action = EXCLUDED.next_action,
                updated_at = NOW()
            RETURNING *;
        `;

        const values = [
            dealer_reference, base_lead_id, company_name, transaction_id,
            transaction_date, amount, currency, batch_total, sap_module,
            special_gl_indicator, posting_status, next_action
        ];

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            message: "Database successfully synced with SAP layer",
            record: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to sync data to PostgreSQL",
            error: error.message
        });
    }
});
