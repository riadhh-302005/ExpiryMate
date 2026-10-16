# ExpiryMate — Testing Guide & Sample Test Data

This guide provides test details, pre-configured demo account credentials, sample records to fill manually into forms, and verification steps for every feature in **ExpiryMate**.

---

## 1. Quick One-Command Test Setup

If you want to test and explore the application immediately without typing manual records:

1. In your server terminal:
   ```bash
   cd server
   npm run seed
   ```
2. This creates a demo account with **5 pre-populated purchases** representing every warranty and return window status:
   - **Demo Email**: `aarav.sharma@example.com`
   - **Demo Password**: `password123`

---

## 2. Running Both Applications

Open two terminals:

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
# Listening on http://localhost:5000 (MongoDB localhost:27017)
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

Open your browser to: **`http://localhost:5173`**

---

## 3. Manual Testing Scenarios & Sample Form Values

### Scenario A: User Registration
Go to `http://localhost:5173/register` and fill:
- **Full Name**: `Priya Patel`
- **Email Address**: `priya.patel@example.com`
- **Password**: `password123`
- **Confirm Password**: `password123`
- **Expected Outcome**: Account created, redirected to Dashboard with zero purchases and fresh statistics.

---

### Scenario B: Add an Active Warranty Purchase
Go to `http://localhost:5173/purchases/new` and fill:
- **Product Name**: `Apple MacBook Air M3 (16GB, 512GB)`
- **Category**: `Electronics`
- **Price (₹ INR)**: `124900.00`
- **Seller**: `Apple Store BKC Mumbai`
- **Purchase Date**: *Select today's date*
- **Return Deadline**: *Select date 14 days from today*
- **Warranty Expiry Date**: *Select date 1 year (365 days) from today*
- **Notes**: `Serial: C02G99XYMD6. AppleCare 1-year limited warranty.`
- **Receipt Document**: *(Optional)* Drag & drop or select `client/public/sample-receipt.svg`.
- **Expected Outcome**:
  - Saved successfully.
  - Return window shows green badge: `Return open (14d)`.
  - Warranty shows emerald badge: `Warranty active (365d)`.

---

### Scenario C: Add an Item with Return Deadline Closing Soon (Urgent)
Go to `http://localhost:5173/purchases/new` and fill:
- **Product Name**: `Zara Formal Wool Blazer`
- **Category**: `Clothing`
- **Price (₹ INR)**: `7990.00`
- **Seller**: `Zara Phoenix Palladium`
- **Purchase Date**: *Select 5 days ago*
- **Return Deadline**: *Select 2 days from today* (≤ 3 days left!)
- **Warranty Expiry Date**: *(Leave blank)*
- **Notes**: `Trial period. Need to exchange size 40 for size 42 before deadline.`
- **Expected Outcome**:
  - Return window shows animated amber badge: `Return deadline approaching (2d left)`.
  - Dashboard shows incremented **"Returns Closing: 1"** counter with an "Urgent" pill.

---

### Scenario D: Add an Item with Warranty Expiring Soon (Action Needed)
Go to `http://localhost:5173/purchases/new` and fill:
- **Product Name**: `Samsung 55-inch Crystal 4K UHD TV`
- **Category**: `Electronics`
- **Price (₹ INR)**: `43990.00`
- **Seller**: `Reliance Digital`
- **Purchase Date**: *Select 350 days ago*
- **Return Deadline**: *Select 335 days ago*
- **Warranty Expiry Date**: *Select 15 days from today* (≤ 30 days left!)
- **Notes**: `Claim extended panel replacement before standard coverage lapses.`
- **Expected Outcome**:
  - Warranty badge displays amber warning: `Expiring soon (15d left)`.
  - Return status shows: `Return closed`.
  - Dashboard shows **"Expiring Soon: 1"** counter with "Action needed".

---

