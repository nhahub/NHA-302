import User from "../../models/user.model.js";
import { companyModel } from "../../models/company.model.js";
import { customerModel } from "../../models/customer.model.js";

import PricingBilling from "../../models/pricing_billing.model.js";
import { productModel } from "../../models/product.model.js";

import Invoice from "../../models/invoice.model.js";
import {
  getAll,
  getById,
  updateOne,
  deleteOne,
} from "../../utils/handlers/refactor.handler.js";
import catchAsync from "../../utils/middlewares/catchAsync.js";
import AppError from "../../utils/services/appError.js";
import { generateToken } from "../../utils/jwt.js";

// User Controllers
export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    googleId: req.body.googleId,
    photo: req.body.photo,
  });
  const token = generateToken(newUser);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("jwt", token, cookieOptions);
  newUser.password = undefined;
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password, googleId } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const token = generateToken(user);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

export const logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success", message: "You are logged out" });
});

export const updateUser = updateOne(User);
export const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("company");
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (
    !req.body.oldPassword ||
    !req.body.newPassword ||
    !req.body.passwordConfirmation
  ) {
    return next(
      new AppError(
        "Please provide oldPassword, newPassword and passwordConfirmation",
        400
      )
    );
  }
  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError("Your current password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  user.passwordConfirmation = req.body.passwordConfirmation;

  await user.save();

  const token = generateToken(user);
  res.status(200).json({
    status: "success",
    token,
    data: { user },
  });
});

// export const deleteAccount = catchAsync(async (req, res, next) => {
//   const user = await User.findByIdAndDelete(req.user._id);
//   if (!user) {
//     return next(new AppError("User not found", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     data: null,
//   });
// });

export const deleteAccount = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findByIdAndDelete(userId);
  if (!user) return next(new AppError("User not found", 404));

  // Delete related documents
  await Promise.all([
    companyModel.deleteMany({ owner: userId }),
    PricingBilling.deleteMany({ user: userId }),
    productModel.deleteMany({ user: userId }),
    customerModel.deleteMany({ user: userId }),
    Invoice.deleteMany({ user: userId }),
  ]);

  res.status(200).json({
    status: "success",
    message: "User and all related data deleted successfully",
  });
});
// Admin Controllers
export const createAdmin = catchAsync(async (req, res, next) => {
  const newAdmin = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation,
    role: "admin",
  });
  const token = generateToken(newAdmin);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("jwt", token, cookieOptions);
  newAdmin.password = undefined;
  res.status(201).json({
    status: "success",
    data: {
      user: newAdmin,
    },
  });
});

export const getAdmin = getById(User);
export const getAllAdmins = getAll(User);
export const updateAdmin = updateOne(User);
export const deleteAdmin = deleteOne(User);
export const deleteUser = deleteOne(User);
export const getAllUsers = getAll(User);
