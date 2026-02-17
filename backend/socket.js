import Location from "./models/Location.js";

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

    socket.on("sendLocation", async (data) => {
      try {
        const last = await Location.findOne({ userId: data.userId }).sort({
          timestamp: -1,
        });

        let distance = 0;
        let speed = 0;

        if (last) {
          distance = calculateDistance(
            last.latitude,
            last.longitude,
            data.latitude,
            data.longitude,
          );

          const time = (Date.now() - new Date(last.timestamp)) / 3600000; // hours

          speed = time > 0 ? distance / time : 0;
        }

        const location = await Location.create({
          ...data,
          distance,
          speed,
          timestamp: new Date(),
        });

        io.to(data.userId).emit("liveLocation", location);
      } catch (error) {
        console.error("Socket location error:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
