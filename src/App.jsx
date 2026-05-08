import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { 
    Trophy, Shield, Swords, Activity, Database, Settings, Download, List, Edit3, 
    Sparkles, X, CheckCircle, AlertCircle, RotateCcw, Upload, Camera, TrendingUp, 
    TrendingDown, Minus, Target, Square, Plus, CalendarCheck, ClipboardPaste, Code, 
    LayoutDashboard, CalendarDays, BrainCircuit, Image as ImageIcon, User, Trash2, 
    Save, UserPlus, Users, FolderSearch, Search, Filter, PenTool, LogOut, Lock, 
    Mail, Palette, Calendar, LayoutGrid, Undo2, Redo2, Circle, Bell, ShieldAlert, 
    DollarSign, Clock, Check, Smartphone, Megaphone, Play, Settings2, FileSpreadsheet, 
    LayoutTemplate, HelpCircle, ImagePlus, Coins, Gift, Store, Calculator, Unlock, Gamepad2,
    ChevronRight, Wallet, Send, MessageSquare, Link as LinkIcon, ChevronUp, ChevronDown
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, onAuthStateChanged, signOut, signInWithCustomToken,
    signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// CONFIGURACIÓN FIREBASE DIRECTA Y GLOBAL
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyB2ci5KaDXj6lRtsbPf-FamrL_ltmtbz8c",
  authDomain: "nhavisoccer.firebaseapp.com",
  projectId: "nhavisoccer",
  storageBucket: "nhavisoccer.firebasestorage.app",
  messagingSenderId: "373043302721",
  appId: "1:373043302721:web:6fc0bdcad18173415191c0"
};

const appId = 'nhavisoccer-core'; 
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// PARAMETRIZACIÓN DE ROLES (ADMINISTRADORES)
// ==========================================
const ADMIN_EMAILS = ["admin@nhavisoccer.com", "ivan@nhavisoccer.com"];

// ==========================================
// 0. ESTÉTICA DASHBORINO OS v4.0 (ZERO-LAG)
// ==========================================
const DASHBORINO_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&family=Outfit:wght@300;400;600;800;900&display=swap');

  :root {
    --bg-abismo: #020617;
    --neon-cyan: #06b6d4;
    --neon-magenta: #d946ef;
    --neon-emerald: #10b981;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--bg-abismo);
    color: white;
    font-family: 'Outfit', sans-serif;
    overflow: hidden; 
    touch-action: pan-y; 
    -webkit-font-smoothing: antialiased;
  }

  .font-jetbrains { font-family: 'JetBrains Mono', monospace; }

  .bg-matriz {
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 50px 50px;
  }

  .glass-panel {
    background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.005));
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.5);
  }

  .glass-panel-heavy {
    background: linear-gradient(135deg, rgba(15,20,30,0.4), rgba(5,10,15,0.6));
    backdrop-filter: blur(35px) saturate(200%);
    -webkit-backdrop-filter: blur(35px) saturate(200%);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.1), 0 10px 40px rgba(0,0,0,0.8);
  }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
  .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 8px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 8px; }

  .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes adPanZoom {
    0% { transform: scale(1.3) translateY(-10%); }
    75% { transform: scale(1.4) translateY(10%); }
    90% { transform: scale(1.0) translateY(0%); }
    100% { transform: scale(1.0) translateY(0%); }
  }
`;

// ==========================================
// 1. CONFIGURACIÓN GLOBAL Y CONSTANTES
// ==========================================
const GUIDES = {
    dashboard: [
        { title: "Live Center", desc: "Inicia partidos programados, modifica marcadores en tiempo real y finaliza para enviar al buffer." },
        { title: "Buffer", desc: "Revisa resultados y ajusta puntos precalculados antes de impactar la base de datos." },
        { title: "Clasificación", desc: "Activa el modo edición para ajustar stats manualmente o usa importar/exportar excel." }
    ],
    calendario: [
        { title: "Programación", desc: "Añade cruces globales, define fecha/hora y usa Renderizar para enviar a la Cartelera de apuestas." }
    ],
    coins: [
        { title: "Momios", desc: "El algoritmo pre-calcula cuotas. Confírmalas para abrirlas a los usuarios en la App 2." },
        { title: "Roles", desc: "El usuario 'Admin' gestiona. 'Jugador' pueden apostar a nivel global en todos los nodos." }
    ]
};

const FLAG_MAP = { 
    'SENEGAL':'sn', 'SUIZA':'ch', 'MADAGASCAR':'mg', 'VENEZUELA':'ve', 'HUNGRIA':'hu', 
    'NIGERIA':'ng', 'INGLATERRA':'gb-eng', 'BRASIL 23':'br', 'BRASIL 2002':'br', 
    'MEXICO':'mx', 'QATAR':'qa', 'ARGENTINA':'ar', 'CURAZAO':'cw', 'CANADA':'ca', 
    'ARABIA':'sa', 'POLONIA':'pl', 'UZBEKISTAN':'uz', 'USBEKISTAN':'uz', 'R. CONGO':'cg', 
    'COLOMBIA':'co', 'ESCOCIA':'gb-sct', 'HOLANDA':'nl', 'PAISES BAJOS':'nl', 
    'GALES':'gb-wls', 'RUSIA':'ru', 'URUGUAY':'uy', 'UCRANIA':'ua', 'JAPON':'jp', 
    'FRANCIA':'fr', 'NORUEGA':'no', 'JORDANIA':'jo', 'SUDAFRICA':'za', 'CHINA':'cn', 
    'ALEMANIA B':'de', 'ALEMANIA':'de', 'PANAMA':'pa', 'ESPAÑA':'es', 'DINAMARCA':'dk', 
    'EGIPTO':'eg', 'ITALIA':'it', 'PORTUGAL':'pt', 'MARRUECOS':'ma', 'ARGELIA':'dz', 
    'BELGICA':'be', 'CROACIA':'hr', 'COREA DEL SUR':'kr', 'TURQUIA':'tr', 'R. UNIDO':'gb', 
    'COREA DEL NORTE':'kp', 'CAGLIARI':'it' 
};

const CLUB_LOGOS = {
    'AMERICA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Club_Am%C3%A9rica_logo.svg/512px-Club_Am%C3%A9rica_logo.svg.png',
    'CHIVAS': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Club_Deportivo_Guadalajara_logo.svg/512px-Club_Deportivo_Guadalajara_logo.svg.png',
    'CRUZ AZUL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Cruz_Azul_logo.svg/512px-Cruz_Azul_logo.svg.png',
    'PUMAS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Pumas_UNAM_logo.svg/512px-Pumas_UNAM_logo.svg.png',
    'TIGRES': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Club_Universidad_Nacional_logo.svg/512px-Club_Universidad_Nacional_logo.svg.png',
    'MONTERREY': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/C.F._Monterrey_logo.svg/512px-C.F._Monterrey_logo.svg.png',
    'REAL MADRID': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/512px-Real_Madrid_CF.svg.png',
    'BARCELONA': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/512px-FC_Barcelona_%28crest%29.svg.png',
    'PSG': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/512px-Paris_Saint-Germain_F.C..svg.png'
};

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

// ==========================================
// 2. FUNCIONES DE UTILIDAD PURAS Y COMPRESIÓN
// ==========================================

const getTeamLogoUrl = (name) => {
    if (!name) return null;
    const cleanName = name.toUpperCase().trim();
    if (CLUB_LOGOS[cleanName]) return CLUB_LOGOS[cleanName];
    for (let key in CLUB_LOGOS) { if (cleanName.includes(key)) return CLUB_LOGOS[key]; }
    return FLAG_MAP[cleanName] ? `https://flagcdn.com/w160/${FLAG_MAP[cleanName]}.png` : null;
};

const getSafeLogo = (team, divisions) => {
    if (!team) return null;
    if (team.customLogo) return team.customLogo;
    const existingUrl = getTeamLogoUrl(team.name);
    if (existingUrl) return existingUrl;

    const divObj = divisions?.find(d => d.name === team.division);
    const color = divObj ? divObj.hex : '#3B82F6';
    const letter = (team.name || 'T').charAt(0).toUpperCase();
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${color}" />
                <stop offset="100%" stop-color="#fff" />
            </linearGradient>
            <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.5"/>
            </filter>
        </defs>
        <text x="50" y="72" font-family="sans-serif" font-size="70" font-weight="900" fill="url(#g)" stroke="${color}" stroke-width="2" text-anchor="middle" filter="url(#ds)">${letter}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// ==========================================
// DATA INICIAL PRE-CARGADA DE LAS 4 DIVISIONES
// ==========================================
const DATA_CONO_NORTE = [
    { name: "SENEGAL", pj: 15, g: 13, e: 1, p: 1, gf: 125, gc: 69, pts: 40 },
    { name: "SUIZA", pj: 15, g: 12, e: 2, p: 1, gf: 103, gc: 39, pts: 38 },
    { name: "VENEZUELA", pj: 15, g: 11, e: 1, p: 3, gf: 73, gc: 56, pts: 34 },
    { name: "BRASIL 23", pj: 14, g: 10, e: 2, p: 2, gf: 108, gc: 58, pts: 32 },
    { name: "VIGUERAS", pj: 13, g: 10, e: 2, p: 1, gf: 91, gc: 51, pts: 32 },
    { name: "INGLATERRA", pj: 15, g: 9, e: 1, p: 5, gf: 101, gc: 78, pts: 28 },
    { name: "HUNGRIA A", pj: 12, g: 9, e: 0, p: 3, gf: 58, gc: 42, pts: 27 },
    { name: "QATAR", pj: 14, g: 9, e: 0, p: 5, gf: 59, gc: 51, pts: 27 },
    { name: "MADAGASCAR", pj: 14, g: 8, e: 1, p: 5, gf: 74, gc: 52, pts: 25 },
    { name: "MEXICO 73", pj: 12, g: 8, e: 0, p: 4, gf: 85, gc: 44, pts: 24 },
    { name: "NIGERIA", pj: 14, g: 8, e: 0, p: 4, gf: 64, gc: 49, pts: 24 },
    { name: "ARGENTINA", pj: 13, g: 8, e: 0, p: 5, gf: 62, gc: 49, pts: 24 },
    { name: "MASCARITAS", pj: 8, g: 7, e: 0, p: 1, gf: 43, gc: 24, pts: 21 },
    { name: "CANADA", pj: 15, g: 6, e: 1, p: 8, gf: 65, gc: 70, pts: 19 },
    { name: "CURAZAO", pj: 9, g: 5, e: 0, p: 4, gf: 36, gc: 35, pts: 15 },
    { name: "COLOMBIA A", pj: 6, g: 4, e: 0, p: 2, gf: 23, gc: 17, pts: 12 },
    { name: "POLONIA", pj: 1, g: 0, e: 0, p: 1, gf: 0, gc: 0, pts: 0 },
    { name: "UZBEKISTAN A", pj: 1, g: 0, e: 0, p: 1, gf: 3, gc: 4, pts: 0 }
];

const DATA_MUNDIAL_JUVENIL = [
    { name: "MEXICO J", pj: 6, g: 4, e: 0, p: 2, gf: 18, gc: 11, pts: 12 },
    { name: "IRAK", pj: 7, g: 3, e: 0, p: 4, gf: 20, gc: 17, pts: 9 },
    { name: "BELGICA J", pj: 7, g: 3, e: 0, p: 4, gf: 18, gc: 16, pts: 9 },
    { name: "SAN MARINO", pj: 3, g: 2, e: 1, p: 0, gf: 21, gc: 11, pts: 7 },
    { name: "ALEMANIA J", pj: 5, g: 2, e: 1, p: 2, gf: 12, gc: 11, pts: 7 },
    { name: "UZBEKISTAN J", pj: 5, g: 2, e: 0, p: 3, gf: 16, gc: 10, pts: 6 },
    { name: "UGANDA", pj: 5, g: 2, e: 0, p: 3, gf: 10, gc: 9, pts: 6 },
    { name: "CEFOR SAN JOSE", pj: 1, g: 1, e: 0, p: 0, gf: 5, gc: 4, pts: 3 },
    { name: "IRLANDA J", pj: 1, g: 1, e: 0, p: 0, gf: 3, gc: 2, pts: 3 }
];

const DATA_CONO_OESTE = [
    { name: "GALES", pj: 13, g: 11, e: 0, p: 2, gf: 63, gc: 43, pts: 33 },
    { name: "COLOMBIA", pj: 14, g: 10, e: 2, p: 2, gf: 60, gc: 44, pts: 32 },
    { name: "RUSIA", pj: 14, g: 10, e: 1, p: 3, gf: 65, gc: 44, pts: 31 },
    { name: "ESCOCIA", pj: 13, g: 8, e: 4, p: 1, gf: 49, gc: 35, pts: 28 },
    { name: "BASURAS", pj: 14, g: 8, e: 3, p: 3, gf: 56, gc: 40, pts: 27 },
    { name: "NORUEGA", pj: 14, g: 8, e: 3, p: 3, gf: 59, gc: 51, pts: 27 },
    { name: "UCRANIA", pj: 13, g: 9, e: 0, p: 4, gf: 38, gc: 35, pts: 27 },
    { name: "PAISES BAJOS", pj: 14, g: 8, e: 2, p: 4, gf: 57, gc: 54, pts: 26 },
    { name: "HOLANDA", pj: 13, g: 8, e: 0, p: 6, gf: 52, gc: 42, pts: 24 },
    { name: "INTERSEVEN", pj: 14, g: 7, e: 1, p: 6, gf: 40, gc: 40, pts: 22 },
    { name: "CHINA", pj: 7, g: 7, e: 0, p: 0, gf: 29, gc: 13, pts: 21 },
    { name: "ALEMANIA B", pj: 10, g: 6, e: 2, p: 2, gf: 29, gc: 19, pts: 20 },
    { name: "JAPON", pj: 13, g: 6, e: 2, p: 5, gf: 48, gc: 43, pts: 20 },
    { name: "USBEKISTAN B", pj: 8, g: 6, e: 1, p: 1, gf: 24, gc: 19, pts: 19 },
    { name: "IRLANDA", pj: 8, g: 6, e: 0, p: 2, gf: 20, gc: 10, pts: 18 },
    { name: "JORDANIA", pj: 12, g: 6, e: 0, p: 6, gf: 48, gc: 44, pts: 18 },
    { name: "FRANCIA", pj: 10, g: 5, e: 1, p: 4, gf: 43, gc: 36, pts: 16 },
    { name: "URUGUAY", pj: 12, g: 5, e: 0, p: 7, gf: 49, gc: 34, pts: 15 },
    { name: "BRASIL 2002", pj: 6, g: 3, e: 0, p: 3, gf: 27, gc: 23, pts: 9 },
    { name: "ESLOVENIA", pj: 4, g: 2, e: 0, p: 2, gf: 10, gc: 9, pts: 6 },
    { name: "SUDAFRICA", pj: 4, g: 1, e: 1, p: 2, gf: 12, gc: 13, pts: 4 }
];

const DATA_CONO_SUR = [
    { name: "ESPAÑA", pj: 15, g: 14, e: 0, p: 1, gf: 87, gc: 38, pts: 42 },
    { name: "DINAMARCA", pj: 15, g: 11, e: 1, p: 3, gf: 56, gc: 42, pts: 34 },
    { name: "MEXICO", pj: 15, g: 10, e: 2, p: 3, gf: 85, gc: 57, pts: 32 },
    { name: "PANAMA", pj: 15, g: 10, e: 2, p: 4, gf: 66, gc: 50, pts: 32 },
    { name: "BELGICA B", pj: 14, g: 10, e: 0, p: 4, gf: 61, gc: 43, pts: 30 },
    { name: "MARRUECOS", pj: 15, g: 9, e: 2, p: 4, gf: 66, gc: 42, pts: 29 },
    { name: "EGIPTO", pj: 15, g: 9, e: 2, p: 4, gf: 70, gc: 48, pts: 29 },
    { name: "PORTUGAL", pj: 14, g: 9, e: 2, p: 3, gf: 44, gc: 34, pts: 29 },
    { name: "ITALIA", pj: 15, g: 9, e: 1, p: 5, gf: 68, gc: 46, pts: 28 },
    { name: "USBEKISTAN F", pj: 14, g: 9, e: 1, p: 4, gf: 54, gc: 46, pts: 28 },
    { name: "TURQUIA", pj: 11, g: 8, e: 1, p: 2, gf: 30, gc: 21, pts: 25 },
    { name: "COREA DEL SUR", pj: 13, g: 8, e: 0, p: 5, gf: 52, gc: 51, pts: 24 },
    { name: "CROACIA", pj: 15, g: 7, e: 2, p: 6, gf: 52, gc: 51, pts: 23 },
    { name: "ARGELIA", pj: 14, g: 6, e: 5, p: 3, gf: 55, gc: 55, pts: 23 },
    { name: "ALEMANIA", pj: 14, g: 7, e: 0, p: 7, gf: 60, gc: 47, pts: 21 },
    { name: "SUECIA", pj: 11, g: 6, e: 0, p: 4, gf: 32, gc: 36, pts: 18 },
    { name: "CAGLIARI", pj: 10, g: 4, e: 2, p: 4, gf: 29, gc: 31, pts: 14 },
    { name: "R. UNIDO", pj: 3, g: 2, e: 0, p: 0, gf: 9, gc: 12, pts: 6 },
    { name: "HUNGRIA", pj: 1, g: 1, e: 0, p: 0, gf: 3, gc: 0, pts: 3 },
    { name: "COREA DEL NORTE", pj: 4, g: 1, e: 0, p: 3, gf: 3, gc: 3, pts: 3 },
    { name: "KEVIN AND FRIENDS", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 }
];

const procesarDivisionCompleta = (dataArray, divisionName) => {
    return dataArray.map((team, index) => ({
        id: `${divisionName.replace(/\s+/g, '-').toLowerCase()}-${index}`,
        division: divisionName,
        name: team.name,
        pj: team.pj, g: team.g, e: team.e, p: team.p, gf: team.gf, gc: team.gc, pts: team.pts,
        form: Array(5).fill('-'), customLogo: null,
        players: Array.from({length: 6}, (_, j) => ({ 
            id: `${divisionName.replace(/\s+/g, '-').toLowerCase()}-${index}-p${j}`, 
            name: `Jugador ${j + 1}`, number: j + 1, photo: null, position: 'MED', 
            status: 'Activo', ovr: 75, dynamicScore: 70, yellowCardsList: [], 
            redCards: 0, suspensionDays: 0, suspensionTimestamp: null 
        }))
    }));
};

const INITIAL_TEAMS = [
    ...procesarDivisionCompleta(DATA_CONO_NORTE, 'CONO NORTE'),
    ...procesarDivisionCompleta(DATA_MUNDIAL_JUVENIL, 'MUNDIAL JUVENIL'),
    ...procesarDivisionCompleta(DATA_CONO_OESTE, 'CONO OESTE'),
    ...procesarDivisionCompleta(DATA_CONO_SUR, 'CONO SUR')
];

const applyLocalFilter = (base64String, isRemovingBackground = false) => new Promise((resolve, reject) => { 
    const img = new Image(); 
    img.onload = () => { 
        const canvas = document.createElement('canvas'); 
        canvas.width = img.width; canvas.height = img.height; 
        const ctx = canvas.getContext('2d'); 
        ctx.filter = isRemovingBackground 
            ? 'contrast(1.15) saturate(1.2) brightness(1.05) drop-shadow(0 0 10px rgba(0,0,0,0.5))' 
            : 'contrast(1.1) saturate(1.15) brightness(1.05)'; 
        ctx.drawImage(img, 0, 0); 
        resolve(canvas.toDataURL('image/jpeg', 0.8)); 
    }; 
    img.onerror = reject;
    img.src = base64String; 
});

const compressImage = (file, maxSize = 300, quality = 0.8) => new Promise((resolve, reject) => { 
    const reader = new FileReader(); 
    reader.readAsDataURL(file); 
    reader.onload = (event) => { 
        const img = new Image(); 
        img.onload = () => { 
            const canvas = document.createElement('canvas'); 
            let width = img.width, height = img.height; 
            if (width > height) {
                if (width > maxSize) { height *= maxSize / width; width = maxSize; }
            } else {
                if (height > maxSize) { width *= maxSize / height; height = maxSize; }
            } 
            canvas.width = width; canvas.height = height; 
            const ctx = canvas.getContext('2d'); 
            ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; 
            ctx.drawImage(img, 0, 0, width, height); 
            const outputType = (file.type === 'image/png' || file.type === 'image/webp') ? 'image/png' : 'image/jpeg'; 
            resolve(canvas.toDataURL(outputType, outputType === 'image/jpeg' ? quality : undefined)); 
        }; 
        img.onerror = reject; 
        img.src = event.target.result; 
    }; 
    reader.onerror = reject; 
});

const sortTeams = (teams) => [...teams].sort((a, b) => 
    b.pts !== a.pts ? b.pts - a.pts : (b.gf - b.gc) !== (a.gf - a.gc) ? (b.gf - b.gc) - (a.gf - a.gc) : b.gf - a.gf
);

const getActiveYellows = (cardList) => {
    if (!cardList || !cardList.length) return 0;
    const now = new Date();
    let resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).getTime();
    if (now.getTime() < resetTime) resetTime -= 86400000;
    return cardList.filter(timestamp => timestamp >= resetTime).length;
};

const getRemainingSuspension = (player) => {
    if (!player.redCards || !player.suspensionTimestamp || !player.suspensionDays) return 0;
    const daysPassed = Math.floor((Date.now() - player.suspensionTimestamp) / 86400000);
    return Math.max(0, player.suspensionDays - daysPassed);
};

const isPlayerCritical = (player) => ((player.yellowCardsList?.length || 0) >= 4 || player.redCards >= 2);

const getFormScore = (formArray) => formArray.reduce((acc, curr) => acc + (curr === 'G' ? 3 : curr === 'E' ? 1 : 0), 0);

