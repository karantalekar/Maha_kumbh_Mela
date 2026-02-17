// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// export default function AdminUserDetails() {
//   const { id } = useParams();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("adminToken");

//     axios
//       .get(`http://localhost:3000/api/admin/user/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setUser(res.data))
//       .catch((err) => console.error(err));
//   }, [id]);

//   if (!user) return <p>Loading...</p>;

//   return (
//     <div className="container mt-4">
//       <h2>User Details</h2>
//       <p>
//         <strong>Name:</strong> {user.username || user.name}
//       </p>
//       <p>
//         <strong>Email:</strong> {user.email}
//       </p>
//       <p>
//         <strong>Aadhaar:</strong> {user.aadhaar}
//       </p>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("http://localhost:3000");

export default function AdminUserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [locations, setLocations] = useState([]);

  // Fetch user info
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    axios
      .get(`http://localhost:3000/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  // Listen to live location updates
  useEffect(() => {
    if (!user) return;

    // Join user's room
    socket.emit("join", id);

    const handleLocation = (loc) => {
      setLocations((prev) => [...prev, loc]);
    };

    socket.on("liveLocation", handleLocation);

    return () => {
      socket.off("liveLocation", handleLocation);
    };
  }, [user, id]);

  if (!user) return <p>Loading user details...</p>;

  return (
    <div className="container mt-3">
      <h2>User Details</h2>
      <div className="card shadow-sm p-3 mb-3">
        <h5>{user.username || user.name}</h5>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Aadhaar:</strong> {user.aadhaar}
        </p>
        <p>
          <strong>Status:</strong> {user.status || "Active"}
        </p>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">Live Location Updates</div>
        <ul
          className="list-group list-group-flush"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {locations.length === 0 && (
            <li className="list-group-item">No location updates yet.</li>
          )}
          {locations.map((loc, idx) => (
            <li key={idx} className="list-group-item">
              <strong>Time:</strong>{" "}
              {new Date(loc.timestamp || Date.now()).toLocaleTimeString()} |{" "}
              <strong>Lat:</strong> {loc.latitude.toFixed(5)} |{" "}
              <strong>Lng:</strong> {loc.longitude.toFixed(5)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
