const fs = require('fs');

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const buildings = [
  {
    id: "ADMIN",
    name: "Administrative Block (Building 70)",
    category: "administrative",
    lat: 10.9359764,
    lng: 76.7441864,
    description: "VC Office, Registrar, Admissions, Student Affairs & Finance.",
    icon: "building"
  },
  {
    id: "CTC_LIBRARY",
    name: "Central Library & Computer Centre (CTC)",
    category: "academic",
    lat: 10.9352648,
    lng: 76.7432827,
    description: "Central Knowledge Resource Centre, Digital Library, and High-Performance Computing Labs.",
    icon: "book-open"
  },
  {
    id: "CSE_DEPT",
    name: "Division of Computer Science & Engineering",
    category: "department",
    lat: 10.9335635,
    lng: 76.7431594,
    description: "CSE Labs, Faculty Cabins, Software Development Cell.",
    icon: "code"
  },
  {
    id: "AIML_DIV",
    name: "Division of AI & Machine Learning",
    category: "department",
    lat: 10.934486,
    lng: 76.7440248,
    description: "AI/ML Research Labs, Nvidia Compute cluster, Deep Learning Classrooms.",
    icon: "cpu"
  },
  {
    id: "CYBER_DS",
    name: "Division of Data Science & Cyber Security",
    category: "department",
    lat: 10.9351886,
    lng: 76.7440683,
    description: "Cyber Security Lab, Big Data Analytics Centre.",
    icon: "shield"
  },
  {
    id: "CIVIL_DEPT",
    name: "Civil Engineering Block",
    category: "department",
    lat: 10.9354692,
    lng: 76.7440972,
    description: "Structural Engineering Labs, Survey Store, Environmental Engineering.",
    icon: "hammer"
  },
  {
    id: "ECE_DEPT",
    name: "Electronics & Communication Engineering (ECE)",
    category: "department",
    lat: 10.9361883,
    lng: 76.7433221,
    description: "VLSI, Embedded Systems, IoT Labs, DSP & Microwave Research.",
    icon: "radio"
  },
  {
    id: "BIOTECH_DEPT",
    name: "Biotechnology & Food Technology Block",
    category: "department",
    lat: 10.9361553,
    lng: 76.7425672,
    description: "Genetic Engineering, Molecular Biology, Food Processing Pilot Plant.",
    icon: "flask"
  },
  {
    id: "EEE_AGRI",
    name: "Electrical Sciences & Agricultural Sciences Block",
    category: "department",
    lat: 10.936377,
    lng: 76.7414136,
    description: "Power Systems Lab, Smart Grid Centre, Smart Agriculture Division.",
    icon: "zap"
  },
  {
    id: "AEROSPACE_DEPT",
    name: "Aerospace Engineering Block & Hangar",
    category: "department",
    lat: 10.9343679,
    lng: 76.7449195,
    description: "Flight Simulation Lab, Aerodynamics Wind Tunnel, Aircraft Hangar.",
    icon: "navigation"
  },
  {
    id: "DOVE_BLDG",
    name: "Dove Building (Training & Placement)",
    category: "administrative",
    lat: 10.9352754,
    lng: 76.7426641,
    description: "Centre for Placement & Training, Corporate Relations, Career Guidance.",
    icon: "briefcase"
  },
  {
    id: "MEDIA_CENTRE",
    name: "Karunya Media Centre (KMC)",
    category: "academic",
    lat: 10.9346719,
    lng: 76.7431953,
    description: "Media Production, Audio/Video Studios, Visual Communication Classrooms.",
    icon: "video"
  },
  {
    id: "EMMANUEL_AUD",
    name: "Emmanuel Auditorium",
    category: "auditorium",
    lat: 10.9339729,
    lng: 76.7450109,
    description: "Central Convention Auditorium, Convocation Hall, Cultural Events.",
    icon: "volume-2"
  },
  {
    id: "ELOHIM_AUD",
    name: "Elohim Auditorium",
    category: "auditorium",
    lat: 10.935142,
    lng: 76.7450213,
    description: "Seminar Hall, Faculty Conferences, Guest Lectures.",
    icon: "users"
  },
  {
    id: "DGS_SPORTS",
    name: "DGS Centre & Indoor Sports Complex",
    category: "sports",
    lat: 10.941462,
    lng: 76.7471103,
    description: "Badminton courts, Table Tennis, Gymnasium, Indoor Basketball Stadium.",
    icon: "activity"
  },
  {
    id: "HOSPITAL_SEESHA",
    name: "SEESHA Karunya Community Hospital",
    category: "medical",
    lat: 10.9385845,
    lng: 76.7416507,
    description: "24/7 Emergency Care, Pharmacy, Campus Medical Clinic, Outpatient Ward.",
    icon: "heart"
  },
  {
    id: "CANTEEN_FOODCOURT",
    name: "Central Student Amenity Centre & Food Court",
    category: "canteen",
    lat: 10.934850,
    lng: 76.743800,
    description: "Multi-cuisine student canteen, fruit juice stall, coffee shop, and snacks.",
    icon: "coffee"
  },
  {
    id: "CANTEEN_NESCAFE",
    name: "Nescafe Kiosk & Snack Bar",
    category: "canteen",
    lat: 10.935700,
    lng: 76.743500,
    description: "Beverages, sandwiches, quick bites near Central Library.",
    icon: "coffee"
  },
  {
    id: "CAMPUS_STORE",
    name: "Karunya Stationery, Books & General Store",
    category: "shop",
    lat: 10.935000,
    lng: 76.743600,
    description: "Textbooks, engineering notebooks, drawing instruments, printing & xerox.",
    icon: "shopping-bag"
  },
  {
    id: "HOSTEL_BOBRAJ",
    name: "Bobraj Men's Residence",
    category: "hostel",
    lat: 10.9400834,
    lng: 76.7450329,
    description: "Student Residential Hostel with dining hall and study rooms.",
    icon: "home"
  },
  {
    id: "HOSTEL_JMR",
    name: "JMR Men's Residence",
    category: "hostel",
    lat: 10.9407274,
    lng: 76.7450749,
    description: "Senior Student Residential Block.",
    icon: "home"
  },
  {
    id: "HOSTEL_JVR",
    name: "JVR Men's Residence",
    category: "hostel",
    lat: 10.9412752,
    lng: 76.7451494,
    description: "Student Housing Complex.",
    icon: "home"
  },
  {
    id: "HOSTEL_BETHANY",
    name: "Bethany Residence",
    category: "hostel",
    lat: 10.9432253,
    lng: 76.745554,
    description: "North Campus Residence Block.",
    icon: "home"
  },
  {
    id: "HOSTEL_EVANGELINE",
    name: "Evangeline / Oprah Ladies Residence",
    category: "hostel",
    lat: 10.9405924,
    lng: 76.7509579,
    description: "1000-Seater Ladies Hostel Campus with dedicated dining and health centre.",
    icon: "home"
  },
  {
    id: "MAIN_GATE",
    name: "Karunya Main Campus Entrance Gate",
    category: "gate",
    lat: 10.936600,
    lng: 76.744800,
    description: "Security Checkpost, Visitor Pass Counter, Bus Bay.",
    icon: "map-pin"
  }
];

