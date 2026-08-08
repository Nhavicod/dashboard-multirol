import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { 
    Trophy, Shield, Activity, Database, Settings, Download, List, Edit3, 
    Sparkles, X, CheckCircle, AlertCircle, RotateCcw, Upload, Camera,
    Minus, Plus, CalendarCheck, ClipboardPaste, Code, 
    LayoutDashboard, CalendarDays, Image as ImageIcon, User, Trash2, 
    Save, UserPlus, Users, FolderSearch, Search, Filter, LogOut, Lock, 
    Mail, Calendar, LayoutGrid, ShieldAlert, Smartphone, Megaphone, Play, 
    Settings2, FileSpreadsheet, ImagePlus, Coins, Gamepad2,
    ChevronRight, Wallet, Link as LinkIcon, ChevronUp, ChevronDown, Key,
    Vote, Flame, Copy, FileDown, FileUp, Crown, Zap, Send
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// ⚙️ CONFIGURACIÓN - REEMPLAZA ESTOS VALORES
// ==========================================
const firebaseConfig = {
[Nueva Idea]

const firebaseConfig = {
  apiKey: "AIzaSyBS1XKHdTxfFeSUGxVOc_L-v0y2u5bPt8Y",
  authDomain: "nhavisoccer-app.firebaseapp.com",
  projectId: "nhavisoccer-app",
  storageBucket: "nhavisoccer-app.firebasestorage.app",
  messagingSenderId: "306624273392",
  appId: "1:306624273392:web:36bd9d300e1f628458db35"
};

const IMGBB_API_KEY = "cfba76bdf6f68d8df4d80adcf24ddf91";
const ADMIN_DEV_PASSWORD = "20190147"; // Clave para Modo Pruebas

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'nhavisoccer-core';

// ==========================================
// 🎨 ESTILOS
// ==========================================
const DASHBORINO_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&family=Outfit:wght@300;400;600;800;900&display=swap');
  :root { --bg-abismo:#020617; --neon-cyan:#06b6d4; --neon-magenta:#d946ef; --neon-emerald:#10b981; --neon-amber:#f59e0b; }
  * { box-sizing: border-box; }
  body { margin:0; padding:0; background-color:var(--bg-abismo); color:#e2e8f0; font-family:'Outfit',sans-serif; -webkit-font-smoothing:antialiased; overflow-x:hidden; }
  .font-jetbrains { font-family:'JetBrains Mono',monospace; }
  .bg-matriz { background-image: linear-gradient(to right, rgba(6,182,212,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.02) 1px, transparent 1px); background-size:50px 50px; }
  .glass-panel { background:linear-gradient(135deg, rgba(2,6,23,0.8), rgba(15,23,42,0.6)); backdrop-filter:blur(12px) saturate(180%); -webkit-backdrop-filter:blur(12px) saturate(180%); border:1px solid rgba(6,182,212,0.1); }
  .glass-panel-heavy { background:linear-gradient(135deg, rgba(2,6,23,0.95), rgba(15,23,42,0.9)); backdrop-filter:blur(35px) saturate(200%); -webkit-backdrop-filter:blur(35px) saturate(200%); border:1px solid rgba(6,182,212,0.15); }
  .no-scrollbar::-webkit-scrollbar { display:none; }
  .custom-scrollbar::-webkit-scrollbar { width:4px; height:4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background:rgba(0,0,0,0.3); }
  .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(6,182,212,0.3); border-radius:8px; }
  .animate-fade-in { animation:fadeIn 0.3s ease both; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
  .animate-scale-in { animation:scaleIn 0.2s ease both; }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.95);} to{opacity:1;transform:scale(1);} }
  .touch-target { min-height:44px; min-width:44px; }
  @keyframes adPanZoom { 0%{transform:scale(1.3) translateY(-10%);} 75%{transform:scale(1.4) translateY(10%);} 100%{transform:scale(1) translateY(0);} }
`;

// ==========================================
// 📸 SUBIDA DE IMÁGENES A IMGBB
// ==========================================
const uploadToImgBB = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(',')[1];
        const formData = new FormData();
        formData.append('image', base64);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
        const data = await response.json();
        if (data.success) resolve(data.data.url);
        else reject(new Error(data.error?.message || 'Error'));
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const compressImage = (file, maxSize = 800, quality = 0.8) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > h) { if (w > maxSize) { h *= maxSize/w; w=maxSize; } }
      else { if (h > maxSize) { w *= maxSize/h; h=maxSize; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// ==========================================
// 🏆 DATOS INICIALES
// ==========================================
const FLAG_MAP = { 'SENEGAL':'sn', 'SUIZA':'ch', 'VENEZUELA':'ve', 'BRASIL 23':'br', 'MEXICO':'mx', 'ESPAÑA':'es', 'DINAMARCA':'dk', 'GALES':'gb-wls', 'COLOMBIA':'co', 'RUSIA':'ru', 'MEXICO J':'mx', 'IRAK':'iq', 'BELGICA J':'be' };
const CLUB_LOGOS = {
    'AMERICA':'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Club_Am%C3%A9rica_logo.svg/512px-Club_Am%C3%A9rica_logo.svg.png',
    'CHIVAS':'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Club_Deportivo_Guadalajara_logo.svg/512px-Club_Deportivo_Guadalajara_logo.svg.png',
    'REAL MADRID':'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/512px-Real_Madrid_CF.svg.png',
    'BARCELONA':'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/512px-FC_Barcelona_%28crest%29.svg.png'
};
const getTeamLogoUrl = (name) => {
    if (!name) return null;
    const upper = name.toUpperCase().trim();
    if (CLUB_LOGOS[upper]) return CLUB_LOGOS[upper];
    for (let k in CLUB_LOGOS) if (upper.includes(k)) return CLUB_LOGOS[k];
    return FLAG_MAP[upper] ? `https://flagcdn.com/w160/${FLAG_MAP[upper]}.png` : null;
};
const getSafeLogo = (team) => {
    if (!team) return null;
    if (team.customLogo) return team.customLogo;
    const url = getTeamLogoUrl(team.name);
    if (url) return url;
    const letter = (team.name || 'T').charAt(0).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#020617" stroke="#06b6d4" stroke-width="4"/><text x="50" y="72" font-family="sans-serif" font-size="65" font-weight="900" fill="#06b6d4" text-anchor="middle">${letter}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const INITIAL_TEAMS = [
    { id:'cn-0', division:'CONO NORTE', name:'SENEGAL', pj:15, g:13, e:1, p:1, gf:125, gc:69, pts:40, form:['G','G','G','E','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cn-0-p${j}`,name:`Jugador ${j+1}`,number:j+1,photo:null,position:'MED',ovr:75,yellowCardsList:[],redCards:0})) },
    { id:'cn-1', division:'CONO NORTE', name:'SUIZA', pj:15, g:12, e:2, p:1, gf:103, gc:39, pts:38, form:['G','G','E','G','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cn-1-p${j}`,name:`Jugador ${j+1}`,number:j+1,photo:null,position:'MED',ovr:75,yellowCardsList:[],redCards:0})) },
    { id:'cn-2', division:'CONO NORTE', name:'VENEZUELA', pj:15, g:11, e:1, p:3, gf:73, gc:56, pts:34, form:['G','G','P','G','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cn-2-p${j}`,name:`Jugador ${j+1}`,number:j+1,photo:null,position:'MED',ovr:75,yellowCardsList:[],redCards:0})) },
    { id:'cn-3', division:'CONO NORTE', name:'BRASIL 23', pj:14, g:10, e:2, p:2, gf:108, gc:58, pts:32, form:['G','E','G','G','P'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cn-3-p${j}`,name:`Jugador ${j+1}`,number:j+1,photo:null,position:'MED',ovr:75,yellowCardsList:[],redCards:0})) },
    { id:'mj-0', division:'MUNDIAL JUVENIL', name:'MEXICO J', pj:6, g:4, e:0, p:2, gf:18, gc:11, pts:12, form:['G','G','P','G','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`mj-0-p${j}`,name:`Jugador ${j+1}`,number:j+1,photo:null,position:'MED',ovr:75,yellowCardsList:[],redCards:0})) },
    { id:'mj-1', division:'MUNDIAL JUVENIL', name:'IRAK', pj:7, g:3, e:0, p:4, gf:20, gc:17, pts:9, form:['G','P','P','G','P'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`mj-1-p${j}`,name:`Jugador ${j+1}`,number:j+1,photo:null,position:'MED',ovr:75,yellowCardsList:[],redCards:0})) },
    { id:'cs-0', division:'CONO SUR', name:'ESPAÑA', pj:15, g:14, e:0, p:1, gf:87, gc:38, pts:42, form:['G','G','G','G','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cs-0-p${j}`,name:`Jugador ${j+1}`,number:j+1,photo:null,position:'MED',ovr:75,yellowCardsList:[],redCards:0})) },
    { id:'cs-1', division:'CONO SUR', name:'DINAMARCA', pj:15, g:11, e:1, p:3, gf:56, gc:42, pts:34, form:['G','P','G','G','E'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cs-1-p${j}`,name:`Jugador ${j+1}`,number:j+1,photo:null,position:'MED',ovr:75,yellowCardsList:[],redCards:0})) }
];

const AI_IMAGE_PROMPT = `Transforma esta imagen al siguiente formato: HD 4K, ultra realista cinematográfico, iluminación dramática profesional, colores vibrantes neón con fondo oscuro degradado, estilo de póster deportivo premium. NO modifiques la composición ni el contenido principal. Aplica únicamente mejoras de calidad fotográfica: nitidez extrema, contraste cinematográfico, corrección de color profesional, escalado de alta definición. Mantén todos los elementos clave pero eleva la calidad visual al máximo. Resolución final: 1920x1080 o superior. Acabado limpio sin marcas de agua.`;

const sortTeams = (teams) => [...teams].sort((a,b) => b.pts-a.pts || (b.gf-b.gc)-(a.gf-a.gc) || b.gf-a.gf);

// ==========================================
// 🎨 COMPONENTES UI
// ==========================================
const BackgroundEngine = memo(({ themeColor }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const c = canvasRef.current; const ctx = c.getContext('2d');
        c.width = window.innerWidth; c.height = window.innerHeight;
        const ps = Array.from({length:50}, () => ({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,size:Math.random()*2+0.5}));
        let id;
        const draw = () => {
            ctx.clearRect(0,0,c.width,c.height);
            ps.forEach(p => {
                p.x+=p.vx; p.y+=p.vy;
                if(p.x<0||p.x>c.width) p.vx*=-1;
                if(p.y<0||p.y>c.height) p.vy*=-1;
                ctx.fillStyle=themeColor; ctx.globalAlpha=.3;
                ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
            });
            id=requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(id);
    }, [themeColor]);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40"/>;
});

const AdCarousel = memo(({ ads }) => {
    const [idx, setIdx] = useState(0);
    const [open, setOpen] = useState(true);
    useEffect(() => {
        if (!ads || ads.length <= 1) return;
        const t = setInterval(() => setIdx(i => (i+1) % ads.length), 6000);
        return () => clearInterval(t);
    }, [ads]);
    if (!ads || ads.length === 0) return null;
    return (
        <div className={`w-full transition-all duration-500 ${open ? 'mb-4 mt-2' : 'mb-2'}`}>
            <div className={`w-full rounded-2xl overflow-hidden relative glass-panel border border-cyan-500/20 ${open ? 'h-40 sm:h-52' : 'h-0 border-0'}`}>
                <div className="relative w-full h-full overflow-hidden">
                    {ads.map((ad, i) => (
                        <div key={ad.id} className={`absolute inset-0 transition-all duration-700 ${i===idx?'opacity-100 z-10 scale-100':'opacity-0 z-0 scale-110'}`} onClick={()=>ad.url&&window.open(ad.url,'_blank')}>
                            <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover cursor-pointer" style={i===idx?{animation:'adPanZoom 6s ease-in-out forwards'}:{}}/>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-transparent pointer-events-none"/>
                            {ad.text && <div className="absolute bottom-3 left-3 right-3 glass-panel-heavy px-3 py-2 rounded-xl border border-cyan-500/30 pointer-events-none"><p className="text-white text-xs font-black uppercase tracking-wider">{ad.text}</p></div>}
                            {ad.url && <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1.5 pointer-events-none"><LinkIcon size={10} className="text-cyan-400"/><span className="text-[8px] font-black uppercase text-cyan-400">IR</span></div>}
                        </div>
                    ))}
                </div>
                {ads.length > 1 && (
                    <>
                        <button onClick={() => setIdx(i => (i-1+ads.length)%ads.length)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-400 flex items-center justify-center active:scale-90">
                            <ChevronRight size={16} className="rotate-180"/>
                        </button>
                        <button onClick={() => setIdx(i => (i+1)%ads.length)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-400 flex items-center justify-center active:scale-90">
                            <ChevronRight size={16}/>
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                            {ads.map((_,i) => <button key={i} onClick={()=>setIdx(i)} className={`h-1.5 rounded-full transition-all ${i===idx?'bg-cyan-400 w-5 shadow-[0_0_8px_#06b6d4]':'bg-slate-500/60 w-1.5'}`}/>)}
                        </div>
                    </>
                )}
            </div>
            <button onClick={()=>setOpen(!open)} className="bg-[#020617]/90 border border-cyan-500/30 px-3 py-1 rounded-b-xl text-[9px] text-cyan-400 uppercase font-black tracking-widest mx-auto block">
                {open ? '▲ Ocultar' : '▼ Anuncios'}
            </button>
        </div>
    );
});

const Modal = memo(({ isOpen, onClose, title, icon:Icon, children, maxWidth="max-w-lg" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" onClick={onClose}/>
            <div className={`relative w-full ${maxWidth} glass-panel-heavy rounded-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col border border-cyan-500/30 animate-scale-in`}>
                <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center shrink-0">
                    <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 tracking-widest">
                        <Icon size={18} className="text-cyan-400"/> {title}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-[#020617] border border-cyan-500/20 touch-target"><X size={16}/></button>
                </div>
                <div className="p-4 overflow-y-auto custom-scrollbar bg-[#020617]/40">{children}</div>
            </div>
        </div>
    );
});

const Toast = ({ message, type, isVisible }) => {
    if (!isVisible) return null;
    const colors = { success:'border-emerald-500/50 text-emerald-400', error:'border-rose-500/50 text-rose-400', warning:'border-yellow-500/50 text-yellow-400', info:'border-cyan-500/50 text-cyan-400' };
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-[90vw] animate-fade-in">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-xl bg-[#020617]/90 ${colors[type]||colors.info}`}>
                <span className="font-bold text-xs uppercase tracking-widest text-white">{message}</span>
            </div>
        </div>
    );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={onClose}/>
            <div className="relative w-full max-w-sm glass-panel-heavy rounded-3xl p-6 text-center border-rose-500/40 animate-scale-in">
                <AlertCircle size={32} className="text-rose-500 mx-auto mb-3"/>
                <p className="text-sm text-slate-300 mb-5">{message}</p>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-[#020617] border border-cyan-500/30 text-cyan-400 font-bold py-2.5 rounded-xl text-xs uppercase touch-target">Cancelar</button>
                    <button onClick={()=>{onConfirm();onClose();}} className="flex-1 bg-rose-600/90 text-white font-black py-2.5 rounded-xl text-xs uppercase touch-target">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

const WhoWinsVoting = memo(({ match, onVote, currentVote }) => {
    return (
        <div className="bg-[#020617] border-2 border-amber-500/40 rounded-2xl p-3 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-widest mb-2 flex items-center gap-2 justify-center">
                <Vote size={12}/> ¿QUIÉN GANARÁ?
            </h4>
            <div className="grid grid-cols-3 gap-1.5">
                {[{k:'t1',l:'LCL',c:'emerald'},{k:'draw',l:'EMP',c:'yellow'},{k:'t2',l:'VST',c:'magenta'}].map(({k,l,c}) => (
                    <button key={k} onClick={()=>!currentVote && onVote(k)} disabled={!!currentVote}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase border touch-target transition-all ${
                            currentVote === k ? `bg-${c}-500/30 border-${c}-400 text-${c}-300` :
                            currentVote ? 'bg-[#020617]/50 border-slate-700 text-slate-500' :
                            `bg-[#020617] border-${c}-500/30 text-${c}-300 active:scale-95`
                        }`}>
                        {l}
                    </button>
                ))}
            </div>
            {currentVote && <p className="text-center text-[8px] font-black text-emerald-400 mt-1.5 uppercase tracking-widest">✓ Voto registrado</p>}
        </div>
    );
});

// ==========================================
// 🏠 PANTALLA DE INICIO
// ==========================================
function LandingScreen({ onPublic, onAdmin, onDevMode }) {
    const [showAdmin, setShowAdmin] = useState(false);
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [devPwd, setDevPwd] = useState("");
    const [showDev, setShowDev] = useState(false);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleAdmin = async (e) => {
        e?.preventDefault();
        if (!email || !pwd) { setErr("Completa todos los campos"); setTimeout(() => setErr(""), 2000); return; }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, pwd);
            onAdmin();
        } catch (err) {
            if (err.code === 'auth/invalid-credential') setErr("Credenciales incorrectas");
            else if (err.code === 'auth/user-not-found') setErr("Usuario no existe");
            else if (err.code === 'auth/wrong-password') setErr("Contraseña incorrecta");
            else setErr("Error: " + err.message);
            setLoading(false);
            setTimeout(() => setErr(""), 3000);
        }
    };
    
    const handleDev = (e) => {
        e?.preventDefault();
        if (devPwd === ADMIN_DEV_PASSWORD) {
            onDevMode();
        } else {
            setErr("Clave de pruebas incorrecta");
            setTimeout(() => setErr(""), 2000);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-matriz bg-[#020617] text-white">
            <style dangerouslySetInnerHTML={{__html: DASHBORINO_STYLES}} />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"/>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta-500/20 rounded-full blur-[120px] animate-pulse"/>
            </div>
            <div className="glass-panel-heavy p-6 sm:p-8 rounded-3xl w-full max-w-md border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.3)] z-10 relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70"/>
                
                <div className="flex flex-col items-center mb-6">
                    <label className="w-20 h-20 bg-[#020617] rounded-3xl border-2 border-cyan-500/40 flex items-center justify-center cursor-pointer hover:border-cyan-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] group overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Soccerball.svg/500px-Soccerball.svg.png" alt="Logo" className="w-full h-full object-contain p-3 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"/>
                    </label>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase text-white mt-4 tracking-widest text-center" style={{textShadow:'0 0 20px rgba(6,182,212,0.5)'}}>7KANTERA-CENTER</h1>
                    <p className="text-[10px] font-jetbrains text-cyan-400/80 uppercase mt-1.5 tracking-widest text-center">SISTEMA DE GESTIÓN DEPORTIVA</p>
                    <p className="text-[9px] font-jetbrains text-cyan-500/60 uppercase mt-0.5">Y: Navío • IG: bengocheaivy</p>
                </div>
                
                {/* BOTÓN PRINCIPAL PÚBLICO */}
                <button onClick={onPublic} className="w-full relative overflow-hidden bg-gradient-to-br from-cyan-500 via-cyan-600 to-emerald-500 text-white font-black py-6 sm:py-7 rounded-2xl uppercase tracking-widest text-sm sm:text-base shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 touch-target border-2 border-cyan-400/60 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"/>
                    <div className="relative flex flex-col items-center gap-1.5">
                        <Users size={28}/>
                        <span>ENTRAR COMO FAMILIA7KANTERA</span>
                        <span className="text-[9px] font-jetbrains opacity-80">(PÚBLICO)</span>
                    </div>
                </button>
                
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"/>
                    <span className="text-[8px] font-jetbrains text-cyan-500/40 uppercase tracking-widest">ADMINISTRACIÓN</span>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"/>
                </div>
                
                {/* LOGIN ADMIN (Firebase) */}
                {!showAdmin ? (
                    <button onClick={()=>setShowAdmin(true)} className="w-full bg-[#020617] border border-cyan-500/30 text-cyan-400 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-widest touch-target flex items-center justify-center gap-2">
                        <Lock size={12}/> Acceso Administrador
                    </button>
                ) : (
                    <form onSubmit={handleAdmin} className="flex flex-col gap-2 animate-fade-in">
                        <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} className="bg-[#020617] border border-cyan-500/40 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-cyan-400" placeholder="correo@admin.com" autoFocus/>
                        <input type="password" value={pwd} onChange={e=>{setPwd(e.target.value);setErr("");}} className="bg-[#020617] border border-cyan-500/40 rounded-xl px-4 py-2.5 text-white text-sm text-center tracking-widest outline-none focus:border-cyan-400" placeholder="••••••••"/>
                        {err && <p className="text-rose-400 text-[9px] text-center uppercase">{err}</p>}
                        <button type="submit" disabled={loading} className="bg-cyan-600/90 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase touch-target flex items-center justify-center gap-2">
                            {loading ? <Activity size={12} className="animate-spin"/> : <Key size={12}/>} Acceder
                        </button>
                    </form>
                )}
                
                {/* BOTÓN MODO PRUEBAS (DEV) */}
                <div className="mt-4 pt-3 border-t border-emerald-500/10">
                    {!showDev ? (
                        <button onClick={()=>setShowDev(true)} className="w-full bg-[#020617] border border-emerald-500/30 text-emerald-400 font-bold py-2 rounded-xl text-[9px] uppercase tracking-widest touch-target flex items-center justify-center gap-2 hover:bg-emerald-500/10">
                            <Key size={11}/> Modo Pruebas (DEV)
                        </button>
                    ) : (
                        <form onSubmit={handleDev} className="flex flex-col gap-2 animate-fade-in">
                            <label className="text-[8px] text-emerald-400 uppercase font-black text-center">CLAVE DE PRUEBAS</label>
                            <input type="password" value={devPwd} onChange={e=>{setDevPwd(e.target.value);setErr("");}} className="bg-[#020617] border border-emerald-500/40 rounded-xl px-3 py-2 text-white text-xs text-center tracking-widest outline-none focus:border-emerald-400" placeholder="••••••••" autoFocus/>
                            <button type="submit" className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-[9px] uppercase touch-target flex items-center justify-center gap-2">
                                <Key size={10}/> Entrar Modo DEV
                            </button>
                        </form>
                    )}
                </div>
                
                <div className="mt-5 pt-3 border-t border-cyan-500/10 text-center">
                    <p className="text-[8px] font-jetbrains text-cyan-500/40 uppercase tracking-widest">v6.0 • 7KANTERA OS</p>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 📱 VISTA PÚBLICA
// ==========================================
const PublicView = memo(({ liveMatches, allTeams, getTeamName, leagueSettings, messages, onExit, globalVotes, onVote }) => {
    const [tab, setTab] = useState('home');
    const [div, setDiv] = useState(leagueSettings.divisions[0]?.name || '');
    const [canteraId, setCanteraId] = useState('');
    const myVotes = useMemo(() => JSON.parse(localStorage.getItem('cantera_votes')||'{}'), []);
    
    useEffect(() => {
        const stored = localStorage.getItem('cantera_user_id');
        if (stored) { setCanteraId(stored); return; }
        const id = `CANTERA-${String(Date.now()).slice(-8)}`;
        localStorage.setItem('cantera_user_id', id);
        setCanteraId(id);
    }, []);
    
    const teamsInDiv = allTeams.filter(t => t.division === div).sort((a,b) => b.pts-a.pts);
    const userMsgs = messages.filter(m => m.target==='all' || m.target==='public').slice(0,5);
    
    return (
        <div className="flex-1 flex flex-col w-full relative z-10 text-white">
            <div className="glass-panel border-b border-cyan-500/20 p-3 sticky top-0 z-30 flex justify-between items-center bg-[#020617]/95 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#020617] border border-cyan-500/50 flex items-center justify-center">
                        <User size={18} className="text-cyan-400"/>
                    </div>
                    <div>
                        <h2 className="text-xs sm:text-sm font-black uppercase">FAMILIA 7K</h2>
                        <p className="text-[9px] text-cyan-400 font-jetbrains">{canteraId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {Object.keys(myVotes).length > 0 && (
                        <div className="flex items-center gap-1 bg-[#020617] px-2.5 py-1 rounded-lg border border-amber-500/40">
                            <Flame size={12} className="text-amber-400"/>
                            <span className="text-xs font-black text-amber-400">{Object.keys(myVotes).length}</span>
                        </div>
                    )}
                    <button onClick={onExit} className="text-slate-400 p-2 rounded-lg touch-target"><LogOut size={16}/></button>
                </div>
            </div>
            
            <div className="p-3 flex-1 flex flex-col gap-4">
                <div className="bg-gradient-to-r from-cyan-500/10 via-magenta-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 text-center shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-widest leading-relaxed">
                        <Sparkles size={12} className="inline text-cyan-400"/>
                        PREPÁRATE PARA LA NUEVA ERA DE SER ESPECTADOR
                        <br/><span className="text-cyan-400" style={{textShadow:'0 0 10px rgba(6,182,212,0.5)'}}>BIENVENIDO A 7-KANTERA</span>
                        <br/><span className="text-[10px] text-magenta-400 font-jetbrains">DONDE EL FUTURO ES HOY</span>
                    </p>
                </div>
                
                <AdCarousel ads={leagueSettings.ads}/>
                
                {userMsgs.length > 0 && (
                    <div className="flex overflow-x-auto snap-x custom-scrollbar gap-2 -mx-3 px-3 pb-2">
                        {userMsgs.map(msg => (
                            <div key={msg.id} className="snap-center shrink-0 w-[80vw] max-w-[320px] glass-panel border border-cyan-500/30 rounded-2xl overflow-hidden">
                                {msg.type==='image' && msg.content && <img src={msg.content} className="w-full aspect-video object-cover" alt=""/>}
                                {msg.text && <p className="p-3 text-sm text-white">{msg.text}</p>}
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="flex bg-[#020617] border border-cyan-500/20 rounded-xl p-1 sticky top-2 z-40">
                    <button onClick={()=>setTab('home')} className={`flex-1 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase flex items-center justify-center gap-1.5 ${tab==='home'?'bg-cyan-600/90 text-white':'text-cyan-600'}`}><Activity size={14}/> Resumen</button>
                    <button onClick={()=>setTab('votar')} className={`flex-1 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase flex items-center justify-center gap-1.5 ${tab==='votar'?'bg-amber-600/90 text-white':'text-amber-500'}`}><Vote size={14}/> Votar</button>
                </div>
                
                {tab === 'home' && (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-black uppercase text-white border-b border-cyan-500/20 pb-2 flex items-center gap-2">
                            <Activity size={14} className="text-cyan-500"/> Partidos
                        </h3>
                        {liveMatches.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-xs bg-[#020617] rounded-xl border border-dashed border-cyan-500/20">No hay partidos activos</div>
                        ) : liveMatches.map(m => {
                            const myVote = myVotes[m.id];
                            return (
                                <div key={m.id} className={`bg-[#020617] rounded-xl p-3 border ${m.status==='live'?'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]':'border-cyan-500/10'}`}>
                                    <div className="flex justify-between items-center text-[9px] mb-2">
                                        <span className={`flex items-center gap-1.5 font-black uppercase ${m.status==='live'?'text-cyan-400':'text-slate-400'}`}>
                                            {m.status==='live' ? <><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"/> VIVO</> : <>○ PRG</>}
                                        </span>
                                        <span className="text-cyan-500/70 font-jetbrains">{m.date}</span>
                                    </div>
                                    <div className="text-sm font-black text-center mb-2 truncate">
                                        {getTeamName(m.t1Id)} <span className="text-cyan-500/50 mx-2 text-[10px]">vs</span> {getTeamName(m.t2Id)}
                                    </div>
                                    {m.status==='live' ? (
                                        <div className="flex justify-center items-center gap-4 bg-[#020617] py-3 rounded-lg border border-cyan-500/20">
                                            <div className="text-3xl font-black text-cyan-400 font-jetbrains">{m.g1}</div>
                                            <div className="text-xs text-slate-500">-</div>
                                            <div className="text-3xl font-black text-rose-400 font-jetbrains">{m.g2}</div>
                                        </div>
                                    ) : (
                                        <WhoWinsVoting match={m} currentVote={myVote} onVote={(w)=>onVote(m.id, w)}/>
                                    )}
                                </div>
                            );
                        })}
                        
                        <div className="mt-4">
                            <div className="flex overflow-x-auto custom-scrollbar gap-1.5 pb-2 mb-2">
                                {leagueSettings.divisions.map(d => (
                                    <button key={d.id} onClick={()=>setDiv(d.name)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shrink-0 ${div===d.name?'bg-cyan-600/80 text-white':'bg-[#020617] text-cyan-500 border border-cyan-500/20'}`}>
                                        {d.name}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-[#020617] rounded-xl border border-cyan-500/20 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[600px] text-[10px]">
                                        <thead><tr className="text-[8px] text-cyan-600 uppercase border-b border-cyan-500/20 bg-[#020617]/50">
                                            {['#','Club','PJ','G','E','P','GF','GC','PTS'].map((h,i)=><th key={h} className={`p-1.5 ${i>0?'text-center':''}`}>{h}</th>)}
                                        </tr></thead>
                                        <tbody className="font-jetbrains">
                                            {teamsInDiv.map((t,i) => (
                                                <tr key={t.id} className="border-b border-cyan-500/10">
                                                    <td className="p-1.5 text-center text-slate-500 text-[9px]">{i+1}</td>
                                                    <td className="p-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 rounded bg-[#020617] border border-cyan-500/20 p-0.5 shrink-0"><img src={getSafeLogo(t)} className="w-full h-full object-contain" alt=""/></div>
                                                            <span className="text-white text-[10px] font-bold truncate">{t.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-1.5 text-center text-cyan-400">{t.pj}</td>
                                                    <td className="p-1.5 text-center text-emerald-400">{t.g}</td>
                                                    <td className="p-1.5 text-center text-slate-400">{t.e}</td>
                                                    <td className="p-1.5 text-center text-rose-400">{t.p}</td>
                                                    <td className="p-1.5 text-center text-emerald-400">{t.gf}</td>
                                                    <td className="p-1.5 text-center text-rose-400">{t.gc}</td>
                                                    <td className="p-1.5 text-center font-black text-emerald-400 text-sm">{t.pts}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {tab === 'votar' && (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-black uppercase text-amber-400 border-b border-amber-500/30 pb-2 flex items-center gap-2">
                            <Crown size={14}/> Ranking de Votaciones
                        </h3>
                        {liveMatches.length === 0 ? (
                            <p className="text-center text-slate-500 text-xs py-4">Sin partidos para votar</p>
                        ) : liveMatches.map(m => {
                            const v = globalVotes[m.id] || {t1:0,draw:0,t2:0};
                            const total = Math.max(1, v.t1+v.draw+v.t2);
                            return (
                                <div key={m.id} className="bg-[#020617] border border-amber-500/30 rounded-xl p-3">
                                    <div className="text-[10px] font-black text-white text-center mb-2 truncate">
                                        {getTeamName(m.t1Id)} <span className="text-slate-500 mx-1">vs</span> {getTeamName(m.t2Id)}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        {[{k:'t1',l:'LOCAL',c:'emerald',n:v.t1},{k:'draw',l:'EMPATE',c:'yellow',n:v.draw},{k:'t2',l:'VISITA',c:'magenta',n:v.t2}].map(({k,l,c,n})=>(
                                            <div key={k}>
                                                <div className={`text-sm font-black text-${c}-400`}>{n}</div>
                                                <div className="h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                    <div className={`h-full bg-${c}-500`} style={{width:`${(n/total)*100}%`}}/>
                                                </div>
                                                <div className={`text-[8px] font-black text-${c}-400/70 uppercase mt-0.5`}>{l}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        
                        <div className="bg-gradient-to-br from-amber-500/10 to-magenta-500/10 border border-amber-500/40 rounded-2xl p-3 mt-2">
                            <h4 className="text-xs font-black uppercase text-amber-400 mb-2 flex items-center gap-2"><Flame size={12}/> Mi Racha</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-[#020617] p-2 rounded-lg border border-amber-500/30 text-center">
                                    <div className="text-xl font-black text-amber-400 font-jetbrains" style={{textShadow:'0 0 8px rgba(245,158,11,0.5)'}}>{Object.keys(myVotes).length}</div>
                                    <div className="text-[8px] text-amber-300/70 uppercase font-black tracking-widest">Votos</div>
                                </div>
                                <div className="bg-[#020617] p-2 rounded-lg border border-emerald-500/30 text-center">
                                    <div className="text-xl font-black text-emerald-400 font-jetbrains" style={{textShadow:'0 0 8px rgba(16,185,129,0.5)'}}>{canteraId.split('-')[1]||'000'}</div>
                                    <div className="text-[8px] text-emerald-300/70 uppercase font-black tracking-widest">Tu ID</div>
                                </div>
                            </div>
                            <p className="text-[8px] text-amber-300/60 mt-2 text-center font-jetbrains">✅ +1 PT • ❌ No resta • Racha suma bonus</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

// ==========================================
// 🎛️ VISTA ADMIN
// ==========================================
const AdminView = memo(({ 
    teams, setTeams, liveMatches, setLiveMatches, leagueSettings, setLeagueSettings,
    agendaData, setAgendaData, activeDivision, setActiveDivision, isEditingTable, setIsEditingTable,
    newReminder, setNewReminder, showToast, requireConfirm, allTeams, getTeamName, onLogout, isDevMode
}) => {
    const [tab, setTab] = useState('dashboard');
    const [calendar, setCalendar] = useState([{id:Date.now(),t1Id:'',t2Id:'',date:'',time:''}]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    
    const visibleTeams = sortTeams(teams.filter(t => t.division === activeDivision));
    const teamSelected = selectedTeam ? teams.find(t => t.id === selectedTeam) : null;
    const playerCtx = selectedPlayer ? {team: teams.find(t => t.id === selectedPlayer.tId), player: teams.find(t => t.id === selectedPlayer.tId)?.players.find(p => p.id === selectedPlayer.pId)} : null;
    
    const updateTeam = (id, field, value) => setTeams(teams.map(t => t.id===id ? {...t, [field]: value} : t));
    const updateTeamNum = (id, field, value) => setTeams(teams.map(t => { if (t.id!==id) return t; const n = {...t, [field]: Number(value)||0}; if (['g','e'].includes(field)) n.pts = (n.g*3)+n.e; return n; }));
    const removeTeam = (id) => requireConfirm('¿Eliminar equipo?', () => { setTeams(teams.filter(t => t.id !== id)); showToast("Eliminado","success"); });
    const addDiv = () => setLeagueSettings({...leagueSettings, divisions:[...leagueSettings.divisions, {id:`d${Date.now()}`, name:`División ${leagueSettings.divisions.length+1}`, hex:'#06b6d4'}]});
    const removeAd = (id) => requireConfirm('¿Eliminar anuncio?', () => setLeagueSettings({...leagueSettings, ads:leagueSettings.ads.filter(a => a.id!==id)}));
    const updateAd = (id, field, value) => setLeagueSettings({...leagueSettings, ads:leagueSettings.ads.map(a => a.id===id ? {...a, [field]:value} : a)});
    
    const addCalendarRow = () => setCalendar([...calendar, {id:Date.now(),t1Id:'',t2Id:'',date:'',time:''}]);
    const updateCalendar = (id, field, value) => setCalendar(calendar.map(m => m.id===id ? {...m, [field]:value} : m));
    const programMatch = () => {
        const valid = calendar.filter(m => m.t1Id && m.t2Id && m.t1Id !== m.t2Id);
        if (!valid.length) return showToast("Añade enfrentamiento válido","error");
        setLiveMatches([...liveMatches, ...valid.map(m => ({...m, id:`lm-${Date.now()}-${Math.random()}`, status:'scheduled', g1:0, g2:0}))]);
        setCalendar([{id:Date.now(),t1Id:'',t2Id:'',date:'',time:''}]);
        showToast(`${valid.length} partido(s) programado(s)`,"success");
    };
    const startMatch = (id) => { setLiveMatches(liveMatches.map(m => m.id===id ? {...m, status:'live'} : m)); showToast("¡En vivo!","info"); };
    const updateLive = (id, field, value) => setLiveMatches(liveMatches.map(m => m.id===id ? {...m, [field]:value} : m));
    const finishMatch = (match) => {
        const g1 = Number(match.g1)||0, g2 = Number(match.g2)||0;
        const pts1 = g1>g2?3:g1===g2?1:0, pts2 = g2>g1?3:g1===g2?1:0;
        setTeams(teams.map(t => {
            if (t.id === match.t1Id) return {...t, pj:t.pj+1, g:t.g+(g1>g2?1:0), e:t.e+(g1===g2?1:0), p:t.p+(g1<g2?1:0), gf:t.gf+g1, gc:t.gc+g2, pts:t.pts+pts1, form:[g1>g2?'G':g1<g2?'P':'E', ...t.form].slice(0,5)};
            if (t.id === match.t2Id) return {...t, pj:t.pj+1, g:t.g+(g2>g1?1:0), e:t.e+(g1===g2?1:0), p:t.p+(g2<g1?1:0), gf:t.gf+g2, gc:t.gc+g1, pts:t.pts+pts2, form:[g2>g1?'G':g2<g1?'P':'E', ...t.form].slice(0,5)};
            return t;
        }));
        setLiveMatches(liveMatches.filter(m => m.id !== match.id));
        showToast("Partido finalizado y registrado","success");
    };
    const removeLive = (id) => requireConfirm('¿Cancelar partido?', () => setLiveMatches(liveMatches.filter(m => m.id !== id)));
    
    const updatePlayer = (tId, pId, field, value) => setTeams(teams.map(t => t.id===tId ? {...t, players:t.players.map(p => p.id===pId ? {...p, [field]:value} : p)} : t));
    const updateCard = (tId, pId, type, value) => setTeams(teams.map(t => t.id===tId ? {...t, players:t.players.map(p => {
        if (p.id !== pId) return p;
        if (type==='yellow') { let l = [...(p.yellowCardsList||[])], s = p.dynamicScore||70; if(value==='add'){l.push(Date.now());s=Math.max(0,s-2);} else if(l.length){l.pop();s=Math.min(100,s+2);} return {...p, yellowCardsList:l, dynamicScore:s}; }
        if (type==='red') { let r = p.redCards||0, s = p.dynamicScore||70; if(value==='add'){r++;s=Math.max(0,s-10);return {...p, redCards:r, dynamicScore:s};} if(value==='sub'){r=Math.max(0,r-1);s=Math.min(100,s+10);return {...p, redCards:r, dynamicScore:s};} }
        return p;
    })} : t));
    const removePlayer = (tId, pId) => requireConfirm('¿Eliminar jugador?', () => setTeams(teams.map(t => t.id===tId ? {...t, players:t.players.filter(p => p.id!==pId)} : t)));
    
    const addReminder = (e) => { e.preventDefault(); if(newReminder.trim()){setAgendaData({...agendaData, reminders:[{id:Date.now(),text:newReminder,completed:false},...(agendaData.reminders||[])]}); setNewReminder(''); showToast("Nota agregada","success");}};
    const toggleReminder = (id) => setAgendaData({...agendaData, reminders:agendaData.reminders.map(r => r.id===id ? {...r, completed:!r.completed} : r)}));
    const deleteReminder = (id) => setAgendaData({...agendaData, reminders:agendaData.reminders.filter(r => r.id!==id)}));
    
    const sendBroadcast = (target) => {
        const text = prompt("Mensaje para enviar:");
        if (!text) return;
        setMessages(p => [{id:Date.now(), type:'text', content:'', text, target, timestamp:Date.now()}, ...(p||[])].slice(0,20));
        showToast("Mensaje enviado","success");
    };
    
    const handleAddTeam = () => {
        setTeams([...teams, {id:`${activeDivision}-${Date.now()}`, division:activeDivision, name:'NUEVO EQ', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0,form:['-','-','-','-','-'],customLogo:null,players:[]}]);
        showToast("Equipo añadido","success");
    };
    const handleAddAd = async (e) => {
        if (e.target.files[0]) {
            showToast("Subiendo imagen...","info");
            try {
                const compressed = await compressImage(e.target.files[0], 1200, 0.7);
                const url = await uploadToImgBB(compressed);
                setLeagueSettings({...leagueSettings, ads: [...(leagueSettings.ads||[]), {id:Date.now(), imageUrl:url, text:'', url:''}]});
                showToast("Imagen añadida","success");
            } catch(err) { showToast("Error al subir","error"); }
        }
    };
    const handleExportTable = () => {
        const teamsInDiv = sortTeams(teams.filter(t => t.division === activeDivision));
        const data = { type:'7kantera_table_export', version:'6.0', division:activeDivision, exportDate:new Date().toISOString(), teams:teamsInDiv };
        const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href=url; a.download=`7kantera_${activeDivision.replace(/\s+/g,'_')}.json`; a.click();
        showToast("Tabla exportada","success");
    };
    const handleImportTable = (e) => {
        const file = e.target.files[0]; if(!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.type !== '7kantera_table_export') throw new Error('Tipo inválido');
                setTeams([...teams.filter(t=>t.division!==data.division), ...data.teams.map(t=>({...t,id:`${data.division}-imp-${Date.now()}-${Math.random()}`,division:data.division,form:['-','-','-','-','-'],players:[]}))]);
                showToast(`Importados ${data.teams.length} equipos`,"success");
            } catch(err) { showToast("Archivo inválido","error"); }
        };
        reader.readAsText(file);
    };
    const copyAIPrompt = () => {
        navigator.clipboard.writeText(AI_IMAGE_PROMPT).then(() => showToast("¡Prompt copiado!","success")).catch(() => showToast("No se pudo copiar","error"));
    };
    const handleAddPlayer = (tId) => {
        setTeams(teams.map(t => t.id===tId ? {...t, players:[...t.players, {id:`p-${Date.now()}`,name:'Nuevo Jugador',number:t.players.length?Math.max(...t.players.map(x=>x.number))+1:1,photo:null,position:'MED',ovr:75,yellowCardsList:[],redCards:0}]} : t));
        showToast("Jugador añadido","success");
    };
    const handlePlayerPhoto = async (tId, pId, file) => {
        showToast("Subiendo foto...","info");
        try {
            const compressed = await compressImage(file, 400, 0.7);
            const url = await uploadToImgBB(compressed);
            setTeams(teams.map(t => t.id===tId ? {...t, players:t.players.map(p => p.id===pId ? {...p, photo:url} : p)} : t));
            showToast("Foto guardada","success");
        } catch(err) { showToast("Error","error"); }
    };
    const handleTeamLogo = async (tId, file) => {
        showToast("Subiendo emblema...","info");
        try {
            const compressed = await compressImage(file, 250, 0.8);
            const url = await uploadToImgBB(compressed);
            setTeams(teams.map(t => t.id===tId ? {...t, customLogo:url} : t));
            showToast("Emblema actualizado","success");
        } catch(err) { showToast("Error","error"); }
    };
    const handleUpdateLogoApp = async (file) => {
        showToast("Subiendo logo...","info");
        try {
            const compressed = await compressImage(file, 400, 0.8);
            const url = await uploadToImgBB(compressed);
            setLeagueSettings({...leagueSettings, customLogo:url});
            showToast("Logo actualizado","success");
        } catch(err) { showToast("Error","error"); }
    };
    
    return (
        <div className="flex-1 flex flex-col w-full relative z-10 pb-24">
            <div className="w-full max-w-4xl mx-auto p-3 sm:p-4 flex flex-col gap-4">
                <div className="glass-panel p-3 rounded-2xl flex justify-between items-center sticky top-0 z-50 bg-[#020617]/95">
                    <div className="flex items-center gap-2">
                        {leagueSettings.customLogo ? <img src={leagueSettings.customLogo} className="w-8 h-8 object-contain"/> : <Shield size={16} className="text-cyan-400"/>}
                        <span className="text-xs font-black text-cyan-400 uppercase font-jetbrains">{tab}</span>
                        {isDevMode && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">DEV</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-400 uppercase hidden sm:block">7KANTERA ADMIN</span>
                        <button onClick={onLogout} className="text-slate-400 hover:text-rose-400 p-2 rounded-lg touch-target"><LogOut size={16}/></button>
                    </div>
                </div>
                
                {tab === 'dashboard' && (
                    <div className="flex flex-col gap-3">
                        <AdCarousel ads={leagueSettings.ads}/>
                        
                        <div className="bg-[#020617] border border-cyan-500/30 rounded-2xl p-3">
                            <h3 className="text-xs font-black text-white uppercase mb-3 flex items-center gap-2"><Activity size={14} className="text-cyan-400"/> Partidos</h3>
                            
                            <div className="flex flex-col gap-1.5 mb-3 pb-3 border-b border-cyan-500/20">
                                <span className="text-[9px] text-cyan-400 uppercase font-black">Programar nuevo:</span>
                                {calendar.map(m => (
                                    <div key={m.id} className="flex gap-1 items-center">
                                        <select value={m.t1Id} onChange={e=>updateCalendar(m.id, 't1Id', e.target.value)} className="flex-1 bg-[#020617] border border-cyan-500/20 rounded p-1.5 text-white text-[10px]">
                                            <option value="">Local</option>
                                            {allTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <span className="text-[9px] text-cyan-500">vs</span>
                                        <select value={m.t2Id} onChange={e=>updateCalendar(m.id, 't2Id', e.target.value)} className="flex-1 bg-[#020617] border border-cyan-500/20 rounded p-1.5 text-white text-[10px]">
                                            <option value="">Visita</option>
                                            {allTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <input type="date" value={m.date} onChange={e=>updateCalendar(m.id, 'date', e.target.value)} className="bg-[#020617] border border-cyan-500/20 rounded p-1.5 text-white text-[10px] w-28"/>
                                        <input type="time" value={m.time} onChange={e=>updateCalendar(m.id, 'time', e.target.value)} className="bg-[#020617] border border-cyan-500/20 rounded p-1.5 text-white text-[10px] w-20"/>
                                        <button onClick={()=>setCalendar(calendar.filter(x=>x.id!==m.id))} className="text-rose-500 p-1"><X size={12}/></button>
                                    </div>
                                ))}
                                <div className="flex gap-1">
                                    <button onClick={addCalendarRow} className="flex-1 bg-[#020617] border border-cyan-500/30 text-cyan-400 py-1.5 rounded text-[10px] font-bold uppercase">+ Cruce</button>
                                    <button onClick={programMatch} className="flex-1 bg-cyan-600/90 text-white py-1.5 rounded text-[10px] font-black uppercase">Programar</button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {liveMatches.length === 0 ? (
                                    <div className="col-span-full text-center text-slate-500 text-xs py-4">Sin partidos activos</div>
                                ) : liveMatches.map(m => (
                                    <div key={m.id} className={`bg-[#020617] rounded-xl p-2.5 border ${m.status==='live'?'border-cyan-500/50':'border-cyan-500/20'}`}>
                                        <div className="flex justify-between items-center text-[9px] mb-2">
                                            <span className={m.status==='live'?'text-cyan-400 font-black':'text-slate-400'}>{m.status==='live'?'● VIVO':'○ PROG'}</span>
                                            <button onClick={()=>removeLive(m.id)} className="text-rose-500"><X size={12}/></button>
                                        </div>
                                        <div className="text-[10px] font-black text-center mb-2 truncate">{getTeamName(m.t1Id)} vs {getTeamName(m.t2Id)}</div>
                                        {m.status==='live' ? (
                                            <div className="flex gap-1 items-center justify-center">
                                                <input type="number" value={m.g1} onChange={e=>updateLive(m.id,'g1',e.target.value)} className="w-10 bg-[#020617] border border-cyan-500/20 rounded text-center text-cyan-400 font-black text-lg p-1"/>
                                                <span className="text-slate-500">-</span>
                                                <input type="number" value={m.g2} onChange={e=>updateLive(m.id,'g2',e.target.value)} className="w-10 bg-[#020617] border border-cyan-500/20 rounded text-center text-rose-400 font-black text-lg p-1"/>
                                                <button onClick={()=>finishMatch(m)} className="ml-2 bg-emerald-600/90 text-white px-2 py-1 rounded text-[9px] font-black uppercase">Fin</button>
                                            </div>
                                        ) : (
                                            <button onClick={()=>startMatch(m.id)} className="w-full bg-cyan-600/90 text-white py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center gap-1"><Play size={10}/> Iniciar</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-[#020617] rounded-2xl border border-cyan-500/30 overflow-hidden">
                            <div className="p-3 border-b border-cyan-500/20 flex justify-between items-center flex-wrap gap-2">
                                <h3 className="text-xs font-black text-white uppercase flex items-center gap-2"><List size={14} className="text-cyan-400"/> Tabla {activeDivision}</h3>
                                <div className="flex gap-1.5">
                                    {isEditingTable && <button onClick={handleAddTeam} className="px-2 py-1 bg-magenta-500/20 text-magenta-400 border border-magenta-500/50 rounded text-[9px] font-bold uppercase touch-target"><Plus size={10}/> Equipo</button>}
                                    <button onClick={()=>setIsEditingTable(!isEditingTable)} className={`px-2 py-1 rounded text-[9px] font-bold uppercase touch-target ${isEditingTable?'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50':'bg-[#020617] text-cyan-400 border border-cyan-500/30'}`}>
                                        {isEditingTable?'Guardar':'Editar'}
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[700px] text-[10px]">
                                    <thead><tr className="text-[8px] text-cyan-600 uppercase border-b border-cyan-500/20 bg-[#020617]/50">
                                        {['#','Club','PJ','G','E','P','GF','GC','DIF','PTS'].map((h,i)=><th key={h} className={`p-1.5 ${i>0?'text-center':''}`}>{h}</th>)}
                                    </tr></thead>
                                    <tbody className="font-jetbrains">
                                        {visibleTeams.map((t,i) => {
                                            const dif = t.gf - t.gc;
                                            return (
                                                <tr key={t.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5">
                                                    <td className="p-1.5 text-center text-slate-500 text-[9px]">{i+1}</td>
                                                    <td className="p-1.5 cursor-pointer" onClick={()=>!isEditingTable && setSelectedTeam(t.id)}>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-6 h-6 rounded bg-[#020617] border border-cyan-500/20 p-0.5 shrink-0"><img src={getSafeLogo(t)} className="w-full h-full object-contain" alt=""/></div>
                                                            {isEditingTable ? (
                                                                <div className="flex items-center gap-1 w-full">
                                                                    <input type="text" defaultValue={t.name} onBlur={e=>updateTeam(t.id,'name',e.target.value.toUpperCase())} className="bg-[#020617] border border-cyan-500/30 rounded px-1.5 py-0.5 text-white text-[9px] w-full"/>
                                                                    <button onClick={()=>removeTeam(t.id)} className="text-rose-500"><X size={10}/></button>
                                                                </div>
                                                            ) : <span className="text-white text-[10px] font-bold truncate">{t.name}</span>}
                                                        </div>
                                                    </td>
                                                    {['pj','g','e','p','gf','gc'].map(f=>(
                                                        <td key={f} className="p-1.5 text-center">
                                                            {isEditingTable ? <input type="number" defaultValue={t[f]} onBlur={e=>updateTeamNum(t.id,f,e.target.value)} className="w-8 bg-[#020617] border border-cyan-500/20 rounded text-center text-[9px] py-0.5"/> : <span className={f==='g'||f==='gf'?'text-emerald-400':f==='p'||f==='gc'?'text-rose-400':'text-cyan-400'}>{t[f]}</span>}
                                                        </td>
                                                    ))}
                                                    <td className="p-1.5 text-center text-cyan-400 text-[9px]">{dif>0?`+${dif}`:dif}</td>
                                                    <td className="p-1.5 text-center font-black text-emerald-400">{t.pts}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-3 border-t border-cyan-500/20 flex gap-2 justify-end">
                                <button onClick={handleExportTable} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-[9px] font-black uppercase touch-target">
                                    <FileDown size={12}/> Exportar
                                </button>
                                <label className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg text-[9px] font-black uppercase cursor-pointer touch-target">
                                    <FileUp size={12}/> Importar
                                    <input type="file" accept=".json" className="hidden" onChange={handleImportTable}/>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
                
                {tab === 'config' && (
                    <div className="flex flex-col gap-3">
                        <div className="bg-[#020617] border border-yellow-500/30 rounded-2xl p-4">
                            <h3 className="text-sm font-black text-white uppercase mb-3 flex items-center gap-2"><Megaphone size={14} className="text-yellow-400"/> Carrusel Publicitario</h3>
                            <div className="flex gap-2 mb-3 flex-wrap">
                                <button onClick={copyAIPrompt} className="bg-[#020617] text-yellow-400 border border-yellow-500/50 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 touch-target">
                                    <Copy size={10}/> Copiar Prompt IA HD 4K
                                </button>
                                <label className="bg-[#020617] text-yellow-400 border border-yellow-500/50 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer touch-target">
                                    <Upload size={10}/> Añadir Imagen
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAddAd}/>
                                </label>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {(leagueSettings.ads||[]).map((ad,i) => (
                                    <div key={ad.id} className="flex gap-2 bg-[#020617]/50 p-2 rounded-lg items-center">
                                        <img src={ad.imageUrl} className="w-16 h-10 object-cover rounded border border-yellow-500/30"/>
                                        <input type="text" value={ad.text||''} onChange={e=>updateAd(ad.id,'text',e.target.value)} placeholder="Texto..." className="flex-1 bg-[#020617] border border-yellow-500/30 rounded px-2 py-1 text-white text-[10px]"/>
                                        <input type="text" value={ad.url||''} onChange={e=>updateAd(ad.id,'url',e.target.value)} placeholder="URL..." className="flex-1 bg-[#020617] border border-yellow-500/30 rounded px-2 py-1 text-white text-[10px]"/>
                                        <button onClick={()=>removeAd(ad.id)} className="text-rose-500 p-1 touch-target"><Trash2 size={12}/></button>
                                    </div>
                                ))}
                                {(!leagueSettings.ads || leagueSettings.ads.length===0) && <p className="text-center text-slate-500 text-xs py-3">Sin anuncios</p>}
                            </div>
                        </div>
                        
                        <div className="bg-[#020617] border border-cyan-500/30 rounded-2xl p-4">
                            <h3 className="text-sm font-black text-white uppercase mb-3 flex items-center gap-2"><Settings size={14} className="text-cyan-400"/> Liga</h3>
                            <div className="space-y-2">
                                <input type="text" value={leagueSettings.leagueName} onChange={e=>setLeagueSettings({...leagueSettings, leagueName:e.target.value})} className="w-full bg-[#020617] border border-cyan-500/30 rounded-lg px-3 py-2 text-white text-sm font-bold uppercase"/>
                                <input type="text" value={leagueSettings.leagueSubtitle} onChange={e=>setLeagueSettings({...leagueSettings, leagueSubtitle:e.target.value})} className="w-full bg-[#020617] border border-cyan-500/30 rounded-lg px-3 py-2 text-white text-xs uppercase"/>
                                <div className="flex items-center gap-2">
                                    {leagueSettings.customLogo && <img src={leagueSettings.customLogo} className="w-12 h-12 object-contain bg-[#020617] rounded border border-cyan-500/30 p-1"/>}
                                    <label className="flex-1 bg-[#020617] border border-cyan-500/30 px-3 py-2 rounded-lg text-[10px] text-cyan-400 font-black uppercase text-center cursor-pointer touch-target">
                                        <Upload size={12} className="inline mr-1"/> Logo Liga
                                        <input type="file" accept="image/*" className="hidden" onChange={e=>e.target.files[0] && handleUpdateLogoApp(e.target.files[0])}/>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-[#020617] border border-blue-500/30 rounded-2xl p-4">
                            <h3 className="text-sm font-black text-white uppercase mb-3 flex items-center gap-2"><LayoutGrid size={14} className="text-blue-400"/> Divisiones</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {leagueSettings.divisions.map(d => (
                                    <div key={d.id} className="flex gap-2 items-center bg-[#020617]/50 p-2 rounded-lg">
                                        <input type="color" value={d.hex} onChange={e=>setLeagueSettings({...leagueSettings, divisions:leagueSettings.divisions.map(x=>x.id===d.id?{...x,hex:e.target.value}:x)})} className="w-8 h-8 rounded cursor-pointer shrink-0"/>
                                        <input type="text" defaultValue={d.name} onBlur={e=>setLeagueSettings({...leagueSettings, divisions:leagueSettings.divisions.map(x=>x.id===d.id?{...x,name:e.target.value}:x)})} className="flex-1 bg-transparent text-white text-xs font-bold uppercase"/>
                                        <button onClick={()=>requireConfirm('¿Eliminar?', ()=>setLeagueSettings({...leagueSettings, divisions:leagueSettings.divisions.filter(x=>x.id!==d.id)}))} className="text-rose-500 p-1 touch-target"><Trash2 size={12}/></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addDiv} className="w-full mt-2 bg-[#020617] border border-blue-500/30 text-blue-400 py-2 rounded-lg text-[10px] font-black uppercase touch-target">+ Añadir División</button>
                        </div>
                        
                        <div className="bg-[#020617] border border-emerald-500/30 rounded-2xl p-4">
                            <h3 className="text-sm font-black text-white uppercase mb-3 flex items-center gap-2"><Send size={14} className="text-emerald-400"/> Enviar Mensaje</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={()=>sendBroadcast('all')} className="bg-emerald-600/90 text-white py-2 rounded-lg text-[10px] font-black uppercase touch-target">A Todos</button>
                                <button onClick={()=>sendBroadcast('public')} className="bg-cyan-600/90 text-white py-2 rounded-lg text-[10px] font-black uppercase touch-target">A Público</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {tab === 'notas' && (
                    <div className="bg-[#020617] border border-purple-500/30 rounded-2xl p-4">
                        <h3 className="text-sm font-black text-white uppercase mb-3">📝 Notas</h3>
                        <form onSubmit={addReminder} className="flex gap-2 mb-3">
                            <input type="text" value={newReminder} onChange={e=>setNewReminder(e.target.value)} placeholder="Nueva nota..." className="flex-1 bg-[#020617] border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm"/>
                            <button type="submit" className="bg-purple-600/90 text-white px-3 rounded-lg touch-target"><Plus size={16}/></button>
                        </form>
                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                            {(agendaData.reminders||[]).map(r => (
                                <div key={r.id} className="flex items-center gap-2 bg-[#020617]/50 p-2 rounded-lg">
                                    <button onClick={()=>toggleReminder(r.id)} className={r.completed?'text-purple-500':'text-slate-600'}><CheckCircle size={14}/></button>
                                    <span className={`flex-1 text-sm ${r.completed?'line-through text-slate-500':'text-white'}`}>{r.text}</span>
                                    <button onClick={()=>deleteReminder(r.id)} className="text-rose-500 p-1 touch-target"><Trash2 size={12}/></button>
                                </div>
                            ))}
                            {(!agendaData.reminders || !agendaData.reminders.length) && <p className="text-center text-slate-500 text-xs py-3">Sin notas</p>}
                        </div>
                    </div>
                )}
            </div>
            
            <Modal isOpen={!!teamSelected} onClose={()=>setSelectedTeam(null)} title={teamSelected?.name||"Plantilla"} icon={Users} maxWidth="max-w-3xl">
                {teamSelected && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-20 h-20 bg-[#020617] rounded-xl border border-cyan-500/30 p-2">
                                <img src={getSafeLogo(teamSelected, leagueSettings.divisions)} className="w-full h-full object-contain" alt=""/>
                            </div>
                            <div className="flex-1">
                                <div className="grid grid-cols-4 gap-1.5 text-center">
                                    <div className="bg-[#020617] p-1.5 rounded"><div className="text-base font-black text-white">{teamSelected.pj}</div><div className="text-[8px] text-cyan-500">PJ</div></div>
                                    <div className="bg-[#020617] p-1.5 rounded"><div className="text-base font-black text-emerald-400">{teamSelected.g}</div><div className="text-[8px] text-cyan-500">G</div></div>
                                    <div className="bg-[#020617] p-1.5 rounded"><div className="text-base font-black text-cyan-400">{teamSelected.gf}</div><div className="text-[8px] text-cyan-500">GF</div></div>
                                    <div className="bg-[#020617] p-1.5 rounded"><div className="text-base font-black text-yellow-400">{teamSelected.pts}</div><div className="text-[8px] text-yellow-500">PTS</div></div>
                                </div>
                            </div>
                            <label className="bg-[#020617] border border-cyan-500/30 text-cyan-400 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase cursor-pointer touch-target">
                                <Upload size={10} className="inline mr-1"/> Logo
                                <input type="file" accept="image/*" className="hidden" onChange={e=>e.target.files[0] && handleTeamLogo(teamSelected.id, e.target.files[0])}/>
                            </label>
                        </div>
                        <button onClick={()=>handleAddPlayer(teamSelected.id)} className="w-full bg-[#020617] border border-cyan-500/30 text-cyan-400 py-2 rounded-lg text-[10px] font-black uppercase touch-target flex items-center justify-center gap-1"><UserPlus size={12}/> Añadir Jugador</button>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {(teamSelected.players||[]).map(p => (
                                <div key={p.id} onClick={()=>setSelectedPlayer({tId:teamSelected.id, pId:p.id})} className="bg-[#020617] border border-cyan-500/20 rounded-xl p-2 cursor-pointer hover:border-cyan-500/60">
                                    <div className="w-12 h-12 mx-auto rounded-full overflow-hidden bg-[#020617] border border-cyan-500/30 mb-1.5">
                                        {p.photo ? <img src={p.photo} className="w-full h-full object-cover" alt=""/> : <User size={20} className="text-cyan-600 m-auto mt-3"/>}
                                    </div>
                                    <div className="text-[10px] font-black text-white text-center truncate">
                                        <span className="text-cyan-400">#{p.number}</span> {p.name}
                                    </div>
                                    <div className="text-[8px] text-cyan-500 text-center font-jetbrains">{p.position} • OVR {p.ovr}</div>
                                </div>
                            ))}
                            {(!teamSelected.players || !teamSelected.players.length) && (
                                <div className="col-span-full text-center text-slate-500 text-xs py-4">Sin jugadores</div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
            
            <Modal isOpen={!!selectedPlayer} onClose={()=>setSelectedPlayer(null)} title={playerCtx?.player?.name||"Jugador"} icon={User} maxWidth="max-w-md">
                {playerCtx?.player && (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3 items-center">
                            <label className="w-20 h-20 rounded-xl bg-[#020617] border-2 border-cyan-500/30 overflow-hidden cursor-pointer relative shrink-0">
                                {playerCtx.player.photo ? <img src={playerCtx.player.photo} className="w-full h-full object-cover" alt=""/> : <User size={28} className="text-cyan-500/50 m-auto mt-5"/>}
                                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition flex items-center justify-center"><Upload size={16} className="text-white"/></div>
                                <input type="file" accept="image/*" className="hidden" onChange={e=>e.target.files[0] && handlePlayerPhoto(playerCtx.team.id, playerCtx.player.id, e.target.files[0])}/>
                            </label>
                            <div className="flex-1 flex flex-col gap-1.5">
                                <input type="text" value={playerCtx.player.name} onChange={e=>updatePlayer(playerCtx.team.id, playerCtx.player.id, 'name', e.target.value)} className="w-full bg-transparent border-b border-cyan-500/50 text-white font-black uppercase text-base outline-none"/>
                                <div className="flex gap-1">
                                    <div className="flex-1"><label className="text-[8px] text-cyan-500 uppercase font-black">#</label><input type="number" value={playerCtx.player.number} onChange={e=>updatePlayer(playerCtx.team.id, playerCtx.player.id, 'number', e.target.value)} className="w-full bg-[#020617] border border-cyan-500/30 rounded p-1 text-white text-xs text-center"/></div>
                                    <div className="flex-1"><label className="text-[8px] text-cyan-500 uppercase font-black">POS</label><select value={playerCtx.player.position} onChange={e=>updatePlayer(playerCtx.team.id, playerCtx.player.id, 'position', e.target.value)} className="w-full bg-[#020617] border border-cyan-500/30 rounded p-1 text-white text-xs text-center appearance-none"><option value="POR">POR</option><option value="DEF">DEF</option><option value="MED">MED</option><option value="DEL">DEL</option></select></div>
                                    <div className="flex-1"><label className="text-[8px] text-yellow-500 uppercase font-black">OVR</label><input type="number" value={playerCtx.player.ovr} onChange={e=>updatePlayer(playerCtx.team.id, playerCtx.player.id, 'ovr', e.target.value)} className="w-full bg-[#020617] border border-yellow-500/30 rounded p-1 text-yellow-400 text-xs text-center"/></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#020617] p-3 rounded-xl border border-cyan-500/20">
                            <h4 className="text-[9px] font-black uppercase text-cyan-500 font-jetbrains tracking-widest mb-2">Disciplina</h4>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-[#020617] p-2 rounded-lg border border-yellow-500/20 text-center">
                                    <div className="w-4 h-6 mx-auto bg-yellow-400 rounded mb-1 shadow-[0_0_8px_rgba(250,204,21,0.5)]"/>
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={()=>updateCard(playerCtx.team.id, playerCtx.player.id, 'yellow', 'sub')} className="text-slate-400 p-0.5"><Minus size={10}/></button>
                                        <span className="font-black text-white text-sm">{playerCtx.player.yellowCardsList?.length||0}</span>
                                        <button onClick={()=>updateCard(playerCtx.team.id, playerCtx.player.id, 'yellow', 'add')} className="text-slate-400 p-0.5"><Plus size={10}/></button>
                                    </div>
                                </div>
                                <div className="flex-1 bg-[#020617] p-2 rounded-lg border border-rose-500/20 text-center">
                                    <div className="w-4 h-6 mx-auto bg-rose-500 rounded mb-1 shadow-[0_0_8px_rgba(244,63,94,0.5)]"/>
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={()=>updateCard(playerCtx.team.id, playerCtx.player.id, 'red', 'sub')} className="text-slate-400 p-0.5"><Minus size={10}/></button>
                                        <span className="font-black text-white text-sm">{playerCtx.player.redCards||0}</span>
                                        <button onClick={()=>updateCard(playerCtx.team.id, playerCtx.player.id, 'red', 'add')} className="text-slate-400 p-0.5"><Plus size={10}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={()=>removePlayer(playerCtx.team.id, playerCtx.player.id)} className="w-full bg-rose-500/20 text-rose-400 border border-rose-500/40 py-2 rounded-lg text-[10px] font-black uppercase touch-target">Eliminar Jugador</button>
                    </div>
                )}
            </Modal>
            
            <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-3">
                <div className="glass-panel-heavy rounded-2xl p-1.5 flex justify-around border border-cyan-500/30 bg-[#020617]/95">
                    {[
                        {id:'dashboard',icon:LayoutDashboard,label:'Panel'},
                        {id:'config',icon:Settings,label:'Config'},
                        {id:'notas',icon:ClipboardPaste,label:'Notas'}
                    ].map(m => (
                        <button key={m.id} onClick={()=>setTab(m.id)} className={`flex-1 p-2 flex flex-col items-center rounded-xl touch-target ${tab===m.id?'bg-cyan-600/80 text-white':'text-cyan-500/70'}`}>
                            <m.icon size={16}/>
                            <span className="text-[8px] font-black uppercase mt-0.5">{m.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
            
            <div className="fixed left-2 top-1/3 z-40 flex flex-col gap-1 glass-panel-heavy rounded-r-xl p-1.5 border border-cyan-500/30 border-l-0 bg-[#020617]/95">
                {leagueSettings.divisions.map(d => (
                    <button key={d.id} onClick={()=>setActiveDivision(d.name)} className={`px-2 py-1.5 rounded text-[9px] font-black uppercase ${activeDivision===d.name?'bg-cyan-600/80 text-white':'text-slate-400'}`}>
                        {d.name}
                    </button>
                ))}
            </div>
        </div>
    );
});

// ==========================================
// 🚀 APP PRINCIPAL
// ==========================================
export default function App() {
    const [accessMode, setAccessMode] = useState(null);
    const [isDevMode, setIsDevMode] = useState(false);
    
    const [teams, setTeams] = useState(INITIAL_TEAMS);
    const [liveMatches, setLiveMatches] = useState([]);
    const [messages, setMessages] = useState([]);
    const [globalVotes, setGlobalVotes] = useState({});
    const [leagueSettings, setLeagueSettings] = useState({
        leagueName:'7KANTERA LEAGUE', leagueSubtitle:'SISTEMA DE GESTIÓN DEPORTIVA',
        jornada:'15', matchDay:new Date().toISOString().split('T')[0],
        customLogo:null, divisions:[
            {id:'d1',name:'CONO NORTE',hex:'#06b6d4'},
            {id:'d2',name:'MUNDIAL JUVENIL',hex:'#f59e0b'},
            {id:'d3',name:'CONO SUR',hex:'#d946ef'},
            {id:'d4',name:'CONO OESTE',hex:'#3b82f6'}
        ],
        ads:[]
    });
    const [agendaData, setAgendaData] = useState({reminders:[],referees:[]});
    const [activeDivision, setActiveDivision] = useState('CONO NORTE');
    const [isEditingTable, setIsEditingTable] = useState(false);
    const [newReminder, setNewReminder] = useState('');
    
    const [toast, setToast] = useState({message:'',type:'info',isVisible:false});
    const [confirm, setConfirm] = useState({isOpen:false,message:'',onConfirm:()=>{}});
    
    const showToast = useCallback((msg,type='success') => {
        setToast({message:msg,type,isVisible:true});
        setTimeout(()=>setToast(t=>({...t,isVisible:false})),3000);
    }, []);
    
    const requireConfirm = useCallback((msg,cb) => setConfirm({isOpen:true,message:msg,onConfirm:cb}), []);
    
    const allTeams = useMemo(() => [...teams].sort((a,b) => String(a.name).localeCompare(String(b.name))), [teams]);
    const getTeamName = useCallback((id) => allTeams.find(t=>t.id===id)?.name || 'TBD', [allTeams]);
    const theme = leagueSettings.divisions.find(d=>d.name===activeDivision) || leagueSettings.divisions[0];
    
    // Firebase sync (solo si es admin real, NO en modo dev)
    useEffect(() => {
        if (accessMode !== 'admin' || isDevMode) return;
        const ref = doc(db,'artifacts',appId,'appState','main');
        const unsub = onSnapshot(ref, snap => {
            if (snap.exists()) {
                const d = snap.data();
                if (d.teams) setTeams(d.teams);
                if (d.liveMatches) setLiveMatches(d.liveMatches);
                if (d.messages) setMessages(d.messages);
                if (d.globalVotes) setGlobalVotes(d.globalVotes);
                if (d.leagueSettings) setLeagueSettings(p => ({...p, ...d.leagueSettings, ads:d.leagueSettings.ads||p.ads, divisions:d.leagueSettings.divisions?.length?d.leagueSettings.divisions:p.divisions}));
                if (d.notes) setAgendaData(d.notes);
            } else {
                setDoc(ref, {teams:INITIAL_TEAMS, liveMatches:[], messages:[], globalVotes:{}, leagueSettings, notes:agendaData});
            }
        }, err => console.error(err));
        return () => unsub();
    }, [accessMode, isDevMode]);
    
    useEffect(() => {
        if (accessMode !== 'admin' || isDevMode) return;
        const t = setTimeout(() => {
            setDoc(doc(db,'artifacts',appId,'appState','main'), {teams,liveMatches,messages,globalVotes,leagueSettings,notes:agendaData}, {merge:true}).catch(e=>console.error(e));
        }, 1500);
        return () => clearTimeout(t);
    }, [teams,liveMatches,messages,globalVotes,leagueSettings,agendaData,accessMode,isDevMode]);
    
    const handleVote = (matchId, winner) => {
        const myVotes = JSON.parse(localStorage.getItem('cantera_votes')||'{}');
        if (myVotes[matchId]) return;
        myVotes[matchId] = winner;
        localStorage.setItem('cantera_votes', JSON.stringify(myVotes));
        setGlobalVotes(prev => ({
            ...prev,
            [matchId]: {
                t1: (prev[matchId]?.t1||0) + (winner==='t1'?1:0),
                draw: (prev[matchId]?.draw||0) + (winner==='draw'?1:0),
                t2: (prev[matchId]?.t2||0) + (winner==='t2'?1:0)
            }
        }));
        showToast("¡Voto registrado!","success");
    };
    
    const handleLogout = async () => {
        try { await signOut(auth); } catch(e) {}
        setAccessMode(null);
        setIsDevMode(false);
    };
    
    if (accessMode === null) {
        return <LandingScreen 
            onPublic={()=>setAccessMode('public')} 
            onAdmin={()=>{setAccessMode('admin'); setIsDevMode(false);}}
            onDevMode={()=>{setAccessMode('admin'); setIsDevMode(true);}}
        />;
    }
    
    return (
        <div className="w-screen min-h-[100dvh] bg-[#020617] text-white flex flex-col overflow-x-hidden">
            <style dangerouslySetInnerHTML={{__html: DASHBORINO_STYLES}} />
            <BackgroundEngine themeColor={theme.hex}/>
            
            {accessMode === 'public' ? (
                <PublicView 
                    liveMatches={liveMatches}
                    allTeams={allTeams}
                    getTeamName={getTeamName}
                    leagueSettings={leagueSettings}
                    messages={messages}
                    onExit={handleLogout}
                    globalVotes={globalVotes}
                    onVote={handleVote}
                />
            ) : (
                <AdminView
                    teams={teams}
                    setTeams={setTeams}
                    liveMatches={liveMatches}
                    setLiveMatches={setLiveMatches}
                    leagueSettings={leagueSettings}
                    setLeagueSettings={setLeagueSettings}
                    agendaData={agendaData}
                    setAgendaData={setAgendaData}
                    activeDivision={activeDivision}
                    setActiveDivision={setActiveDivision}
                    isEditingTable={isEditingTable}
                    setIsEditingTable={setIsEditingTable}
                    newReminder={newReminder}
                    setNewReminder={setNewReminder}
                    showToast={showToast}
                    requireConfirm={requireConfirm}
                    allTeams={allTeams}
                    getTeamName={getTeamName}
                    onLogout={handleLogout}
                    isDevMode={isDevMode}
                />
            )}
            
            <ConfirmDialog {...confirm} onClose={()=>setConfirm(p=>({...p,isOpen:false}))}/>
            <Toast {...toast}/>
        </div>
    );
}
