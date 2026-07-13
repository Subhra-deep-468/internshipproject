import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors/specializations').then((res) => setSpecializations(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (specialization) params.specialization = specialization;

    api
      .get('/doctors', { params })
      .then((res) => setDoctors(res.data))
      .finally(() => setLoading(false));
  }, [search, specialization]);

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Find a Doctor</h1>
        <p>Browse verified specialists and book an appointment</p>
      </div>

      <div className="search-bar">
        <input
          placeholder="Search by name, specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
          <option value="">All Specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="empty-state">No doctors found matching your search.</div>
      ) : (
        <div className="card-grid">
          {doctors.map((doc) => (
            <div key={doc._id} className="card doctor-card">
              <h3>Dr. {doc.user.name}</h3>
              <div className="specialization">{doc.specialization}</div>
              <div className="doctor-meta">
                {doc.qualification} · {doc.experience} yrs experience
              </div>
              <div className="fee">₹{doc.consultationFee} consultation fee</div>
              <Link to={`/doctors/${doc._id}`} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
