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

// Your own JioSaavn API on Cloudflare Workers
const SAAVN_BASE = 'https://jiosaavn-api-sonic.prakhar123srivastava.workers.dev';

const SONG_QUERIES = [
  { title: 'Khat',             artist: 'Navjot Ahuja',              emoji: '✉️', genre: 'Pop',        art: 'art1', query: 'Khat Navjot Ahuja' },
  { title: "Don't Even Text",  artist: 'Tsumyoki, Gini',           emoji: '📵', genre: 'Hip-Hop',    art: 'art2', query: "Don't Even Text Tsumyoki Gini" },
  { title: 'Dil Mere',         artist: 'The Local Train',          emoji: '❤️', genre: 'Indie',      art: 'art3', query: 'Dil Mere The Local Train' },
  { title: 'Sailor Song',      artist: 'Gigi Perez',               emoji: '⚓', genre: 'Indie Pop',  art: 'art4', query: 'Sailor Song Gigi Perez' },
  { title: 'Timeless',         artist: 'The Weeknd, Playboi Carti',emoji: '⏳', genre: 'Pop',        art: 'art5', query: 'Timeless The Weeknd Playboi Carti' },
];

// Color psychology data
const COLOR_MEANINGS = [
  {
    name: 'Red',
    hex: '#EF4444',
    glow: 'rgba(239,68,68,0.4)',
    emotion: 'Energy · Passion · Urgency',
    desc: 'Raises heart rate. Used in CTAs, food brands, alerts.',
    anim: 'colorPulse',
  },
  {
    name: 'Blue',
    hex: '#3B82F6',
    glow: 'rgba(59,130,246,0.35)',
    emotion: 'Trust · Calm · Depth',
    desc: 'The most trusted color globally. Slower breathing, more focus.',
    anim: 'none',
  },
  {
    name: 'Yellow',
    hex: '#FBBF24',
    glow: 'rgba(251,191,36,0.5)',
    emotion: 'Optimism · Energy · Attention',
    desc: 'Highest visibility — the human eye processes it fastest.',
    anim: 'colorGlow',
  },
  {
    name: 'Teal',
    hex: '#0D9488',
    glow: 'rgba(13,148,136,0.45)',
    emotion: 'Digital · Modern · Fresh',
    desc: "SŌNIC's primary. Blue-Green tertiary — calm like blue, fresh like green.",
    anim: 'none',
  },
  {
    name: 'Orange',
    hex: '#F97316',
    glow: 'rgba(249,115,22,0.45)',
    emotion: 'Action · Warmth · Boldness',
    desc: "SŌNIC's accent. Complementary to Teal — maximum contrast.",
    anim: 'none',
  },
  {
    name: 'Violet',
    hex: '#8B5CF6',
    glow: 'rgba(139,92,246,0.4)',
    emotion: 'Luxury · Mystery · Creative',
    desc: 'Associated with premium and creative intelligence.',
    anim: 'none',
  },
];

// Harmony schemes
const HARMONIES = {
  complementary: {
    label: 'Complementary',
    desc: 'Directly opposite on the wheel (180°). Maximum contrast — SŌNIC uses Teal ↔ Orange.',
    colors: ['#0D9488', '#F97316'],
    swatches: ['Teal', 'Orange'],
    gradient: 'linear-gradient(135deg, #0D9488, #F97316)',
    highlight: [7, 2],
  },
  triadic: {
    label: 'Triadic',
    desc: 'Three colors equally spaced (120° apart). Vibrant and balanced.',
    colors: ['#FF0000', '#FFDD00', '#0044CC'],
    swatches: ['Red', 'Yellow', 'Blue'],
    gradient: 'linear-gradient(135deg, #FF0000, #FFDD00, #0044CC)',
    highlight: [0, 4, 8],
  },
  analogous: {
    label: 'Analogous',
    desc: 'Three adjacent colors on the wheel. Harmonious and natural.',
    colors: ['#00BB00', '#0D9488', '#0044CC'],
    swatches: ['Green', 'Teal', 'Blue'],
    gradient: 'linear-gradient(135deg, #00BB00, #0D9488, #0044CC)',
    highlight: [6, 7, 8],
  },
  monochromatic: {
    label: 'Monochromatic',
    desc: 'One hue at different saturations and brightnesses. Elegant and sophisticated.',
    colors: ['#0A4F4A', '#0D9488', '#5EEAD4'],
    swatches: ['Dark Teal', 'Teal', 'Light Teal'],
    gradient: 'linear-gradient(135deg, #0A4F4A, #0D9488, #5EEAD4)',
    highlight: [7],
  },
};

// Why we chose TEAL + ORANGE
const WHY_COLORS = [
  {
    color: '#0D9488',
    name: 'Teal (#0D9488)',
    role: 'Primary Brand Color',
    reasons: [
      { icon: '🎵', title: 'Music = Emotion + Technology', body: 'Teal sits between Blue (technology, trust) and Green (harmony, nature). Music is exactly that bridge — emotional yet digital.' },
      { icon: '👁️', title: 'Stands Out in Music Apps', body: 'Spotify uses green, Apple Music uses red, YouTube Music uses red. Teal is distinct — immediately recognizable as SŌNIC.' },
      { icon: '🧠', title: 'Psychology: Calm Focus', body: 'Teal reduces anxiety while maintaining alertness. Perfect for long listening sessions — users stay relaxed and engaged.' },
      { icon: '🌊', title: 'Sound Visualized', body: "Sound travels in waves. Teal's fluid, wave-like quality visually represents the medium we're built for." },
    ],
  },
  {
    color: '#F97316',
    name: 'Orange (#F97316)',
    role: 'Accent / Action Color',
    reasons: [
      { icon: '⚡', title: 'Complementary = Maximum Energy', body: 'Teal and Orange are directly opposite on the color wheel (180°). This creates the highest possible contrast — every CTA button demands attention.' },
      { icon: '🔥', title: 'Action & Urgency Without Aggression', body: 'Red CTAs feel alarming. Orange is energetic and warm — it invites action without pressure. "Play now" feels natural.' },
      { icon: '🎸', title: 'Music Culture', body: "Orange is warm like vinyl, fire, and stage lights. It embodies live music energy — the 'heat' of a great concert." },
      { icon: '📊', title: 'Proven in UI', body: 'Amazon, Harley Davidson, and Fanta use Orange for action. Studies show Orange CTAs outperform red by 32% in click-through.' },
    ],
  },
];

