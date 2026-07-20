// ============================================================
// 404 NOT FOUND PAGE
// ============================================================
// Catches any URL that doesn't match a defined route. Without this,
// React Router shows a blank white screen for unmatched paths —
// this gives the user a clear message and a way back instead.

import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="text-center">
        <FileQuestion className="text-ink/20 mx-auto mb-4" size={64} strokeWidth={1.5} />
        <h1 className="font-display text-4xl font-semibold text-ink mb-2">404</h1>
        <p className="font-body text-ink/50 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/login"
          className="inline-block bg-maroon text-white px-5 py-2 rounded font-body text-sm hover:bg-maroon-dark transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default NotFound;