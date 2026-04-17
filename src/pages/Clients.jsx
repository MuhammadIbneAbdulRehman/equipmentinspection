import { useState, useEffect } from 'react';
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
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

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
    address: ''
  });

  const { addToast } = useToast();

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
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
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
      addToast(err.response?.data?.message || 'Failed to save client.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this client? All related inspection records will remain.')) {
      try {
        await API.delete(`/clients/${id}`);
        addToast('Client deleted successfully.', 'success');
        fetchClients();
      } catch (err) {
        addToast('Error deleting client.', 'error');
      }
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent-color)' }}>
            <Users size={18} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CRM</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800 }}>Client Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Manage and track your inspection client database.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary" style={{ width: '100%', sm: 'auto' }}>
          <Plus size={20} /> Add New Client
        </button>
      </div>

      <div className="glass-card flex items-center gap-4" style={{ padding: '0 24px', height: 60, boxShadow: 'var(--shadow-sm)' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search by company name or primary contact email..." 
          className="w-full"
          style={{ background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, fontWeight: 500 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>COMPANY / CLIENT NAME</th>
                <th>CONTACT DETAILS</th>
                <th>HEADQUARTERS</th>
                <th>ONBOARDING DATE</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <tr key={client._id}>
                  <td>
                    <div className="flex items-center gap-4">
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-soft)', color: 'var(--accent-color)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16, fontFamily: "'Outfit', sans-serif" }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{client.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1.5">
                      {client.email && <div className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}><Mail size={14} color="var(--text-muted)" /> {client.email}</div>}
                      {client.phone && <div className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}><Phone size={14} color="var(--text-muted)" /> {client.phone}</div>}
                    </div>
                  </td>
                  <td style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                    <div className="flex items-center gap-2"><MapPin size={14} color="var(--text-muted)" /> {client.address || 'Global / Not Set'}</div>
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                    {new Date(client.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex justify-end gap-3 px-4">
                      <button onClick={() => handleOpenModal(client)} className="btn-secondary" style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }} title="Edit Profile">
                        <Edit3 size={18} color="var(--accent-color)" />
                      </button>
                      <button onClick={() => handleDelete(client._id)} className="btn-secondary" style={{ padding: 10, borderRadius: 10, background: '#fef2f2' }} title="Remove Record">
                        <Trash2 size={18} color="var(--danger)" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <Users size={64} />
                      <p style={{ fontSize: 16, fontWeight: 600 }}>Your client directory is currently empty.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '16px' }} className="animate-fade-in">
          <div className="glass-card" style={{ width: '100%', maxWidth: 540, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: 24, top: 24, background: 'var(--accent-soft)', color: 'var(--accent-color)', padding: 6, borderRadius: '50%' }}>
              <X size={20} />
            </button>
            <div className="mb-8">
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>{editingClient ? 'Update Profile' : 'Register Client'}</h2>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>{editingClient ? 'Modify existing client information below.' : 'Add a new company to your inspection database.'}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label>Company Legal Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Prime Engineering Solutions"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="contact@client.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label>Contact Phone</label>
                  <input 
                    type="text" 
                    placeholder="+00 (00) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label>Headquarters Address</label>
                <textarea 
                  placeholder="Street address, Suite, City, Country"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="btn-primary w-full mt-4" style={{ height: 56 }}>
                {editingClient ? <><Edit3 size={18} /> Update Database</> : <><CheckCircle2 size={18} /> Add to Directory</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