export default function App() {
  const [curTrack, setCurTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [activeScheme, setActiveScheme] = useState('complementary');
  const [rgb, setRgb] = useState({ r: 13, g: 148, b: 136 });
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [hoveredColor, setHoveredColor] = useState(null);
  const [bgTint, setBgTint] = useState({ r: 13, g: 148, b: 136 });
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  // JioSaavn track state — fetched on demand, cached after first load
  const [saavnTracks, setSaavnTracks] = useState(
    SONG_QUERIES.map(q => ({ ...q, url: null, artwork: null }))
  );
  const [previewIdx, setPreviewIdx] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rippleCanvasRef = useRef(null);
  const particlesCanvasRef = useRef(null);
  const colorWheelCanvasRef = useRef(null);
  const analogousCanvasRef = useRef(null);
  const complementaryCanvasRef = useRef(null);
  const triadicCanvasRef = useRef(null);
  const monochromaticCanvasRef = useRef(null);
  const interactiveWheelRef = useRef(null);
  const curRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);
  const progIntervalRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const audioRef = useRef(null);
  const previewIntervalRef = useRef(null);
  const bgTintRef = useRef(bgTint);
  const targetTintRef = useRef(bgTint);
  bgTintRef.current = bgTint;

  const fmtTime = (s) => Math.floor(s/60) + ':' + Math.floor(s%60).toString().padStart(2,'0');

  const showToast = (msg) => {
    setToast({ show: true, msg });
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(p => ({...p, show:false})), 3000);
  };

  const playTrack = (i) => { setCurTrack(i); setIsPlaying(true); setProgress(0); showToast(`Now Playing: ${tracks[i].title} ${tracks[i].emoji}`); };
  const togglePlay = () => setIsPlaying(p => !p);
  const nextTrack = () => playTrack((curTrack+1)%tracks.length);
  const prevTrack = () => playTrack((curTrack-1+tracks.length)%tracks.length);
  const toggleLike = () => { const n=!liked; setLiked(n); if(n) showToast('Added to Liked Songs ♥'); };
  const seekTo = (e) => { const r=e.currentTarget.getBoundingClientRect(); setProgress(Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))); };
  const handleSetVolume = (e) => { const r=e.currentTarget.getBoundingClientRect(); setVolume(Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))); };
  const updateRGB = (rV,gV,bV) => { const r=parseInt(rV),g=parseInt(gV),b=parseInt(bV); setRgb({r,g,b}); targetTintRef.current={r,g,b}; };

  // ── JioSaavn via your Cloudflare Worker ──
  const fetchSaavnTrack = async (idx) => {
    const q = SONG_QUERIES[idx];
    try {
      const res = await fetch(
        `${SAAVN_BASE}/api/search/songs?query=${encodeURIComponent(q.query)}&limit=1`,
        { signal: AbortSignal.timeout(8000) }
      );
      const data = await res.json();
      const song = data?.data?.results?.[0];
      if (song) {
        const urls = song.downloadUrl || song.media_url;
        const url = Array.isArray(urls)
          ? (urls.find(u => u.quality === '320kbps') || urls.find(u => u.quality === '160kbps') || urls[urls.length - 1])?.url
          : urls;
        const img = song.image;
        const artwork = Array.isArray(img)
          ? (img.find(i => i.quality === '500x500') || img[img.length - 1])?.url
          : img;
        if (url) return { url: url.replace('http://', 'https://'), artwork: artwork || null };
      }
    } catch (e) { console.warn('Search failed:', e.message); }
    return null;
  };

  const startAudio = (url, idx) => {
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.volume = 0.8;
    audioRef.current.oncanplaythrough = () => {
      setPreviewLoading(false);
      audioRef.current.play()
        .then(() => {
          setPreviewPlaying(true);
          showToast(`🎵 ${SONG_QUERIES[idx].title} — ${SONG_QUERIES[idx].artist}`);
          previewIntervalRef.current = setInterval(() => {
            if (!audioRef.current?.duration) return;
            setPreviewProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }, 500);
        })
        .catch(() => { setPreviewLoading(false); showToast('▶ Tap again to play'); });
    };
    audioRef.current.onerror = () => {
      setPreviewLoading(false);
      showToast('⚠️ Stream error — trying next track');
      setTimeout(() => playPreview((idx + 1) % SONG_QUERIES.length), 600);
    };
    audioRef.current.onended = () => {
      setPreviewPlaying(false);
      setPreviewProgress(0);
      clearInterval(previewIntervalRef.current);
      setTimeout(() => playPreview((idx + 1) % SONG_QUERIES.length), 800);
    };
    audioRef.current.load();
  };

