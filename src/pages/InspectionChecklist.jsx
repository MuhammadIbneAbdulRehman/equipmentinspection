// src/pages/InspectionChecklist.jsx

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react';

import CameraModal from '../components/CameraModal';
import QuestionInput from '../components/inspection/QuestionInput';
import {
  groupByStep,
  stepProgress,
  formatStepNumber,
} from '../utils/stepHelpers';

import './styles/InspectionChecklist.css';

/* ══════════════════════════════════════════════════════════════
   HELPER: does this answer require a photo?
   ══════════════════════════════════════════════════════════════ */
const answerRequiresPhoto = r => {
  const a = r.answer;
  if (!a) return false;
  if (r.questionType === 'pass_fail' && a === 'Needs Repair') return true;
  if (r.questionType === 'yes_no' && a === 'No') return true;
  if (r.questionType === 'priority' && ['Critical', 'High'].includes(a))
    return true;
  return false;
};

/* ══════════════════════════════════════════════════════════════
   HELPER: does this question require an answer?
   ══════════════════════════════════════════════════════════════ */
const questionRequiresAnswer = r =>
  r.questionType === 'pass_fail' ||
  r.questionType === 'yes_no' ||
  r.questionType === 'priority';

/* ══════════════════════════════════════════════════════════════
   HELPER: normalize a step's responses for comparison
   ══════════════════════════════════════════════════════════════ */
const normalizeStepResponses = responses => {
  return responses
    .map(r => ({
      stepNumber: r.stepNumber,
      instanceNumber: r.instanceNumber,
      instanceName: r.instanceName || '',
      questionNumber: r.questionNumber,
      answer: r.answer || '',
      notes: r.notes || '',
      imagesCount: (r.images || []).length,
    }))
    .sort((a, b) => {
      if (a.instanceNumber !== b.instanceNumber)
        return a.instanceNumber - b.instanceNumber;
      return a.questionNumber - b.questionNumber;
    });
};

