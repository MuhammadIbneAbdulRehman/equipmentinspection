import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Calendar,
  User,
  ExternalLink,
  Edit3,
  X,
  CheckCircle2,
  FileCheck2,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingReport, setViewingReport] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);

  const { addToast } = useToast();

  const fetchReports = async () => {
    try {
      const res = await API.get('/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this report? This action cannot be reversed.')) {
      try {
        await API.delete(`/reports/${id}`);
        addToast('Report purged from database.', 'success');
        fetchReports();
      } catch (err) {
        addToast('Purge failed.', 'error');
      }
    }
  };

  const handleDownload = (id, reportNumber) => {
    const token = localStorage.getItem('pass_token');
    window.open(`/api/reports/${id}/download?token=${token}`, '_blank');
    addToast(`Preparing ${reportNumber} for retrieval...`, 'info');
  };

  const handleUpdateNotes = async () => {
    try {
      await API.put(`/reports/${editingNotes.id}`, {
        findings: editingNotes.findings,
        recommendations: editingNotes.recommendations
      });
      addToast('Report refinements confirmed.', 'success');
      setEditingNotes(null);
      fetchReports();
    } catch (err) {
      addToast('System could not save refinements.', 'error');
    }
  };

  const filteredReports = reports.filter(r => 
    r.reportNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.client?.name.toLowerCase().includes(search.toLowerCase()) ||
    r.inspection?.equipmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent-color)' }}>
            <FileCheck2 size={18} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Archives</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800 }}>Formal Reports</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Manage, analyze and distribute official assessment documentation.</p>
        </div>
      </div>

      <div className="glass-card flex items-center gap-4" style={{ padding: '0 24px', height: 60, boxShadow: 'var(--shadow-sm)' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Lookup reports by unique ID, client entity, or equipment model..." 
          className="w-full"
          style={{ background: 'transparent', border: 'none', padding: '12px 0', fontSize: 15, fontWeight: 500 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: '24px' }}>
        {filteredReports.length > 0 ? filteredReports.map((report) => (
          <div key={report._id} className="glass-card flex flex-col gap-5 border-t-8 animate-fade-in" style={{ borderColor: 'var(--accent-color)', padding: 32 }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ background: 'var(--accent-soft)', color: 'var(--accent-color)', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, display: 'inline-block', marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
                  {report.reportNumber}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>{report.inspection?.equipmentName}</h3>
              </div>
              <button 
                className="btn-secondary" 
                style={{ padding: 8, borderRadius: 10, background: '#f8fafc' }}
              >
                <MoreHorizontal size={20} color="var(--text-muted)" />
              </button>
            </div>

            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center gap-3" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'grid', placeItems: 'center' }}>
                  <User size={16} color="var(--text-muted)" />
                </div>
                {report.client?.name}
              </div>
              <div className="flex items-center gap-3" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'grid', placeItems: 'center' }}>
                  <Calendar size={16} color="var(--text-muted)" />
                </div>
                Authorized: {new Date(report.generatedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setViewingReport(report)}
                className="flex-1 btn-secondary"
                style={{ height: 48, fontSize: 13, border: '1px solid var(--card-border)', background: 'white' }}
              >
                <Eye size={18} /> Inspect Details
              </button>
              <button 
                onClick={() => handleDownload(report._id, report.reportNumber)}
                className="btn-primary" 
                style={{ width: 48, height: 48, padding: 0 }}
                title="Secure Download"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={() => handleDelete(report._id)}
                className="btn-secondary" 
                style={{ width: 48, height: 48, padding: 0, background: '#fef2f2', border: 'none' }}
                title="Erase Archive"
              >
                <Trash2 size={20} color="var(--danger)" />
              </button>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 120, color: 'var(--text-muted)' }}>
            <div className="flex flex-col items-center gap-6 opacity-40">
              <FileCheck2 size={80} />
              <p style={{ fontSize: 18, fontWeight: 600 }}>Archived reports will manifest here once inspections are finalized.</p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewingReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 2000, padding: '16px' }} className="animate-fade-in">
          <div className="glass-card w-full" style={{ maxWidth: 840, maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: 'min(48px, 6vw)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.4)' }}>
            <button onClick={() => setViewingReport(null)} style={{ position: 'absolute', right: 32, top: 32, background: 'var(--accent-soft)', color: 'var(--accent-color)', padding: 8, borderRadius: '50%' }}>
              <X size={24} />
            </button>
            
            <div className="border-b border-slate-100 pb-8 mb-8 sm:mb-10">
              <div style={{ color: 'var(--accent-color)', fontWeight: 800, fontSize: 12, sm: 14, letterSpacing: '0.05em', marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>DOCUMENT ID: {viewingReport.reportNumber}</div>
              <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800 }}>Validation Summary</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-8 sm:mb-10">
              <div className="flex flex-col gap-4">
                <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Authorized Inspector</h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>{viewingReport.inspector?.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--accent-color)', fontWeight: 700, marginTop: 4 }}>LIC: {viewingReport.inspector?.licenseNumber}</p>
                  <div style={{ height: 1, background: 'var(--card-border)', margin: '16px 0' }}></div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{viewingReport.inspector?.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client Organization</h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>{viewingReport.client?.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 500, lineHeight: 1.5 }}>{viewingReport.client?.address || 'Site records not specified'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-8 sm:mb-10">
              <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Equipment Overview & Status</h4>
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col gap-6 sm:gap-8 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/10 p-4 sm:p-5 rounded-2xl border border-white/5 gap-4">
                  <div>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Evaluated Asset</p>
                    <p style={{ fontWeight: 800, fontSize: 18 }}>{viewingReport.inspection?.equipmentName}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Deployment Category</p>
                    <p style={{ fontWeight: 800, fontSize: 18 }}>{viewingReport.inspection?.equipmentCategory}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 size={18} color="var(--success)" />
                      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.6)' }}>Technical Findings</p>
                    </div>
                    <p style={{ lineHeight: 1.8, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.9)' }}>{viewingReport.findings || 'Archive contains no specific findings.'}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Edit3 size={18} color="var(--accent-color)" />
                      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.6)' }}>Recommendations</p>
                    </div>
                    <p style={{ lineHeight: 1.8, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.9)' }}>{viewingReport.recommendations || 'Archive contains no recommendations.'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button onClick={() => setViewingReport(null)} className="btn-secondary w-full sm:w-auto" style={{ padding: '16px 32px' }}>Close Viewer</button>
              <button 
                onClick={() => handleDownload(viewingReport._id, viewingReport.reportNumber)}
                className="btn-primary"
                style={{ padding: '16px 40px' }}
              >
                Download Document <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
