import { useState, useEffect, useRef } from 'react';

const tracks = [
  { title: 'Midnight Circuit', artist: 'Echo Chamber', genre: 'Electronic', plays: '2.4M', art: 'art1', emoji: '🎵', dur: 204 },
  { title: 'Solar Drift', artist: 'Tangerine Sky', genre: 'Synthwave', plays: '1.9M', art: 'art2', emoji: '🔥', dur: 187 },
  { title: 'Deep Horizon', artist: 'Aqua Pulse', genre: 'Ambient', plays: '1.6M', art: 'art3', emoji: '🎶', dur: 234 },
  { title: 'Golden Hour', artist: 'Nova Bright', genre: 'Indie Pop', plays: '1.1M', art: 'art4', emoji: '✨', dur: 198 },
  { title: 'Tidal Rush', artist: 'Cerulean Drift', genre: 'Chillwave', plays: '980K', art: 'art5', emoji: '🌊', dur: 215 }
];

const wheelColors = [
  { name: 'Red', type: 'Primary', hex: '#FF0000', angle: 0 },
  { name: 'Red-Orange', type: 'Tertiary', hex: '#FF4400', angle: 30 },
  { name: 'Orange', type: 'Secondary', hex: '#FF8800', angle: 60 },
  { name: 'Yellow-Orange', type: 'Tertiary', hex: '#FFAA00', angle: 90 },
  { name: 'Yellow', type: 'Primary', hex: '#FFDD00', angle: 120 },
  { name: 'Yellow-Green', type: 'Tertiary', hex: '#AADD00', angle: 150 },
  { name: 'Green', type: 'Secondary', hex: '#00BB00', angle: 180 },
  { name: 'Blue-Green (Teal)', type: 'Tertiary', hex: '#0D9488', angle: 210 },
  { name: 'Blue', type: 'Primary', hex: '#0044CC', angle: 240 },
  { name: 'Blue-Violet', type: 'Tertiary', hex: '#3311CC', angle: 270 },
  { name: 'Violet', type: 'Secondary', hex: '#7700CC', angle: 300 },
  { name: 'Red-Violet', type: 'Tertiary', hex: '#CC0066', angle: 330 }
];

