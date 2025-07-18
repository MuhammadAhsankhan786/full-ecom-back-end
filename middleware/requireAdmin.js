export function requireAdmin(req, res, next) {
  if (req.user?.user_role !== "admin") {
    return res.status(403).send({ message: "Access denied: Admin only" });
  }
  next();
}
