// ============================================================
// REGISTER PAGE
// ============================================================
// Split-screen layout: illustration + welcome copy on the left,
// registration form on the right. Matches the same visual language
// as Login (navy/maroon/serif) so the two feel like one product.
// ============================================================
// REGISTER PAGE
// ============================================================
// Split-screen layout: illustration + welcome copy on the left,
// registration form on the right. Matches the same visual language
// as Login (navy/maroon/serif) so the two feel like one product.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import campusIllustration from "../assets/campus_illustration.svg";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData.name, formData.email, formData.password, formData.role);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
          Manage academics, attendance, results, and more — all in one place.
        </p>

        <div className="flex gap-8">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-maroon/20 border border-maroon/40 flex items-center justify-center mx-auto mb-2">
              <span className="text-maroon-light font-display text-sm">AI</span>
            </div>
            <p className="font-body text-xs text-paper/50">AI Assistant</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-maroon/20 border border-maroon/40 flex items-center justify-center mx-auto mb-2">
              <span className="text-maroon-light font-display text-sm">🔒</span>
            </div>
            <p className="font-body text-xs text-paper/50">Secure Auth</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-maroon/20 border border-maroon/40 flex items-center justify-center mx-auto mb-2">
              <span className="text-maroon-light font-display text-sm">⚡</span>
            </div>
            <p className="font-body text-xs text-paper/50">Real-time</p>
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT PANEL: FORM ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-paper p-8">
        <div className="w-full max-w-sm animate-fade-in-up">
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">
            Create your account
          </h2>
          <p className="font-body text-sm text-ink/50 mb-6">
            Join your college's ERP portal
          </p>

          {error && (
            <div className="bg-maroon/10 text-maroon text-sm p-2 rounded mb-4 font-body border border-maroon/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body text-ink/70 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleChange("name")}
                required
                className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40 focus:border-maroon/40"
              />
            </div>

            <div>
              <label className="block text-sm font-body text-ink/70 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                required
                className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40 focus:border-maroon/40"
              />
            </div>

            <div>
              <label className="block text-sm font-body text-ink/70 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={handleChange("role")}
                className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40 focus:border-maroon/40"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-body text-ink/70 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange("password")}
                  required
                  className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40 focus:border-maroon/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/40 font-body"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-body text-ink/70 mb-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                required
                className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40 focus:border-maroon/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-white py-2 rounded font-body font-medium hover:bg-maroon-dark transition-all hover:scale-[1.02] disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="font-body text-sm text-ink/50 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-maroon font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;