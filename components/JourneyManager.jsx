// 主儀表板：3 分頁（會員專區 / 機票紀錄 / 交易紀錄）
// 依賴 BookingConfirmation、FlightSearch
const { useState: useStateJM, useEffect: useEffectJM } = React;

function JourneyManager({ user, onLogout }) {

  // ── State ──────────────────────────────────────────────
  const [journeyInfo, setJourneyInfo] = useStateJM(null);
  const [isEditing,   setIsEditing]   = useStateJM(false);
  const [journeyForm, setJourneyForm] = useStateJM({ departure: '', destination: '' });
  const [isSearchResultView, setIsSearchResultView] = useStateJM(false);

  const [tickets,      setTickets]      = useStateJM([]);
  const [transactions, setTransactions] = useStateJM([]);

  const [activeTab, setActiveTab] = useStateJM('profile');

  // 訂票成功 modal
  const [bookingModalTxnID, setBookingModalTxnID] = useStateJM(null);

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useStateJM(false);
  const [profileForm, setProfileForm] = useStateJM({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileError, setProfileError] = useStateJM('');

  // ── Data loader ─────────────────────────────────────────
  const loadData = () => {
    const infos = JSON.parse(localStorage.getItem('aeroTicketInfos') || '[]');
    const journey = infos.find(i => i.memberID === user.memberID);
    if (!journey) return;

    setJourneyInfo(journey);
    setJourneyForm({ departure: journey.departure, destination: journey.destination });

    const allTickets    = JSON.parse(localStorage.getItem('aeroTicketTickets')    || '[]');
    const allPassengers = JSON.parse(localStorage.getItem('aeroTicketPassengers') || '[]');
    const userTickets   = allTickets.filter(t => t.infoID === journey.infoID).map(t => {
      const pass = allPassengers.find(p => p.passengerID === t.passengerID);
      return { ...t, passengerName: pass ? `${pass.lastName} ${pass.firstName}` : 'Unknown' };
    });
    setTickets(userTickets);

    const allTxns  = JSON.parse(localStorage.getItem('aeroTicketTransactions') || '[]');
    const userTxns = allTxns.filter(t => t.memberID === user.memberID);
    userTxns.sort((a, b) => new Date(b.transtime) - new Date(a.transtime));
    setTransactions(userTxns);
  };

  useEffectJM(() => { loadData(); }, [user.memberID]);

  // ── Journey form ─────────────────────────────────────────
  const handleJourneySubmit = (e) => {
    e.preventDefault();
    let infos = JSON.parse(localStorage.getItem('aeroTicketInfos') || '[]');
    let updated;
    if (journeyInfo) {
      infos = infos.map(i => {
        if (i.memberID === user.memberID) {
          updated = { ...i, departure: journeyForm.departure, destination: journeyForm.destination, updatedAt: new Date().toISOString() };
          return updated;
        }
        return i;
      });
    } else {
      updated = {
        infoID: 'I' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        memberID: user.memberID,
        departure: journeyForm.departure,
        destination: journeyForm.destination,
        createdAt: new Date().toISOString()
      };
      infos.push(updated);
    }
    localStorage.setItem('aeroTicketInfos', JSON.stringify(infos));
    setJourneyInfo(updated);
    setIsEditing(false);
  };

  // ── Profile editing ───────────────────────────────────────
  const openProfileEdit = () => {
    setProfileForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setProfileError('');
    setIsEditingProfile(true);
  };

  const handleProfileSave = () => {
    setProfileError('');
    if (!profileForm.currentPassword) {
      setProfileError('請輸入目前密碼以驗證身份');
      return;
    }
    let users = JSON.parse(localStorage.getItem('aeroTicketUsers') || '[]');
    const userRecord = users.find(u => u.memberID === user.memberID);
    if (!userRecord || userRecord.memberPassword !== profileForm.currentPassword) {
      setProfileError('目前密碼錯誤');
      return;
    }
    if (profileForm.newPassword) {
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileError('新密碼與確認密碼不符');
        return;
      }
      if (profileForm.newPassword.length < 4) {
        setProfileError('新密碼至少需要 4 個字元');
        return;
      }
      users = users.map(u => u.memberID === user.memberID ? { ...u, memberPassword: profileForm.newPassword } : u);
      localStorage.setItem('aeroTicketUsers', JSON.stringify(users));
      const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (current && current.memberID === user.memberID) {
        localStorage.setItem('currentUser', JSON.stringify({ ...current, memberPassword: profileForm.newPassword }));
      }
    }
    setProfileForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsEditingProfile(false);
  };

  const handleDeleteAccount = () => {
    if (!profileForm.currentPassword) {
      setProfileError('請先輸入目前密碼以確認身份');
      return;
    }
    let users = JSON.parse(localStorage.getItem('aeroTicketUsers') || '[]');
    const userRecord = users.find(u => u.memberID === user.memberID);
    if (!userRecord || userRecord.memberPassword !== profileForm.currentPassword) {
      setProfileError('密碼錯誤，無法驗證身份');
      return;
    }
    if (!window.confirm(`確定要刪除帳號「${user.memberName}」嗎？此操作無法復原。`)) return;
    users = users.filter(u => u.memberID !== user.memberID);
    localStorage.setItem('aeroTicketUsers', JSON.stringify(users));
    localStorage.removeItem('currentUser');
    onLogout();
  };

  // ── Booking complete callback ──────────────────────────────
  const handleBookingComplete = (transactionID) => {
    setIsSearchResultView(false);
    loadData();
    setBookingModalTxnID(transactionID);
  };

  // ── Modal overlay wrapper（portal，避免 dashboard transform 包住 fixed）──
  const ModalOverlay = ({ children, maxWidth }) => {
    const content = (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
      }}>
        <div style={{
          background: 'white', borderRadius: '16px', width: '100%',
          maxWidth: maxWidth || '620px', maxHeight: '85vh', overflowY: 'auto'
        }}>
          {children}
        </div>
      </div>
    );
    return ReactDOM.createPortal(content, document.body);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="dashboard-container">

      {/* ── Modal: 訂票成功 ── */}
      {bookingModalTxnID && (
        <ModalOverlay maxWidth="640px">
          <div style={{ padding: '24px' }}>
            <BookingConfirmation
              transactionID={bookingModalTxnID}
              memberID={user.memberID}
              onClose={() => { setBookingModalTxnID(null); setActiveTab('tickets'); }}
            />
          </div>
        </ModalOverlay>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <h2>AeroTicket 機票訂購網站</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="user-badge">{user.memberName} ({user.memberID})</span>
          <button onClick={onLogout} className="logout-btn">登出</button>
        </div>
      </div>

      {/* Tab bar */}
      {!isSearchResultView && (
        <div style={{ display: 'flex', gap: '4px', padding: '0 24px', borderBottom: '1px solid var(--border-color)' }}>
          {[
            ['profile',      '會員專區'],
            ['tickets',      `機票紀錄${tickets.length > 0 ? ` (${tickets.length})` : ''}`],
            ['transactions', `交易紀錄${transactions.length > 0 ? ` (${transactions.length})` : ''}`]
          ].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: activeTab === id ? '700' : '500',
              color: activeTab === id ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === id ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s', marginBottom: '-1px'
            }}>{label}</button>
          ))}
        </div>
      )}

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ══════════════════════════════════════
            TAB 1: 會員專區
        ══════════════════════════════════════ */}
        {(activeTab === 'profile' || isSearchResultView) && (
          <>
            {!isSearchResultView && (
              <div className="card">
                <div className="card-title" style={{ position: 'relative' }}>
                  會員資料
                  <button
                    onClick={isEditingProfile
                      ? () => { setIsEditingProfile(false); setProfileError(''); }
                      : openProfileEdit}
                    title={isEditingProfile ? '取消' : '編輯帳號設定'}
                    style={{
                      position: 'absolute', top: '50%', right: 0,
                      transform: 'translateY(-50%)',
                      background: isEditingProfile ? '#f1f5f9' : 'none',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px', cursor: 'pointer',
                      padding: '7px 18px', fontSize: '14px', fontWeight: '500',
                      color: 'var(--text-secondary)', lineHeight: 1
                    }}>
                    {isEditingProfile ? '取消' : '編輯'}
                  </button>
                </div>

                <div className="member-info">
                  <span className="info-label">會員編號</span>
                  <div className="info-value" style={{ color: '#818cf8', borderColor: 'rgba(129,140,248,0.3)' }}>{user.memberID}</div>
                </div>
                <div className="member-info" style={{ marginBottom: isEditingProfile ? '20px' : 0 }}>
                  <span className="info-label">信箱</span>
                  <div className="info-value">{user.memberMail}</div>
                </div>

                {isEditingProfile && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      修改密碼
                    </div>
                    <div className="form-group">
                      <label>目前密碼</label>
                      <input type="password" value={profileForm.currentPassword}
                        onChange={e => setProfileForm(p => ({ ...p, currentPassword: e.target.value }))}
                        placeholder="請輸入目前密碼" />
                    </div>
                    <div className="form-group">
                      <label>
                        新密碼
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '400', marginLeft: '6px' }}>(若不修改請留空)</span>
                      </label>
                      <input type="password" value={profileForm.newPassword}
                        onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))}
                        placeholder="請輸入新密碼" />
                    </div>
                    <div className="form-group">
                      <label>確認新密碼</label>
                      <input type="password" value={profileForm.confirmPassword}
                        onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="再次輸入新密碼" />
                    </div>

                    {profileError && (
                      <p style={{ color: 'var(--error-color)', fontSize: '13px', marginBottom: '14px' }}>{profileError}</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button type="button" onClick={handleDeleteAccount}
                        style={{
                          background: 'none', border: '1px solid rgba(239,68,68,0.5)',
                          color: '#ef4444', borderRadius: '8px',
                          padding: '7px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                        }}>
                        申請刪除帳號
                      </button>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary"
                          style={{ width: 'auto', padding: '7px 16px', marginTop: 0 }}
                          onClick={() => { setIsEditingProfile(false); setProfileError(''); }}>
                          取消
                        </button>
                        <button className="btn"
                          style={{ width: 'auto', padding: '7px 20px', marginTop: 0 }}
                          onClick={handleProfileSave}>
                          確定
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isSearchResultView && (
              <div className="card">
                <div className="card-title">
                  旅程資訊 (Info)
                  {journeyInfo && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '14px', marginTop: 0 }}>修改旅程</button>
                  )}
                </div>

                {!journeyInfo && !isEditing ? (
                  <div className="empty-state">
                    <p>您尚未建立任何旅程。馬上開始規劃您的下一趟飛行吧！</p>
                    <button onClick={() => setIsEditing(true)} className="btn">建立旅程</button>
                  </div>
                ) : isEditing ? (
                  <form onSubmit={handleJourneySubmit} style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className="form-group">
                      <label>出發地點 (Departure Location)</label>
                      <input type="text" value={journeyForm.departure}
                        onChange={e => setJourneyForm(p => ({ ...p, departure: e.target.value }))}
                        placeholder="例如：台北" required />
                    </div>
                    <div className="form-group">
                      <label>目的地點 (Destination Location)</label>
                      <input type="text" value={journeyForm.destination}
                        onChange={e => setJourneyForm(p => ({ ...p, destination: e.target.value }))}
                        placeholder="例如：紐約" required />
                    </div>
                    <div className="button-group">
                      <button type="submit" className="btn">儲存旅程</button>
                      {journeyInfo && (
                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">取消</button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className="member-info">
                      <span className="info-label">旅程識別碼 (Info ID)</span>
                      <div className="info-value" style={{ color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }}>{journeyInfo.infoID}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="member-info" style={{ marginBottom: 0 }}>
                        <span className="info-label">出發地</span>
                        <div className="info-value">{journeyInfo.departure}</div>
                      </div>
                      <div className="member-info" style={{ marginBottom: 0 }}>
                        <span className="info-label">目的地</span>
                        <div className="info-value">{journeyInfo.destination}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {journeyInfo && !isEditing && (
              <div className="card">
                <FlightSearch
                  journeyInfo={journeyInfo}
                  onSearchStateChange={(searching) => {
                    setIsSearchResultView(searching);
                    if (!searching) loadData();
                  }}
                  onBookingComplete={handleBookingComplete}
                />
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            TAB 2: 機票紀錄
        ══════════════════════════════════════ */}
        {activeTab === 'tickets' && !isSearchResultView && (
          tickets.length === 0 ? (
            <div className="card"><div className="empty-state"><p>目前尚無機票紀錄。</p></div></div>
          ) : (
            <div className="card">
              <div className="card-title">機票紀錄 (Tickets)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tickets.map(ticket => {
                  const isRefunded = ticket.status === 'Refunded';
                  return (
                    <div key={ticket.ticketID} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', opacity: isRefunded ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px' }}>
                        <div style={{ fontWeight: '600' }}>
                          機票號: <span style={{ color: 'var(--primary-color)', fontFamily: 'monospace' }}>{ticket.ticketID}</span>
                        </div>
                        <span style={{
                          padding: '2px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
                          background: isRefunded ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                          color: isRefunded ? '#ef4444' : '#22c55e'
                        }}>
                          {isRefunded ? '已退票' : '有效 Valid'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                        <div><span style={{ color: 'var(--text-secondary)' }}>乘客</span><br /><strong>{ticket.passengerName}</strong></div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>航段</span><br /><strong>{ticket.itineraryID}</strong></div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>艙等</span><br /><strong>{ticket.cabin}</strong></div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>票價</span><br /><strong style={{ color: '#22c55e' }}>TWD {ticket.ticketTotalPrice.toLocaleString()}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* ══════════════════════════════════════
            TAB 3: 交易紀錄
        ══════════════════════════════════════ */}
        {activeTab === 'transactions' && !isSearchResultView && (
          transactions.length === 0 ? (
            <div className="card"><div className="empty-state"><p>目前尚無交易紀錄。</p></div></div>
          ) : (
            <div className="card">
              <div className="card-title">交易紀錄 (Transactions)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {transactions.map(txn => (
                  <div key={txn.transactionID} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontWeight: '600' }}>
                        交易編號: <span style={{ color: 'var(--primary-color)', fontFamily: 'monospace' }}>{txn.transactionID}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{new Date(txn.transtime).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>總金額</span><br /><strong style={{ color: '#22c55e' }}>TWD {txn.totalAmount.toLocaleString()}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>付款方式</span><br /><strong>{txn.payment}</strong></div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>信用卡</span><br />
                        <strong>**** **** **** {(txn.cardDetails.cardID || '').slice(-4)}</strong>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                          {txn.cardDetails.bankname} · {txn.cardDetails.cardtype}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}

window.JourneyManager = JourneyManager;
