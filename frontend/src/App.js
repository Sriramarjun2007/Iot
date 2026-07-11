import React, { useEffect, useState } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

function fetchJson(path, options = {}) {
  return fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
    return res.status === 204 ? null : res.json();
  });
}

function App() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(`${API_BASE}/projects`)
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="App">
      <header className="site">
        <div className="wrap navrow">
          <a className="brand" href="#">IoTBench</a>
          <nav className="links">
            <a href="#">Home</a>
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#admin">Admin</a>
          </nav>
          <a className="btn copper small" href="#projects">Browse Projects</a>
        </div>
      </header>
      <main>
        <section className="wrap hero">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">Affordable · Guided · Viva-ready</div>
              <h1>Build a real <span>IoT project</span>.<br />Walk into your viva ready.</h1>
              <p className="lead">Pre-built, well-documented IoT mini and major projects for engineering & diploma students — complete with code, circuit diagrams, reports and 1-on-1 support.</p>
              <div className="cta-row">
                <a className="btn copper" href="#projects">Browse Projects</a>
                <a className="btn wa" href="https://wa.me/8807633986?text=Hi!%20I%20want%20to%20know%20more%20about%20IoTBench%20projects." target="_blank" rel="noreferrer">Chat on WhatsApp</a>
              </div>
            </div>
            <div className="hero-panel">
              <div className="pinrow"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
              <h4>Recently added</h4>
              {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
                <div>
                  {projects.slice(0, 4).map((project) => (
                    <div key={project.id} className="mini-card">
                      <a href={`#project-${project.id}`}><b>{project.title}</b><br /><span style={{ color: 'var(--muted)', fontSize: '12px' }}>{project.category}</span></a>
                      <span className="price">₹{project.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="wrap" id="projects">
          <div className="sec-head">
            <h2>Featured projects</h2>
          </div>
          <div className="grid">
            {loading ? <p>Loading projects...</p> : error ? <p>{error}</p> : projects.filter(p => p.featured).slice(0, 3).map((project) => (
              <div className="card" key={project.id}>
                <div className="pins"><i></i><i></i><i></i><i></i><i></i><i></i></div>
                <div className="card-body">
                  <div className="tag-row"><span className="tag">{project.category}</span><span className="tag">{project.difficulty}</span></div>
                  <h3>{project.title}</h3>
                  <p className="desc">{project.desc}</p>
                  <div className="card-foot">
                    <span className="price">₹{project.price}</span>
                    <a className="btn small secondary" href={`#project-${project.id}`}>View →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
