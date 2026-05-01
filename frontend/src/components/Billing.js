import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Billing() {
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState({});
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("cash");

  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("billOrder")) || {};
    setOrder(data);

    let items = [];

    try {
      items =
        typeof data.items === "string"
          ? JSON.parse(data.items)
          : data.items || [];
    } catch {
      items = [];
    }

    const formatted = items.map((i) => ({
      ...i,
      qty: i.qty || 1,
      discount: i.discount || 0,
    }));

    setCart(formatted);
  }, []);

  // 🔥 item discount update
  const updateItemDiscount = (index, value) => {
    const newCart = [...cart];
    newCart[index].discount = Number(value);
    setCart(newCart);
  };

  // 🔥 calculations
  const subtotal = cart.reduce((sum, i) => {
    const total = i.price * i.qty;
    const disc = (total * i.discount) / 100;
    return sum + (total - disc);
  }, 0);

  const overallDiscAmt = (subtotal * overallDiscount) / 100;
  const taxable = subtotal - overallDiscAmt;

  const cgst = taxable * 0.025;
  const sgst = taxable * 0.025;

  const finalTotal = taxable + cgst + sgst;

  // 🔥 FINAL PAYMENT (FIXED)
  const handlePayment = async () => {
    try {
      const tableNo = order.table_no;

      if (!tableNo) {
        alert("Table number missing ❌");
        return;
      }

      console.log("PAYING TABLE:", tableNo);

      await axios.put(
        `http://localhost:5000/pay-and-clear/${tableNo}`
      );

      alert("Payment Successful & Table Cleared ✅");

      // 🔥 CLEAR LOCAL DATA
      localStorage.removeItem("billOrder");

      // 🔥 IMPORTANT (React navigation use karo)
      navigate("/");

    } catch (err) {
      console.log(err);
      alert("Payment Failed ❌");
    }
  };

  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="text-center mb-4">
        <h2>🧾 Billing System</h2>
        <p>Table: <b>{order.table_no}</b></p>
      </div>

      <div className="row">

        {/* LEFT */}
        <div className="col-md-8">
          <div className="card p-3 shadow-sm">

            <h5>🍽️ Items</h5>

            <table className="table table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Discount %</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item, i) => {
                  const total = item.price * item.qty;
                  const disc = (total * item.discount) / 100;
                  const final = total - disc;

                  return (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>₹{item.price}</td>

                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={item.discount}
                          onChange={(e) =>
                            updateItemDiscount(i, e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <b>₹{final.toFixed(2)}</b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

          </div>
        </div>

        {/* RIGHT */}
        <div className="col-md-4">
          <div className="card p-3 shadow-sm sticky-top" style={{ top: "10px" }}>

            <h5>💰 Bill Summary</h5>

            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <b>₹{subtotal.toFixed(2)}</b>
            </div>

            <div className="mt-2">
              <label>Overall Discount %</label>
              <input
                type="number"
                className="form-control"
                value={overallDiscount}
                onChange={(e) =>
                  setOverallDiscount(Number(e.target.value))
                }
              />
            </div>

            <div className="d-flex justify-content-between mt-2">
              <span>Discount</span>
              <span className="text-danger">
                -₹{overallDiscAmt.toFixed(2)}
              </span>
            </div>

            <hr />

            <div className="d-flex justify-content-between">
              <span>CGST (2.5%)</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between">
              <span>SGST (2.5%)</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between fs-5">
              <b>Total</b>
              <b className="text-success">
                ₹{finalTotal.toFixed(2)}
              </b>
            </div>

            <div className="mt-3">
              <label>Payment Mode</label>
              <select
                className="form-select"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <button
              className="btn btn-success w-100 mt-3"
              onClick={handlePayment}
            >
              💳 Pay Now
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Billing;