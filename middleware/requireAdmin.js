export function requireAdmin(req, res, next) {
  console.log("Logged in user role: ", req.user?.user_role); // ✅ Correct

  if (req.user?.user_role !== 4) {
    return res.status(403).send({ message: "Access denied: Admin only" });
  }
  next();
}
