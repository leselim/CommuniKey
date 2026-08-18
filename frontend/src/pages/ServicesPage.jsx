import React, { useState, useEffect } from 'react';
import { Wrench, Search, Plus, MapPin, Phone, Mail, CheckCircle2, Package, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { servicesService } from '../services/api';

function ServicesPage() {
  const { activeCommunity, userCommunities } = useAuth();
  const [activeTab, setActiveTab] = useState('lost_found'); // 'lost_found' | 'providers'
  const [lostFoundItems, setLostFoundItems] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  // Form states
  const [lostFoundForm, setLostFoundForm] = useState({
    community: activeCommunity?.id || '',
    item_type: 'LOST',
    category: 'OTHER',
    title: '',
    description: '',
    location_description: '',
    contact_info: ''
  });

  const [providerForm, setProviderForm] = useState({
    community: activeCommunity?.id || '',
    service_type: 'PLUMBING',
    business_name: '',
    contact_person: '',
    phone_number: '',
    email: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeCommunity, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const commId = activeCommunity?.id;
      if (activeTab === 'lost_found') {
        const res = await servicesService.getLostAndFound({ community: commId });
        setLostFoundItems(res.data?.results || res.data || []);
      } else {
        const res = await servicesService.getServiceProviders({ community: commId });
        setProviders(res.data?.results || res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLostFound = async (e) => {
    e.preventDefault();
    try {
      await servicesService.createLostAndFound({
        ...lostFoundForm,
        community: lostFoundForm.community || activeCommunity?.id || (userCommunities[0]?.id)
      });
      setShowModal(false);
      setLostFoundForm({
        community: activeCommunity?.id || '',
        item_type: 'LOST',
        category: 'OTHER',
        title: '',
        description: '',
        location_description: '',
        contact_info: ''
      });
      fetchData();
    } catch (err) {
      alert('Error creating item. Please check community selection.');
    }
  };

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    try {
      await servicesService.createServiceProvider({
        ...providerForm,
        community: providerForm.community || activeCommunity?.id || (userCommunities[0]?.id)
      });
      setShowModal(false);
      setProviderForm({
        community: activeCommunity?.id || '',
        service_type: 'PLUMBING',
        business_name: '',
        contact_person: '',
        phone_number: '',
        email: '',
        description: ''
      });
      fetchData();
    } catch (err) {
      alert('Error creating service provider listing.');
    }
  };

  const filteredItems = lostFoundItems.filter(item => {
    if (filterType === 'ALL') return true;
    return item.item_type === filterType;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pinelands Services & Directory</h1>
          <p className="page-subtitle">Lost & found notices and trusted local Pinelands service providers</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={15} /> {activeTab === 'lost_found' ? 'Report Item' : 'Register Provider'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--color-border)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('lost_found')}
          style={{
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'lost_found' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'lost_found' ? 'var(--color-primary)' : '#64748b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Package size={16} /> Lost & Found Board
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          style={{
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'providers' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'providers' ? 'var(--color-primary)' : '#64748b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Wrench size={16} /> Local Service Directory
        </button>
      </div>

      {/* Tab 1: Lost & Found */}
      {activeTab === 'lost_found' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['ALL', 'LOST', 'FOUND'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 14px', borderRadius: '16px' }}
              >
                {type === 'ALL' ? 'All Items' : type === 'LOST' ? 'Lost Items' : 'Found Items'}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
              <Package size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>No lost or found items reported</p>
              <span style={{ fontSize: '0.825rem' }}>Report missing keys, pets, or items in the Pinelands area.</span>
            </div>
          ) : (
            <div className="grid-3">
              {filteredItems.map(item => (
                <div key={item.id} className="card" style={{ borderLeft: item.item_type === 'LOST' ? '4px solid #dc2626' : '4px solid #16a34a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={`badge badge-${item.item_type === 'LOST' ? 'danger' : 'success'}`}>
                      {item.item_type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(item.date_reported).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', marginBottom: '12px' }}>{item.description}</p>
                  {item.location_description && (
                    <div style={{ fontSize: '0.775rem', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#1e40af" /> Location: <strong>{item.location_description}</strong>
                    </div>
                  )}
                  {item.contact_info && (
                    <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: '600', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> Contact: {item.contact_info}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Service Providers Directory */}
      {activeTab === 'providers' && (
        <div>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>Loading directory...</div>
          ) : providers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
              <Wrench size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>No service providers registered</p>
              <span style={{ fontSize: '0.825rem' }}>List your local Pinelands plumbing, electrical, or garden service!</span>
            </div>
          ) : (
            <div className="grid-3">
              {providers.map(p => (
                <div key={p.id} className="card" style={{ borderLeft: '4px solid #0f172a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-info">
                      {p.service_type}
                    </span>
                    {p.verified && (
                      <span className="badge badge-success" style={{ gap: '2px' }}>
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{p.business_name}</h3>
                  {p.contact_person && (
                    <div style={{ fontSize: '0.775rem', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> Contact: {p.contact_person}
                    </div>
                  )}
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', marginBottom: '12px' }}>{p.description || 'Local Pinelands service provider.'}</p>
                  
                  <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.825rem', color: '#1e40af', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={13} /> {p.phone_number}
                    </div>
                    {p.email && (
                      <div style={{ fontSize: '0.775rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={13} /> {p.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {activeTab === 'lost_found' ? 'Report Item' : 'Register Service Provider'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {activeTab === 'lost_found' ? (
              <form onSubmit={handleCreateLostFound}>
                <div className="form-group">
                  <label className="form-label">Community *</label>
                  <select
                    className="form-select"
                    value={lostFoundForm.community}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, community: e.target.value })}
                    required
                  >
                    <option value="">Select Community</option>
                    {userCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={lostFoundForm.item_type}
                      onChange={(e) => setLostFoundForm({ ...lostFoundForm, item_type: e.target.value })}
                    >
                      <option value="LOST">Lost Item</option>
                      <option value="FOUND">Found Item</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={lostFoundForm.category}
                      onChange={(e) => setLostFoundForm({ ...lostFoundForm, category: e.target.value })}
                    >
                      <option value="PETS">Pets</option>
                      <option value="ELECTRONICS">Electronics</option>
                      <option value="KEYS">Keys & Cards</option>
                      <option value="DOCUMENTS">Documents</option>
                      <option value="CLOTHING">Clothing</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={lostFoundForm.title}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, title: e.target.value })}
                    placeholder="e.g. Lost Silver Keyring at Howard Centre"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    required
                    rows="3"
                    value={lostFoundForm.description}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, description: e.target.value })}
                    placeholder="Provide details..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location Details</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lostFoundForm.location_description}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, location_description: e.target.value })}
                    placeholder="e.g. Forest Drive, Pinelands"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone / Email</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lostFoundForm.contact_info}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, contact_info: e.target.value })}
                    placeholder="082 123 4567 or email"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Listing</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateProvider}>
                <div className="form-group">
                  <label className="form-label">Community *</label>
                  <select
                    className="form-select"
                    value={providerForm.community}
                    onChange={(e) => setProviderForm({ ...providerForm, community: e.target.value })}
                    required
                  >
                    <option value="">Select Community</option>
                    {userCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Category</label>
                  <select
                    className="form-select"
                    value={providerForm.service_type}
                    onChange={(e) => setProviderForm({ ...providerForm, service_type: e.target.value })}
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical Services</option>
                    <option value="GARDENING">Gardening & Landscaping</option>
                    <option value="SECURITY">Private Security</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="HANDYMAN">Handyman & Repairs</option>
                    <option value="TUTORING">Tutoring</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={providerForm.business_name}
                    onChange={(e) => setProviderForm({ ...providerForm, business_name: e.target.value })}
                    placeholder="e.g. Pinelands Plumbing Services"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className="form-input"
                    value={providerForm.contact_person}
                    onChange={(e) => setProviderForm({ ...providerForm, contact_person: e.target.value })}
                    placeholder="e.g. Johan van der Merwe"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={providerForm.phone_number}
                    onChange={(e) => setProviderForm({ ...providerForm, phone_number: e.target.value })}
                    placeholder="021 531 1234"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={providerForm.description}
                    onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                    placeholder="Describe services offered..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Register Listing</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesPage;