const playPreview = async (idx) => {
    clearInterval(previewIntervalRef.current);
    if (audioRef.current) { 
      audioRef.current.pause(); 
      audioRef.current.oncanplaythrough = null;
      audioRef.current.onerror = null;
      audioRef.current.onended = null;
      audioRef.current.src = ''; 
    }
    setPreviewPlaying(false);
    setPreviewProgress(0);
    setPreviewIdx(idx);
    setPreviewLoading(true);

    let { url, artwork } = saavnTracks[idx];
    if (!url) {
      const fetched = await fetchSaavnTrack(idx);
      url = fetched?.url || null;
      artwork = fetched?.artwork || null;
      if (url) {
        setSaavnTracks(prev => prev.map((t, i) => i === idx ? { ...t, url, artwork } : t));
      }
    }

    if (!url) {
      setPreviewLoading(false);
      showToast('⚠️ Could not load — trying next');
      setTimeout(() => playPreview((idx + 1) % SONG_QUERIES.length), 800);
      return;
    }

    startAudio(url, idx);
  };

  const togglePreview = () => {
    if (previewPlaying) {
      audioRef.current?.pause();
      setPreviewPlaying(false);
      clearInterval(previewIntervalRef.current);
    } else if (saavnTracks[previewIdx]?.url && audioRef.current?.readyState > 0) {
      audioRef.current.play().then(() => setPreviewPlaying(true)).catch(() => playPreview(previewIdx));
    } else {
      playPreview(previewIdx);
    }
  };

  const nextPreview = () => {
    clearInterval(previewIntervalRef.current);
    setPreviewPlaying(false);
    playPreview((previewIdx + 1) % SONG_QUERIES.length);
  };

  // Background tint lerp
  useEffect(() => {
    let raf;
    const lerp = (a,b,t) => a+(b-a)*t;
    const tick = () => {
      const c=bgTintRef.current, t=targetTintRef.current;
      setBgTint({ r:Math.round(lerp(c.r,t.r,0.03)), g:Math.round(lerp(c.g,t.g,0.03)), b:Math.round(lerp(c.b,t.b,0.03)) });
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  }, []);
  // Preload all artwork on mount
useEffect(() => {
  SONG_QUERIES.forEach((_, i) => {
    fetchSaavnTrack(i).then(result => {
      if (result?.artwork) {
        setSaavnTracks(prev => prev.map((t, idx) => 
          idx === i ? { ...t, artwork: result.artwork } : t
        ));
      }
    });
  });
}, []);

  useEffect(() => {
    let mx=0,my=0,rx=0,ry=0,tx2=0,ty2=0;
    const onMouseMove=(e)=>{ mx=e.clientX; my=e.clientY; if(curRef.current){curRef.current.style.left=mx+'px';curRef.current.style.top=my+'px';} setMousePos({x:mx/window.innerWidth,y:my/window.innerHeight}); spawnRipple(mx,my); };

    let cursorAnimId;
    const animFollowers=()=>{ rx+=(mx-rx)*.12; ry+=(my-ry)*.12; tx2+=(mx-tx2)*.055; ty2+=(my-ty2)*.055; if(ringRef.current){ringRef.current.style.left=Math.round(rx)+'px';ringRef.current.style.top=Math.round(ry)+'px';} if(trailRef.current){trailRef.current.style.left=Math.round(tx2)+'px';trailRef.current.style.top=Math.round(ty2)+'px';} cursorAnimId=requestAnimationFrame(animFollowers); };
    animFollowers();

    const hoverHandler=(e)=>{ document.body.classList.toggle('cur-hover',!!e.target.closest('button,a,.track-card,.color-meaning-card,.harmony-btn,.ocr-row,.ct-card,.why-color-card')); };
    window.addEventListener('mouseover',hoverHandler);

    // RIPPLE CANVAS
    const rc=rippleCanvasRef.current, rctx=rc.getContext('2d');
    let ripples=[];
    const resizeR=()=>{rc.width=window.innerWidth;rc.height=window.innerHeight;};
    resizeR();
    const spawnRipple=(x,y)=>{ if(Math.random()>.18) return; const isO=Math.random()>.5; ripples.push({x,y,r:0,maxR:Math.random()*80+40,alpha:.18,color:isO?'249,115,22':'13,148,136',speed:Math.random()*1.2+.6}); };
    let rippleId;
    const animR=()=>{ rctx.clearRect(0,0,rc.width,rc.height); ripples=ripples.filter(rp=>rp.alpha>0.005); ripples.forEach(rp=>{ rp.r+=rp.speed;rp.alpha*=0.94; const g=rctx.createRadialGradient(rp.x,rp.y,rp.r*.3,rp.x,rp.y,rp.r); g.addColorStop(0,`rgba(${rp.color},${rp.alpha*.6})`);g.addColorStop(.5,`rgba(${rp.color},${rp.alpha})`);g.addColorStop(1,`rgba(${rp.color},0)`); rctx.beginPath();rctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);rctx.fillStyle=g;rctx.fill(); }); rippleId=requestAnimationFrame(animR); };
    animR();

    // PARTICLES
    const isMobile = window.innerWidth < 768;
    const pc=particlesCanvasRef.current, pctx=pc.getContext('2d');
    let particles=[];
    const resizeP=()=>{pc.width=pc.offsetWidth;pc.height=pc.offsetHeight;};
    const initP=()=>{ particles=[]; const count=isMobile?20:55; for(let i=0;i<count;i++) particles.push({x:Math.random()*pc.width,y:Math.random()*pc.height,r:Math.random()*1.8+.4,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,c:Math.random()>.5?'rgba(13,148,136,':'rgba(249,115,22,',a:Math.random()*.4+.1}); };
    resizeP();initP();
    let pId;
    const animP=()=>{ pctx.clearRect(0,0,pc.width,pc.height); particles.forEach(p=>{ pctx.beginPath();pctx.arc(p.x,p.y,p.r,0,Math.PI*2);pctx.fillStyle=p.c+p.a+')';pctx.fill(); p.x+=p.vx;p.y+=p.vy; if(p.x<0)p.x=pc.width;if(p.x>pc.width)p.x=0;if(p.y<0)p.y=pc.height;if(p.y>pc.height)p.y=0; }); pId=requestAnimationFrame(animP); };
    animP();

    // MAIN COLOR WHEEL
    const drawWheel=()=>{ const cv=colorWheelCanvasRef.current;if(!cv)return; const c=cv.getContext('2d'),cx=130,cy=130,R=108,r=52,seg=Math.PI*2/12; wheelColors.forEach((col,i)=>{ const s=i*seg-Math.PI/2-seg/2,e=s+seg; c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,s,e);c.closePath();c.fillStyle=col.hex;c.fill();c.strokeStyle='rgba(10,15,15,.5)';c.lineWidth=1.5;c.stroke(); }); c.beginPath();c.arc(cx,cy,r+4,0,Math.PI*2);c.fillStyle='rgba(10,15,15,.9)';c.fill(); const ta=(210-90)*Math.PI/180,oa=(60-90)*Math.PI/180; const tx=cx+Math.cos(ta)*80,ty=cy+Math.sin(ta)*80,ox=cx+Math.cos(oa)*80,oy=cy+Math.sin(oa)*80; c.beginPath();c.moveTo(tx,ty);c.lineTo(ox,oy);c.strokeStyle='rgba(249,115,22,.5)';c.lineWidth=1.5;c.setLineDash([5,3]);c.stroke();c.setLineDash([]); [[ta,'#0D9488'],[oa,'#F97316']].forEach(([ang,col])=>{ const x=cx+Math.cos(ang)*80,y=cy+Math.sin(ang)*80; c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.strokeStyle=col;c.lineWidth=2.5;c.stroke(); }); c.fillStyle='#14B8A6';c.font='bold 9px Space Mono,monospace';c.textAlign='center';c.fillText('COLOR',cx,cy-4);c.fillStyle='#F97316';c.fillText('WHEEL',cx,cy+8); };
    drawWheel();

    const onWheelMove=(e)=>{ const rect=colorWheelCanvasRef.current.getBoundingClientRect(),cx=130,cy=130,x=e.clientX-rect.left,y=e.clientY-rect.top,dx=x-cx,dy=y-cy,dist=Math.sqrt(dx*dx+dy*dy); if(dist>52&&dist<110){ let angle=(Math.atan2(dy,dx)+Math.PI/2+Math.PI*2)%(Math.PI*2); const idx=Math.floor(angle/(Math.PI*2/12))%12,col=wheelColors[idx]; const n=document.getElementById('tt-name'),t=document.getElementById('tt-type'),w=document.getElementById('wheelTooltip'); if(n)n.textContent=col.name+' — '+col.hex;if(t)t.textContent=col.type+' Color';if(w)w.style.borderColor=col.hex; } };

    const animCount=(elId,target,suffix)=>{ let n=0,step=target/60; const iv=setInterval(()=>{ n=Math.min(n+step,target); const el=document.getElementById(elId);if(el)el.innerHTML=Math.floor(n)+'<span>'+suffix+'</span>';if(n>=target)clearInterval(iv); },16); };
    setTimeout(()=>{ animCount('scount',80,'M+');animCount('acount',12,'M');animCount('gcount',4,'K'); },400);

    const observer=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)';} }); },{threshold:.08});
    document.querySelectorAll('.track-card,.con-pt,.color-meaning-card,.why-color-card').forEach(el=>{ el.style.opacity='0';el.style.transform='translateY(20px)';el.style.transition='opacity .5s ease,transform .5s ease';observer.observe(el); });

    document.addEventListener('mousemove',onMouseMove);
    window.addEventListener('resize',()=>{resizeR();resizeP();initP();});
    colorWheelCanvasRef.current?.addEventListener('mousemove',onWheelMove);

    return ()=>{ cancelAnimationFrame(cursorAnimId);cancelAnimationFrame(rippleId);cancelAnimationFrame(pId); document.removeEventListener('mousemove',onMouseMove);window.removeEventListener('mouseover',hoverHandler); colorWheelCanvasRef.current?.removeEventListener('mousemove',onWheelMove); clearInterval(progIntervalRef.current);clearInterval(previewIntervalRef.current); if(audioRef.current){audioRef.current.pause();audioRef.current.src='';} };
  }, []);

  // Redraw mini wheels
  useEffect(() => {
    const drawMini=(cvRef,hl,lines)=>{ const cv=cvRef.current;if(!cv)return; const c=cv.getContext('2d'),cx=100,cy=100,R=88,r=35,seg=Math.PI*2/12; const cols=['#FF0000','#FF4400','#FF8800','#FFAA00','#FFDD00','#AADD00','#00BB00','#0D9488','#0044CC','#3311CC','#7700CC','#CC0066']; c.clearRect(0,0,200,200); cols.forEach((col,i)=>{ const s=i*seg-Math.PI/2-seg/2,e=s+seg; c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,s,e);c.closePath();c.fillStyle=col;c.globalAlpha=hl.includes(i)?1:.22;c.fill();c.globalAlpha=1;c.strokeStyle='rgba(10,15,15,.5)';c.lineWidth=1;c.stroke(); }); c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fillStyle='#0A0F0F';c.fill(); if(lines)lines.forEach(([a,b])=>{ const a1=(a/12*Math.PI*2)-Math.PI/2,a2=(b/12*Math.PI*2)-Math.PI/2; c.beginPath();c.moveTo(cx+Math.cos(a1)*68,cy+Math.sin(a1)*68);c.lineTo(cx+Math.cos(a2)*68,cy+Math.sin(a2)*68);c.strokeStyle='rgba(249,115,22,.7)';c.lineWidth=1.5;c.setLineDash([4,2]);c.stroke();c.setLineDash([]); }); hl.forEach(i=>{ const a=(i/12*Math.PI*2)-Math.PI/2; c.beginPath();c.arc(cx+Math.cos(a)*65,cy+Math.sin(a)*65,8,0,Math.PI*2);c.strokeStyle='#fff';c.lineWidth=2.5;c.stroke(); c.beginPath();c.arc(cx+Math.cos(a)*65,cy+Math.sin(a)*65,6,0,Math.PI*2);c.fillStyle=cols[i];c.fill(); }); };
    setTimeout(()=>{ drawMini(analogousCanvasRef,[6,7,8],null); drawMini(complementaryCanvasRef,[2,7],[[2,7]]); drawMini(triadicCanvasRef,[0,4,8],[[0,4],[4,8],[8,0]]); drawMini(monochromaticCanvasRef,[7],null); },0);
  }, [activeScheme]);

  // Interactive harmony wheel
  useEffect(() => {
    const cv=interactiveWheelRef.current;if(!cv)return;
    const c=cv.getContext('2d'),cx=150,cy=150,R=130,rIn=55,seg=Math.PI*2/12;
    const scheme=HARMONIES[activeScheme];
    c.clearRect(0,0,300,300);
    wheelColors.forEach((col,i)=>{ const s=i*seg-Math.PI/2-seg/2,e=s+seg,isH=scheme.highlight.includes(i); c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,isH?R+10:R,s,e);c.closePath();c.globalAlpha=isH?1:0.2; const grd=c.createRadialGradient(cx,cy,rIn,cx,cy,R+10);grd.addColorStop(0,col.hex+'99');grd.addColorStop(1,col.hex);c.fillStyle=grd;c.fill();c.globalAlpha=1;c.strokeStyle='rgba(10,15,15,0.6)';c.lineWidth=1.5;c.stroke(); });
    c.beginPath();c.arc(cx,cy,rIn,0,Math.PI*2);c.fillStyle='#0A0F0F';c.fill();
    c.fillStyle='#14B8A6';c.font='bold 9px Space Mono,monospace';c.textAlign='center';c.fillText(scheme.label.toUpperCase(),cx,cy-4);
    c.fillStyle='rgba(255,255,255,0.4)';c.font='8px Space Mono,monospace';c.fillText(scheme.colors.length+' colors',cx,cy+10);
  }, [activeScheme]);

  useEffect(() => {
    if(isPlaying){ progIntervalRef.current=setInterval(()=>{ setProgress(p=>{ const n=p+(100/tracks[curTrack].dur);if(n>=100){nextTrack();return 0;}return n; }); },1000); } else clearInterval(progIntervalRef.current);
    return ()=>clearInterval(progIntervalRef.current);
  }, [isPlaying,curTrack]);

  const brightness=(rgb.r*0.299)+(rgb.g*0.587)+(rgb.b*0.114);
  const hex='#'+[rgb.r,rgb.g,rgb.b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
  const activeHarmony=HARMONIES[activeScheme];
  const handleHeroMouseMove=(e)=>{ const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5; setHeroTilt({x:x*6,y:y*-6}); };

  return (
    <>
      <canvas id="bg-ripple" ref={rippleCanvasRef}></canvas>
      <div id="cur" ref={curRef}></div>
      <div id="cur-ring" ref={ringRef}></div>
      <div id="cur-trail" ref={trailRef}></div>

      {/* Page-wide reactive tint */}
      <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none', background:`radial-gradient(ellipse 70% 60% at ${mousePos.x*100}% ${mousePos.y*100}%, rgba(${bgTint.r},${bgTint.g},${bgTint.b},0.07) 0%, transparent 65%)`, transition:'background 0.1s linear' }} />

      <div className={`toast ${toast.show?'show':''}`}><div className="toast-dot"></div><span>{toast.msg}</span></div>

      <nav>
        <div className="nav-logo">SŌ<span>N</span>IC</div>
        <div className="nav-links">
          <a href="#trending" onClick={e=>{e.preventDefault();document.getElementById('trending').scrollIntoView({behavior:'smooth'})}}>Discover</a>
          <a href="#featured" onClick={e=>{e.preventDefault();document.getElementById('featured').scrollIntoView({behavior:'smooth'})}}>Artists</a>
          <a href="#color-theory" onClick={e=>{e.preventDefault();document.getElementById('color-theory').scrollIntoView({behavior:'smooth'})}}>Color Theory</a>
          <a href="#cta" onClick={e=>{e.preventDefault();document.getElementById('cta').scrollIntoView({behavior:'smooth'})}}>Full Tool</a>
        </div>
        <div className="nav-right">
          <button className="btn-g">Log In</button>
          <button className="btn-p" onClick={()=>showToast('Play Any Song! 🎵')}>Get Started</button>
          <button className="nav-burger" onClick={()=>setMobileMenuOpen(p=>!p)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <div className={`mobile-nav ${mobileMenuOpen?'open':''}`}>
        <a href="#trending" onClick={e=>{e.preventDefault();document.getElementById('trending').scrollIntoView({behavior:'smooth'});setMobileMenuOpen(false);}}>Discover</a>
        <a href="#featured" onClick={e=>{e.preventDefault();document.getElementById('featured').scrollIntoView({behavior:'smooth'});setMobileMenuOpen(false);}}>Artists</a>
        <a href="#color-theory" onClick={e=>{e.preventDefault();document.getElementById('color-theory').scrollIntoView({behavior:'smooth'});setMobileMenuOpen(false);}}>Color Theory</a>
        <a href="#cta" onClick={e=>{e.preventDefault();document.getElementById('cta').scrollIntoView({behavior:'smooth'});setMobileMenuOpen(false);}}>Full Tool</a>
      </div>

      {/* ── HERO ── */}
      <section className="hero" onMouseMove={handleHeroMouseMove} onMouseLeave={()=>setHeroTilt({x:0,y:0})}>
        <canvas id="particles" ref={particlesCanvasRef}></canvas>
        <div className="hero-orb"></div><div className="hero-ring1"></div><div className="hero-ring2"></div>
        <div style={{ position:'absolute',inset:0,zIndex:1,pointerEvents:'none', background:`radial-gradient(circle 500px at ${mousePos.x*100}% ${mousePos.y*100}%, rgba(249,115,22,0.09) 0%, rgba(13,148,136,0.05) 40%, transparent 70%)`, transition:'background 0.08s linear' }} />
        <div className="hero-content" style={{ transform:`perspective(800px) rotateX(${heroTilt.y}deg) rotateY(${heroTilt.x}deg)`, transition:'transform 0.15s ease' }}>
          <div className="hero-tag"><div className="live-dot"></div>Now Streaming</div>
          <h1 style={{ textShadow:`0 0 60px rgba(${bgTint.r},${bgTint.g},${bgTint.b},0.3)`, transition:'text-shadow 0.5s ease' }}>
            FEEL THE<br /><span className="t">BEAT</span> &amp;<br /><span className="o">VIBE</span>
          </h1>
          <p>Stream unlimited music. Discover new artists. Build your perfect playlist. All in one place.</p>
          <div className="hero-actions">
            <button className="btn-hero" onClick={()=>{ 
  document.getElementById('trending').scrollIntoView({behavior:'smooth'}); 
}}><span className="text">Start Listening ▶</span></button>
            <button className="btn-hero2" onClick={()=>document.getElementById('trending').scrollIntoView({behavior:'smooth'})}>Explore Charts</button>
          </div>
          <div className="hero-stats">
            <div><div className="stat-num" id="scount">0<span>M+</span></div><div className="stat-lbl">Songs</div></div>
            <div><div className="stat-num" id="acount">0<span>M</span></div><div className="stat-lbl">Artists</div></div>
            <div><div className="stat-num" id="gcount">0<span>K</span></div><div className="stat-lbl">Genres</div></div>
          </div>
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section className="trending" id="trending">
        <div className="sec-tag">Charts</div>
        <div className="sec-title">TRENDING NOW</div>
        <p style={{color:'var(--tm)',fontSize:'0.85rem',marginBottom:'28px',marginTop:'-8px'}}>Click any track — plays full song via JioSaavn ↓</p>
        <div className="tracks-grid">
          {SONG_QUERIES.map((t,i)=>(
            <div key={i} className={`track-card ${previewIdx===i&&previewPlaying?'playing':''}`}
              onClick={()=>{ if(previewIdx===i&&previewPlaying){togglePreview();}else{playPreview(i);} }}
              style={{cursor:'none'}}>
              <div className="track-rank">0{i+1}</div>
              <div className={`track-art ${t.art}`} style={{ backgroundImage: saavnTracks[i]?.artwork ? `url(${saavnTracks[i].artwork})` : undefined, backgroundSize:'cover', backgroundPosition:'center' }}>
                {!saavnTracks[i]?.artwork && <span style={{fontSize:'2rem'}}>{t.emoji}</span>}
                <div className="play-overlay">
                  <div className="play-overlay-btn">{previewIdx===i&&previewLoading?'⏳':previewIdx===i&&previewPlaying?'⏸':'▶'}</div>
                </div>
              </div>
              <div className="track-name">{t.title}</div>
              <div className="track-by">{t.artist}</div>
              <div className="track-meta">
                <span className="track-genre">{t.genre}</span>
                {previewIdx===i&&previewPlaying&&<span className="track-plays" style={{color:'var(--pr-lt)'}}>▶ Playing</span>}
              </div>
              <div className="wave-anim" style={{display:previewIdx===i&&previewPlaying?'flex':'none'}}>
                <div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div><div className="wave-bar"></div>
              </div>
              {previewIdx===i&&(previewPlaying||previewLoading)&&(
                <div style={{height:'2px',background:'rgba(255,255,255,0.1)',borderRadius:'1px',marginTop:'8px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:previewProgress+'%',background:'linear-gradient(90deg,var(--pr),var(--sc))',transition:'width 0.4s linear',borderRadius:'1px'}} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section className="featured" id="featured">
        <div className="featured-inner">
          <div>
            <div className="feat-label">// Artist of the Month</div>
            <h2>LUNA <span>VEX</span></h2>
            <p>Pushing the boundaries of electronic music with a signature blend of teal-soaked basslines and fiery melodic bursts.</p>
            <div className="feat-tags"><span className="tag-t">Electronic</span><span className="tag-o">Synthwave</span><span className="tag-t">Ambient</span><span className="tag-o">Live Sets</span></div>
            <button className="btn-hero" onClick={()=>{ document.getElementById('trending').scrollIntoView({behavior:'smooth'}); setTimeout(()=>playPreview(0), 900); }}><span className="text">▶ Play Top Track</span></button>
          </div>
          <div className="feat-visual"><div className="vinyl-rings"></div><div className="artist-circle" onClick={()=>showToast('Luna Vex — Artist of the Month 🎤')}>🎤</div></div>
        </div>
      </section>

      {/* ══ COLOR THEORY SECTION ══ */}
      <div className="ct-section" id="color-theory">

        <div style={{ background:'linear-gradient(135deg,var(--pr-dk),#0A0F0F)', borderTop:'3px solid var(--sc)', borderBottom:'1px solid var(--bd)', padding:'32px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
            <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg,var(--pr),var(--sc))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>🎨</div>
            <div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'.65rem', color:'var(--tm)', letterSpacing:'.15em', textTransform:'uppercase', marginBottom:'4px' }}>Modality · Website UI</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.8rem', letterSpacing:'.06em' }}>Music / Entertainment Platform</div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'.6rem', color:'var(--tm)', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:'3px' }}>By</div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', letterSpacing:'.06em' }}>Prakhar Srivastava</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'.7rem', color:'var(--sc)' }}>590017406</div>
          </div>
        </div>

        {/* ── PART A: Color Wheel + Schemes ── */}
        <div className="explain-block">
          <div className="part-lbl"><span className="part-badge">PART A</span><span className="part-text">Color Wheel &amp; Schemes</span></div>

          <div className="theory-callout">
            <div className="tc-icon">🎨</div>
            <div>
              <div className="tc-title">What is the Color Wheel?</div>
              <p className="tc-body">The color wheel is the designer's most fundamental tool. First described by <strong>Isaac Newton in 1666</strong>, it reveals how colors are born, how they blend, and how they contrast.</p>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'48px', alignItems:'start', marginBottom:'56px' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
              <canvas id="colorWheelCanvas" width="260" height="260" ref={colorWheelCanvasRef}></canvas>
              <div className="iw-tooltip" id="wheelTooltip" style={{ width:'100%' }}>
                <div className="th" id="tt-name">Hover the wheel to explore</div>
                <div id="tt-type" style={{ color:'var(--tm)', fontSize:'.68rem', marginTop:'2px' }}></div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <div className="ct-card">
                <div className="ct-card-label">Primary</div>
                <div style={{ height:'64px', borderRadius:'6px', overflow:'hidden', display:'flex', margin:'10px 0' }}>
                  <div style={{ flex:1, background:'#FF0000', display:'flex', alignItems:'flex-end', padding:'7px', fontFamily:'Space Mono,monospace', fontSize:'.58rem', color:'rgba(255,255,255,.8)' }}>Red<br />#FF0000</div>
                  <div style={{ flex:1, background:'#FFCC00', display:'flex', alignItems:'flex-end', padding:'7px', fontFamily:'Space Mono,monospace', fontSize:'.58rem', color:'rgba(0,0,0,.65)' }}>Yellow<br />#FFCC00</div>
                  <div style={{ flex:1, background:'#0038A8', display:'flex', alignItems:'flex-end', padding:'7px', fontFamily:'Space Mono,monospace', fontSize:'.58rem', color:'rgba(255,255,255,.8)' }}>Blue<br />#0038A8</div>
                </div>
                <div className="ct-card-desc">The <strong>origin colors</strong> — cannot be made by mixing others.</div>
              </div>
              <div className="ct-card" style={{ borderColor:'rgba(13,148,136,.35)', background:'rgba(13,148,136,.04)' }}>
                <div className="ct-card-label" style={{ color:'var(--pr-lt)' }}>Tertiary <span style={{ color:'var(--sc)', fontSize:'.65rem', marginLeft:'6px' }}>← SŌNIC's Teal lives here</span></div>
                <div className="ct-card-desc">Blue-Green (Teal) is our primary brand color — between calm Blue and fresh Green.</div>
              </div>
            </div>
          </div>

          {/* All 4 scheme cards */}
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', letterSpacing:'0.04em', marginBottom:'20px' }}>The 4 Color Schemes — <span style={{ color:'var(--sc)' }}>Click to Explore</span></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'20px', marginBottom:'48px' }}>
            {[
              {key:'analogous',     ref:analogousCanvasRef,      label:'Analogous',      desc:'Adjacent hues. Natural & harmonious.'},
              {key:'complementary', ref:complementaryCanvasRef,  label:'Complementary',  desc:'Opposite hues. Max contrast. ← SŌNIC'},
              {key:'triadic',       ref:triadicCanvasRef,        label:'Triadic',         desc:'Three equidistant hues. Vibrant.'},
              {key:'monochromatic', ref:monochromaticCanvasRef,  label:'Monochromatic',  desc:'One hue, varied lightness. Elegant.'},
            ].map(({key,ref,label,desc})=>(
              <div key={key} onClick={()=>setActiveScheme(key)} style={{ padding:'20px', borderRadius:'14px', border:`1px solid ${activeScheme===key?'rgba(249,115,22,0.5)':'rgba(255,255,255,0.07)'}`, background:activeScheme===key?'rgba(249,115,22,0.06)':'rgba(255,255,255,0.02)', cursor:'none', transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', transform:activeScheme===key?'translateY(-4px)':'none', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
                <canvas ref={ref} width="200" height="200" style={{ borderRadius:'50%', width:'160px', height:'160px' }} />
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', letterSpacing:'0.06em', color:activeScheme===key?'var(--sc)':'var(--tx)', marginBottom:'4px' }}>{label}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--tm)', lineHeight:1.5 }}>{desc}</div>
                </div>
                {activeScheme===key&&<div style={{ width:'100%', height:'3px', borderRadius:'2px', background:'linear-gradient(90deg,var(--pr),var(--sc))' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── COLOR MEANING ── */}
        <div id="color-meaning" style={{ padding:'60px 48px', position:'relative', zIndex:1, borderTop:'1px solid var(--bd)' }}>
          <div className="sec-tag">Color Psychology</div>
          <div className="sec-title" style={{ marginBottom:'12px' }}>COLORS CARRY EMOTION</div>
          <p style={{ color:'var(--tm)', fontSize:'0.9rem', maxWidth:'560px', lineHeight:1.7, marginBottom:'40px' }}>
            Every color triggers a psychological response. Designers use this deliberately — here's what each color does to the brain.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px' }}>
            {COLOR_MEANINGS.map((cm,i)=>(
              <div key={cm.name} className="color-meaning-card"
                onMouseEnter={()=>{ setHoveredColor(cm); targetTintRef.current={r:parseInt(cm.hex.slice(1,3),16),g:parseInt(cm.hex.slice(3,5),16),b:parseInt(cm.hex.slice(5,7),16)}; }}
                onMouseLeave={()=>setHoveredColor(null)}
                style={{ background:hoveredColor?.name===cm.name?`linear-gradient(135deg,${cm.hex}18,${cm.hex}08)`:'rgba(255,255,255,0.03)', border:`1px solid ${hoveredColor?.name===cm.name?cm.hex+'55':'rgba(255,255,255,0.07)'}`, borderRadius:'16px', padding:'24px', cursor:'none', transition:'all 0.35s cubic-bezier(0.34,1.56,0.64,1)', transform:hoveredColor?.name===cm.name?'translateY(-8px) scale(1.02)':'none', boxShadow:hoveredColor?.name===cm.name?`0 20px 60px ${cm.glow}`:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px' }}>
                  <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:cm.hex, boxShadow:hoveredColor?.name===cm.name?`0 0 24px ${cm.glow}`:'none', transition:'box-shadow 0.3s, transform 0.3s', transform:hoveredColor?.name===cm.name?'scale(1.12)':'scale(1)', animation:cm.anim!=='none'?`${cm.anim} 2s ease-in-out infinite`:'none', flexShrink:0 }} />
                  <div>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.3rem', letterSpacing:'0.05em', color:hoveredColor?.name===cm.name?cm.hex:'var(--tx)' }}>{cm.name}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--tm)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{cm.emotion}</div>
                  </div>
                </div>
                <p style={{ fontSize:'0.82rem', color:'var(--tm)', lineHeight:1.65 }}>{cm.desc}</p>
                <div style={{ marginTop:'16px', height:'4px', borderRadius:'2px', background:`linear-gradient(to right,${cm.hex},${cm.hex}44)`, transform:hoveredColor?.name===cm.name?'scaleX(1)':'scaleX(0.3)', transformOrigin:'left', transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── COLOR HARMONY ── */}
        <div id="color-harmony" style={{ padding:'60px 48px', position:'relative', zIndex:1, background:'rgba(13,148,136,0.03)', borderTop:'1px solid var(--bd)' }}>
          <div className="sec-tag">Color Harmony</div>
          <div className="sec-title" style={{ marginBottom:'12px' }}>HOW COLORS RELATE</div>
          <p style={{ color:'var(--tm)', fontSize:'0.9rem', maxWidth:'560px', lineHeight:1.7, marginBottom:'40px' }}>Click any scheme to see the wheel highlight and feel the gradient.</p>

          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'40px' }}>
            {Object.entries(HARMONIES).map(([key,val])=>(
              <button key={key} className="harmony-btn" onClick={()=>{ setActiveScheme(key); targetTintRef.current={r:parseInt(val.colors[0].slice(1,3),16),g:parseInt(val.colors[0].slice(3,5),16),b:parseInt(val.colors[0].slice(5,7),16)}; }}
                style={{ padding:'10px 22px', borderRadius:'6px', border:`1px solid ${activeScheme===key?'var(--sc)':'rgba(255,255,255,0.1)'}`, background:activeScheme===key?'rgba(249,115,22,0.12)':'rgba(255,255,255,0.03)', color:activeScheme===key?'var(--sc)':'var(--tm)', fontFamily:'Space Mono,monospace', fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'none', transition:'all 0.25s', transform:activeScheme===key?'translateY(-2px)':'none' }}>
                {val.label}
              </button>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'48px', alignItems:'center' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
              <canvas ref={interactiveWheelRef} width={300} height={300} style={{ borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)', cursor:'none' }} />
              <div style={{ fontSize:'0.65rem', fontFamily:'Space Mono,monospace', color:'var(--tm)', textAlign:'center', letterSpacing:'0.1em' }}>HIGHLIGHTED = {activeScheme.toUpperCase()}</div>
            </div>
            <div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.2rem', letterSpacing:'0.04em', marginBottom:'12px', color:'var(--sc)' }}>{activeHarmony.label}</div>
              <p style={{ color:'var(--tm)', fontSize:'0.9rem', lineHeight:1.7, marginBottom:'28px', maxWidth:'480px' }}>{activeHarmony.desc}</p>
              <div style={{ display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap' }}>
                {activeHarmony.colors.map((col,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 16px', borderRadius:'8px', background:col+'18', border:`1px solid ${col}44`, transition:'all 0.3s' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 8px 24px ${col}44`;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                    <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:col, boxShadow:`0 0 12px ${col}88`, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--tx)' }}>{activeHarmony.swatches[i]}</div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--tm)' }}>{col}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ height:'80px', borderRadius:'12px', background:activeHarmony.gradient, transition:'background 0.6s ease', border:'1px solid rgba(255,255,255,0.08)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 50%)' }} />
                <div style={{ position:'absolute', bottom:'10px', right:'14px', fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'rgba(255,255,255,0.6)', letterSpacing:'0.1em' }}>{activeHarmony.label.toUpperCase()} GRADIENT</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── WHY THESE COLORS ── */}
        <div style={{ padding:'60px 48px', borderTop:'1px solid var(--bd)' }}>
          <div className="sec-tag">Design Decision</div>
          <div className="sec-title" style={{ marginBottom:'8px' }}>WHY TEAL + ORANGE?</div>
          <p style={{ color:'var(--tm)', fontSize:'0.9rem', maxWidth:'600px', lineHeight:1.7, marginBottom:'48px' }}>
            These aren't random colors. Every design decision in SŌNIC was deliberate — here's the exact reasoning behind each choice.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(440px, 1fr))', gap:'32px' }}>
            {WHY_COLORS.map((wc)=>(
              <div key={wc.name} className="why-color-card" style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${wc.color}33`, borderRadius:'20px', overflow:'hidden', transition:'transform 0.3s, box-shadow 0.3s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 20px 60px ${wc.color}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                <div style={{ padding:'24px 28px 20px', background:`linear-gradient(135deg, ${wc.color}18, ${wc.color}06)`, borderBottom:`1px solid ${wc.color}22`, display:'flex', alignItems:'center', gap:'16px' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:wc.color, boxShadow:`0 0 20px ${wc.color}66`, flexShrink:0 }} />
                  <div>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.3rem', letterSpacing:'0.04em', color:wc.color }}>{wc.name}</div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:'var(--tm)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{wc.role}</div>
                  </div>
                </div>
                <div style={{ padding:'20px 28px 24px', display:'flex', flexDirection:'column', gap:'16px' }}>
                  {wc.reasons.map((r,ri)=>(
                    <div key={ri} style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                      <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:`${wc.color}18`, border:`1px solid ${wc.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0, marginTop:'2px' }}>{r.icon}</div>
                      <div>
                        <div style={{ fontSize:'0.84rem', fontWeight:600, color:'var(--tx)', marginBottom:'3px' }}>{r.title}</div>
                        <div style={{ fontSize:'0.76rem', color:'var(--tm)', lineHeight:1.6 }}>{r.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Combined verdict */}
          <div style={{ marginTop:'32px', padding:'28px 32px', borderRadius:'16px', background:'linear-gradient(135deg,rgba(13,148,136,0.08),rgba(249,115,22,0.08))', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:'12px', alignItems:'center', flexShrink:0 }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#0D9488', boxShadow:'0 0 16px rgba(13,148,136,0.5)' }} />
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', color:'var(--pr-lt)' }}>+</div>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#F97316', boxShadow:'0 0 16px rgba(249,115,22,0.5)' }} />
            </div>
            <div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', letterSpacing:'0.04em', marginBottom:'6px' }}>The Verdict: <span style={{ color:'var(--sc)' }}>Complementary Scheme Wins</span></div>
              <p style={{ fontSize:'0.82rem', color:'var(--tm)', lineHeight:1.65, maxWidth:'600px' }}>
                Teal + Orange creates the perfect tension for a music platform — Teal says "trust us, we're professional" while Orange says "feel the energy, press play". Together they make every action feel intentional and every moment feel alive.
              </p>
            </div>
          </div>
        </div>

        {/* ── RGB Section ── */}
        <div className="explain-block">
          <div className="part-lbl"><span className="part-badge" style={{ background:'var(--pr)' }}>RGB</span><span className="part-text">Additive Color Model</span></div>
          <div className="theory-callout" style={{ marginBottom:'32px' }}>
            <div className="tc-icon">💡</div>
            <div>
              <div className="tc-title">Additive Color (RGB)</div>
              <p className="tc-body">Screens use <strong>light</strong>. Start with black (no light) and add Red, Green, and Blue. All three at 255 = White.</p>
            </div>
          </div>

          <div className="rgb-grid">
            <div className="rgb-mixer">
              <h4>Live RGB Mixer</h4>
              <p className="rgb-mixer-sub">Drag sliders · Watch the color build</p>
              <div className="rgb-preview" style={{ background:`rgb(${rgb.r},${rgb.g},${rgb.b})`, color:brightness>128?'rgba(0,0,0,0.7)':'rgba(255,255,255,0.8)', boxShadow:`0 0 40px rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`, transition:'background 0.1s, box-shadow 0.3s' }}>
                rgb({rgb.r}, {rgb.g}, {rgb.b}) | {hex}
              </div>
              <div className="rgb-sliders">
                {['r','g','b'].map(ch=>(
                  <div key={ch} className="rgb-slider-row">
                    <span className={`rgb-slider-lbl ${ch}`}>{ch.toUpperCase()}</span>
                    <input type="range" className={`rgb-slider ${ch}-sl`} min="0" max="255" value={rgb[ch]} onChange={e=>updateRGB(ch==='r'?e.target.value:rgb.r,ch==='g'?e.target.value:rgb.g,ch==='b'?e.target.value:rgb.b)} />
                    <span className="rgb-val-num">{rgb[ch]}</span>
                  </div>
                ))}
              </div>
              <div className="rgb-presets">
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'.6rem', color:'var(--tm)', letterSpacing:'.1em', textTransform:'uppercase', width:'100%', marginBottom:'6px' }}>Try SŌNIC's palette ↓</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
                  <button className="rgb-preset-btn" onClick={()=>updateRGB(13,148,136)} style={{ borderLeft:'2px solid var(--pr)' }}>Teal</button>
                  <button className="rgb-preset-btn" onClick={()=>updateRGB(249,115,22)} style={{ borderLeft:'2px solid var(--sc)' }}>Orange</button>
                  <button className="rgb-preset-btn" onClick={()=>updateRGB(251,191,36)} style={{ borderLeft:'2px solid var(--ac)' }}>Amber</button>
                  <button className="rgb-preset-btn" onClick={()=>updateRGB(255,0,0)}>Pure R</button>
                  <button className="rgb-preset-btn" onClick={()=>updateRGB(0,255,0)}>Pure G</button>
                  <button className="rgb-preset-btn" onClick={()=>updateRGB(0,0,255)}>Pure B</button>
                  <button className="rgb-preset-btn" onClick={()=>updateRGB(255,255,255)}>White</button>
                  <button className="rgb-preset-btn" onClick={()=>updateRGB(0,0,0)}>Black</button>
                </div>
              </div>
            </div>
            <div className="rgb-explanation">
              <h3 style={{ margin:0, marginBottom:'16px' }}>Red · Green · <span style={{ color:'var(--pr-lt)' }}>Blue</span></h3>
              <div className="rgb-mix-visual"><div className="rgb-c r"></div><div className="rgb-c g"></div><div className="rgb-c b"></div></div>
              <div className="ocr-title">SŌNIC Palette → RGB Values</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <div className="ocr-row" onClick={()=>updateRGB(13,148,136)}><div className="ocr-sw" style={{ background:'#0D9488' }}></div><div className="ocr-name">Teal</div><div className="ocr-bars"><span className="ocr-v ocr-r">R:13</span><span className="ocr-v ocr-g">G:148</span><span className="ocr-v ocr-b">B:136</span></div></div>
                <div className="ocr-row" onClick={()=>updateRGB(249,115,22)}><div className="ocr-sw" style={{ background:'#F97316' }}></div><div className="ocr-name">Orange</div><div className="ocr-bars"><span className="ocr-v ocr-r">R:249</span><span className="ocr-v ocr-g">G:115</span><span className="ocr-v ocr-b">B:22</span></div></div>
                <div className="ocr-row" onClick={()=>updateRGB(252,211,77)}><div className="ocr-sw" style={{ background:'#FCD34D' }}></div><div className="ocr-name">Amber</div><div className="ocr-bars"><span className="ocr-v ocr-r">R:252</span><span className="ocr-v ocr-g">G:211</span><span className="ocr-v ocr-b">B:77</span></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="conclusion">
          <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'24px' }}>
            <div style={{ width:'4px', height:'44px', background:'linear-gradient(var(--pr),var(--sc))', borderRadius:'2px' }}></div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.8rem', letterSpacing:'.04em' }}>SŌNIC · <span style={{ color:'var(--sc)' }}>Color Theory</span> Summary</div>
          </div>
          <div className="con-pts">
            <div className="con-pt"><div style={{ fontSize:'1.2rem' }}>🎡</div><div className="con-lbl">Color Wheel</div><div className="con-t">Teal identified as Blue-Green tertiary.</div></div>
            <div className="con-pt s"><div style={{ fontSize:'1.2rem' }}>🎨</div><div className="con-lbl s">4 Schemes</div><div className="con-t">All 4 explained. Complementary chosen.</div></div>
            <div className="con-pt"><div style={{ fontSize:'1.2rem' }}>🖌️</div><div className="con-lbl">Why Teal</div><div className="con-t">Music = emotion + technology. Teal bridges both.</div></div>
            <div className="con-pt s"><div style={{ fontSize:'1.2rem' }}>⚡</div><div className="con-lbl s">Why Orange</div><div className="con-t">Maximum contrast to Teal. Action invites play.</div></div>
            <div className="con-pt"><div style={{ fontSize:'1.2rem' }}>💡</div><div className="con-lbl">RGB Model</div><div className="con-t">Additive light. All palette colors broken into R·G·B.</div></div>
            <div className="con-pt s"><div style={{ fontSize:'1.2rem' }}>📐</div><div className="con-lbl s">Applied</div><div className="con-t">Every UI element follows the scheme deliberately.</div></div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section id="cta" style={{ padding:'100px 48px', position:'relative', zIndex:1, textAlign:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(13,148,136,0.08) 0%,rgba(249,115,22,0.06) 100%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(13,148,136,0.06) 0%,transparent 70%)', animation:'orb-pulse 6s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:2, maxWidth:'680px', margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.3)', padding:'6px 16px', borderRadius:'4px', fontSize:'0.7rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--sc)', marginBottom:'28px' }}>
            <div className="live-dot"></div> Interactive Tool
          </div>
          <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2.5rem,6vw,5rem)', letterSpacing:'0.02em', lineHeight:0.95, marginBottom:'24px' }}>
            WANT TO EXPLORE<br /><span style={{ color:'var(--pr-lt)' }}>COLOR THEORY</span><br />IN DEPTH?
          </h2>
          <p style={{ fontSize:'1rem', color:'var(--tm)', lineHeight:1.75, maxWidth:'520px', margin:'0 auto 40px' }}>
            Try the <strong style={{ color:'var(--tx)' }}>full interactive color tool</strong> and experiment in real-time.
          </p>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="https://color-theory-weld.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
              <button className="btn-hero" style={{ fontSize:'1rem', padding:'16px 40px' }}><span className="text">Open Color Tool ↗</span></button>
            </a>
            <button className="btn-hero2" style={{ padding:'16px 32px' }} onClick={()=>document.getElementById('color-theory').scrollIntoView({behavior:'smooth'})}>Review Theory</button>
          </div>
        </div>
      </section>

      {/* ── BOTTOM PLAYER ── */}
      <div id="mini-player" className={previewPlaying||previewLoading||previewProgress>0?'visible':''}>
        <div className="mp-art">
          <div
            className={`mp-art-inner mp-spin ${previewPlaying?'playing':''}`}
            style={{
              backgroundImage: saavnTracks[previewIdx]?.artwork
                ? `url(${saavnTracks[previewIdx].artwork})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!saavnTracks[previewIdx]?.artwork && SONG_QUERIES[previewIdx]?.emoji}
          </div>
        </div>
        <div className="mp-info">
          <div className="mp-title">{SONG_QUERIES[previewIdx]?.title}</div>
          <div className="mp-artist">{SONG_QUERIES[previewIdx]?.artist}</div>
        </div>
        <div className="mp-controls">
          <button className="mp-btn" onClick={()=>{ clearInterval(previewIntervalRef.current); setPreviewPlaying(false); playPreview((previewIdx-1+SONG_QUERIES.length)%SONG_QUERIES.length); }}>⏮</button>
          <button className="mp-play" onClick={togglePreview}>
            {previewLoading ? '⏳' : previewPlaying ? '⏸' : '▶'}
          </button>
          <button className="mp-btn" onClick={nextPreview}>⏭</button>
        </div>
        <div className="mp-progress-wrap">
          <span className="mp-time">
            {audioRef.current?.currentTime ? fmtTime(audioRef.current.currentTime) : '0:00'}
          </span>
          <div className="mp-bar" onClick={(e)=>{
            if(!audioRef.current?.duration) return;
            const r=e.currentTarget.getBoundingClientRect();
            audioRef.current.currentTime = ((e.clientX-r.left)/r.width)*audioRef.current.duration;
          }}>
            <div className="mp-bar-fill" style={{ width:previewProgress+'%' }}></div>
            <div className="mp-bar-thumb"></div>
          </div>
          <span className="mp-time">
            {audioRef.current?.duration ? fmtTime(audioRef.current.duration) : '0:00'}
          </span>
        </div>
        <div className="mp-vol">
          <span style={{ fontSize:'.9rem' }}>🔊</span>
          <div className="mp-vol-bar" onClick={handleSetVolume}>
            <div className="mp-vol-fill" style={{ width:volume+'%' }}></div>
          </div>
        </div>
        <button className={`mp-like ${liked?'liked':''}`} onClick={toggleLike}>{liked?'♥':'♡'}</button>
      </div>

      <footer>
        <div className="foot-logo">SŌ<span>N</span>IC</div>
        <div className="foot-note">Website UI <span className="fdot"></span> Music Platform <span className="fdot"></span> Complementary Scheme <span className="fdot"></span> Prakhar Srivastava</div>
      </footer>
    </>
  );
}