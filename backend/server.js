const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const APPS_FILE = path.join(DATA_DIR, 'applications.json');
const FRONTEND_BUILD_DIR = path.join(__dirname, '..', 'frontend', 'build');

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

if (fs.existsSync(FRONTEND_BUILD_DIR)) {
  app.use(express.static(FRONTEND_BUILD_DIR));
} else {
  app.use(express.static(path.join(__dirname)));
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
}

function ensureSeedFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    writeJson(filePath, fallback);
    return;
  }
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) {
    writeJson(filePath, fallback);
  }
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read JSON', filePath, err);
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

ensureDataDir();

const SEED_PROJECTS = [
  {id:"p1",title:"Smart Irrigation System",category:"ESP32 / WiFi",difficulty:"Beginner",price:1499,
   desc:"Automates watering using real-time soil moisture readings, with a live dashboard.",
   components:["ESP32 Dev Board","Soil Moisture Sensor","Relay Module","Mini Water Pump","5V Power Supply"],
   includes:["Full source code","Circuit diagram","Project report (PDF)","Presentation slides","Viva Q&A prep sheet","1-on-1 setup call"],
   featured:true, createdAt: Date.now()-1000*60*60*24*2},
  {id:"p2",title:"Home Automation with Voice Control",category:"ESP32 / WiFi",difficulty:"Intermediate",price:1799,
   desc:"Control lights and appliances by voice or app, from anywhere with an internet connection.",
   components:["ESP8266/ESP32","4-Channel Relay","Google Assistant / Alexa integration","Mobile app (Blynk)"],
   includes:["Full source code","Circuit diagram","Project report (PDF)","Presentation slides","Viva Q&A prep sheet","1-on-1 setup call"],
   featured:true, createdAt: Date.now()-1000*60*60*24*6},
  {id:"p3",title:"Vehicle Accident Detection & Alert",category:"Sensors & Automation",difficulty:"Advanced",price:2199,
   desc:"Detects a crash using an accelerometer and instantly sends GPS location via SMS to emergency contacts.",
   components:["Arduino Uno","GPS Module (NEO-6M)","GSM Module (SIM800L)","MPU6050 Accelerometer"],
   includes:["Full source code","Circuit diagram","Project report (PDF)","Presentation slides","Viva Q&A prep sheet","1-on-1 setup call"],
   featured:false, createdAt: Date.now()-1000*60*60*24*18},
  {id:"p4",title:"Smart Attendance System (RFID)",category:"Arduino",difficulty:"Beginner",price:1299,
   desc:"Marks attendance automatically when students tap an RFID card, with an exportable log.",
   components:["Arduino Uno","RFID Reader (RC522)","RFID Cards","16x2 LCD Display"],
   includes:["Full source code","Circuit diagram","Project report (PDF)","Presentation slides","Viva Q&A prep sheet","1-on-1 setup call"],
   featured:false, createdAt: Date.now()-1000*60*60*24*30},
  {id:"p5",title:"Air Quality Monitoring Dashboard",category:"ESP32 / WiFi",difficulty:"Intermediate",price:1599,
   desc:"Tracks AQI, temperature and humidity, streaming live data to an online dashboard.",
   components:["ESP8266","MQ135 Gas Sensor","DHT11 Sensor","ThingSpeak Dashboard"],
   includes:["Full source code","Circuit diagram","Project report (PDF)","Presentation slides","Viva Q&A prep sheet","1-on-1 setup call"],
   featured:true, createdAt: Date.now()-1000*60*60*24*1},
];

ensureSeedFile(PROJECTS_FILE, SEED_PROJECTS);
ensureSeedFile(APPS_FILE, []);

app.get('/api/projects', (req, res) => {
  const projects = readJson(PROJECTS_FILE, SEED_PROJECTS);
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const projects = readJson(PROJECTS_FILE, SEED_PROJECTS);
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({error:'Project not found'});
  res.json(project);
});

app.post('/api/applications', (req, res) => {
  const apps = readJson(APPS_FILE, []);
  const payload = req.body;
  if (!payload || !payload.name || !payload.phone || !payload.college || !payload.email) {
    return res.status(400).json({error:'Missing required application fields'});
  }
  const application = {
    id: 'a_' + Date.now(),
    name: payload.name,
    phone: payload.phone,
    college: payload.college,
    department: payload.department || '',
    year: payload.year || '',
    email: payload.email,
    message: payload.message || '',
    projectId: payload.projectId || null,
    projectTitle: payload.projectTitle || 'General enquiry',
    status: 'New',
    createdAt: Date.now()
  };
  apps.push(application);
  writeJson(APPS_FILE, apps);
  res.status(201).json(application);
});

app.get('/api/applications', (req, res) => {
  const apps = readJson(APPS_FILE, []);
  res.json(apps);
});

app.post('/api/projects', (req, res) => {
  const payload = req.body;
  if (!payload || !payload.title || !payload.category || !payload.price) {
    return res.status(400).json({error:'Missing required project fields'});
  }
  const projects = readJson(PROJECTS_FILE, SEED_PROJECTS);
  const project = {
    id: 'p_' + Date.now(),
    title: payload.title,
    category: payload.category,
    difficulty: payload.difficulty || 'Beginner',
    price: Number(payload.price),
    desc: payload.desc || '',
    device: payload.device || '',
    similarTo: payload.similarTo || '',
    components: Array.isArray(payload.components) ? payload.components : [],
    includes: Array.isArray(payload.includes) ? payload.includes : [],
    featured: !!payload.featured,
    createdAt: Date.now()
  };
  projects.push(project);
  writeJson(PROJECTS_FILE, projects);
  res.status(201).json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const projects = readJson(PROJECTS_FILE, SEED_PROJECTS);
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({error:'Project not found'});
  Object.assign(project, {
    title: req.body.title || project.title,
    category: req.body.category || project.category,
    difficulty: req.body.difficulty || project.difficulty,
    price: req.body.price !== undefined ? Number(req.body.price) : project.price,
    desc: req.body.desc || project.desc,
    device: req.body.device || project.device || '',
    similarTo: req.body.similarTo || project.similarTo || '',
    components: Array.isArray(req.body.components) ? req.body.components : project.components,
    includes: Array.isArray(req.body.includes) ? req.body.includes : project.includes,
    featured: req.body.featured !== undefined ? !!req.body.featured : project.featured,
  });
  writeJson(PROJECTS_FILE, projects);
  res.json(project);
});

app.delete('/api/projects/:id', (req, res) => {
  let projects = readJson(PROJECTS_FILE, SEED_PROJECTS);
  const before = projects.length;
  projects = projects.filter(p => p.id !== req.params.id);
  if (projects.length === before) return res.status(404).json({error:'Project not found'});
  writeJson(PROJECTS_FILE, projects);
  res.status(204).end();
});

if (fs.existsSync(FRONTEND_BUILD_DIR)) {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(FRONTEND_BUILD_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`IoTBench backend running on http://localhost:${PORT}`);
});
