import { NavLink, Outlet } from 'react-router-dom'
import '../../App.css'

const navigationItems = [
  { label: 'Overview', href: '#overview' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'API', href: '#api' },
  { label: 'Roadmap', href: '#roadmap' },
]

export function AppShell() {
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
              <p className="brand__eyebrow">Phase 1 Foundation</p>
              <h1 className="brand__title">MindVault</h1>
              <p className="brand__subtitle">
                Personal knowledge architecture for notes, files, bookmarks, and
                AI workflows.
              </p>
            </div>
          </div>

          <nav className="topbar__nav" aria-label="Section navigation">
            {navigationItems.map((item) => (
              <NavLink key={item.label} to={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <Outlet />

        <p className="footer-note">
          Backend scaffold lives in <code>server/</code>. Frontend feature shell
          lives in <code>src/</code>. Phase 1 is ready for authentication work.
        </p>
      </div>
    </div>
  )
}
