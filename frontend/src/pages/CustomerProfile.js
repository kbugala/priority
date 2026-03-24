import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RegisterVisitModal from '../components/RegisterVisitModal';
import './CustomerProfile.css';

const API = 'http://localhost:5000';

function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreateMode = !id;

  // Create mode
  const [form, setForm] = useState({ name: '', email: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // List mode (create page)
  const [allCustomers, setAllCustomers] = useState([]);
  const [listLoading, setListLoading] = useState(isCreateMode);

  // View mode
  const [customer, setCustomer] = useState(null);
  const [visitations, setVisitations] = useState([]);
  const [loading, setLoading] = useState(!isCreateMode);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchAllCustomers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/customer/all`);
      if (res.ok) setAllCustomers(await res.json());
    } catch { /* ignore */ } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isCreateMode) return;
    fetchAllCustomers();
  }, [isCreateMode, fetchAllCustomers]);

  const fetchVisitations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/visitation/customer/${id}`);
      if (res.ok) setVisitations(await res.json());
    } catch { /* silently ignore */ }
  }, [id]);

  useEffect(() => {
    if (isCreateMode) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/customer/${id}`);
        if (!res.ok) throw new Error('Customer not found');
        setCustomer(await res.json());
        await fetchVisitations();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isCreateMode, fetchVisitations]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Name is required.');
    if (!form.email.trim()) return setFormError('Email is required.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) return setFormError('Please enter a valid email address.');

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create customer');
      }
      const created = await res.json();
      navigate(`/profile/${created.id}`);
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (isCreateMode) {
    return (
      <div className="cp-container">
        <div className="cp-header">
          <h1>Customers</h1>
        </div>

        {/* Create form */}
        <div className="cp-card" style={{ marginBottom: '2rem' }}>
          <h2>Create New Profile</h2>
          <form onSubmit={handleCreate} className="cp-form" noValidate>
            {formError && <div className="cp-alert cp-alert-error">{formError}</div>}
            <div className="cp-form-group">
              <label htmlFor="cp-name">Full Name</label>
              <input
                id="cp-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Enter full name"
                autoFocus
              />
            </div>
            <div className="cp-form-group">
              <label htmlFor="cp-email">Email Address</label>
              <input
                id="cp-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <button type="submit" className="cp-btn cp-btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Profile'}
            </button>
          </form>
        </div>

        {/* Customer list */}
        <div className="cp-card">
          <h2>All Customers</h2>
          {listLoading ? (
            <p className="cp-loading" style={{ padding: '1.5rem 0' }}>Loading customers…</p>
          ) : allCustomers.length === 0 ? (
            <p className="cp-empty">No customers yet. Create one above.</p>
          ) : (
            <table className="cp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Member Since</th>
                </tr>
              </thead>
              <tbody>
                {allCustomers.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="cp-row-link"
                    onClick={() => navigate(`/profile/${c.id}`)}
                    title={`View ${c.name}'s profile`}
                  >
                    <td>{idx + 1}</td>
                    <td className="cp-name-cell">{c.name}</td>
                    <td>{c.email}</td>
                    <td>{formatDate(c.registrationDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cp-container">
        <div className="cp-loading">Loading customer…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-container">
        <div className="cp-alert cp-alert-error">{error}</div>
      </div>
    );
  }

  const formatDateLong = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const formatShort = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="cp-container">
      <div className="cp-header">
        <div>
          <h1>{customer?.name}</h1>
          <p className="cp-email">{customer?.email}</p>
        </div>
        <button className="cp-btn cp-btn-primary" onClick={() => setShowModal(true)}>
          + Register Visit
        </button>
      </div>

      <div className="cp-stats">
        <div className="cp-stat">
          <span className="cp-stat-label">Member Since</span>
          <span className="cp-stat-value">
            {customer?.registrationDate ? formatDateLong(customer.registrationDate) : '—'}
          </span>
        </div>
        <div className="cp-stat">
          <span className="cp-stat-label">Total Purchases</span>
          <span className="cp-stat-value">{customer?.totalPurchases ?? 0}</span>
        </div>
        <div className="cp-stat">
          <span className="cp-stat-label">Total Visits</span>
          <span className="cp-stat-value">{visitations.length}</span>
        </div>
      </div>

      <div className="cp-card">
        <h2>Visitation History</h2>
        {visitations.length === 0 ? (
          <p className="cp-empty">No visits recorded yet.</p>
        ) : (
          <table className="cp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Hotel</th>
                <th>Visit Date</th>
              </tr>
            </thead>
            <tbody>
              {visitations.map((v, idx) => (
                <tr key={v.id}>
                  <td>{idx + 1}</td>
                  <td>{v.hotelName}</td>
                  <td>{formatShort(v.visitDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <RegisterVisitModal
          customerId={parseInt(id, 10)}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchVisitations();
          }}
        />
      )}
    </div>
  );
}

export default CustomerProfile;
