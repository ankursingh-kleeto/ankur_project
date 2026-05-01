import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Menu from "./components/Menu";
import Admin from "./components/Admin";
import Dashboard from "./components/Dashboard";
import MenuAdmin from "./components/MenuAdmin";
import Billing from "./components/Billing";
import MenuControl from "./components/MenuControl";

function App() {
  return (
    <BrowserRouter>

      {/* 🔥 Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">

        {/* ❌ a tag हटाओ → NavLink use करो */}
        <NavLink className="navbar-brand" to="/">
          🍽️ Smart Works
        </NavLink>

        <div className="navbar-nav">

          <NavLink
            to="/"
            className={({ isActive }) =>
              "nav-link " + (isActive ? "active fw-bold text-warning" : "")
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/menu-admin"
            className={({ isActive }) =>
              "nav-link " + (isActive ? "active fw-bold text-warning" : "")
            }
          >
            Menu Control
          </NavLink>

          <NavLink
            to="/menu"
            className={({ isActive }) =>
              "nav-link " + (isActive ? "active fw-bold text-warning" : "")
            }
          >
            Customer Menu
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              "nav-link " + (isActive ? "active fw-bold text-warning" : "")
            }
          >
            Orders
          </NavLink>

          <NavLink
            to="/billing"
            className={({ isActive }) =>
              "nav-link " + (isActive ? "active fw-bold text-warning" : "")
            }
          >
            Billing
          </NavLink>

        </div>
      </nav>

      {/* 🔥 Pages */}
      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/menu-admin" element={<MenuAdmin />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/orders" element={<Admin />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/menu-control" element={<MenuControl />} />
        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;