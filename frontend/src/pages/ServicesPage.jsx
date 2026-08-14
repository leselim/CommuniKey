import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { servicesService, communityService } from '../services/api';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Community Services & Marketplace
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>
            Lost & found notices and trusted local service providers
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {activeTab === 'lost_found' ? '+ Report Item' : '+ Register Provider'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('lost_found')}
          style={{
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'lost_found' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'lost_found' ? '#2563eb' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Lost & Found
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          style={{
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'providers' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'providers' ? '#2563eb' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Service Providers Directory
        </button>
      </div>

      {/* Tab 1: Lost & Found */}
      {activeTab === 'lost_found' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            {['ALL', 'LOST', 'FOUND'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  borderRadius: '16px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: filterType === type ? '#2563eb' : '#f8fafc',
                  color: filterType === type ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {type === 'ALL' ? 'All Items' : type === 'LOST' ? 'Lost Items' : 'Found Items'}
              </button>
            ))}
          </div>

          {loading ? (
            <p>Loading items...</p>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No lost or found items reported yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredItems.map(item => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      backgroundColor: item.item_type === 'LOST' ? '#fee2e2' : '#dcfce7',
                      color: item.item_type === 'LOST' ? '#991b1b' : '#166534',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {item.item_type}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(item.date_reported).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', margin: '0 0 6px 0' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 12px 0' }}>{item.description}</p>
                  {item.location_description && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 6px 0' }}>📍 Location: {item.location_description}</p>
                  )}
                  {item.contact_info && (
                    <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '500', margin: 0 }}>📞 Contact: {item.contact_info}</p>
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
            <p>Loading directory...</p>
          ) : providers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No local service providers registered yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {providers.map(p => (
                <div key={p.id} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                      {p.service_type}
                    </span>
                    {p.verified && <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: '600' }}>✓ Verified</span>}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', margin: '0 0 4px 0' }}>{p.business_name}</h3>
                  {p.contact_person && <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px 0' }}>Contact: {p.contact_person}</p>}
                  <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 12px 0' }}>{p.description || 'Local community service provider.'}</p>
                  <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '600', margin: '0 0 4px 0' }}>📞 {p.phone_number}</p>
                  {p.email && <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>✉️ {p.email}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0' }}>
              {activeTab === 'lost_found' ? 'Report Lost or Found Item' : 'Register Service Provider'}
            </h2>

            {activeTab === 'lost_found' ? (
              <form onSubmit={handleCreateLostFound}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Community</label>
                  <select
                    value={lostFoundForm.community}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, community: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select Community</option>
                    {userCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Type</label>
                    <select
                      value={lostFoundForm.item_type}
                      onChange={(e) => setLostFoundForm({ ...lostFoundForm, item_type: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="LOST">Lost</option>
                      <option value="FOUND">Found</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Category</label>
                    <select
                      value={lostFoundForm.category}
                      onChange={(e) => setLostFoundForm({ ...lostFoundForm, category: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
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

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Title</label>
                  <input
                    type="text"
                    required
                    value={lostFoundForm.title}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, title: e.target.value })}
                    placeholder="e.g. Lost Silver Keyring"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                  <textarea
                    required
                    rows="3"
                    value={lostFoundForm.description}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, description: e.target.value })}
                    placeholder="Provide details about the item..."
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Location Details</label>
                  <input
                    type="text"
                    value={lostFoundForm.location_description}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, location_description: e.target.value })}
                    placeholder="e.g. Near Community Park Entrance"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Contact Details</label>
                  <input
                    type="text"
                    value={lostFoundForm.contact_info}
                    onChange={(e) => setLostFoundForm({ ...lostFoundForm, contact_info: e.target.value })}
                    placeholder="Phone number or email"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Submit</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateProvider}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Community</label>
                  <select
                    value={providerForm.community}
                    onChange={(e) => setProviderForm({ ...providerForm, community: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select Community</option>
                    {userCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Service Type</label>
                  <select
                    value={providerForm.service_type}
                    onChange={(e) => setProviderForm({ ...providerForm, service_type: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
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

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Business Name</label>
                  <input
                    type="text"
                    required
                    value={providerForm.business_name}
                    onChange={(e) => setProviderForm({ ...providerForm, business_name: e.target.value })}
                    placeholder="e.g. Apex Electrical Repairs"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    value={providerForm.phone_number}
                    onChange={(e) => setProviderForm({ ...providerForm, phone_number: e.target.value })}
                    placeholder="e.g. 082 345 6789"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                  <textarea
                    rows="3"
                    value={providerForm.description}
                    onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                    placeholder="Describe services offered..."
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Register Provider</button>
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
