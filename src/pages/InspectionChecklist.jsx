import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Camera, 
  AlertCircle,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Info,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import CameraModal from '../components/CameraModal';

const InspectionChecklist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState({}); // { questionNumber: true/false }
  const [cameraOpen, setCameraOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const fetchInspection = async () => {
    try {
      const res = await API.get(`/inspections/${id}`);
      setInspection(res.data);
    } catch (err) {
      setError('System could not retrieve assessment parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [id]);

  const handleAnswerChange = (qIndex, answer) => {
    const updatedResponses = [...inspection.responses];
    updatedResponses[qIndex].answer = answer;
    setInspection({ ...inspection, responses: updatedResponses });
  };

  const handleNoteChange = (qIndex, notes) => {
    const updatedResponses = [...inspection.responses];
    updatedResponses[qIndex].notes = notes;
    setInspection({ ...inspection, responses: updatedResponses });
  };

  const performFileUpload = async (qNumber, file) => {
    setUploading(prev => ({ ...prev, [qNumber]: true }));
    const formData = new FormData();
    formData.append('image', file);
    formData.append('questionNumber', qNumber);

    try {
      await API.post(`/inspections/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast(`Evidence attached to item #${qNumber}`, 'success');
      fetchInspection();
    } catch (err) {
      addToast('Document upload failed.', 'error');
    } finally {
      setUploading(prev => ({ ...prev, [qNumber]: false }));
    }
  };

  const handleImageUpload = async (qNumber, e) => {
    const file = e.target.files[0];
    if (!file) return;
    await performFileUpload(qNumber, file);
  };

  const handleCameraCapture = async (dataUri) => {
    if (!dataUri || !activeQuestion) return;
    
    try {
      const res = await fetch(dataUri);
      const blob = await res.blob();
      const file = new File([blob], `capture_${activeQuestion}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      await performFileUpload(activeQuestion, file);
    } catch (err) {
      addToast('Failed to process camera image.', 'error');
    }
  };

  const openCamera = (qNumber) => {
    setActiveQuestion(qNumber);
    setCameraOpen(true);
  };

  const saveChecklist = async (isComplete = false) => {
    setSaving(true);
    try {
      const payload = {
        responses: inspection.responses,
        overallNotes: inspection.overallNotes,
        status: isComplete ? 'Completed' : 'In Progress'
      };
      await API.put(`/inspections/${id}`, payload);
      
      if (isComplete) {
        addToast('Inspection finalized and report staged!', 'success');
        navigate('/reports');
      } else {
        addToast('Progress successfully committed to database.', 'info');
      }
    } catch (err) {
      addToast('Failed to commit inspection changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ height: '80vh', display: 'grid', placeItems: 'center' }}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Securing Assessment Data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ height: '80vh', display: 'grid', placeItems: 'center' }}>
      <div className="flex flex-col items-center gap-4 text-danger glass-card">
        <AlertTriangle size={48} />
        <p style={{ fontWeight: 700 }}>{error}</p>
        <button onClick={() => navigate('/inspections')} className="btn-secondary">Return to Logs</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 pb-32 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
          <button onClick={() => navigate('/inspections')} className="btn-secondary" style={{ padding: 12, borderRadius: 14, flexShrink: 0 }}>
            <ArrowLeft size={24} />
          </button>
          <div className="overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inspection.equipmentName}</h1>
              <span className={`badge badge-${inspection.status.toLowerCase().replace(' ', '-')} w-fit`}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div>
                {inspection.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span style={{ color: 'var(--accent-color)' }}>{inspection.client?.name}</span> • ID: {inspection.equipmentId || 'N/A'} • SN: {inspection.serialNumber || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {inspection.status !== 'Completed' && (
            <>
              <button 
                onClick={() => saveChecklist(false)} 
                disabled={saving}
                className="btn-secondary flex-1 sm:flex-initial"
                style={{ height: 52 }}
              >
                <Save size={18} /> {saving ? 'Commiting...' : 'Save Progress'}
              </button>
              <button 
                onClick={() => saveChecklist(true)} 
                disabled={saving}
                className="btn-primary flex-1 sm:flex-initial"
                style={{ height: 52 }}
              >
                <CheckCircle2 size={18} /> Finalize Assessment
              </button>
            </>
          )}
          {inspection.status === 'Completed' && (
            <button onClick={() => navigate('/reports')} className="btn-primary w-full sm:w-auto" style={{ height: 52 }}>
              View Staged Report
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {inspection.responses.map((q, idx) => (
          <div key={q.questionNumber} className="glass-card flex flex-col gap-6" style={{ 
            opacity: inspection.status === 'Completed' ? 0.9 : 1,
            position: 'relative',
            padding: 32
          }}>
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="flex gap-4 sm:gap-6">
                <div style={{ 
                  width: 36, height: 36, borderRadius: 12, 
                  background: q.answer === 'Pass' ? 'var(--success-soft)' : q.answer === 'Fail' ? 'var(--danger-soft)' : 'var(--accent-soft)', 
                  color: q.answer === 'Pass' ? 'var(--success)' : q.answer === 'Fail' ? 'var(--danger)' : 'var(--accent-color)', 
                  display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0,
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {q.questionNumber}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, sm: 18, fontWeight: 700, lineHeight: 1.4 }}>{q.questionText}</h3>
                  {q.answer && <div className="mt-2 flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 700, color: q.answer === 'Pass' ? 'var(--success)' : q.answer === 'Fail' ? 'var(--danger)' : 'var(--accent-color)' }}>
                    <Check size={14} strokeWidth={3} /> {q.answer.toUpperCase()} RECORDED
                  </div>}
                </div>
              </div>

              <div className="flex w-full lg:w-auto gap-3 p-1 rounded-2xl">
                {[
                  { id: 'Pass', label: 'OK', icon: <CheckCircle2 size={18} />, color: 'var(--success)' },
                  { id: 'Fail', label: 'REPAIR', icon: <AlertCircle size={18} />, color: 'var(--danger)' },
                  { id: 'N/A', label: 'N/A', icon: <Info size={18} />, color: 'var(--accent-color)' }
                ].map(ans => (
                  <button
                    key={ans.id}
                    onClick={() => inspection.status !== 'Completed' && handleAnswerChange(idx, ans.id)}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: 16,
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      background: q.answer === ans.id ? ans.color : 'var(--glass-bg)',
                      color: q.answer === ans.id ? 'white' : 'var(--text-secondary)',
                      border: `2px solid ${q.answer === ans.id ? ans.color : 'var(--card-border)'}`,
                      boxShadow: q.answer === ans.id ? `0 8px 20px -6px ${ans.color}66` : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: q.answer === ans.id ? 'translateY(-2px)' : 'none'
                    }}
                    className={inspection.status === 'Completed' ? 'cursor-default' : 'hover:border-opacity-50'}
                  >
                    {ans.icon}
                    {ans.label}
                  </button>
                ))}
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col gap-2">
                <label>Inspector Findings / Technical Notes</label>
                <textarea
                  placeholder="Record specific observations or measurements for this entry..."
                  value={q.notes}
                  onChange={(e) => handleNoteChange(idx, e.target.value)}
                  disabled={inspection.status === 'Completed'}
                  rows={3}
                  style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6 }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Visual Evidence / Photos</label>
                <div className="flex flex-wrap gap-4">
                  {q.images?.map((img, iIdx) => (
                    <div key={iIdx} style={{ position: 'relative', width: 104, height: 104, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
                      <img src={img} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                  
                  {inspection.status !== 'Completed' && (
                    <div 
                      onClick={() => !uploading[q.questionNumber] && openCamera(q.questionNumber)}
                      style={{ 
                        width: 104, height: 104, borderRadius: 16, border: '2px dashed var(--card-border)', 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 8, cursor: 'pointer', color: 'var(--text-muted)', transition: 'var(--transition)',
                        background: '#fcfdfe'
                      }} 
                      className="hover:border-accent hover:bg-accent-soft hover:text-accent"
                    >
                      {uploading[q.questionNumber] ? <Loader2 className="animate-spin" size={20} /> : <Camera size={24} />}
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{uploading[q.questionNumber] ? 'UPLOADING' : 'RECAPTURE'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="glass-card flex flex-col gap-6 mt-4" style={{ padding: 40, borderLeft: '6px solid var(--accent-color)' }}>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 800 }}>Master Assessment Summary</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Provide a final conclusion on the equipment's overall integrity and operation.</p>
          </div>
          <textarea
            placeholder="Synthesize overall findings, major safety concerns, and operational status..."
            value={inspection.overallNotes}
            onChange={(e) => setInspection({...inspection, overallNotes: e.target.value})}
            disabled={inspection.status === 'Completed'}
            rows={5}
            style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}
          />
          
          {inspection.status !== 'Completed' && (
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => saveChecklist(true)} 
                className="btn-primary w-full sm:w-auto"
                style={{ padding: '16px 48px', height: 60, fontSize: 16 }}
              >
                Complete & Finalize Report
              </button>
            </div>
          )}
        </div>
      </div>

      <CameraModal 
        isOpen={cameraOpen} 
        onClose={() => setCameraOpen(false)} 
        onCapture={handleCameraCapture} 
      />
    </div>
  );
};

export default InspectionChecklist;
