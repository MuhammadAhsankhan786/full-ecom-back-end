// backend/controllers/userController.js

import { db } from "../db.mjs";

export const getUserDetails = async (req, res) => {
  try {
    const user = await db.query(
      `SELECT user_id, first_name, last_name, email, phone, profile, user_role FROM users WHERE user_id = $1`,
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({
      message: "User fetched successfully",
      user: user.rows[0],
    });
  } catch (err) {
    console.error("Error fetching user:", err.stack);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
