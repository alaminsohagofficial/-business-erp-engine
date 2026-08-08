const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // Transaction Identifiers
    trxId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    dealerCode: {
      type: String,
      required: true,
      trim: true,
      index: true, // e.g., 'DEAL002905' or '3000002272'
    },
    companyName: {
      type: String,
      required: true, // e.g., 'Minister Hi-Tech Park' or 'Butterfly Marketing'
    },

    // Financial Details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BDT',
      uppercase: true,
    },

    // Banking & Payment Flow Details
    paymentChannel: {
      type: String,
      enum: ['RTGS', 'EFT', 'BEFTN', 'DBBL_ONLINE', 'CASH', 'CHEQUE'],
      default: 'RTGS',
    },
    senderBank: {
      type: String,
      default: 'Islami Bank Bangladesh PLC',
    },
    senderAccountNo: {
      type: String,
      trim: true,
      select: true, // Complete/masked account number from bank payload
    },
    receiverBank: {
      type: String,
      default: 'Dutch-Bangla Bank PLC',
    },
    receiverAccountNo: {
      type: String,
      trim: true,
      select: true, // Corporate settlement account number
    },

    // SAP & ERP Sync References
    sapDocNumber: {
      type: String,
      trim: true, // e.g., '5100029481'
    },
    auditReference: {
      type: String,
      trim: true, // e.g., 'DBBL/HO/SYS-AUDIT/2026/10925-AMEND'
    },

    // Status Tracking
    status: {
      type: String,
      enum: ['PENDING', 'SETTLED', 'POSTED', 'DISPUTED', 'CANCELLED'],
      default: 'PENDING',
    },
    inventoryStatus: {
      type: String,
      enum: ['HOLD', 'PARTIALLY_RELEASED', 'RELEASED'],
      default: 'HOLD',
    },
    releasedUnits: {
      type: Number,
      default: 0,
    },

    // Live Webhook / Sync Metadata
    rawWebhookPayload: {
      type: Object, // Stores incoming live payload from bank API
      select: false,
    },
    settledAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Auto adds createdAt & updatedAt
  }
);

// Pre-save hook to set settlement timestamp when status changes
transactionSchema.pre('save', function (next) {
  if (this.isModified('status') && (this.status === 'SETTLED' || this.status === 'POSTED') && !this.settledAt) {
    this.settledAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
