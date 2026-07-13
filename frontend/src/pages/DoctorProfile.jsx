import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [form, setForm] = useState({ reason: '', requestedDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api
      .get(`/doctors/${id}`)
      .then((res) => setDoctor(res.data))
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'patient') {
      setError('Only patients can book appointments');
      return;
    }
    setError('');
    try {
      await api.post('/appointments', {
        doctorId: id,
        reason: form.reason,
        requestedDate: form.requestedDate,
      });
      setSuccess('Appointment request submitted!');
      setShowBook(false);
      setForm({ reason: '', requestedDate: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!doctor) return <div className="empty-state">Doctor not found.</div>;

  return (
    <div className="page container">
      <Link to="/doctors" style={{ fontSize: '0.9rem' }}>
        ← Back to doctors
      </Link>

      {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}

      <div className="profile-grid" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.75rem' }}>Dr. {doctor.user.name}</h1>
          <div className="specialization" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
            {doctor.specialization}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Qualification</h3>
            <p style={{ color: 'var(--text-muted)' }}>{doctor.qualification}</p>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Experience</h3>
            <p style={{ color: 'var(--text-muted)' }}>{doctor.experience} years</p>
          </div>

          {doctor.bio && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>About</h3>
              <p style={{ color: 'var(--text-muted)' }}>{doctor.bio}</p>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Contact</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {doctor.user.email} {doctor.user.phone && `· ${doctor.user.phone}`}
            </p>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>Consultation Fee</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>
              ₹{doctor.consultationFee}
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => {
                if (!user) navigate('/login');
                else setShowBook(true);
              }}
            >
              Book Appointment
            </button>
          </div>

          <div className="card">
            <h3>Availability</h3>
            {doctor.availability?.length > 0 ? (
              <ul className="availability-list">
                {doctor.availability.map((slot, i) => (
                  <li key={i}>
                    <strong>{slot.day}</strong> — {slot.startTime} to {slot.endTime}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact for schedule</p>
            )}
          </div>
        </div>
      </div>

      {showBook && (
        <div className="modal-overlay" onClick={() => setShowBook(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Book Appointment with Dr. {doctor.user.name}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleBook}>
              <div className="form-group">
                <label>Reason for visit</label>
                <textarea
                  required
                  rows={3}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Preferred date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.requestedDate}
                  onChange={(e) => setForm({ ...form, requestedDate: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowBook(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
