// src/pages/Reports.jsx

import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  Download,
  Eye,
  Trash2,
  Search,
  Calendar,
  User,
  Edit3,
  X,
  CheckCircle2,
  FileCheck2,
  MoreHorizontal,
  AlertTriangle,
  TrendingUp,
  Award,
  Activity,
} from 'lucide-react';
import './styles/Reports.css';

// ═══════════════════════════════════════════════════════════════
//  STATS HELPERS
// ═══════════════════════════════════════════════════════════════

const computeStats = (responses = []) => {
  const pf = responses.filter(r => r.questionType === 'pass_fail');
  const ok = pf.filter(r => r.answer === 'OK').length;
  const repair = pf.filter(r => r.answer === 'Needs Repair').length;
  const na = pf.filter(r => r.answer === 'N/A').length;
  const applicable = ok + repair;
  const score = applicable > 0 ? Math.round((ok / applicable) * 100) : 0;

  let grade = 'F';
  let gradeLabel = 'Critical';
  if (score >= 90) { grade = 'A'; gradeLabel = 'Excellent'; }
  else if (score >= 75) { grade = 'B'; gradeLabel = 'Good'; }
  else if (score >= 60) { grade = 'C'; gradeLabel = 'Fair'; }
  else if (score >= 40) { grade = 'D'; gradeLabel = 'Poor'; }

  let verdict = 'PASS';
  if (repair > 0) verdict = 'PASS WITH REPAIRS';
  if (score < 50) verdict = 'FAIL';

  return {
    ok, repair, na,
    total: pf.length,
    applicable,
    score, grade, gradeLabel, verdict,
    okPct: pf.length ? Math.round((ok / pf.length) * 100) : 0,
    repairPct: pf.length ? Math.round((repair / pf.length) * 100) : 0,
    naPct: pf.length ? Math.round((na / pf.length) * 100) : 0,
  };
};

const computeStepStats = (responses = []) => {
  // Group by stepNumber
  const map = new Map();
  for (const r of responses) {
    const key = `${r.stepNumber}`;
    if (!map.has(key)) {
      map.set(key, {
        stepNumber: r.stepNumber,
        stepName: r.stepName,
        responses: [],
      });
    }
    map.get(key).responses.push(r);
  }

  const groups = Array.from(map.values())
    .sort((a, b) => a.stepNumber - b.stepNumber);

  return groups.map(g => {
    const pf = g.responses.filter(r => r.questionType === 'pass_fail');
    const ok = pf.filter(r => r.answer === 'OK').length;
    const repair = pf.filter(r => r.answer === 'Needs Repair').length;
    const na = pf.filter(r => r.answer === 'N/A').length;
    const applicable = ok + repair;
    const score = applicable > 0 ? Math.round((ok / applicable) * 100) : 100;

    let status = 'OK';
    let statusColor = '#10b981';
    if (repair > 0 && score >= 70) { status = 'Needs Attention'; statusColor = '#e67e22'; }
    else if (repair > 0) { status = 'Critical'; statusColor = '#e53935'; }

    return {
      stepNumber: g.stepNumber,
      stepName: g.stepName,
      ok, repair, na,
      total: pf.length,
      score, status, statusColor,
    };
  });
};

const scoreColor = (score) => {
  if (score >= 90) return '#10b981';
  if (score >= 75) return '#6ba644';
  if (score >= 60) return '#C9AE70';
  if (score >= 40) return '#e67e22';
  return '#e53935';
};

const scoreBg = (score) => {
  if (score >= 90) return 'rgba(16, 185, 129, 0.12)';
  if (score >= 75) return 'rgba(107, 166, 68, 0.12)';
  if (score >= 60) return 'rgba(201, 174, 112, 0.15)';
  if (score >= 40) return 'rgba(230, 126, 34, 0.12)';
  return 'rgba(229, 57, 53, 0.12)';
};

