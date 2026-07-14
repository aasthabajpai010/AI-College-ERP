// ============================================================
// LOGIN PAGE
// ============================================================
// This is the first real page a user interacts with. It ties
// together authService (makes the API call) and AuthContext
// (stores the result globally) — this page itself doesn't know
// HOW the token is stored, it just calls login() and trusts
// AuthContext to handle that.

// ============================================================
// LOGIN PAGE
// ============================================================
// ============================================================
// LOGIN PAGE
// ============================================================
// Same split-screen layout as Register — illustration + welcome
// copy on the left, form on the right. Keeping both pages visually
// identical in structure is what makes them feel like one product
// instead of two different screens bolted together.

// ============================================================
// LOGIN PAGE
// ============================================================
// Split-screen layout as Register — illustration + welcome copy
// on the left, form on the right. Keeping both pages visually
// identical in structure is what makes them feel like one product.

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import campusIllustration from "../assets/campus_illustration.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      login(data.user, data.token);

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "faculty") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ---------------- LEFT PANEL ---------------- */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col items-center justify-center p-12 relative overflow-hidden">
        <img src={campusIllustration} alt="" className="w-80 h-80 mb-8 animate-fade-in" />

        <h1 className="font-display text-3xl font-semibold text-paper text-center mb-3">
          Welcome to College ERP
        </h1>
        <p className="font-body text-paper/60 text-center max-w-sm mb-10">
          Manage academics, attendance, courses, and more in one place.
        </p>

        <div className="flex gap-8"></div>