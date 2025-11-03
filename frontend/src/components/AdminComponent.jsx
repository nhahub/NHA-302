import { Outlet } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

function AdminComponent() {
  return (
    <div>
      
      <AdminDashboard />
      <Outlet />
    </div>
  );
}

export default AdminComponent;
