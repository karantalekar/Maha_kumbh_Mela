import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    secret: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:3000/api/admin/register-admin",
        formData,
      );

      alert("Admin Registered Successfully");
      navigate("/admin/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Registration</h2>
        <p style={styles.subtitle}>Create an administrator account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            autoComplete="new-password"
          />

          <input
            type="text"
            name="secret"
            placeholder="Admin Secret Key"
            required
            value={formData.secret}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating Account..." : "Register Admin"}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/admin/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "15px",
    width: "400px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    marginBottom: "5px",
  },
  subtitle: {
    color: "#777",
    fontSize: "14px",
    marginBottom: "25px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#1e3c72",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  loginText: {
    marginTop: "20px",
    fontSize: "14px",
  },
  link: {
    color: "#1e3c72",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
