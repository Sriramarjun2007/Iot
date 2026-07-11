/* ===========================================================
   IoTBench — shared data layer
   Uses localStorage so the site works on any host (no server
   required). NOTE: localStorage is per-browser/device — great
   for demos and single-admin use, but if you need the admin's
   changes to appear for students on their own phones, you'll
   need a real backend + database (see note at bottom of file).
   =========================================================== */

const WHATSAPP_NUMBER = "8807633986"; // TODO: replace with your real WhatsApp number, digits only, country code first, no + or spaces
const ADMIN_PASSWORD  = "iotbench2026";  // TODO: change this before sharing the site — see admin.html notice

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

const BACKEND_PORT = 3000;
const BACKEND_ORIGIN = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://localhost:${BACKEND_PORT}`
  : '';
const API_BASE = BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : '/api';

async function requestJson(path, options = {}){
  const response = await fetch(path, {
    headers: {'Content-Type':'application/json'},
    ...options
  });
  if(!response.ok){
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }
  return response.status === 204 ? null : response.json();
}

async function tryBackend(path, fallback){
  try {
    return await requestJson(path);
  } catch (err) {
    console.warn('Backend request failed, using fallback data:', err);
    return fallback;
  }
}

function readLocal(key, fallback){
  const raw = localStorage.getItem(key);
  if(!raw) return fallback;
  try{ return JSON.parse(raw); }catch(e){ return fallback; }
}

function writeLocal(key, data){ localStorage.setItem(key, JSON.stringify(data)); }

async function getProjects(){
  if(USE_BACKEND){
    const fallback = readLocal('iotbench_projects', SEED_PROJECTS);
    const projects = await tryBackend(`${API_BASE}/projects`, fallback);
    if(!Array.isArray(projects) || projects.length === 0){
      writeLocal('iotbench_projects', SEED_PROJECTS);
      return SEED_PROJECTS.slice();
    }
    return projects;
  }
  const projects = readLocal('iotbench_projects', null);
  if(!Array.isArray(projects) || projects.length === 0){
    writeLocal('iotbench_projects', SEED_PROJECTS);
    return SEED_PROJECTS.slice();
  }
  return projects;
}

async function getProject(id){
  if(USE_BACKEND){
    return requestJson(`${API_BASE}/projects/${encodeURIComponent(id)}`);
  }
  const projects = await getProjects();
  return projects.find(p => p.id === id) || null;
}

async function saveProjects(list){
  if(USE_BACKEND){
    // no bulk save endpoint currently; fallback to localStorage when backend is enabled
    writeLocal('iotbench_projects', list);
    return;
  }
  writeLocal('iotbench_projects', list);
}

async function getApplications(){
  if(USE_BACKEND){
    return requestJson(`${API_BASE}/applications`);
  }
  return readLocal('iotbench_applications', []);
}

async function saveApplications(list){
  if(USE_BACKEND){
    // no bulk save endpoint currently; fallback to localStorage when backend is enabled
    writeLocal('iotbench_applications', list);
    return;
  }
  writeLocal('iotbench_applications', list);
}

async function createApplication(app){
  if(USE_BACKEND){
    return requestJson(`${API_BASE}/applications`, {method:'POST', body: JSON.stringify(app)});
  }
  const applications = await getApplications();
  applications.push(app);
  saveApplications(applications);
  return app;
}

async function createProject(project){
  if(USE_BACKEND){
    return requestJson(`${API_BASE}/projects`, {method:'POST', body: JSON.stringify(project)});
  }
  const projects = await getProjects();
  const newProject = {
    id:'p_'+Date.now(),
    createdAt:Date.now(),
    device: project.device || '',
    similarTo: project.similarTo || '',
    ...project
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

async function updateProject(id, payload){
  if(USE_BACKEND){
    return requestJson(`${API_BASE}/projects/${encodeURIComponent(id)}`, {method:'PUT', body: JSON.stringify(payload)});
  }
  const projects = await getProjects();
  const project = projects.find(p => p.id === id);
  if(!project) throw new Error('Project not found');
  Object.assign(project, payload);
  saveProjects(projects);
  return project;
}

async function deleteProject(id){
  if(USE_BACKEND){
    return requestJson(`${API_BASE}/projects/${encodeURIComponent(id)}`, {method:'DELETE'});
  }
  let projects = await getProjects();
  projects = projects.filter(p => p.id !== id);
  saveProjects(projects);
  return null;
}

function waLink(text){ return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`; }
function fmt(n){ return "₹" + Number(n).toLocaleString('en-IN'); }
function timeAgo(ts){
  const d = Math.floor((Date.now()-ts)/(1000*60*60*24));
  if(d<1) return "today";
  if(d===1) return "1 day ago";
  if(d<30) return d+" days ago";
  return Math.floor(d/30)+" mo ago";
}
function esc(s){ return String(s||"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function qs(name){ return new URLSearchParams(window.location.search).get(name); }

/* Set the floating WhatsApp button href + active nav link on every page */
function initShell(activePage){
  const fab = document.getElementById('fabWA');
  if(fab) fab.href = waLink("Hi! I'm interested in an IoT project from IoTBench.");
  document.querySelectorAll('nav.links a').forEach(a=>{
    if(a.dataset.page===activePage) a.classList.add('active');
  });
}

/* -------------------------------------------------------------
   PRODUCTION NOTE
   This demo stores data in the browser's localStorage, so it
   works instantly on any static host (GitHub Pages, Netlify,
   your own hosting) with zero setup. The trade-off: each device/
   browser has its own separate copy of the data. That's fine for
   testing or a single-admin setup on one machine, but for a real
   multi-user site (admin on a laptop, students applying from
   their own phones) you'll want a small backend with a shared
   database. Swap getProjects/saveProjects/getApplications/
   saveApplications for fetch() calls to your API and everything
   else on every page keeps working unchanged.
   ------------------------------------------------------------- */