import { NavLink, Outlet } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { SearchModal } from "../../features/search/components/SearchModal";
import "../../App.css";
import "../../features/search/search.css";
import logo from "../../assets/book-reader.svg";

function SearchTriggerIcon() {
  return (
    <svg className="topbar-search-btn__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="6" />
      <path d="m15 15 3 3" strokeLinecap="round" />
    </svg>
  );
}

export function AppShell() {
  const { isAuthenticated, logout, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isAuthenticated]);

  const navigationItems = isAuthenticated
    ? [
        { label: "Home", href: "/" },
        { label: "Collections", href: "/app/collections" },
        { label: "Activity", href: "/app/activity" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Login", href: "/login" },
        { label: "Register", href: "/register" },
      ];

  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" aria-hidden="true" />
      <div className="app-shell__inner">
        <header className="topbar">
          <div className="brand">
            <div className="brand__mark" aria-hidden="true">
              <img src={logo} alt="LearnStack" className="brand__logo" />
            </div>
            <div>
              <h1 className="brand__title">LearnStack</h1>
            </div>
          </div>

          <nav className="topbar__nav" aria-label="Primary navigation">
            {navigationItems.map((item) => (
              <NavLink key={item.label} to={item.href}>
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                className="topbar-search-btn"
                onClick={openSearch}
                aria-label="Open search"
              >
                <SearchTriggerIcon />
                <span className="topbar-search-btn__text">Search</span>
                <span className="topbar-search-btn__kbd">
                  <span>⌘</span>K
                </span>
              </button>
            ) : null}
            {isAuthenticated ? (
              <button className="topbar__action" onClick={logout} type="button">
                Logout {user ? `(${user.name})` : ""}
              </button>
            ) : null}
          </nav>
        </header>

        <Outlet />
      </div>
      {searchOpen && <SearchModal onClose={closeSearch} />}
    </div>
  );
}