const getDominantColor = async (src) => {
    return '#3B82F6'; 
};

// ==========================================
// PANTALLA DE ACCESO (LOGIN / REGISTRO)
// ==========================================
function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, pass);
            } else {
                await createUserWithEmailAndPassword(auth, email, pass);
            }
        } catch (err) {
            if(err.code === 'auth/email-already-in-use') setError("El identificador ya existe.");
            else if(err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') setError("Credenciales incorrectas.");
            else if(err.code === 'auth/weak-password') setError("La clave debe tener al menos 6 caracteres.");
            else setError("Error de conexión. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-matriz bg-[#020617] text-white">
            <style dangerouslySetInnerHTML={{__html: DASHBORINO_STYLES}} />
            <div className="glass-panel-heavy p-8 rounded-[2.5rem] w-full max-w-md border border-cyan-500/20 animate-scale-in relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center border border-cyan-500/30 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Shield size={40} className="text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white font-outfit">NHAVI SOCCER</h2>
                    <p className="text-[10px] font-jetbrains text-cyan-400/60 uppercase mt-2">Acceso al Núcleo de Gestión</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2 font-jetbrains">Identificador (Correo)</label>
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500 transition-all font-outfit text-sm" placeholder="correo@ejemplo.com" required/>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2 font-jetbrains">Clave de Encriptación</label>
                        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-cyan-500 transition-all font-outfit text-sm" placeholder="••••••••" required/>
                    </div>
                    {error && <p className="text-rose-400 text-[10px] font-black uppercase text-center mt-2 font-jetbrains bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl mt-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 border border-cyan-400/50">
                        {loading ? <Activity size={18} className="animate-spin" /> : (isLogin ? <><Unlock size={18}/> Iniciar Secuencia</> : <><UserPlus size={18}/> Registrar Identidad</>)}
                    </button>
                </form>
                <div className="mt-6 text-center relative z-10">
                    <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-[10px] text-slate-400 hover:text-cyan-400 uppercase font-jetbrains tracking-widest transition-colors">
                        {isLogin ? "¿No tienes acceso? Solicita registro" : "Ya tengo acceso. Volver al Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 3. SUB-COMPONENTES UI
// ==========================================

const BackgroundEngine = memo(({ themeColor, mouseRef }) => {
    const canvasRef = useRef(null);
    const haloRef = useRef(null);
 
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let animationFrameId;
      let particles = [];
      const numParticles = 80; 
 
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resize);
      resize();
 
      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = (Math.random() - 0.5) * 0.4;
          this.size = Math.random() * 2 + 0.5;
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
          if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
 
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          const dx = mx - this.x;
          const dy = my - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
 
          if (distance < 100 && mx !== -1000) {
            const force = (100 - distance) / 100;
            this.x -= (dx / distance) * force * 3;
            this.y -= (dy / distance) * force * 3;
          }
        }
        draw() {
          ctx.fillStyle = themeColor;
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
 
      for (let i = 0; i < numParticles; i++) particles.push(new Particle());
 
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
 
        if (haloRef.current) {
          haloRef.current.style.transform = `translate3d(${mouseRef.current.x - 250}px, ${mouseRef.current.y - 250}px, 0)`;
        }
        animationFrameId = requestAnimationFrame(render);
      };
      render();
 
      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
      };
    }, [themeColor, mouseRef]);
 
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-matriz opacity-40" />
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div 
          ref={haloRef}
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-10 pointer-events-none will-change-transform"
          style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }}
        />
      </div>
    );
});

