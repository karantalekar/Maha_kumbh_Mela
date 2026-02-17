import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserTracking from "./pages/UserTracking";
import AdminDashboard from "./pages/AdminDashboard";
import TrackUser from "./pages/TrackUser";
import AdminProfile from "./pages/AdminProfile";
import AdminLogin from "./pages/AdminLogin";
import PrivateRoute from "./components/PrivateRoute";
import AdminRegister from "./pages/AdminRegister";
import AdminUserDetails from "./pages/AdminUserDetails.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<UserTracking />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin/user/:id" element={<AdminUserDetails />} />
        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <PrivateRoute>
              <AdminProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/track/:id"
          element={
            <PrivateRoute>
              <TrackUser />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
