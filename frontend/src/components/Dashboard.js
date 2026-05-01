import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const tables = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = () => {
    axios.get("http://localhost:5000/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.log(err));
  };

  // 🔥 GROUP BY TABLE
  const groupByTable = () => {
    const grouped = {};
    tables.forEach(t => grouped[t] = []);

    orders.forEach(o => {
      const table = Number(o.table_no);
      if (!table) return;

      if (!grouped[table]) grouped[table] = [];
      grouped[table].push(o);
    });

    return grouped;
  };

  const groupedOrders = groupByTable();

  // 🔥 STATUS
  const getStatus = (orders) => {
    if (orders.length === 0) return "free";

    const hasPreparing = orders.some(o => o.status === "preparing");
    const hasPending = orders.some(o => o.status === "pending");
    const allDone = orders.every(o => o.status === "done");
    const allPaid = orders.every(o => o.status === "paid");

    if (allPaid) return "paid";
    if (allDone) return "done";
    if (hasPreparing) return "preparing";
    if (hasPending) return "occupied";

    return "occupied";
  };

  // 🔥 COLOR
  const getColor = (status) => {
    switch (status) {
      case "free": return "bg-success";
      case "occupied": return "bg-danger";
      case "preparing": return "bg-warning text-dark";
      case "done": return "bg-primary";
      case "paid": return "bg-secondary";
      default: return "bg-dark";
    }
  };

  // 🔥 EXTRACT ITEMS (IMPORTANT FIX)
  const getItems = (tableOrders) => {
    let items = [];

    tableOrders.forEach(order => {
      try {
        const parsed = typeof order.items === "string"
          ? JSON.parse(order.items)
          : order.items;

        parsed.forEach(i => {
          items.push(i.name);
        });

      } catch {}
    });

    return items;
  };

  const goToMenu = (table) => {
    localStorage.setItem("table", table);
    navigate("/menu");
  };

  const goToBilling = (table) => {
    localStorage.setItem("billingTable", table);
    navigate("/billing");
  };

  return (
    <div className="container mt-4">

      <h3 className="text-center mb-4">📊 Smart POS Dashboard</h3>

      <div className="row">

        {tables.map(table => {
          const tableOrders = groupedOrders[table];
          const status = getStatus(tableOrders);
          const items = getItems(tableOrders);

          return (
            <div key={table} className="col-md-4 col-6 mb-3">

              <div
                className={`card text-white ${getColor(status)} shadow`}
                style={{
                  borderRadius: "15px",
                  height: "220px" // 🔥 FIXED HEIGHT
                }}
              >

                <div className="card-body d-flex flex-column">

                  {/* 🔥 HEADER */}
                  <div className="d-flex justify-content-between">
                    <h5>🍽️ Table {table}</h5>
                    <span className="badge bg-light text-dark">
                      {status.toUpperCase()}
                    </span>
                  </div>

                  {/* 🔥 ITEMS (GRID STYLE) */}
                  <div
                    className="mt-2"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr", // 🔥 2 column
                      gap: "4px",
                      fontSize: "12px"
                    }}
                  >
                    {items.map((name, i) => (
                      <div key={i}>
                        {i + 1}. {name}
                      </div>
                    ))}
                  </div>

                  <hr className="my-1" />

                  {/* 🔥 ACTIONS */}
                  <div className="d-flex justify-content-between">

                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => goToMenu(table)}
                    >
                      Order
                    </button>

                    {status === "done" && (
                      <button
                        className="btn btn-dark btn-sm"
                        onClick={() => goToBilling(table)}
                      >
                        Bill
                      </button>
                    )}

                    {status === "paid" && (
                      <span className="badge bg-dark">Paid</span>
                    )}

                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Dashboard;