import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <section className="auth-status">
        <div className="auth-status__card">
          <p className="auth-status__eyebrow">Restoring session</p>
          <h2>Checking your vault access...</h2>
          <p>
            MindVault is verifying your token and loading your account context.
          </p>
        </div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}