### Scenario E: Add an Expired Item
Go to `http://localhost:5173/purchases/new` and fill:
- **Product Name**: `Prestige Induction Cooktop`
- **Category**: `Home & Kitchen`
- **Price (₹ INR)**: `2499.00`
- **Seller**: `Amazon.in`
- **Purchase Date**: *Select 2 years ago*
- **Return Deadline**: *Select 23 months ago*
- **Warranty Expiry Date**: *Select 1 year ago*
- **Notes**: `Out of warranty. Retained receipt for servicing records.`
- **Expected Outcome**:
  - Badges display: `Warranty expired` (rose badge) and `Return closed`.

---

## 4. Testing Core Features Checklist

| Feature | Where to Test | Expected Behavior |
|---|---|---|
| **Search & Filters** | `/purchases` | Typing `OnePlus` filters instantly; selecting `Electronics` isolates gadgets; selecting `Expiring Soon (≤30d)` isolates items nearing expiry. |
| **Receipt Modal Preview** | Any purchase card | Clicking **"View Receipt"** opens the modal dialog, rendering the image with zoom and an "Open Original" tab button. |
| **Expense Charts (Recharts)** | `/` (Dashboard) | **Monthly Expenses** renders a bar chart in `₹` for the past 6 months. **Spending by Category** displays a donut chart splitting expenses into percentages. |
| **Urgent Deadlines View** | `/deadlines` | Categorizes imminent items into **Return Windows Closing (≤14 days)** and **Warranties Expiring (≤60 days)**, sorted by urgency. |
| **Edit Purchase** | `/purchases/:id/edit` | Pre-fills current values; changing dates recalculates badges instantly; uploading a new file replaces the receipt. |
| **Delete Confirmation Modal** | `/purchases` or `/purchases/:id` | Clicking Delete prompts an accessible confirmation dialog. Deleting removes the record and frees file assets. |
| **Email Reminders Test** | `/profile` | Click **"Test Email Reminders Now"**. Server scans eligible purchases, prints formatted previews in console (or dispatches SMTP), and sets deduplication flags. Clicking again sends 0 duplicate emails. |
| **Client-Side OCR** | `/purchases/new` | Selecting an image file displays the **"Auto-Extract Receipt Details (OCR)"** bar. Clicking **Scan Receipt** runs Tesseract in browser, finds total price / store / date, and pre-fills form fields upon clicking "Apply". |
| **User Data Isolation** | Login as User B | User B cannot view, modify, or see User A's purchases or statistics (returns 403 Forbidden). |

---

## 5. Ready-to-Use Test Receipt Files

We have generated **5 high-resolution PNG receipt images** located inside your project folder at:
📁 **`ExpiryMate/test-receipts/`** (and also accessible via `client/public/test-receipts/`)

| File Name | Store / Merchant | Product | Price | Matching Test Scenario |
|---|---|---|---|---|
| **`receipt-01-macbook-apple.png`** | Apple BKC Mumbai | Apple MacBook Air M3 15-inch | ₹1,24,900.00 | **Scenario B** (Active 1-Year Warranty) |
| **`receipt-02-zara-blazer.png`** | ZARA Fashion Retail | Men's Formal Tailored Blazer | ₹7,990.00 | **Scenario C** (7-Day Return Deadline Approaching) |
| **`receipt-03-samsung-tv.png`** | Reliance Digital | Samsung 55-inch Crystal 4K UHD TV | ₹43,990.00 | **Scenario D** (Warranty Expiring in 15 Days) |
| **`receipt-04-prestige-cooktop.png`** | Amazon Retail India | Prestige Induction Cooktop | ₹2,499.00 | **Scenario E** (Expired Warranty & Return) |
| **`receipt-05-oneplus12-croma.png`** | Croma Electronics | OnePlus 12 5G (16GB/512GB) | ₹64,999.00 | Seed Demo Purchase (Pre-loaded) |

### How to use them in the UI:
1. Open [`http://localhost:5173/purchases/new`](http://localhost:5173/purchases/new).
2. Click **"Click to upload receipt image or PDF"** (or drag and drop).
3. Navigate to `ExpiryMate/test-receipts/` and select any of the PNG receipt files above.
4. Try clicking **"Scan Receipt"** in the **Auto-Extract Receipt Details (OCR)** banner &mdash; Tesseract will parse the price and store name directly from the image!
5. Save the purchase and view the receipt preview modal!
