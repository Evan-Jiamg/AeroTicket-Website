// Mock Data — shared globals (loaded as plain <script> before all components)
var companies = [
  { CompanyID: 'C01', airlineName: '長榮航空', airlineCode: 'BR' },
  { CompanyID: 'C02', airlineName: '中華航空', airlineCode: 'CI' },
  { CompanyID: 'C03', airlineName: '日本航空', airlineCode: 'JL' },
  { CompanyID: 'C04', airlineName: '聯合航空', airlineCode: 'UA' }
];

var itineraries = [
  { ItineraryID: 'BR032', CompanyID: 'C01', DepAirportID: 'TPE', LandAirportID: 'JFK', DepartTime: '19:10', LandTime: '22:05' },
  { ItineraryID: 'CI012', CompanyID: 'C02', DepAirportID: 'TPE', LandAirportID: 'JFK', DepartTime: '17:30', LandTime: '20:15' },
  { ItineraryID: 'JL802', CompanyID: 'C03', DepAirportID: 'TPE', LandAirportID: 'NRT', DepartTime: '10:00', LandTime: '14:20' },
  { ItineraryID: 'JL004', CompanyID: 'C03', DepAirportID: 'NRT', LandAirportID: 'JFK', DepartTime: '18:30', LandTime: '18:25' },
  { ItineraryID: 'CI004', CompanyID: 'C02', DepAirportID: 'TPE', LandAirportID: 'SFO', DepartTime: '23:40', LandTime: '20:35' },
  { ItineraryID: 'UA884', CompanyID: 'C04', DepAirportID: 'SFO', LandAirportID: 'EWR', DepartTime: '23:00', LandTime: '07:30' }
];

var dailyItineraries = [
  { ItineraryID: 'BR032', seatCapacity: 45 },
  { ItineraryID: 'CI012', seatCapacity: 12 },
  { ItineraryID: 'JL802', seatCapacity: 120 },
  { ItineraryID: 'JL004', seatCapacity: 80 },
  { ItineraryID: 'CI004', seatCapacity: 210 },
  { ItineraryID: 'UA884', seatCapacity: 50 }
];
