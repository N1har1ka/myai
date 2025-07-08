import mongoose from "mongoose";
import bcrypt from "bcrypt";
// import validator from "validator";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [6, "Email must be at least 6 characters long"],
    maxLength: [50, "Email must be at most 50 characters long"],
    // validate: {
    //   validator: (value) => validator.isEmail(value),
    //   message: "Invalid email format",
    // },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.hashPassword = async function (password) {
  if (!password) {
    throw new Error("Password is required");
  }
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

userSchema.methods.isValidPassword = async function (password) {
  if (!password) {
    throw new Error("Password is required");
  }
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.genrateJWT = function () {
  const token = jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  return token;
};

const User = mongoose.model("User", userSchema);
export default User;
