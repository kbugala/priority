import React, { useState, useEffect } from 'react';
import './RegisterVisitModal.css';

const API = 'http://localhost:5000';

function RegisterVisitModal({ customerId, onClose, onSuccess }) {
  const [hotels, setHotels] = useState([]);
  const [hotelId, setHotelId] = useState('');
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split('T')[0] // today as "yyyy-MM-dd"
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/hotel`)
      .then((r) => r.json())
      .then((data) => {
        setHotels(data);
        if (data.length > 0) setHotelId(String(data[0].id));
      })
      .catch(() => {});
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!hotelId) return setError('Please select a hotel.');
    if (!visitDate) return setError('Please select a visit date.');

    setSubmitting(true);
    try {
      // Build a UTC midnight date from the local date string to avoid timezone shifts
      const [yyyy, mm, dd] = visitDate.split('-').map(Number);
      const isoDate = new Date(Date.UTC(yyyy, mm - 1, dd)).toISOString();

      const res = await fetch(`${API}/api/visitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          hotelId: parseInt(hotelId, 10),
          visitDate: isoDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register visit.');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="rvm-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rvm-title"
    >
      <div className="rvm-dialog">
        <div className="rvm-header">
          <h2 id="rvm-title">Register Visit</h2>
          <button className="rvm-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rvm-body">
            {error && <div className="rvm-error">{error}</div>}

            <div className="rvm-form-group">
              <label htmlFor="rvm-hotel">Hotel</label>
              <select
                id="rvm-hotel"
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
              >
                <option value="">Select a hotel…</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rvm-form-group">
              <label htmlFor="rvm-date">Visit Date</label>
              <input
                id="rvm-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="rvm-footer">
            <button
              type="button"
              className="rvm-btn rvm-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rvm-btn rvm-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Registering…' : 'Register Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterVisitModal;
