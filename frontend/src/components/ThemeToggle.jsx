import { useTheme } from "../theme/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"}
      title={isDark ? "Giao diện sáng" : "Giao diện tối"}
    >
      <span className="theme-toggle-track" aria-hidden>
        <span className="theme-toggle-thumb">
          {isDark ? (
            <svg className="theme-toggle-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg className="theme-toggle-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </span>
      </span>
      <span className="theme-toggle-text">{isDark ? "Sáng" : "Tối"}</span>
    </button>
  );
}
