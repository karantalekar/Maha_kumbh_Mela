// import Admin from "../models/Admin.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = "your_super_secret_key"; // no env as you said

// // REGISTER ADMIN
// export const registerAdmin = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const existing = await Admin.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ message: "Admin already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const admin = await Admin.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     res.status(201).json({ message: "Admin registered successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Registration failed" });
//   }
// };

// // LOGIN ADMIN
// export const loginAdmin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.json({
//       token,
//       admin: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         role: admin.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Login failed" });
//   }
// };

import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "mySuperSecretKey"; // keep secret safe

// REGISTER ADMIN
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin", // ensure role is always admin
    });

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// LOGIN ADMIN
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};
