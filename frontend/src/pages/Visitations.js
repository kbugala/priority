import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Visitations.css';

const API = 'http://localhost:5000';

function Visitations() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [selectedHotelIds, setSelectedHotelIds] = useState([]);
  const [monthYear, setMonthYear] = useState(''); // input[type=month] gives "yyyy-MM"
  const [onlyLoyal, setOnlyLoyal] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/hotel`)
      .then((r) => r.json())
      .then(setHotels)
      .catch(() => {});
  }, []);

  const toggleHotel = (id) =>
    setSelectedHotelIds((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (selectedHotelIds.length > 0) params.set('hotelIds', selectedHotelIds.join(','));
      if (monthYear) {
        const [yyyy, mm] = monthYear.split('-');
        params.set('year', yyyy);
        params.set('month', String(parseInt(mm, 10))); // strip leading zero
      }
      if (onlyLoyal) params.set('onlyLoyal', 'true');

      const res = await fetch(`${API}/api/visitation?${params}`);
      if (res.ok) setResults(await res.json());
      else setResults([]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="vis-container">
      <div className="vis-header">
        <h1>Visitations Dashboard</h1>
      </div>

      <div className="vis-layout">
        {/* ── Filter Panel ── */}
        <aside className="vis-filters">
          <h3>Filters</h3>

          <div className="vis-filter-group">
            <span className="vis-filter-label">Hotels</span>
            <div className="vis-hotel-list">
              {hotels.map((h) => (
                <label key={h.id} className="vis-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedHotelIds.includes(h.id)}
                    onChange={() => toggleHotel(h.id)}
                  />
                  {h.name}
                </label>
              ))}
            </div>
          </div>

          <div className="vis-filter-group">
            <label className="vis-filter-label" htmlFor="vis-month">
              Month / Year
            </label>
            <input
              id="vis-month"
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="vis-month-input"
            />
          </div>

          <div className="vis-filter-group">
            <label className="vis-checkbox-label vis-loyal-label">
              <input
                type="checkbox"
                checked={onlyLoyal}
                onChange={(e) => setOnlyLoyal(e.target.checked)}
              />
              Only Loyal Customers
            </label>
          </div>

          <button
            className="vis-btn-search"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </aside>

        {/* ── Results Panel ── */}
        <main className="vis-results">
          {!searched && (
            <div className="vis-empty">
              Set filters above and click <strong>Search</strong> to view visitations.
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="vis-empty">No visitations match your criteria.</div>
          )}

          {results.length > 0 && (
            <table className="vis-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Visit Date</th>
                  <th>Hotel</th>
                </tr>
              </thead>
              <tbody>
                {results.map((v, idx) => (
                  <tr key={v.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <button
                        className="vis-customer-link"
                        onClick={() => navigate(`/profile/${v.customerId}`)}
                      >
                        {v.customerName}
                      </button>
                    </td>
                    <td>{formatDate(v.visitDate)}</td>
                    <td>{v.hotelName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
}

export default Visitations;
