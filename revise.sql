-- 機場
CREATE TABLE Airport (
    airportID   INT PRIMARY KEY,
    airportName VARCHAR(100)
);

-- 航空公司
CREATE TABLE Company (
    airlineCode VARCHAR(10) PRIMARY KEY,
    airlineName VARCHAR(100)
);

-- 旅程資訊
CREATE TABLE Info (
    infoID        INT PRIMARY KEY,
    departureDate DATE,
    location      VARCHAR(100),
    departure     VARCHAR(100),
    destination   VARCHAR(100)
);

-- 乘客
CREATE TABLE Passenger (
    passengerID INT PRIMARY KEY,
    lastName    VARCHAR(50),
    firstName   VARCHAR(50),
    gender      CHAR(1),
    birthDate   DATE,
    nationality VARCHAR(50)
);

-- 航班（Itinerary）
CREATE TABLE Itinerary (
    itineraryID   INT PRIMARY KEY,
    companyID     VARCHAR(10) NOT NULL,
    depAirportID  INT NOT NULL,
    landAirportID INT NOT NULL,
    departTime    TIME,
    landTime      TIME,
    FOREIGN KEY (companyID)     REFERENCES Company(airlineCode),
    FOREIGN KEY (depAirportID)  REFERENCES Airport(airportID),
    FOREIGN KEY (landAirportID) REFERENCES Airport(airportID)
);

-- 航段（FlightSegment）
CREATE TABLE FlightSegment (
    depAirportID  INT NOT NULL,
    landAirportID INT NOT NULL,
    PRIMARY KEY (depAirportID, landAirportID),
    FOREIGN KEY (depAirportID)  REFERENCES Airport(airportID),
    FOREIGN KEY (landAirportID) REFERENCES Airport(airportID)
);

-- 航段與航班 多對多（FlightSegment includes Itinerary, N:M）
CREATE TABLE FlightSegment_Itinerary (
    depAirportID  INT NOT NULL,
    landAirportID INT NOT NULL,
    itineraryID   INT NOT NULL,
    PRIMARY KEY (depAirportID, landAirportID, itineraryID),
    FOREIGN KEY (depAirportID, landAirportID) REFERENCES FlightSegment(depAirportID, landAirportID),
    FOREIGN KEY (itineraryID)                 REFERENCES Itinerary(itineraryID)
);

-- 航空公司與航段 多對多（Company corresponds FlightSegment, N:M）
CREATE TABLE Company_FlightSegment (
    airlineCode   VARCHAR(10) NOT NULL,
    depAirportID  INT NOT NULL,
    landAirportID INT NOT NULL,
    PRIMARY KEY (airlineCode, depAirportID, landAirportID),
    FOREIGN KEY (airlineCode)                 REFERENCES Company(airlineCode),
    FOREIGN KEY (depAirportID, landAirportID) REFERENCES FlightSegment(depAirportID, landAirportID)
);

-- 機票
CREATE TABLE Ticket (
    ticketID         INT PRIMARY KEY,
    cabin            VARCHAR(20),
    ticketNum        INT,
    ticketTotalPrice DECIMAL(10,2),
    infoID           INT NOT NULL,
    passengerID      INT NOT NULL,
    depAirportID     INT NOT NULL,
    landAirportID    INT NOT NULL,
    FOREIGN KEY (infoID)                      REFERENCES Info(infoID),
    FOREIGN KEY (passengerID)                 REFERENCES Passenger(passengerID),
    FOREIGN KEY (depAirportID, landAirportID) REFERENCES FlightSegment(depAirportID, landAirportID)
);

-- 交易
CREATE TABLE Transaction (
    transactionID INT PRIMARY KEY,
    transtime     DATETIME,
    payment       VARCHAR(50),
    bankID        VARCHAR(20),
    bankName      VARCHAR(100),
    cardName      VARCHAR(50),
    cardType      VARCHAR(20),
    cardID        VARCHAR(30),
    ticketID      INT NOT NULL,
    FOREIGN KEY (ticketID) REFERENCES Ticket(ticketID)
);

-- 旅程分段（TripLeg）
-- TripLeg includes Itinerary (N:1)
CREATE TABLE TripLeg (
    tripLegID   INT PRIMARY KEY,
    itineraryID INT NOT NULL,
    FOREIGN KEY (itineraryID) REFERENCES Itinerary(itineraryID)
);