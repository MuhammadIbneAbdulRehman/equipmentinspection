import { useState, useEffect } from 'react';
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
  MoreVertical
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
    inspectionDate: new Date().toISOString().split('T')[0]
  });

  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [insRes, cliRes] = await Promise.all([
        API.get('/inspections'),
        API.get('/clients')
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

  const handleSubmit = async (e) => {
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

  const handleDelete = async (id) => {
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

  const filteredInspections = inspections.filter(i => 
    i.client?.name.toLowerCase().includes(search.toLowerCase()) ||
    i.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
    i.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent-color)' }}>
            <ClipboardCheck size={18} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logs</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800 }}>Inspection Logs</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Track all assessed equipment and their current status.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ width: '100%', sm: 'auto' }}>
          <Plus size={20} /> New Inspection
        </button>
      </div>

      <div className="glass-card flex items-center gap-4" style={{ padding: '0 24px', height: 60, boxShadow: 'var(--shadow-sm)' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search logs by client, equipment type, or status..." 
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
                <th>CLIENT / COMPANY</th>
                <th>EQUIPMENT SPECIFICATIONS</th>
                <th>ASSET IDENTIFIERS</th>
                <th>ACTIVITY DATE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>OPERATIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.length > 0 ? filteredInspections.map((inspection) => (
                <tr key={inspection._id}>
                  <td style={{ fontWeight: 700, fontSize: 15 }}>{inspection.client?.name}</td>
                  <td>
                    <div className="flex flex-col">
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{inspection.equipmentName}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700 }}>{inspection.equipmentCategory}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1.5" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      <div className="flex items-center gap-1.5"><BoxSelect size={12} color="var(--text-muted)" /> {inspection.equipmentId || 'ID UNSET'}</div>
                      <div className="flex items-center gap-1.5"><Hash size={12} color="var(--text-muted)" /> {inspection.serialNumber || 'SN UNSET'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      <Calendar size={14} color="var(--text-muted)" /> 
                      {new Date(inspection.inspectionDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${inspection.status.toLowerCase().replace(' ', '-')}`}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div>
                      {inspection.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex justify-end gap-3 px-4">
                      <Link to={`/inspections/${inspection._id}/checklist`} style={{ textDecoration: 'none' }}>
                        <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: 10, background: '#f8fafc', fontSize: 13, fontWeight: 700 }}>
                          {inspection.status === 'Completed' ? 'View Analysis' : 'Resume Work'} <ArrowRight size={16} />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(inspection._id)} className="btn-secondary" style={{ padding: 10, borderRadius: 10, background: '#fef2f2' }} title="Revoke Record">
                        <Trash2 size={18} color="var(--danger)" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <ClipboardCheck size={64} />
                      <p style={{ fontSize: 16, fontWeight: 600 }}>No inspection logs found.</p>
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
          <div className="glass-card" style={{ width: '100%', maxWidth: 640, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: 24, top: 24, background: 'var(--accent-soft)', color: 'var(--accent-color)', padding: 6, borderRadius: '50%' }}>
              <X size={20} />
            </button>
            <div className="mb-8">
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>Initialize Inspection</h2>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Configure the parameters for the equipment to be assessed.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label>Assign to Client</label>
                  <select 
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    required
                  >
                    <option value="">Choose partner...</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label>Assessment Date</label>
                  <input 
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) => setFormData({...formData, inspectionDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label>Asset Category</label>
                  <select 
                    value={formData.equipmentCategory}
                    onChange={(e) => setFormData({...formData, equipmentCategory: e.target.value, equipmentName: ''})}
                    required
                  >
                    <option value="">Choose category...</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label>Equipment Model</label>
                  <select 
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({...formData, equipmentName: e.target.value})}
                    required
                    disabled={!formData.equipmentCategory}
                  >
                    <option value="">Specify equipment...</option>
                    {formData.equipmentCategory && EQUIPMENT_DATA[formData.equipmentCategory].map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label>Asset ID / Tag</label>
                  <input 
                    type="text" 
                    placeholder="e.g. EQ-PASS-102"
                    value={formData.equipmentId}
                    onChange={(e) => setFormData({...formData, equipmentId: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label>Serial Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SERIAL-K-82991"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-4" style={{ height: 56 }}>
                Initialize Checklist <Settings2 size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspections;
