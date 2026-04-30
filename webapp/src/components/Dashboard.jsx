import React from 'react';

const FORMS_DATA = {
    Ticket: {
        title: '機票單',
        subtitle: 'Ticket Management',
        fields: ['機票編號 (A)', '艙等 (B)', '機票總量 (C)', '機票總價 (D)', '旅程識別碼 (E)', '乘客編號 (F)', '起飛機場編號 (G)', '降落機場編號 (H)']
    },
    Passenger: {
        title: '乘客資料',
        subtitle: 'Passenger Directory',
        fields: ['乘客編號 (A)', '姓氏 (B)', '名字 (C)', '性別 (D)', '出生日期 (E)', '國籍 (F)']
    },
    Info: {
        title: '旅程資訊',
        subtitle: 'Journey Information',
        fields: ['旅程識別碼 (A)', '出發日期 (B)', '地點安排 (C)', '出發地 (D)', '目的地 (E)']
    },
    Transaction: {
        title: '交易記錄',
        subtitle: 'Transaction Logs',
        fields: ['交易編號 (A)', '付款方式 (B)', '交易時間 (C)', '銀行代號 (D)', '銀行名稱 (E)', '信用卡種類 (F)', '信用卡號 (G)', '到期日 (H)', '機票編號 (I)']
    },
    Itinerary: {
        title: '航班資料',
        subtitle: 'Flight Itinerary',
        fields: ['航班編號 (A)', '航空公司代號 (B)', '起飛機場編號 (C)', '降落機場編號 (D)', '起飛時間 (E)', '降落時間 (F)']
    },
    FlightSegment: {
        title: '航段資料',
        subtitle: 'Flight Segments',
        fields: ['起飛機場編號 (A)', '降落機場編號 (B)']
    },
    TripLeg: {
        title: '旅程分段',
        subtitle: 'Trip Legs',
        fields: ['旅程分段編號 (A)', '航班編號 (B)']
    },
    Company: {
        title: '航空公司',
        subtitle: 'Airline Companies',
        fields: ['公司代碼 (A)', '公司名稱 (B)']
    },
    Airport: {
        title: '機場資料',
        subtitle: 'Airport Directory',
        fields: ['機場編號 (A)', '機場名稱 (B)']
    }
};

export default function Dashboard({ activeForm }) {
    const formData = FORMS_DATA[activeForm];

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '40px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: 'var(--accent)', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '8px', fontSize: '0.875rem' }}>{formData.subtitle.toUpperCase()}</div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{formData.title}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Enter system records directly into the core database mapping.</p>
                    </div>
                    <button className="button">+ Create New Record</button>
                </div>
            </header>

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    columnGap: '40px',
                    rowGap: '32px'
                }}>
                    {formData.fields.map((field, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                                {field}
                            </label>
                            <input
                                type="text"
                                placeholder={`Data for ${field.split(' (')[0]}...`}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid var(--border)',
                                    padding: '14px 18px',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--accent)';
                                    e.target.style.background = 'rgba(15, 23, 42, 0.8)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border)';
                                    e.target.style.background = 'rgba(15, 23, 42, 0.4)';
                                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '60px',
                    paddingTop: '32px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '16px'
                }}>
                    <button style={{
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s'
                    }}
                        onMouseOver={(e) => {
                            e.target.style.color = '#fff';
                            e.target.style.borderColor = 'var(--text-secondary)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.color = 'var(--text-secondary)';
                            e.target.style.borderColor = 'var(--border)';
                        }}>
                        Discard
                    </button>
                    <button className="button" style={{ padding: '12px 32px' }}>Save Entry to DB</button>
                </div>
            </div>
        </div>
    );
}
