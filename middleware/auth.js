// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) return res.status(401).json({ error: 'Token missing' });

//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret');
//     req.user = decoded; // contains: { id, email, role }
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// };
////////////////////////////////////////////////////////////

// const authenticateAPI = async (req, res, next) => {
//   try {
//     const token =
//       req.cookies?.auth_token ||
//       req.headers["authorization"]?.split(" ")[1] ||
//       req.headers["x-access-token"] ||
//       req.headers["token"];

//     if (!token) {
//       return res.status(401).json({ success: false, message: "Token missing" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "jwt_secret");

//     // fetch user from MySQL
//     const condition = `id = ${decoded.userId} AND is_deleted = 0`;
//     const user = await selectOneData("users", "*", condition);

//     if (!user) {
//       return res.status(401).json({ success: false, message: "Invalid user" });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: "Invalid token" });
//   }
// };

//const { insertData,selectData ,selectOneData,customSelectSqlQuery} = require("../models/MasterModel");



const jwt = require("jsonwebtoken");
const { selectOneData } = require("../models/MasterModel");

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

const authcheck=async(req, res, next) =>{
  try {
    // ✅ Get token from headers/cookies
    const token =
      req.headers["x-access-token"] ||
      req.headers["authorization"]?.split(" ")[1] ||
      req.cookies?.auth_token ||
      null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Check user in DB (only by id)
    const condition = `id = ${decoded.id}`;
    const user = await selectOneData("users", "*", condition);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }

    // ✅ Attach both user and role
    req.user = user;        // full user from DB
    req.userRole = decoded.role; // role from JWT

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = authcheck;




