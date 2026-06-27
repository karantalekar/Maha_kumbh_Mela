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

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import L from "leaflet";
import { useParams } from "react-router-dom";
import axios from "axios";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const socket = io("http://localhost:3000");

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function TrackUser() {
  const { id } = useParams(); // user ID from route
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const lineRef = useRef(null);
  const userNameRef = useRef("User");

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
    };

    const loadHistory = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };
        const [userRes, locationsRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/admin/user/${id}`, { headers }),
          axios.get(`http://localhost:3000/api/admin/locations/${id}`, {
            headers,
          }),
        ]);

        userNameRef.current =
          userRes.data.username || userRes.data.name || userRes.data.email || "User";

        const points = locationsRes.data
          .filter((loc) => loc.latitude && loc.longitude)
          .map((loc) => [loc.latitude, loc.longitude]);

        if (!points.length) return;

        lineRef.current.setLatLngs(points);
        const latest = locationsRes.data[locationsRes.data.length - 1];
        handleLocation(latest);
        mapRef.current.fitBounds(lineRef.current.getBounds(), {
          maxZoom: 16,
          padding: [30, 30],
        });
      } catch (err) {
        console.error("Failed to load location history:", err.response?.data || err);
      }
    };

    loadHistory();
    socket.on("liveLocation", handleLocation);

    // Cleanup on unmount
    return () => {
      socket.off("liveLocation", handleLocation);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      lineRef.current = null;
    };
  }, [id]);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}
