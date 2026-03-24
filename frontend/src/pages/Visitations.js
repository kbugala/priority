import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Visitations.css';

const API = 'http://localhost:5000';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2019 }, (_, i) => String(2020 + i));

function Visitations() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [selectedHotelIds, setSelectedHotelIds] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [onlyLoyal, setOnlyLoyal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/hotel`)
      .then((r) => r.json())
      .then(setHotels)
      .catch(() => {});
  }, []);

  // Close hotel dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleHotel = (id) =>
    setSelectedHotelIds((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );

  const hotelButtonLabel =
    selectedHotelIds.length === 0 || selectedHotelIds.length === hotels.length
      ? 'All Hotels'
      : `${selectedHotelIds.length} hotel${selectedHotelIds.length > 1 ? 's' : ''} selected`;

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (selectedHotelIds.length > 0) params.set('hotelIds', selectedHotelIds.join(','));
      if (selectedMonth) params.set('month', String(parseInt(selectedMonth, 10)));
      if (selectedYear) params.set('year', selectedYear);
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
            <div className="vis-dropdown-wrap" ref={dropdownRef}>
              <button
                type="button"
                className="vis-dropdown-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
              >
                <span>{hotelButtonLabel}</span>
                <span className="vis-dropdown-caret">{dropdownOpen ? '▲' : '▼'}</span>
              </button>
              {dropdownOpen && (
                <div className="vis-dropdown-panel" role="listbox" aria-multiselectable="true">
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
              )}
            </div>
          </div>

          <div className="vis-filter-group">
            <span className="vis-filter-label">Month / Year</span>
            <div className="vis-month-year">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="vis-select"
                aria-label="Month"
              >
                <option value="">MM</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.value} – {m.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="vis-select"
                aria-label="Year"
              >
                <option value="">YYYY</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
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
