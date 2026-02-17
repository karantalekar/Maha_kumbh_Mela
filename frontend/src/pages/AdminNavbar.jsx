import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const nav = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    nav("/admin/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        background: "#2c3e50",
        color: "#fff",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "18px" }}>Admin Panel</div>

      <div style={{ display: "flex", gap: "15px" }}>
        <Link
          to="/admin/dashboard"
          style={{ color: "#fff", textDecoration: "none" }}
        >
          Dashboard
        </Link>
        {/* <Link
          to="/admin/users"
          style={{ color: "#fff", textDecoration: "none" }}
        >
          Users
        </Link> */}
        <button
          onClick={handleLogout}
          style={{
            background: "#e74c3c",
            border: "none",
            padding: "5px 10px",
            borderRadius: "5px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
