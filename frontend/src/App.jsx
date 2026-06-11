import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Toaster } from "react-hot-toast";

import Topbar from "./components/Topbar.jsx";
import ParallaxBackground from "./components/ParallaxBackground.jsx";
import "./App.css";

// Auth-only pages — no topbar
const AUTH_PAGES = ["/login", "/signup", "/forgot", "/verify-email", "/success"];

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pageKey, setPageKey] = useState(location.pathname);
  const [transitioning, setTransitioning] = useState(false);

  const hideTopbar = AUTH_PAGES.includes(location.pathname);

  // Page transition
  useEffect(() => {
    setTransitioning(true);
    const t = setTimeout(() => {
      setPageKey(location.pathname);
      setTransitioning(false);
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Logged in — if on auth page, go home
        if (AUTH_PAGES.includes(location.pathname)) {
          navigate("/");
        }
      }
      // Not logged in — stay on current page (home is public)
    });
    return () => unsub();
  }, [navigate, location.pathname]);

  if (loading) return null;

  return (
    <div className="app-root">
      <Toaster position="top-center" reverseOrder={false} />

      <ParallaxBackground />

      <div className="app-content">
        {!hideTopbar && <Topbar onSearch={setSearchQuery} user={user} />}
        <div
          key={pageKey}
          className={`page-transition ${transitioning ? "page-out" : "page-in"}`}
        >
          <Outlet context={{ searchQuery, user }} />
        </div>
      </div>
    </div>
  );
}

export default App;
