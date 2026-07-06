// ============================================================
// USER MODEL
// ============================================================
// Defines how user data is stored in MongoDB.
// Mongoose turns this schema into a "User" collection in the database.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // No two users can share the same email
      lowercase: true, // Always store email in lowercase (avoids duplicate casing issues)
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      // We store the HASHED password here, never the plain text password.
    },

    role: {
      type: String,
      enum: ["admin", "faculty", "student"], // Only these roles are allowed
      default: "student", // New users are students unless specified otherwise
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ------------------------------------------------------------
// PRE-SAVE HOOK — hash password before saving to database
// ------------------------------------------------------------
//
// WHY hash passwords?
// - If the database is ever leaked, attackers must NOT see real passwords.
// - Hashing is one-way: you cannot reverse it to get the original password.
// - bcrypt adds "salt" + multiple rounds to make cracking very slow.
//
// WHY check isModified("password")?
// - This hook runs on EVERY save (create AND update).
// - On update, if the user only changes name/email, password is unchanged.
// - Without this check, we would re-hash an already-hashed password,
//   which breaks login (compare would always fail).
// - isModified("password") is true only when password was set/changed.
//
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ------------------------------------------------------------
// INSTANCE METHOD — compare plain password with stored hash
// ------------------------------------------------------------
//
// Used during login:
//   user.comparePassword("whatUserTyped") → true or false
//
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;