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
