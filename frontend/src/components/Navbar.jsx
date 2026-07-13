import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          Medi<span>Book</span>
        </Link>
        <div className="nav-links">
          {!user && (
            <>
              <Link to="/doctors">Find Doctors</Link>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
          {user?.role === 'patient' && (
            <>
              <Link to="/doctors">Find Doctors</Link>
              <Link to="/my-appointments">My Appointments</Link>
              <span>{user.name}</span>
              <button className="btn btn-outline btn-sm" onClick={logout}>
                Logout
              </button>
            </>
          )}
          {user?.role === 'doctor' && (
            <>
              <Link to="/doctor/dashboard">Dashboard</Link>
              <span>Dr. {user.name}</span>
              <button className="btn btn-outline btn-sm" onClick={logout}>
                Logout
              </button>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard">Admin Panel</Link>
              <span>{user.name}</span>
              <button className="btn btn-outline btn-sm" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}
