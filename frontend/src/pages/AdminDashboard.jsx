// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function AdminDashboard() {
//   const [users, setUsers] = useState([]);
//   const nav = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("adminToken");
//     // console.log("Token being sent ", token);
//     axios
//       .get("http://localhost:3000/api/admin/users", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       .then((res) => setUsers(res.data))
//       .catch((err) => {
//         alert("Unauthorized. Please login again.", err);
//         nav("/admin/login");
//       });
//   }, [nav]);

//   const logout = () => {
//     localStorage.removeItem("adminToken");
//     nav("/admin/login");
//   };

//   return (
//     <div className="container mt-4">
//       <div className="d-flex justify-content-between align-items-center">
//         <h2>Admin Panel</h2>
//         <button className="btn btn-danger" onClick={logout}>
//           Logout
//         </button>
//       </div>

//       <hr />

//       {users.length === 0 ? (
//         <p>No users found.</p>
//       ) : (
//         users.map((u) => (
//           <div key={u._id} className="card p-3 mb-2">
//             <h5>{u.username || u.name}</h5>

//             <div className="d-flex gap-2">
//               <button
//                 className="btn btn-success"
//                 onClick={() => nav(`/track/${u._id}`)}
//               >
//                 Track
//               </button>

//               <button
//                 className="btn btn-primary"
//                 onClick={() => nav(`/admin/user/${u._id}`)}
//               >
//                 View Details
//               </button>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      nav("/admin/login");
      return;
    }

    axios
      .get("http://localhost:3000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error(
          "Unauthorized or server error:",
          err.response?.data || err,
        );
        alert("Unauthorized. Please login again.");
        nav("/admin/login");
      });
  }, [nav]);

  // const logout = () => {
  //   localStorage.removeItem("adminToken");
  //   nav("/admin/login");
  // };

  return (
    <>
      <AdminNavbar />

      <div className="container mt-4">
        {/* <div className="d-flex justify-content-between align-items-center">
          <h2>Admin Panel</h2>
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div> */}

        <hr />

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((u) => (
            <div key={u._id} className="card p-3 mb-2">
              <h5>{u.username || u.name}</h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-success"
                  onClick={() => nav(`/track/${u._id}`)}
                >
                  Track
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => nav(`/admin/user/${u._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
