# 🍽 La Bella Restaurant Website
## Setup Guide — SQL Server + Node.js + HTML

---

## FOLDER STRUCTURE
```
restaurant/
├── backend/
│   ├── server.js          ← Main server
│   ├── db.js              ← Database connection
│   ├── package.json       ← Dependencies
│   └── database_setup.sql ← Run this in SSMS first
└── frontend/
    ├── index.html         ← Menu page
    ├── order.html         ← Cart & checkout
    ├── admin.html         ← Admin panel
    ├── style.css          ← All styles
    └── script.js          ← Shared cart logic
```

---

## STEP 1 — Setup Database in SSMS

1. Open **SQL Server Management Studio**
2. Click **New Query**
3. Open the file `backend/database_setup.sql`
4. Copy-paste entire content into SSMS
5. Press **F5** to Execute
6. You should see "10 rows affected" at the bottom ✅

---

## STEP 2 — Check Your Server Name

Look at SSMS title bar, you'll see something like:
`DESKTOP-EQ55Q8H (SQL Server 16.0...)`

Open `backend/db.js` and set:
```js
server: 'DESKTOP-EQ55Q8H',   // ← Your PC name here
```

---

## STEP 3 — Install Node.js

Download from: https://nodejs.org
Choose the **LTS** version and install.

Verify in Command Prompt:
```
node -v
npm -v
```

---

## STEP 4 — Install Backend Dependencies

Open **Command Prompt** and run:
```
cd C:\path\to\restaurant\backend
npm install
```
This installs express, mssql, cors, body-parser.

---

## STEP 5 — Run the Backend

In Command Prompt (inside the backend folder):
```
node server.js
```

You should see:
```
✅ Connected to SQL Server!
🚀 Server running at https://restaurant-ten-indol.vercel.app
```

If you see a connection error, check STEP 6.

---

## STEP 6 — Fix Connection Issues (if any)

### Option A: Enable TCP/IP in SQL Server
1. Open **SQL Server Configuration Manager**
2. SQL Server Network Configuration → Protocols
3. Right-click **TCP/IP** → Enable
4. Restart SQL Server service

### Option B: Use SQL Server Authentication
In SSMS: Security → Logins → right-click sa → Enable
Then in `db.js`, replace `trustedConnection` with:
```js
user: 'sa',
password: 'your_password',
```

### Option C: Try localhost
In `db.js`, change server to:
```js
server: 'localhost',
// or
server: '127.0.0.1',
```

---

## STEP 7 — Open the Frontend

Just double-click `frontend/index.html` in File Explorer.
Or in VS Code: right-click → Open with Live Server.

---

## WHAT EACH PAGE DOES

| Page | What it does |
|---|---|
| `index.html` | Browse menu, filter by category, add to cart |
| `order.html` | View cart, fill name + table, place order |
| `admin.html` | See all orders, update status, add/remove items |

---

## QUICK TEST

1. Open `index.html` → you should see 10 menu items loaded
2. Click `+ Add` on any item → cart count increases
3. Go to `order.html` → fill your name + table → Place Order
4. Go to `admin.html` → your order appears, change status to "Ready"

---

## API ENDPOINTS (for reference)

| Method | URL | What it does |
|---|---|---|
| GET | /api/menu | Get all menu items |
| POST | /api/menu | Add new item |
| DELETE | /api/menu/:id | Remove item |
| GET | /api/orders | Get all orders |
| POST | /api/orders | Place new order |
| PUT | /api/orders/:id | Update order status |
