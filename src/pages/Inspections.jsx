// src/pages/Inspections.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';  // ← useSearchParams added
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import { EQUIPMENT_DATA, CATEGORIES } from '../data/equipment';
import {
  ClipboardCheck,
  Plus,
  Search,
  X,
  Calendar,
  Settings2,
  ArrowRight,
  Trash2,
  Hash,
  BoxSelect,
} from 'lucide-react';
import './styles/Inspections.css';

const Inspections = () => {
  const [inspections, setInspections] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    equipmentCategory: '',
    equipmentName: '',
    equipmentId: '',
    serialNumber: '',
    inspectionDate: new Date().toISOString().split('T')[0],
  });

  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();   // ← ADD

  const fetchData = async () => {
    try {
      const [insRes, cliRes] = await Promise.all([
        API.get('/inspections'),
        API.get('/clients'),
      ]);
      setInspections(insRes.data);
      setClients(cliRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ══════════════════════════════════════════════════════════════
  // AUTO-SELECT CLIENT + OPEN MODAL when arriving with ?clientId=...
  // Triggered from the Clients page "Start Inspection" button.
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    const clientId = searchParams.get('clientId');
    if (clientId && clients.length > 0) {
      setFormData(prev => ({
        ...prev,
        client: clientId,
        inspectionDate: new Date().toISOString().split('T')[0],
      }));
      setShowModal(true);

      // Clear the query param so it doesn't reopen on refresh
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, clients, setSearchParams]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/inspections', formData);
      addToast('New inspection sequence initialized!', 'success');
      setShowModal(false);
      navigate(`/inspections/${res.data._id}/checklist`);
    } catch (err) {
      addToast('Initialization failed. Check your data.', 'error');
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Erase this inspection record permanently?')) {
      try {
        await API.delete(`/inspections/${id}`);
        addToast('Record removed successfully.', 'success');
        fetchData();
      } catch (err) {
        addToast('Deletion encountered an error.', 'error');
      }
    }
  };

  const filteredInspections = inspections.filter(
    i =>
      i.client?.name.toLowerCase().includes(search.toLowerCase()) ||
      i.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      i.status.toLowerCase().includes(search.toLowerCase())
  );

  const statusSlug = s => s.toLowerCase().replace(' ', '-');

  // ─── Find pre-selected client to show in the banner ───
  const preselectedClient = clients.find(c => c._id === formData.client);

  return (
    <div className="equip_Inspections">
      {/* ─── HEADER ─── */}
      <header className="equip_Inspections__header">
        <div>
          <div className="equip_Inspections__eyebrow">
            <ClipboardCheck size={16} />
            <span>Logs</span>
          </div>
          <h1 className="equip_Inspections__title">Inspection Logs</h1>
          <p className="equip_Inspections__subtitle">
            Track all assessed equipment and their current status.
          </p>
        </div>
        {/* <button
          onClick={() => setShowModal(true)}
          className="equip_Inspections__addBtn"
        >
          <Plus size={18} /> New Inspection
        </button> */}
      </header>

      {/* ─── SEARCH ─── */}
      <div className="equip_Inspections__search">
        <Search size={20} className="equip_Inspections__searchIcon" />
        <input
          type="text"
          placeholder="Search logs by client, equipment type, or status..."
          className="equip_Inspections__searchInput"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ─── TABLE ─── */}
      <div className="equip_Inspections__tableCard">
        <div className="equip_Inspections__tableScroll">
          <table className="equip_Inspections__table">
            <thead>
              <tr>
                <th>Client / Company</th>
                <th>Equipment Specifications</th>
                <th>Asset Identifiers</th>
                <th>Activity Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Operations</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.length > 0 ? (
                filteredInspections.map(inspection => (
                  <tr key={inspection._id}>
                    <td>
                      <span className="equip_Inspections__cellClient">
                        {inspection.client?.name || '—'}
                      </span>
                    </td>

                    <td>
                      <div className="equip_Inspections__cellEquipment">
                        <span className="equip_Inspections__equipmentName">
                          {inspection.equipmentName}
                        </span>
                        <span className="equip_Inspections__equipmentCategory">
                          {inspection.equipmentCategory}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="equip_Inspections__cellIdentifiers">
                        <div className="equip_Inspections__identifierRow">
                          <BoxSelect size={12} />
                          {inspection.equipmentId || 'ID UNSET'}
                        </div>
                        <div className="equip_Inspections__identifierRow">
                          <Hash size={12} />
                          {inspection.serialNumber || 'SN UNSET'}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="equip_Inspections__cellDate">
                        <Calendar size={14} />
                        {new Date(inspection.inspectionDate).toLocaleDateString(
                          undefined,
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`equip_Inspections__status equip_Inspections__status--${statusSlug(
                          inspection.status
                        )}`}
                      >
                        <span className="equip_Inspections__statusDot" />
                        {inspection.status}
                      </span>
                    </td>

                    <td className="equip_Inspections__cellActions">
                      <div className="equip_Inspections__actionGroup">
                        <Link
                          to={`/inspections/${inspection._id}/checklist`}
                          className="equip_Inspections__actionBtn"
                        >
                          {inspection.status === 'Completed'
                            ? 'View Analysis'
                            : 'Resume Work'}{' '}
                          <ArrowRight size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(inspection._id)}
                          className="equip_Inspections__iconBtn"
                          title="Revoke Record"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="equip_Inspections__empty">
                    <ClipboardCheck
                      size={64}
                      className="equip_Inspections__emptyIcon"
                    />
                    <p className="equip_Inspections__emptyText">
                      No inspection logs found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL ─── */}
      {showModal && (
        <div className="equip_Inspections__modalBackdrop">
          <div className="equip_Inspections__modal">
            <button
              onClick={() => setShowModal(false)}
              className="equip_Inspections__modalClose"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="equip_Inspections__modalHeader">
              <h2 className="equip_Inspections__modalTitle">
                Initialize Inspection
              </h2>
              <p className="equip_Inspections__modalSubtitle">
                Configure the parameters for the equipment to be assessed.
              </p>
            </div>

            {/* ─── Pre-selected client banner (NEW) ─── */}
            {preselectedClient && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  marginBottom: 20,
                  background: '#F5EEDD',
                  border: '1px solid #E8DDBE',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #C9AE70, #BA9A59)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 15,
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {preselectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#9C7F41',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Inspection for
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#2A2620',
                      margin: '2px 0 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {preselectedClient.name}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="equip_Inspections__form">
              {/* Row 1: Client + Date */}
              <div className="equip_Inspections__row">
                {/* Row 1: Date only (client is pre-selected from Clients page) */}
                <div className="equip_Inspections__field">
                  <label className="equip_Inspections__label">
                    Assessment Date
                  </label>
                  <input
                    type="date"
                    className="equip_Inspections__input"
                    value={formData.inspectionDate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        inspectionDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
             
              </div>

              {/* Row 2: Category + Equipment */}
              <div className="equip_Inspections__row">
                <div className="equip_Inspections__field">
                  <label className="equip_Inspections__label">
                    Asset Category
                  </label>
                  <select
                    className="equip_Inspections__select"
                    value={formData.equipmentCategory}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        equipmentCategory: e.target.value,
                        equipmentName: '',
                      })
                    }
                    required
                  >
                    <option value="">Choose category...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="equip_Inspections__field">
                  <label className="equip_Inspections__label">
                    Equipment Model
                  </label>
                  <select
                    className="equip_Inspections__select"
                    value={formData.equipmentName}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        equipmentName: e.target.value,
                      })
                    }
                    required
                    disabled={!formData.equipmentCategory}
                  >
                    <option value="">Specify equipment...</option>
                    {formData.equipmentCategory &&
                      EQUIPMENT_DATA[formData.equipmentCategory].map(name => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Asset ID + Serial */}
              <div className="equip_Inspections__row">
                <div className="equip_Inspections__field">
                  <label className="equip_Inspections__label">
                    Model No / Asset ID
                  </label>
                  <input
                    type="text"
                    className="equip_Inspections__input"
                    placeholder="e.g. EQ-PASS-102"
                    value={formData.equipmentId}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        equipmentId: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="equip_Inspections__field">
                  <label className="equip_Inspections__label">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    className="equip_Inspections__input"
                    placeholder="e.g. SERIAL-K-82991"
                    value={formData.serialNumber}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        serialNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                className="equip_Inspections__submit"
              >
                Initialize Checklist <Settings2 size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspections;