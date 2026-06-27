// import AdminNavbar from "./AdminNavbar"; // your navbar
// import { useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import L from "leaflet";
// import { useParams } from "react-router-dom";

// const socket = io("http://localhost:3000");

// export default function TrackUser() {
//   const { id } = useParams();
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);
//   const lineRef = useRef(null);

//   useEffect(() => {
//     if (mapRef.current) mapRef.current.remove();

//     mapRef.current = L.map("map").setView([20.59, 78.96], 5);
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: "&copy; OpenStreetMap contributors",
//     }).addTo(mapRef.current);

//     lineRef.current = L.polyline([]).addTo(mapRef.current);

//     socket.emit("join", id);

//     const handleLocation = (loc) => {
//       const pos = [loc.latitude, loc.longitude];
//       lineRef.current.addLatLng(pos);

//       if (!markerRef.current) {
//         markerRef.current = L.marker(pos).addTo(mapRef.current);
//       } else {
//         markerRef.current.setLatLng(pos);
//       }

//       mapRef.current.setView(pos, 15);
//     };

//     socket.on("liveLocation", handleLocation);

//     return () => {
//       socket.off("liveLocation", handleLocation);
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//       markerRef.current = null;
//       lineRef.current = null;
//     };
//   }, [id]);

//   return (
//     <>
//       <AdminNavbar />
//       <div id="map" style={{ height: "90vh", marginTop: "10px" }} />
//     </>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import L from "leaflet";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { API_URL } from "../config";

const socket = io(API_URL);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function TrackUser() {
  const { id } = useParams(); // user ID from route
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const lineRef = useRef(null);
  const userNameRef = useRef("User");
  const [message, setMessage] = useState("Loading tracking data...");
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize map if not already
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20.59, 78.96], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      lineRef.current = L.polyline([], { color: "blue" }).addTo(mapRef.current);
      setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }

    // Join Socket.IO room for this user
    socket.emit("join", id);

    const getPopupName = (loc) =>
      loc.username || loc.name || userNameRef.current || "User";

    // Handle live location updates
    const handleLocation = (loc) => {
      if (!loc?.latitude || !loc?.longitude || !mapRef.current || !lineRef.current) {
        return;
      }

      const pos = [loc.latitude, loc.longitude];
      const popupName = getPopupName(loc);

      // Add to polyline
      lineRef.current.addLatLng(pos);

      // Add or update marker
      if (!markerRef.current) {
        markerRef.current = L.marker(pos).addTo(mapRef.current);
        markerRef.current.bindPopup(`<b>${popupName}</b>`).openPopup();
      } else {
        markerRef.current.setLatLng(pos);
        markerRef.current.getPopup().setContent(`<b>${popupName}</b>`);
      }

      // Center map on the user
      mapRef.current.setView(pos, 15);
      setMessage("Live location connected");
      setError("");
    };

    const loadHistory = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get(`${API_URL}/api/admin/user/${id}`, {
          headers,
        });
        userNameRef.current =
          userRes.data.username || userRes.data.name || userRes.data.email || "User";

        const locationsRes = await axios.get(
          `${API_URL}/api/admin/locations/${id}`,
          { headers },
        );

        const points = locationsRes.data
          .filter((loc) => loc.latitude && loc.longitude)
          .map((loc) => [loc.latitude, loc.longitude]);

        if (!points.length) {
          setMessage("Waiting for this user's first location update...");
          return;
        }

        lineRef.current.setLatLngs(points);
        const latest = locationsRes.data[locationsRes.data.length - 1];
        handleLocation(latest);
        mapRef.current.fitBounds(lineRef.current.getBounds(), {
          maxZoom: 16,
          padding: [30, 30],
        });
      } catch (err) {
        console.error("Failed to load location history:", err.response?.data || err);
        if (err.response?.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load tracking data. Check backend connection and login.",
        );
      }
    };

    loadHistory();
    socket.on("liveLocation", handleLocation);
    socket.on("connect_error", () => {
      setError("Live tracking socket is not connected. Check backend URL/CORS.");
    });

    // Cleanup on unmount
    return () => {
      socket.off("liveLocation", handleLocation);
      socket.off("connect_error");
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      lineRef.current = null;
    };
  }, [id, navigate]);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {(message || error) && (
        <div
          className={`alert ${error ? "alert-danger" : "alert-info"}`}
          style={{
            position: "absolute",
            zIndex: 1000,
            top: 12,
            left: 12,
            right: 12,
            maxWidth: 520,
          }}
        >
          {error || message}
        </div>
      )}
      <div id="map" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