const AdCarousel = memo(({ ads }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (!ads || ads.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % ads.length);
        }, 7000); 
        return () => clearInterval(timer);
    }, [ads]);

    if (!ads || ads.length === 0) return null;

    return (
        <div className={`w-full transition-all duration-500 relative flex flex-col items-center ${isOpen ? 'mb-6 mt-2' : 'mb-2 mt-0'}`}>
            <div className={`w-full rounded-[2rem] overflow-hidden relative glass-panel shadow-[0_15px_40px_rgba(0,0,0,0.6)] group transition-all duration-500 ${isOpen ? 'h-40 sm:h-56 md:h-72 border border-white/10' : 'h-0 border-0 opacity-0'}`}>
                {ads.map((ad, i) => {
                    const isActive = i === currentIndex;
                    return (
                        <div 
                            key={ad.id} 
                            className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            onClick={() => ad.url && window.open(ad.url, '_blank')}
                        >
                            {isActive && (
                                <img 
                                    src={ad.imageUrl} 
                                    alt="Publicidad" 
                                    className={`w-full h-full object-cover cursor-pointer ${ad.url ? 'hover:brightness-110' : ''}`}
                                    style={{ animation: 'adPanZoom 7s ease-in-out forwards' }}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                            {ad.text && (
                                <div className="absolute bottom-6 left-6 glass-panel-heavy px-5 py-3 rounded-2xl border border-white/20 shadow-2xl max-w-[85%] backdrop-blur-xl pointer-events-none">
                                    <p className="text-white text-xs md:text-sm font-black uppercase font-outfit tracking-widest break-words" style={{textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{ad.text}</p>
                                </div>
                            )}
                            {ad.url && (
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5 shadow-lg pointer-events-none text-white/80">
                                    <LinkIcon size={12}/> <span className="text-[9px] font-black uppercase tracking-widest font-jetbrains">Ir al enlace</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                {ads.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {ads.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-white scale-125 shadow-[0_0_10px_white]' : 'bg-white/30'}`} />
                        ))}
                    </div>
                )}
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className={`bg-black/60 border border-white/10 px-6 py-1.5 rounded-b-xl text-[9px] text-slate-400 hover:text-white uppercase font-black tracking-widest backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-20 flex items-center gap-1.5 transition-all ${isOpen ? '-mt-2' : ''}`}>
                {isOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} {isOpen ? 'Ocultar' : 'Anuncios'}
            </button>
        </div>
    );
});

const PremiumCard = memo(({ children, theme, className = "" }) => (
    <div className={`relative glass-panel rounded-2xl overflow-hidden shadow-lg ${className}`}>{children}</div>
));

const ActionButton = memo(({ icon: Icon, label, subtitle, onClick, theme }) => (
    <button onClick={onClick} className="relative w-full text-left rounded-xl p-3 glass-panel hover:bg-white/5 active:scale-95 transition-all duration-200" style={{color: theme.hex}}>
        <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 shadow-inner">
                <Icon size={18} style={{filter: `drop-shadow(0 0 8px ${theme.hex})`}} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs uppercase text-white truncate font-outfit">{label}</h4>
                <p className="text-[10px] opacity-80 mt-0.5 truncate font-jetbrains" style={{color: theme.hex}}>{subtitle}</p>
            </div>
        </div>
    </button>
));

const Modal = memo(({ isOpen, onClose, title, icon: Icon, children, maxWidth = "max-w-lg", theme, overflow = "overflow-y-auto" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
            <div className={`relative w-full ${maxWidth} glass-panel-heavy rounded-3xl overflow-hidden animate-scale-in z-10 max-h-[90vh] flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]`} style={{'--theme-color': theme ? theme.hex : '#3b82f6'}}>
                {theme && <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70" style={{background: `linear-gradient(to right, transparent, ${theme.hex}, transparent)`}} />}
                <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center shrink-0 bg-gradient-to-r from-black/40 to-transparent">
                    <h3 className="text-sm sm:text-base font-black text-white uppercase flex items-center gap-3 tracking-widest font-outfit">
                        <Icon size={20} style={{color: theme ? theme.hex : '#FFF', filter: `drop-shadow(0 0 10px ${theme ? theme.hex : '#FFF'})`}} /> 
                        <span className="truncate">{String(title)}</span>
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 transition-colors active:scale-90"><X size={18} /></button>
                </div>
                <div className={`p-5 ${overflow} custom-scrollbar`}>{children}</div>
            </div>
        </div>
    );
});

const ConfirmDialog = memo(({ isOpen, onClose, onConfirm, message, title = "Confirmación Requerida" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md animate-fade-in" onClick={onClose} />
            <div className="relative w-full max-w-sm glass-panel-heavy rounded-3xl overflow-hidden animate-scale-in z-10 flex flex-col items-center p-8 text-center border-rose-500/30 border">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 relative">
                    <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
                    <AlertCircle size={32} className="text-rose-500 relative z-10" style={{filter: 'drop-shadow(0 0 10px #f43f5e)'}} />
                </div>
                <h3 className="text-lg font-black text-white uppercase mb-2 tracking-widest">{String(title)}</h3>
                <p className="text-sm text-slate-400 mb-8 font-outfit">{String(message)}</p>
                <div className="flex gap-3 w-full">
                    <button onClick={onClose} className="flex-1 glass-panel text-slate-300 font-bold px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-xs uppercase tracking-wider active:scale-95">Cancelar</button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 bg-rose-600/80 hover:bg-rose-500 text-white font-black px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)] uppercase text-xs tracking-wider transition-colors border border-rose-500/50 active:scale-95">Confirmar</button>
                </div>
            </div>
        </div>
    );
});

const Toast = memo(({ message, type, isVisible }) => { 
    if (!isVisible) return null; 
    const configStyles = {
        success: ["border-emerald-500/40 bg-emerald-950/80 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.3)]", CheckCircle],
        warning: ["border-yellow-500/40 bg-yellow-950/80 text-yellow-100 shadow-[0_0_20px_rgba(234,179,8,0.3)]", AlertCircle],
        error: ["border-rose-500/40 bg-rose-950/80 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.3)]", AlertCircle],
        info: ["border-cyan-500/40 bg-cyan-950/80 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.3)]", Activity]
    };
    const [styleClasses, Icon] = configStyles[type] || configStyles['info']; 
    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in max-w-[90vw]">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-xl glass-panel ${styleClasses}`}>
                <Icon size={18} className="shrink-0" />
                <span className="font-bold text-xs uppercase tracking-widest font-outfit">{String(message)}</span>
            </div>
        </div>
    ); 
});

const HubModule = memo(({ icon: Icon, color, label, isActive, onClick }) => (
    <button onClick={onClick} className={`relative p-2 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 text-center overflow-hidden shrink-0 min-w-[60px] ${isActive ? 'bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105' : 'bg-transparent border border-transparent hover:bg-white/5 hover:border-white/10 active:scale-95'}`}>
        {isActive && <div className="absolute inset-0 opacity-20" style={{background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`}} />}
        <Icon size={18} style={{color, filter: isActive ? `drop-shadow(0 0 10px ${color})` : 'none'}} className="mb-1 relative z-10" />
        <span className="font-black uppercase text-white text-[8px] tracking-wider relative z-10 font-outfit">{label}</span>
    </button>
));

// ==========================================
// 4. VISTA JUGADOR (CONSOLIDADA)
// ==========================================
const UserAppView = memo(({ appMode, currentUser, bettingData, setBettingData, liveMatches, allSortedTeams, getTeamName, showToast, requireConfirm, userAppTab, setUserAppTab, leagueSettings, messages }) => {
    const defaultName = currentUser?.email?.split('@')[0] || 'Jugador';
    const currentUserData = bettingData.users[appMode] || { name: defaultName, coins: 1000, bets: [] };
    const [activeDiv, setActiveDiv] = useState(leagueSettings.divisions[0]?.name || '');
    
    useEffect(() => { if (!activeDiv && leagueSettings.divisions.length > 0) setActiveDiv(leagueSettings.divisions[0].name); }, [leagueSettings.divisions, activeDiv]);

    const handleUserBet = useCallback((matchId, prediction, odds, wagerAmount) => {
        if (!wagerAmount || wagerAmount <= 0) return showToast("Monto inválido", "error");
        setBettingData(prev => {
            const user = prev.users[appMode] || { name: defaultName, coins: 1000, bets: [] };
            if (user.coins < wagerAmount) { showToast("Fondos insuficientes", "error"); return prev; }
            const newBet = { id: Date.now(), matchId, prediction, odds: parseFloat(odds), wager: parseFloat(wagerAmount), status: 'pending', timestamp: new Date().toISOString() };
            showToast("Apuesta colocada", "success");
            return { ...prev, users: { ...prev.users, [appMode]: { ...user, coins: user.coins - wagerAmount, bets: [newBet, ...user.bets] } } };
        });
    }, [appMode, setBettingData, showToast, defaultName]);

    const activeTeams = allSortedTeams.filter(t => t.division === activeDiv);
    const activeDivObj = leagueSettings.divisions.find(d => d.name === activeDiv) || { hex: '#06b6d4' };
    const activeLiveMatches = liveMatches;
    const userMessages = messages.filter(m => m.target === 'all' || m.target === appMode).sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="flex-1 flex flex-col w-full relative z-10 transition-colors text-white">
            <div className="glass-panel border-b border-white/10 p-4 sticky top-[48px] z-30 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-900/40 border border-cyan-500/50 flex items-center justify-center shadow-[inset_0_0_15px_rgba(6,182,212,0.3)]">
                        <User size={24} className="text-cyan-400" style={{filter: 'drop-shadow(0 0 5px #06b6d4)'}}/>
                    </div>
                    <div>
                        <h2 className="font-black text-sm uppercase truncate max-w-[150px] tracking-widest font-outfit">{currentUserData.name}</h2>
                        <p className="text-[10px] text-cyan-400/80 font-jetbrains tracking-wider">SYSTEM.USER_ACCESS</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-jetbrains mb-1">Carga Cuántica</span>
                    <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
                        <Coins size={16} className="text-emerald-400"/>
                        <span className="font-black text-emerald-400 tracking-wider font-jetbrains text-lg" style={{textShadow: '0 0 10px rgba(16,185,129,0.5)'}}>{Number(currentUserData.coins).toFixed(0)}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-5">
                <AdCarousel ads={leagueSettings.ads} />

                {userMessages.length > 0 && (
                    <div className="w-full bg-black/20 border border-white/5 py-5 rounded-3xl">
                        <div className="flex overflow-x-auto snap-x custom-scrollbar px-4 gap-5 pb-2">
                            {userMessages.map(msg => (
                                <div key={msg.id} className="snap-center shrink-0 w-[85vw] max-w-[380px] glass-panel rounded-3xl overflow-hidden flex flex-col shadow-2xl border-white/10 relative">
                                    <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-[8px] font-jetbrains text-white/50 backdrop-blur-md z-10 border border-white/10">DATA.PACKET</div>
                                    {msg.type === 'image' && msg.content && (
                                        <div className="w-full aspect-video bg-[#020617] flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                            <img src={msg.content} className="w-full h-full object-cover opacity-90" alt="Render Oficial"/>
                                        </div>
                                    )}
                                    {msg.text && (
                                        <div className="p-5 bg-gradient-to-b from-transparent to-black/80 relative z-20 -mt-10">
                                            <p className="text-sm font-bold text-white leading-relaxed break-words font-outfit">{msg.text}</p>
                                            <span className="text-[10px] font-jetbrains text-cyan-500 mt-3 block">{new Date(msg.timestamp).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 glass-panel p-2 rounded-2xl">
                    <button onClick={() => setUserAppTab('home')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300 font-outfit tracking-wider ${userAppTab === 'home' ? 'bg-cyan-600/90 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Estación Central</button>
                    <button onClick={() => setUserAppTab('casino')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300 flex justify-center items-center gap-2 font-outfit tracking-wider ${userAppTab === 'casino' ? 'bg-magenta-600/90 text-white shadow-[0_0_20px_rgba(217,70,239,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Wallet size={16}/> Protocolo Apuesta</button>
                </div>

                {userAppTab === 'home' && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div>
                            <h3 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-3 tracking-widest font-outfit border-b border-white/10 pb-2">
                                <Activity className="text-cyan-500" style={{filter: 'drop-shadow(0 0 8px #06b6d4)'}}/> 
                                Nodos Globales en Vivo
                            </h3>
                            {activeLiveMatches.filter(m => m.status === 'live' || m.status === 'scheduled').length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase glass-panel rounded-2xl border border-dashed border-white/10 font-jetbrains">No hay señales de partidos.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-2 relative z-10">
                                    {[...activeLiveMatches].sort((a, b) => (a.status === 'live' ? -1 : 1) - (b.status === 'live' ? -1 : 1)).map(match => (
                                        <div key={match.id} className={`glass-panel rounded-2xl p-5 flex flex-col gap-4 relative transition-all duration-300 ${match.status === 'live' ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-white/5'}`}>
                                            <div className="flex justify-between items-center bg-black/40 rounded-xl p-2 border border-white/5 shadow-inner">
                                                <span className={`text-[10px] font-black uppercase ml-2 flex items-center gap-2 font-jetbrains ${match.status === 'live' ? 'text-cyan-400' : 'text-slate-400'}`}>
                                                    {match.status === 'scheduled' ? <><div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]"/> PRG</> : <><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]"/> VIVO</>}
                                                </span>
                                            </div>
                                            {match.status === 'scheduled' ? (
                                                <div className="flex flex-col justify-center gap-4">
                                                    <div className="text-sm font-black text-white text-center truncate font-outfit tracking-wider">{getTeamName(match.t1Id)} <span className="text-cyan-500/50 mx-2 text-[10px]">vs</span> {getTeamName(match.t2Id)}</div>
                                                    <div className="text-center"><span className="text-[10px] font-bold text-slate-400 glass-panel px-3 py-1.5 rounded-lg border border-white/5 font-jetbrains tracking-wider">{match.date} a las {match.time || 'TBD'}</span></div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between gap-4 h-[110px]">
                                                    {[1, 2].map(n => (
                                                        <div key={n} className="flex-1 flex flex-col gap-3 min-w-0">
                                                            <div className="text-center font-bold text-xs text-slate-300 truncate font-outfit tracking-wider">{getTeamName(match[`t${n}Id`])}</div>
                                                            <div className="flex justify-center items-center gap-1 bg-black/40 rounded-xl p-2 border border-white/5 shadow-inner py-4">
                                                                <span className="text-4xl font-black text-white font-jetbrains" style={{textShadow: '0 0 15px rgba(255,255,255,0.3)'}}>{match[`g${n}`]}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <div className="flex overflow-x-auto custom-scrollbar gap-3 pb-2 mt-4">
                                {leagueSettings.divisions.map(d => (
                                    <button 
                                        key={d.id} 
                                        onClick={() => setActiveDiv(d.name)} 
                                        className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase shrink-0 transition-all duration-300 border font-outfit tracking-widest ${activeDiv === d.name ? 'glass-panel text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-black/40 text-slate-500 border-white/5 hover:bg-white/10'}`} 
                                        style={{borderBottomWidth: '3px', borderBottomColor: activeDiv === d.name ? d.hex : 'transparent'}}
                                    >
                                        {d.name}
                                    </button>
                                ))}
                            </div>
                            
                            {/* PREMIUM TABLE PARA JUGADOR */}
                            <PremiumCard theme={{hex: activeDivObj.hex}} className="p-0 bg-transparent rounded-3xl overflow-hidden mt-4">
                                <div className="p-4 md:p-5 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <h3 className="text-xs font-black text-white uppercase flex items-center gap-2 tracking-widest font-outfit"><List size={18} className="text-cyan-500"/> Clasificación General</h3>
                                </div>
                                <div className="w-full overflow-x-auto custom-scrollbar bg-black/20">
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead><tr className="text-[10px] text-slate-500 uppercase font-black tracking-widest bg-black/40 border-b border-white/10 font-outfit">{['Pos', 'Club', 'Tend', 'PJ', 'G', 'E', 'P', 'GF:GC', 'DIF', 'Racha', 'PTS'].map((h, i) => <th key={h} className={`py-4 px-3 ${i===0||i>1?'text-center':''}`}>{h}</th>)}</tr></thead>
                                        <tbody className="text-xs font-semibold font-jetbrains tracking-wider">
                                            {activeTeams.map((team, index) => { 
                                                const goalDiff = team.gf - team.gc; 
                                                const safeLogo = getSafeLogo(team, leagueSettings.divisions);
                                                return (
                                                    <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                        <td className="py-3 px-2 text-center text-slate-400 text-[11px] font-black">{index + 1}</td>
                                                        <td className="py-3 px-3 min-w-[200px]">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg overflow-hidden glass-panel flex items-center justify-center shrink-0 border-white/10 group-hover:border-cyan-500/50 transition-colors"><img src={safeLogo} className="object-contain w-full h-full p-0.5" alt="T"/></div>
                                                                <span className="font-black text-[12px] text-slate-200 truncate font-outfit tracking-wider">{team.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center bg-black/20 text-slate-600 border-x border-white/5"><Minus size={16} className="mx-auto"/></td>
                                                        <td className="p-3 text-center text-sm"><span className="text-cyan-400">{team.pj}</span></td>
                                                        <td className="p-3 text-center text-sm"><span className="text-emerald-400">{team.g}</span></td>
                                                        <td className="p-3 text-center text-sm"><span className="text-slate-400">{team.e}</span></td>
                                                        <td className="p-3 text-center text-sm"><span className="text-rose-400">{team.p}</span></td>
                                                        <td className="p-3 text-center bg-black/40 border-x border-white/5 shadow-inner">
                                                            <div className="flex items-center justify-center gap-1.5"><span className="text-emerald-400">{team.gf}</span><span className="text-slate-600">:</span><span className="text-rose-400">{team.gc}</span></div>
                                                        </td>
                                                        <td className="p-3 text-center"><span className={`px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 font-black text-xs shadow-inner ${goalDiff>0?'text-cyan-400':goalDiff<0?'text-rose-400':'text-slate-500'}`}>{goalDiff>0?`+${goalDiff}`:goalDiff}</span></td>
                                                        <td className="p-3 text-center"><div className="flex gap-1.5 justify-center">{team.form.map((f, i) => <span key={i} className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center border font-outfit ${f==='G'?'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_5px_rgba(16,185,129,0.3)]':f==='P'?'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_5px_rgba(244,63,94,0.3)]':f==='E'?'bg-slate-500/20 text-slate-300 border-slate-500/50':'glass-panel text-transparent border-white/5'}`}>{f}</span>)}</div></td>
                                                        <td className="p-3 text-center text-2xl font-black bg-emerald-900/10 border-l border-emerald-500/20 relative">
                                                            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
                                                            <span className="text-emerald-400" style={{textShadow: '0 0 10px rgba(16,185,129,0.4)'}}>{team.pts}</span>
                                                        </td>
                                                    </tr>
                                                ); 
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </PremiumCard>
                        </div>
                    </div>
                )}

                {userAppTab === 'casino' && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div className="bg-magenta-900/20 border border-magenta-500/40 rounded-3xl p-6 flex justify-between items-center shadow-[0_0_30px_rgba(217,70,239,0.15)] relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-magenta-500/20 rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <h3 className="font-black uppercase text-magenta-400 text-lg tracking-widest font-outfit" style={{textShadow: '0 0 10px rgba(217,70,239,0.5)'}}>NEXUS de Apuestas</h3>
                                <p className="text-[10px] text-magenta-200/60 mt-1 font-jetbrains">Asigna carga cuántica a eventos globales probabilísticos.</p>
                            </div>
                            <Gamepad2 size={32} className="text-magenta-500 opacity-60 relative z-10" />
                        </div>

                        <div className="flex flex-col gap-5">
                            {Object.keys(bettingData.activeBets || {}).length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase glass-panel rounded-2xl border border-dashed border-white/10 font-jetbrains">No hay mercados abiertos actualmente.</div>
                            ) : (
                                Object.entries(bettingData.activeBets).map(([mId, betInfo]) => {
                                    const hasBet = currentUserData.bets.find(b => b.matchId === mId && b.status === 'pending');
                                    const team1Name = getTeamName(betInfo.t1Id);
                                    const team2Name = getTeamName(betInfo.t2Id);

                                    return (
                                        <div key={mId} className="glass-panel border border-magenta-500/30 rounded-3xl p-5 flex flex-col gap-5 relative">
                                            {hasBet && <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-3xl pointer-events-none shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]" />}
                                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                                <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 font-jetbrains"><CalendarDays size={14}/> {betInfo.date} • {betInfo.time}</span>
                                                {hasBet && <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]"><CheckCircle size={12}/> Confirmado</span>}
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="flex-1 text-center font-black text-sm truncate font-outfit tracking-wider">{team1Name}</span>
                                                <span className="text-[10px] font-black text-magenta-500/60 font-jetbrains px-3 py-1 bg-magenta-500/10 rounded-full">VS</span>
                                                <span className="flex-1 text-center font-black text-sm truncate font-outfit tracking-wider">{team2Name}</span>
                                            </div>

                                            {!hasBet ? (
                                                <div className="grid grid-cols-3 gap-3 mt-2">
                                                    <button onClick={() => requireConfirm(`¿Asignar 50 carga al LOCAL (${team1Name})? Multiplicador: x${betInfo.o1}`, ()=>handleUserBet(mId, 'o1', betInfo.o1, 50), "Confirmar Asignación")} className="glass-panel hover:bg-magenta-500/20 border border-white/5 hover:border-magenta-500/50 rounded-2xl py-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95">
                                                        <span className="text-[10px] font-black uppercase text-slate-400 font-jetbrains">LCL</span>
                                                        <span className="text-lg font-black text-magenta-400 font-jetbrains" style={{textShadow: '0 0 10px rgba(217,70,239,0.5)'}}>{betInfo.o1}</span>
                                                    </button>
                                                    <button onClick={() => requireConfirm(`¿Asignar 50 carga al EMPATE? Multiplicador: x${betInfo.ox}`, ()=>handleUserBet(mId, 'ox', betInfo.ox, 50), "Confirmar Asignación")} className="glass-panel hover:bg-magenta-500/20 border border-white/5 hover:border-magenta-500/50 rounded-2xl py-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95">
                                                        <span className="text-[10px] font-black uppercase text-slate-400 font-jetbrains">EMP</span>
                                                        <span className="text-lg font-black text-magenta-400 font-jetbrains" style={{textShadow: '0 0 10px rgba(217,70,239,0.5)'}}>{betInfo.ox}</span>
                                                    </button>
                                                    <button onClick={() => requireConfirm(`¿Asignar 50 carga a VISITA (${team2Name})? Multiplicador: x${betInfo.o2}`, ()=>handleUserBet(mId, 'o2', betInfo.o2, 50), "Confirmar Asignación")} className="glass-panel hover:bg-magenta-500/20 border border-white/5 hover:border-magenta-500/50 rounded-2xl py-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95">
                                                        <span className="text-[10px] font-black uppercase text-slate-400 font-jetbrains">VST</span>
                                                        <span className="text-lg font-black text-magenta-400 font-jetbrains" style={{textShadow: '0 0 10px rgba(217,70,239,0.5)'}}>{betInfo.o2}</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-cyan-900/30 border border-cyan-500/40 rounded-2xl p-4 flex justify-between items-center shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] font-black uppercase text-cyan-500/70 font-jetbrains">Predicción Vectorial</span>
                                                        <span className="text-base font-black text-cyan-400 font-outfit tracking-wider">{hasBet.prediction === 'o1' ? 'Local' : hasBet.prediction === 'o2' ? 'Visita' : 'Empate'}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[9px] font-black uppercase text-slate-400 font-jetbrains">Carga: <span className="text-white">{hasBet.wager}</span></span>
                                                        <span className="text-[10px] font-black uppercase text-emerald-400 font-jetbrains bg-emerald-500/10 px-2 py-0.5 rounded">Retorno: +{(hasBet.wager * hasBet.odds).toFixed(0)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-4">
                            <h3 className="text-sm font-black uppercase text-white mb-4 border-b border-white/10 pb-2 tracking-widest font-outfit">Bitácora Cuántica</h3>
                            <div className="flex flex-col gap-3">
                                {currentUserData.bets.length === 0 && <p className="text-xs text-slate-500 font-jetbrains">No hay registros de asignaciones previas.</p>}
                                {currentUserData.bets.map(b => (
                                    <div key={b.id} className={`p-4 rounded-2xl border flex justify-between items-center ${b.status === 'won' ? 'bg-emerald-900/30 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : b.status === 'lost' ? 'bg-rose-900/30 border-rose-500/40' : 'glass-panel border-white/5'}`}>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase text-white font-jetbrains tracking-wider">Vector: <span className="text-cyan-400">{b.prediction.toUpperCase()}</span></span>
                                            <span className="text-[9px] text-slate-400 font-jetbrains">Carga: {b.wager} | x{b.odds}</span>
                                        </div>
                                        <div>
                                            {b.status === 'pending' && <span className="text-[9px] font-black text-amber-400 bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30">PROCESANDO</span>}
                                            {b.status === 'won' && <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30">ÉXITO (+{(b.wager*b.odds).toFixed(0)})</span>}
                                            {b.status === 'lost' && <span className="text-[9px] font-black text-rose-400 bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/30">FALLO</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

// ==========================================
// 5. COMPONENTE PRINCIPAL (ORQUESTADOR)
// ==========================================

export default function App() {
    const [appMode, setAppMode] = useState('admin'); 
    const [userAppTab, setUserAppTab] = useState('home'); 

    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    
    const [teams, setTeams] = useState(INITIAL_TEAMS);
    const [liveMatches, setLiveMatches] = useState([]);
    const [agendaData, setAgendaData] = useState({ reminders: [], referees: [] });
    const [calendarMatches, setCalendarMatches] = useState([{ id: Date.now(), t1Id: '', t2Id: '', date: '', time: '', analysis: null }]);
    const [messages, setMessages] = useState([]); 
    
    const [leagueSettings, setLeagueSettings] = useState({ 
        leagueName: 'LIGA PROFESIONAL FUT7', leagueSubtitle: 'LMS CORE', jornada: '15', 
        matchDay: new Date().toISOString().split('T')[0], customLogo: null, logoSize: 100, 
        divisions: [ 
            {id:'div1', name:'CONO NORTE', hex:'#06b6d4'}, 
            {id:'div2', name:'MUNDIAL JUVENIL', hex:'#f59e0b'},
            {id:'div3', name:'CONO OESTE', hex:'#3b82f6'},
            {id:'div4', name:'CONO SUR', hex:'#d946ef'}
        ], 
        headerSponsors: [], ads: []
    });
    const [activeDivision, setActiveDivision] = useState('CONO NORTE');
    
    const [bettingData, setBettingData] = useState({
        coinValueReal: 1.0, casinoEnabled: true,
        packages: [{ id: 1, name: 'Starter Pack', coins: 100, price: 90 }], prizes: [{ id: 1, name: 'Balón Oficial', cost: 5000, imgUrl: '' }],
        divisionWeights: {}, activeBets: {},
        users: { user1: { name: 'Jugador 1', coins: 1000, bets: [] }, user2: { name: 'Jugador 2', coins: 500, bets: [] } }
    });
    const [oddsDraft, setOddsDraft] = useState({}); 

    const [uiState, setUiState] = useState({ 
        view: 'dashboard', isEditingTable: false, directorySearch: '', 
        modal: null, activeRosterTeamId: null, activePlayerCard: null, isImporting: false, 
        groupCrop: {active: false, tId: null, imgUrl: null, imgRef: null}, showGuides: true 
    });
    const [coinsTab, setCoinsTab] = useState('momios');
    const [localSearch, setLocalSearch] = useState('');
    const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {}, title: '' });
    const [renderStudio, setRenderStudio] = useState({ active: false, type: null, data: null, settings: { sponsorId: '', style: 'dark' }, broadcastText: '' });
    const [isRenderingPreview, setIsRenderingPreview] = useState(false);
    const [onboardingState, setOnboardingState] = useState({ active: false, step: 1, tempName: '', tempLogo: null, tempDivs: [] });
    
    const previewCanvasRef = useRef(null);
    const lastSyncStr = useRef(null);
    const saveTimeoutRef = useRef(null);
    const [history, setHistory] = useState([]);
    const [historyPointer, setHistoryPointer] = useState(-1);
    const isUndoRedoAction = useRef(false);
    const [jornadaSummary, setJornadaSummary] = useState([]);
    const [editingMatchId, setEditingMatchId] = useState(null);
    
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [isDivMenuOpen, setIsDivMenuOpen] = useState(false);
    
    const [newReminderText, setNewReminderText] = useState("");
    const [newRefereeRecord, setNewRefereeRecord] = useState({ match: '', referee: '', fee: '' });
    
    const [cropMarkers, setCropMarkers] = useState([]);
    const [cropRadius, setCropRadius] = useState(15);
    const [calDate, setCalDate] = useState(() => { const d = new Date(); return {day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear()}; });

    const bottomMenuRef = useRef(null);
    const leftDivMenuRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    const currentDivisionObj = useMemo(() => leagueSettings.divisions.find(d => d.name === activeDivision) || leagueSettings.divisions[0] || {hex: '#06b6d4', name: 'Norte'}, [leagueSettings.divisions, activeDivision]);
    const theme = {hex: currentDivisionObj.hex, name: currentDivisionObj.name};
    const visibleTeams = useMemo(() => sortTeams(teams.filter(t => t.division === activeDivision)), [teams, activeDivision]);
    const allSortedTeams = useMemo(() => [...teams].sort((a, b) => String(a.name).localeCompare(String(b.name))), [teams]);
    const activeTeamForRoster = useMemo(() => teams.find(t => t.id === uiState.activeRosterTeamId), [teams, uiState.activeRosterTeamId]);
    
    const directoryResults = useMemo(() => {
        if (!uiState.directorySearch) return []; 
        const term = uiState.directorySearch.toLowerCase(); 
        return teams.flatMap(t => (t.players || []).filter(p => p.name.toLowerCase().includes(term) || t.name.toLowerCase().includes(term)).map(p => ({...p, teamName: t.name, teamId: t.id, division: t.division}))).slice(0, 30);
    }, [teams, uiState.directorySearch]);
    
    const activePlayerContext = useMemo(() => {
        if (!uiState.activePlayerCard) return null; 
        const team = teams.find(x => x.id === uiState.activePlayerCard.tId); 
        return team ? {team, player: team.players.find(x => x.id === uiState.activePlayerCard.pId)} : null;
    }, [teams, uiState.activePlayerCard]);

    const getTeamName = useCallback(id => allSortedTeams.find(t => t.id === id)?.name || 'TBD', [allSortedTeams]);

    const updateUi = useCallback((key, value) => setUiState(prev => ({...prev, [key]: value})), []);
    const showToast = useCallback((msg, type = 'success') => { setToast({message: msg, type, isVisible: true}); setTimeout(() => setToast(x => ({...x, isVisible: false})), 3000); }, []);
    const requireConfirm = useCallback((message, callback, title) => setConfirmDialog({isOpen: true, message, onConfirm: callback, title}), []);

    const handleAddAd = async (e) => {
        if (e.target.files[0]) {
            showToast("Procesando imagen...", "info");
            const img = await compressImage(e.target.files[0], 600, 0.6);
            setLeagueSettings(p => ({ ...p, ads: [...(p.ads||[]), { id: Date.now(), imageUrl: img, text: '', url: '' }] }));
            showToast("Imagen añadida al carrusel", "success");
        }
    };
    const handleUpdateAd = (id, field, value) => {
        setLeagueSettings(p => ({ ...p, ads: (p.ads||[]).map(a => a.id === id ? { ...a, [field]: value } : a) }));
    };
    const handleRemoveAd = (id) => {
        requireConfirm("¿Quitar imagen del carrusel?", () => {
            setLeagueSettings(p => ({ ...p, ads: (p.ads||[]).filter(a => a.id !== id) }));
            showToast("Imagen eliminada", "info");
        });
    };

    const handleAddReminder = (e) => {
        e.preventDefault();
        if (!newReminderText.trim()) return;
        setAgendaData(p => ({...p, reminders: [{id: Date.now(), text: newReminderText, completed: false}, ...(p.reminders||[])]}));
        setNewReminderText("");
        showToast("Nota agregada", "success");
    };
    const toggleReminder = (id) => setAgendaData(p => ({...p, reminders: p.reminders.map(r => r.id === id ? {...r, completed: !r.completed} : r)}));
    const deleteReminder = (id) => setAgendaData(p => ({...p, reminders: p.reminders.filter(r => r.id !== id)}));

    const handleAddReferee = (e) => {
        e.preventDefault();
        if (!newRefereeRecord.match || !newRefereeRecord.referee) return showToast("Llena los campos base", "error");
        setAgendaData(p => ({...p, referees: [{id: Date.now(), ...newRefereeRecord, paid: false}, ...(p.referees||[])]}));
        setNewRefereeRecord({match: '', referee: '', fee: ''});
        showToast("Honorario registrado", "success");
    };
    const toggleReferee = (id) => setAgendaData(p => ({...p, referees: p.referees.map(r => r.id === id ? {...r, paid: !r.paid} : r)}));
    const deleteReferee = (id) => setAgendaData(p => ({...p, referees: p.referees.filter(r => r.id !== id)}));

    const addPackage = () => setBettingData(p => ({...p, packages: [...(p.packages||[]), {id: Date.now(), name: 'Nuevo Pack', coins: 100, price: 50}]}));
    const updatePackage = (id, field, value) => setBettingData(p => ({...p, packages: p.packages.map(pkg => pkg.id === id ? {...pkg, [field]: value} : pkg)}));
    const deletePackage = (id) => setBettingData(p => ({...p, packages: p.packages.filter(pkg => pkg.id !== id)}));

    const handleUpdateDivWeight = (divName, weight) => setBettingData(p => ({...p, divisionWeights: {...(p.divisionWeights||{}), [divName]: parseFloat(weight)||1}}));

    const downloadCanvasHelper = (canvas, filename) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png'); 
        link.click();
        showToast("Descarga HD iniciada", "success");
    };

    const handleExcelImport = (e, div) => {
        const file = e.target.files[0];
        if (!file) return;
        updateUi('isImporting', true);
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const rows = text.split('\n').filter(row => row.trim() !== '');
                
                const newTeams = [];
                for (let i = 1; i < rows.length; i++) {
                    const cols = rows[i].split(',').map(c => c.trim());
                    if (cols.length < 8) continue;
                    
                    newTeams.push({
                        id: `${div}-${Date.now()}-${i}`,
                        division: div,
                        name: cols[0].toUpperCase(),
                        pj: parseInt(cols[1]) || 0,
                        g: parseInt(cols[2]) || 0,
                        e: parseInt(cols[3]) || 0,
                        p: parseInt(cols[4]) || 0,
                        gf: parseInt(cols[5]) || 0,
                        gc: parseInt(cols[6]) || 0,
                        pts: parseInt(cols[7]) || 0,
                        form: Array(5).fill('-'),
                        customLogo: null,
                        players: []
                    });
                }
                
                setTeams(prev => {
                    const filtered = prev.filter(t => t.division !== div);
                    return [...filtered, ...newTeams];
                });
                
                showToast(`Importados ${newTeams.length} equipos a ${div}`, "success");
            } catch (err) {
                showToast("Error al procesar el archivo CSV", "error");
            } finally {
                updateUi('isImporting', false);
                if (e.target) e.target.value = ''; 
            }
        };
        reader.onerror = () => {
            showToast("Error al leer el archivo", "error");
            updateUi('isImporting', false);
        };
        reader.readAsText(file);
    };

    const handleGlobalPointer = useCallback((e) => {
        mouseRef.current = {
            x: e.clientX || (e.touches && e.touches[0].clientX) || mouseRef.current.x,
            y: e.clientY || (e.touches && e.touches[0].clientY) || mouseRef.current.y
        };
    }, []);

    useEffect(() => {
        if (!activeDivision && leagueSettings.divisions.length > 0) setActiveDivision(leagueSettings.divisions[0].name);
    }, [leagueSettings.divisions, activeDivision]);

    useEffect(() => { 
        const handleOutside = (e) => {
            if (isDivMenuOpen && leftDivMenuRef.current && !leftDivMenuRef.current.contains(e.target)) setIsDivMenuOpen(false);
        }; 
        document.addEventListener('mousedown', handleOutside); document.addEventListener('touchstart', handleOutside, {passive: true}); 
        return () => { document.removeEventListener('mousedown', handleOutside); document.removeEventListener('touchstart', handleOutside); }; 
    }, [isMenuOpen, isDivMenuOpen]);

    useEffect(() => { const timer = setTimeout(() => updateUi('directorySearch', localSearch), 300); return () => clearTimeout(timer); }, [localSearch, updateUi]);

    useEffect(() => { 
        const newDate = `${calDate.year}-${String(calDate.month).padStart(2,'0')}-${String(calDate.day).padStart(2,'0')}`; 
        if (leagueSettings.matchDay !== newDate) setLeagueSettings(prev => ({...prev, matchDay: newDate}));
    }, [calDate, leagueSettings.matchDay]);

    useEffect(() => { 
        if (!isDataLoaded || isUndoRedoAction.current) { isUndoRedoAction.current = false; return; } 
        const timer = setTimeout(() => {
            setHistory(prev => {
                const ns = JSON.stringify(teams); 
                if (prev.length > 0 && prev[historyPointer] === ns) return prev; 
                const nh = prev.slice(0, historyPointer + 1); nh.push(ns); 
                if (nh.length > 20) nh.shift(); return nh;
            }); 
            setHistoryPointer(prev => Math.min(prev + 1, 19));
        }, 800); 
        return () => clearTimeout(timer); 
    }, [teams, isDataLoaded, historyPointer]);

    useEffect(() => {
        if (uiState.view !== 'coins') return;
        const calculateAutoOdds = (t1Id, t2Id) => {
            const t1 = allSortedTeams.find(t => t.id === t1Id), t2 = allSortedTeams.find(t => t.id === t2Id);
            if (!t1 || !t2) return { o1: '0.00', ox: '0.00', o2: '0.00' };
            const w1 = parseFloat(bettingData.divisionWeights?.[t1.division] || 1), w2 = parseFloat(bettingData.divisionWeights?.[t2.division] || 1);
            const diff = ((t1.pts + ((t1.gf - t1.gc)*0.5) + getFormScore(t1.form)) * w1) - ((t2.pts + ((t2.gf - t2.gc)*0.5) + getFormScore(t2.form)) * w2);
            let p1 = Math.max(0.15, Math.min(0.75, 0.40 + (diff * 0.015))), p2 = Math.max(0.15, Math.min(0.75, 0.40 - (diff * 0.015)));
            return { o1: (1 / (p1 * 1.10)).toFixed(2), ox: (1 / ((1 - p1 - p2) * 1.10)).toFixed(2), o2: (1 / (p2 * 1.10)).toFixed(2) };
        };
        setOddsDraft(prev => {
            let next = { ...prev };
            calendarMatches.forEach(m => { if (m.t1Id && m.t2Id && !next[m.id] && !bettingData.activeBets[m.id]) next[m.id] = calculateAutoOdds(m.t1Id, m.t2Id); });
            return next;
        });
    }, [calendarMatches, uiState.view, allSortedTeams, bettingData.divisionWeights, bettingData.activeBets]);

    // ==========================================
    // ESCUCHADOR DE SESIÓN Y ROLES
    // ==========================================
    useEffect(() => { 
        const unsub = onAuthStateChanged(auth, u => { 
            if (u) { 
                setUser(u); 
                const isAdminUser = ADMIN_EMAILS.includes(u.email);
                setRole(isAdminUser ? 'admin' : 'user');
                setAppMode(isAdminUser ? 'admin' : u.uid);
            } else {
                setUser(null);
                setRole(null);
            }
            setAuthChecked(true); 
        }); 
        return () => unsub(); 
    }, []);

    useEffect(() => { 
        if (!user) return; 
        const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'appState', 'main'); 
        const unsub = onSnapshot(ref, snap => {
            if (snap.exists()) {
                const data = snap.data(); 
                const str = JSON.stringify({t: data.teams, l: data.liveMatches, ls: data.leagueSettings, n: data.notes, b: data.bettingData, ms: data.messages}); 
                if (lastSyncStr.current !== str) {
                    lastSyncStr.current = str; 
                    if(data.teams) setTeams(data.teams); 
                    if(data.liveMatches) setLiveMatches(data.liveMatches); 
                    if(data.notes) setAgendaData(data.notes); 
                    if(data.bettingData) setBettingData(p => ({...p, ...data.bettingData, users: data.bettingData.users || p.users})); 
                    if(data.messages) setMessages(data.messages);
                    if(data.leagueSettings) {
                        setLeagueSettings(p => ({...p, ...data.leagueSettings, ads: data.leagueSettings.ads || p.ads, matchDay: data.leagueSettings.matchDay || p.matchDay, divisions: data.leagueSettings.divisions?.length ? data.leagueSettings.divisions : p.divisions}));
                        if(data.leagueSettings.matchDay) {
                            const [y,m,d] = data.leagueSettings.matchDay.split('-'); setCalDate({day:parseInt(d), month:parseInt(m), year:parseInt(y)});
                        }
                        if (data.leagueSettings.setupCompleted === false) setOnboardingState(o => ({...o, active: true, tempName: data.leagueSettings.leagueName, tempLogo: data.leagueSettings.customLogo, tempDivs: data.leagueSettings.divisions}));
                    }
                }
            } else { 
                setDoc(ref, {teams: INITIAL_TEAMS, liveMatches: [], notes: agendaData, leagueSettings: {...leagueSettings, setupCompleted: false}, bettingData, messages: []}).catch(console.error); 
                setOnboardingState(o => ({...o, active: true, tempName: leagueSettings.leagueName, tempLogo: leagueSettings.customLogo, tempDivs: leagueSettings.divisions})); 
            } 
            setIsDataLoaded(true);
        }, err => { console.error(err); showToast("Error BD", "error"); }); 
        return () => unsub(); 
    }, [user, showToast]);

    useEffect(() => { 
        if (user && isDataLoaded) {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); 
            saveTimeoutRef.current = setTimeout(() => {
                const str = JSON.stringify({t: teams, l: liveMatches, ls: leagueSettings, n: agendaData, b: bettingData, ms: messages}); 
                if (lastSyncStr.current !== str) {
                    lastSyncStr.current = str; 
                    setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'appState', 'main'), {teams, liveMatches, leagueSettings, notes: agendaData, bettingData, messages}, {merge: true})
                        .catch(e => { if (e.code === 'resource-exhausted') showToast("Límite DB", "error"); });
                }
            }, 1500); 
        } 
    }, [teams, liveMatches, leagueSettings, agendaData, bettingData, messages, user, isDataLoaded, showToast]);

    const handleLogout = () => signOut(auth);

    const handleDivisionChange = (id, field, value) => { 
        setLeagueSettings(p => {
            const idx = p.divisions.findIndex(d => d.id === id); if(idx < 0) return p;
            const old = p.divisions[idx].name, val = (value.trim() === '' && field === 'name') ? old : value;
            if(field === 'name' && val !== old) {
                setTeams(ts => ts.map(t => t.division === old ? {...t, division: val} : t));
                if(activeDivision === old) setActiveDivision(val);
            }
            return {...p, divisions: p.divisions.map(d => d.id === id ? {...d, [field]: val} : d)};
        });
    };
    const handleAddDivision = () => { setLeagueSettings(p => ({...p, divisions: [...p.divisions, {id: `div${Date.now()}`, name: `Nuev. Div ${p.divisions.length + 1}`, hex: '#ffffff'}]})); };
    const handleDeleteDivision = id => { 
        const div = leagueSettings.divisions.find(x => x.id === id); 
        if (teams.some(t => t.division === div.name)) return showToast("Vacía división", "error"); 
        if (leagueSettings.divisions.length <= 1) return showToast("Mín. 1 div", "error"); 
        setLeagueSettings(p => ({...p, divisions: p.divisions.filter(x => x.id !== id)})); 
        if (activeDivision === div.name) setActiveDivision(leagueSettings.divisions.find(x => x.id !== id).name); 
    };

    const handleAddTeam = useCallback(() => { 
        const div = activeDivision || leagueSettings.divisions[0].name; 
        setTeams(p => [...p, {id: `${div}-${Date.now()}`, division: div, name: `NUEVO EQ`, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0, form: Array(5).fill('-'), customLogo: null, players: []}]); 
        showToast("Añadido", "success"); 
    }, [activeDivision, leagueSettings.divisions, showToast]);
    
    const handleDeleteTeam = useCallback(id => requireConfirm('¿Eliminar equipo?', () => { setTeams(p => p.filter(t => t.id !== id)); showToast("Eliminado", "success"); }), [requireConfirm, showToast]);
    const handleUpdateTeamData = useCallback((teamId, field, value) => setTeams(p => p.map(t => t.id === teamId ? {...t, [field]: value} : t)), []);
    const handleDirectEdit = useCallback((teamId, field, value) => setTeams(p => p.map(t => { if (t.id !== teamId) return t; const nt = {...t, [field]: Number(value) || 0}; if (['g', 'e'].includes(field)) nt.pts = (nt.g * 3) + (nt.e * 1); return nt; })), []);
    const handleUpdatePlayerField = useCallback((tId, pId, field, value) => setTeams(p => p.map(t => t.id === tId ? {...t, players: (t.players||[]).map(x => x.id === pId ? {...x, [field]: value} : x)} : t)), []);
    const handleAddPlayer = useCallback(tId => setTeams(p => p.map(t => t.id === tId ? {...t, players: [...t.players, {id: `p-${Date.now()}`, name: `Nuevo`, number: t.players.length ? Math.max(...t.players.map(x=>x.number))+1 : 1, yellowCardsList: [], redCards: 0, photo: null, position: 'MED', status: 'Activo', ovr: 75, dynamicScore: 70, suspensionDays: 0, suspensionTimestamp: null}]} : t)), []);
    const handleRemovePlayer = useCallback((e, tId, pId) => { e.stopPropagation(); requireConfirm('¿Baja jugador?', () => { setTeams(p => p.map(t => t.id === tId ? {...t, players: t.players.filter(x => x.id !== pId)} : t)); if(uiState.activePlayerCard?.pId === pId) updateUi('activePlayerCard', null); }); }, [requireConfirm, uiState.activePlayerCard, updateUi]);
    
    const handleUpdateCard = useCallback((tId, pId, type, value) => setTeams(p => p.map(t => {
        if(t.id !== tId) return t; return {...t, players: (t.players||[]).map(pl => {
            if(pl.id !== pId) return pl;
            if(type === 'yellow') { let l = [...pl.yellowCardsList||[]], s = pl.dynamicScore||70; if(value==='add') {l.push(Date.now()); s=Math.max(0,s-2);} else if(l.length) {l.pop(); s=Math.min(100,s+2);} return {...pl, yellowCardsList:l, dynamicScore:s}; }
            if(type === 'red') { let r = pl.redCards||0, s = pl.dynamicScore||70; if(value==='add'){r++;s=Math.max(0,s-10); return {...pl, redCards:r, dynamicScore:s, suspensionTimestamp:Date.now(), suspensionDays:1};} if(value==='sub'){r=Math.max(0,r-1);s=Math.min(100,s+10); return {...pl, redCards:r, dynamicScore:s, suspensionDays:r===0?0:pl.suspensionDays};} }
            return {...pl, [type]: value};
        })};
    })), []);

    const handleGroupPhotoSelect = async (e, tId) => {
        const file = e.target.files[0]; if(!file) return; updateUi('isImporting', true); showToast("Preparando...", "info");
        const url = URL.createObjectURL(file), img = new Image(); img.src = url;
        img.onload = () => { updateUi('groupCrop', {active:true, tId, imgUrl:url, imgRef:img}); setCropMarkers([]); updateUi('isImporting', false); if(e.target) e.target.value=''; };
    };
    const closeGroupCrop = () => { if(uiState.groupCrop.imgUrl) URL.revokeObjectURL(uiState.groupCrop.imgUrl); updateUi('groupCrop', {active:false, tId:null, imgUrl:null, imgRef:null}); setCropMarkers([]); };
    const executeCrops = async () => {
        const {imgRef, tId} = uiState.groupCrop; if(!cropMarkers.length) return closeGroupCrop(); updateUi('isImporting', true);
        try {
            const cvs = document.createElement('canvas'), ctx = cvs.getContext('2d'); cvs.width=256; cvs.height=256; const proc = [];
            for (const m of cropMarkers) {
                ctx.clearRect(0,0,256,256); 
                const r = (m.radius/100) * imgRef.width;
                const sx = (m.px * imgRef.width) - r, sy = (m.py * imgRef.height) - r;
                ctx.fillStyle='#020617'; ctx.fillRect(0,0,256,256); ctx.drawImage(imgRef, sx, sy, r*2, r*2, 0, 0, 256, 256);
                proc.push(await applyLocalFilter(cvs.toDataURL('image/jpeg', 0.8), false)); 
            }
            setTeams(p => p.map(t => {
                if(t.id!==tId) return t; let pl=[...t.players||[]], idx=0;
                for(let i=0; i<pl.length && idx<proc.length; i++) if(!pl[i].photo) { pl[i]={...pl[i], photo:proc[idx]}; idx++; }
                while(idx<proc.length) { pl.push({id:`p-${Date.now()}-${idx}`, name:`Fichaje ${idx+1}`, number:pl.length?Math.max(...pl.map(x=>x.number))+1:1, yellowCardsList:[], redCards:0, photo:proc[idx], position:'MED', status:'Activo', ovr:75, dynamicScore:70}); idx++; }
                return {...t, players:pl};
            })); showToast(`Recortadas ${proc.length} fotos`, 'success');
        } catch(e) { showToast('Error en recorte', 'error'); } finally { updateUi('isImporting', false); closeGroupCrop(); }
    };

    const updateCalendarMatch = useCallback((id, field, value) => setCalendarMatches(p => p.map(x => x.id === id ? {...x, [field]: value} : x)), []);
    const handleProgramarYRenderizar = () => { 
        const valids = calendarMatches.filter(m => m.t1Id && m.t2Id && m.t1Id !== m.t2Id); if(!valids.length) return showToast("Añade un enfrentamiento válido", "error");
        setLiveMatches(p => [...p.filter(x => x.t1Id), ...valids.map(m => ({...m, id: `lm_${Date.now()}_${Math.random()}`, status:'scheduled', matchDay:m.date||leagueSettings.matchDay, g1:0, g2:0}))]);
        openRenderStudio('program', valids); setCalendarMatches([{id:Date.now(), t1Id:'', t2Id:'', date:'', time:'', analysis:null}]); showToast("Cartelera Programada", "success");
    };
    const startLiveMatch = id => { setLiveMatches(p => p.map(x => x.id === id ? {...x, status: 'live'} : x)); showToast("¡En Juego!", "info"); };
    const updateLiveMatch = useCallback((id, field, value) => setLiveMatches(p => p.map(x => x.id === id ? {...x, [field]: value} : x)), []);
    const finishLiveMatch = match => { 
        const pts1 = match.g1 > match.g2 ? 3 : match.g1 === match.g2 ? 1 : 0;
        const pts2 = match.g2 > match.g1 ? 3 : match.g1 === match.g2 ? 1 : 0;
        setJornadaSummary(p => [...p, {...match, tempId: Date.now(), t1Name: getTeamName(match.t1Id), t2Name: getTeamName(match.t2Id), pts1, pts2}]); 
        setLiveMatches(p => p.filter(x => x.id !== match.id)); 
        showToast("Enviado a Buffer", "info"); 
    };
    const cancelLiveMatchSchedule = id => requireConfirm("¿Cancelar partido?", () => { setLiveMatches(p => p.filter(x => x.id !== id)); showToast("Cancelado", "info"); }, "Confirmar");
    
    const cloudFn_commitJornada = () => {
        let nt = [...teams], nu = { ...bettingData.users }; 
        jornadaSummary.forEach(m => {
            const apply = (tId, gf, gc, ptsToAdd) => {
                const idx = nt.findIndex(t => t.id === tId); if(idx < 0) return; let t = {...nt[idx]};
                t.pj++; t.gf += gf; t.gc += gc; t.form = [gf>gc?'G':gf<gc?'P':'E', ...t.form].slice(0,5);
                if(gf>gc){t.g++;}else if(gf<gc){t.p++;}else{t.e++;} 
                t.pts += ptsToAdd;
                nt[idx] = t;
            }; apply(m.t1Id, m.g1, m.g2, m.pts1); apply(m.t2Id, m.g2, m.g1, m.pts2);
            
            const res = m.g1 > m.g2 ? 'o1' : m.g1 < m.g2 ? 'o2' : 'ox';
            Object.keys(nu).forEach(uid => {
                nu[uid].bets = (nu[uid].bets || []).map(b => {
                    if (b.matchId === m.id && b.status === 'pending') {
                        if (b.prediction === res) { nu[uid].coins += (b.wager * b.odds); return { ...b, status: 'won' }; }
                        return { ...b, status: 'lost' }; 
                    } return b;
                });
            });
        }); 
        setTeams(nt); setBettingData(p => ({...p, users: nu})); setJornadaSummary([]); updateUi('modal', null); showToast(`Tablas Impactadas x${jornadaSummary.length}`, "success");
    };

    const handleUpdateDraftOdd = (mId, field, value) => setOddsDraft(p => ({...p, [mId]: {...p[mId], [field]: value}}));
    const handleActivateBet = (match) => { 
        const o = oddsDraft[match.id]; if(!o || !o.o1 || o.o1 === '0.00') return showToast("Momios inválidos. Verifica cálculo.", "error");
        requireConfirm("¿Activar apuestas para este partido con las cuotas actuales?", () => {
            setBettingData(p => ({...p, activeBets: {...p.activeBets, [match.id]: {...o, t1Id:match.t1Id, t2Id:match.t2Id, date:match.date||leagueSettings.matchDay, time:match.time||'TBD', active:true}}})); showToast("Momios Visibles en App 2", "success");
        });
    };
    const handleDeactivateBet = (mId) => { setBettingData(p => { const nb={...p.activeBets}; delete nb[mId]; return {...p, activeBets:nb};}); showToast("Retirada", "info"); };

    const PREMIUM_STYLES = useMemo(() => ({
        dark: { name: 'Dark Neon', bg: '#030509', primary: '#3B82F6', accent: theme.hex, text: '#FFFFFF', border: 'rgba(255,255,255,0.1)' },
        glass: { name: 'Holographic', bg: '#020617', primary: theme.hex, accent: '#06b6d4', text: '#F8FAFC', border: 'rgba(255,255,255,0.15)' },
        minimal: { name: 'Elite Clean', bg: '#F8FAFC', primary: '#0F172A', accent: theme.hex, text: '#0F172A', border: 'rgba(15,23,42,0.1)' }
    }), [theme.hex]);
    const openRenderStudio = useCallback((type, data) => { updateUi('modal', null); setRenderStudio({ active: true, type, data, settings: { sponsorId: '', style: 'glass' }, broadcastText: '' }); }, [updateUi]);
    
    // REDUCCIÓN PARA CHAT 
    const handleBroadcastRender = async (target) => {
        if(!previewCanvasRef.current) return;
        setIsRenderingPreview(true); showToast("Comprimiendo y Enviando...", "info");
        try {
            const bCanvas = document.createElement('canvas');
            const maxW = 800; 
            const scale = maxW / previewCanvasRef.current.width;
            bCanvas.width = maxW;
            bCanvas.height = previewCanvasRef.current.height * scale;
            const bCtx = bCanvas.getContext('2d');
            bCtx.drawImage(previewCanvasRef.current, 0, 0, bCanvas.width, bCanvas.height);
            
            const base64 = bCanvas.toDataURL('image/jpeg', 0.7);
            const newMessage = { id: Date.now(), type: 'image', content: base64, text: renderStudio.broadcastText, target, timestamp: Date.now() };
            setMessages(p => [newMessage, ...p].slice(0, 10));
            showToast(`Enviado a ${target === 'all' ? 'Todos' : 'Jugador'}`, "success");
        } catch(e) { showToast("Error al enviar", "error"); } finally { setIsRenderingPreview(false); }
    };

    // ==========================================
    // MOTOR DE RENDERS 8K (DINÁMICO - SIN CORTES)
    // ==========================================
    useEffect(() => {
        if (!renderStudio.active || !previewCanvasRef.current) return;
        setIsRenderingPreview(true);
        const tId = setTimeout(async () => {
            try {
                const cvs = previewCanvasRef.current;
                const ctx = cvs.getContext('2d');
                const stConf = PREMIUM_STYLES[renderStudio.settings.style] || PREMIUM_STYLES.glass;
                const spon = leagueSettings.headerSponsors?.find(s => s.id === renderStudio.settings.sponsorId);
                
                const loadImg = src => new Promise(resolve => { 
                    if (!src) return resolve(null); 
                    const img = new Image(); 
                    img.crossOrigin = "Anonymous"; 
                    img.onload = () => resolve(img); 
                    img.onerror = () => resolve(null); 
                    img.src = src; 
                });
                
                const dTxt = (txt, x, y, sz, w = '800', c = '#FFF', al = 'left', sh = false) => { 
                    ctx.font = `${w} ${sz}px system-ui`; 
                    ctx.fillStyle = c; 
                    ctx.textAlign = al; 
                    if (sh) { 
                        ctx.shadowColor = 'rgba(0,0,0,0.8)'; 
                        ctx.shadowBlur = 10; 
                    } else {
                        ctx.shadowBlur = 0; 
                    }
                    ctx.fillText(txt, x, y); 
                    ctx.shadowBlur = 0; 
                };
                
                const dCard = (x, y, w, h, rad, gl) => { 
                    ctx.save(); 
                    ctx.beginPath(); 
                    ctx.roundRect(x, y, w, h, rad); 
                    
                    if (stConf.bg === '#F8FAFC') {
                        ctx.fillStyle = '#FFF'; 
                        ctx.fill();
                    } else {
                        ctx.fillStyle = 'rgba(20,25,35,0.6)'; 
                        ctx.fill(); 
                        if (gl) {
                            ctx.strokeStyle = gl; 
                            ctx.lineWidth = 3; 
                            ctx.shadowColor = gl; 
                            ctx.shadowBlur = 20; 
                            ctx.stroke();
                        } else {
                            ctx.strokeStyle = stConf.border; 
                            ctx.lineWidth = 3; 
                            ctx.stroke();
                        } 
                        const gr = ctx.createLinearGradient(x, y, x + w, y + h); 
                        gr.addColorStop(0, 'rgba(255,255,255,0.15)'); 
                        gr.addColorStop(1, 'rgba(255,255,255,0)'); 
                        ctx.fillStyle = gr; 
                        ctx.fill();
                    } 
                    ctx.restore(); 
                };
                
                const dSpon = async (sx, sy) => { 
                    if (!spon) return; 
                    ctx.save(); 
                    ctx.globalAlpha = 0.9; 
                    const sc = (spon.scale || 100) / 100;
                    const maxW = cvs.width * 0.25 * sc; 
                    ctx.font = `900 ${45 * sc}px system-ui`; 
                    
                    let sImg = null, iw = 0, ih = 0; 
                    if (spon.logoUrl) {
                        sImg = await loadImg(spon.logoUrl); 
                        if (sImg) {
                            iw = maxW; 
                            ih = sImg.height * (maxW / sImg.width);
                        }
                    } 
                    
                    const ph = spon.phrase ? String(spon.phrase).toUpperCase() : '';
                    const tW = ph ? ctx.measureText(ph).width : 0; 
                    const g = (sImg && ph) ? 40 * sc : 0;
                    const totW = iw + g + tW; 
                    let px = sx - (totW / 2); 
                    
                    if (sImg) {
                        ctx.drawImage(sImg, px, sy - ih + (20 * sc), iw, ih); 
                        px += iw + g;
                    } 
                    
                    if (ph) {
                        ctx.shadowColor = 'rgba(0,0,0,0.9)';
                        ctx.shadowBlur = 8;
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = 'left';
                        ctx.fillText(ph, px, sy);
                    } 
                    ctx.restore(); 
                };
                
                const dPlr = async (p, px, py, pw, ph) => { 
                    ctx.save(); 
                    dCard(px, py, pw, ph, 40, stConf.primary); 
                    if (p.photo) {
                        const i = await loadImg(p.photo); 
                        if (i) {
                            ctx.save();
                            ctx.beginPath();
                            ctx.arc(px + pw / 2, py + ph * 0.38, pw * 0.32, 0, Math.PI * 2);
                            ctx.clip();
                            ctx.drawImage(i, px + pw * 0.18, py + ph * 0.38 - pw * 0.32, pw * 0.64, pw * 0.64);
                            ctx.restore();
                            
                            ctx.beginPath();
                            ctx.arc(px + pw / 2, py + ph * 0.38, pw * 0.32, 0, Math.PI * 2);
                            ctx.strokeStyle = stConf.accent;
                            ctx.lineWidth = 8;
                            ctx.stroke();
                        }
                    } else {
                        ctx.fillStyle = 'rgba(255,255,255,0.05)';
                        ctx.beginPath();
                        ctx.arc(px + pw / 2, py + ph * 0.38, pw * 0.32, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = stConf.border;
                        ctx.lineWidth = 5;
                        ctx.stroke();
                    } 
                    
                    dTxt(String(p.ovr || 75), px + pw * 0.15, py + ph * 0.12, pw * 0.18, '900', stConf.primary, 'center', true); 
                    dTxt(p.position || 'MED', px + pw * 0.15, py + ph * 0.20, pw * 0.07, '900', stConf.accent, 'center'); 
                    dTxt(String(p.name || '').toUpperCase(), px + pw / 2, py + ph * 0.72, pw * 0.09, '900', stConf.text, 'center', true); 
                    
                    const bx = px + pw * 0.1;
                    const by = py + ph * 0.82;
                    const bw = pw * 0.8; 
                    
                    ctx.fillStyle = 'rgba(0,0,0,0.4)';
                    ctx.beginPath();
                    ctx.roundRect(bx, by, bw, pw * 0.05, 20);
                    ctx.fill(); 
                    
                    const sr = Math.max(0, Math.min(100, p.dynamicScore || 0)) / 100;
                    const gr = ctx.createLinearGradient(bx, by, bx + bw, by); 
                    gr.addColorStop(0, '#ef4444');
                    gr.addColorStop(0.5, '#eab308');
                    gr.addColorStop(1, '#10b981'); 
                    
                    ctx.fillStyle = gr;
                    ctx.beginPath();
                    ctx.roundRect(bx, by, bw * sr, pw * 0.05, 20);
                    ctx.fill(); 
                    
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.beginPath();
                    ctx.roundRect(bx, by, bw * sr, pw * 0.02, { tl: 20, tr: 20 });
                    ctx.fill(); 
                    
                    dTxt("RENDIMIENTO", px + pw / 2, by - pw * 0.03, pw * 0.04, '800', stConf.accent, 'center'); 
                    
                    const sRem = getRemainingSuspension(p); 
                    if (sRem > 0) {
                        ctx.fillStyle = 'rgba(220,38,38,0.9)';
                        ctx.beginPath();
                        ctx.roundRect(px, py, pw, ph, 40);
                        ctx.fill();
                        dTxt(`SUSPENDIDO`, px + pw / 2, py + ph / 2, pw * 0.1, '900', '#FFF', 'center', true);
                        dTxt(`${sRem} DÍAS RESTANTES`, px + pw / 2, py + ph / 2 + pw * 0.1, pw * 0.05, '800', '#FFF', 'center');
                    } else if (isPlayerCritical(p)) {
                        ctx.fillStyle = '#ef4444';
                        ctx.beginPath();
                        ctx.roundRect(px, py + ph - pw * 0.18, pw, pw * 0.18, { bl: 40, br: 40 });
                        ctx.fill();
                        dTxt("⚠️ ALERTA ROJA", px + pw / 2, py + ph - pw * 0.07, pw * 0.045, '900', '#FFF', 'center');
                    } 
                    ctx.restore(); 
                };

                // LÓGICA DE ESCALADO INFINITO 
                if (renderStudio.type === 'viral' || renderStudio.type === 'program') {
                    cvs.width = 2160; 
                    
                    // Cálculo de altura dinámica para no cortar nada
                    if (renderStudio.type === 'viral') {
                        const vt = renderStudio.data;
                        const requiredHeight = 1000 + (vt.length * (220 + 45)) + 400; 
                        cvs.height = Math.max(3840, requiredHeight);
                    } else if (renderStudio.type === 'program') {
                        const md = renderStudio.data;
                        const requiredHeight = 1000 + (md.length * (320 + 70)) + 400;
                        cvs.height = Math.max(3840, requiredHeight);
                    }
                    
                    // Fondo adaptado a la altura dinámica
                    const bgG = ctx.createRadialGradient(cvs.width/2, cvs.height/2, 0, cvs.width/2, cvs.height/2, Math.max(cvs.width, cvs.height)); 
                    bgG.addColorStop(0, stConf.bg === '#F8FAFC' ? '#F8FAFC' : '#0f172a'); 
                    bgG.addColorStop(1, stConf.bg === '#F8FAFC' ? '#E2E8F0' : '#020617'); 
                    ctx.fillStyle = bgG; 
                    ctx.fillRect(0, 0, cvs.width, cvs.height);
                    
                    if (stConf.bg !== '#F8FAFC') {
                        ctx.filter = 'blur(200px)';
                        ctx.globalAlpha = 0.5;
                        ctx.fillStyle = stConf.primary;
                        ctx.beginPath();
                        ctx.arc(500, 500, 600, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = stConf.accent;
                        ctx.beginPath();
                        ctx.arc(1600, cvs.height - 800, 800, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.filter = 'none';
                        ctx.globalAlpha = 1.0;
                    }
                    
                    const ml = await loadImg(leagueSettings.customLogo); 
                    if (ml) {
                        const lz = 250 * (leagueSettings.logoSize / 100); 
                        ctx.save();
                        ctx.shadowColor = stConf.primary;
                        ctx.shadowBlur = 30;
                        ctx.drawImage(ml, 1080 - lz / 2, 250, lz, lz);
                        ctx.restore();
                    }
                    
                    dTxt(leagueSettings.leagueName || 'LIGA', 1080, 620, 85, '900', stConf.text, 'center', true); 
                    dTxt(renderStudio.type === 'viral' ? 'CLASIFICACIÓN OFICIAL' : 'CARTELERA DE PARTIDOS', 1080, 710, 50, '800', stConf.primary, 'center', true);
                    
                    ctx.fillStyle = stConf.accent; 
                    ctx.beginPath(); 
                    ctx.roundRect(830, 760, 500, 70, 35); 
                    ctx.fill(); 
                    
                    dTxt(`JORNADA ${leagueSettings.jornada} • ${leagueSettings.matchDay}`, 1080, 808, 32, '900', '#000', 'center');
                    
                    if (renderStudio.type === 'viral') {
                        const vt = renderStudio.data; 
                        const rh = 220, g = 45, sy = 1000;
                        const cls = { pj: 1200, g: 1350, e: 1500, p: 1650, gf: 1800, pts: 1950 };
                        
                        dTxt('POS', 200, sy - 30, 35, '800', stConf.accent, 'center'); 
                        dTxt('CLUB', 350, sy - 30, 35, '800', stConf.accent); 
                        Object.entries(cls).forEach(([k, x]) => dTxt(k.toUpperCase(), x, sy - 30, 35, '800', k === 'pts' ? stConf.primary : stConf.accent, 'center'));
                        
                        for (let i = 0; i < vt.length; i++) {
                            const t = vt[i];
                            const y = sy + i * (rh + g);
                            const ty = y + rh / 2 + 18; 
                            let pc = stConf.text, gl = null; 
                            
                            if (i === 0) { pc = '#FBBF24'; gl = '#FBBF24'; } 
                            else if (i === 1) { pc = '#CBD5E1'; gl = '#CBD5E1'; } 
                            else if (i === 2) { pc = '#B45309'; gl = '#B45309'; } 
                            
                            dCard(100, y, 1960, rh, 40, gl); 
                            
                            ctx.fillStyle = pc === stConf.text ? stConf.primary : pc; 
                            ctx.beginPath();
                            ctx.roundRect(100, y, 20, rh, { tl: 40, bl: 40 });
                            ctx.fill(); 
                            
                            dTxt(`${i + 1}`, 200, ty, 65, '900', pc, 'center', true); 
                            
                            const tl = await loadImg(getSafeLogo(t, leagueSettings.divisions)); 
                            if (tl) {
                                ctx.save();
                                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                                ctx.shadowBlur = 10;
                                ctx.drawImage(tl, 350 - rh * 0.35, y + rh / 2 - rh * 0.35, rh * 0.7, rh * 0.7);
                                ctx.restore();
                            } 
                            
                            dTxt(String(t.name).substring(0, 22), 480, ty - 10, 60, '900', stConf.text, 'left', true); 
                            dTxt(`Racha: ${t.form.join(' ')}`, 480, ty + 40, 30, '700', stConf.accent); 
                            dTxt(String(t.pj), cls.pj, ty, 50, '800', stConf.text, 'center'); 
                            dTxt(String(t.g), cls.g, ty, 50, '800', '#10B981', 'center'); 
                            dTxt(String(t.e), cls.e, ty, 50, '800', stConf.text, 'center'); 
                            dTxt(String(t.p), cls.p, ty, 50, '800', '#F43F5E', 'center'); 
                            dTxt(String(t.gf), cls.gf, ty, 50, '800', stConf.text, 'center'); 
                            
                            ctx.fillStyle = 'rgba(0,0,0,0.3)'; 
                            ctx.beginPath();
                            ctx.roundRect(cls.pts - 60, y + 20, 120, rh - 40, 20);
                            ctx.fill(); 
                            
                            dTxt(String(t.pts), cls.pts, ty + 5, 75, '900', pc === stConf.text ? stConf.primary : pc, 'center', true); 
                        }
                    } else {
                        const md = renderStudio.data; 
                        const rh = 320, g = 70, sy = 1000;
                        for (let i = 0; i < md.length; i++) { // Bucle completo dinámico (ya no se limita a 8)
                            const m = md[i];
                            const y = sy + i * (rh + g); 
                            dCard(150, y, 1860, rh, 50, stConf.primary); 
                            const t1 = allSortedTeams.find(t => t.id === m.t1Id);
                            const t2 = allSortedTeams.find(t => t.id === m.t2Id); 
                            const l1 = await loadImg(getSafeLogo(t1, leagueSettings.divisions));
                            const l2 = await loadImg(getSafeLogo(t2, leagueSettings.divisions)); 
                            
                            if (l1) {
                                ctx.save();
                                ctx.shadowColor = 'rgba(0,0,0,0.6)';
                                ctx.shadowBlur = 20;
                                ctx.drawImage(l1, 260, y + rh / 2 - 110, 220, 220);
                                ctx.restore();
                            } 
                            
                            dTxt(String(t1?.name || 'TBD').substring(0, 16), 530, y + rh / 2 + 25, 75, '900', stConf.text, 'left', true); 
                            
                            ctx.fillStyle = stConf.bg === '#F8FAFC' ? '#E2E8F0' : '#0F172A'; 
                            ctx.beginPath();
                            ctx.arc(1080, y + rh / 2, 70, 0, Math.PI * 2);
                            ctx.fill(); 
                            ctx.strokeStyle = stConf.primary;
                            ctx.lineWidth = 4;
                            ctx.stroke(); 
                            
                            dTxt('VS', 1080, y + rh / 2 + 20, 60, '900', stConf.accent, 'center'); 
                            
                            if (l2) {
                                ctx.save();
                                ctx.shadowColor = 'rgba(0,0,0,0.6)';
                                ctx.shadowBlur = 20;
                                ctx.drawImage(l2, 1680, y + rh / 2 - 110, 220, 220);
                                ctx.restore();
                            } 
                            
                            dTxt(String(t2?.name || 'TBD').substring(0, 16), 1630, y + rh / 2 + 25, 75, '900', stConf.text, 'right', true); 
                            
                            if (m.time) {
                                ctx.fillStyle = stConf.primary;
                                ctx.beginPath();
                                ctx.roundRect(950, y + rh - 40, 260, 80, 40);
                                ctx.fill();
                                dTxt(String(m.time), 1080, y + rh + 15, 45, '900', '#FFF', 'center');
                            } 
                        }
                    }
                    await dSpon(1080, cvs.height - 200); // Sponsor siempre abajo
                } else if (renderStudio.type === 'playerCard') {
                    const { team, player } = renderStudio.data; 
                    cvs.width = 2160; 
                    cvs.height = 3840;
                    
                    const bgG = ctx.createRadialGradient(1080, 1920, 0, 1080, 1920, 2500); 
                    bgG.addColorStop(0, '#0f172a'); 
                    bgG.addColorStop(1, '#020617'); 
                    ctx.fillStyle = bgG; 
                    ctx.fillRect(0, 0, 2160, 3840);
                    
                    await dPlr(player, 280, 500, 1600, 2500); 
                    
                    const tl = await loadImg(getSafeLogo(team, leagueSettings.divisions)); 
                    if (tl) {
                        ctx.save();
                        ctx.globalAlpha = 0.1;
                        ctx.drawImage(tl, 480, 1320, 1200, 1200);
                        ctx.restore();
                    } 
                    await dSpon(1080, cvs.height - 250);
                } else if (renderStudio.type === 'roster') {
                    const tData = renderStudio.data; 
                    cvs.width = 7680; 
                    
                    const rp = tData.players || []; 
                    const c = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(rp.length))));
                    const r = Math.ceil(rp.length / c);
                    const gx = 120, gy = 150; 
                    let cw = 950, ch = 1500; 

                    // Escala dinámica para no cortar jugadores de plantillas largas
                    const requiredHeight = 1550 + (r * ch) + ((Math.max(r - 1, 0)) * gy) + 600;
                    cvs.height = Math.max(4320, requiredHeight);
                    
                    const bgG = ctx.createRadialGradient(cvs.width/2, cvs.height/2, 0, cvs.width/2, cvs.height/2, Math.max(cvs.width, cvs.height)); 
                    bgG.addColorStop(0, '#0f172a'); 
                    bgG.addColorStop(1, '#020617'); 
                    ctx.fillStyle = bgG; 
                    ctx.fillRect(0, 0, cvs.width, cvs.height);
                    
                    const tlSrc = getSafeLogo(tData, leagueSettings.divisions);
                    const dc = await getDominantColor(tlSrc); 
                    ctx.strokeStyle = dc; 
                    ctx.lineWidth = 60; 
                    ctx.strokeRect(30, 30, cvs.width - 60, cvs.height - 60); // Borde ajustado al nuevo height
                    
                    const ml = await loadImg(leagueSettings.customLogo); 
                    if (ml) {
                        ctx.save();
                        ctx.shadowColor = stConf.primary;
                        ctx.shadowBlur = 30;
                        ctx.drawImage(ml, 150, 150, 400, 400);
                        ctx.restore();
                    } 
                    
                    dTxt(leagueSettings.leagueName || 'LIGA', 600, 320, 140, '900', stConf.text, 'left', true); 
                    dTxt(leagueSettings.leagueSubtitle || 'LMS', 600, 450, 70, '800', stConf.accent);
                    
                    const tl = await loadImg(tlSrc); 
                    if (tl) {
                        ctx.save();
                        ctx.shadowColor = dc;
                        ctx.shadowBlur = 100;
                        ctx.drawImage(tl, 3490, 250, 700, 700);
                        ctx.restore();
                    } 
                    
                    dTxt(`PLANTILLA OFICIAL`, 3840, 1150, 160, '900', stConf.accent, 'center'); 
                    dTxt(String(tData.name).toUpperCase(), 3840, 1400, 260, '900', stConf.text, 'center', true);
                    
                    if (rp.length > 0) {
                        const gridW = Math.min(rp.length, c) * cw + (Math.min(rp.length, c) - 1) * gx;
                        const sx = (cvs.width - gridW) / 2;
                        const sy = 1550; 
                        
                        for (let i = 0; i < rp.length; i++) {
                            await dPlr(rp[i], sx + (i % c) * (cw + gx), sy + Math.floor(i / c) * (ch + gy), cw, ch);
                        }
                    } 
                    await dSpon(cvs.width / 2, cvs.height - 250);
                }
            } catch(e) { console.error(e); } finally { setIsRenderingPreview(false); }
        }, 100);
        return () => clearTimeout(tId);
    }, [renderStudio.active, renderStudio.settings, renderStudio.type, PREMIUM_STYLES, leagueSettings, allSortedTeams]);

    if (!authChecked || isDataLoaded === false && user) return <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white"><Activity size={40} className="text-cyan-500 mb-4 animate-pulse"/><h2 className="text-sm font-black uppercase text-cyan-500 font-jetbrains tracking-widest">Iniciando OS...</h2></div>;

    if (!user) return <LoginScreen />;

    return (
        <div 
            className="w-screen h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#020617] text-slate-200 font-sans relative flex flex-col custom-scrollbar" 
            style={{'--theme-color': theme.hex}}
            onMouseMove={handleGlobalPointer}
            onTouchMove={handleGlobalPointer}
        >
            <style dangerouslySetInnerHTML={{__html: DASHBORINO_STYLES}} />
            
            <BackgroundEngine themeColor={theme.hex} mouseRef={mouseRef} />

            {role === 'admin' && (
                <div className="w-full bg-[#020617]/80 border-b border-white/10 p-2 flex justify-center items-center gap-2 z-50 sticky top-0 backdrop-blur-xl">
                    <span className="text-[10px] font-black uppercase text-white/50 mr-2 flex items-center gap-1 font-jetbrains"><Smartphone size={12}/> Vistas de Simulación:</span>
                    <div className="flex bg-black/40 rounded-lg border border-white/10 overflow-hidden shadow-inner">
                        <button onClick={()=>setAppMode('admin')} className={`px-4 py-1.5 text-[9px] font-black uppercase transition-colors font-outfit tracking-wider ${appMode==='admin'?'bg-blue-600/80 text-white':'text-slate-400 hover:bg-white/10'}`}>Admin</button>
                        <button onClick={()=>setAppMode('user1')} className={`px-4 py-1.5 text-[9px] font-black uppercase transition-colors border-l border-white/5 font-outfit tracking-wider ${appMode==='user1'?'bg-cyan-600/80 text-white':'text-slate-400 hover:bg-white/10'}`}>Jugador 1</button>
                        <button onClick={()=>setAppMode('user2')} className={`px-4 py-1.5 text-[9px] font-black uppercase transition-colors border-l border-white/5 font-outfit tracking-wider ${appMode==='user2'?'bg-magenta-600/80 text-white':'text-slate-400 hover:bg-white/10'}`}>Jugador 2</button>
                    </div>
                </div>
            )}

            {role !== 'admin' && (
                <div className="w-full bg-[#020617]/80 border-b border-white/10 p-2 flex justify-between items-center z-50 sticky top-0 backdrop-blur-xl h-[48px]">
                    <span className="text-[10px] font-black uppercase text-cyan-500/50 ml-2 font-jetbrains"><Activity size={12} className="inline mr-1"/> Nodo Activo</span>
                    <div className="flex items-center">
                        <span className="text-[10px] text-slate-400 font-jetbrains mr-3">{user.email}</span>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"><LogOut size={14}/></button>
                    </div>
                </div>
            )}

            {appMode === 'admin' ? (
                <>
                    <div className="w-full glass-panel border-none border-b border-white/10 py-2 px-5 flex justify-between items-center z-40 relative shadow-md">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 font-jetbrains tracking-widest"><div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{backgroundColor: theme.hex, color: theme.hex}} /> {uiState.view}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest mr-2 flex items-center gap-1 font-outfit" style={{textShadow: '0 0 10px rgba(212,175,55,0.5)'}}><Sparkles size={14}/> Admin</span>
                            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"><LogOut size={16}/></button>
                        </div>
                    </div>
                    
                    <main className="flex-1 flex flex-col w-full relative z-10 pb-32">
                        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6 h-full">
                            <header className="relative z-[60] flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className="w-16 h-16 flex items-center justify-center shrink-0 glass-panel rounded-2xl p-2 shadow-inner border border-white/20">
                                            <img src={leagueSettings.customLogo || "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Soccerball.svg/500px-Soccerball.svg.png"} alt="Logo" className="max-w-full max-h-full object-contain filter drop-shadow-md" />
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <h1 className="text-3xl font-black uppercase text-white leading-none tracking-widest truncate font-outfit" style={{textShadow: `0 0 20px ${theme.hex}80`}}>{leagueSettings.leagueName}</h1>
                                            <span className="text-[10px] font-black tracking-widest uppercase text-transparent bg-clip-text mt-1.5 truncate font-jetbrains" style={{backgroundImage: `linear-gradient(to right, ${theme.hex}, #FFF)`}}>{leagueSettings.leagueSubtitle}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => updateUi('showGuides', !uiState.showGuides)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-colors tracking-widest ${uiState.showGuides ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'glass-panel text-slate-400'}`}><HelpCircle size={14}/> Guía</button>
                                </div>
                                <AdCarousel ads={leagueSettings.ads} />
                            </header>

                            {uiState.showGuides && GUIDES[uiState.view] && (
                                <div className="glass-panel p-5 rounded-3xl border-l-[3px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-fade-in relative overflow-hidden" style={{borderLeftColor: theme.hex}}>
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                                    <h3 className="text-xs font-black uppercase text-white mb-4 flex items-center gap-2 tracking-widest font-outfit relative z-10"><Settings2 size={16}/> Protocolo de Operación</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                                        {GUIDES[uiState.view].map((g, i) => (
                                            <div key={i} className="flex flex-col gap-1.5"><span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider font-jetbrains">{i+1}. {g.title}</span><span className="text-xs text-slate-400 leading-relaxed">{g.desc}</span></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {uiState.view === 'dashboard' && (
                                <div className="flex flex-col gap-6 animate-fade-in">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="glass-panel rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                                            <CalendarDays size={60} className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500" />
                                            <span className="text-3xl font-black text-cyan-400 font-jetbrains" style={{textShadow: '0 0 15px rgba(6,182,212,0.5)'}}>{leagueSettings.jornada}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 font-outfit">Jornada</span>
                                        </div>
                                        <div className="glass-panel rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                                            <Calendar size={60} className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500" />
                                            <span className="text-xl font-black text-emerald-400 font-jetbrains" style={{textShadow: '0 0 15px rgba(16,185,129,0.5)'}}>{leagueSettings.matchDay}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 font-outfit">Fecha</span>
                                        </div>
                                        <div className="glass-panel rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                                            <Activity size={60} className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500" />
                                            <span className="text-3xl font-black text-magenta-400 font-jetbrains" style={{textShadow: '0 0 15px rgba(217,70,239,0.5)'}}>{liveMatches.filter(m => m.status === 'live').length}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 font-outfit">En Juego</span>
                                        </div>
                                    </div>
                                    
                                    <section className="glass-panel rounded-3xl p-5 md:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 pb-4 border-b border-white/10 gap-4 relative z-10">
                                            <h3 className="text-sm font-black text-white uppercase flex items-center gap-3 tracking-widest font-outfit"><span className="w-2.5 h-2.5 rounded-full animate-pulse bg-cyan-500 shadow-[0_0_10px_#06b6d4]"/> Live Center</h3>
                                            {jornadaSummary.length > 0 && (
                                                <div className="flex gap-3">
                                                    <button onClick={() => updateUi('modal', 'jornada')} className="text-[10px] text-slate-300 hover:text-white glass-panel px-4 py-2 rounded-xl border border-white/10 uppercase tracking-widest active:scale-95 transition-all"><Edit3 size={14} className="inline mr-1.5"/> Revisar Buffer</button>
                                                    <button onClick={cloudFn_commitJornada} className="bg-emerald-600/90 text-white border border-emerald-500/50 font-black text-[10px] px-5 py-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] uppercase tracking-widest active:scale-95 transition-all"><Database size={14} className="inline mr-1.5"/> Impactar ({jornadaSummary.length})</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-2 relative z-10">
                                            {liveMatches.length === 0 && <div className="col-span-full py-10 text-slate-500 text-center border border-dashed border-white/10 rounded-2xl font-jetbrains uppercase tracking-widest text-xs">Sin señales de partidos.</div>}
                                            {[...liveMatches].sort((a, b) => (a.status === 'live' ? -1 : 1) - (b.status === 'live' ? -1 : 1)).map(match => (
                                                <div key={match.id} className={`glass-panel rounded-2xl p-5 flex flex-col gap-4 relative transition-all duration-300 ${match.status === 'live' ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-white/5'}`}>
                                                    <div className="flex justify-between items-center bg-black/40 rounded-xl p-2 border border-white/5 shadow-inner">
                                                        <span className={`text-[10px] font-black uppercase ml-2 flex items-center gap-2 font-jetbrains ${match.status === 'live' ? 'text-cyan-400' : 'text-slate-400'}`}>{match.status === 'scheduled' ? <><div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]"/> PRG</> : <><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]"/> VIVO</>}</span>
                                                        {match.status === 'live' ? (
                                                            <button onClick={() => finishLiveMatch(match)} className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest"><Square size={12} className="inline mr-1"/> Fin</button>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <button onClick={() => setEditingMatchId(editingMatchId === match.id ? null : match.id)} className={`p-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${editingMatchId === match.id ? 'bg-cyan-600/80 text-white' : 'glass-panel text-slate-400 hover:text-white'}`}><Settings2 size={14}/></button>
                                                                <button onClick={() => cancelLiveMatchSchedule(match.id)} className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X size={16}/></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {match.status === 'scheduled' ? (
                                                        <div className="flex flex-col justify-center gap-4">
                                                            {editingMatchId === match.id ? (
                                                                <div className="flex flex-col gap-2 p-3 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                                                                    <select value={match.t1Id} onChange={e => updateLiveMatch(match.id, 't1Id', e.target.value)} className="bg-black/60 p-2 rounded-lg text-[11px] text-white border border-white/10 outline-none font-outfit uppercase tracking-wider">{allSortedTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                                                                    <div className="text-center text-[10px] text-slate-500 font-black font-jetbrains">VS</div>
                                                                    <select value={match.t2Id} onChange={e => updateLiveMatch(match.id, 't2Id', e.target.value)} className="bg-black/60 p-2 rounded-lg text-[11px] text-white border border-white/10 outline-none font-outfit uppercase tracking-wider">{allSortedTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm font-black text-white text-center truncate font-outfit tracking-wider">{getTeamName(match.t1Id)} <span className="text-cyan-500/50 mx-2 text-[10px]">vs</span> {getTeamName(match.t2Id)}</div>
                                                            )}
                                                            <div className="text-center"><span className="text-[10px] font-bold text-slate-400 glass-panel px-3 py-1.5 rounded-lg border border-white/5 font-jetbrains tracking-wider">{match.date} a las {match.time || 'TBD'}</span></div>
                                                            <button onClick={() => startLiveMatch(match.id)} className="w-full bg-cyan-600/90 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all"><Play size={14} className="inline mr-1.5"/> INICIAR TRANSMISIÓN</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between gap-4 h-[110px]">
                                                            {[1, 2].map(n => (
                                                                <div key={n} className="flex-1 flex flex-col gap-3 min-w-0">
                                                                    <div className="text-center font-bold text-xs text-slate-300 truncate font-outfit tracking-wider">{getTeamName(match[`t${n}Id`])}</div>
                                                                    <div className="flex justify-between items-center gap-1 bg-black/40 rounded-xl p-2 border border-white/5 shadow-inner">
                                                                        <button onClick={() => updateLiveMatch(match.id, `g${n}`, Math.max(0, match[`g${n}`] - 1))} className="text-slate-500 p-2 rounded-lg hover:bg-white/10 active:scale-90 transition-all"><Minus size={16}/></button>
                                                                        <span className="text-4xl font-black text-white font-jetbrains" style={{textShadow: '0 0 15px rgba(255,255,255,0.3)'}}>{match[`g${n}`]}</span>
                                                                        <button onClick={() => updateLiveMatch(match.id, `g${n}`, match[`g${n}`] + 1)} className="p-2 rounded-lg hover:bg-white/10 text-cyan-400 active:scale-90 transition-all"><Plus size={16}/></button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                    
                                    <PremiumCard theme={theme} className="p-0 bg-transparent rounded-3xl overflow-hidden">
                                        <div className="p-4 md:p-5 border-b border-white/10 bg-gradient-to-r from-black/60 to-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xs font-black text-white uppercase flex items-center gap-2 tracking-widest font-outfit"><List size={18} className="text-cyan-500"/> Clasificación</h3>
                                                {uiState.isEditingTable && <button onClick={handleAddTeam} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-magenta-500/20 text-magenta-400 border border-magenta-500/50 text-[10px] font-bold uppercase tracking-wider hover:bg-magenta-500/30 transition-colors"><Plus size={14}/> Añadir</button>}
                                            </div>
                                            <div className="flex flex-wrap gap-2.5 items-center">
                                                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer transition-all ${uiState.isImporting ? 'bg-magenta-500/20 text-magenta-400 border-magenta-500/50' : 'glass-panel text-magenta-400 hover:bg-white/5 border-white/10'}`}>
                                                    {uiState.isImporting ? <Activity size={16} className="animate-pulse"/> : <FileSpreadsheet size={16}/>} 
                                                    IMPORTAR CSV
                                                    <input type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files[0]) handleExcelImport(e, activeDivision); }} disabled={uiState.isImporting}/>
                                                </label>
                                                <button onClick={() => updateUi('isEditingTable', !uiState.isEditingTable)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${uiState.isEditingTable ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'glass-panel text-slate-300 hover:bg-white/5 border-white/10'}`}>
                                                    {uiState.isEditingTable ? <><Save size={16}/> GUARDAR</> : <><Edit3 size={16}/> EDITAR</>}
                                                </button>
                                                <button onClick={() => openRenderStudio('viral', visibleTeams)} className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-black text-[10px] bg-cyan-600/90 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform"><Camera size={16}/> RENDER</button>
                                            </div>
                                        </div>
                                        <div className="w-full overflow-x-auto custom-scrollbar bg-black/20">
                                            <table className="w-full text-left min-w-[800px]">
                                                <thead><tr className="text-[10px] text-slate-500 uppercase font-black tracking-widest bg-black/40 border-b border-white/10 font-outfit">{['Pos', 'Club', 'Tend', 'PJ', 'G', 'E', 'P', 'GF:GC', 'DIF', 'Racha', 'PTS'].map((h, i) => <th key={h} className={`py-4 px-3 ${i===0||i>1?'text-center':''}`}>{h}</th>)}</tr></thead>
                                                <tbody className="text-xs font-semibold font-jetbrains tracking-wider">
                                                    {visibleTeams.map((team, index) => { 
                                                        const goalDiff = team.gf - team.gc; 
                                                        const safeLogo = getSafeLogo(team, leagueSettings.divisions);
                                                        return (
                                                            <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                                <td className="py-3 px-2 text-center text-slate-400 text-[11px] font-black">{index + 1}</td>
                                                                <td className="py-3 px-3 min-w-[200px] cursor-pointer" onClick={() => !uiState.isEditingTable && updateUi('activeRosterTeamId', team.id)}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg overflow-hidden glass-panel flex items-center justify-center shrink-0 border-white/10 group-hover:border-cyan-500/50 transition-colors"><img src={safeLogo} className="object-contain w-full h-full p-0.5" alt="T"/></div>
                                                                        {uiState.isEditingTable ? (
                                                                            <div className="flex items-center gap-2 w-full"><input type="text" defaultValue={team.name} onBlur={e => handleUpdateTeamData(team.id, 'name', String(e.target.value).toUpperCase())} className="bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-white font-black text-[11px] outline-none w-full uppercase font-outfit" /><button onClick={() => handleDeleteTeam(team.id)} className="text-rose-500 p-1 hover:bg-rose-500/20 rounded"><Trash2 size={14}/></button></div>
                                                                        ) : (<span className="font-black text-[12px] text-slate-200 truncate font-outfit tracking-wider">{team.name}</span>)}
                                                                    </div>
                                                                </td>
                                                                <td className="p-3 text-center bg-black/20 text-slate-600 border-x border-white/5"><Minus size={16} className="mx-auto"/></td>
                                                                <td className="p-3 text-center text-sm">{uiState.isEditingTable ? <input type="number" defaultValue={team.pj} onBlur={e => handleDirectEdit(team.id, 'pj', e.target.value)} className="w-10 bg-black/60 border border-white/10 rounded-lg text-center text-cyan-400 py-1"/> : <span className="text-cyan-400">{team.pj}</span>}</td>
                                                                <td className="p-3 text-center text-sm">{uiState.isEditingTable ? <input type="number" defaultValue={team.g} onBlur={e => handleDirectEdit(team.id, 'g', e.target.value)} className="w-10 bg-black/60 border border-white/10 rounded-lg text-center text-emerald-400 py-1"/> : <span className="text-emerald-400">{team.g}</span>}</td>
                                                                <td className="p-3 text-center text-sm">{uiState.isEditingTable ? <input type="number" defaultValue={team.e} onBlur={e => handleDirectEdit(team.id, 'e', e.target.value)} className="w-10 bg-black/60 border border-white/10 rounded-lg text-center text-slate-400 py-1"/> : <span className="text-slate-400">{team.e}</span>}</td>
                                                                <td className="p-3 text-center text-sm">{uiState.isEditingTable ? <input type="number" defaultValue={team.p} onBlur={e => handleDirectEdit(team.id, 'p', e.target.value)} className="w-10 bg-black/60 border border-white/10 rounded-lg text-center text-rose-400 py-1"/> : <span className="text-rose-400">{team.p}</span>}</td>
                                                                <td className="p-3 text-center bg-black/40 border-x border-white/5 shadow-inner">
                                                                    {uiState.isEditingTable ? (
                                                                        <div className="flex justify-center gap-1.5 items-center">
                                                                            <input type="number" defaultValue={team.gf} onBlur={e=>handleDirectEdit(team.id, 'gf', e.target.value)} className="w-10 bg-black/60 border border-white/10 rounded-lg text-center text-emerald-400 py-1 text-xs"/>
                                                                            <span className="text-slate-600">:</span>
                                                                            <input type="number" defaultValue={team.gc} onBlur={e=>handleDirectEdit(team.id, 'gc', e.target.value)} className="w-10 bg-black/60 border border-white/10 rounded-lg text-center text-rose-400 py-1 text-xs"/>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center gap-1.5"><span className="text-emerald-400">{team.gf}</span><span className="text-slate-600">:</span><span className="text-rose-400">{team.gc}</span></div>
                                                                    )}
                                                                </td>
                                                                <td className="p-3 text-center"><span className={`px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 font-black text-xs shadow-inner ${goalDiff>0?'text-cyan-400':goalDiff<0?'text-rose-400':'text-slate-500'}`}>{goalDiff>0?`+${goalDiff}`:goalDiff}</span></td>
                                                                <td className="p-3 text-center"><div className="flex gap-1.5 justify-center">{team.form.map((f, i) => <span key={i} className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center border font-outfit ${f==='G'?'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_5px_rgba(16,185,129,0.3)]':f==='P'?'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_5px_rgba(244,63,94,0.3)]':f==='E'?'bg-slate-500/20 text-slate-300 border-slate-500/50':'glass-panel text-transparent border-white/5'}`}>{f}</span>)}</div></td>
                                                                <td className="p-3 text-center text-2xl font-black bg-emerald-900/10 border-l border-emerald-500/20 relative">
                                                                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
                                                                    {uiState.isEditingTable ? <input type="number" defaultValue={team.pts} onBlur={e => handleDirectEdit(team.id, 'pts', e.target.value)} className="w-14 bg-black/80 border border-emerald-500/30 rounded-lg text-center text-emerald-400 py-1 shadow-inner"/> : <span className="text-emerald-400" style={{textShadow: '0 0 10px rgba(16,185,129,0.4)'}}>{team.pts}</span>}
                                                                </td>
                                                            </tr>
                                                        ); 
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </PremiumCard>
                                </div>
                            )}

                            {uiState.view === 'calendario' && (
                                <div className="flex flex-col gap-5 animate-fade-in">
                                    <div className="glass-panel p-5 sm:p-6 rounded-3xl gap-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                                        <h2 className="text-xl font-black uppercase text-white flex items-center gap-3 tracking-widest font-outfit relative z-10"><CalendarDays size={24} className="text-cyan-500"/> Programador Central</h2>
                                        <div className="flex flex-col md:flex-row gap-5 glass-panel p-4 rounded-2xl relative z-10">
                                            <div className="flex flex-col gap-2 flex-1">
                                                <label className="text-[10px] font-black uppercase text-cyan-400 tracking-widest font-jetbrains"><Trophy size={12} className="inline mr-1.5"/> Selector de Jornada</label>
                                                <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar snap-x">{Array.from({length: 30}, (_, i) => i + 1).map(j => <button key={j} onClick={() => setLeagueSettings(p => ({...p, jornada: j.toString()}))} className={`snap-center shrink-0 w-10 h-10 rounded-xl font-black text-sm border transition-all duration-200 ${leagueSettings.jornada === j.toString() ? 'bg-cyan-600/90 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-black/60 text-slate-500 border-white/5 hover:bg-white/10'}`}>{j}</button>)}</div>
                                            </div>
                                            <div className="w-px bg-white/10 hidden md:block" />
                                            <div className="flex flex-col gap-2 flex-1">
                                                <label className="text-[10px] font-black uppercase text-cyan-400 tracking-widest font-jetbrains"><Calendar size={12} className="inline mr-1.5"/> Fecha Global</label>
                                                <div className="flex gap-2">
                                                    <select value={calDate.day} onChange={e => setCalDate(p => ({...p, day: parseInt(e.target.value)}))} className="glass-panel text-white p-2.5 rounded-xl outline-none flex-1 font-jetbrains text-sm text-center appearance-none cursor-pointer hover:bg-white/5">{Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}</select>
                                                    <select value={calDate.month} onChange={e => setCalDate(p => ({...p, month: parseInt(e.target.value)}))} className="glass-panel text-white p-2.5 rounded-xl outline-none flex-1 font-jetbrains text-sm text-center appearance-none cursor-pointer hover:bg-white/5">{MONTHS.map((m, i) => <option key={i} value={i + 1} className="bg-slate-900">{m}</option>)}</select>
                                                    <select value={calDate.year} onChange={e => setCalDate(p => ({...p, year: parseInt(e.target.value)}))} className="glass-panel text-white p-2.5 rounded-xl outline-none flex-1 font-jetbrains text-sm text-center appearance-none cursor-pointer hover:bg-white/5">{YEARS.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}</select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 relative z-10">
                                        {calendarMatches.map(match => (
                                            <div key={match.id} className="glass-panel p-5 rounded-3xl flex flex-col md:flex-row gap-5 shadow-lg border-l-4 border-l-cyan-500/50 hover:border-l-cyan-400 transition-colors">
                                                <div className="flex-1 flex flex-col md:flex-row gap-4 items-center w-full">
                                                    <select value={match.t1Id} onChange={e => updateCalendarMatch(match.id, 't1Id', e.target.value)} className="w-full bg-black/60 border border-white/10 p-3 rounded-xl text-white outline-none font-outfit uppercase tracking-wider text-xs focus:border-cyan-500 transition-colors"><option value="">Seleccionar Local</option>{allSortedTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
                                                    <span className="text-[10px] font-black text-slate-500 font-jetbrains bg-black/40 px-2 py-1 rounded">VS</span>
                                                    <select value={match.t2Id} onChange={e => updateCalendarMatch(match.id, 't2Id', e.target.value)} className="w-full bg-black/60 border border-white/10 p-3 rounded-xl text-white outline-none font-outfit uppercase tracking-wider text-xs focus:border-cyan-500 transition-colors"><option value="">Seleccionar Visita</option>{allSortedTeams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
                                                </div>
                                                <div className="flex gap-3">
                                                    <input type="date" value={match.date || leagueSettings.matchDay} onChange={e => updateCalendarMatch(match.id, 'date', e.target.value)} className="bg-black/60 border border-white/10 text-white p-3 rounded-xl outline-none font-jetbrains text-xs focus:border-cyan-500 transition-colors" />
                                                    <input type="time" value={match.time || ""} onChange={e => updateCalendarMatch(match.id, 'time', e.target.value)} className="bg-black/60 border border-white/10 text-white p-3 rounded-xl outline-none font-jetbrains text-xs focus:border-cyan-500 transition-colors" />
                                                    <button onClick={() => setCalendarMatches(p => p.filter(x => x.id !== match.id))} className="p-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-colors border border-rose-500/20"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                        <button onClick={() => setCalendarMatches(p => [...p, {id: Date.now(), t1Id: '', t2Id: '', date: '', time: '', analysis: null}])} className="flex-1 glass-panel hover:bg-white/10 text-slate-200 font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all active:scale-95"><Plus size={16} className="inline mr-2"/> Nuevo Bloque</button>
                                        <button onClick={handleProgramarYRenderizar} className="flex-[2] bg-cyan-600/90 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95 border border-cyan-400/50"><Camera size={16}/> Compilar & Renderizar Cartelera</button>
                                    </div>
                                </div>
                            )}

                            {uiState.view === 'directorio' && (
                                <div className="flex flex-col gap-5 animate-fade-in flex-1">
                                    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                                            <h2 className="text-xl font-black uppercase text-white tracking-widest font-outfit flex items-center gap-3"><FolderSearch size={24} className="text-amber-500"/> Data Directory</h2>
                                            <div className="relative w-full sm:w-auto">
                                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input type="text" placeholder="ID Jugador / Equipo..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} className="w-full sm:w-72 bg-black/60 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white outline-none font-jetbrains text-xs focus:border-amber-500 transition-colors shadow-inner" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2 relative z-10">
                                            {directoryResults.map(p => (
                                                <div key={p.id} onClick={() => updateUi('activePlayerCard', {tId: p.teamId, pId: p.id})} className="glass-panel p-4 rounded-2xl cursor-pointer flex gap-4 items-center hover:border-amber-500/50 hover:bg-white/5 transition-all group shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10 group-hover:border-amber-500/30 transition-colors">{p.photo ? <img src={p.photo} className="object-cover w-full h-full" alt="p"/> : <User className="text-slate-600 m-auto mt-3"/>}</div>
                                                    <div className="flex flex-col min-w-0 justify-center">
                                                        <h4 className="text-white text-sm font-black truncate font-outfit tracking-wider">{p.name}</h4>
                                                        <span className="text-amber-500/80 text-[9px] uppercase truncate font-jetbrains tracking-widest mt-0.5">{p.teamName}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {uiState.directorySearch && directoryResults.length === 0 && <div className="py-10 text-center font-jetbrains text-xs text-slate-500 uppercase tracking-widest">Sin resultados encontrados.</div>}
                                    </div>
                                </div>
                            )}

                            {uiState.view === 'notas' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in flex-1">
                                    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5 h-fit shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
                                        <h2 className="text-base font-black uppercase text-white tracking-widest font-outfit flex items-center gap-3 relative z-10"><ClipboardPaste size={20} className="text-purple-500"/> Registro Operativo</h2>
                                        <form onSubmit={handleAddReminder} className="flex gap-3 relative z-10">
                                            <input type="text" value={newReminderText} onChange={e => setNewReminderText(e.target.value)} placeholder="Añadir nota al sistema..." className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white outline-none font-outfit text-sm focus:border-purple-500 transition-colors shadow-inner" />
                                            <button type="submit" className="bg-purple-600/80 hover:bg-purple-500 text-white px-5 rounded-xl transition-colors border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"><Plus size={18}/></button>
                                        </form>
                                        <div className="flex flex-col gap-3 relative z-10">
                                            {agendaData.reminders?.map(rem => (
                                                <div key={rem.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${rem.completed ? 'glass-panel border-white/5 opacity-50' : 'bg-black/40 border-white/10 shadow-inner'}`}>
                                                    <button onClick={() => toggleReminder(rem.id)} className={`transition-colors hover:scale-110 ${rem.completed ? 'text-purple-500' : 'text-slate-600'}`}><CheckCircle size={18}/></button>
                                                    <p className={`flex-1 text-sm font-bold font-outfit ${rem.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{rem.text}</p>
                                                    <button onClick={() => deleteReminder(rem.id)} className="text-rose-500 hover:bg-rose-500/20 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                                </div>
                                            ))}
                                            {(!agendaData.reminders || agendaData.reminders.length === 0) && <p className="text-center text-xs text-slate-500 font-jetbrains py-4">Memoria vacía.</p>}
                                        </div>
                                    </div>
                                    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5 h-fit shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />
                                        <h2 className="text-base font-black uppercase text-white tracking-widest font-outfit flex items-center gap-3 relative z-10"><ShieldAlert size={20} className="text-rose-500"/> Logística Honorarios</h2>
                                        <form onSubmit={handleAddReferee} className="flex gap-2 relative z-10">
                                            <input type="text" value={newRefereeRecord.match} onChange={e => setNewRefereeRecord(p => ({...p, match: e.target.value}))} placeholder="Clave/Partido" className="w-[30%] bg-black/60 border border-white/10 rounded-xl px-3 py-3 text-white outline-none font-outfit text-xs focus:border-rose-500 transition-colors shadow-inner" />
                                            <input type="text" value={newRefereeRecord.referee} onChange={e => setNewRefereeRecord(p => ({...p, referee: e.target.value}))} placeholder="Árbitro" className="w-[40%] bg-black/60 border border-white/10 rounded-xl px-3 py-3 text-white outline-none font-outfit text-xs focus:border-rose-500 transition-colors shadow-inner" />
                                            <input type="number" value={newRefereeRecord.fee} onChange={e => setNewRefereeRecord(p => ({...p, fee: e.target.value}))} placeholder="Monto" className="w-[30%] bg-black/60 border border-white/10 rounded-xl px-3 py-3 text-white outline-none font-jetbrains text-xs focus:border-rose-500 transition-colors shadow-inner" />
                                            <button type="submit" className="bg-rose-600/80 hover:bg-rose-500 text-white px-4 rounded-xl transition-colors border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]"><Plus size={18}/></button>
                                        </form>
                                        <div className="flex flex-col gap-3 relative z-10">
                                            {agendaData.referees?.map(ref => (
                                                <div key={ref.id} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/10 shadow-inner">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm text-white font-black font-outfit truncate tracking-wider">{ref.match}</h4>
                                                        <span className="text-[10px] text-slate-400 font-jetbrains">{ref.referee} - <b className="text-emerald-400 font-black">${ref.fee}</b></span>
                                                    </div>
                                                    <button onClick={()=>toggleReferee(ref.id)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${ref.paid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'glass-panel text-slate-400 hover:text-white border-white/10'}`}>{ref.paid?'Liquidado':'Pendiente'}</button>
                                                    <button onClick={()=>deleteReferee(ref.id)} className="text-rose-500 hover:bg-rose-500/20 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                                </div>
                                            ))}
                                            {(!agendaData.referees || agendaData.referees.length === 0) && <p className="text-center text-xs text-slate-500 font-jetbrains py-4">No hay honorarios pendientes.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {uiState.view === 'config' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in flex-1">
                                    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] h-fit relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/10 rounded-full blur-[80px] pointer-events-none" />
                                        <h2 className="text-base font-black uppercase text-white tracking-widest font-outfit flex items-center gap-3 relative z-10"><Settings size={20} className="text-slate-400"/> Parámetros de Liga</h2>
                                        <div className="flex flex-col gap-2 relative z-10">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-jetbrains">Identificador Principal</label>
                                            <input type="text" value={leagueSettings.leagueName} onChange={e => setLeagueSettings(p => ({...p, leagueName: e.target.value}))} className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-black outline-none uppercase font-outfit tracking-wider focus:border-slate-500 transition-colors"/>
                                        </div>
                                        <div className="flex flex-col gap-2 relative z-10">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-jetbrains">Sub-Identificador</label>
                                            <input type="text" value={leagueSettings.leagueSubtitle} onChange={e => setLeagueSettings(p => ({...p, leagueSubtitle: e.target.value}))} className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-black outline-none uppercase font-outfit tracking-wider focus:border-slate-500 transition-colors"/>
                                        </div>
                                        <div className="flex items-center gap-5 mt-2 relative z-10">
                                            <div className="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center shrink-0 border border-white/20 p-2">
                                                {leagueSettings.customLogo ? <img src={leagueSettings.customLogo} className="max-w-full max-h-full object-contain filter drop-shadow-md" alt="Logo" /> : <ImageIcon size={20} className="text-slate-600"/>}
                                            </div>
                                            <label className="glass-panel px-4 py-3 rounded-xl text-[10px] text-slate-300 cursor-pointer font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2">
                                                <Upload size={14} className="text-slate-400"/> Actualizar Emblema
                                                <input type="file" accept="image/png" className="hidden" onChange={async e => { if (e.target.files[0]) { const img = await compressImage(e.target.files[0], 250, 0.8); setLeagueSettings(p => ({...p, customLogo: img})); } }} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] h-fit relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                                        <h2 className="text-base font-black uppercase text-white tracking-widest font-outfit flex items-center gap-3 relative z-10"><LayoutGrid size={20} className="text-blue-500"/> Nodos de División</h2>
                                        <div className="flex flex-col gap-3 relative z-10">
                                            {leagueSettings.divisions.map(div => (
                                                <div key={div.id} className="flex gap-3 bg-black/40 p-3 rounded-2xl border border-white/5 shadow-inner items-center">
                                                    <input type="color" value={div.hex} onChange={e => handleDivisionChange(div.id, 'hex', e.target.value)} className="w-10 h-10 rounded-xl border-0 bg-transparent cursor-pointer" />
                                                    <input type="text" defaultValue={div.name} onBlur={e => handleDivisionChange(div.id, 'name', e.target.value)} className="flex-1 bg-transparent text-white text-xs outline-none uppercase font-black tracking-widest font-outfit" />
                                                    <button onClick={() => handleDeleteDivision(div.id)} className="text-rose-500 p-2 hover:bg-rose-500/20 rounded-xl transition-colors"><Trash2 size={16}/></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={handleAddDivision} className="glass-panel hover:bg-white/10 text-slate-200 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10 active:scale-95 mt-2 flex items-center justify-center gap-2"><Plus size={16} /> Inicializar Nuevo Nodo</button>
                                    </div>

                                    {/* MÓDULO: CARRUSEL PUBLICITARIO (CONFIG) */}
                                    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] col-span-full relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />
                                        <div className="flex justify-between items-center relative z-10">
                                            <h2 className="text-base font-black uppercase text-white tracking-widest font-outfit flex items-center gap-3"><Megaphone size={20} className="text-yellow-500"/> Config. Carrusel Publicitario</h2>
                                            <label className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-2">
                                                <Upload size={14}/> Añadir Imagen
                                                <input type="file" accept="image/*" className="hidden" onChange={handleAddAd} />
                                            </label>
                                        </div>
                                        <div className="flex flex-col gap-4 relative z-10">
                                            {(!leagueSettings.ads || leagueSettings.ads.length === 0) && <p className="text-center text-xs text-slate-500 font-jetbrains py-4">No hay anuncios configurados.</p>}
                                            {leagueSettings.ads?.map((ad, idx) => (
                                                <div key={ad.id} className="flex flex-col sm:flex-row gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner items-center">
                                                    <div className="w-full sm:w-32 h-20 rounded-xl overflow-hidden glass-panel shrink-0 relative">
                                                        <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                                                        <span className="absolute top-1 left-1 bg-black/80 text-white text-[9px] px-1.5 rounded font-black font-jetbrains">{idx+1}</span>
                                                    </div>
                                                    <div className="flex-1 w-full flex flex-col gap-2">
                                                        <input type="text" value={ad.text} onChange={e=>handleUpdateAd(ad.id, 'text', e.target.value)} placeholder="Texto superpuesto (Efecto Cristal)..." className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-yellow-500 transition-colors font-outfit tracking-wider" />
                                                        <input type="url" value={ad.url} onChange={e=>handleUpdateAd(ad.id, 'url', e.target.value)} placeholder="URL de destino al hacer click..." className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white text-[10px] outline-none focus:border-yellow-500 transition-colors font-jetbrains" />
                                                    </div>
                                                    <button onClick={()=>handleRemoveAd(ad.id)} className="w-full sm:w-auto text-rose-500 p-3 hover:bg-rose-500/20 rounded-xl transition-colors bg-white/5 sm:bg-transparent"><Trash2 size={16} className="mx-auto"/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] col-span-full relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent via-transparent to-red-900/10 pointer-events-none" />
                                        <h2 className="text-base font-black uppercase text-white tracking-widest font-outfit flex items-center gap-3 relative z-10"><Database size={20} className="text-rose-500"/> Core Data Management</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                                            <ActionButton icon={Download} label="Exportar Snapshot" subtitle="Copia local de seguridad" onClick={handleExportData} theme={{hex: '#3B82F6'}} />
                                            <ActionButton icon={Trash2} label="Purgar Multimedia" subtitle="Optimiza memoria BD" onClick={clearPhotoCache} theme={{hex: '#F59E0B'}} />
                                            <ActionButton icon={RotateCcw} label="Factory Reset" subtitle="Peligro: Borra métricas" onClick={purgeAllData} theme={{hex: '#F43F5E'}} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {uiState.view === 'coins' && (
                                <div className="flex flex-col gap-5 animate-fade-in flex-1 h-full">
                                    <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6 border-magenta-500/30 shadow-[0_15px_40px_rgba(217,70,239,0.15)] relative overflow-hidden">
                                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-magenta-500/10 rounded-full blur-[100px] pointer-events-none" />
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-5 gap-4 relative z-10">
                                            <div>
                                                <h2 className="text-2xl font-black uppercase text-white tracking-widest font-outfit flex items-center gap-3"><Coins size={28} className="text-magenta-500" style={{filter: 'drop-shadow(0 0 10px #d946ef)'}}/> Módulo Apuestas</h2>
                                                <p className="text-[10px] font-jetbrains text-magenta-300/60 mt-1.5 uppercase tracking-widest">Algoritmo Cuántico de Probabilidades</p>
                                            </div>
                                            <div className="flex glass-panel rounded-xl overflow-hidden p-1 gap-1">
                                                {['momios', 'config', 'paquetes'].map(t => (
                                                    <button key={t} onClick={() => setCoinsTab(t)} className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${coinsTab === t ? 'bg-magenta-600/80 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        {coinsTab === 'momios' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                                                {calendarMatches.filter(m => m.t1Id && m.t2Id && m.t1Id !== m.t2Id).map(match => {
                                                    const isActive = bettingData.activeBets[match.id], o = isActive ? bettingData.activeBets[match.id] : (oddsDraft[match.id] || {o1:'0.00', ox:'0.00', o2:'0.00'});
                                                    return (
                                                        <div key={match.id} className={`glass-panel rounded-2xl p-5 flex flex-col gap-4 relative transition-all duration-300 ${isActive ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'border-white/10'}`}>
                                                            {isActive && <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl pointer-events-none" />}
                                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest font-jetbrains border-b border-white/5 pb-2">
                                                                <span className="text-slate-400">{match.date}</span>
                                                                {isActive?<span className="text-cyan-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"/> Red Activa</span>:<span className="text-amber-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-amber-400 rounded-full"/> En Revisión</span>}
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm font-black text-white text-center font-outfit tracking-wider">
                                                                <span className="flex-1 truncate">{getTeamName(match.t1Id)}</span> 
                                                                <span className="text-magenta-500/50 px-2 font-jetbrains text-[10px]">VS</span> 
                                                                <span className="flex-1 truncate">{getTeamName(match.t2Id)}</span>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {['o1', 'ox', 'o2'].map(k => (
                                                                    <div key={k} className="flex flex-col gap-1.5">
                                                                        <span className="text-[9px] text-center uppercase text-slate-500 font-jetbrains font-black">{k === 'o1' ? 'LCL' : k === 'ox' ? 'EMP' : 'VST'}</span>
                                                                        {isActive ? (
                                                                            <div className="text-center text-sm text-cyan-400 font-black font-jetbrains bg-black/40 py-2 rounded-lg border border-cyan-500/20" style={{textShadow: '0 0 10px rgba(6,182,212,0.5)'}}>{o[k]}</div>
                                                                        ) : (
                                                                            <input type="number" step="0.01" value={o[k]} onChange={e => handleUpdateDraftOdd(match.id, k, e.target.value)} className="bg-black/60 text-amber-400 text-center text-sm py-2 rounded-lg font-black border border-white/10 outline-none focus:border-amber-500 transition-colors font-jetbrains shadow-inner" />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {isActive ? (
                                                                <button onClick={()=>handleDeactivateBet(match.id)} className="text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase mt-2 hover:bg-rose-500/20 py-2.5 rounded-xl tracking-widest transition-colors">Retirar de App 2</button>
                                                            ) : (
                                                                <button onClick={()=>handleActivateBet(match)} className="text-white bg-magenta-600/80 border border-magenta-500/50 py-2.5 rounded-xl text-[10px] font-black uppercase mt-2 hover:bg-magenta-500 tracking-widest shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all active:scale-95">Confirmar & Transmitir</button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {calendarMatches.filter(m => m.t1Id && m.t2Id && m.t1Id !== m.t2Id).length === 0 && <div className="col-span-full text-center p-10 text-slate-500 text-xs font-bold uppercase font-jetbrains border border-dashed border-white/10 rounded-3xl">Requiere carga de datos en Programador Central.</div>}
                                            </div>
                                        )}
                                        {coinsTab === 'config' && (
                                            <div className="flex flex-col gap-5 relative z-10">
                                                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                                                    <label className="text-xs font-black text-white uppercase block mb-4 tracking-widest font-outfit border-b border-white/10 pb-2">Multiplicador Cuántico por Nodo (División)</label>
                                                    <div className="flex flex-col gap-3">
                                                        {leagueSettings.divisions.map(d => (
                                                            <div key={d.id} className="flex justify-between items-center bg-black/60 p-3 rounded-xl border border-white/5">
                                                                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest font-outfit flex items-center gap-2"><div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{backgroundColor: d.hex, color: d.hex}}/> {d.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-slate-500 font-jetbrains">x</span>
                                                                    <input type="number" step="0.1" value={bettingData.divisionWeights[d.name]||1} onChange={e=>handleUpdateDivWeight(d.name, e.target.value)} className="w-20 bg-transparent text-magenta-400 font-black outline-none text-right text-base border-b border-white/20 focus:border-magenta-500 transition-colors font-jetbrains"/>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {coinsTab === 'paquetes' && (
                                            <div className="flex flex-col gap-5 relative z-10">
                                                <button onClick={addPackage} className="self-start text-[10px] glass-panel hover:bg-white/10 text-white font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"><Plus size={14}/> Nuevo Bloque de Carga</button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {bettingData.packages.map(p => (
                                                        <div key={p.id} className="glass-panel p-5 rounded-2xl border-white/10 flex flex-col gap-4 shadow-md">
                                                            <input type="text" value={p.name} onChange={e=>updatePackage(p.id, 'name', e.target.value)} className="bg-transparent text-white font-black text-sm outline-none uppercase font-outfit tracking-wider border-b border-white/10 pb-1 focus:border-magenta-500 transition-colors" />
                                                            <div className="flex flex-col gap-3 bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner">
                                                                <div className="flex justify-between items-center"><span className="text-[10px] text-cyan-400 font-black uppercase font-jetbrains tracking-widest">Carga:</span><input type="number" value={p.coins} onChange={e=>updatePackage(p.id, 'coins', e.target.value)} className="w-20 text-right bg-transparent text-white font-bold outline-none font-jetbrains border-b border-transparent focus:border-white/20"/></div>
                                                                <div className="flex justify-between items-center"><span className="text-[10px] text-emerald-400 font-black uppercase font-jetbrains tracking-widest">Valor $:</span><input type="number" value={p.price} onChange={e=>updatePackage(p.id, 'price', e.target.value)} className="w-20 text-right bg-transparent text-white font-bold outline-none font-jetbrains border-b border-transparent focus:border-white/20"/></div>
                                                            </div>
                                                            <button onClick={()=>deletePackage(p.id)} className="text-[10px] text-rose-400 hover:text-rose-300 uppercase font-black text-right mt-1 tracking-widest transition-colors flex items-center justify-end gap-1"><Trash2 size={12}/> Desintegrar</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>

                    <nav ref={leftDivMenuRef} className={`fixed left-0 top-1/3 z-[90] transition-transform duration-500 ${isDivMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="glass-panel-heavy rounded-r-3xl p-2.5 flex flex-col gap-1.5 min-w-[140px] shadow-[20px_0_40px_rgba(0,0,0,0.8)] border-l-0">
                            <div className="px-3 py-1.5 border-b border-white/10 mb-1"><span className="text-[9px] font-black uppercase text-slate-500 font-jetbrains tracking-widest">Nodos</span></div>
                            {leagueSettings.divisions.map(d => (
                                <button key={d.id} onClick={() => { setActiveDivision(d.name); setIsDivMenuOpen(false); }} className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest font-outfit text-left transition-all ${activeDivision === d.name ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5'}`} style={{borderLeftWidth: activeDivision === d.name ? '3px' : '0', borderLeftColor: d.hex}}>
                                    {d.name}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsDivMenuOpen(!isDivMenuOpen)} className="absolute -right-8 top-1/2 -translate-y-1/2 glass-panel-heavy border-l-0 w-8 h-16 rounded-r-3xl flex items-center justify-center text-slate-400 shadow-[10px_0_20px_rgba(0,0,0,0.5)]"><ChevronRight size={18} className={`${isDivMenuOpen ? 'rotate-180' : ''} transition-transform duration-300`} /></button>
                    </nav>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[95] glass-panel-heavy p-2.5 rounded-full text-slate-400 hover:text-white shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-white/10 transition-all hover:scale-110 flex items-center justify-center">
                        {isMenuOpen ? <ChevronDown size={18}/> : <LayoutDashboard size={18} className="text-cyan-400"/>}
                    </button>

                    <nav ref={bottomMenuRef} className={`fixed bottom-14 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md transition-transform duration-500 ${isMenuOpen ? 'translate-y-0' : 'translate-y-[200%]'}`}>
                        <div className="glass-panel-heavy rounded-[32px] p-2 flex justify-between items-center overflow-x-auto gap-1 mx-4 relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <HubModule icon={LayoutDashboard} color="#06b6d4" label="Panel" isActive={uiState.view === 'dashboard'} onClick={() => updateUi('view', 'dashboard')} />
                            <HubModule icon={CalendarDays} color="#10b981" label="Live" isActive={uiState.view === 'calendario'} onClick={() => updateUi('view', 'calendario')} />
                            <HubModule icon={FolderSearch} color="#f59e0b" label="Docs" isActive={uiState.view === 'directorio'} onClick={() => updateUi('view', 'directorio')} />
                            <HubModule icon={ClipboardPaste} color="#d946ef" label="Notas" isActive={uiState.view === 'notas'} onClick={() => updateUi('view', 'notas')} />
                            <HubModule icon={Coins} color="#f59e0b" label="Casino" isActive={uiState.view === 'coins'} onClick={() => updateUi('view', 'coins')} />
                            <HubModule icon={Settings} color="#94a3b8" label="Config" isActive={uiState.view === 'config'} onClick={() => updateUi('view', 'config')} />
                        </div>
                    </nav>
                </>
            ) : (
                <UserAppView appMode={appMode} currentUser={user} bettingData={bettingData} setBettingData={setBettingData} liveMatches={liveMatches} allSortedTeams={allSortedTeams} getTeamName={getTeamName} showToast={showToast} requireConfirm={requireConfirm} userAppTab={userAppTab} setUserAppTab={setUserAppTab} leagueSettings={leagueSettings} messages={messages} />
            )}

            {/* ==================================================== */}
            {/* TODOS LOS MODALES REQUERIDOS (NO BLOQUEADOS) */}
            {/* ==================================================== */}
            
            <Modal isOpen={!!uiState.activeRosterTeamId && !uiState.activePlayerCard} onClose={() => updateUi('activeRosterTeamId', null)} title={activeTeamForRoster?.name || "Plantilla"} icon={Shield} theme={theme} maxWidth="max-w-5xl">
                {activeTeamForRoster && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-32 h-32 shrink-0 glass-panel rounded-3xl border-white/20 flex items-center justify-center p-4 relative group shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                <img src={getSafeLogo(activeTeamForRoster, leagueSettings.divisions)} className="w-full h-full object-contain filter drop-shadow-md" alt="L"/>
                                <label className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-white text-[10px] font-black uppercase tracking-widest rounded-3xl transition-opacity"><Upload size={20} className="mb-2 text-cyan-400"/><span className="text-center">Actualizar<br/>Emblema</span><input type="file" className="hidden" onChange={async e => { if(e.target.files[0]) handleUpdateTeamData(activeTeamForRoster.id, 'customLogo', await compressImage(e.target.files[0], 250, 0.8)); }}/></label>
                            </div>
                            <div className="flex-1 flex flex-col gap-4 w-full">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="glass-panel p-4 rounded-2xl flex flex-col items-center shadow-inner"><span className="text-2xl font-black font-jetbrains text-white">{activeTeamForRoster.pj}</span><span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">PJ</span></div>
                                    <div className="glass-panel p-4 rounded-2xl flex flex-col items-center shadow-inner"><span className="text-2xl font-black font-jetbrains text-emerald-400" style={{textShadow: '0 0 10px rgba(16,185,129,0.4)'}}>{activeTeamForRoster.g}</span><span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">G</span></div>
                                    <div className="glass-panel p-4 rounded-2xl flex flex-col items-center shadow-inner"><span className="text-2xl font-black font-jetbrains text-cyan-400" style={{textShadow: '0 0 10px rgba(6,182,212,0.4)'}}>{activeTeamForRoster.gf}</span><span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">GF</span></div>
                                    <div className="glass-panel p-4 rounded-2xl flex flex-col items-center border border-yellow-500/30 bg-yellow-900/10"><span className="text-2xl font-black font-jetbrains text-yellow-400" style={{textShadow: '0 0 15px rgba(234,179,8,0.5)'}}>{activeTeamForRoster.pts}</span><span className="text-[10px] text-yellow-500/70 uppercase font-black tracking-widest mt-1">PTS</span></div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={() => handleAddPlayer(activeTeamForRoster.id)} className="flex-1 glass-panel hover:bg-white/10 py-3 rounded-xl text-[11px] uppercase font-black tracking-widest text-white transition-all active:scale-95 flex items-center justify-center gap-2"><UserPlus size={16}/> Ficha 1x1</button>
                                    <label className="flex-1 bg-cyan-600/80 text-white hover:bg-cyan-500 py-3 rounded-xl text-[11px] uppercase font-black tracking-widest border border-cyan-500/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]"><Users size={16}/> Recorte Múltiple IA<input type="file" accept="image/*" className="hidden" onChange={e => handleGroupPhotoSelect(e, activeTeamForRoster.id)} /></label>
                                    <button onClick={() => openRenderStudio('roster', activeTeamForRoster)} className="flex-1 bg-gradient-to-r from-magenta-600/90 to-purple-600/90 hover:from-magenta-500 hover:to-purple-500 text-white py-3 rounded-xl text-[11px] uppercase font-black tracking-widest border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(217,70,239,0.3)]"><ImagePlus size={16}/> Renderizar Plantel</button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-black/40 p-4 rounded-3xl border border-white/5 shadow-inner min-h-[200px]">
                            {(activeTeamForRoster.players || []).length === 0 && <div className="col-span-full flex items-center justify-center text-slate-500 text-xs font-black uppercase tracking-widest font-jetbrains">Plantilla Vacía. Registra Jugadores.</div>}
                            {(activeTeamForRoster.players || []).map(p => (
                                <div key={p.id} className="glass-panel border-white/10 rounded-2xl p-4 relative group hover:border-cyan-500/50 hover:bg-white/5 transition-all flex flex-col items-center text-center cursor-pointer shadow-md" onClick={() => updateUi('activePlayerCard', {tId: activeTeamForRoster.id, pId: p.id})}>
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-black/60 shrink-0 border-2 border-white/10 group-hover:border-cyan-500/50 transition-colors shadow-inner mb-3">{p.photo?<img src={p.photo} className="object-cover w-full h-full" alt="p"/>:<User size={28} className="m-auto mt-4 text-slate-500"/>}</div>
                                    <div className="flex flex-col w-full min-w-0">
                                        <div className="text-sm font-black text-white truncate font-outfit tracking-wider"><span className="text-[#D4AF37] mr-1 font-jetbrains">#{p.number}</span>{p.name}</div>
                                        <div className="flex justify-center gap-2 mt-2 font-jetbrains">
                                            <span className="bg-black/60 border border-white/10 px-2 py-1 rounded text-slate-300 text-[9px] font-black tracking-widest">{p.position}</span> 
                                            <span className="bg-black/60 border border-yellow-500/20 px-2 py-1 rounded text-[#D4AF37] text-[9px] font-black tracking-widest shadow-[inset_0_0_5px_rgba(212,175,55,0.2)]">OVR {p.ovr}</span>
                                        </div>
                                    </div>
                                    <button onClick={e => handleRemovePlayer(e, activeTeamForRoster.id, p.id)} className="absolute top-2 right-2 text-rose-500 bg-rose-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={uiState.groupCrop?.active} onClose={closeGroupCrop} title="Recorte Biométrico Grupal" icon={Users} theme={{hex: '#06b6d4'}} maxWidth="max-w-4xl">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5 text-[10px] text-cyan-400 font-bold glass-panel border-cyan-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] font-jetbrains tracking-wider">
                        <span className="text-white text-xs font-outfit uppercase mb-1">Protocolo de Extracción:</span>
                        <span>1. Calibra el diámetro focal con el control inferior.</span>
                        <span>2. Toca los objetivos en el plano visual para marcar extracción.</span>
                        <span>3. Toca un marcador activo para cancelar.</span>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-black/60 px-5 py-3 rounded-2xl border border-white/10 shadow-inner">
                        <span className="text-[10px] font-black uppercase text-slate-300 font-jetbrains tracking-widest">Apertura Lente:</span>
                        <input type="range" min="3" max="25" value={cropRadius} onChange={e => setCropRadius(Number(e.target.value))} className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none accent-cyan-500 cursor-ew-resize" />
                        <span className="text-[10px] font-black text-cyan-500 font-jetbrains w-6 text-right">{cropRadius}%</span>
                    </div>

                    <div className="w-full text-center overflow-x-auto bg-[#020617] rounded-3xl border border-white/10 p-2 shadow-inner">
                        <div className="relative inline-block rounded-2xl overflow-hidden cursor-crosshair">
                            <img src={uiState.groupCrop?.imgUrl} className="block object-contain" style={{maxHeight: '55vh', maxWidth: '100%'}} alt="Grupal" onClick={(e) => {
                                const rect = e.target.getBoundingClientRect();
                                const px = (e.clientX - rect.left) / rect.width;
                                const py = (e.clientY - rect.top) / rect.height;
                                setCropMarkers(prev => [...prev, {id: Date.now(), px, py, radius: cropRadius}]);
                            }} />
                            {cropMarkers.map((marker, idx) => (
                                <div key={marker.id} onClick={e => { e.stopPropagation(); setCropMarkers(prev => prev.filter(x => x.id !== marker.id)); }} className="absolute border-[3px] border-cyan-400 rounded-full bg-cyan-500/20 cursor-pointer hover:bg-rose-500/40 hover:border-rose-400 transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.8)] backdrop-blur-[2px]" style={{left: `${marker.px * 100}%`, top: `${marker.py * 100}%`, width: `${marker.radius * 2}%`, aspectRatio: '1/1', transform: 'translate(-50%, -50%)'}}>
                                    <span className="text-white text-[12px] font-black font-jetbrains drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{idx + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <button onClick={closeGroupCrop} className="flex-1 glass-panel text-slate-300 font-black py-4 rounded-2xl hover:bg-white/5 text-xs uppercase tracking-widest transition-all active:scale-95">Abortar Misión</button>
                        <button onClick={executeCrops} disabled={!cropMarkers.length} className="flex-[2] bg-cyan-600/90 text-white border border-cyan-500/50 font-black py-4 rounded-2xl hover:bg-cyan-500 text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                            <Check size={18}/> Procesar {cropMarkers.length} Sujetos
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!uiState.activePlayerCard} onClose={() => updateUi('activePlayerCard', null)} title="Expediente Técnico" icon={User} theme={{hex: '#D4AF37'}} maxWidth="max-w-4xl">
                {activePlayerContext && (() => {
                    const { team, player } = activePlayerContext;
                    return (
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-2/5 flex flex-col gap-4">
                                <div className="aspect-[3/4] glass-panel rounded-3xl border-2 border-[#D4AF37]/40 relative overflow-hidden flex items-center justify-center group shadow-[0_0_30px_rgba(212,175,55,0.15)] bg-gradient-to-t from-black/80 to-transparent">
                                    {player.photo ? <img src={player.photo} className="w-full h-full object-cover relative z-10" alt="P" /> : <User size={80} className="text-[#D4AF37]/20 relative z-10" />}
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-white font-black font-jetbrains text-sm shadow-lg">{player.position}</div>
                                        <div className="bg-[#D4AF37]/90 text-black px-3 py-1.5 rounded-lg font-black font-jetbrains text-sm shadow-[0_0_15px_rgba(212,175,55,0.5)]">OVR {player.ovr}</div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#020617] to-transparent z-10" />
                                    <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center z-30 transition-opacity">
                                        <label className="glass-panel border-cyan-500/50 text-cyan-400 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                            <Upload size={16}/> Reemplazar Biometría
                                            <input type="file" accept="image/*" className="hidden" onChange={async e => { if(e.target.files[0]) handleUpdatePlayerField(team.id, player.id, 'photo', await compressImage(e.target.files[0], 250, 0.8)); }} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-5">
                                <div className="glass-panel p-5 rounded-3xl flex flex-col gap-4 shadow-inner">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest font-jetbrains border-b border-white/10 pb-2">Datos Base</h4>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <label className="text-[9px] text-[#D4AF37] uppercase font-black tracking-widest font-jetbrains">Identidad</label>
                                            <input type="text" value={player.name} onChange={e => handleUpdatePlayerField(team.id, player.id, 'name', e.target.value)} className="w-full bg-black/60 rounded-xl p-3 text-base text-white font-black outline-none border border-white/10 focus:border-[#D4AF37] transition-colors font-outfit uppercase tracking-wider"/>
                                        </div>
                                        <div className="w-full sm:w-24 flex flex-col gap-1.5">
                                            <label className="text-[9px] text-[#D4AF37] uppercase font-black tracking-widest font-jetbrains">Dorsal</label>
                                            <input type="number" value={player.number} onChange={e => handleUpdatePlayerField(team.id, player.id, 'number', parseInt(e.target.value)||0)} className="w-full bg-black/60 rounded-xl p-3 text-base text-[#D4AF37] text-center font-black outline-none border border-white/10 focus:border-[#D4AF37] transition-colors font-jetbrains"/>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <label className="text-[9px] text-[#D4AF37] uppercase font-black tracking-widest font-jetbrains">Posición</label>
                                            <select value={player.position} onChange={e => handleUpdatePlayerField(team.id, player.id, 'position', e.target.value)} className="w-full bg-black/60 rounded-xl p-3 text-sm text-white font-black outline-none border border-white/10 focus:border-[#D4AF37] transition-colors font-jetbrains cursor-pointer">
                                                {['POR', 'DEF', 'MED', 'DEL', 'DT'].map(pos => <option key={pos} value={pos} className="bg-slate-900">{pos}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <label className="text-[9px] text-[#D4AF37] uppercase font-black tracking-widest font-jetbrains">Rating Global (OVR)</label>
                                            <input type="number" value={player.ovr} onChange={e => handleUpdatePlayerField(team.id, player.id, 'ovr', parseInt(e.target.value)||0)} className="w-full bg-black/60 rounded-xl p-3 text-sm text-white font-black outline-none border border-white/10 focus:border-[#D4AF37] transition-colors font-jetbrains cursor-pointer"/>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="glass-panel p-5 rounded-3xl flex flex-col gap-4 shadow-inner">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest font-jetbrains border-b border-white/10 pb-2">Sistema Disciplinario</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/40 border border-yellow-500/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-8 bg-yellow-400 rounded shadow-[0_0_10px_rgba(234,179,8,0.5)] transform -rotate-12" />
                                            <span className="text-2xl font-black font-jetbrains text-white">{getActiveYellows(player.yellowCardsList)}</span>
                                            <div className="flex gap-2 w-full mt-2">
                                                <button onClick={() => handleUpdateCard(team.id, player.id, 'yellow', 'add')} className="flex-1 bg-yellow-500/20 text-yellow-400 py-2 rounded-lg font-black text-xs hover:bg-yellow-500 hover:text-black transition-colors">+</button>
                                                <button onClick={() => handleUpdateCard(team.id, player.id, 'yellow', 'sub')} className="flex-1 bg-white/5 text-slate-400 py-2 rounded-lg font-black text-xs hover:bg-white/10 transition-colors">-</button>
                                            </div>
                                        </div>
                                        <div className="bg-black/40 border border-rose-500/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-8 bg-rose-500 rounded shadow-[0_0_10px_rgba(244,63,94,0.5)] transform rotate-12" />
                                            <span className="text-2xl font-black font-jetbrains text-white">{player.redCards || 0}</span>
                                            <div className="flex gap-2 w-full mt-2">
                                                <button onClick={() => handleUpdateCard(team.id, player.id, 'red', 'add')} className="flex-1 bg-rose-500/20 text-rose-400 py-2 rounded-lg font-black text-xs hover:bg-rose-500 hover:text-white transition-colors">+</button>
                                                <button onClick={() => handleUpdateCard(team.id, player.id, 'red', 'sub')} className="flex-1 bg-white/5 text-slate-400 py-2 rounded-lg font-black text-xs hover:bg-white/10 transition-colors">-</button>
                                            </div>
                                        </div>
                                    </div>
                                    {getRemainingSuspension(player) > 0 && (
                                        <div className="bg-rose-900/40 border border-rose-500/50 p-4 rounded-2xl flex items-center justify-between shadow-[inset_0_0_20px_rgba(244,63,94,0.2)]">
                                            <span className="text-rose-400 font-black text-xs uppercase tracking-widest flex items-center gap-2"><AlertCircle size={16}/> Castigo Activo</span>
                                            <span className="text-white font-black font-jetbrains text-sm">{getRemainingSuspension(player)} Días Restantes</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            <Modal isOpen={uiState.modal === 'jornada'} onClose={() => updateUi('modal', null)} title="Buffer Cuántico (Jornada)" icon={Database} theme={{hex: '#10b981'}} maxWidth="max-w-2xl">
                <div className="flex flex-col gap-5">
                    <p className="text-xs text-slate-400 font-bold font-outfit tracking-wider bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">Verifica las resoluciones y los puntos asignados antes de impactar el núcleo. Puedes sobreescribir los puntos manualmente si es necesario.</p>
                    <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {jornadaSummary.map(m => (
                            <div key={m.tempId} className="glass-panel rounded-2xl p-4 flex items-center justify-between border-emerald-500/30 relative shadow-md">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl shadow-[0_0_10px_#10b981]"/>
                                <span className="flex-1 text-right text-sm font-black text-white truncate px-3 font-outfit tracking-wider">{m.t1Name}</span>
                                <div className="flex flex-col gap-1 items-center bg-black/60 px-4 py-2 rounded-xl shadow-inner border border-white/10 mx-2">
                                    <div className="flex items-center gap-3">
                                        <input type="number" value={m.g1} onChange={e=>{
                                            const g1 = parseInt(e.target.value)||0;
                                            const pts1 = g1 > m.g2 ? 3 : g1 === m.g2 ? 1 : 0;
                                            const pts2 = m.g2 > g1 ? 3 : g1 === m.g2 ? 1 : 0;
                                            setJornadaSummary(p=>p.map(x=>x.tempId===m.tempId?{...x, g1, pts1, pts2}:x));
                                        }} className="w-8 bg-transparent text-center text-xl font-black text-emerald-400 outline-none font-jetbrains" style={{textShadow: '0 0 10px rgba(16,185,129,0.5)'}}/>
                                        <span className="text-slate-600 font-black">-</span>
                                        <input type="number" value={m.g2} onChange={e=>{
                                            const g2 = parseInt(e.target.value)||0;
                                            const pts1 = m.g1 > g2 ? 3 : m.g1 === g2 ? 1 : 0;
                                            const pts2 = g2 > m.g1 ? 3 : m.g1 === g2 ? 1 : 0;
                                            setJornadaSummary(p=>p.map(x=>x.tempId===m.tempId?{...x, g2, pts1, pts2}:x));
                                        }} className="w-8 bg-transparent text-center text-xl font-black text-emerald-400 outline-none font-jetbrains" style={{textShadow: '0 0 10px rgba(16,185,129,0.5)'}}/>
                                    </div>
                                    <div className="flex w-full justify-between items-center px-1 border-t border-white/5 pt-1 mt-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[8px] text-slate-500 font-jetbrains">PTS</span>
                                            <input type="number" value={m.pts1} onChange={e=>setJornadaSummary(p=>p.map(x=>x.tempId===m.tempId?{...x,pts1:parseInt(e.target.value)||0}:x))} className="w-6 bg-transparent text-emerald-400 text-xs font-black outline-none text-center border-b border-emerald-500/50" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <input type="number" value={m.pts2} onChange={e=>setJornadaSummary(p=>p.map(x=>x.tempId===m.tempId?{...x,pts2:parseInt(e.target.value)||0}:x))} className="w-6 bg-transparent text-emerald-400 text-xs font-black outline-none text-center border-b border-emerald-500/50" />
                                            <span className="text-[8px] text-slate-500 font-jetbrains">PTS</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="flex-1 text-left text-sm font-black text-white truncate px-3 font-outfit tracking-wider">{m.t2Name}</span>
                                <button onClick={()=>setJornadaSummary(p=>p.filter(x=>x.tempId!==m.tempId))} className="text-rose-500 p-2 hover:bg-rose-500/20 rounded-lg transition-colors ml-2"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <button onClick={()=>updateUi('modal', null)} className="flex-1 glass-panel py-4 rounded-2xl text-xs font-black text-slate-300 uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">Abortar</button>
                        <button onClick={cloudFn_commitJornada} className="flex-[2] bg-emerald-600/90 hover:bg-emerald-500 py-4 rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 border border-emerald-400/50 flex items-center justify-center gap-2"><Check size={16}/> Inyectar Resultados al Núcleo</button>
                    </div>
                </div>
            </Modal>

            {renderStudio.active && (
                <div className="fixed inset-0 z-[150] bg-[#020617]/95 backdrop-blur-xl flex flex-col md:flex-row animate-fade-in">
                    <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
                        {isRenderingPreview && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617]/80 z-10 backdrop-blur-sm"><Activity size={48} className="text-cyan-500 animate-pulse mb-4" style={{filter: 'drop-shadow(0 0 15px #06b6d4)'}} /><span className="text-cyan-400 font-jetbrains text-[10px] uppercase tracking-widest">Generando Render 8K...</span></div>}
                        <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
                             <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
                             <canvas ref={previewCanvasRef} className="max-w-full max-h-full object-contain rounded-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10 border border-white/10" />
                        </div>
                    </div>
                    <div className="w-full md:w-[420px] glass-panel-heavy border-y-0 border-r-0 border-l border-white/10 flex flex-col h-[50vh] md:h-full z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.8)]">
                        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/40">
                            <h2 className="text-sm font-black uppercase text-white flex items-center gap-3 tracking-widest font-outfit"><Camera size={20} className="text-cyan-400" style={{filter: 'drop-shadow(0 0 8px #06b6d4)'}}/> Estudio Dispatcher</h2>
                            <button onClick={()=>setRenderStudio({active:false,type:null,data:null,settings:{}})} className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-white/5 transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                            
                            <div className="flex flex-col gap-3 relative z-10">
                                <label className="text-[10px] text-cyan-400 uppercase font-black tracking-widest font-jetbrains">Motor Gráfico (Estilo)</label>
                                <div className="flex glass-panel rounded-xl p-1.5 shadow-inner">
                                    {['dark', 'glass'].map(s => (
                                        <button key={s} onClick={()=>setRenderStudio(p=>({...p,settings:{...p.settings,style:s}}))} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all tracking-wider ${renderStudio.settings.style === s ? 'bg-cyan-600/80 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent relative z-10"/>

                            <div className="flex flex-col gap-4 relative z-10">
                                <label className="text-[10px] text-magenta-400 uppercase font-black flex items-center gap-2 tracking-widest font-jetbrains"><MessageSquare size={14}/> Comunicado Global (Opcional)</label>
                                <textarea value={renderStudio.broadcastText} onChange={e=>setRenderStudio(p=>({...p, broadcastText:e.target.value}))} className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white font-outfit outline-none focus:border-magenta-500 transition-colors resize-none min-h-[100px] shadow-inner" placeholder="Escribe un mensaje para adjuntar al render..." />
                                
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <button onClick={() => handleBroadcastRender('user1')} className="glass-panel border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-500 hover:text-white transition-all active:scale-95 shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] tracking-widest"><Send size={14}/> Jugador 1</button>
                                    <button onClick={() => handleBroadcastRender('user2')} className="glass-panel border-magenta-500/30 text-magenta-400 text-[10px] font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-magenta-500 hover:text-white transition-all active:scale-95 shadow-md hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] tracking-widest"><Send size={14}/> Jugador 2</button>
                                    <button onClick={() => handleBroadcastRender('all')} className="col-span-2 bg-gradient-to-r from-cyan-600 to-magenta-600 border border-white/20 text-white text-[11px] font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] tracking-widest"><Megaphone size={16}/> Broadcast Masivo</button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-black/60 relative z-10">
                            <button onClick={downloadRender} disabled={isRenderingPreview} className="w-full bg-white text-black font-black py-4 rounded-2xl text-xs uppercase flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:grayscale transition-all active:scale-95 tracking-widest"><Download size={16}/> Descargar HD en Local</button>
                        </div>
                    </div>
                </div>
            )}

            {onboardingState.active && (
                <div className="fixed inset-0 z-[200] bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <div className="glass-panel-heavy border border-cyan-500/30 w-full max-w-lg rounded-3xl p-8 flex flex-col gap-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-scale-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="text-center relative z-10">
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest font-outfit flex items-center justify-center gap-3"><Settings2 size={24} className="text-cyan-400" style={{filter: 'drop-shadow(0 0 10px #06b6d4)'}}/> Booting OS...</h2>
                            <p className="text-xs text-slate-400 mt-2 font-jetbrains tracking-wider">Configura los parámetros iniciales del núcleo.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                            <label className="w-24 h-24 glass-panel rounded-2xl border border-white/20 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-white hover:border-cyan-400 transition-colors shadow-inner group">
                                {onboardingState.tempLogo ? <img src={onboardingState.tempLogo} className="w-full h-full object-contain p-2 filter drop-shadow-md" alt="L"/> : <><Upload size={24} className="group-hover:animate-bounce"/><span className="text-[9px] uppercase font-black mt-2 tracking-widest">Emblema</span></>}
                                <input type="file" accept="image/png" className="hidden" onChange={async e => { if (e.target.files[0]) { const img = await compressImage(e.target.files[0], 400); setOnboardingState(p=>({...p, tempLogo: img})); } }}/>
                            </label>
                            <div className="flex-1 w-full flex flex-col gap-2">
                                <label className="text-[10px] text-cyan-400 font-black uppercase font-jetbrains tracking-widest">Identificador Principal</label>
                                <input type="text" value={onboardingState.tempName} onChange={e=>setOnboardingState(p=>({...p, tempName: e.target.value}))} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-black uppercase text-sm outline-none focus:border-cyan-500 transition-colors font-outfit tracking-wider shadow-inner" placeholder="Ej: Superliga" />
                            </div>
                        </div>
                        <button onClick={()=>{setLeagueSettings(p=>({...p, leagueName:onboardingState.tempName||p.leagueName, customLogo:onboardingState.tempLogo||p.customLogo, setupCompleted:true})); setOnboardingState(p=>({...p, active:false}));}} className="w-full bg-cyan-600/90 text-white font-black py-4 rounded-2xl uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95 border border-cyan-400/50 relative z-10">Inicializar Sistema</button>
                    </div>
                </div>
            )}

            <ConfirmDialog {...confirmDialog} onClose={() => setConfirmDialog(prev => ({...prev, isOpen: false}))} />
            <Toast {...toast} />
        </div>
    );
}