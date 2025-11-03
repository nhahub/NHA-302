import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "Please enter a username"],
    },
    username_ar: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    photo: String,
    phone: {
      type: String,
      trim: true,
      validate: [validator.isMobilePhone, "Please enter a valid phone number"],
    },
    password: {
      type: String,
      trim: true,
      minlength: 6,
    },
    passwordConfirmation: {
      type: String,
      validate: {
        validator: function (el) {
          if (this.password) return el === this.password;
          return true;
        },
        message: "Confirmation password should be the same as password",
      },
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    googleId: {
      type: String,
    },
    role: {
      type: String,
      trim: true,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    company: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "company",
    },
  },
  { timestamps: true }
);
userSchema.pre("validate", function (next) {
  if (!this.googleId && !this.password) {
    this.invalidate("password", "Please provide a password");
    this.invalidate("passwordConfirmation", "Please confirm your password");
  }
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirmation = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  loginPassword,
  userPassword
) {
  return await bcrypt.compare(loginPassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

export default mongoose.model("User", userSchema);
