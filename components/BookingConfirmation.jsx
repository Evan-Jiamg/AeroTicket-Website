// 訂票完成確認 banner（付款成功後顯示）
function BookingConfirmation({ transactionID, memberID, onClose }) {
  const allTransactions = JSON.parse(localStorage.getItem('aeroTicketTransactions') || '[]');
  const txn = allTransactions.find(t => t.transactionID === transactionID);

  const allTickets = JSON.parse(localStorage.getItem('aeroTicketTickets') || '[]')
    .filter(t => t.transactionID === transactionID);
  const allPassengers = JSON.parse(localStorage.getItem('aeroTicketPassengers') || '[]');
  const allTripLegs  = JSON.parse(localStorage.getItem('aeroTicketTripLegs')   || '[]');
  const journeyInfo  = (JSON.parse(localStorage.getItem('aeroTicketInfos') || '[]'))
    .find(i => i.memberID === memberID);

  if (!txn) return null;

  const enrichedTickets = allTickets.map(t => {
    const pass = allPassengers.find(p => p.passengerID === t.passengerID);
    const leg  = allTripLegs.find(l => l.itineraryID === t.itineraryID && l.infoID === t.infoID);
    return {
      ...t,
      passengerName: pass ? `${pass.lastName} ${pass.firstName}` : 'Unknown',
      departureDate: leg ? leg.departureDate : '-'
    };
  });

  return (
    <div className="card" style={{ border: '2px solid rgba(34,197,94,0.5)', position: 'relative', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <button className="btn btn-secondary"
          style={{ width: 'auto', padding: '4px 12px', fontSize: '13px', marginTop: 0 }}
          onClick={onClose}>關閉</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>✅</div>
        <h3 style={{ color: '#22c55e', marginBottom: '4px' }}>訂票成功！</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          交易編號 <span style={{ fontFamily: 'monospace', color: 'var(--primary-color)' }}>{txn.transactionID}</span>
        </p>
      </div>

      {journeyInfo && (
        <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
          <h5 style={{ marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            旅程資訊
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>旅程 ID</span><br /><strong>{journeyInfo.infoID}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>出發地</span><br /><strong>{journeyInfo.departure}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>目的地</span><br /><strong>{journeyInfo.destination}</strong></div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h5 style={{ marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          機票明細
        </h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {enrichedTickets.map(t => (
            <div key={t.ticketID} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', fontSize: '13px' }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>乘客</span><br /><strong>{t.passengerName}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>航段</span><br /><strong>{t.itineraryID}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>艙等</span><br /><strong>{t.cabin}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>票價</span><br /><strong style={{ color: '#22c55e' }}>TWD {t.ticketTotalPrice.toLocaleString()}</strong></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px', background: 'rgba(34,197,94,0.06)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.25)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
        <h5 style={{ gridColumn: '1 / -1', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>交易資訊</h5>
        <div><span style={{ color: 'var(--text-secondary)' }}>交易時間</span><br /><strong>{new Date(txn.transtime).toLocaleString()}</strong></div>
        <div><span style={{ color: 'var(--text-secondary)' }}>付款方式</span><br /><strong>{txn.payment}</strong></div>
        <div><span style={{ color: 'var(--text-secondary)' }}>信用卡末四碼</span><br /><strong>**** **** **** {(txn.cardDetails.cardID || '').slice(-4)}</strong></div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>總金額</span><br />
          <strong style={{ fontSize: '18px', color: '#22c55e' }}>TWD {txn.totalAmount.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}

window.BookingConfirmation = BookingConfirmation;
