import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Filter, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { incidentService } from '../services/api';
import IncidentCard from '../components/IncidentCard';

function IncidentsPage() {
  const { activeCommunity, userCommunities } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    community: activeCommunity?.id || '',
    incident_type: 'SUSPICIOUS',
    title: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchIncidents();
  }, [activeCommunity, filterType, filterStatus]);

  const fetchIncidents = async () => {
    try {
      const commId = activeCommunity?.id || '';
      const res = await incidentService.getIncidents({
        community: commId,
        type: filterType,
        status: filterStatus
      });
      const list = res.data?.results || res.data || [];
      setIncidents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const commId = formData.community || activeCommunity?.id || userCommunities[0]?.id;
    if (!commId) {
      alert('Please select a community.');
      return;
    }
    try {
      await incidentService.createIncident({ ...formData, community: commId });
      setShowModal(false);
      setFormData({ community: activeCommunity?.id || '', incident_type: 'SUSPICIOUS', title: '', description: '', image_url: '' });
      fetchIncidents();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit incident report.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await incidentService.updateIncident(id, { status: newStatus });
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Incident Reports & Safety Feed</h1>
          <p className="page-subtitle">Track and report neighbourhood safety alerts, infrastructure damage, and municipal service outages</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ backgroundColor: '#e11d48', borderColor: '#e11d48' }}>
          <Plus size={16} /> Report New Incident
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
          <Filter size={16} color="#0284c7" /> Filter By:
        </div>
        
        <select
          className="form-select"
          style={{ maxWidth: '220px' }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Incident Types</option>
          <option value="CRIME">Crime & Theft</option>
          <option value="FIRE">Fire Emergency</option>
          <option value="MEDICAL">Medical Emergency</option>
          <option value="INFRASTRUCTURE">Infrastructure Damage</option>
          <option value="WATER">Water Service Outage</option>
          <option value="ELECTRICITY">Electricity Outage</option>
          <option value="DUMPING">Illegal Dumping</option>
          <option value="NOISE">Noise Complaint</option>
          <option value="SUSPICIOUS">Suspicious Activity</option>
        </select>

        <select
          className="form-select"
          style={{ maxWidth: '220px' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="REPORTED">Reported (Open)</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading incident reports...</div>
      ) : incidents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
          <AlertTriangle size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: '600' }}>No incident reports found</p>
          <span style={{ fontSize: '0.85rem' }}>Try clearing filters or report a new incident.</span>
        </div>
      ) : (
        <div className="grid-2">
          {incidents.map((inc) => (
            <IncidentCard key={inc.id} incident={inc} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {/* Report Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Report New Incident</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Target Community *</label>
                <select
                  className="form-select"
                  value={formData.community || activeCommunity?.id || ''}
                  onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                  required
                >
                  <option value="">Select Community</option>
                  {userCommunities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Incident Category *</label>
                <select
                  className="form-select"
                  value={formData.incident_type}
                  onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                >
                  <option value="CRIME">Crime & Theft</option>
                  <option value="FIRE">Fire Emergency</option>
                  <option value="MEDICAL">Medical Emergency</option>
                  <option value="INFRASTRUCTURE">Infrastructure Damage</option>
                  <option value="WATER">Water Service Outage</option>
                  <option value="ELECTRICITY">Electricity Outage</option>
                  <option value="DUMPING">Illegal Dumping</option>
                  <option value="NOISE">Noise Complaint</option>
                  <option value="SUSPICIOUS">Suspicious Activity</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Incident Headline / Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Water pipe burst on 5th avenue & Main Rd"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  required
                  placeholder="Describe location, vehicle registration, or details of the event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Photo Attachment URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Submit Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentsPage;
