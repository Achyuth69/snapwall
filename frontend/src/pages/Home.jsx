import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { useOutletContext, useLocation } from "react-router-dom";
import { db } from "../firebase";
import Card from "../components/Card.jsx";
import BottomSlider from "../components/BottomSlider.jsx";
import "./Home.css";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.4;

const Home = () => {
  const { searchQuery } = useOutletContext();
  const location = useLocation();

  const [memories, setMemories] = useState([]);
  const [zoom, setZoom] = useState(1);

  const viewportRef = useRef(null);

  /* 🔥 REALTIME FETCH */
  useEffect(() => {
    const q = query(
      collection(db, "memories"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMemories(list);
    });

    return () => unsubscribe();
  }, []);

  /* 🔍 SEARCH + HIGHLIGHT */
  const params = new URLSearchParams(location.search);
  const highlightId = params.get("memory");

  const q = searchQuery.trim().toLowerCase();

  const processed = memories.map(m => ({
    ...m,
    isHighlighted:
      m.id === highlightId ||
      (q &&
        (m.username?.toLowerCase().includes(q) ||
          m.city?.toLowerCase().includes(q) ||
          m.country?.toLowerCase().includes(q)))
  }));

  /* 🧠 FIGMA-LIKE ZOOM */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const rect = viewport.getBoundingClientRect();
      const offsetX = e.clientX - rect.left + viewport.scrollLeft;
      const offsetY = e.clientY - rect.top + viewport.scrollTop;

      const delta = -e.deltaY * 0.001;
      const newZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, zoom + delta)
      );

      const scale = newZoom / zoom;

      viewport.scrollLeft =
        offsetX * scale - (e.clientX - rect.left);
      viewport.scrollTop =
        offsetY * scale - (e.clientY - rect.top);

      setZoom(newZoom);
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [zoom]);

  /* 🎯 SCROLL TO SHARED MEMORY */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const memoryId = params.get("memory");

    if (!memoryId || memories.length === 0) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`memory-${memoryId}`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        el.classList.add("highlight-memory");

        setTimeout(() => {
          el.classList.remove("highlight-memory");
        }, 4000);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [location.search, memories]);

  return (
    <div className="home-wrapper">
      <div className="memory-viewport" ref={viewportRef}>
        <div
          className="memory-canvas"
          style={{
            "--card-size": `${240 * zoom}px`,
            "--gap-x": `${60 * zoom}px`,
            "--gap-y": `${90 * zoom}px`
          }}
        >
          <div className="memory-wall">
            {processed.map(m => (
              <div id={`memory-${m.id}`} key={m.id}>
                <Card
                  memory={m}
                  isHighlighted={m.isHighlighted}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomSlider />
    </div>
  );
};

export default Home;
