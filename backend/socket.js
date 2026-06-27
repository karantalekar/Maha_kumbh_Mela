import Location from "./models/Location.js";
import User from "./models/User.js";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ✅ Use export default instead of module.exports
export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("joinAdmins", () => {
      socket.join("admins");
    });

    socket.on("sendLocation", async (data) => {
      try {
        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);

        if (
          !data.userId ||
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          return;
        }

        const user = await User.findById(data.userId).select("username email");
        if (!user) return;

        const last = await Location.findOne({ userId: data.userId }).sort({
          timestamp: -1,
        });

        let distance = 0;
        let speed = 0;

        if (last) {
          distance = calculateDistance(
            last.latitude,
            last.longitude,
            latitude,
            longitude,
          );

          const time = (Date.now() - new Date(last.timestamp)) / 3600000; // hours

          speed = time > 0 ? distance / time : 0;
        }

        const location = await Location.create({
          userId: data.userId,
          latitude,
          longitude,
          distance,
          speed,
          timestamp: new Date(),
        });

        const payload = {
          ...location.toObject(),
          username: user.username,
          email: user.email,
        };

        io.to(data.userId).emit("liveLocation", payload);
        io.to("admins").emit("userLocation", payload);
      } catch (error) {
        console.error("Socket location error:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
