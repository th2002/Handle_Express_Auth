import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide unique username"],
    unique: [true, "Username already exists"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide unique email"],
    unique: true,
  },
  fullname: { type: String },
  phone_number: { type: Number },
  role: {
    type: String,
    enum: ["customer", "organizer"],
    validate: {
      validator: function (role) {
        return role !== "admin";
      },
      message: 'Registration with role "admin" is not allowed',
    },
  },
});

export default mongoose.models.Users || mongoose.model("User", UserSchema);

