import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminProfile() {
  const [profile, setProfile] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    axios
      .get(`${API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      });
  }, [token, navigate]);

  const updateProfile = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/api/admin/profile`,
        profile,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Profile updated successfully");
      setProfile(res.data);
    } catch {
      alert("Failed to update profile");
    }
  };

  const changePassword = async () => {
    try {
      await axios.put(
        `${API_URL}/api/admin/change-password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Password changed successfully");
      setPasswordData({ oldPassword: "", newPassword: "" });
    } catch {
      alert("Failed to change password");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center">
        <h3>Admin Profile</h3>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <hr />

      {/* Update Profile */}
      <div className="card p-3 mb-4 shadow-sm">
        <h5>Update Info</h5>

        <input
          className="form-control mb-2"
          placeholder="Username"
          value={profile.username || ""}
          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
        />

        <input
          className="form-control mb-2"
          placeholder="Email"
          value={profile.email || ""}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />

        <button className="btn btn-primary" onClick={updateProfile}>
          Update Profile
        </button>
      </div>

      {/* Change Password */}
      <div className="card p-3 shadow-sm">
        <h5>Change Password</h5>

        <input
          type="password"
          className="form-control mb-2"
          placeholder="Old Password"
          value={passwordData.oldPassword}
          onChange={(e) =>
            setPasswordData({ ...passwordData, oldPassword: e.target.value })
          }
        />

        <input
          type="password"
          className="form-control mb-2"
          placeholder="New Password"
          minLength={8}
          value={passwordData.newPassword}
          onChange={(e) =>
            setPasswordData({ ...passwordData, newPassword: e.target.value })
          }
        />

        <button className="btn btn-danger" onClick={changePassword}>
          Change Password
        </button>
      </div>
    </div>
  );
}
