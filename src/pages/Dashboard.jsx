// src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Users,
  ArrowUpRight,
  Plus,
  LayoutDashboard,
} from 'lucide-react';

import API from '../api/axios';
import './styles/Dashboard.css';

/* ─── Tone palette ─── */
const TONES = {
  gold:    { bg: '#F5EEDD', fg: '#9C7F41' },
  success: { bg: '#d1fae5', fg: '#047857' },
  warning: { bg: '#fef3c7', fg: '#b45309' },
  navy:    { bg: '#E0E7FF', fg: '#1e3a8a' },
};

/* ─── Stat Card ─── */
const StatCard = ({ title, value, icon: Icon, tone = 'gold' }) => {
  const colors = TONES[tone] || TONES.gold;
  return (
    <div className="equip_Dashboard__statCard" tabIndex={0}>
      <div className="equip_Dashboard__statTop">
        <div
          className="equip_Dashboard__statIcon"
          style={{ background: colors.bg, color: colors.fg }}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>
        <span className="equip_Dashboard__statTag">Per Month</span>
      </div>
      <div className="equip_Dashboard__statBottom">
        <p className="equip_Dashboard__statValue">{value}</p>
        <p className="equip_Dashboard__statLabel">{title}</p>
      </div>
    </div>
  );
};

/* ─── Status Badge ─── */
const StatusBadge = ({ status }) => {
  const slug = status.toLowerCase().replace(' ', '-');
  return (
    <span className={`equip_Dashboard__status equip_Dashboard__status--${slug}`}>
      <span className="equip_Dashboard__statusDot" />
      {status}
    </span>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    clients: 0,
  });
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insRes, cliRes] = await Promise.all([
          API.get('/inspections'),
          API.get('/clients'),
        ]);

        const inspections = insRes.data;
        const clients = cliRes.data;

        setStats({
          total: inspections.length,
          completed: inspections.filter(i => i.status === 'Completed').length,
          pending: inspections.filter(i => i.status !== 'Completed').length,
          clients: clients.length,
        });

        setRecentInspections(inspections.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="equip_Dashboard__loading">
        <div className="equip_Dashboard__spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div className="equip_Dashboard">
      {/* ─── HEADER ─── */}
      <header className="equip_Dashboard__header">
        <div>
          <div className="equip_Dashboard__eyebrow">
            <LayoutDashboard />
            <span>Overview</span>
          </div>
          <h1 className="equip_Dashboard__title">Control Panel</h1>
          <p className="equip_Dashboard__subtitle">
            Track your equipment inspection metrics in real-time.
          </p>
        </div>
        <Link to="/inspections" className="equip_Dashboard__newBtn">
          <Plus size={18} /> New Inspection
        </Link>
      </header>

      {/* ─── STATS ─── */}
      <section className="equip_Dashboard__statsGrid">
        <StatCard
          title="Total Inspections"
          value={stats.total}
          icon={BarChart3}
          tone="gold"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          title="In Progress"
          value={stats.pending}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          title="Active Clients"
          value={stats.clients}
          icon={Users}
          tone="navy"
        />
      </section>

      {/* ─── RECENT ─── */}
      <section className="equip_Dashboard__section">
        <div className="equip_Dashboard__sectionHead">
          <h2 className="equip_Dashboard__sectionTitle">Recent Inspections</h2>
          <Link to="/inspections" className="equip_Dashboard__viewAll">
            View Full Log <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="equip_Dashboard__tableCard">
          <div className="equip_Dashboard__tableScroll">
            <table className="equip_Dashboard__table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Equipment</th>
                  <th>Serial</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInspections.length > 0 ? (
                  recentInspections.map(inspection => (
                    <tr key={inspection._id}>
                      <td>
                        <span className="equip_Dashboard__cellClient">
                          {inspection.client?.name || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="equip_Dashboard__cellEquipment">
                          <span className="equip_Dashboard__cellEquipmentName">
                            {inspection.equipmentName}
                          </span>
                          <span className="equip_Dashboard__cellEquipmentCategory">
                            {inspection.equipmentCategory}
                          </span>
                        </div>
                      </td>
                      <td>
                        <code className="equip_Dashboard__code">
                          {inspection.serialNumber || 'N/A'}
                        </code>
                      </td>
                      <td>
                        <span className="equip_Dashboard__cellDate">
                          {new Date(inspection.inspectionDate).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={inspection.status} />
                      </td>
                      <td className="equip_Dashboard__cellActions">
                        <Link
                          to={`/inspections/${inspection._id}/checklist`}
                          className="equip_Dashboard__actionLink"
                        >
                          {inspection.status === 'Completed' ? 'View' : 'Continue'}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="equip_Dashboard__empty">
                      No recent records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;