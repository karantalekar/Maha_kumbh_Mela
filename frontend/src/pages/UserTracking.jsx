// import { useState } from "react";
// import axios from "axios";
// import { io } from "socket.io-client";
// import "bootstrap/dist/css/bootstrap.min.css";

// const socket = io("http://localhost:3000");

// export default function UserTracking() {
//   const [form, setForm] = useState({ username: "", email: "", aadhaar: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const submit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");

//     try {
//       const res = await axios.post(
//         "http://localhost:3000/api/users/register",
//         form,
//       );

//       setSuccess("Registered successfully! Live location tracking started.");
//       const userId = res.data._id;

//       socket.emit("join", userId);

//       if ("geolocation" in navigator) {
//         navigator.geolocation.watchPosition(
//           (pos) => {
//             socket.emit("sendLocation", {
//               userId,
//               latitude: pos.coords.latitude,
//               longitude: pos.coords.longitude,
//             });
//           },
//           (err) => {
//             setError("Failed to get location. Enable GPS.");
//           },
//           { enableHighAccuracy: true, maximumAge: 0 },
//         );
//       } else {
//         setError("Geolocation not supported in your browser.");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
//       <div className="card p-4 shadow" style={{ minWidth: "350px" }}>
//         <h3 className="mb-3 text-center">Share Live Location</h3>

//         {error && <div className="alert alert-danger">{error}</div>}
//         {success && <div className="alert alert-success">{success}</div>}

//         <form onSubmit={submit} className="d-flex flex-column gap-3">
//           <div className="form-group">
//             <label>Name</label>
//             <input
//               className="form-control"
//               placeholder="Enter your name"
//               value={form.username}
//               onChange={(e) => setForm({ ...form, username: e.target.value })}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Email</label>
//             <input
//               className="form-control"
//               placeholder="Enter your email"
//               type="email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Aadhaar</label>
//             <input
//               className="form-control"
//               placeholder="Enter your Aadhaar"
//               value={form.aadhaar}
//               onChange={(e) => setForm({ ...form, aadhaar: e.target.value })}
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="btn btn-primary mt-2"
//             disabled={loading}
//           >
//             {loading ? "Processing..." : "Accept & Start"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

export default function UserTracking() {
  const [form, setForm] = useState({ username: "", email: "", aadhaar: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/users/register",
        form,
      );

      setSuccess("Registered successfully! Live location tracking started.");
      const userId = res.data._id;

      socket.emit("join", userId);

      if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
          (pos) => {
            socket.emit("sendLocation", {
              userId,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          () => {
            setError("Failed to get location. Enable GPS.");
          },
          { enableHighAccuracy: true, maximumAge: 0 },
        );
      } else {
        setError("Geolocation not supported in your browser.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const goToAdminLogin = () => {
    navigate("/admin/login"); // or window.location.href = "/admin-login";
  };

  return (
    <div className="position-relative vh-100 bg-light d-flex justify-content-center align-items-center">
      {/* Admin Login button at top-right corner of the page */}
      <button
        className="btn btn-secondary position-absolute"
        style={{ top: "20px", right: "20px" }}
        onClick={goToAdminLogin}
      >
        Admin Login
      </button>

      {/* Registration Card */}
      <div className="card p-4 shadow" style={{ minWidth: "350px" }}>
        <h3 className="mb-3 text-center">Share Live Location</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={submit} className="d-flex flex-column gap-3 mt-3">
          <div className="form-group">
            <label>Name</label>
            <input
              className="form-control"
              placeholder="Enter your name"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              className="form-control"
              placeholder="Enter your email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Aadhaar</label>
            <input
              className="form-control"
              placeholder="Enter your Aadhaar"
              value={form.aadhaar}
              onChange={(e) => setForm({ ...form, aadhaar: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-2"
            disabled={loading}
          >
            {loading ? "Processing..." : "Accept & Start"}
          </button>
        </form>
      </div>
    </div>
  );
}
