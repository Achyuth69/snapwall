import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Toaster } from "react-hot-toast";


import Topbar from "./components/Topbar.jsx";
import bgVideo from "/background.mp4";
import "./App.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const guestTimerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const hideTopbar = [
    "/login",
    "/signup",
    "/forgot",
    "/verify-email",
    "/profile-details",
    "/success",
  ].includes(location.pathname);

  useEffect(() => {
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      // ✅ Prevent multiple guest timers
      if (guestTimerRef.current) {
        clearTimeout(guestTimerRef.current);
        guestTimerRef.current = null;
      }

      // 🔴 NOT LOGGED IN
      if (!user) {
        if (location.pathname === "/" && !guestTimerRef.current) {
          guestTimerRef.current = setTimeout(() => {
            navigate("/signup");
          }, 10000);
        } else if (!["/login", "/signup", "/forgot"].includes(location.pathname)) {
          navigate("/login");
        }

        setLoading(false);
        return;
      }

      // Email not verified
      if (!user.emailVerified) {
        if (location.pathname !== "/verify-email") {
          navigate("/verify-email");
        }
        setLoading(false);
        return;
      }

      // 🟢 Check profile exists
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        if (location.pathname !== "/profile-details") {
          navigate("/profile-details");
        }
        setLoading(false);
        return;
      }

      // ✅ Fully onboarded users should not see auth pages
      if (
        ["/login", "/signup", "/verify-email", "/profile-details"].includes(
          location.pathname
        )
      ) {
        navigate("/");
      }

      setLoading(false);
    });

    return () => {
      unsub();
      if (guestTimerRef.current) clearTimeout(guestTimerRef.current);
    };
  }, [navigate, location.pathname]);

  if (loading) return null;

  return (
  <div className="app-root">
    <Toaster position="top-center" reverseOrder={false} />

    <video className="bg-video" autoPlay loop muted playsInline>
      <source src={bgVideo} type="video/mp4" />
    </video>

    <div className="bg-overlay" />

    <div className="app-content">
      {!hideTopbar && <Topbar onSearch={setSearchQuery} />}
      <Outlet context={{ searchQuery }} />
    </div>
  </div>
);
}

export default App;
