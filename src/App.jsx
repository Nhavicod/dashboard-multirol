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
  .bg-matriz { background-image: linear-gradient(to right, rgba(6,182,212,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.02) 1px, transparent 1px); background-size:50px 5[...] 
  .glass-panel { background:linear-gradient(135deg, rgba(2,6,23,0.8), rgba(15,23,42,0.6)); backdrop-filter:blur(12px) saturate(180%); -webkit-backdrop-filter:blur(12px) saturate(180%); border:1px soli[...]
  .glass-panel-heavy { background:linear-gradient(135deg, rgba(2,6,23,0.95), rgba(15,23,42,0.9)); backdrop-filter:blur(35px) saturate(200%); -webkit-backdrop-filter:blur(35px) saturate(200%); border:1[...]
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
const FLAG_MAP = { 'SENEGAL':'sn', 'SUIZA':'ch', 'VENEZUELA':'ve', 'BRASIL 23':'br', 'MEXICO':'mx', 'ESPAÑA':'es', 'DINAMARCA':'dk', 'GALES':'gb-wls', 'COLOMBIA':'co', 'RUSIA':'ru', 'MEXICO J':'mx', [...]
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
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#020617" stroke="#06b6d4" stroke-width="4"/><text x="50" y="72" font-fa[...]`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const INITIAL_TEAMS = [
    { id:'cn-0', division:'CONO NORTE', name:'SENEGAL', pj:15, g:13, e:1, p:1, gf:125, gc:69, pts:40, form:['G','G','G','E','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cn-0-p${j}[...]
    { id:'cn-1', division:'CONO NORTE', name:'SUIZA', pj:15, g:12, e:2, p:1, gf:103, gc:39, pts:38, form:['G','G','E','G','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cn-1-p${j`,[...]
    { id:'cn-2', division:'CONO NORTE', name:'VENEZUELA', pj:15, g:11, e:1, p:3, gf:73, gc:56, pts:34, form:['G','G','P','G','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cn-2-p${j[...]
    { id:'cn-3', division:'CONO NORTE', name:'BRASIL 23', pj:14, g:10, e:2, p:2, gf:108, gc:58, pts:32, form:['G','E','G','G','P'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cn-3-p${[...]
    { id:'mj-0', division:'MUNDIAL JUVENIL', name:'MEXICO J', pj:6, g:4, e:0, p:2, gf:18, gc:11, pts:12, form:['G','G','P','G','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`mj-0-p$[...]
    { id:'mj-1', division:'MUNDIAL JUVENIL', name:'IRAK', pj:7, g:3, e:0, p:4, gf:20, gc:17, pts:9, form:['G','P','P','G','P'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`mj-1-p${j}`,[...]
    { id:'cs-0', division:'CONO SUR', name:'ESPAÑA', pj:15, g:14, e:0, p:1, gf:87, gc:38, pts:42, form:['G','G','G','G','G'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cs-0-p${j}`,n[...]
    { id:'cs-1', division:'CONO SUR', name:'DINAMARCA', pj:15, g:11, e:1, p:3, gf:56, gc:42, pts:34, form:['G','P','G','G','E'], customLogo:null, players:Array.from({length:6},(_,j)=>({id:`cs-1-p${j}`[...]
];

const AI_IMAGE_PROMPT = `Transforma esta imagen al siguiente formato: HD 4K, ultra realista cinematográfico, iluminación dramática profesional, colores vibrantes neón con fondo oscuro degradad[...]`

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
                        <div key={ad.id} className={`absolute inset-0 transition-all duration-700 ${i===idx?'opacity-100 z-10 scale-100':'opacity-0 z-0 scale-110'}`} onClick={()=>ad.url&&window.o[...]
                            <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover cursor-pointer" style={i===idx?{animation:'adPanZoom 6s ease-in-out forwards'}:{}}/>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-transparent pointer-events-none"/>
                            {ad.text && <div className="absolute bottom-3 left-3 right-3 glass-panel-heavy px-3 py-2 rounded-xl border border-cyan-500/30 pointer-events-none"><p className="text-w[...]
                            {ad.url && <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1.5 pointer-event[...]
                        </div>
                    ))}
                </div>
                {ads.length > 1 && (
                    <>
                        <button onClick={() => setIdx(i => (i-1+ads.length)%ads.length)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md[...]
                            <ChevronRight size={16} className="rotate-180"/>
                        </button>
                        <button onClick={() => setIdx(i => (i+1)%ads.length)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border bo[...]
                            <ChevronRight size={16}/>
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                            {ads.map((_,i) => <button key={i} onClick={()=>setIdx(i)} className={`h-1.5 rounded-full transition-all ${i===idx?'bg-cyan-400 w-5 shadow-[0_0_8px_#06b6d4]':'bg-slate-[...]
                        </div>
                    </>
                )}
            </div>
            <button onClick={()=>setOpen(!open)} className="bg-[#020617]/90 border border-cyan-500/30 px-3 py-1 rounded-b-xl text-[9px] text-cyan-400 uppercase font-black tracking-widest mx-auto [...]
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
    const colors = { success:'border-emerald-500/50 text-emerald-400', error:'border-rose-500/50 text-rose-400', warning:'border-yellow-500/50 text-yellow-400', info:'border-cyan-500/50 text-cyan[...]
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
                    <label className="w-20 h-20 bg-[#020617] rounded-3xl border-2 border-cyan-500/40 flex items-center justify-center cursor-pointer hover:border-cyan-400 hover:scale-105 transiti[...]" />
                    <h1 className="text-2xl sm:text-3xl font-black uppercase text-white mt-4 tracking-widest text-center" style={{textShadow:'0 0 20px rgba(6,182,212,0.5)'}}>7KANTERA-CENTER</h1>
                    <p className="text-[10px] font-jetbrains text-cyan-400/80 uppercase mt-1.5 tracking-widest text-center">SISTEMA DE GESTIÓN DEPORTIVA</p>
                    <p className="text-[9px] font-jetbrains text-cyan-500/60 uppercase mt-0.5">Y: Navío • IG: bengocheaivy</p>
                </div>

                {/* BOTÓN PRINCIPAL PÚBLICO */}
                <button onClick={onPublic} className="w-full relative overflow-hidden bg-gradient-to-br from-cyan-500 via-cyan-600 to-emerald-500 text-white font-black py-6 sm:py-7 rounded-2xl up[...]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transfo[...]" />
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
                {/* ... rest of file unchanged ... */}
