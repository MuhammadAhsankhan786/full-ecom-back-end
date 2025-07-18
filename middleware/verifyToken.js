import jwt from "jsonwebtoken";
const SECRET = process.env.SECRET_TOKEN;

export function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized: Token missing" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  });
}

// import jwt from "jsonwebtoken";

// // Inside your login route
// const token = jwt.sign(
//   { user_id: user.user_id, email: user.email },
//   process.env.SECRET_TOKEN,
//   { expiresIn: "7d" } // 7 din tak token valid
// );

// // Set cookie with httpOnly flag and maxAge (7 days)
// res.cookie("token", token, {
//   httpOnly: true,
//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
//   secure: process.env.NODE_ENV === "production", // true on vercel or production
//   sameSite: "Lax",
// });

// res.status(200).json({ message: "Login successful", user });
