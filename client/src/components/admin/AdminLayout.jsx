// src/pages/admin/AdminLayout.jsx
import React from "react";
import AdminNavbar from "../../components/admin/AdminNavbar.jsx";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
