// 航班搜尋 + 航班卡片展示（依賴 TripLegBuilder）
const { useState: useStateFS } = React;

function FlightSearch({ journeyInfo, onSearchStateChange, onBookingComplete }) {

  // Convert free-text location to IATA airport code
  const getAirportCode = (str) => {
    if (!str) return '';
    const match = str.match(/\(([A-Z]{3})\)/);
    if (match) return match[1];
    const s = str.toLowerCase();
    if (s.includes('台北') || s.includes('taipei'))         return 'TPE';
    if (s.includes('紐約') || s.includes('new york'))       return 'JFK';
    if (s.includes('東京') || s.includes('tokyo'))          return 'NRT';
    if (s.includes('舊金山') || s.includes('san francisco')) return 'SFO';
    if (s.includes('洛杉磯') || s.includes('los angeles'))  return 'LAX';
    return str.toUpperCase();
  };

  const isNY = (code) => ['JFK', 'EWR', '紐約', 'NEW YORK', 'NYC'].includes(code);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [searchParams, setSearchParams] = useStateFS({
    depAirport:  journeyInfo ? getAirportCode(journeyInfo.departure)    : '',
    landAirport: journeyInfo ? getAirportCode(journeyInfo.destination)  : '',
    date: tomorrow.toISOString().split('T')[0]
  });
  const [results, setResults]             = useStateFS(null);
  const [selectedFlight, setSelectedFlight] = useStateFS(null);

  const handleInputChange = (e) =>
    setSearchParams(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const searchFlights = (e) => {
    e.preventDefault();
    const dep  = getAirportCode(searchParams.depAirport);
    const land = getAirportCode(searchParams.landAirport);
    const date = searchParams.date;
    const found = [];

    const enrich = (itin) => {
      const company = companies.find(c => c.CompanyID === itin.CompanyID);
      const daily   = dailyItineraries.find(d => d.ItineraryID === itin.ItineraryID);
      return { ...itin, ...company, Date: date, seatCapacity: daily ? daily.seatCapacity : 0 };
    };

    const targetCodes = isNY(land) ? ['JFK', 'EWR'] : [land];

    // Direct flights
    itineraries
      .filter(i => i.DepAirportID === dep && targetCodes.includes(i.LandAirportID))
      .forEach(f => found.push({ type: 'direct', legs: [enrich(f)] }));

    // 1-stop connections
    itineraries.filter(i => i.DepAirportID === dep).forEach(leg1 => {
      itineraries
        .filter(i => i.DepAirportID === leg1.LandAirportID && targetCodes.includes(i.LandAirportID))
        .forEach(leg2 => found.push({ type: 'connection', legs: [enrich(leg1), enrich(leg2)] }));
    });

    setResults(found);
    if (onSearchStateChange) onSearchStateChange(true);
  };

  const handleBackToDashboard = () => {
    setResults(null);
    setSelectedFlight(null);
    if (onSearchStateChange) onSearchStateChange(false);
  };

  // Called by TripLegBuilder: transactionID = paid, null = saved as unpaid
  const handleTripLegSuccess = (transactionID) => {
    setSelectedFlight(null);
    setResults(null);
    if (onBookingComplete) onBookingComplete(transactionID);
  };

  // ── Sub-component: single flight leg card ──
  const FlightLeg = ({ flight }) => (
    <div className="flight-card">
      <div className="flight-header">
        <div className="airline-info">
          <div className="airline-logo">{flight.airlineCode}</div>
          <div>
            <div className="airline-name">{flight.airlineName}</div>
            <div className="airline-code">公司編號: {flight.CompanyID}</div>
          </div>
        </div>
        <div className="flight-id">航班編號: {flight.ItineraryID}</div>
      </div>
      <div className="flight-route">
        <div className="flight-point">
          <div className="flight-time">{flight.DepartTime}</div>
          <div className="flight-airport">{flight.DepAirportID}</div>
        </div>
        <div className="flight-duration">
          <div className="flight-stops">直飛</div>
          <div className="duration-line"></div>
        </div>
        <div className="flight-point">
          <div className="flight-time">{flight.LandTime}</div>
          <div className="flight-airport">{flight.LandAirportID}</div>
        </div>
      </div>
      <div className="flight-footer">
        <div className="seat-info">日期: <span style={{ color: 'var(--text-primary)' }}>{flight.Date}</span></div>
        <div className="seat-info">剩餘座位量: <span className="seat-count">{flight.seatCapacity}</span></div>
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="card-title" style={{ marginBottom: 0 }}>查詢航班 (Itinerary)</div>
        {results && !selectedFlight && (
          <button type="button" onClick={handleBackToDashboard} className="btn btn-secondary"
            style={{ width: 'auto', padding: '6px 12px', marginTop: 0 }}>返回旅程總覽</button>
        )}
      </div>

      {selectedFlight ? (
        <TripLegBuilder
          selectedFlight={selectedFlight}
          journeyInfo={journeyInfo}
          onCancel={() => setSelectedFlight(null)}
          onSuccess={handleTripLegSuccess}
        />
      ) : (
        <>
          <form onSubmit={searchFlights} className="search-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>出發機場</label>
              <input type="text" name="depAirport" value={searchParams.depAirport}
                onChange={handleInputChange} placeholder="例如：TPE" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>目的機場</label>
              <input type="text" name="landAirport" value={searchParams.landAirport}
                onChange={handleInputChange} placeholder="例如：JFK 或 NYC" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>出發日期</label>
              <input type="date" name="date" value={searchParams.date}
                onChange={handleInputChange} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn" style={{ marginTop: '10px' }}>搜尋航班</button>
            </div>
          </form>

          {results && (
            <div className="flight-results">
              <h3 style={{ fontSize: '18px', marginTop: '16px', marginBottom: '8px' }}>
                搜尋結果 ({results.length} 筆)
              </h3>
              {results.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <p>找不到符合條件的航班，請嘗試其他機場（如 TPE 到 JFK）。</p>
                </div>
              ) : (
                results.map((result, idx) => (
                  <div key={idx} style={{ marginBottom: '24px', cursor: 'pointer' }}
                    onClick={() => setSelectedFlight(result)}>
                    {result.type === 'direct' ? (
                      <FlightLeg flight={result.legs[0]} />
                    ) : (
                      <div className="flight-card connection-card">
                        <div style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--primary-color)', fontWeight: '600' }}>
                          轉機航班 (1停)
                        </div>
                        <div className="connection-indicator">
                          <FlightLeg flight={result.legs[0]} />
                          <div className="connection-stop-label">在 {result.legs[0].LandAirportID} 轉機</div>
                          <FlightLeg flight={result.legs[1]} />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

window.FlightSearch = FlightSearch;
