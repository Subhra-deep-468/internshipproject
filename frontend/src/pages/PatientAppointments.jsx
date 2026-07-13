import { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/Navbar';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = () => {
    api
      .get('/appointments')
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    await api.patch(`/appointments/${id}/cancel`);
    fetchAppointments();
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="page container">
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>View and manage your booked appointments</p>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">You have no appointments yet.</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Reason</th>
                <th>Requested Date</th>
                <th>Scheduled Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id}>
                  <td>Dr. {appt.doctor?.user?.name}</td>
                  <td>{appt.doctor?.specialization}</td>
                  <td>{appt.reason}</td>
                  <td>{new Date(appt.requestedDate).toLocaleDateString()}</td>
                  <td>{appt.scheduledTime || '—'}</td>
                  <td>
                    <StatusBadge status={appt.status} />
                  </td>
                  <td>
                    {['pending', 'accepted'].includes(appt.status) && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt._id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
