import express from "express";
import {
  signup,
  login,
  logout,
  updatePassword,
  getAllUsers,
  getCurrentUser,
  deleteUser,
  createAdmin,
  getAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
  updateUser,
  deleteAccount,
} from "../../modules/auth/auth.controller.js";
import {
  protect,
  restrictTo,
} from "../../utils/middlewares/auth.middleware.js";
import { generateToken } from "../../utils/jwt.js";
import passport from "passport";

const router = express.Router();

//User routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/users/:id", protect, restrictTo("user"), getCurrentUser);
router.patch("/update/:id", protect, restrictTo("user"), updateUser);
router.patch("/updatePassword", protect, restrictTo("user"), updatePassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = generateToken(req.user);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: process.env.JWT_COOKIE_EXPIRES_IN,
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`
    );
  }
);

router.delete("/delete-account", protect, restrictTo("user"), deleteAccount);

//Admin routes
router.get("/users", protect, restrictTo("admin"), getAllUsers);
router.delete("/users/:id", protect, restrictTo("admin"), deleteUser);
router.post("/admin", createAdmin);
router.get("/admin/:id", protect, restrictTo("admin"), getAdmin);
router.get("/admin", protect, restrictTo("admin"), getAllAdmins);
router.patch("/admin/:id", protect, restrictTo("admin"), updateAdmin);
router.delete("/admin/:id", protect, restrictTo("admin"), deleteAdmin);

export default router;
