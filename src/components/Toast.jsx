import { useState, useCallback } from "react";
import "../styles/toast.css";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return { toasts, toast, remove };
}

const ICONS = { success: "✓", error: "✕", info: "ℹ", warn: "⚠" };

export default function Toast({ toasts, remove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{ICONS[t.type] ?? "•"}</span>
          <span className="toast-msg">{t.msg}</span>
          <button className="toast-close" onClick={() => remove(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}