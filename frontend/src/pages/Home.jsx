import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const dashboardLink =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'doctor'
        ? '/doctor/dashboard'
        : user?.role === 'patient'
          ? '/my-appointments'
          : null;

  return (
    <div className="hero">
      <h1>Book Doctor Appointments Online</h1>
      <p>
        Find verified specialists, view profiles, and manage your healthcare appointments — all in one place.
      </p>
      <div className="hero-actions">
        <Link to="/doctors" className="btn btn-primary">
          Find Doctors
        </Link>
        {!user && (
          <Link to="/register" className="btn btn-outline">
            Create Account
          </Link>
        )}
        {dashboardLink && (
          <Link to={dashboardLink} className="btn btn-outline">
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
