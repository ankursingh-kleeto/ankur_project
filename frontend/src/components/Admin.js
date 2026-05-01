import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // 🔥 Fetch orders
  const fetchOrders = () => {
    axios.get("http://localhost:5000/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.log(err));
  };

useEffect(() => {
  fetchOrders();

  const interval = setInterval(() => {
    fetchOrders();
  }, 3000); // auto refresh

  return () => clearInterval(interval);
}, []);

  // 🔥 Update status
  const updateStatus = (id, status) => {
    axios.put(`http://localhost:5000/order/${id}`, { status })
      .then(() => fetchOrders())
      .catch(err => console.log(err));
  };

  // 🔥 SAFE GROUP ITEMS (FIXED)
  const groupItems = (items) => {
    const grouped = {};

    items.forEach(item => {
      const name = item.name;
      const qty = item.qty ? Number(item.qty) : 1;

      if (!grouped[name]) {
        grouped[name] = {
          name,
          price: item.price,
          qty,
          total: item.price * qty
        };
      } else {
        grouped[name].qty += qty;
        grouped[name].total += item.price * qty;
      }
    });

    return Object.values(grouped);
  };

  // 🔥 GROUP BY TABLE
  const groupByTable = (orders) => {
    const grouped = {};

    orders.forEach(order => {
      const table = order.table_no || "0";

      if (!grouped[table]) grouped[table] = [];
      grouped[table].push(order);
    });

    return grouped;
  };

  const groupedOrders = groupByTable(orders);

  // 🔥 SAFE BILL GENERATION (IMPORTANT FIX)
  const goToBilling = (tableNo) => {
    const tableOrders = groupedOrders[tableNo] || [];

    let allItems = [];

    tableOrders.forEach(order => {
      try {
        const items =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items || [];

        allItems = [...allItems, ...items];
      } catch (err) {
        console.log("Parse error:", err);
      }
    });

    if (allItems.length === 0) {
      alert("No items found for billing!");
      return;
    }

    const billData = {
      table_no: tableNo,
      items: allItems,
    };

    localStorage.setItem("billOrder", JSON.stringify(billData));

    navigate("/billing");
  };

  return (
    <div className="container mt-4">

      <h3 className="mb-4">📋 Admin Panel</h3>

      {Object.keys(groupedOrders).map(table => (
        <div key={table} className="mb-4">

          {/* TABLE HEADER */}
          <h4 className="bg-dark text-white p-2 rounded">
            🪑 Table {table}
          </h4>

          {groupedOrders[table].map(order => {

            let items = [];

            try {
              items =
                typeof order.items === "string"
                  ? JSON.parse(order.items)
                  : order.items || [];
            } catch {
              items = [];
            }

            const groupedItems = groupItems(items);

            return (
              <div key={order.id} className="card shadow-sm p-3 mb-2">

                {/* HEADER */}
                <div className="d-flex justify-content-between">
                  <b>Order ID: {order.id}</b>

                  <small className="text-muted">
                    {new Date(order.created_at)
                      .toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                  </small>
                </div>

                <hr />

                {/* ITEMS */}
                {groupedItems.map((item, i) => (
                  <div key={i}>
                    🍽️ <b>{item.name}</b> × {item.qty}
                    <span className="text-muted">
                      {" "} (₹ {item.total})
                    </span>
                  </div>
                ))}

                <hr />

                {/* FOOTER */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

                  <div>
                    <b>Total:</b> ₹ {order.total}
                  </div>

                  {/* STATUS */}
                  <span className={
                    order.status === "pending" ? "badge bg-danger" :
                    order.status === "preparing" ? "badge bg-warning text-dark" :
                    order.status === "done" ? "badge bg-success" :
                    "badge bg-secondary"
                  }>
                    {order.status}
                  </span>

                  {/* UPDATE STATUS */}
                  <select
                    className="form-select w-auto"
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value)
                    }
                  >
                    <option>Change</option>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="done">Done</option>
                  </select>

                </div>

              </div>
            );
          })}

          {/* 🔥 SINGLE BILL BUTTON PER TABLE */}
          <button
            className="btn btn-primary mt-2"
            onClick={() => goToBilling(table)}
          >
            💰 Generate Bill (Table {table})
          </button>

        </div>
      ))}

    </div>
  );
}

export default Admin;