const InspectionChecklist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [uploading, setUploading] = useState({});
  const [cameraOpen, setCameraOpen] = useState(false);
  const [activeUploadTarget, setActiveUploadTarget] = useState(null);

  // Snapshot of responses at last save/load — for dirty tracking
  const [savedSnapshot, setSavedSnapshot] = useState('');

  // ─── Fetch ───
  const fetchInspection = async () => {
    try {
      const res = await API.get(`/inspections/${id}`);
      setInspection(res.data);
      setSavedSnapshot(JSON.stringify(res.data.responses || []));
    } catch (err) {
      setError('System could not retrieve assessment parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [id]);

  // ─── Steps grouped from responses ───
  const steps = useMemo(
    () => (inspection ? groupByStep(inspection.responses) : []),
    [inspection]
  );

  // ─── Global progress ───
  const globalProgress = useMemo(() => {
    if (!inspection)
      return { answered: 0, total: 0, photosMissing: 0, pct: 0 };
    let total = 0;
    let answered = 0;
    let photosMissing = 0;

    for (const r of inspection.responses) {
      if (questionRequiresAnswer(r)) {
        total++;
        if (r.answer) answered++;
      }
      if (
        answerRequiresPhoto(r) &&
        (!r.images || r.images.length === 0)
      ) {
        photosMissing++;
      }
    }
    return {
      answered,
      total,
      photosMissing,
      pct: total ? Math.round((answered / total) * 100) : 0,
    };
  }, [inspection]);

  // ─── Is the CURRENT step dirty (has unsaved changes)? ───
  const isDirty = useMemo(() => {
    if (!inspection || !steps.length) return false;

    const currentStep = steps[activeStepIdx];
    if (!currentStep) return false;

    const currentResponses = [];
    for (const inst of currentStep.instances) {
      for (const r of inst.responses) currentResponses.push(r);
    }

    let savedResponses = [];
    try {
      savedResponses = JSON.parse(savedSnapshot || '[]');
    } catch {
      savedResponses = [];
    }

    const savedForStep = savedResponses.filter(
      r => r.stepNumber === currentStep.stepNumber
    );

    return (
      JSON.stringify(normalizeStepResponses(currentResponses)) !==
      JSON.stringify(normalizeStepResponses(savedForStep))
    );
  }, [inspection, steps, activeStepIdx, savedSnapshot]);

  // ─── Answer / notes ───
  const updateResponse = (instIdx, qIdx, patch) => {
    setInspection(prev => {
      const grouped = groupByStep(prev.responses);
      const step = grouped[activeStepIdx];
      const inst = step.instances[instIdx];
      const target = inst.responses[qIdx];

      const updated = prev.responses.map(r => {
        if (
          r.stepNumber === target.stepNumber &&
          r.instanceNumber === target.instanceNumber &&
          r.questionNumber === target.questionNumber
        ) {
          return { ...r, ...patch };
        }
        return r;
      });
      return { ...prev, responses: updated };
    });
  };

  const handleAnswerChange = (instIdx, qIdx, answer) =>
    updateResponse(instIdx, qIdx, { answer });

  const handleNoteChange = (instIdx, qIdx, notes) =>
    updateResponse(instIdx, qIdx, { notes });

  // ─── Uploads ───
  const openUpload = (instIdx, qIdx, type) => {
    const step = steps[activeStepIdx];
    const inst = step.instances[instIdx];
    const response = inst.responses[qIdx];
    setActiveUploadTarget({ instIdx, qIdx, type, response });

    if (type === 'photo') setCameraOpen(true);
  };

  const handleCameraCapture = async dataUri => {
    if (!dataUri || !activeUploadTarget) return;
    const { instIdx, qIdx, response } = activeUploadTarget;
    const key = `${instIdx}-${qIdx}`;
    setUploading(u => ({ ...u, [key]: true }));

    try {
      const base64 = dataUri.split(',')[1];
      const mimeType = dataUri.substring(5, dataUri.indexOf(';'));

      await API.post(`/inspections/${id}/upload`, {
        stepNumber: response.stepNumber,
        instanceNumber: response.instanceNumber,
        questionNumber: response.questionNumber,
        image: { data: base64, mimeType },
      });

      setInspection(prev => ({
        ...prev,
        responses: prev.responses.map(r =>
          r.stepNumber === response.stepNumber &&
            r.instanceNumber === response.instanceNumber &&
            r.questionNumber === response.questionNumber
            ? {
              ...r,
              images: [...(r.images || []), { data: base64, mimeType }],
            }
            : r
        ),
      }));

      addToast('Evidence attached', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(u => ({ ...u, [key]: false }));
      setCameraOpen(false);
      setActiveUploadTarget(null);
    }
  };

  const handleFileSelect = async (instIdx, qIdx, file) => {
    const step = steps[activeStepIdx];
    const inst = step.instances[instIdx];
    const response = inst.responses[qIdx];
    const key = `${instIdx}-${qIdx}`;

    if (file.size > 1_500_000) {
      addToast('File too large (max ~1.5 MB)', 'error');
      return;
    }

    setUploading(u => ({ ...u, [key]: true }));

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const dataUrl = reader.result;
          resolve(dataUrl.split(',')[1]);
        };
        reader.onerror = reject;
      });

      await API.post(`/inspections/${id}/upload`, {
        stepNumber: response.stepNumber,
        instanceNumber: response.instanceNumber,
        questionNumber: response.questionNumber,
        image: { data: base64, mimeType: file.type },
      });

      setInspection(prev => ({
        ...prev,
        responses: prev.responses.map(r =>
          r.stepNumber === response.stepNumber &&
            r.instanceNumber === response.instanceNumber &&
            r.questionNumber === response.questionNumber
            ? {
              ...r,
              images: [
                ...(r.images || []),
                { data: base64, mimeType: file.type },
              ],
            }
            : r
        ),
      }));

      addToast('Evidence attached', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(u => ({ ...u, [key]: false }));
    }
  };

  const handleRemoveImage = (instIdx, qIdx, imgIdx) => {
    const step = steps[activeStepIdx];
    const target = step.instances[instIdx].responses[qIdx];
    setInspection(prev => ({
      ...prev,
      responses: prev.responses.map(r =>
        r.stepNumber === target.stepNumber &&
          r.instanceNumber === target.instanceNumber &&
          r.questionNumber === target.questionNumber
          ? { ...r, images: r.images.filter((_, i) => i !== imgIdx) }
          : r
      ),
    }));
  };

  // ─── Instance management ───
  const handleAddInstance = () => {
    const step = steps[activeStepIdx];
    const lastInst = step.instances[step.instances.length - 1];
    const newInstanceNumber = lastInst.instanceNumber + 1;

    const newResponses = lastInst.responses.map(r => ({
      ...r,
      instanceNumber: newInstanceNumber,
      instanceName: `${step.stepName} ${newInstanceNumber}`,
      answer: '',
      notes: '',
      images: [],
    }));

    setInspection(prev => ({
      ...prev,
      responses: [...prev.responses, ...newResponses],
    }));
  };

  const handleRenameInstance = (instIdx, name) => {
    const step = steps[activeStepIdx];
    const target = step.instances[instIdx];
    setInspection(prev => ({
      ...prev,
      responses: prev.responses.map(r =>
        r.stepNumber === target.stepNumber &&
          r.instanceNumber === target.instanceNumber
          ? { ...r, instanceName: name }
          : r
      ),
    }));
  };

  const handleRemoveInstance = instIdx => {
    const step = steps[activeStepIdx];
    const target = step.instances[instIdx];
    setInspection(prev => ({
      ...prev,
      responses: prev.responses.filter(
        r =>
          !(
            r.stepNumber === target.stepNumber &&
            r.instanceNumber === target.instanceNumber
          )
      ),
    }));
  };

  // ══════════════════════════════════════════════════════════════
  // VALIDATION
  // ══════════════════════════════════════════════════════════════
  const findUnanswered = (stepNumber = null) => {
    const out = [];
    for (const step of steps) {
      if (stepNumber !== null && step.stepNumber !== stepNumber) continue;
      for (const inst of step.instances) {
        for (const r of inst.responses) {
          if (questionRequiresAnswer(r) && !r.answer) {
            out.push({
              stepNumber: step.stepNumber,
              stepName: step.stepName,
              instanceName: inst.instanceName,
              questionNumber: r.questionNumber,
            });
          }
        }
      }
    }
    return out;
  };

  const findMissingEvidence = (stepNumber = null) => {
    const out = [];
    for (const step of steps) {
      if (stepNumber !== null && step.stepNumber !== stepNumber) continue;
      for (const inst of step.instances) {
        for (const r of inst.responses) {
          if (
            answerRequiresPhoto(r) &&
            (!r.images || r.images.length === 0)
          ) {
            out.push({
              stepNumber: step.stepNumber,
              stepName: step.stepName,
              instanceName: inst.instanceName,
              questionNumber: r.questionNumber,
              answer: r.answer,
            });
          }
        }
      }
    }
    return out;
  };

  const validateScope = (stepNumber = null) => {
    const scopeLabel =
      stepNumber === null
        ? 'all steps'
        : `Step ${formatStepNumber(stepNumber)}`;

    const unanswered = findUnanswered(stepNumber);
    if (unanswered.length > 0) {
      const preview = unanswered
        .slice(0, 3)
        .map(
          u =>
            `• Step ${u.stepNumber}${u.instanceName ? ` (${u.instanceName})` : ''
            } — Q${u.questionNumber}`
        )
        .join('\n');
      const more =
        unanswered.length > 3
          ? `\n...and ${unanswered.length - 3} more`
          : '';
      addToast(
        `Cannot save — ${unanswered.length} unanswered question${unanswered.length > 1 ? 's' : ''
        } in ${scopeLabel}:\n${preview}${more}`,
        'error'
      );
      return false;
    }

    const missing = findMissingEvidence(stepNumber);
    if (missing.length > 0) {
      const preview = missing
        .slice(0, 3)
        .map(
          m =>
            `• Step ${m.stepNumber}${m.instanceName ? ` (${m.instanceName})` : ''
            } — Q${m.questionNumber} (${m.answer})`
        )
        .join('\n');
      const more =
        missing.length > 3 ? `\n...and ${missing.length - 3} more` : '';
      addToast(
        `Photo evidence required — ${missing.length} finding${missing.length > 1 ? 's' : ''
        } in ${scopeLabel}:\n${preview}${more}`,
        'error'
      );
      return false;
    }

    return true;
  };

  // ─── Save current step ───
  const saveCurrentStep = async () => {
    const stepNumber = steps[activeStepIdx]?.stepNumber;
    if (!validateScope(stepNumber)) return;

    setSaving(true);
    try {
      await API.put(`/inspections/${id}`, {
        responses: inspection.responses,
        overallNotes: inspection.overallNotes,
        status: 'In Progress',
      });

      // Refresh snapshot → Save button hides
      setSavedSnapshot(JSON.stringify(inspection.responses || []));

      addToast('Progress saved.', 'success');
    } catch (err) {
      addToast('Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Next step ───
  const goNextStep = () => {
    const stepNumber = steps[activeStepIdx]?.stepNumber;
    if (!validateScope(stepNumber)) return;
    setActiveStepIdx(i => Math.min(steps.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Previous step ───
  const goPrevStep = () => {
    setActiveStepIdx(i => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Finalize ───
  const finalizeInspection = async () => {
    if (!validateScope(null)) return;

    const ok = window.confirm(
      'All questions are answered and evidence is attached. Finalize this inspection?\n\nThis will generate a report and lock the checklist.'
    );
    if (!ok) return;

    setSaving(true);
    try {
      await API.put(`/inspections/${id}`, {
        responses: inspection.responses,
        overallNotes: inspection.overallNotes,
        status: 'Completed',
      });

      setSavedSnapshot(JSON.stringify(inspection.responses || []));

      addToast('Inspection finalized!', 'success');
      navigate('/reports');
    } catch (err) {
      addToast('Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading / error ───
  if (loading) {
    return (
      <div className="equip_Checklist__loading">
        <div className="equip_Checklist__spinner" />
        <p>Securing assessment data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="equip_Checklist__error">
        <AlertTriangle size={48} />
        <h3 className="equip_Checklist__errorTitle">{error}</h3>
        <button
          onClick={() => navigate('/inspections')}
          className="equip_Checklist__returnBtn"
        >
          <ArrowLeft size={16} /> Return to Logs
        </button>
      </div>
    );
  }

  const activeStep = steps[activeStepIdx];
  const isCompleted = inspection.status === 'Completed';
  const isLastStep = activeStepIdx === steps.length - 1;
  const isFirstStep = activeStepIdx === 0;

  return (
    <div className="equip_Checklist">
      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="equip_Checklist__header">
        <div className="equip_Checklist__headerLeft">
          <button
            onClick={() => navigate('/inspections')}
            className="equip_Checklist__backBtn"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="equip_Checklist__headerText">
            <div className="equip_Checklist__titleRow">
              <h1 className="equip_Checklist__title">
                {inspection.equipmentName}
              </h1>
            </div>
            <div className="equip_Checklist__meta">
              <span className="equip_Checklist__metaClient">
                {inspection.client?.name}
              </span>
              <span>•</span>
              <span>ID: {inspection.equipmentId || 'N/A'}</span>
              <span>•</span>
              <span>SN: {inspection.serialNumber || 'N/A'}</span>
              <span>•</span>
              <span>{inspection.status}</span>
            </div>

            <div className="equip_Checklist__globalProgress">
              <div className="equip_Checklist__globalProgressInfo">
                <span className="equip_Checklist__globalProgressLabel">
                  Overall Progress
                </span>
                <span className="equip_Checklist__globalProgressCount">
                  {globalProgress.answered} / {globalProgress.total} answered
                  {globalProgress.photosMissing > 0 && (
                    <>
                      {' • '}
                      <span style={{ color: '#dc2626' }}>
                        {globalProgress.photosMissing} photo
                        {globalProgress.photosMissing > 1 ? 's' : ''} required
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="equip_Checklist__globalProgressBar">
                <div
                  className={`equip_Checklist__globalProgressFill ${globalProgress.pct === 100
                      ? 'equip_Checklist__globalProgressFill--done'
                      : ''
                    }`}
                  style={{ width: `${globalProgress.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {isCompleted && (
          <div className="equip_Checklist__actions">
            <button
              onClick={() => navigate('/reports')}
              className="equip_Checklist__finalizeBtn"
            >
              <CheckCircle2 size={16} /> View Report
            </button>
          </div>
        )}
      </header>

      {/* ═══════════════ LAYOUT ═══════════════ */}
      <div className="equip_Checklist__layout">
        <aside className="equip_Checklist__sidebar">
          <p className="equip_Checklist__sidebarLabel">Steps</p>
          <div className="equip_Checklist__stepList">
            {steps.map((step, idx) => {
              const prog = stepProgress(step.instances);
              const isActive = idx === activeStepIdx;
              const isDone = prog.pct === 100;
              return (
                <button
                  key={step.stepNumber}
                  onClick={() => {
                    setActiveStepIdx(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`equip_Checklist__stepBtn ${isActive ? 'equip_Checklist__stepBtn--active' : ''
                    }`}
                >
                  <div className="equip_Checklist__stepHeader">
                    <span className="equip_Checklist__stepNumber">
                      Step {formatStepNumber(step.stepNumber)}
                    </span>
                    <span className="equip_Checklist__stepProgress">
                      {prog.answered}/{prog.total}
                    </span>
                  </div>
                  <p className="equip_Checklist__stepName">
                    {step.stepName}
                  </p>
                  <div className="equip_Checklist__stepBar">
                    <div
                      className={`equip_Checklist__stepBarFill ${isDone ? 'equip_Checklist__stepBarFill--done' : ''
                        }`}
                      style={{ width: `${prog.pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="equip_Checklist__main">
          {activeStep && (
            <>
              <div className="equip_Checklist__mainHeader">
                <div className="equip_Checklist__mainMeta">
                  <span className="equip_Checklist__badge">
                    Step {formatStepNumber(activeStep.stepNumber)}
                  </span>
                  <span className="equip_Checklist__mainCount">
                    {stepProgress(activeStep.instances).answered}/
                    {stepProgress(activeStep.instances).total} answered
                  </span>
                </div>
                <h2 className="equip_Checklist__mainTitle">
                  {activeStep.stepName}
                </h2>
              </div>

              {(activeStep.instances.length > 1 ||
                activeStep.instances[0]?.instanceName) && (
                  <div className="equip_Checklist__instancesBar">
                    <span className="equip_Checklist__instancesLabel">
                      Instances ({activeStep.instances.length})
                    </span>
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={handleAddInstance}
                        className="equip_Checklist__addInstanceBtn"
                      >
                        <Plus size={14} /> Add Another
                      </button>
                    )}
                    <div className="equip_Checklist__instanceChips">
                      {activeStep.instances.map((inst, instIdx) => (
                        <div
                          key={instIdx}
                          className="equip_Checklist__instanceChip"
                        >
                          <span className="equip_Checklist__instanceChipNum">
                            #{instIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={inst.instanceName || ''}
                            onChange={e =>
                              handleRenameInstance(instIdx, e.target.value)
                            }
                            placeholder={`Instance ${instIdx + 1}`}
                            disabled={isCompleted}
                          />
                          {!isCompleted &&
                            activeStep.instances.length > 1 && (
                              <button
                                type="button"
                                className="equip_Checklist__instanceChipRemove"
                                onClick={() => handleRemoveInstance(instIdx)}
                                aria-label="Remove instance"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {activeStep.instances.map((inst, instIdx) => (
                <div
                  key={instIdx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    marginBottom: 24,
                  }}
                >
                  {activeStep.instances.length > 1 && inst.instanceName && (
                    <div
                      style={{
                        padding: '10px 16px',
                        background:
                          'linear-gradient(90deg, #F5EEDD, transparent)',
                        borderLeft: '4px solid #BA9A59',
                        borderRadius: 8,
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: 800,
                        color: '#7E6534',
                      }}
                    >
                      {inst.instanceName}
                    </div>
                  )}

                  {inst.responses.map((r, qIdx) => (
                    <QuestionInput
                      key={`${instIdx}-${qIdx}`}
                      question={r}
                      response={r}
                      disabled={isCompleted}
                      uploading={uploading[`${instIdx}-${qIdx}`]}
                      onAnswerChange={val =>
                        handleAnswerChange(instIdx, qIdx, val)
                      }
                      onNoteChange={val =>
                        handleNoteChange(instIdx, qIdx, val)
                      }
                      onUploadClick={type =>
                        openUpload(instIdx, qIdx, type)
                      }
                      onFileSelect={file =>
                        handleFileSelect(instIdx, qIdx, file)
                      }
                      onRemoveImage={imgIdx =>
                        handleRemoveImage(instIdx, qIdx, imgIdx)
                      }
                    />
                  ))}
                </div>
              ))}

              {isLastStep && (
                <div className="equip_Checklist__summaryCard">
                  <div>
                    <h3 className="equip_Checklist__summaryTitle">
                      Master Assessment Summary
                    </h3>
                    <p className="equip_Checklist__summarySub">
                      Provide a final conclusion on the equipment's overall
                      integrity and operation.
                    </p>
                  </div>
                  <textarea
                    className="equip_Checklist__textarea"
                    placeholder="Synthesize overall findings, major safety concerns, and operational status..."
                    value={inspection.overallNotes || ''}
                    onChange={e =>
                      setInspection({
                        ...inspection,
                        overallNotes: e.target.value,
                      })
                    }
                    disabled={isCompleted}
                    rows={5}
                  />
                </div>
              )}

              {/* ═══════════════ STEP FOOTER ═══════════════ */}
              {!isCompleted && (
                <div
                  className={`equip_Checklist__stepFooter ${!isDirty ? 'equip_Checklist__stepFooter--no-save' : ''
                    }`}
                >
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={goPrevStep}
                    disabled={isFirstStep}
                    className="equip_Checklist__stepFooterBtn equip_Checklist__stepFooterBtn--nav"
                  >
                    <ArrowLeft size={16} /> Previous
                  </button>

                  {/* Save — only when there are unsaved changes */}
                  {isDirty && (
                    <button
                      type="button"
                      onClick={saveCurrentStep}
                      disabled={saving}
                      className="equip_Checklist__stepFooterBtn equip_Checklist__stepFooterBtn--save"
                    >
                      <Save size={16} />{' '}
                      {saving ? 'Saving…' : 'Save Progress'}
                    </button>
                  )}

                  {/* Next or Finalize */}
                  {!isLastStep ? (
                    <button
                      type="button"
                      onClick={goNextStep}
                      className="equip_Checklist__stepFooterBtn equip_Checklist__stepFooterBtn--next"
                    >
                      Next Step <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={finalizeInspection}
                      disabled={saving}
                      className="equip_Checklist__stepFooterBtn equip_Checklist__stepFooterBtn--finalize"
                    >
                      <CheckCircle2 size={16} />
                      {saving ? 'Finalizing…' : 'Finalize Inspection'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <CameraModal
        isOpen={cameraOpen}
        onClose={() => {
          setCameraOpen(false);
          setActiveUploadTarget(null);
        }}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default InspectionChecklist;