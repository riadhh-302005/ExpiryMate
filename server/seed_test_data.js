// ============================================================================
// File: server/seed_test_data.js
// 1. What this file does:
//    Populates the database with a ready-to-test demo user (Aarav Sharma) and
//    5 realistic Indian market purchases covering every warranty and return status.
// 2. Why this file exists in the application:
//    Allows developers, students, and interviewers to test and demo the entire
//    application immediately with one command (npm run seed) without manual data entry.
// 3. Important functions, variables, or concepts to remember:
//    - Demo User: aarav.sharma@example.com / password123.
//    - Covers all badge scenarios:
//      * Return deadline approaching (<= 3 days)
//      * Warranty expiring soon (<= 30 days)
//      * Active warranty (> 30 days)
//      * Expired warranty & closed return window
//    - Calculates dates relative to Date.now() so the seed data is ALWAYS fresh.
// 4. How it connects to other parts of the application:
//    Inserts documents into User and Purchase collections in MongoDB.
// ============================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Purchase = require('./models/Purchase');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Generate a sample dummy receipt SVG for testing preview/download
const sampleReceiptPath = path.join(uploadDir, 'sample-invoice.svg');
if (!fs.existsSync(sampleReceiptPath)) {
  const dummySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="#ffffff">
    <rect width="600" height="800" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="30" y="30" width="540" height="100" rx="8" fill="#4f46e5"/>
    <text x="60" y="85" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="bold">CROMA RETAIL INVOICE</text>
    <text x="60" y="112" fill="#e0e7ff" font-family="Arial, sans-serif" font-size="14">Authorized Electronics Partner — GSTIN: 27AABCT2345A1Z5</text>
    <text x="50" y="180" fill="#334155" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Customer: Aarav Sharma</text>
    <text x="50" y="210" fill="#64748b" font-family="Arial, sans-serif" font-size="14">Invoice No: CR-MUM-2026-99214</text>
    <text x="50" y="235" fill="#64748b" font-family="Arial, sans-serif" font-size="14">Store: Croma Mega Mall, Mumbai</text>
    <line x1="50" y1="260" x2="550" y2="260" stroke="#e2e8f0" stroke-width="2"/>
    <text x="50" y="300" fill="#1e293b" font-family="Arial, sans-serif" font-size="16">1. OnePlus 12 5G (16GB / 512GB Silky Black)</text>
    <text x="450" y="300" fill="#1e293b" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Rs. 64,999.00</text>
    <text x="50" y="340" fill="#64748b" font-family="Arial, sans-serif" font-size="12">IMEI / Serial: 867392019482710 | Warranty: 1 Year Official</text>
    <line x1="50" y1="380" x2="550" y2="380" stroke="#e2e8f0" stroke-width="1"/>
    <text x="350" y="420" fill="#475569" font-family="Arial, sans-serif" font-size="16">Subtotal:</text>
    <text x="450" y="420" fill="#475569" font-family="Arial, sans-serif" font-size="16">Rs. 55,083.90</text>
    <text x="350" y="450" fill="#475569" font-family="Arial, sans-serif" font-size="16">GST (18%):</text>
    <text x="450" y="450" fill="#475569" font-family="Arial, sans-serif" font-size="16">Rs. 9,915.10</text>
    <line x1="350" y1="470" x2="550" y2="470" stroke="#475569" stroke-width="1.5"/>
    <text x="350" y="505" fill="#0f172a" font-family="Arial, sans-serif" font-size="20" font-weight="bold">TOTAL DUE:</text>
    <text x="440" y="505" fill="#4f46e5" font-family="Arial, sans-serif" font-size="22" font-weight="bold">Rs. 64,999.00</text>
    <rect x="50" y="550" width="500" height="90" rx="8" fill="#ecfdf5" stroke="#a7f3d0"/>
    <text x="70" y="585" fill="#065f46" font-family="Arial, sans-serif" font-size="14" font-weight="bold">7-Day Hassle-Free Replacement Policy Active</text>
    <text x="70" y="610" fill="#047857" font-family="Arial, sans-serif" font-size="12">Keep this invoice copy intact for OnePlus authorized service center warranty claims.</text>
    <text x="210" y="740" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">Thank you for shopping with Croma!</text>
  </svg>`;
  fs.writeFileSync(sampleReceiptPath, dummySvg);
}

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expirymate';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB at: ${mongoUri}`);

    // Demo User credentials
    const demoEmail = 'aarav.sharma@example.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: 'Aarav Sharma',
        email: demoEmail,
        password: 'password123'
      });
      console.log(`[Seed] Created demo user: ${user.name} (${user.email})`);
    } else {
      console.log(`[Seed] Demo user already exists: ${user.name} (${user.email})`);
    }

    // Clean existing purchases for this user to ensure clean state
    await Purchase.deleteMany({ user: user._id });
    console.log('[Seed] Cleared prior purchases for demo user.');

    const now = new Date();

    // Helper for relative dates
    const addDays = (days) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d;
    };

    // 5 Realistic Purchases to showcase all application features
    const seedPurchases = [
      {
        user: user._id,
        productName: 'OnePlus 12 5G (16GB / 512GB)',
        category: 'Electronics',
        price: 64999,
        seller: 'Croma Retail',
        purchaseDate: addDays(-5),
        returnDeadline: addDays(2), // 2 days left -> Return deadline approaching!
        warrantyEndDate: addDays(360), // Active warranty
        receiptUrl: '/uploads/receipt-05-oneplus12-croma.png',
        receiptFileType: 'image',
        notes: 'Serial No: OP12-8829-IND. 1-year manufacturer warranty. Bill attached for Croma replacement.',
        remindersSent: { returnDeadline: false, warrantyExpiry: false }
      },
      {
        user: user._id,
        productName: 'LG 1.5 Ton 5-Star Dual Inverter AC',
        category: 'Appliances',
        price: 37990,
        seller: 'Reliance Digital',
        purchaseDate: addDays(-350),
        returnDeadline: addDays(-335), // Closed
        warrantyEndDate: addDays(15), // 15 days left -> Warranty expiring soon!
        receiptUrl: '/uploads/receipt-03-samsung-tv.png',
        receiptFileType: 'image',
        notes: 'Includes free annual maintenance service. Need to book final free service before warranty ends!',
        remindersSent: { returnDeadline: true, warrantyExpiry: false }
      },
      {
        user: user._id,
        productName: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        category: 'Electronics',
        price: 26990,
        seller: 'Amazon India',
        purchaseDate: addDays(-45),
        returnDeadline: addDays(-35), // Closed
        warrantyEndDate: addDays(320), // Active warranty
        receiptUrl: '/uploads/receipt-01-macbook-apple.png',
        receiptFileType: 'image',
        notes: 'Registered on Sony India official portal with invoice copy.',
        remindersSent: { returnDeadline: true, warrantyExpiry: false }
      },
      {
        user: user._id,
        productName: 'Wakefit Orthopedic Memory Foam Mattress (King)',
        category: 'Furniture',
        price: 12499,
        seller: 'Wakefit Official Store',
        purchaseDate: addDays(-20),
        returnDeadline: addDays(80), // 100-day trial period -> Return window open!
        warrantyEndDate: addDays(1075), // 3-year warranty active
        receiptUrl: '/uploads/receipt-02-zara-blazer.png',
        receiptFileType: 'image',
        notes: 'Includes 100-day risk-free home sleep trial policy.',
        remindersSent: { returnDeadline: false, warrantyExpiry: false }
      },
      {
        user: user._id,
        productName: 'Boat Rockerz 450 Bluetooth Headphones',
        category: 'Electronics',
        price: 1499,
        seller: 'Flipkart',
        purchaseDate: addDays(-400),
        returnDeadline: addDays(-393), // Closed
        warrantyEndDate: addDays(-35), // Expired!
        receiptUrl: '/uploads/receipt-04-prestige-cooktop.png',
        receiptFileType: 'image',
        notes: '1-year warranty coverage has expired.',
        remindersSent: { returnDeadline: true, warrantyExpiry: true }
      }
    ];

    await Purchase.insertMany(seedPurchases);
    console.log(`[Seed] Inserted ${seedPurchases.length} realistic test purchases.`);
    console.log('\n======================================================');
    console.log(' SEEDING COMPLETE! You can now log in with:');
    console.log(` Email:    ${demoEmail}`);
    console.log(' Password: password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error(`[Seed Error]: ${err.message}`);
    process.exit(1);
  }
};

seedDatabase();
