import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function Menu() {
  const [groupedMenu, setGroupedMenu] = useState({});
  const [cart, setCart] = useState([]);
  const [tableNo, setTableNo] = useState(1);
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 LOAD MENU
  useEffect(() => {
    loadMenu();

    const saved = localStorage.getItem("table");
    if (saved) setTableNo(Number(saved));
  }, []);

  const loadMenu = () => {
    setLoading(true);

    axios.get("http://localhost:5000/menu-full")
      .then(res => {
        setGroupedMenu(groupMenu(res.data));
      })
      .catch(err => {
        console.log(err);
        alert("Menu load failed ❌");
      })
      .finally(() => setLoading(false));
  };

  // 🔥 GROUP MENU
  const groupMenu = (data) => {
    const grouped = {};
    data.forEach(row => {
      const cat = row.category || "Others";
      const item = row.item_name || "Item";

      if (!grouped[cat]) grouped[cat] = {};
      if (!grouped[cat][item]) grouped[cat][item] = [];

      grouped[cat][item].push({
        id: row.variant_id,
        variant: row.variant_name,
        price: Number(row.price)
      });
    });
    return grouped;
  };

  // 🔥 ADD TO CART
  const addToCart = (itemName, variant) => {
    const exist = cart.find(i => i.id === variant.id);

    if (exist) {
      setCart(cart.map(i =>
        i.id === variant.id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      setCart([
        ...cart,
        {
          id: variant.id,
          name: `${itemName} (${variant.variant})`,
          price: variant.price,
          qty: 1
        }
      ]);
    }
  };

  // 🔥 CHANGE QTY
  const changeQty = (id, type) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        if (type === "inc") return { ...i, qty: i.qty + 1 };
        if (type === "dec" && i.qty > 1) return { ...i, qty: i.qty - 1 };
      }
      return i;
    }));
  };

  // 🔥 REMOVE ITEM
  const removeItem = (id) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // 🔥 PLACE ORDER
  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart empty ❌");

    try {
      await axios.post("http://localhost:5000/order", {
        items: cart,
        total: totalPrice,
        table_no: tableNo
      });

      alert(`✅ Order placed (Table ${tableNo})`);
      setCart([]);
      setShowCart(false);

    } catch (err) {
      console.log(err);
      alert("Order Failed ❌");
    }
  };

  return (
    <div className="container mt-3">

      {/* HEADER */}
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">🍽️ POS System</h4>

        <div className="d-flex gap-2 align-items-center">

          {/* TABLE SELECT */}
          <select
            className="form-select"
            value={tableNo}
            onChange={(e) => {
              const val = Number(e.target.value);
              setTableNo(val);
              localStorage.setItem("table", val);
            }}
          >
            {[1,2,3,4,5,6].map(t => (
              <option key={t} value={t}>Table {t}</option>
            ))}
          </select>

          {/* CART */}
          <button className="cart-btn" onClick={() => setShowCart(true)}>
            🛒 {totalQty}
          </button>

        </div>
      </div>

      {/* SEARCH */}
      <input
        className="form-control mb-3"
        placeholder="🔍 Search food..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LOADING */}
      {loading && <p>Loading menu...</p>}

      {/* MENU */}
      {!loading && Object.keys(groupedMenu).map(cat => (
        <div key={cat}>
          <h5 className="category-title">🍴 {cat}</h5>

          <div className="menu-grid">
            {Object.keys(groupedMenu[cat]).map(item => {

              if (!item.toLowerCase().includes(search.toLowerCase()))
                return null;

              return (
                <div key={item} className="menu-card">

                  <h6 className="fw-bold">{item}</h6>

                  {groupedMenu[cat][item].map(v => (
                    <div key={v.id} className="variant-row">

                      <span>{v.variant} - ₹{v.price}</span>

                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => addToCart(item, v)}
                      >
                        Add
                      </button>

                    </div>
                  ))}

                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* CART MODAL */}
      {showCart && (
        <div className="cart-modal">
          <div className="cart-box">

            <h5>🛒 Cart (Table {tableNo})</h5>

            {cart.length === 0 && <p>No items</p>}

            {cart.map(item => (
              <div key={item.id} className="cart-item">

                <span>{item.name}</span>

                <div className="qty-box">
                  <button onClick={() => changeQty(item.id, "dec")}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, "inc")}>+</button>
                </div>

                <span>₹{item.price * item.qty}</span>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(item.id)}
                >
                  X
                </button>

              </div>
            ))}

            <hr />

            <h5>Total: ₹{totalPrice}</h5>

            <button className="btn btn-success w-100 mt-2" onClick={placeOrder}>
              ✅ Place Order
            </button>

            <button
              className="btn btn-secondary w-100 mt-2"
              onClick={() => setShowCart(false)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Menu;