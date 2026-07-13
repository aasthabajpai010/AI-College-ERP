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
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    // bg-ink replaces the generic gray background — the whole page
    // now opens on our deep navy, matching the sidebar's color,
    // so the login screen feels like part of the same product
    // instead of a disconnected default template screen.
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="bg-paper p-8 rounded-lg shadow-xl w-full max-w-sm">
        
        {/* font-display switches this heading to our serif (Fraunces),
            giving it the "institutional/academic" feel instead of
            a generic sans-serif SaaS look. */}
        <h1 className="font-display text-2xl font-semibold mb-1 text-ink text-center">
          College ERP
        </h1>
        <p className="font-body text-sm text-ink/50 text-center mb-6">
          Sign in to your account
        </p>

        {error && (
          <div className="bg-maroon/10 text-maroon text-sm p-2 rounded mb-4 font-body border border-maroon/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium font-body mb-1 text-ink/70">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-ink/15 rounded px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-maroon/40 focus:border-maroon/40"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium font-body mb-1 text-ink/70">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-ink/15 rounded px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-maroon/40 focus:border-maroon/40"
            />
          </div>

          {/* bg-maroon replaces the generic blue button — this is
              the ONE accent color used deliberately, per our design
              tokens, instead of a default Tailwind blue. */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon text-white py-2 rounded font-body font-medium hover:bg-maroon-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;