const bMap = new Map(buildings.map(b => [b.id, b]));

// Walkable pathway connections
const connections = [
  // Main Gate connections
  { from: "MAIN_GATE", to: "ADMIN", pathName: "Chancellor Avenue" },
  { from: "MAIN_GATE", to: "ELOHIM_AUD", pathName: "East Walkway" },

  // Admin Block connections
  { from: "ADMIN", to: "CYBER_DS", pathName: "Academic North Corridor" },
  { from: "ADMIN", to: "CIVIL_DEPT", pathName: "East Academic Wing" },
  { from: "ADMIN", to: "CANTEEN_NESCAFE", pathName: "Library North Promenade" },
  { from: "ADMIN", to: "ECE_DEPT", pathName: "Technology Boulevard" },

  // Library & CTC connections
  { from: "CANTEEN_NESCAFE", to: "CTC_LIBRARY", pathName: "Library Steps & Walkway" },
  { from: "CTC_LIBRARY", to: "DOVE_BLDG", pathName: "Placement Arcade" },
  { from: "CTC_LIBRARY", to: "MEDIA_CENTRE", pathName: "Media Boulevard" },
  { from: "CTC_LIBRARY", to: "CAMPUS_STORE", pathName: "Amenity Way" },
  { from: "CTC_LIBRARY", to: "ECE_DEPT", pathName: "ECE Central Path" },

  // Department cluster connections
  { from: "DOVE_BLDG", to: "BIOTECH_DEPT", pathName: "Science Link Road" },
  { from: "BIOTECH_DEPT", to: "ECE_DEPT", pathName: "Bio-ECE Passage" },
  { from: "BIOTECH_DEPT", to: "EEE_AGRI", pathName: "Agriculture Walkway" },
  { from: "EEE_AGRI", to: "HOSPITAL_SEESHA", pathName: "West Health Connector" },

  // South Academic & Canteen cluster
  { from: "MEDIA_CENTRE", to: "CSE_DEPT", pathName: "Computing Walkway" },
  { from: "CAMPUS_STORE", to: "CANTEEN_FOODCOURT", pathName: "Food Court Plaza" },
  { from: "CANTEEN_FOODCOURT", to: "AIML_DIV", pathName: "Innovation Spine" },
  { from: "CANTEEN_FOODCOURT", to: "CSE_DEPT", pathName: "CSE South Path" },
  { from: "AIML_DIV", to: "CYBER_DS", pathName: "Data Science Corridor" },
  { from: "CYBER_DS", to: "CIVIL_DEPT", pathName: "Engineering Concourse" },
  { from: "AIML_DIV", to: "AEROSPACE_DEPT", pathName: "Aero Science Path" },
  { from: "AEROSPACE_DEPT", to: "EMMANUEL_AUD", pathName: "Auditorium Promenade" },
  { from: "ELOHIM_AUD", to: "EMMANUEL_AUD", pathName: "Auditorium Link Road" },
  { from: "ELOHIM_AUD", to: "CIVIL_DEPT", pathName: "East Campus Promenade" },

  // Hostels and Sports connectors
  { from: "ADMIN", to: "HOSTEL_BOBRAJ", pathName: "North Campus Ring Road" },
  { from: "HOSTEL_BOBRAJ", to: "HOSTEL_JMR", pathName: "Hostel Promenade" },
  { from: "HOSTEL_JMR", to: "HOSTEL_JVR", pathName: "Hostel Avenue" },
  { from: "HOSTEL_JVR", to: "HOSTEL_BETHANY", pathName: "North Perimeter Walk" },
  { from: "HOSTEL_JVR", to: "DGS_SPORTS", pathName: "Sports Access Road" },
  { from: "DGS_SPORTS", to: "HOSTEL_EVANGELINE", pathName: "Ladies Campus Connector Road" },
  { from: "MAIN_GATE", to: "HOSTEL_EVANGELINE", pathName: "East Boundary Walkway" },
  { from: "HOSTEL_BOBRAJ", to: "HOSPITAL_SEESHA", pathName: "Hospital Link Path" }
];

const paths = connections.map(conn => {
  const fromNode = bMap.get(conn.from);
  const toNode = bMap.get(conn.to);
  if (!fromNode || !toNode) {
    throw new Error(`Node not found: ${conn.from} or ${conn.to}`);
  }
  const distance = haversineDistanceMeters(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng);
  return {
    from: conn.from,
    to: conn.to,
    distance,
    pathName: conn.pathName,
    bidirectional: true
  };
});

fs.mkdirSync('server/data', { recursive: true });
fs.writeFileSync('server/data/buildings.json', JSON.stringify(buildings, null, 2));
fs.writeFileSync('server/data/paths.json', JSON.stringify(paths, null, 2));

console.log(`Saved ${buildings.length} Karunya buildings to server/data/buildings.json`);
console.log(`Saved ${paths.length} verified walkable paths to server/data/paths.json`);
