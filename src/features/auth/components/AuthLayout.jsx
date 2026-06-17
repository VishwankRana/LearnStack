import { Link } from 'react-router-dom';
import logo from '../../../assets/studysmarter-logo.svg';
import '../auth.css';

export function AuthLayout({ title, subtitle, icon: Icon, children, footer }) {
  return (
    <div className="auth-layout">
      <Link to="/" className="auth-layout__logo-link">
        <img src={logo} alt="" className="auth-layout__logo" aria-hidden="true" />
        <span className="auth-layout__logo-text">LearnStack</span>
      </Link>

      <div className="auth-layout__main">
        <div className="auth-layout__card">
          {Icon ? (
            <div className="auth-layout__icon" aria-hidden="true">
              <Icon />
            </div>
          ) : null}

          <div className="auth-layout__header">
            <h1 className="auth-layout__title">{title}</h1>
            {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="auth-layout__footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
