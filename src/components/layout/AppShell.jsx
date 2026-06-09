import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../App.css";

export function AppShell() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigationItems = isAuthenticated
    ? [
        { label: "Home", href: "/" },
        { label: "Vault", href: "/app" },
        { label: "Notes", href: "/app/notes" },
        { label: "Bookmarks", href: "/app/bookmarks" },
        { label: "Collections", href: "/app/collections" },
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
              MV
            </div>
            <div>
              <h1 className="brand__title">MindVault</h1>
            </div>
          </div>

          <nav className="topbar__nav" aria-label="Primary navigation">
            {navigationItems.map((item) => (
              <NavLink key={item.label} to={item.href}>
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button className="topbar__action" onClick={logout} type="button">
                Logout {user ? `(${user.name})` : ""}
              </button>
            ) : null}
          </nav>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
