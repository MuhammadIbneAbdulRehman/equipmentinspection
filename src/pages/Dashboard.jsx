import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Users,
  ArrowUpRight,
  Plus,
  LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    clients: 0
  });
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insRes, cliRes] = await Promise.all([
          API.get('/inspections'),
          API.get('/clients')
        ]);

        const inspections = insRes.data;
        const clients = cliRes.data;

        setStats({
          total: inspections.length,
          completed: inspections.filter(i => i.status === 'Completed').length,
          pending: inspections.filter(i => i.status !== 'Completed').length,
          clients: clients.length
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

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="glass-card flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: `${color}10`, color: color,
          display: 'grid', placeItems: 'center'
        }}>
          <Icon size={24} />
        </div>
        <div style={{ padding: '20px', borderRadius: 8, background: '#f1f5f9', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
          PER MONTH
        </div>
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>{title}</p>
        <p style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent-color)' }}>
            <LayoutDashboard size={18} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overview</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800 }}>Control Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Track your equipment inspection metrics in real-time.</p>
        </div>
        <Link to="/inspections" className="btn-primary" style={{ height: `100%`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', sm: 'auto', borderRadius: 10, marginTop: 20, marginBottom: 20, textDecoration: 'none' }}>
          <Plus size={20} /> New Inspection
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(100%, 280px, 100%), 1fr))',
        gap: '24px'
      }}>
        <style>{`
          @media (min-width: 640px) {
            .stats-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important; }
          }
        `}</style>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', width: '100% border-box' }}>
          <StatCard title="Total Inspections" value={stats.total} icon={BarChart3} color="var(--accent-color)" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="var(--success)" />
          <StatCard title="In Progress" value={stats.pending} icon={Clock} color="var(--warning)" />
          <StatCard title="Active Clients" value={stats.clients} icon={Users} color="#9333ea" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Recent Inspections</h2>
          <Link to="/inspections" className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-color)', textDecoration: 'none' }}>
            View Full Log <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>EQUIPMENT</th>
                  <th>SERIAL</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {recentInspections.length > 0 ? recentInspections.map((inspection) => (
                  <tr key={inspection._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{inspection.client?.name}</span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span style={{ fontWeight: 600 }}>{inspection.equipmentName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{inspection.equipmentCategory}</span>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                        {inspection.serialNumber || 'N/A'}
                      </code>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {new Date(inspection.inspectionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`badge badge-${inspection.status.toLowerCase().replace(' ', '-')}`}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div>
                        {inspection.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/inspections/${inspection._id}/checklist`} style={{
                        color: 'var(--text-primary)',
                        background: '#f1f5f9',
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'var(--transition)'
                      }} className="hover:bg-slate-200">
                        {inspection.status === 'Completed' ? 'View' : 'Continue'}
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 64, color: 'var(--text-secondary)', fontWeight: 500 }}>
                      No recent records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
