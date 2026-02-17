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

const socket = io("http://localhost:3000");

export default function TrackUser() {
  const { id } = useParams(); // user ID from route
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    // Initialize map if not already
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20.59, 78.96], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      lineRef.current = L.polyline([], { color: "blue" }).addTo(mapRef.current);
    }

    // Join Socket.IO room for this user
    socket.emit("join", id);

    // Handle live location updates
    const handleLocation = (loc) => {
      const pos = [loc.latitude, loc.longitude];

      // Add to polyline
      lineRef.current.addLatLng(pos);

      // Add or update marker
      if (!markerRef.current) {
        markerRef.current = L.marker(pos).addTo(mapRef.current);
        markerRef.current.bindPopup(`<b>${loc.username}</b>`).openPopup();
      } else {
        markerRef.current.setLatLng(pos);
        markerRef.current.getPopup().setContent(`<b>${loc.username}</b>`);
      }

      // Center map on the user
      mapRef.current.setView(pos, 15);
    };

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
