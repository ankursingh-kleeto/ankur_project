import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   🔥 HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("🚀 POS API Running");
});

/* =========================
   🔥 MENU (CATEGORY → ITEM → VARIANT)
========================= */



app.get("/menu", (req, res) => {
  db.query(`
    SELECT 
      c.name as category,
      i.id as item_id,
      i.name as item_name,
      i.image,
      v.id as variant_id,
      v.name as variant_name,
      v.price
    FROM categories c
    LEFT JOIN items i ON c.id = i.category_id
    LEFT JOIN variants v ON i.id = v.item_id
  `, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

// 🔹 GET FULL MENU (Frontend uses this)
app.get("/menu-full", (req, res) => {
  db.query(`
    SELECT 
      c.name AS category,
      i.id AS item_id,
      i.name AS item_name,
      i.image,
      v.id AS variant_id,
      v.name AS variant_name,
      v.price
    FROM categories c
    LEFT JOIN items i ON c.id = i.category_id
    LEFT JOIN variants v ON i.id = v.item_id
    ORDER BY c.name, i.name
  `, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

// 🔹 ADD CATEGORY
app.post("/category", (req, res) => {
  db.query(
    "INSERT INTO categories (name) VALUES (?)",
    [req.body.name],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Category Added" });
    }
  );
});

// 🔹 ADD ITEM
app.post("/item", (req, res) => {
  const { name, category_id, image } = req.body;

  db.query(
    "INSERT INTO items (name, category_id, image) VALUES (?, ?, ?)",
    [name, category_id, image],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Item Added" });
    }
  );
});

// 🔹 ADD VARIANT
app.post("/variant", (req, res) => {
  const { item_id, name, price } = req.body;

  db.query(
    "INSERT INTO variants (item_id, name, price) VALUES (?, ?, ?)",
    [item_id, name, price],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Variant Added" });
    }
  );
});


// UPDATE CATEGORY
app.put("/category/:id", (req, res) => {
  db.query(
    "UPDATE categories SET name=? WHERE id=?",
    [req.body.name, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Category Updated" });
    }
  );
});

// UPDATE ITEM
app.put("/item/:id", (req, res) => {
  const { name, category_id } = req.body;

  db.query(
    "UPDATE items SET name=?, category_id=? WHERE id=?",
    [name, category_id, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Item Updated" });
    }
  );
});

// UPDATE VARIANT
app.put("/variant/:id", (req, res) => {
  const { name, price } = req.body;

  db.query(
    "UPDATE variants SET name=?, price=? WHERE id=?",
    [name, price, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Variant Updated" });
    }
  );
});

/* =========================
   🔥 ORDER SYSTEM
========================= */

// 🔹 CREATE ORDER
app.post("/order", (req, res) => {
  const { items, total, table_no } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cart empty" });
  }

  db.query(
    `INSERT INTO orders 
     (items, total, table_no, status, is_paid, is_billed, is_active)
     VALUES (?, ?, ?, 'pending', 0, 0, 1)`,
    [JSON.stringify(items), total, table_no],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Order Created ✅" });
    }
  );
});

// 🔹 GET ACTIVE ORDERS
app.get("/orders", (req, res) => {
  db.query(
    "SELECT * FROM orders WHERE is_active=1 ORDER BY id DESC",
    (err, data) => {
      if (err) return res.status(500).json(err);
      res.json(data);
    }
  );
});

// 🔹 UPDATE STATUS (pending → preparing → done)
app.put("/order/:id", (req, res) => {
  db.query(
    "UPDATE orders SET status=? WHERE id=?",
    [req.body.status, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Status Updated" });
    }
  );
});

/* =========================
   🔥 TABLE LOGIC
========================= */

// 🔹 CHECK TABLE STATUS
app.get("/table-status/:tableNo", (req, res) => {
  const tableNo = req.params.tableNo;

  db.query(
    "SELECT * FROM orders WHERE table_no=? AND is_paid=0 AND is_active=1",
    [tableNo],
    (err, data) => {
      if (err) return res.status(500).json(err);

      const hasOrders = data.length > 0;
      const allDone = hasOrders && data.every(o => o.status === "done");

      res.json({ hasOrders, allDone });
    }
  );
});

/* =========================
   🔥 BILLING
========================= */

// 🔹 MARK BILL GENERATED
app.put("/mark-billed/:tableNo", (req, res) => {
  db.query(
    `UPDATE orders 
     SET is_billed=1 
     WHERE table_no=? AND is_paid=0 AND is_active=1`,
    [req.params.tableNo],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Bill Generated ✅" });
    }
  );
});

/* =========================
   🔥 PAYMENT SYSTEM
========================= */

// 🔹 FINAL PAYMENT
app.put("/pay-table/:tableNo", (req, res) => {
  const tableNo = req.params.tableNo;

  db.query(
    `UPDATE orders 
     SET is_paid=1, status='paid'
     WHERE table_no=? AND is_active=1`,
    [tableNo],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Payment Done ✅" });
    }
  );
});

// 🔹 CLEAR TABLE (ARCHIVE, NOT DELETE)
app.put("/clear-table/:tableNo", (req, res) => {
  const tableNo = req.params.tableNo;

  db.query(
    `UPDATE orders 
     SET is_active=0 
     WHERE table_no=?`,
    [tableNo],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Table Cleared ✅" });
    }
  );
});


// 🔥 PAY + CLEAR (FINAL API - USE THIS)
app.put("/pay-and-clear/:tableNo", (req, res) => {
  const tableNo = req.params.tableNo;

  db.query(
    `UPDATE orders 
     SET is_paid = 1, status = 'paid', is_active = 0
     WHERE table_no = ?`,
    [tableNo],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Payment Done + Table Cleared ✅" });
    }
  );
});

/* =========================
   🔥 DASHBOARD STATS
========================= */

app.get("/stats", (req, res) => {
  db.query(
    `SELECT 
      COUNT(*) AS totalOrders,
      SUM(total) AS revenue
     FROM orders WHERE is_paid=1`,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
});

/* ========================= */

app.listen(5000, () => {
  console.log("🚀 POS Server Running on port 5000");
});