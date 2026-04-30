import React from 'react';

const FORMS = [
    { id: 'Ticket', name: '機票單 (Ticket)' },
    { id: 'Passenger', name: '乘客資料 (Passenger)' },
    { id: 'Info', name: '旅程資訊 (Info)' },
    { id: 'Transaction', name: '交易記錄 (Transaction)' },
    { id: 'Itinerary', name: '航班資料 (Itinerary)' },
    { id: 'FlightSegment', name: '航段資料 (FlightSegment)' },
    { id: 'TripLeg', name: '旅程分段 (TripLeg)' },
    { id: 'Company', name: '航空公司 (Company)' },
    { id: 'Airport', name: '機場資料 (Airport)' },
];

export default function Sidebar({ activeForm, setActiveForm }) {
    return (
        <aside className="glass-panel" style={{ width: '280px', display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '8px' }}>AeroSys</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>航空訂票管理核心</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {FORMS.map(form => (
                    <button
                        key={form.id}
                        onClick={() => setActiveForm(form.id)}
                        style={{
                            padding: '14px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeForm === form.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                            color: activeForm === form.id ? 'var(--accent)' : 'var(--text-secondary)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontWeight: activeForm === form.id ? '600' : '500',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderLeft: activeForm === form.id ? '3px solid var(--accent)' : '3px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.01em'
                        }}
                        onMouseOver={(e) => {
                            if (activeForm !== form.id) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.color = '#fff';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeForm !== form.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }
                        }}
                    >
                        {form.name}
                    </button>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #c084fc, #38bdf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1.2rem', color: 'white',
                        boxShadow: '0 0 10px rgba(56,189,248,0.3)'
                    }}>
                        A
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>Admin User</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>System Operator</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