// ═══════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingReport, setViewingReport] = useState(null);

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

  const handleDelete = async id => {
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

  const handleDownload = async (id, reportNumber) => {
    try {
      addToast(`Preparing ${reportNumber}...`, 'info');
      const token = localStorage.getItem('pass_token');

      const res = await fetch(`/api/reports/${id}/download`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Download failed: ${res.status}`);

      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `${reportNumber}.docx`;

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      addToast(`${reportNumber} downloaded.`, 'success');
    } catch (err) {
      console.error('Download error:', err);
      addToast('Download failed. Please try again.', 'error');
    }
  };

  const filteredReports = reports.filter(
    r =>
      r.reportNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.inspection?.equipmentName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="equip_Reports">
      {/* ─── HEADER ─── */}
      <header className="equip_Reports__header">
        <div>
          <div className="equip_Reports__eyebrow">
            <FileCheck2 size={16} />
            <span>Archives</span>
          </div>
          <h1 className="equip_Reports__title">Formal Reports</h1>
          <p className="equip_Reports__subtitle">
            Manage, analyze and distribute official assessment documentation.
          </p>
        </div>
      </header>

      {/* ─── SEARCH ─── */}
      <div className="equip_Reports__search">
        <Search size={20} className="equip_Reports__searchIcon" />
        <input
          type="text"
          placeholder="Lookup reports by unique ID, client entity, or equipment model..."
          className="equip_Reports__searchInput"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ─── GRID ─── */}
      <div className="equip_Reports__grid">
        {filteredReports.length > 0 ? (
          filteredReports.map(report => {
            const stats = report.inspection?.responses
              ? computeStats(report.inspection.responses)
              : null;

            return (
              <div key={report._id} className="equip_Reports__card">
                {/* Header */}
                <div className="equip_Reports__cardHeader">
                  <div className="equip_Reports__cardHeaderLeft">
                    <div className="equip_Reports__reportNumber">
                      {report.reportNumber}
                    </div>
                    <h3 className="equip_Reports__equipmentName">
                      {report.inspection?.equipmentName || 'Report'}
                    </h3>
                  </div>
                  <button
                    className="equip_Reports__menuBtn"
                    aria-label="More options"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Stats row */}
                {stats && (
                  <div className="equip_Reports__statsRow">
                    <div
                      className="equip_Reports__scoreBadge"
                      style={{
                        background: scoreBg(stats.score),
                        borderColor: scoreColor(stats.score),
                      }}
                    >
                      <span
                        className="equip_Reports__scoreBadgeValue"
                        style={{ color: scoreColor(stats.score) }}
                      >
                        {stats.score}
                      </span>
                      <span
                        className="equip_Reports__scoreBadgeGrade"
                        style={{ color: scoreColor(stats.score) }}
                      >
                        {stats.grade}
                      </span>
                    </div>

                    <div className="equip_Reports__pillGroup">
                      <span className="equip_Reports__pill equip_Reports__pill--ok">
                        {stats.ok} OK
                      </span>
                      <span className="equip_Reports__pill equip_Reports__pill--repair">
                        {stats.repair} Repair
                      </span>
                      <span className="equip_Reports__pill equip_Reports__pill--na">
                        {stats.na} N/A
                      </span>
                    </div>

                    <div
                      className="equip_Reports__verdict"
                      style={{
                        background:
                          stats.verdict === 'PASS'
                            ? '#10b981'
                            : stats.verdict === 'FAIL'
                              ? '#e53935'
                              : '#e67e22',
                      }}
                    >
                      {stats.verdict}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="equip_Reports__meta">
                  <div className="equip_Reports__metaRow">
                    <div className="equip_Reports__metaIcon">
                      <User size={15} />
                    </div>
                    <span className="equip_Reports__metaText">
                      {report.client?.name || 'Unknown Client'}
                    </span>
                  </div>
                  <div className="equip_Reports__metaRow">
                    <div className="equip_Reports__metaIcon">
                      <Calendar size={15} />
                    </div>
                    <span className="equip_Reports__metaText">
                      {new Date(report.generatedAt).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="equip_Reports__cardFooter">
                  <button
                    onClick={() => setViewingReport(report)}
                    className="equip_Reports__inspectBtn"
                  >
                    <Eye size={16} /> Inspect Details
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(report._id, report.reportNumber)
                    }
                    className="equip_Reports__iconBtn equip_Reports__iconBtn--primary"
                    title="Secure Download"
                    aria-label="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(report._id)}
                    className="equip_Reports__iconBtn equip_Reports__iconBtn--danger"
                    title="Erase Archive"
                    aria-label="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="equip_Reports__empty">
            <FileCheck2 size={72} className="equip_Reports__emptyIcon" />
            <p className="equip_Reports__emptyText">
              Archived reports will appear here once inspections are finalized.
            </p>
          </div>
        )}
      </div>

      {/* ─── DETAIL MODAL ─── */}
      {viewingReport && (
        <DetailModal
          report={viewingReport}
          onClose={() => setViewingReport(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  DETAIL MODAL — STATS ONLY, NO QUESTION LIST
// ═══════════════════════════════════════════════════════════════

const DetailModal = ({ report, onClose, onDownload }) => {
  const responses = report.inspection?.responses || [];
  const stats = computeStats(responses);
  const stepStats = computeStepStats(responses);

  return (
    <div className="equip_Reports__modalBackdrop">
      <div className="equip_Reports__modal equip_Reports__modal--wide">
        <button
          onClick={onClose}
          className="equip_Reports__modalClose"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="equip_Reports__modalHeader">
          <div className="equip_Reports__modalDocId">
            Document ID: {report.reportNumber}
          </div>
          <h2 className="equip_Reports__modalTitle">
            Inspection Statistics
          </h2>
          <p className="equip_Reports__modalSubtitle">
            {report.inspection?.equipmentName} · {report.client?.name}
          </p>
        </div>

        {/* ─── OVERALL STATS ─── */}
        <div className="equip_Reports__overallSection">
          <div className="equip_Reports__overallHeader">
            <Activity size={18} color="#C9AE70" />
            <span>Overall Performance</span>
          </div>

          <div className="equip_Reports__overallGrid">
            {/* Score Card */}
            <div
              className="equip_Reports__bigCard"
              style={{ borderColor: scoreColor(stats.score) }}
            >
              <TrendingUp size={20} color={scoreColor(stats.score)} />
              <div
                className="equip_Reports__bigValue"
                style={{ color: scoreColor(stats.score) }}
              >
                {stats.score}
              </div>
              <div className="equip_Reports__bigLabel">Score / 100</div>
            </div>

            {/* Grade Card */}
            <div
              className="equip_Reports__bigCard"
              style={{ borderColor: scoreColor(stats.score) }}
            >
              <Award size={20} color={scoreColor(stats.score)} />
              <div
                className="equip_Reports__bigValue"
                style={{ color: scoreColor(stats.score) }}
              >
                {stats.grade}
              </div>
              <div className="equip_Reports__bigLabel">{stats.gradeLabel}</div>
            </div>

            {/* Verdict Card */}
            <div
              className="equip_Reports__bigCard"
              style={{
                borderColor:
                  stats.verdict === 'PASS'
                    ? '#10b981'
                    : stats.verdict === 'FAIL'
                      ? '#e53935'
                      : '#e67e22',
              }}
            >
              <CheckCircle2
                size={20}
                color={
                  stats.verdict === 'PASS'
                    ? '#10b981'
                    : stats.verdict === 'FAIL'
                      ? '#e53935'
                      : '#e67e22'
                }
              />
              <div
                className="equip_Reports__bigValue equip_Reports__bigValue--text"
                style={{
                  color:
                    stats.verdict === 'PASS'
                      ? '#10b981'
                      : stats.verdict === 'FAIL'
                        ? '#e53935'
                        : '#e67e22',
                }}
              >
                {stats.verdict}
              </div>
              <div className="equip_Reports__bigLabel">
                {stats.repair > 0
                  ? `${stats.repair} item(s) to fix`
                  : 'No issues'}
              </div>
            </div>
          </div>

          {/* Breakdown Bar */}
          <div className="equip_Reports__breakdown">
            <div className="equip_Reports__breakdownBar">
              {stats.okPct > 0 && (
                <div
                  className="equip_Reports__breakdownSegment equip_Reports__breakdownSegment--ok"
                  style={{ width: `${stats.okPct}%` }}
                  title={`OK: ${stats.ok} (${stats.okPct}%)`}
                />
              )}
              {stats.repairPct > 0 && (
                <div
                  className="equip_Reports__breakdownSegment equip_Reports__breakdownSegment--repair"
                  style={{ width: `${stats.repairPct}%` }}
                  title={`Needs Repair: ${stats.repair} (${stats.repairPct}%)`}
                />
              )}
              {stats.naPct > 0 && (
                <div
                  className="equip_Reports__breakdownSegment equip_Reports__breakdownSegment--na"
                  style={{ width: `${stats.naPct}%` }}
                  title={`N/A: ${stats.na} (${stats.naPct}%)`}
                />
              )}
            </div>
            <div className="equip_Reports__breakdownLegend">
              <span>
                <span className="equip_Reports__legendDot equip_Reports__legendDot--ok" />
                {stats.ok} OK ({stats.okPct}%)
              </span>
              <span>
                <span className="equip_Reports__legendDot equip_Reports__legendDot--repair" />
                {stats.repair} Needs Repair ({stats.repairPct}%)
              </span>
              <span>
                <span className="equip_Reports__legendDot equip_Reports__legendDot--na" />
                {stats.na} N/A ({stats.naPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* ─── STEP-WISE STATS ─── */}
        <div className="equip_Reports__stepSection">
          <div className="equip_Reports__overallHeader">
            <Activity size={18} color="#C9AE70" />
            <span>Category Breakdown ({stepStats.length} sections)</span>
          </div>

          <div className="equip_Reports__stepList">
            {stepStats.map((step) => (
              <div
                key={step.stepNumber}
                className="equip_Reports__stepCard"
                style={{
                  borderLeftColor: step.statusColor,
                }}
              >
                <div className="equip_Reports__stepTop">
                  <div className="equip_Reports__stepName">
                    <span className="equip_Reports__stepNumber">
                      {step.stepNumber}
                    </span>
                    {step.stepName}
                  </div>
                  <div
                    className="equip_Reports__stepScore"
                    style={{
                      color: step.statusColor,
                      background: scoreBg(step.score),
                      borderColor: step.statusColor,
                    }}
                  >
                    {step.score}%
                  </div>
                </div>

                <div className="equip_Reports__stepMeta">
                  <span className="equip_Reports__stepPill equip_Reports__stepPill--ok">
                    {step.ok} OK
                  </span>
                  <span className="equip_Reports__stepPill equip_Reports__stepPill--repair">
                    {step.repair} Repair
                  </span>
                  <span className="equip_Reports__stepPill equip_Reports__stepPill--na">
                    {step.na} N/A
                  </span>
                  <span
                    className="equip_Reports__stepStatus"
                    style={{ color: step.statusColor }}
                  >
                    <AlertTriangle size={12} />
                    {step.status}
                  </span>
                </div>

                <div className="equip_Reports__stepBar">
                  {step.ok > 0 && (
                    <div
                      className="equip_Reports__stepBarFill equip_Reports__stepBarFill--ok"
                      style={{
                        width: `${(step.ok / step.total) * 100}%`,
                      }}
                    />
                  )}
                  {step.repair > 0 && (
                    <div
                      className="equip_Reports__stepBarFill equip_Reports__stepBarFill--repair"
                      style={{
                        width: `${(step.repair / step.total) * 100}%`,
                      }}
                    />
                  )}
                  {step.na > 0 && (
                    <div
                      className="equip_Reports__stepBarFill equip_Reports__stepBarFill--na"
                      style={{
                        width: `${(step.na / step.total) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FINDINGS & RECOMMENDATIONS (if filled) ─── */}
        {(report.findings || report.recommendations) && (
          <div className="equip_Reports__equipmentBody" style={{ marginTop: 20 }}>
            {report.findings && (
              <div>
                <div className="equip_Reports__sectionTitle">
                  <CheckCircle2 size={16} color="#10b981" />
                  Findings
                </div>
                <p className="equip_Reports__sectionText">{report.findings}</p>
              </div>
            )}
            {report.recommendations && (
              <div>
                <div className="equip_Reports__sectionTitle">
                  <Edit3 size={16} color="#C9AE70" />
                  Recommendations
                </div>
                <p className="equip_Reports__sectionText">
                  {report.recommendations}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <div className="equip_Reports__modalFooter">
          <button onClick={onClose} className="equip_Reports__closeBtn">
            Close Viewer
          </button>
          <button
            onClick={() => onDownload(report._id, report.reportNumber)}
            className="equip_Reports__downloadBtn"
          >
            Download Report <Download size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;