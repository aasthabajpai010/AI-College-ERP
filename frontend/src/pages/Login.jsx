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

// ============================================================
// LOGIN PAGE
// ============================================================
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
      <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col items-center justify-center p-12 relative overflow-hidden">
        <img src={campusIllustration} alt="" className="w-80 h-80 mb-8 animate-fade-in" />

        <h1 className="font-display text-3xl font-semibold text-paper text-center mb-3">
          Welcome to College ERP
        </h1>
        <p className="font-body text-paper/60 text-center max-w-sm mb-10">
          Manage academics, attendance, courses, and more in one place.
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

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-paper p-8">
        <div className="w-full max-w-sm animate-fade-in-up">
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">
            Sign in
          </h2>
          <p className="font-body text-sm text-ink/50 mb-6">
            Welcome back to your account
          </p>

          {error && (
            <div className="bg-maroon/10 text-maroon text-sm p-2 rounded mb-4 font-body border border-maroon/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body text-ink/70 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40 focus:border-maroon/40"
              />
            </div>

            <div>
              <label className="block text-sm font-body text-ink/70 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-white py-2 rounded font-body font-medium hover:bg-maroon-dark transition-all hover:scale-[1.02] disabled:opacity-50 mt-2"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="font-body text-sm text-ink/50 text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-maroon font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;