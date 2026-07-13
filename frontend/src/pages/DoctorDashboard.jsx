import { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/Navbar';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleId, setScheduleId] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');

  const fetchAppointments = () => {
    api
      .get('/appointments')
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAccept = async (id) => {
    await api.patch(`/appointments/${id}/accept`, { scheduledTime: scheduledTime || undefined });
    setScheduleId(null);
    setScheduledTime('');
    fetchAppointments();
  };

  const handleReject = async (id) => {
    await api.patch(`/appointments/${id}/reject`);
    fetchAppointments();
  };

  const handleSchedule = async (id) => {
    if (!scheduledTime) return;
    await api.patch(`/appointments/${id}/schedule`, { scheduledTime });
    setScheduleId(null);
    setScheduledTime('');
    fetchAppointments();
  };

  const handleComplete = async (id) => {
    await api.patch(`/appointments/${id}/complete`);
    fetchAppointments();
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

  const pending = appointments.filter((a) => a.status === 'pending');
  const active = appointments.filter((a) => ['accepted', 'completed', 'rejected', 'cancelled'].includes(a.status));

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Doctor Dashboard</h1>
        <p>Manage appointment requests from patients</p>
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Pending Requests ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="empty-state" style={{ padding: '1.5rem' }}>
          No pending requests.
        </div>
      ) : (
        <div className="card table-wrap" style={{ marginBottom: '2rem' }}>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Reason</th>
                <th>Requested Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((appt) => (
                <tr key={appt._id}>
                  <td>{appt.patient?.name}</td>
                  <td>{appt.reason}</td>
                  <td>{new Date(appt.requestedDate).toLocaleDateString()}</td>
                  <td>
                    <div className="actions">
                      {scheduleId === appt._id ? (
                        <>
                          <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            style={{ padding: '0.35rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                          />
                          <button className="btn btn-success btn-sm" onClick={() => handleAccept(appt._id)}>
                            Accept
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => setScheduleId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => setScheduleId(appt._id)}>
                            Accept
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(appt._id)}>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>All Appointments</h2>
      {active.length === 0 ? (
        <div className="empty-state">No appointments yet.</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.map((appt) => (
                <tr key={appt._id}>
                  <td>{appt.patient?.name}</td>
                  <td>{appt.reason}</td>
                  <td>{new Date(appt.requestedDate).toLocaleDateString()}</td>
                  <td>
                    {scheduleId === appt._id ? (
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        style={{ padding: '0.35rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                      />
                    ) : (
                      appt.scheduledTime || '—'
                    )}
                  </td>
                  <td>
                    <StatusBadge status={appt.status} />
                  </td>
                  <td>
                    <div className="actions">
                      {appt.status === 'accepted' && scheduleId !== appt._id && (
                        <>
                          <button className="btn btn-outline btn-sm" onClick={() => setScheduleId(appt._id)}>
                            Set Time
                          </button>
                          <button className="btn btn-success btn-sm" onClick={() => handleComplete(appt._id)}>
                            Complete
                          </button>
                        </>
                      )}
                      {appt.status === 'accepted' && scheduleId === appt._id && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleSchedule(appt._id)}>
                            Save
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => setScheduleId(null)}>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
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
