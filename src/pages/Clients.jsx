// src/pages/Clients.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';        // ← NEW
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ClipboardCheck,                                       // ← NEW
} from 'lucide-react';
import './styles/Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const { addToast } = useToast();
  const navigate = useNavigate();                       // ← NEW

  const fetchClients = async () => {
    try {
      const res = await API.get('/clients');
      setClients(res.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingClient) {
        await API.put(`/clients/${editingClient._id}`, formData);
        addToast('Client successfully updated!', 'success');
      } else {
        await API.post('/clients', formData);
        addToast('Client successfully added!', 'success');
      }
      setShowModal(false);
      fetchClients();
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to save client.',
        'error'
      );
    }
  };

  const handleDelete = async id => {
    if (
      window.confirm(
        'Delete this client? All related inspection records will remain.'
      )
    ) {
      try {
        await API.delete(`/clients/${id}`);
        addToast('Client deleted successfully.', 'success');
        fetchClients();
      } catch (err) {
        addToast('Error deleting client.', 'error');
      }
    }
  };

  // ─── NEW: Start inspection for this client ───
  const handleStartInspection = client => {
    navigate(`/inspections?clientId=${client._id}`);
  };

  const filteredClients = clients.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="equip_Clients">
      {/* ─── HEADER ─── */}
      <header className="equip_Clients__header">
        <div>
          <div className="equip_Clients__eyebrow">
            <Users size={16} />
            <span>CRM</span>
          </div>
          <h1 className="equip_Clients__title">Client Directory</h1>
          <p className="equip_Clients__subtitle">
            Manage and track your inspection client database.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="equip_Clients__addBtn"
        >
          <Plus size={18} /> Add New Client
        </button>
      </header>

      {/* ─── SEARCH ─── */}
      <div className="equip_Clients__search">
        <Search size={20} className="equip_Clients__searchIcon" />
        <input
          type="text"
          placeholder="Search by company name or primary contact email..."
          className="equip_Clients__searchInput"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ─── TABLE ─── */}
      <div className="equip_Clients__tableCard">
        <div className="equip_Clients__tableScroll">
          <table className="equip_Clients__table">
            <thead>
              <tr>
                <th>Company / Client Name</th>
                <th>Contact Details</th>
                <th>Headquarters</th>
                <th>Onboarding Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <tr key={client._id}>
                    <td>
                      <div className="equip_Clients__cellName">
                        <div className="equip_Clients__avatar">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="equip_Clients__name">
                          {client.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="equip_Clients__cellContact">
                        {client.email && (
                          <div className="equip_Clients__contactRow equip_Clients__contactRow--email">
                            <Mail size={14} /> {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="equip_Clients__contactRow equip_Clients__contactRow--phone">
                            <Phone size={14} /> {client.phone}
                          </div>
                        )}
                        {!client.email && !client.phone && (
                          <span style={{ color: '#9C9588', fontSize: 13 }}>
                            No contact info
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="equip_Clients__cellAddress">
                        <MapPin size={14} />
                        <span className="equip_Clients__cellAddressText">
                          {client.address || 'Global / Not Set'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="equip_Clients__cellDate">
                        {new Date(client.createdAt).toLocaleDateString(
                          undefined,
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                      </span>
                    </td>
                    <td className="equip_Clients__cellActions">
                      <div className="equip_Clients__actionGroup">
                        {/* ─── NEW: Start Inspection ─── */}
                        <button
                          onClick={() => handleStartInspection(client)}
                          className="equip_Clients__iconBtn equip_Clients__iconBtn--primary"
                          title="Start Inspection"
                          aria-label="Start Inspection"
                        >
                          <ClipboardCheck size={16} />
                        </button>

                        <button
                          onClick={() => handleOpenModal(client)}
                          className="equip_Clients__iconBtn"
                          title="Edit Profile"
                          aria-label="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="equip_Clients__iconBtn equip_Clients__iconBtn--danger"
                          title="Remove Record"
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
                  <td colSpan="5" className="equip_Clients__empty">
                    <Users
                      size={64}
                      className="equip_Clients__emptyIcon"
                    />
                    <p className="equip_Clients__emptyText">
                      Your client directory is currently empty.
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
        <div className="equip_Clients__modalBackdrop">
          <div className="equip_Clients__modal">
            <button
              onClick={() => setShowModal(false)}
              className="equip_Clients__modalClose"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="equip_Clients__modalHeader">
              <h2 className="equip_Clients__modalTitle">
                {editingClient ? 'Update Profile' : 'Register Client'}
              </h2>
              <p className="equip_Clients__modalSubtitle">
                {editingClient
                  ? 'Modify existing client information below.'
                  : 'Add a new company to your inspection database.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="equip_Clients__form">
              <div className="equip_Clients__field">
                <label className="equip_Clients__label">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prime Engineering Solutions"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="equip_Clients__input"
                />
              </div>

              <div className="equip_Clients__row">
                <div className="equip_Clients__field">
                  <label className="equip_Clients__label">Email Address</label>
                  <input
                    type="email"
                    placeholder="contact@client.com"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="equip_Clients__input"
                  />
                </div>
                <div className="equip_Clients__field">
                  <label className="equip_Clients__label">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+00 (00) 000-0000"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="equip_Clients__input"
                  />
                </div>
              </div>

              <div className="equip_Clients__field">
                <label className="equip_Clients__label">
                  Headquarters Address
                </label>
                <textarea
                  placeholder="Street address, Suite, City, Country"
                  rows={3}
                  value={formData.address}
                  onChange={e =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="equip_Clients__textarea"
                />
              </div>

              <button type="submit" className="equip_Clients__submit">
                {editingClient ? (
                  <>
                    <Edit3 size={18} /> Update Database
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Add to Directory
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;