import React, { useEffect, useState } from "react";
import axios from "axios";

function MenuAdmin() {
  const [menu, setMenu] = useState([]);

  const [form, setForm] = useState({
    category: "",
    subcategory: "",
    name: "",
    variant_name: "",   // 🔥 NEW
    price: ""
  });

  const [editId, setEditId] = useState(null);

  const fetchMenu = () => {
    axios.get("http://localhost:5000/menu")
      .then(res => setMenu(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // 🔥 ADD / UPDATE
  const handleSubmit = () => {
    if (!form.name || !form.category || !form.variant_name || !form.price) {
      alert("Fill all required fields ❌");
      return;
    }

    if (editId) {
      axios.put(`http://localhost:5000/menu/${editId}`, form)
        .then(() => {
          fetchMenu();
          resetForm();
        });
    } else {
      axios.post("http://localhost:5000/menu", form)
        .then(() => {
          fetchMenu();
          resetForm();
        });
    }
  };

  // 🔥 DELETE
  const deleteItem = (id) => {
    axios.delete(`http://localhost:5000/menu/${id}`)
      .then(() => fetchMenu());
  };

  // 🔥 EDIT
  const editItem = (item) => {
    setForm({
      category: item.category,
      subcategory: item.subcategory,
      name: item.name,
      variant_name: item.variant_name || "", // 🔥 NEW
      price: item.price
    });

    setEditId(item.id);
  };

  // 🔥 RESET
  const resetForm = () => {
    setForm({
      category: "",
      subcategory: "",
      name: "",
      variant_name: "",
      price: ""
    });

    setEditId(null);
  };

  return (
    <div className="container mt-3">

      <h3>🍽️ Menu Control (Advanced)</h3>

      {/* 🔥 FORM */}
      <div className="row mb-3">

        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Category (Indian)"
            value={form.category}
            onChange={(e)=>setForm({...form,category:e.target.value})}
          />
        </div>

        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Sub (Gravy)"
            value={form.subcategory}
            onChange={(e)=>setForm({...form,subcategory:e.target.value})}
          />
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Item (Paneer Butter Masala)"
            value={form.name}
            onChange={(e)=>setForm({...form,name:e.target.value})}
          />
        </div>

        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Variant (Half / Full)"
            value={form.variant_name}
            onChange={(e)=>setForm({...form,variant_name:e.target.value})}
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Price"
            value={form.price}
            onChange={(e)=>setForm({...form,price:e.target.value})}
          />
        </div>

        <div className="col-md-1">
          <button className="btn btn-success w-100" onClick={handleSubmit}>
            {editId ? "Update" : "+"}
          </button>
        </div>
      </div>

      {/* CANCEL */}
      {editId && (
        <button className="btn btn-secondary mb-2" onClick={resetForm}>
          Cancel Edit
        </button>
      )}

      {/* 🔥 TABLE */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Category</th>
            <th>Sub</th>
            <th>Item</th>
            <th>Variant</th> {/* 🔥 NEW */}
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {menu.map(i => (
            <tr key={i.id}>
              <td>{i.category}</td>
              <td>{i.subcategory}</td>
              <td>{i.name}</td>
              <td>{i.variant_name || "-"}</td> {/* 🔥 */}
              <td>₹ {i.price}</td>

              <td className="d-flex gap-2">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={()=>editItem(i)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={()=>deleteItem(i.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default MenuAdmin;