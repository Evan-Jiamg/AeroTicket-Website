// 訂票精靈：步驟 1 人數 → 2 乘客資料 → 3 艙等 → 4 付款（可略過）
const { useState: useStateTLB } = React;

const CABIN_PRICES = { '經濟艙': 5000, '商務艙': 15000, '頭等艙': 30000 };

function TripLegBuilder({ selectedFlight, journeyInfo, onCancel, onSuccess }) {
  const [currentStep, setCurrentStep] = useStateTLB(1);

  const [peopleNums, setPeopleNums] = useStateTLB(() =>
    selectedFlight.legs.map(() => 1)
  );

  const [legPassengers, setLegPassengers] = useStateTLB(() =>
    selectedFlight.legs.map(() => [
      { lastName: '', firstName: '', gender: 'M', birthDate: '', nationality: '', cabin: '經濟艙' }
    ])
  );

  const [savedTickets, setSavedTickets] = useStateTLB([]);
  const [paymentForm, setPaymentForm] = useStateTLB({
    cardID: '', bankID: '', bankname: '', cardtype: 'VISA', dueDate: ''
  });

  // Payment modal: null | 'processing' | 'success'
  const [paymentModalStatus, setPaymentModalStatus] = useStateTLB(null);
  const [pendingTxnID, setPendingTxnID] = useStateTLB(null);

  // ── Helpers ──────────────────────────────────────────────
  const handlePeopleNumChange = (legIndex, num) => {
    const n = Math.max(1, parseInt(num) || 1);
    setPeopleNums(prev => { const a = [...prev]; a[legIndex] = n; return a; });
    setLegPassengers(prev => {
      const a = [...prev];
      const cur = [...a[legIndex]];
      while (cur.length < n) cur.push({ lastName: '', firstName: '', gender: 'M', birthDate: '', nationality: '', cabin: '經濟艙' });
      cur.splice(n);
      a[legIndex] = cur;
      return a;
    });
  };

  const handlePassengerChange = (legIndex, pIndex, field, value) => {
    setLegPassengers(prev => {
      const a = [...prev];
      a[legIndex] = [...a[legIndex]];
      a[legIndex][pIndex] = { ...a[legIndex][pIndex], [field]: value };
      return a;
    });
  };

  // ── Step 3 submit: persist as Unpaid, then go to payment step ──
  const handleStep3Submit = (e) => {
    e.preventDefault();

    let storedPassengers        = JSON.parse(localStorage.getItem('aeroTicketPassengers')        || '[]');
    let storedTripLegs          = JSON.parse(localStorage.getItem('aeroTicketTripLegs')          || '[]');
    let storedPassengerTripLegs = JSON.parse(localStorage.getItem('aeroTicketPassengerTripLegs') || '[]');
    let storedTickets           = JSON.parse(localStorage.getItem('aeroTicketTickets')           || '[]');

    const newTickets = [];

    selectedFlight.legs.forEach((leg, legIndex) => {
      const tripLegID = 'TL' + Math.random().toString(36).substring(2, 9).toUpperCase();

      storedTripLegs.push({
        tripLegID,
        infoID: journeyInfo.infoID,
        itineraryID: leg.ItineraryID,
        peopleNum: peopleNums[legIndex],
        departureDate: leg.Date
      });

      const passForLeg = legPassengers[legIndex].map(p => ({
        passengerID: 'P' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        lastName: p.lastName,
        firstName: p.firstName,
        gender: p.gender,
        birthDate: p.birthDate,
        nationality: p.nationality,
        cabin: p.cabin   // cabin kept here temporarily to build ticket
      }));

      // Passenger record doesn't store cabin (cabin lives on the ticket)
      storedPassengers.push(...passForLeg.map(({ cabin, ...rest }) => rest));

      passForLeg.forEach(p => {
        storedPassengerTripLegs.push({ passengerID: p.passengerID, tripLegID });
        const ticket = {
          ticketID: 'T' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          infoID: journeyInfo.infoID,
          itineraryID: leg.ItineraryID,
          passengerID: p.passengerID,
          transactionID: null,
          cabin: p.cabin,
          ticketNum: 1,
          ticketTotalPrice: CABIN_PRICES[p.cabin],
          status: 'Unpaid'
        };
        storedTickets.push(ticket);
        newTickets.push(ticket);
      });
    });

    localStorage.setItem('aeroTicketPassengers',        JSON.stringify(storedPassengers));
    localStorage.setItem('aeroTicketTripLegs',          JSON.stringify(storedTripLegs));
    localStorage.setItem('aeroTicketPassengerTripLegs', JSON.stringify(storedPassengerTripLegs));
    localStorage.setItem('aeroTicketTickets',           JSON.stringify(storedTickets));

    setSavedTickets(newTickets);
    setCurrentStep(4);
  };

  // ── Step 4: pay now → show external payment modal ──
  const handlePayNow = () => {
    const totalAmount   = savedTickets.reduce((s, t) => s + t.ticketTotalPrice, 0);
    const transactionID = 'TXN' + Math.random().toString(36).substring(2, 9).toUpperCase();

    let allTransactions = JSON.parse(localStorage.getItem('aeroTicketTransactions') || '[]');
    allTransactions.push({
      transactionID,
      memberID: journeyInfo.memberID,
      payment: '信用卡 (Credit Card)',
      transtime: new Date().toISOString(),
      totalAmount,
      cardDetails: { ...paymentForm }
    });

    const ticketIDs = new Set(savedTickets.map(t => t.ticketID));
    let allTickets = JSON.parse(localStorage.getItem('aeroTicketTickets') || '[]');
    allTickets = allTickets.map(t =>
      ticketIDs.has(t.ticketID) ? { ...t, status: 'Valid', transactionID } : t
    );

    localStorage.setItem('aeroTicketTransactions', JSON.stringify(allTransactions));
    localStorage.setItem('aeroTicketTickets',      JSON.stringify(allTickets));

    setPendingTxnID(transactionID);
    setPaymentModalStatus('processing');
    setTimeout(() => setPaymentModalStatus('success'), 1500);
  };

  const isPaymentValid = paymentForm.cardID.trim() && paymentForm.bankID.trim()
    && paymentForm.bankname.trim() && paymentForm.dueDate;
  const totalPrice = savedTickets.reduce((s, t) => s + t.ticketTotalPrice, 0);

  const STEP_LABELS = {
    1: '步驟一：確認搭乘人數',
    2: '步驟二：填寫乘客資料',
    3: '步驟三：選擇艙等',
    4: '步驟四：付款'
  };

  // ── External payment modal (portal) ──────────────────────
  const PaymentModal = () => {
    const isProcessing = paymentModalStatus === 'processing';
    const content = (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
      }}>
        <div style={{
          background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px',
          overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
        }}>
          {/* 外部系統標題列 */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: 'white', fontSize: '13px', fontWeight: '600', marginLeft: '8px', letterSpacing: '0.03em' }}>
              信用卡安全交易系統
            </span>
          </div>

          <div style={{ padding: '40px 32px', textAlign: 'center' }}>
            {isProcessing ? (
              <>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  border: '5px solid #e2e8f0', borderTopColor: '#2563eb',
                  animation: 'spin 0.9s linear infinite',
                  margin: '0 auto 24px'
                }} />
                <h3 style={{ fontSize: '17px', marginBottom: '10px', color: '#1e3a5f' }}>正在處理付款</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>請勿關閉視窗，正在連線銀行驗證中...</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ fontSize: '20px', color: '#15803d', marginBottom: '8px' }}>付款成功！</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '6px' }}>交易編號</p>
                <p style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: '700', color: '#1e3a5f', marginBottom: '28px', letterSpacing: '0.05em' }}>
                  {pendingTxnID}
                </p>
                <button className="btn"
                  style={{ width: 'auto', padding: '10px 36px', marginTop: 0, background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
                  onClick={() => onSuccess(pendingTxnID)}>
                  查看機票紀錄
                </button>
              </>
            )}
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 24px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>🔒 256-bit SSL 加密保護</span>
          </div>
        </div>
      </div>
    );
    return ReactDOM.createPortal(content, document.body);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', marginTop: '24px' }}>

      {paymentModalStatus && <PaymentModal />}

      {/* Flight summary */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>已選擇航班</div>
        {selectedFlight.legs.map((leg, idx) => (
          <div key={idx} style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: idx < selectedFlight.legs.length - 1 ? '4px' : 0 }}>
            第 {idx + 1} 段：{leg.airlineCode} {leg.ItineraryID} | {leg.DepAirportID} → {leg.LandAirportID} | {leg.Date}
          </div>
        ))}
      </div>

      {/* Step progress bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[1, 2, 3, 4].map(n => (
          <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', background: n <= currentStep ? 'var(--primary-color)' : 'var(--border-color)', transition: 'background 0.3s' }} />
        ))}
      </div>

      <h4 style={{ margin: '0 0 20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {STEP_LABELS[currentStep]}
      </h4>

      {/* ── Step 1: People count ── */}
      {currentStep === 1 && (
        <form onSubmit={e => { e.preventDefault(); setCurrentStep(2); }}>
          {selectedFlight.legs.map((leg, idx) => (
            <div key={idx} className="form-group" style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '16px' }}>
              <label>第 {idx + 1} 段 ({leg.DepAirportID} → {leg.LandAirportID}) 搭乘人數</label>
              <input type="number" min="1" max="10" value={peopleNums[idx]}
                onChange={e => handlePeopleNumChange(idx, e.target.value)} required />
            </div>
          ))}
          <div className="button-group">
            <button type="submit" className="btn">下一步：填寫乘客資料</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">取消</button>
          </div>
        </form>
      )}

      {/* ── Step 2: Passenger info ── */}
      {currentStep === 2 && (
        <form onSubmit={e => { e.preventDefault(); setCurrentStep(3); }}>
          {selectedFlight.legs.map((leg, legIdx) => (
            <div key={legIdx} style={{ marginBottom: '32px' }}>
              <h5 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>
                第 {legIdx + 1} 段 ({leg.DepAirportID} → {leg.LandAirportID}) — 共 {peopleNums[legIdx]} 名
              </h5>
              {legPassengers[legIdx].map((p, pIdx) => (
                <div key={pIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(0,0,0,0.01)' }}>
                  <h6 style={{ gridColumn: '1 / -1', marginBottom: '8px', color: 'var(--text-secondary)' }}>乘客 {pIdx + 1}</h6>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>姓氏 (Last Name)</label>
                    <input type="text" value={p.lastName} onChange={e => handlePassengerChange(legIdx, pIdx, 'lastName', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>名字 (First Name)</label>
                    <input type="text" value={p.firstName} onChange={e => handlePassengerChange(legIdx, pIdx, 'firstName', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>性別 (Gender)</label>
                    <select value={p.gender} onChange={e => handlePassengerChange(legIdx, pIdx, 'gender', e.target.value)}>
                      <option value="M">男 (Male)</option>
                      <option value="F">女 (Female)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>出生日期 (Birth Date)</label>
                    <input type="date" value={p.birthDate} onChange={e => handlePassengerChange(legIdx, pIdx, 'birthDate', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                    <label>國籍 (Nationality)</label>
                    <input type="text" value={p.nationality} onChange={e => handlePassengerChange(legIdx, pIdx, 'nationality', e.target.value)} placeholder="例如：Taiwan" required />
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="button-group">
            <button type="submit" className="btn">下一步：選擇艙等</button>
            <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-secondary">上一步</button>
          </div>
        </form>
      )}

      {/* ── Step 3: Cabin selection ── */}
      {currentStep === 3 && (
        <form onSubmit={handleStep3Submit}>
          {selectedFlight.legs.map((leg, legIdx) => (
            <div key={legIdx} style={{ marginBottom: '32px' }}>
              <h5 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>
                第 {legIdx + 1} 段 ({leg.DepAirportID} → {leg.LandAirportID})
              </h5>
              {legPassengers[legIdx].map((p, pIdx) => (
                <div key={pIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(0,0,0,0.01)', alignItems: 'center' }}>
                  <h6 style={{ gridColumn: '1 / -1', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    乘客 {pIdx + 1}：{p.lastName} {p.firstName}
                  </h6>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>選擇艙等</label>
                    <select value={p.cabin} onChange={e => handlePassengerChange(legIdx, pIdx, 'cabin', e.target.value)}>
                      <option value="經濟艙">經濟艙 (Economy) — TWD 5,000</option>
                      <option value="商務艙">商務艙 (Business) — TWD 15,000</option>
                      <option value="頭等艙">頭等艙 (First Class) — TWD 30,000</option>
                    </select>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', paddingTop: '24px' }}>
                    TWD {CABIN_PRICES[p.cabin].toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="button-group">
            <button type="submit" className="btn">下一步：付款</button>
            <button type="button" onClick={() => setCurrentStep(2)} className="btn btn-secondary">上一步</button>
          </div>
        </form>
      )}

      {/* ── Step 4: Payment (optional) ── */}
      {currentStep === 4 && (
        <div>
          {/* Ticket summary */}
          <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              機票明細
            </div>
            {savedTickets.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < savedTickets.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '14px' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', color: 'var(--primary-color)' }}>{t.itineraryID}</span>
                  <span style={{ marginLeft: '10px', padding: '2px 8px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', color: 'var(--primary-color)', fontSize: '12px' }}>{t.cabin}</span>
                </div>
                <span style={{ fontWeight: '600', color: '#22c55e' }}>TWD {t.ticketTotalPrice.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '2px solid var(--border-color)', fontWeight: '700' }}>
              <span>合計</span>
              <span style={{ color: '#22c55e', fontSize: '22px' }}>TWD {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <label>信用卡號</label>
              <input type="text" value={paymentForm.cardID}
                onChange={e => setPaymentForm(p => ({ ...p, cardID: e.target.value }))}
                placeholder="**** **** **** ****" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>銀行代號</label>
              <input type="text" value={paymentForm.bankID}
                onChange={e => setPaymentForm(p => ({ ...p, bankID: e.target.value }))}
                placeholder="013" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>銀行名稱</label>
              <input type="text" value={paymentForm.bankname}
                onChange={e => setPaymentForm(p => ({ ...p, bankname: e.target.value }))}
                placeholder="國泰世華" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>卡別</label>
              <select value={paymentForm.cardtype}
                onChange={e => setPaymentForm(p => ({ ...p, cardtype: e.target.value }))}>
                <option>VISA</option><option>MasterCard</option><option>JCB</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>到期日</label>
              <input type="month" value={paymentForm.dueDate}
                onChange={e => setPaymentForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>

          <div className="button-group">
            <button type="button" className="btn" onClick={handlePayNow}
              disabled={!isPaymentValid} style={{ opacity: isPaymentValid ? 1 : 0.5 }}>
              確認付款 TWD {totalPrice.toLocaleString()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

window.TripLegBuilder = TripLegBuilder;