export default function App() {
  const [curTrack, setCurTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [activeScheme, setActiveScheme] = useState('complementary');
  const [rgb, setRgb] = useState({ r: 128, g: 128, b: 128 });
  const [toast, setToast] = useState({ show: false, msg: 'Now Playing!' });

  const rippleCanvasRef = useRef(null);
  const particlesCanvasRef = useRef(null);
  const colorWheelCanvasRef = useRef(null);
  const analogousCanvasRef = useRef(null);
  const complementaryCanvasRef = useRef(null);
  const triadicCanvasRef = useRef(null);
  const monochromaticCanvasRef = useRef(null);
  const curRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);
  const progIntervalRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    return m + ':' + (Math.floor(s % 60)).toString().padStart(2, '0');
  };

  const showToast = (msg) => {
    setToast({ show: true, msg });
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const playTrack = (i) => {
    setCurTrack(i);
    setIsPlaying(true);
    setProgress(0);
    showToast(`Now Playing: ${tracks[i].title} ${tracks[i].emoji}`);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => playTrack((curTrack + 1) % tracks.length);
  const prevTrack = () => playTrack((curTrack - 1 + tracks.length) % tracks.length);

  const toggleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    if (newLiked) showToast('Added to your Liked Songs ♥');
  };

  const seekTo = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setProgress(Math.max(0, Math.min(100, pct * 100)));
  };

  const handleSetVolume = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(100, pct * 100)));
  };

  const updateRGB = (rVal, gVal, bVal) => {
    setRgb({ r: parseInt(rVal), g: parseInt(gVal), b: parseInt(bVal) });
  };

  useEffect(() => {
    // ---- CURSOR ----
    let mx = 0, my = 0, rx = 0, ry = 0, tx2 = 0, ty2 = 0;
    const onMouseMove = (e) => {
      mx=e.clientX; my=e.clientY;
      if(curRef.current){
        curRef.current.style.left=mx+'px';
        curRef.current.style.top=my+'px';
      }
      spawnRipple(mx,my);
    };

    let cursorAnimId;
    const animFollowers = () => {
      rx += (mx - rx) * .12; ry += (my - ry) * .12;
      tx2 += (mx - tx2) * .055; ty2 += (my - ty2) * .055;
      if (ringRef.current) {
        ringRef.current.style.left = Math.round(rx) + 'px';
        ringRef.current.style.top = Math.round(ry) + 'px';
      }
      if (trailRef.current) {
        trailRef.current.style.left = Math.round(tx2) + 'px';
        trailRef.current.style.top = Math.round(ty2) + 'px';
      }
      cursorAnimId = requestAnimationFrame(animFollowers);
    };
    animFollowers();

    const hoverHandler = (e) => {
      const selectors = 'button,a,.track-card,.pd-card,.pb-swatch,.app-card,.rgb-preset-btn,.stab,.ocr-row,.ct-card,.theory-block';
      if (e.target.closest(selectors)) {
        document.body.classList.add('cur-hover');
      } else {
        document.body.classList.remove('cur-hover');
      }
    };
    window.addEventListener('mouseover', hoverHandler);

    // ---- RIPPLE CANVAS ----
    const rippleCanvas = rippleCanvasRef.current;
    const rippleCtx = rippleCanvas.getContext('2d');
    let ripples = [];
    const resizeRipple = () => { rippleCanvas.width = window.innerWidth; rippleCanvas.height = window.innerHeight; };
    resizeRipple();

    const spawnRipple = (x, y) => {
      if (Math.random() > .18) return;
      const isOrange = Math.random() > .5;
      ripples.push({ x, y, r: 0, maxR: Math.random() * 80 + 40, alpha: .18, color: isOrange ? '249,115,22' : '13,148,136', speed: Math.random() * 1.2 + .6 });
    };

    let rippleAnimId;
    const animRipples = () => {
      rippleCtx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
      ripples = ripples.filter(rp => rp.alpha > 0.005);
      ripples.forEach(rp => {
        rp.r += rp.speed; rp.alpha *= 0.94;
        const grad = rippleCtx.createRadialGradient(rp.x, rp.y, rp.r * .3, rp.x, rp.y, rp.r);
        grad.addColorStop(0, `rgba(${rp.color},${rp.alpha * .6})`);
        grad.addColorStop(.5, `rgba(${rp.color},${rp.alpha})`);
        grad.addColorStop(1, `rgba(${rp.color},0)`);
        rippleCtx.beginPath(); rippleCtx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); rippleCtx.fillStyle = grad; rippleCtx.fill();
      });
      rippleAnimId = requestAnimationFrame(animRipples);
    };
    animRipples();

    // ---- PARTICLES ----
    const pCanvas = particlesCanvasRef.current;
    const pCtx = pCanvas.getContext('2d');
    let particles = [];
    const resizePCanvas = () => { pCanvas.width = pCanvas.offsetWidth; pCanvas.height = pCanvas.offsetHeight; };
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 55; i++) {
        particles.push({ x: Math.random() * pCanvas.width, y: Math.random() * pCanvas.height, r: Math.random() * 1.8 + .4, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, c: Math.random() > .5 ? 'rgba(13,148,136,' : 'rgba(249,115,22,', a: Math.random() * .4 + .1 });
      }
    };
    resizePCanvas(); initParticles();

    let pAnimId;
    const animParticles = () => {
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      particles.forEach(p => {
        pCtx.beginPath(); pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); pCtx.fillStyle = p.c + p.a + ')'; pCtx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = pCanvas.width; if (p.x > pCanvas.width) p.x = 0;
        if (p.y < 0) p.y = pCanvas.height; if (p.y > pCanvas.height) p.y = 0;
      });
      pAnimId = requestAnimationFrame(animParticles);
    };
    animParticles();

    // ---- COLOR WHEEL ----
    const drawColorWheel = () => {
      const cv = colorWheelCanvasRef.current; if (!cv) return;
      const c = cv.getContext('2d'); const cx = 130, cy = 130, R = 108, r = 52, seg = Math.PI * 2 / 12;
      wheelColors.forEach((col, i) => {
        const s = i * seg - Math.PI / 2 - seg / 2, e = s + seg;
        c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, s, e); c.closePath(); c.fillStyle = col.hex; c.fill();
        c.strokeStyle = 'rgba(10,15,15,.5)'; c.lineWidth = 1.5; c.stroke();
      });
      c.beginPath(); c.arc(cx, cy, r + 4, 0, Math.PI * 2); c.fillStyle = 'rgba(10,15,15,.9)'; c.fill();
      const tealAngle = (210 - 90) * Math.PI / 180; const orangeAngle = (60 - 90) * Math.PI / 180;
      const tx = cx + Math.cos(tealAngle) * 80, ty = cy + Math.sin(tealAngle) * 80, ox = cx + Math.cos(orangeAngle) * 80, oy = cy + Math.sin(orangeAngle) * 80;
      c.beginPath(); c.moveTo(tx, ty); c.lineTo(ox, oy); c.strokeStyle = 'rgba(249,115,22,.5)'; c.lineWidth = 1.5; c.setLineDash([5, 3]); c.stroke(); c.setLineDash([]);
      [[tealAngle, '#0D9488'], [orangeAngle, '#F97316']].forEach(([ang, col]) => {
        const x = cx + Math.cos(ang) * 80, y = cy + Math.sin(ang) * 80;
        c.beginPath(); c.arc(x, y, 11, 0, Math.PI * 2); c.strokeStyle = col; c.lineWidth = 2.5; c.stroke();
      });
      c.fillStyle = '#14B8A6'; c.font = 'bold 9px Space Mono,monospace'; c.textAlign = 'center'; c.fillText('COLOR', cx, cy - 4);
      c.fillStyle = '#F97316'; c.fillText('WHEEL', cx, cy + 8);
    };
    drawColorWheel();

    const onWheelMove = (e) => {
      const rect = colorWheelCanvasRef.current.getBoundingClientRect();
      const cx = 130, cy = 130, x = e.clientX - rect.left, y = e.clientY - rect.top, dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 52 && dist < 110) {
        let angle = (Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
        const idx = Math.floor(angle / (Math.PI * 2 / 12)) % 12;
        const col = wheelColors[idx];
        document.getElementById('tt-name').textContent = col.name + ' — ' + col.hex;
        document.getElementById('tt-type').textContent = col.type + ' Color';
        document.getElementById('wheelTooltip').style.borderColor = col.hex;
      }
    };

    // ---- COUNTERS ----
    const animCount = (elId, target, suffix, decimals = 0) => {
      let n = 0, step = target / 60;
      const iv = setInterval(() => {
        n = Math.min(n + step, target);
        const el = document.getElementById(elId);
        if (el) el.innerHTML = (decimals ? n.toFixed(1) : Math.floor(n)) + '<span>' + suffix + '</span>';
        if (n >= target) clearInterval(iv);
      }, 16);
    };
    setTimeout(() => {
      animCount('scount', 80, 'M+'); animCount('acount', 12, 'M'); animCount('gcount', 4, 'K');
    }, 400);

    // ---- SCROLL REVEAL ----
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' } });
    }, { threshold: .08 });
    document.querySelectorAll('.track-card,.pd-card,.app-card,.con-pt,.why-pt,.id-item').forEach(el => {
      el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity .5s ease,transform .5s ease';
      observer.observe(el);
    });

    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', () => { resizeRipple(); resizePCanvas(); initParticles(); });
    colorWheelCanvasRef.current?.addEventListener('mousemove', onWheelMove);

    return () => {
      cancelAnimationFrame(cursorAnimId); cancelAnimationFrame(rippleAnimId); cancelAnimationFrame(pAnimId);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', hoverHandler);
      colorWheelCanvasRef.current?.removeEventListener('mousemove', onWheelMove);
      clearInterval(progIntervalRef.current);
    };
  }, []);

  // ---- PROBLEM 10: REDRAW MINI WHEELS ON TAB SWITCH ----
  useEffect(() => {
    const drawMiniWheel = (cvRef, highlightIdxs, lineIdxs) => {
      const cv = cvRef.current; if (!cv) return;
      const c = cv.getContext('2d'); const cx = 100, cy = 100, R = 88, r = 35, seg = Math.PI * 2 / 12;
      const cols = ['#FF0000', '#FF4400', '#FF8800', '#FFAA00', '#FFDD00', '#AADD00', '#00BB00', '#0D9488', '#0044CC', '#3311CC', '#7700CC', '#CC0066'];
      c.clearRect(0, 0, 200, 200);
      cols.forEach((col, i) => {
        const s = i * seg - Math.PI / 2 - seg / 2, e = s + seg;
        c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, s, e); c.closePath();
        c.fillStyle = col; c.globalAlpha = highlightIdxs.includes(i) ? 1 : .28; c.fill();
        c.globalAlpha = 1; c.strokeStyle = 'rgba(10,15,15,.5)'; c.lineWidth = 1; c.stroke();
      });
      c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fillStyle = '#0A0F0F'; c.fill();
      if (lineIdxs) lineIdxs.forEach(pair => {
        const [a, b] = pair; const a1 = (a / 12 * Math.PI * 2) - Math.PI / 2, a2 = (b / 12 * Math.PI * 2) - Math.PI / 2;
        c.beginPath(); c.moveTo(cx + Math.cos(a1) * 68, cy + Math.sin(a1) * 68); c.lineTo(cx + Math.cos(a2) * 68, cy + Math.sin(a2) * 68);
        c.strokeStyle = 'rgba(249,115,22,.6)'; c.lineWidth = 1.5; c.setLineDash([4, 2]); c.stroke(); c.setLineDash([]);
      });
      highlightIdxs.forEach(i => {
        const a = (i / 12 * Math.PI * 2) - Math.PI / 2; c.beginPath(); c.arc(cx + Math.cos(a) * 65, cy + Math.sin(a) * 65, 7, 0, Math.PI * 2);
        c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      });
    };

    setTimeout(() => {
      drawMiniWheel(analogousCanvasRef, [6, 7, 8], null);
      drawMiniWheel(complementaryCanvasRef, [2, 7], [[2, 7]]);
      drawMiniWheel(triadicCanvasRef, [0, 4, 8], [[0, 4], [4, 8], [8, 0]]);
      drawMiniWheel(monochromaticCanvasRef, [7], null);
    }, 0);
  }, [activeScheme]);

  useEffect(() => {
    if (isPlaying) {
      progIntervalRef.current = setInterval(() => {
        setProgress(p => {
          const next = p + (100 / tracks[curTrack].dur);
          if (next >= 100) { nextTrack(); return 0; }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(progIntervalRef.current);
    }
    return () => clearInterval(progIntervalRef.current);
  }, [isPlaying, curTrack]);

  const brightness = (rgb.r * 0.299) + (rgb.g * 0.587) + (rgb.b * 0.114);
  const hex = '#' + [rgb.r, rgb.g, rgb.b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();

  return (
    <>
      <canvas id="bg-ripple" ref={rippleCanvasRef}></canvas>
      <div id="cur" ref={curRef}></div>
      <div id="cur-ring" ref={ringRef}></div>
      <div id="cur-trail" ref={trailRef}></div>
      <div className={`toast ${toast.show ? 'show' : ''}`} id="toast">
        <div className="toast-dot"></div><span id="toast-msg">{toast.msg}</span>
      </div>

      <nav>
        <div className="nav-logo">SŌ<span>N</span>IC</div>
        <div className="nav-links">
          <a href="#trending">Discover</a>
          <a href="#trending">Charts</a>
          <a href="#featured">Artists</a>
          <a href="#color-theory">Color Theory</a>
        </div>
        <div className="nav-right">
          <button className="btn-g">Log In</button>
          <button className="btn-p" onClick={() => showToast('Welcome to SŌNIC! 🎵')}>Get Started</button>
        </div>
      </nav>

      <section className="hero">
        <canvas id="particles" ref={particlesCanvasRef}></canvas>
        <div className="hero-orb"></div>
        <div className="hero-ring1"></div>
        <div className="hero-ring2"></div>
        <div className="hero-content">
          <div className="hero-tag"><div className="live-dot"></div>Now Streaming</div>
          <h1>FEEL THE<br /><span className="t">BEAT</span> &amp;<br /><span className="o">VIBE</span></h1>
          <p>Stream unlimited music. Discover new artists. Build your perfect playlist. All in one place.</p>
          <div className="hero-actions">
            <button className="btn-hero" onClick={() => playTrack(0)}><span className="text">Start Listening ▶</span></button>
            <button className="btn-hero2" onClick={() => document.getElementById('trending').scrollIntoView({ behavior: 'smooth' })}>Explore Charts</button>
          </div>
          <div className="hero-stats">
            <div><div className="stat-num" id="scount">0<span>M+</span></div><div className="stat-lbl">Songs</div></div>
            <div><div className="stat-num" id="acount">0<span>M</span></div><div className="stat-lbl">Artists</div></div>
            <div><div className="stat-num" id="gcount">0<span>K</span></div><div className="stat-lbl">Genres</div></div>
          </div>
        </div>
      </section>

      <section className="trending" id="trending">
        <div className="sec-tag">Charts</div>
        <div className="sec-title">TRENDING NOW</div>
        <div className="tracks-grid">
          {tracks.map((t, i) => (
            <div key={i} className={`track-card ${curTrack === i ? 'playing' : ''}`} onClick={() => playTrack(i)}>
              <div className="track-rank">0{i + 1}</div>
              <div className={`track-art ${t.art}`}>
                {t.emoji}
                <div className="play-overlay"><div className="play-overlay-btn">▶</div></div>
              </div>
              <div className="track-name">{t.title}</div>
              <div className="track-by">{t.artist}</div>
              <div className="track-meta">
                <span className="track-plays">{t.plays} plays</span>
                <span className="track-genre">{t.genre}</span>
              </div>
              <div className="wave-anim" id={`wave-${i}`} style={{ display: curTrack === i ? 'flex' : 'none' }}>
                <div className="wave-bar"></div><div className="wave-bar"></div>
                <div className="wave-bar"></div><div className="wave-bar"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="featured" id="featured">
        <div className="featured-inner">
          <div>
            <div className="feat-label">// Artist of the Month</div>
            <h2>LUNA <span>VEX</span></h2>
            <p>Pushing the boundaries of electronic music with a signature blend of teal-soaked basslines and fiery melodic bursts. Her latest album "Complementary" is topping charts worldwide.</p>
            <div className="feat-tags">
              <span className="tag-t">Electronic</span><span className="tag-o">Synthwave</span>
              <span className="tag-t">Ambient</span><span className="tag-o">Live Sets</span>
            </div>
            <button className="btn-hero" onClick={() => playTrack(0)}><span className="text">▶ Play Top Track</span></button>
          </div>
          <div className="feat-visual">
            <div className="vinyl-rings"></div>
            <div className="artist-circle" onClick={() => showToast('Luna Vex — Artist of the Month 🎤')}>🎤</div>
          </div>
        </div>
      </section>

      <div className="ct-section" id="color-theory">
        <div style={{ background: 'linear-gradient(135deg,var(--pr-dk),#0A0F0F)', borderTop: '3px solid var(--sc)', borderBottom: '1px solid var(--bd)', padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--pr),var(--sc))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🎨</div>
            <div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '.65rem', color: 'var(--tm)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Modality · Website UI</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem', letterSpacing: '.06em' }}>Music / Entertainment Platform</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '.6rem', color: 'var(--tm)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '3px' }}>By</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.4rem', letterSpacing: '.06em' }}>Prakhar Srivastava</div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '.7rem', color: 'var(--sc)' }}>590017406</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--bd)' }}></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '.6rem', color: 'var(--tm)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '3px' }}>To</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.4rem', letterSpacing: '.06em', color: 'var(--pr-lt)' }}>Pankaj Badoni</div>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginLeft: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem', color: 'var(--sc)' }}>3</div>
                <div style={{ fontSize: '.7rem', color: 'var(--tm)', textTransform: 'uppercase', letterSpacing: '.1em' }}>COLORS IN PALETTE</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem', color: 'var(--sc)' }}>1</div>
                <div style={{ fontSize: '.7rem', color: 'var(--tm)', textTransform: 'uppercase', letterSpacing: '.1em' }}>DOMINANT SCHEME</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem', color: 'var(--sc)' }}>∞</div>
                <div style={{ fontSize: '.7rem', color: 'var(--tm)', textTransform: 'uppercase', letterSpacing: '.1em' }}>POSSIBLE COMBOS</div>
              </div>
            </div>
          </div>
        </div>

        <div className="explain-block">
          <div className="part-lbl">
            <span className="part-badge">PART A</span>
            <span className="part-text">Color Wheel &amp; Schemes</span>
          </div>

          <div className="theory-callout">
            <div className="tc-icon">🎨</div>
            <div>
              <div className="tc-title">What is the Color Wheel?</div>
              <p className="tc-body">The color wheel is the designer's most fundamental tool — a circular map of all colors arranged by their natural relationships. First described by <strong>Isaac Newton in 1666</strong> when he split white light through a prism, it reveals how colors are born, how they blend, and how they fight each other. Every intentional design decision in SŌNIC starts here.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '48px', alignItems: 'start', marginBottom: '56px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <canvas id="colorWheelCanvas" width="260" height="260" ref={colorWheelCanvasRef}></canvas>
              <div className="iw-tooltip" id="wheelTooltip" style={{ width: '100%' }}>
                <div className="th" id="tt-name">Hover the wheel to explore</div>
                <div id="tt-type" style={{ color: 'var(--tm)', fontSize: '.68rem', marginTop: '2px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="ct-card">
                <div className="ct-card-label">Primary</div>
                <div className="ct-card-bar" style={{ height: '64px', borderRadius: '6px', overflow: 'hidden', display: 'flex', margin: '10px 0' }}>
                  <div style={{ flex: 1, background: '#FF0000', display: 'flex', alignItems: 'flex-end', padding: '7px', fontFamily: 'Space Mono,monospace', fontSize: '.58rem', color: 'rgba(255,255,255,.8)' }}>Red<br />#FF0000</div>
                  <div style={{ flex: 1, background: '#FFCC00', display: 'flex', alignItems: 'flex-end', padding: '7px', fontFamily: 'Space Mono,monospace', fontSize: '.58rem', color: 'rgba(0,0,0,.65)' }}>Yellow<br />#FFCC00</div>
                  <div style={{ flex: 1, background: '#0038A8', display: 'flex', alignItems: 'flex-end', padding: '7px', fontFamily: 'Space Mono,monospace', fontSize: '.58rem', color: 'rgba(255,255,255,.8)' }}>Blue<br />#0038A8</div>
                </div>
                <div className="ct-card-desc">The <strong>origin colors</strong> — they cannot be created by mixing anything else. Every color in existence is ultimately derived from these three. Think of them as the alphabet of color.</div>
              </div>

              <div style={{ paddingLeft: '16px', fontSize: '.75rem', color: 'var(--tm)', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--sc)' }}>↓</span> Mix two primaries together</div>

              <div className="ct-card">
                <div className="ct-card-label">Secondary</div>
                <div className="ct-card-bar" style={{ height: '64px', borderRadius: '6px', overflow: 'hidden', display: 'flex', margin: '10px 0' }}>
                  <div style={{ flex: 1, background: '#FF6600', display: 'flex', alignItems: 'flex-end', padding: '7px', fontFamily: 'Space Mono,monospace', fontSize: '.58rem', color: 'rgba(0,0,0,.65)' }}>Orange<br />R+Y</div>
                  <div style={{ flex: 1, background: '#00AA00', display: 'flex', alignItems: 'flex-end', padding: '7px', fontFamily: 'Space Mono,monospace', fontSize: '.58rem', color: 'rgba(255,255,255,.8)' }}>Green<br />Y+B</div>
                  <div style={{ flex: 1, background: '#7700CC', display: 'flex', alignItems: 'flex-end', padding: '7px', fontFamily: 'Space Mono,monospace', fontSize: '.58rem', color: 'rgba(255,255,255,.8)' }}>Violet<br />B+R</div>
                </div>
                <div className="ct-card-desc">Mixing two primaries creates a secondary. Orange sits between Red and Yellow on the wheel — our <span className="color-sc">Burnt Orange (#F97316)</span> is a refined version of this secondary, pushed warmer to feel more energetic on screen.</div>
              </div>

              <div style={{ paddingLeft: '16px', fontSize: '.75rem', color: 'var(--tm)', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--sc)' }}>↓</span> Mix primary + adjacent secondary</div>

              <div className="ct-card" style={{ borderColor: 'rgba(13,148,136,.35)', background: 'rgba(13,148,136,.04)' }}>
                <div className="ct-card-label" style={{ color: 'var(--pr-lt)' }}>Tertiary <span style={{ color: 'var(--sc)', fontSize: '.65rem', marginLeft: '6px' }}>← SŌNIC's Teal lives here</span></div>
                <div style={{ height: '56px', borderRadius: '6px', overflow: 'hidden', display: 'flex', margin: '10px 0' }}>
                  <div style={{ flex: 1, background: '#FF4400', display: 'flex', alignItems: 'flex-end', padding: '5px', fontFamily: 'Space Mono,monospace', fontSize: '.48rem', color: 'rgba(255,255,255,.8)' }}>R-O</div>
                  <div style={{ flex: 1, background: '#FFAA00', display: 'flex', alignItems: 'flex-end', padding: '5px', fontFamily: 'Space Mono,monospace', fontSize: '.48rem', color: 'rgba(0,0,0,.7)' }}>Y-O</div>
                  <div style={{ flex: 1, background: '#AADD00', display: 'flex', alignItems: 'flex-end', padding: '5px', fontFamily: 'Space Mono,monospace', fontSize: '.48rem', color: 'rgba(0,0,0,.7)' }}>Y-G</div>
                  <div style={{ flex: 1, background: '#0D9488', display: 'flex', alignItems: 'flex-end', padding: '5px', fontFamily: 'Space Mono,monospace', fontSize: '.48rem', color: 'rgba(255,255,255,.9)', outline: '2px solid var(--sc)', outlineOffset: '-2px', fontWeight: '700' }}>B-G ★</div>
                  <div style={{ flex: 1, background: '#3311CC', display: 'flex', alignItems: 'flex-end', padding: '5px', fontFamily: 'Space Mono,monospace', fontSize: '.48rem', color: 'rgba(255,255,255,.8)' }}>B-V</div>
                  <div style={{ flex: 1, background: '#CC0066', display: 'flex', alignItems: 'flex-end', padding: '5px', fontFamily: 'Space Mono,monospace', fontSize: '.48rem', color: 'rgba(255,255,255,.8)' }}>R-V</div>
                </div>
                <div className="ct-card-desc">Six intermediate colors fill the gaps. <strong style={{ color: 'var(--pr-lt)' }}>Blue-Green (Teal)</strong> is our primary brand color — it sits between calm Blue and fresh Green, giving SŌNIC a feeling of digital depth and reliability. It's not arbitrary; it's a deliberate position on the wheel.</div>
              </div>
            </div>
          </div>

          <div className="theory-callout" style={{ marginBottom: '24px' }}>
            <div className="tc-icon">🔬</div>
            <div>
              <div className="tc-title">The 4 Color Schemes — and Why We Chose Complementary</div>
              <p className="tc-body">A color <strong>scheme</strong> is the systematic rule for how colors relate on the wheel. It's not about picking colors you "like" — it's about picking a <em>relationship</em> that serves the design's emotion and purpose. Below are all four standard schemes. SŌNIC uses <span style={{ color: 'var(--sc)' }}>Complementary</span> — here's why each option was considered.</p>
            </div>
          </div>

          <div className="scheme-tabs">
            {['analogous', 'complementary', 'triadic', 'monochromatic'].map(s => (
              <button key={s} className={`stab ${activeScheme === s ? 'active' : ''}`} onClick={() => setActiveScheme(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)} {s === 'complementary' ? '✓' : ''}
              </button>
            ))}
          </div>

          <div className="scheme-panels">
            <div className={`scheme-panel ${activeScheme === 'analogous' ? 'active' : ''}`} id="panel-analogous">
              <div className="sp-info">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem', color: 'var(--pr-lt)' }}>Analogous</div>
                  <div style={{ display: 'flex', gap: 0, height: '72px', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ flex: 1, background: '#0033CC' }}></div>
                    <div style={{ flex: 1, background: '#0066BB' }}></div>
                    <div style={{ flex: 1, background: '#0D9488' }}></div>
                    <div style={{ flex: 1, background: '#00BB88' }}></div>
                    <div style={{ flex: 1, background: '#00CC55' }}></div>
                  </div>
                  <div className="scheme-theory-block">
                    <div className="stb-label">The Concept</div>
                    <p>Colors that sit <strong>side-by-side</strong> on the wheel — they share undertones and feel naturally related. There's no tension, no fight. The eye moves easily across them like it would across a sunset.</p>
                  </div>
                  <div className="scheme-theory-block">
                    <div className="stb-label">Mood & Emotion</div>
                    <p>Calm · Cohesive · Natural · Soothing. Great for designs that want to feel effortless or serene — wellness apps, nature photography, ambient experiences.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#E1306C,#F77737)', flexShrink: 0 }}></div>
                    <div style={{ fontSize: '.75rem', color: 'var(--tm)' }}><strong style={{ color: 'var(--tx)' }}>Real world:</strong> Instagram's gradient logo — pink flows into orange flows into yellow. All neighbors.</div>
                  </div>
                  <div className="scheme-verdict no">🚫 Not SŌNIC — A music platform needs <em>tension and contrast</em>. Analogous is too calm; it wouldn't make a "Play" button feel urgent.</div>
                </div>
              </div>
              <div className="sp-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <canvas id="mini-wheel-analogous" width="200" height="200" className="sp-wheel-mini" ref={analogousCanvasRef}></canvas>
                <div style={{ fontSize: '.7rem', color: 'var(--tm)', textAlign: 'center', fontFamily: 'Space Mono,monospace' }}>Adjacent segments · no contrast</div>
              </div>
            </div>

            <div className={`scheme-panel ${activeScheme === 'complementary' ? 'active' : ''}`} id="panel-complementary">
              <div className="sp-info">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem', color: 'var(--sc)' }}>Complementary</div>
                  <div style={{ display: 'flex', gap: '3px', height: '72px', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ flex: 1, background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: '1rem' }}>#0D9488</div>
                    <div style={{ width: '3px', background: 'var(--bg)' }}></div>
                    <div style={{ flex: 1, background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: '1rem', color: '#0A0F0F' }}>#F97316</div>
                  </div>
                  <div className="scheme-theory-block" style={{ borderColor: 'rgba(249,115,22,.25)', background: 'rgba(249,115,22,.05)' }}>
                    <div className="stb-label" style={{ color: 'var(--sc)' }}>The Concept</div>
                    <p>Two colors <strong>directly opposite</strong> on the wheel — 180° apart. They have nothing in common, which is exactly what creates maximum visual tension and vibrancy. When placed side-by-side they make each other <em>appear more intense</em> — this is called <strong>simultaneous contrast</strong>.</p>
                  </div>
                  <div className="scheme-theory-block" style={{ borderColor: 'rgba(249,115,22,.25)', background: 'rgba(249,115,22,.05)' }}>
                    <div className="stb-label" style={{ color: 'var(--sc)' }}>Why It Works for Music</div>
                    <p>Music is built on contrast — verse vs chorus, build vs drop, loud vs quiet. Teal (cool, stable, trustworthy) vs Orange (warm, exciting, urgent) is that same emotional push-pull expressed in color. The <span style={{ color: 'var(--sc)' }}>orange Play button</span> on a <span style={{ color: 'var(--pr-lt)' }}>teal-accented dark stage</span> is impossible to ignore.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '13px', height: '28px', background: '#552583', borderRadius: '2px' }}></div>
                    <div style={{ width: '13px', height: '28px', background: '#FDB927', borderRadius: '2px' }}></div>
                    <div style={{ fontSize: '.75rem', color: 'var(--tm)', marginLeft: '4px' }}><strong style={{ color: 'var(--tx)' }}>Real world:</strong> LA Lakers. Pure complementary — purple and gold fight and win together.</div>
                  </div>
                  <div className="scheme-verdict yes">✅ <strong>SŌNIC's choice.</strong> Teal = information, depth, trust. Orange = action, energy, play. The dark background acts as a concert stage — both colors glow harder in the dark.</div>
                </div>
              </div>
              <div className="sp-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <canvas id="mini-wheel-complementary" width="200" height="200" className="sp-wheel-mini" ref={complementaryCanvasRef}></canvas>
                <div style={{ fontSize: '.7rem', color: 'var(--sc)', textAlign: 'center', fontFamily: 'Space Mono,monospace' }}>Opposite segments · 180° · max contrast</div>
              </div>
            </div>

            <div className={`scheme-panel ${activeScheme === 'triadic' ? 'active' : ''}`} id="panel-triadic">
              <div className="sp-info">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem', color: 'var(--ac)', marginBottom: '14px' }}>Triadic</div>
                  <div style={{ display: 'flex', gap: '3px', height: '72px', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ flex: 1, background: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif' }}>Red</div>
                    <div style={{ flex: 1, background: '#FFCC00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', color: '#0A0F0F' }}>Yellow</div>
                    <div style={{ flex: 1, background: '#0038A8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif' }}>Blue</div>
                  </div>
                  <div className="scheme-theory-block">
                    <div className="stb-label">The Concept</div>
                    <p>Three colors placed <strong>120° apart</strong> — evenly triangulated around the wheel. Each color is different enough to stand out, but the triangular structure creates an underlying balance. It's the most colorful of all schemes.</p>
                  </div>
                  <div className="scheme-theory-block">
                    <div className="stb-label">Mood & Emotion</div>
                    <p>Vibrant · Playful · Energetic · Colorful. Works best when one color dominates and the other two serve as accents — otherwise it can feel chaotic.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '26px', background: '#FF3B30', borderRadius: '2px' }}></div>
                    <div style={{ width: '10px', height: '26px', background: '#FFCC00', borderRadius: '2px' }}></div>
                    <div style={{ width: '10px', height: '26px', background: '#0038A8', borderRadius: '2px' }}></div>
                    <div style={{ fontSize: '.75rem', color: 'var(--tm)', marginLeft: '8px' }}><strong style={{ color: 'var(--tx)' }}>Real world:</strong> Classic primary color toys & children's media — inherently triadic.</div>
                  </div>
                  <div className="scheme-verdict no">🚫 Not SŌNIC — Three strong hues make brand identity complex. A music app needs one dominant color for CTAs, not three competing for attention.</div>
                </div>
              </div>
              <div className="sp-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <canvas id="mini-wheel-triadic" width="200" height="200" className="sp-wheel-mini" ref={triadicCanvasRef}></canvas>
                <div style={{ fontSize: '.7rem', color: 'var(--tm)', textAlign: 'center', fontFamily: 'Space Mono,monospace' }}>Triangle · 3 equal points · 120° apart</div>
              </div>
            </div>

            <div className={`scheme-panel ${activeScheme === 'monochromatic' ? 'active' : ''}`} id="panel-monochromatic">
              <div className="sp-info">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem', color: 'var(--pr-lt)', marginBottom: '14px' }}>Monochromatic</div>
                  <div style={{ display: 'flex', gap: 0, height: '72px', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ flex: 1, background: '#0A6E65' }}></div>
                    <div style={{ flex: 1, background: '#0D9488' }}></div>
                    <div style={{ flex: 1, background: '#14B8A6' }}></div>
                    <div style={{ flex: 1, background: '#5EDDD6' }}></div>
                    <div style={{ flex: 1, background: '#B2F0ED' }}></div>
                  </div>
                  <div className="scheme-theory-block">
                    <div className="stb-label">The Concept</div>
                    <p>One single hue in multiple <strong>shades</strong> (darker), <strong>tints</strong> (lighter with white), and <strong>tones</strong> (muted with grey). "Mono" = one, "chroma" = color. It's the most disciplined of all schemes — every color is literally the same color, just in different lighting.</p>
                  </div>
                  <div className="scheme-theory-block">
                    <div className="stb-label">Mood & Emotion</div>
                    <p>Elegant · Minimal · Sophisticated · Premium. Zero color clashing is possible. The weakness is it can feel flat — there's no way to use color to guide the eye toward a CTA.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0ABAB5', flexShrink: 0 }}></div>
                    <div style={{ fontSize: '.75rem', color: 'var(--tm)' }}><strong style={{ color: 'var(--tx)' }}>Real world:</strong> Tiffany & Co. — one signature aqua used across every single touchpoint.</div>
                  </div>
                  <div className="scheme-verdict no">🚫 Not SŌNIC — Beautiful but impractical for interaction design. With one hue, an orange "Play" button is impossible — and that button is everything.</div>
                </div>
              </div>
              <div className="sp-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <canvas id="mini-wheel-monochromatic" width="200" height="200" className="sp-wheel-mini" ref={monochromaticCanvasRef}></canvas>
                <div style={{ fontSize: '.7rem', color: 'var(--tm)', textAlign: 'center', fontFamily: 'Space Mono,monospace' }}>One hue · shades & tints only</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginTop: '28px' }}>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ height: '5px', background: 'linear-gradient(90deg,#0033CC,#0D9488,#00CC55)' }}></div>
              <div style={{ padding: '14px', textAlign: 'center' }}><div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>🚫</div><div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '.9rem', color: 'var(--tm)' }}>Analogous</div><div style={{ fontSize: '.65rem', color: 'var(--tm)', marginTop: '3px', fontFamily: 'Space Mono,monospace' }}>Too calm</div></div>
            </div>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--sc)', background: 'rgba(249,115,22,.05)' }}>
              <div style={{ height: '5px', background: 'linear-gradient(90deg,var(--pr),var(--sc))' }}></div>
              <div style={{ padding: '14px', textAlign: 'center' }}><div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>✅</div><div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '.9rem', color: 'var(--sc)' }}>Complementary</div><div style={{ fontSize: '.65rem', color: 'var(--sc)', marginTop: '3px', fontFamily: 'Space Mono,monospace' }}>Used in SŌNIC</div></div>
            </div>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ height: '5px', background: 'linear-gradient(90deg,#FF3B30,#FFCC00,#0038A8)' }}></div>
              <div style={{ padding: '14px', textAlign: 'center' }}><div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>🚫</div><div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '.9rem', color: 'var(--tm)' }}>Triadic</div><div style={{ fontSize: '.65rem', color: 'var(--tm)', marginTop: '3px', fontFamily: 'Space Mono,monospace' }}>Too complex</div></div>
            </div>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ height: '5px', background: 'linear-gradient(90deg,#0A6E65,#14B8A6,#B2F0ED)' }}></div>
              <div style={{ padding: '14px', textAlign: 'center' }}><div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>🚫</div><div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '.9rem', color: 'var(--tm)' }}>Monochromatic</div><div style={{ fontSize: '.65rem', color: 'var(--tm)', marginTop: '3px', fontFamily: 'Space Mono,monospace' }}>No CTA contrast</div></div>
            </div>
          </div>
        </div>

        <div className="palette-section">
          <div className="part-lbl">
            <span className="part-badge">PART B</span>
            <span className="part-text">Palette Applied to SŌNIC</span>
          </div>

          <div className="theory-callout" style={{ marginBottom: '32px', borderColor: 'rgba(13,148,136,.3)', background: 'rgba(10,15,15,.4)' }}>
            <div className="tc-icon">🎯</div>
            <div>
              <div className="tc-title">Why These Specific Colors?</div>
              <p className="tc-body">Picking a scheme is step one. Picking the exact colors within that scheme is step two — and it requires understanding color psychology. Orange = action, warmth, energy (every button, every play trigger). Teal = trust, technology, depth (every badge, border, and progress bar). The near-black background behaves like a concert stage — spotlights always look brighter in the dark.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '40px' }}>
            <div className="why-card">
              <div className="wc-icon">🎵</div>
              <div>
                <div className="wc-title">Energy = Contrast</div>
                <div className="wc-body">Music is built on tension — drop, build, release. Teal (calm) vs Orange (energetic) is that same push-pull expressed visually. The colors feel like sound feels.</div>
              </div>
            </div>
            <div className="why-card">
              <div className="wc-icon">🎯</div>
              <div>
                <div className="wc-title">Orange = Action</div>
                <div className="wc-body">Every interactive element that asks you to do something — play, start, get started — is orange. Orange is warm, forward-moving, impossible to ignore.</div>
              </div>
            </div>
            <div className="why-card">
              <div className="wc-icon">🌊</div>
              <div>
                <div className="wc-title">Teal = Depth &amp; Trust</div>
                <div className="wc-body">Teal carries the calm of blue (reliable, digital, trustworthy) with a hint of green (fresh, alive). It tells you: this is information, this is structure, this is safe.</div>
              </div>
            </div>
            <div className="why-card">
              <div className="wc-icon">🎭</div>
              <div>
                <div className="wc-title">The Stage Effect</div>
                <div className="wc-body">Deep black background = concert lighting. Any color looks more vivid against near-black than against white or grey. The darkness amplifies both teal and orange simultaneously.</div>
              </div>
            </div>
            <div className="why-card">
              <div className="wc-icon">⚡</div>
              <div>
                <div className="wc-title">Simultaneous Contrast</div>
                <div className="wc-body">A law of optics: complementary colors placed side-by-side make each other appear more saturated than they actually are. Teal makes orange look more orange. Orange makes teal look more teal.</div>
              </div>
            </div>
            <div className="why-card">
              <div className="wc-icon">🧠</div>
              <div>
                <div className="wc-title">Brand Distinctiveness</div>
                <div className="wc-body">Spotify uses green. Apple Music uses red. Most music apps live in the warm-dark space. Teal-and-orange is uncommon enough to be memorable — users will recall SŌNIC by its colors alone.</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.25rem', color: 'var(--tm)', marginBottom: '8px' }}>The 5-Color Palette</div>
            <p style={{ fontSize: '.82rem', color: 'var(--tm)', lineHeight: '1.6', maxWidth: '640px', marginBottom: '14px' }}>5 colors, each with a deliberate purpose. The <span style={{ color: 'var(--pr-lt)' }}>Teal + Orange</span> pair carries all the visual weight. Amber bridges them in gradients. Two near-blacks create depth without introducing a new hue. <strong style={{ color: 'var(--tx)', fontWeight: 'bold' }}>Hover each swatch ↓</strong></p>
          </div>

          <div className="pd-cards">
            <div className="pd-card">
              <div className="pd-sw" style={{ background: '#0D9488' }}></div>
              <div className="pd-body">
                <div className="pd-role p">Primary</div>
                <div className="pd-name">Teal</div>
                <div className="pd-hex">#0D9488</div>
                <div className="pd-rgb">RGB(13, 148, 136)</div>
                <div className="pd-use">Nav borders · badges · progress · hover states</div>
              </div>
            </div>
            <div className="pd-card">
              <div className="pd-sw" style={{ background: '#F97316' }}></div>
              <div className="pd-body">
                <div className="pd-role s">Secondary</div>
                <div className="pd-name">Burnt Orange</div>
                <div className="pd-hex">#F97316</div>
                <div className="pd-rgb">RGB(249, 115, 22)</div>
                <div className="pd-use">All CTA buttons · play controls · active highlights</div>
              </div>
            </div>
            <div className="pd-card">
              <div className="pd-sw" style={{ background: '#FCD34D' }}></div>
              <div className="pd-body">
                <div className="pd-role a">Accent</div>
                <div className="pd-name">Amber</div>
                <div className="pd-hex">#FCD34D</div>
                <div className="pd-rgb">RGB(252, 211, 77)</div>
                <div className="pd-use">Gradient endpoints · album art · stat counters</div>
              </div>
            </div>
            <div className="pd-card">
              <div className="pd-sw" style={{ background: '#0A0F0F', borderBottom: '1px solid #1a2828' }}></div>
              <div className="pd-body">
                <div className="pd-role b">Background</div>
                <div className="pd-name">Deep Black</div>
                <div className="pd-hex">#0A0F0F</div>
                <div className="pd-rgb">RGB(10, 15, 15)</div>
                <div className="pd-use">Page canvas — the "stage" that makes colors pop</div>
              </div>
            </div>
            <div className="pd-card">
              <div className="pd-sw" style={{ background: '#111A1A' }}></div>
              <div className="pd-body">
                <div className="pd-role su">Surface</div>
                <div className="pd-name">Dark Surface</div>
                <div className="pd-hex">#111A1A</div>
                <div className="pd-rgb">RGB(17, 26, 26)</div>
                <div className="pd-use">Cards · nav bar · section containers</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '24px' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem' }}>Color in Use</div>
              <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg,var(--pr),transparent)', marginBottom: '8px', opacity: '.3' }}></div>
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--tm)', lineHeight: '1.6', marginBottom: '16px', maxWidth: '560px' }}>
              Orange = <em>do this</em>. Teal = <em>read this</em>. Every element in the UI follows the same rule — training the eye without saying a word.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="app-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="app-thumb">
                  <div className="mn">
                    <div className="mn-logo">SŌ<span>N</span>IC</div>
                    <div className="mn-btns">
                      <div className="mn-btn t">Log In</div>
                      <div className="mn-btn o">Get Started</div>
                    </div>
                  </div>
                  <div className="mn-hero">
                    <div className="mn-ht">FEEL THE <span className="t">BEAT</span> &amp; <span className="o">VIBE</span></div>
                    <div className="mn-sub">Stream · Discover · Play</div>
                    <div className="mn-cta">
                      <div className="mn-cb o">Start Listening</div>
                      <div className="mn-cb t">Charts</div>
                    </div>
                  </div>
                </div>
                <div className="app-cap">
                  <h4>Nav + Hero</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <span className="use-tag o">Orange → CTA</span>
                    <span className="use-tag t">Teal → Secondary action</span>
                    <span className="use-tag n">Black → Stage depth</span>
                  </div>
                </div>
              </div>
              <div className="app-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="app-thumb">
                  <div className="mn-cards">
                    <div className="mn-card">
                      <div className="mn-card-art a1">🎵</div>
                      <div className="mn-nm">Midnight Circuit</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '.4rem', color: 'var(--tm)' }}>
                        <span>2.4M</span>
                        <span style={{ color: 'var(--pr)', border: '1px solid var(--pr)', padding: '1px 3px', borderRadius: '2px' }}>Electronic</span>
                      </div>
                    </div>
                    <div className="mn-card">
                      <div className="mn-card-art a2">🔥</div>
                      <div className="mn-nm">Solar Drift</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '.4rem', color: 'var(--tm)' }}>
                        <span>1.9M</span>
                        <span style={{ color: 'var(--pr)', border: '1px solid var(--pr)', padding: '1px 3px', borderRadius: '2px' }}>Synthwave</span>
                      </div>
                    </div>
                    <div className="mn-card">
                      <div className="mn-card-art a3">🌊</div>
                      <div className="mn-nm">Tidal Rush</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '.4rem', color: 'var(--tm)' }}>
                        <span>980K</span>
                        <span style={{ color: 'var(--pr)', border: '1px solid var(--pr)', padding: '1px 3px', borderRadius: '2px' }}>Chill</span>
                      </div>
                    </div>
                  </div>
                  <div className="mn-player">
                    <div className="mn-part"></div>
                    <div className="mn-pi">
                      <div className="mn-pn">Neon Frequencies</div>
                      <div className="mn-pa">Luna Vex</div>
                      <div className="mn-prog"><div className="mn-pf"></div></div>
                    </div>
                    <div className="mn-play">▶</div>
                  </div>
                </div>
                <div className="app-cap">
                  <h4>Cards + Player</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <span className="use-tag o">Orange → Play button</span>
                    <span className="use-tag t">Teal → Genre tags</span>
                    <span className="use-tag g">Gradient → Teal→Orange in art</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="palette-bar">
            {[
              { name: 'Teal', hex: '#0D9488', role: 'Primary' },
              { name: 'Burnt Orange', hex: '#F97316', role: 'Secondary' },
              { name: 'Amber', hex: '#FCD34D', role: 'Accent' },
              { name: 'Deep Black', hex: '#0A0F0F', role: 'Background' },
              { name: 'Dark Surface', hex: '#111A1A', role: 'Surface' }
            ].map((p, i) => (
              <div key={i} className="pb-swatch" style={{ background: p.hex }}>
                <div className="pb-role">{p.role}</div><div className="pb-name">{p.name}</div><div className="pb-hex">{p.hex}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Space Mono,monospace', fontSize: '.72rem', color: 'var(--tm)', marginBottom: '36px' }}>↑ Hover each swatch to expand</p>
        </div>

        <div className="rgb-section">
          <div className="part-lbl">
            <span className="part-badge" style={{ background: 'var(--pr)' }}>RGB</span>
            <span className="part-text">Additive Color Model</span>
          </div>

          <div className="theory-callout" style={{ marginBottom: '32px', borderColor: 'rgba(255,255,255,.08)', background: 'linear-gradient(135deg,rgba(255,50,50,.04),rgba(50,255,50,.04),rgba(50,50,255,.04))' }}>
            <div className="tc-icon">💡</div>
            <div>
              <div className="tc-title">The Digital Stage: Additive Color (RGB)</div>
              <p className="tc-body">Unlike paint (which is subtractive), screens use <strong>light</strong>. In the RGB model, you start with black (no light) and add Red, Green, and Blue. If you add all three at full intensity (255, 255, 255), you get Pure White. This is why colors "glow" on your monitor — they are literally light beams hitting your eyes.</p>
            </div>
          </div>

          <div className="rgb-grid">
            <div className="rgb-mixer">
              <h4>Live RGB Mixer</h4>
              <p className="rgb-mixer-sub">Drag sliders · Watch the color build</p>
              <div className="rgb-preview" style={{ background: `rgb(${rgb.r},${rgb.g},${rgb.b})`, color: brightness > 128 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }}>
                rgb({rgb.r}, {rgb.g}, {rgb.b}) | {hex}
              </div>
              <div className="rgb-sliders">
                {['r', 'g', 'b'].map(c => (
                  <div key={c} className="rgb-slider-row">
                    <span className={`rgb-slider-lbl ${c}`}>{c.toUpperCase()}</span>
                    <input type="range" className={`rgb-slider ${c}-sl`} min="0" max="255" value={rgb[c]} onChange={(e) => updateRGB(c === 'r' ? e.target.value : rgb.r, c === 'g' ? e.target.value : rgb.g, c === 'b' ? e.target.value : rgb.b)} />
                    <span className="rgb-val-num">{rgb[c]}</span>
                  </div>
                ))}
              </div>
              <div className="rgb-presets">
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '.6rem', color: 'var(--tm)', letterSpacing: '.1em', textTransform: 'uppercase', width: '100%', marginBottom: '6px' }}>Try SŌNIC's palette ↓</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
                  <button className="rgb-preset-btn" onClick={() => updateRGB(13, 148, 136)} style={{ borderLeft: '2px solid var(--pr)' }}>Teal</button>
                  <button className="rgb-preset-btn" onClick={() => updateRGB(249, 115, 22)} style={{ borderLeft: '2px solid var(--sc)' }}>Orange</button>
                  <button className="rgb-preset-btn" onClick={() => updateRGB(251, 191, 36)} style={{ borderLeft: '2px solid var(--ac)' }}>Amber</button>
                  <button className="rgb-preset-btn" onClick={() => updateRGB(255, 0, 0)} style={{ borderLeft: '2px solid #ff0000' }}>Pure R</button>
                  <button className="rgb-preset-btn" onClick={() => updateRGB(0, 255, 0)} style={{ borderLeft: '2px solid #00ff00' }}>Pure G</button>
                  <button className="rgb-preset-btn" onClick={() => updateRGB(0, 0, 255)} style={{ borderLeft: '2px solid #0000ff' }}>Pure B</button>
                  <button className="rgb-preset-btn" onClick={() => updateRGB(255, 255, 255)}>White</button>
                  <button className="rgb-preset-btn" onClick={() => updateRGB(0, 0, 0)}>Black</button>
                </div>
              </div>
            </div>
            <div className="rgb-explanation">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Red · Green · <span style={{ color: 'var(--pr-lt)' }}>Blue</span></h3>
                <div style={{ fontSize: '.6rem', fontFamily: 'Space Mono', color: 'var(--tm)', background: 'rgba(255,255,255,.05)', padding: '4px 8px', borderRadius: '4px' }}>8-BIT COLOR (0-255)</div>
              </div>
              <div className="rgb-mix-visual">
                <div className="rgb-c r"></div>
                <div className="rgb-c g"></div>
                <div className="rgb-c b"></div>
              </div>
              <div className="ocr-title">SŌNIC Palette → RGB Values <span style={{ color: 'var(--tm)', fontWeight: 400 }}>(click to load in mixer)</span></div>
              <div className="our-rgb" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="ocr-row" onClick={() => updateRGB(13, 148, 136)}><div className="ocr-sw" style={{ background: '#0D9488' }}></div><div className="ocr-name">Teal</div><div className="ocr-bars"><span className="ocr-v ocr-r">R:13</span><span className="ocr-v ocr-g">G:148</span><span className="ocr-v ocr-b">B:136</span></div></div>
                <div className="ocr-row" onClick={() => updateRGB(249, 115, 22)}><div className="ocr-sw" style={{ background: '#F97316' }}></div><div className="ocr-name">Orange</div><div className="ocr-bars"><span className="ocr-v ocr-r">R:249</span><span className="ocr-v ocr-g">G:115</span><span className="ocr-v ocr-b">B:22</span></div></div>
                <div className="ocr-row" onClick={() => updateRGB(252, 211, 77)}><div className="ocr-sw" style={{ background: '#FCD34D' }}></div><div className="ocr-name">Amber</div><div className="ocr-bars"><span className="ocr-v ocr-r">R:252</span><span className="ocr-v ocr-g">G:211</span><span className="ocr-v ocr-b">B:77</span></div></div>
                <div className="ocr-row" onClick={() => updateRGB(10, 15, 15)}><div className="ocr-sw" style={{ background: '#0A0F0F' }}></div><div className="ocr-name">Black</div><div className="ocr-bars"><span className="ocr-v ocr-r">R:10</span><span className="ocr-v ocr-g">G:15</span><span className="ocr-v ocr-b">B:15</span></div></div>
                <div className="ocr-row" onClick={() => updateRGB(17, 26, 26)}><div className="ocr-sw" style={{ background: '#111A1A' }}></div><div className="ocr-name">Surface</div><div className="ocr-bars"><span className="ocr-v ocr-r">R:17</span><span className="ocr-v ocr-g">G:26</span><span className="ocr-v ocr-b">B:26</span></div></div>
              </div>

              <p style={{ fontSize: '.7rem', color: 'var(--tm)' }}>Ink-based. Subtractive. Starts with white. Theoretical max is muddy grey (hence <strong>K</strong>-black ink). Colors look duller than screens.</p>
            </div>
          </div>
        </div>

        <div className="conclusion">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '4px', height: '44px', background: 'linear-gradient(var(--pr),var(--sc))', borderRadius: '2px' }}></div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.8rem', letterSpacing: '.04em' }}>SŌNIC · <span style={{ color: 'var(--sc)' }}>Color Theory</span> Summary</div>
          </div>
          <div className="con-pts">
            <div className="con-pt">
              <div style={{ fontSize: '1.2rem' }}>🎡</div>
              <div className="con-lbl">Color Wheel</div>
              <div className="con-t">Primary → Secondary → Tertiary mapped. Teal identified as Blue-Green tertiary on the wheel.</div>
            </div>
            <div className="con-pt s">
              <div style={{ fontSize: '1.2rem' }}>🎨</div>
              <div className="con-lbl s">4 Schemes</div>
              <div className="con-t">All 4 explained with theory, mood, real-world examples, and rejection reasoning.</div>
            </div>
            <div className="con-pt">
              <div style={{ fontSize: '1.2rem' }}>🖌️</div>
              <div className="con-lbl">Complementary</div>
              <div className="con-t">Teal + Orange chosen: maximum contrast, simultaneous contrast law, music emotion match.</div>
            </div>
            <div className="con-pt s">
              <div style={{ fontSize: '1.2rem' }}>🎯</div>
              <div className="con-lbl s">Palette</div>
              <div className="con-t">5 colors with deliberate roles: action, information, accent, stage, surface.</div>
            </div>
            <div className="con-pt">
              <div style={{ fontSize: '1.2rem' }}>💡</div>
              <div className="con-lbl">RGB Model</div>
              <div className="con-t">Additive light model explained. All palette colors broken into R·G·B channels.</div>
            </div>
            <div className="con-pt s">
              <div style={{ fontSize: '1.2rem' }}>📐</div>
              <div className="con-lbl s">Applied</div>
              <div className="con-t">Every UI element — nav, hero, cards, player, badges — follows the scheme deliberately.</div>
            </div>
          </div>
        </div>
      </div>

      <div id="mini-player" className={isPlaying || progress > 0 ? 'visible' : ''}>
        <div className="mp-art"><div className={`mp-art-inner mp-spin ${isPlaying ? 'playing' : ''}`}>{tracks[curTrack].emoji}</div></div>
        <div className="mp-info">
          <div className="mp-title">{tracks[curTrack].title}</div>
          <div className="mp-artist">{tracks[curTrack].artist} · {tracks[curTrack].genre}</div>
        </div>
        <div className="mp-controls">
          <button className="mp-btn" onClick={prevTrack}>⏮</button>
          <button className="mp-play" onClick={togglePlay}>{isPlaying ? '⏸' : '▶'}</button>
          <button className="mp-btn" onClick={nextTrack}>⏭</button>
        </div>
        <div className="mp-progress-wrap">
          <span className="mp-time">{fmtTime(tracks[curTrack].dur * progress / 100)}</span>
          <div className="mp-bar" onClick={seekTo}><div className="mp-bar-fill" style={{ width: progress + '%' }}></div><div className="mp-bar-thumb"></div></div>
          <span className="mp-time">{fmtTime(tracks[curTrack].dur)}</span>
        </div>
        <div className="mp-vol"><span style={{ fontSize: '.9rem' }}>🔊</span><div className="mp-vol-bar" onClick={handleSetVolume}><div className="mp-vol-fill" style={{ width: volume + '%' }}></div></div></div>
        <button className={`mp-like ${liked ? 'liked' : ''}`} onClick={toggleLike}>{liked ? '♥' : '♡'}</button>
      </div>

      <footer>
        <div className="foot-logo">SŌ<span>N</span>IC</div>
        <div className="foot-note">Website UI <span className="fdot"></span> Music Platform <span className="fdot"></span> Complementary Scheme <span className="fdot"></span> Prakhar Srivastava</div>
      </footer>
    </>
  );
}
