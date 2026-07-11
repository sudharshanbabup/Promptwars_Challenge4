import { useState, useEffect } from 'react';

export function EmergencyDrawer() {
  const [helplines, setHelplines] = useState({
    nationalEmergency: '112',
    ambulance: '108',
    districtDisasterControl: '1077',
    ndma: '1078',
    waterWaterlogging: '1916',
    electricity: '1912',
    police: '100',
    fire: '101'
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Attempt to load official numbers from Express endpoint, fail gracefully to offline constants
    fetch('/api/emergency')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Endpoint failure');
      })
      .then((data) => {
        if (data && data.nationalEmergency) {
          setHelplines(data);
        }
      })
      .catch((err) => {
        console.info('[EmergencyDrawer] Offline mode: utilizing static emergency helpline database.', err);
      });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#111827',
      borderTop: '3px solid #2563eb',
      boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.5)',
      zIndex: 900,
      transition: 'transform 0.3s ease-in-out',
      transform: isOpen ? 'translateY(0)' : 'translateY(calc(100% - 48px))'
    }}>
      {/* Drawer Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '48px',
          minHeight: '48px',
          background: '#1f2937',
          border: 'none',
          color: '#f8fafc',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          borderRadius: 0,
          cursor: 'pointer'
        }}
      >
        {isOpen ? '⬇️ Collapse Helplines' : '📞 Show Emergency Disaster Helplines'}
      </button>

      {/* Helplines List */}
      <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>National Emergency</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>
            <a href={`tel:${helplines.nationalEmergency}`} style={{ color: '#ef4444', textDecoration: 'none' }}>📞 {helplines.nationalEmergency}</a>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ambulance Services</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>
            <a href={`tel:${helplines.ambulance}`} style={{ color: '#ef4444', textDecoration: 'none' }}>📞 {helplines.ambulance}</a>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>NDMA Command</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>
            <a href={`tel:${helplines.ndma}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>📞 {helplines.ndma}</a>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>District Disaster Control</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>
            <a href={`tel:${helplines.districtDisasterControl}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>📞 {helplines.districtDisasterControl}</a>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Waterlogging Helpline</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>
            <a href={`tel:${helplines.waterWaterlogging}`} style={{ color: '#f8fafc', textDecoration: 'none' }}>📞 {helplines.waterWaterlogging}</a>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Electricity Helpline</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>
            <a href={`tel:${helplines.electricity}`} style={{ color: '#f8fafc', textDecoration: 'none' }}>📞 {helplines.electricity}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EmergencyDrawer;
