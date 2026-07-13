import { useEffect, useState } from 'react';
import api from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const emptyDoctor = {
  name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  qualification: '',
  experience: '',
  consultationFee: '',
  bio: '',
  isVerified: false,
  availability: [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }],
};

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyDoctor);
  const [error, setError] = useState('');

  const fetchDoctors = () => {
    api
      .get('/admin/doctors')
      .then((res) => setDoctors(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyDoctor);
    setError('');
    setShowModal(true);
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({
      name: doc.user.name,
      email: doc.user.email,
      password: '',
      phone: doc.user.phone || '',
      specialization: doc.specialization,
      qualification: doc.qualification,
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      bio: doc.bio || '',
      isVerified: doc.isVerified,
      availability: doc.availability?.length ? doc.availability : emptyDoctor.availability,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
      };

      if (editing) {
        const { password, email, ...updateData } = payload;
        await api.put(`/admin/doctors/${editing._id}`, updateData);
      } else {
        await api.post('/admin/doctors', payload);
      }

      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleVerify = async (id) => {
    await api.patch(`/admin/doctors/${id}/verify`);
    fetchDoctors();
  };

  const handleDisable = async (id) => {
    await api.patch(`/admin/doctors/${id}/disable`);
    fetchDoctors();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this doctor permanently?')) return;
    await api.delete(`/admin/doctors/${id}`);
    fetchDoctors();
  };

  const updateAvailability = (index, field, value) => {
    const updated = [...form.availability];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, availability: updated });
  };

  const addSlot = () => {
    setForm({
      ...form,
      availability: [...form.availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }],
    });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Panel</h1>
          <p>Manage doctors — add, edit, verify, disable, or delete</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Doctor
        </button>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc._id}>
                <td>Dr. {doc.user.name}</td>
                <td>{doc.user.email}</td>
                <td>{doc.specialization}</td>
                <td>{doc.experience} yrs</td>
                <td>₹{doc.consultationFee}</td>
                <td>
                  {doc.isDisabled ? (
                    <span className="badge badge-disabled">Disabled</span>
                  ) : doc.isVerified ? (
                    <span className="badge badge-verified">Verified</span>
                  ) : (
                    <span className="badge badge-unverified">Unverified</span>
                  )}
                </td>
                <td>
                  <div className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(doc)}>
                      Edit
                    </button>
                    {!doc.isVerified && !doc.isDisabled && (
                      <button className="btn btn-success btn-sm" onClick={() => handleVerify(doc._id)}>
                        Verify
                      </button>
                    )}
                    {!doc.isDisabled && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleDisable(doc._id)}>
                        Disable
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && <div className="empty-state">No doctors added yet.</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit Doctor' : 'Add Doctor'}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    disabled={!!editing}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              {!editing && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    required
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Qualification</label>
                  <input
                    required
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.consultationFee}
                    onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Verify on create</label>
                  <select
                    value={form.isVerified ? 'yes' : 'no'}
                    onChange={(e) => setForm({ ...form, isVerified: e.target.value === 'yes' })}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>

              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Availability</label>
              {form.availability.map((slot, i) => (
                <div key={i} className="form-row" style={{ marginTop: '0.5rem' }}>
                  <select value={slot.day} onChange={(e) => updateAvailability(i, 'day', e.target.value)}>
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateAvailability(i, 'startTime', e.target.value)}
                  />
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateAvailability(i, 'endTime', e.target.value)}
                  />
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }} onClick={addSlot}>
                + Add slot
              </button>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Save Changes' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
