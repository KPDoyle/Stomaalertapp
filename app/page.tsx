"use client";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Box,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  CloudSun,
  Download,
  Droplets,
  FileText,
  GlassWater,
  HeartHandshake,
  HeartPulse,
  Home,
  ListChecks,
  LineChart,
  Menu,
  MessageCircle,
  PackageOpen,
  PackageCheck,
  Plane,
  Plus,
  Minus,
  Search,
  ScanLine,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { AppAction, AppData, ProfileData } from "@/lib/app-types";

type PatientView = "home" | "care" | "diary" | "progress" | "supplies" | "learn" | "profile";

const navItems = [
  { id: "home" as const, label: "Home", icon: Home },
  { id: "care" as const, label: "Daily care", icon: HeartPulse },
  { id: "diary" as const, label: "Diary", icon: BookOpen },
  { id: "progress" as const, label: "Progress", icon: LineChart },
  { id: "supplies" as const, label: "Supplies", icon: Box },
  { id: "learn" as const, label: "Learn", icon: Sparkles },
  { id: "profile" as const, label: "Profile", icon: CircleUserRound },
];

const fallbackData: AppData = {
  profile: { firstName: "Kevin", email: "Kevin.doyle@commerceworks.net", stomaType: "Colostomy", duration: "Permanent", dateCreated: "2026-03-14", nurse: "Sarah Whitfield", supplier: "Fittleworth", products: ["Drainable pouch", "Barrier spray"], learning: [true, false, false], homeSubtitle: "A 60-second check-in keeps you and your care team in the loop.", checkinHeading: "How are things today?" },
  checkins: [
    { id: "demo-1", output: 4, skin: 4, comfort: 4, mood: 5, createdAt: "2026-08-20T08:42:00.000Z" },
    { id: "demo-2", output: 3, skin: 4, comfort: 3, mood: 4, createdAt: "2026-08-18T09:06:00.000Z" },
    { id: "demo-3", output: 3, skin: 3, comfort: 4, mood: 4, createdAt: "2026-08-17T08:51:00.000Z" },
  ],
  diaryEntries: [{ id: "demo-entry", type: "checkin", title: "Daily check-in", detail: "Output 4 · Skin 4 · Comfort 4 · Mood 5", fileKey: null, fileName: null, createdAt: "2026-08-20T08:42:00.000Z" }],
  supplyRequests: [],
  messages: [
    { id: "demo-message-1", sender: "patient", body: "Morning Sarah. Everything feels comfortable today.", createdAt: "2026-08-19T09:18:00.000Z" },
    { id: "demo-message-2", sender: "nurse", body: "That is good to hear, Kevin. Keep an eye on the skin and let me know if anything changes.", createdAt: "2026-08-19T09:22:00.000Z" },
  ],
  careLogs: [
    { id:"demo-care-1", outputMl:650, consistency:"usual", hydrationMl:1800, skinStatus:"comfortable", pain:1, leak:false, pouchChanged:true, food:"Porridge, soup and a light evening meal", symptoms:"No new concerns", createdAt:"2026-08-20T10:12:00.000Z" },
    { id:"demo-care-2", outputMl:720, consistency:"loose", hydrationMl:1600, skinStatus:"itchy", pain:2, leak:false, pouchChanged:false, food:"Toast, yoghurt and pasta", symptoms:"Mild itch at the lower edge", createdAt:"2026-08-18T10:12:00.000Z" },
  ],
  inventory: [
    { id:"demo-pouches", name:"Drainable pouches · 60mm", productCode:"SA-DR60", quantity:8, reorderAt:10, unit:"pouches" },
    { id:"demo-spray", name:"Barrier spray", productCode:"SA-BS50", quantity:2, reorderAt:1, unit:"bottles" },
    { id:"demo-wipes", name:"Adhesive remover wipes", productCode:"SA-AR30", quantity:14, reorderAt:8, unit:"wipes" },
  ],
  careTasks: [
    { id:"demo-task-1", category:"routine", title:"Review pouch-change routine", detail:"Check the seal, skin and wear time", dueDate:"2026-08-21", completed:false },
    { id:"demo-task-2", category:"appointment", title:"Video review with Sarah", detail:"Bring your care summary and product questions", dueDate:"2026-08-26", completed:false },
    { id:"demo-task-3", category:"travel", title:"Prepare an emergency change kit", detail:"Pouches, wipes, disposal bags and spare clothes", dueDate:"2026-09-01", completed:false },
    { id:"demo-task-4", category:"recovery", title:"Gentle movement goal", detail:"A short walk if your care team has confirmed it is suitable", dueDate:"2026-08-22", completed:true },
  ],
};

const localDataKey = "stoma-alert-device-demo-v2";
const localPhotoLimit = 1024 * 1024;

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readLocalData() {
  try {
    const value = localStorage.getItem(localDataKey);
    return value ? JSON.parse(value) as AppData : null;
  } catch {
    return null;
  }
}

function saveLocalData(data: AppData) {
  localStorage.setItem(localDataKey, JSON.stringify(data));
}

function applyLocalAction(current: AppData, action: AppAction): AppData {
  const now = new Date().toISOString();

  if (action.type === "save_checkin") {
    const scores = action.scores.map(Number);
    if (scores.length !== 4 || scores.some((score) => !Number.isInteger(score) || score < 1 || score > 5)) {
      throw new Error("Complete all four check-in questions");
    }
    return {
      ...current,
      checkins: [{ id: createId(), output: scores[0], skin: scores[1], comfort: scores[2], mood: scores[3], createdAt: now }, ...current.checkins],
      diaryEntries: [{ id: createId(), type: "checkin", title: "Daily check-in", detail: `Output ${scores[0]} · Skin ${scores[1]} · Comfort ${scores[2]} · Mood ${scores[3]}`, fileKey: null, fileName: null, createdAt: now }, ...current.diaryEntries],
    };
  }

  if (action.type === "update_profile") {
    return { ...current, profile: { ...current.profile, ...action.profile } };
  }

  if (action.type === "request_supplies") {
    const supplier = action.supplier.trim();
    if (!supplier) throw new Error("Choose a supplier");
    return {
      ...current,
      profile: { ...current.profile, supplier },
      supplyRequests: [{ id: createId(), supplier, product: "Drainable pouch · 60mm", status: "Requested", createdAt: now }, ...current.supplyRequests],
    };
  }

  if (action.type === "toggle_guide") {
    if (action.index < 0 || action.index > 2) throw new Error("Guide not found");
    const learning = [...current.profile.learning];
    learning[action.index] = !learning[action.index];
    return { ...current, profile: { ...current.profile, learning } };
  }

  if (action.type === "send_message") {
    const body = action.body.trim();
    if (!body || body.length > 1000) throw new Error("Enter a message up to 1,000 characters");
    return { ...current, messages: [...current.messages, { id: createId(), sender: action.sender, body, createdAt: now }] };
  }

  if (action.type === "save_care_log") {
    const log = action.log;
    if (log.outputMl < 0 || log.outputMl > 10000 || log.hydrationMl < 0 || log.hydrationMl > 10000 || log.pain < 0 || log.pain > 10) throw new Error("Check the amounts and pain score");
    const detail = `${log.outputMl} ml output · ${log.consistency} · ${log.hydrationMl} ml fluids${log.leak ? " · leak reported" : ""}${log.pouchChanged ? " · pouch changed" : ""}`;
    return {
      ...current,
      careLogs:[{ id:createId(), ...log, createdAt:now }, ...current.careLogs],
      diaryEntries:[{ id:createId(), type:"note", title:"Daily care log", detail, fileKey:null, fileName:null, createdAt:now }, ...current.diaryEntries],
    };
  }

  if (action.type === "adjust_inventory") {
    return { ...current, inventory:current.inventory.map((item) => item.id === action.id ? { ...item, quantity:Math.max(0,item.quantity + action.change) } : item) };
  }

  if (action.type === "toggle_care_task") {
    return { ...current, careTasks:current.careTasks.map((task) => task.id === action.id ? { ...task, completed:!task.completed } : task) };
  }

  if (action.type === "update_content") return {
    ...current,
    profile: {
      ...current.profile,
      homeSubtitle: action.homeSubtitle.trim(),
      checkinHeading: action.checkinHeading.trim(),
    },
  };

  return current;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Photo could not be read"));
    reader.onerror = () => reject(new Error("Photo could not be read"));
    reader.readAsDataURL(file);
  });
}

function wellbeing(checkins: AppData["checkins"]) {
  if (!checkins.length) return 0;
  const latest = checkins[0];
  return Math.round(((latest.output + latest.skin + latest.comfort + latest.mood) / 20) * 100);
}

function formatEntryDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const day = date.toDateString() === today.toDateString() ? "Today" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return { day, time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) };
}

function downloadFile(filename: string, content: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Stoma Alert">
      <span className="brand-mark" aria-hidden="true"><span className="brand-mark__dot" /></span>
      <span className="brand-name">STOMA <b>ALERT</b></span>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="progress-ring" aria-label={`${value}% wellbeing score`}>
      <svg viewBox="0 0 76 76" role="img">
        <circle className="progress-ring__track" cx="38" cy="38" r={radius} />
        <circle className="progress-ring__value" cx="38" cy="38" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} />
      </svg>
      <strong>{value}%</strong>
    </div>
  );
}

function CheckInPanel({ heading, onClose, onSave }: { heading: string; onClose: () => void; onSave: (scores: number[]) => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const questions = [
    { title: "How is your output today?", hint: "Think about volume and consistency." },
    { title: "How does the skin around your stoma feel?", hint: "Include soreness, itching or irritation." },
    { title: "How comfortable are you?", hint: "Consider your appliance fit and daily movement." },
    { title: "How are you feeling in yourself?", hint: "There is no right or wrong answer." },
  ];
  const labels = ["Difficult", "Not great", "Okay", "Good", "Very good"];
  const complete = scores.every(Boolean);

  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="checkin-sheet" role="dialog" aria-modal="true" aria-labelledby="checkin-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sheet-handle" aria-hidden="true" />
        <aside className="checkin-aside">
          <Brand compact />
          <div><span>60-second reflection</span><h3>One gentle question at a time.</h3><p>This is your record of how recovery feels—not a test and not a diagnosis.</p></div>
          <div className="checkin-aside__foot"><ShieldCheck size={15}/><span>Your answers stay private and are shared only with your care team.</span></div>
        </aside>
        <div className="checkin-main">
          <header className="sheet-header">
            <div><span className="eyebrow">Daily check-in</span><h2 id="checkin-title">{heading}</h2></div>
            <button className="icon-button" onClick={onClose} aria-label="Close check-in"><X size={20} /></button>
          </header>
          <div className="stepper" aria-label={`Question ${step + 1} of ${questions.length}`}>
            {questions.map((_, index) => <span key={index} className={index <= step ? "is-active" : ""} />)}
          </div>
          <div className="question-card">
            <span className="question-count">Question {step + 1} of {questions.length}</span>
            <h3>{questions[step].title}</h3>
            <p>{questions[step].hint}</p>
            <div className="score-grid">
              {labels.map((label, index) => {
                const value = index + 1;
                return (
                  <button key={label} className={scores[step] === value ? "is-selected" : ""} onClick={() => setScores((current) => current.map((score, scoreIndex) => scoreIndex === step ? value : score))}>
                    <strong>{value}</strong><span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <footer className="sheet-footer">
            <button className="button button--quiet" disabled={saving} onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>
            {step < questions.length - 1 ? (
              <button className="button" disabled={!scores[step]} onClick={() => setStep(step + 1)}>Continue <ArrowRight size={18} /></button>
            ) : (
              <button className="button" disabled={!complete || saving} onClick={async () => { setSaving(true); setError(""); try { await onSave(scores); onClose(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Check-in could not be saved"); } finally { setSaving(false); } }}>{saving ? "Saving…" : "Save check-in"} <Check size={18} /></button>
            )}
          </footer>
        </div>
      </section>
    </div>
  );
}

function PatientHome({ data, syncState, onCheckIn, onMessage, onNavigate }: { data: AppData; syncState: "loading" | "saved" | "saving" | "error"; onCheckIn: () => void; onMessage: () => void; onNavigate: (view: PatientView) => void }) {
  const [activeStage, setActiveStage] = useState(0);
  const latest = data.checkins[0] || fallbackData.checkins[0];
  const score = wellbeing(data.checkins);
  const workspaceDate = new Date(latest.createdAt);
  const journeyDay = Math.max(1, Math.floor((workspaceDate.getTime() - new Date(data.profile.dateCreated).getTime()) / 86400000));
  const recoveryFlow = [
    { label: "Check-in", detail: `${data.checkins.length} wellbeing updates captured`, meta: data.checkins.length ? formatEntryDate(data.checkins[0].createdAt).day : "Ready", icon: ClipboardCheck },
    { label: "Diary", detail: `${data.diaryEntries.length} timeline entries securely stored`, meta: `${data.diaryEntries.filter((entry) => entry.type === "photo").length} photos`, icon: Camera },
    { label: "Care review", detail: `Available to ${data.profile.nurse}`, meta: "In view", icon: Stethoscope },
    { label: "Progress", detail: "Personal trend updated from your check-ins", meta: `${score}% wellbeing`, icon: LineChart },
  ];
  const activeSignal = recoveryFlow[activeStage];
  const ActiveSignalIcon = activeSignal.icon;
  const mobileVitals = [
    { label:"Output", value:latest.output, icon:Droplets, copy:"Within range" },
    { label:"Skin", value:latest.skin, icon:Sparkles, copy:"Looking steady" },
    { label:"Comfort", value:latest.comfort, icon:HeartPulse, copy:"Improving" },
    { label:"Mood", value:latest.mood, icon:CloudSun, copy:"Feeling positive" },
  ];

  return (
    <section className="award-home">
      <div className="mobile-patient-home">
        <header className="mobile-welcome-row">
          <div><span>Good evening</span><h1>{data.profile.firstName}</h1></div>
          <button onClick={() => onNavigate("profile")} aria-label="Open your profile">{data.profile.firstName.slice(0,1)}D</button>
        </header>

        <section className="mobile-status-card">
          <header><span><i/> Today’s recovery signal</span><small className={`sync-state sync-state--${syncState}`}>{syncState === "saving" ? "Saving…" : syncState === "loading" ? "Connecting…" : "Up to date"}</small></header>
          <div className="mobile-status-card__body">
            <div><span className="mobile-overline">60-second check-in</span><h2>{data.profile.checkinHeading}</h2><p>{data.profile.homeSubtitle}</p></div>
            <ProgressRing value={score}/>
          </div>
          <button onClick={onCheckIn}>Start today’s check-in <ArrowRight size={19}/></button>
        </section>

        <section className="mobile-vitals" aria-label="Latest wellbeing ratings">
          {mobileVitals.map(({label,value,icon:Icon,copy}) => <article key={label}><span><Icon size={18}/></span><div><small>{label}</small><strong>{value}/5</strong><p>{copy}</p></div></article>)}
        </section>

        <div className="mobile-section-title"><div><span>Your day</span><h2>What would you like to do?</h2></div><button onClick={() => onNavigate("progress")}>Progress <ArrowUpRight size={15}/></button></div>
        <section className="mobile-action-grid">
          <button onClick={() => onNavigate("care")}><span><HeartPulse size={21}/></span><div><strong>Open daily care centre</strong><small>Output, hydration, skin and plan</small></div><ChevronRight size={18}/></button>
          <button onClick={() => onNavigate("diary")}><span><Camera size={21}/></span><div><strong>Add diary photo</strong><small>Keep a visual record</small></div><ChevronRight size={18}/></button>
          <button onClick={() => onNavigate("supplies")}><span><PackageCheck size={21}/></span><div><strong>Manage supplies</strong><small>About four days left</small></div><ChevronRight size={18}/></button>
          <button onClick={onMessage}><span><MessageCircle size={21}/></span><div><strong>Message your nurse</strong><small>Usually replies in one day</small></div><ChevronRight size={18}/></button>
        </section>

        <section className="mobile-nurse-card">
          <div className="nurse-avatar nurse-avatar--large">SW<span/></div>
          <div><small>Your stoma care nurse</small><strong>{data.profile.nurse}</strong><p><i/> Available to support you</p></div>
          <button onClick={onMessage} aria-label={`Message ${data.profile.nurse}`}><ArrowUpRight size={18}/></button>
        </section>
      </div>

      <div className="desktop-patient-home">
      <header className="award-greeting">
        <div><span className="eyebrow">Patient workspace · {workspaceDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span><p>Good evening, {data.profile.firstName}</p></div>
        <div className="award-greeting__right"><span className={`sync-state sync-state--${syncState}`}><ShieldCheck size={16} /> {syncState === "saving" ? "Saving changes…" : syncState === "error" ? "Using demo data" : syncState === "loading" ? "Connecting…" : "All changes saved"}</span><button className="profile-button" onClick={() => onNavigate("profile")} aria-label="Open your profile">{data.profile.firstName.slice(0,1)}D</button></div>
      </header>

      <section className="award-hero">
        <div className="award-hero__copy">
          <span className="calm-status"><i /> Recovery signal online</span>
          <h1>Recovery,<br/><em>clearly connected.</em></h1>
          <p>{data.profile.homeSubtitle}</p>
          <div className="award-hero__actions">
            <button className="button button--coral" onClick={onCheckIn}>Start today’s check-in <ArrowUpRight size={18} /></button>
            <button className="text-link" onClick={() => onNavigate("progress")}>See your progress <ArrowRight size={16} /></button>
          </div>
          <div className="trust-line"><ShieldCheck size={15}/><span>Private by design</span><i/><span>Non-diagnostic</span><i/><span>You control what is shared</span></div>
        </div>

        <div className="recovery-console" aria-label="Interactive recovery flow">
          <header className="console-head"><div><span>LIVE RECOVERY FLOW</span><small>STOMA ALERT / PATIENT 0067</small></div><b><i/> CONNECTED</b></header>
          <div className="console-flow" role="tablist" aria-label="Recovery stages">
            {recoveryFlow.map((stage, index) => {
              const StageIcon = stage.icon;
              return <button key={stage.label} className={activeStage === index ? "is-active" : ""} onClick={() => setActiveStage(index)} role="tab" aria-selected={activeStage === index}><small>0{index + 1}</small><span><StageIcon size={17}/></span><b>{stage.label}</b>{index < recoveryFlow.length - 1 && <i/>}</button>;
            })}
          </div>
          <div className="console-detail">
            <div className="console-detail__icon"><ActiveSignalIcon size={26}/><span/></div>
            <div><small>SELECTED SIGNAL · 0{activeStage + 1}</small><h3>{activeSignal.label}</h3><p>{activeSignal.detail}</p></div>
            <strong>{activeSignal.meta}<CheckCircle2 size={16}/></strong>
          </div>
          <div className="console-metrics">
            <div><span>WELLBEING</span><strong>{score}%</strong><small><TrendingUp size={13}/> Latest check-in</small></div>
            <div><span>JOURNEY</span><strong>Day {journeyDay}</strong><small><Activity size={13}/> Consistent rhythm</small></div>
            <div><span>NEXT ACTION</span><strong>Check in</strong><small><Clock3 size={13}/> About 60 seconds</small></div>
          </div>
        </div>

        <div className="hero-signal-strip">
          <div><span><Droplets size={17}/></span><p><small>OUTPUT</small><strong>Latest rating</strong></p><b>{latest.output}/5</b></div>
          <div><span><Sparkles size={17}/></span><p><small>SKIN</small><strong>Latest rating</strong></p><b>{latest.skin}/5</b></div>
          <div><span><HeartPulse size={17}/></span><p><small>COMFORT</small><strong>Latest rating</strong></p><b>{latest.comfort}/5</b></div>
          <div><span><CloudSun size={17}/></span><p><small>MOOD</small><strong>Latest rating</strong></p><b>{latest.mood}/5</b></div>
        </div>
      </section>

      <section className="home-section-head"><div><span className="eyebrow">Recovery intelligence</span><h2>The signal behind your story.</h2></div><button onClick={() => onNavigate("diary")}>Open your diary <ArrowUpRight size={16}/></button></section>

      <section className="home-bento">
        <article className="journey-card">
          <div className="bento-head"><div><span className="eyebrow">Recovery signal</span><h3>Gently moving forward</h3></div><span className="signal-pill"><TrendingUp size={14}/> +6%</span></div>
          <p>Your comfort and confidence have improved across the last five check-ins.</p>
          <div className="signal-chart" aria-label="Wellbeing trend improving over five check-ins">
            <span className="signal-grid" />
            <svg viewBox="0 0 520 154" role="img"><defs><linearGradient id="home-signal-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2563eb" stopOpacity=".32"/><stop offset="1" stopColor="#2563eb" stopOpacity="0"/></linearGradient></defs><path d="M4 127 C70 118 93 132 148 105 S228 93 278 101 S366 70 414 72 S473 50 516 34 L516 154 L4 154Z" fill="url(#home-signal-fill)"/><path d="M4 127 C70 118 93 132 148 105 S228 93 278 101 S366 70 414 72 S473 50 516 34" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round"/><circle cx="516" cy="34" r="8" fill="#ffffff" stroke="#2563eb" strokeWidth="5"/></svg>
          </div>
          <div className="signal-legend"><span>7 Aug</span><span>Today</span></div>
        </article>

        <article className="today-card">
          <div className="bento-head"><div><span className="eyebrow">Today’s snapshot</span><h3>All four areas are in view</h3></div><Activity size={20}/></div>
          <div className="snapshot-list">
            <button><span className="snapshot-icon mint"><Droplets size={17}/></span><span><b>Output</b><small>Within your usual range</small></span><i className="steady">Steady</i></button>
            <button><span className="snapshot-icon butter"><Sparkles size={17}/></span><span><b>Skin</b><small>No new irritation logged</small></span><i className="steady">Steady</i></button>
            <button><span className="snapshot-icon coral"><HeartPulse size={17}/></span><span><b>Comfort</b><small>Improving this week</small></span><i className="up">Up</i></button>
            <button><span className="snapshot-icon blue"><CloudSun size={17}/></span><span><b>Mood</b><small>Feeling positive</small></span><i className="up">Up</i></button>
          </div>
        </article>

        <article className="nurse-card-premium">
          <span className="nurse-card__halo" />
          <div className="nurse-card__top"><div className="nurse-avatar nurse-avatar--large">SW<span /></div><span className="online-pill"><i/> Available</span></div>
          <span className="eyebrow">Your stoma care nurse</span><h3>Sarah is part of your journey.</h3><p>She can see the check-ins you choose to share and usually replies within one working day.</p>
          <button onClick={onMessage}>Message Sarah <ArrowUpRight size={16}/></button>
        </article>

        <article className="quick-card">
          <div className="bento-head"><div><span className="eyebrow">Do something</span><h3>Quick actions</h3></div></div>
          <div className="quick-list">
            <button onClick={() => onNavigate("care")}><span><HeartPulse size={19}/></span><div><b>Open daily care centre</b><small>Output, hydration, skin and plan</small></div><ArrowUpRight size={17}/></button>
            <button onClick={() => onNavigate("diary")}><span><ScanLine size={19}/></span><div><b>Add a diary photo</b><small>Clear, guided image capture</small></div><ArrowUpRight size={17}/></button>
            <button onClick={() => onNavigate("supplies")}><span><PackageCheck size={19}/></span><div><b>Manage supplies</b><small>About four days remaining</small></div><ArrowUpRight size={17}/></button>
            <button onClick={() => onNavigate("learn")}><span><BookOpen size={19}/></span><div><b>Learn & feel prepared</b><small>Guidance for this stage</small></div><ArrowUpRight size={17}/></button>
          </div>
        </article>
      </section>
      </div>
    </section>
  );
}

function ViewHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <header className="view-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</header>;
}

function CareView({ data, onAction, onMessage, onNavigate }: { data: AppData; onAction: (action: AppAction) => Promise<void>; onMessage: () => void; onNavigate: (view: PatientView) => void }) {
  const [tab, setTab] = useState<"today" | "skin" | "plan" | "travel">("today");
  const [draft, setDraft] = useState({ outputMl:650, consistency:"usual" as const, hydrationMl:1800, skinStatus:"comfortable" as const, pain:1, leak:false, pouchChanged:false, food:"", symptoms:"" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const latest = data.careLogs[0];
  const referenceAmount = data.profile.stomaType === "Ileostomy" ? 1500 : data.profile.stomaType === "Colostomy" ? 1000 : 2000;
  const needsReview = Boolean(latest && (latest.skinStatus === "broken" || latest.skinStatus === "sore" || latest.pain >= 7 || latest.leak || (latest.consistency === "watery" && latest.outputMl >= referenceAmount)));
  const completedTasks = data.careTasks.filter((task) => task.completed).length;
  const travelTasks = data.careTasks.filter((task) => task.category === "travel");
  const taskIcon = { routine:Clock3, appointment:CalendarDays, travel:Plane, recovery:Activity };
  const setField = <K extends keyof typeof draft>(field: K, value: (typeof draft)[K]) => setDraft((current) => ({ ...current, [field]:value }));
  const saveLog = async () => {
    setSaving(true); setError(""); setSaved(false);
    try { await onAction({ type:"save_care_log", log:draft }); setSaved(true); setDraft((current) => ({ ...current, pouchChanged:false, leak:false, food:"", symptoms:"" })); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Care log could not be saved"); }
    finally { setSaving(false); }
  };
  const exportCareSummary = () => downloadFile("stoma-alert-care-summary.csv", `date,output_ml,consistency,hydration_ml,skin,pain,leak,pouch_changed,food,symptoms\n${data.careLogs.map((log) => [log.createdAt,log.outputMl,log.consistency,log.hydrationMl,log.skinStatus,log.pain,log.leak,log.pouchChanged,JSON.stringify(log.food),JSON.stringify(log.symptoms)].join(",")).join("\n")}`, "text/csv");
  const downloadTravelCard = () => downloadFile("stoma-alert-travel-card.txt", `STOMA TRAVEL INFORMATION\n\nName: ${data.profile.firstName}\nStoma type: ${data.profile.stomaType}\nStoma care nurse: ${data.profile.nurse}\nSupplier: ${data.profile.supplier}\n\nThis person has a stoma and carries essential medical supplies. They may need privacy, additional time and access to toilet facilities.\n\nPrototype card — ask your clinician to verify details before travel.` , "text/plain");

  return <section className="product-view care-centre">
    <ViewHeading eyebrow="Daily care centre" title="Everything your stoma day needs" copy="Track the details that matter, prepare for what is next, and share one clear record with your care team." action={<button className="button button--quiet" onClick={exportCareSummary}><Download size={17}/> Export care summary</button>}/>
    <div className="care-command-strip">
      <article><span><Droplets size={20}/></span><div><small>Latest output</small><strong>{latest ? `${latest.outputMl} ml` : "Not logged"}</strong><p>{latest?.consistency || "Add today’s record"}</p></div></article>
      <article><span><GlassWater size={20}/></span><div><small>Fluids logged</small><strong>{latest ? `${latest.hydrationMl} ml` : "Not logged"}</strong><p>Use your personal care plan</p></div></article>
      <article><span><Sparkles size={20}/></span><div><small>Skin</small><strong>{latest ? latest.skinStatus : "Not checked"}</strong><p>Patient-reported</p></div></article>
      <article><span><ListChecks size={20}/></span><div><small>Care plan</small><strong>{completedTasks}/{data.careTasks.length}</strong><p>Items complete</p></div></article>
    </div>
    {needsReview && <div className="care-review-banner" role="status"><AlertCircle size={21}/><div><strong>Your latest record may be useful to review</strong><p>This is not a diagnosis. If this is new, worsening or concerning, follow your care plan or contact your stoma care team.</p></div><button onClick={onMessage}>Message nurse</button></div>}
    <nav className="care-tabs" aria-label="Daily care sections">{[["today","Today",HeartPulse],["skin","Skin check",Sparkles],["plan","Care plan",CalendarDays],["travel","Travel",Plane]].map(([id,label,Icon]) => <button key={String(id)} className={tab === id ? "is-active" : ""} onClick={() => setTab(id as typeof tab)}><Icon size={17}/>{String(label)}</button>)}</nav>

    {tab === "today" && <div className="care-layout">
      <article className="panel care-log-form">
        <div className="panel-heading"><div><span className="eyebrow">Structured daily record</span><h2>Log output, fluids and pouch care</h2></div><span className="status-pill stable">Private</span></div>
        <div className="care-form-grid">
          <label>24-hour output amount <span>ml</span><input type="number" min="0" max="10000" inputMode="numeric" value={draft.outputMl} onChange={(event) => setField("outputMl", Number(event.target.value))}/></label>
          <label>Consistency<select value={draft.consistency} onChange={(event) => setField("consistency", event.target.value as typeof draft.consistency)}><option value="watery">Watery</option><option value="loose">Loose</option><option value="usual">Usual for me</option><option value="firm">Firm</option></select></label>
          <label>Fluids taken <span>ml</span><input type="number" min="0" max="10000" inputMode="numeric" value={draft.hydrationMl} onChange={(event) => setField("hydrationMl", Number(event.target.value))}/></label>
          <label>Skin feels<select value={draft.skinStatus} onChange={(event) => setField("skinStatus", event.target.value as typeof draft.skinStatus)}><option value="comfortable">Comfortable</option><option value="itchy">Itchy</option><option value="sore">Sore</option><option value="broken">Broken or weeping</option></select></label>
          <label className="pain-field">Pain or discomfort <span>{draft.pain}/10</span><input type="range" min="0" max="10" value={draft.pain} onChange={(event) => setField("pain", Number(event.target.value))}/></label>
          <div className="care-toggles"><button className={draft.pouchChanged ? "is-selected" : ""} onClick={() => setField("pouchChanged",!draft.pouchChanged)}><CheckCircle2 size={18}/> Pouch changed</button><button className={draft.leak ? "is-alert" : ""} onClick={() => setField("leak",!draft.leak)}><Droplets size={18}/> Leak noticed</button></div>
          <label className="span-two">Meals and drinks<textarea value={draft.food} onChange={(event) => setField("food",event.target.value)} placeholder="What did you eat and drink?" maxLength={500}/></label>
          <label className="span-two">Symptoms or notes<textarea value={draft.symptoms} onChange={(event) => setField("symptoms",event.target.value)} placeholder="Gas, cramps, medication changes, activity or anything unusual" maxLength={500}/></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {saved && <p className="form-success"><Check size={16}/> Daily care record saved and added to your diary.</p>}
        <footer><p><ShieldCheck size={15}/> Tracking supports a care conversation; it does not replace clinical advice.</p><button className="button" disabled={saving} onClick={saveLog}>{saving ? "Saving…" : "Save today’s care log"}<ArrowRight size={17}/></button></footer>
      </article>
      <aside className="care-side-stack">
        <article className="panel care-history"><div className="panel-heading"><div><span className="eyebrow">Recent record</span><h2>Your care timeline</h2></div></div>{data.careLogs.slice(0,4).map((log) => <div key={log.id}><span className={`care-history__dot ${log.leak || log.skinStatus === "sore" || log.skinStatus === "broken" ? "review" : ""}`}/><div><strong>{new Date(log.createdAt).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</strong><p>{log.outputMl} ml · {log.consistency} · {log.hydrationMl} ml fluids</p><small>{log.skinStatus} skin · pain {log.pain}/10{log.pouchChanged ? " · pouch changed" : ""}</small></div></div>)}</article>
        <article className="care-reference"><AlertCircle size={20}/><div><strong>Know when to get help</strong><p>Use your individual care plan. Seek urgent clinical advice for severe cramps, vomiting, heavy bleeding, dehydration signs, or no stoma activity with concerning symptoms.</p><a href="https://www.nhs.uk/tests-and-treatments/ileostomy/complications/" target="_blank" rel="noreferrer">Read NHS guidance <ArrowUpRight size={14}/></a></div></article>
      </aside>
    </div>}

    {tab === "skin" && <div className="skin-workspace">
      <article className="panel guided-skin-card"><span className="guided-number">01</span><div><span className="eyebrow">Observe</span><h2>Look after removing the pouch</h2><p>Notice colour, moisture, soreness, itching, broken areas and whether the skin matches your usual appearance.</p></div></article>
      <article className="panel guided-skin-card"><span className="guided-number">02</span><div><span className="eyebrow">Record</span><h2>Add a clear private photo</h2><p>Use similar lighting and distance so change over time is easier for you and your care team to review.</p><button onClick={() => onNavigate("diary")}>Open photo diary <Camera size={16}/></button></div></article>
      <article className="panel guided-skin-card"><span className="guided-number">03</span><div><span className="eyebrow">Share</span><h2>Ask before it gets worse</h2><p>Persistent soreness, broken skin, repeated leaks or a suddenly poor fit are useful reasons to contact your stoma nurse.</p><button onClick={onMessage}>Message {data.profile.nurse.split(" ")[0]} <MessageCircle size={16}/></button></div></article>
      <article className="skin-safety-note"><ShieldCheck size={23}/><div><strong>Guided self-observation, not automated diagnosis</strong><p>Stoma Alert does not classify images or prescribe treatment. A qualified clinician should assess concerns.</p></div></article>
    </div>}

    {tab === "plan" && <div className="plan-layout">
      <article className="panel task-list"><div className="panel-heading"><div><span className="eyebrow">Routine, appointments and recovery</span><h2>Your shared care plan</h2></div><span>{completedTasks}/{data.careTasks.length} complete</span></div>{data.careTasks.map((task) => { const Icon = taskIcon[task.category]; return <button key={task.id} className={task.completed ? "is-complete" : ""} onClick={() => onAction({ type:"toggle_care_task", id:task.id })}><i>{task.completed ? <Check size={16}/> : <Icon size={17}/>}</i><span><strong>{task.title}</strong><p>{task.detail}</p><small>{task.category} · {new Date(task.dueDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</small></span><ChevronRight size={17}/></button>})}</article>
      <aside className="plan-side">
        <article className="next-appointment"><span><CalendarDays size={22}/></span><small>Next care review</small><h3>26 August · 10:30</h3><p>Video appointment with {data.profile.nurse}</p><button onClick={onMessage}>Send a question first <ArrowRight size={15}/></button></article>
        <article className="panel recovery-path"><span className="eyebrow">Recovery pathway</span><h2>Move with confidence</h2>{["Reconnect with breathing","Gentle everyday movement","Build strength gradually"].map((item,index) => <div key={item}><i>{index + 1}</i><span><strong>{item}</strong><small>{index === 0 ? "Current phase" : "Unlock with your care plan"}</small></span></div>)}<p><HeartHandshake size={16}/> Confirm movement and lifting advice with your own clinical team.</p></article>
      </aside>
    </div>}

    {tab === "travel" && <div className="travel-layout">
      <article className="travel-hero"><span><Plane size={27}/></span><div><span className="eyebrow">Travel mode</span><h2>Prepared, discreet and confident</h2><p>Build an emergency kit, keep key details together and plan enough supplies for disruption.</p></div><button className="button" onClick={downloadTravelCard}><Download size={17}/> Download travel card</button></article>
      <div className="travel-columns">
        <article className="panel travel-checklist"><div className="panel-heading"><div><span className="eyebrow">Before you leave</span><h2>Travel checklist</h2></div></div>{travelTasks.map((task) => <button key={task.id} className={task.completed ? "is-complete" : ""} onClick={() => onAction({ type:"toggle_care_task", id:task.id })}><i>{task.completed && <Check size={15}/>}</i><span><strong>{task.title}</strong><small>{task.detail}</small></span></button>)}{["Carry supplies in hand luggage","Pack disposal bags and spare clothes","Save prescriptions and nurse details"].map((item,index) => <div key={item}><i>{index + 1}</i><span>{item}</span></div>)}</article>
        <article className="panel travel-support"><span className="eyebrow">Trusted resources</span><h2>Know before you go</h2><p>Colostomy UK offers a CAA-endorsed travel certificate, a travel checklist and practical guidance for airport security.</p><a href="https://www.colostomyuk.org/information/travel-advice/" target="_blank" rel="noreferrer">Open official travel advice <ArrowUpRight size={15}/></a><div><ShieldCheck size={18}/><span><strong>Prototype travel card</strong><small>Ask your care team to verify it before relying on it.</small></span></div></article>
      </div>
    </div>}
  </section>;
}

function DiaryView({ data, onCheckIn, onUpload }: { data: AppData; onCheckIn: () => void; onUpload: (file: File) => Promise<void> }) {
  const [filter, setFilter] = useState<"all" | "checkin" | "photo">("all");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const entries = data.diaryEntries;
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  const entryDays = new Set(entries.map((entry) => new Date(entry.createdAt).getDate()));
  const photos = entries.filter((entry) => entry.type === "photo").length;
  return <section className="product-view">
    <ViewHeading eyebrow="Your record" title="Diary" copy="A private timeline of check-ins, images and notes shared with your care team." action={<button className="button" onClick={onCheckIn}>New check-in <ClipboardCheck size={17} /></button>} />
    <div className="mini-stats">
      <div><span className="mini-stat__icon mint"><CheckCircle2 size={19} /></span><strong>{data.checkins.length}</strong><small>Check-ins</small></div>
      <div><span className="mini-stat__icon lilac"><Camera size={19} /></span><strong>{photos}</strong><small>Photos</small></div>
      <div><span className="mini-stat__icon peach"><TrendingUp size={19} /></span><strong>{Math.min(7, data.checkins.length)} days</strong><small>Recent rhythm</small></div>
    </div>
    <article className="panel diary-upload">
      <div><span className="diary-upload__icon"><Camera size={22}/></span><div><strong>Add a private diary photo</strong><p>JPG, PNG or HEIC up to 8 MB. Photos use protected storage when available, with an on-device prototype fallback.</p></div></div>
      <label className="file-picker"><input type="file" accept="image/*" onChange={(event) => { setFile(event.target.files?.[0] || null); setError(""); }}/><span>{file ? file.name : "Choose photo"}</span></label>
      <button className="button" disabled={!file || uploading} onClick={async () => { if (!file) return; setUploading(true); setError(""); try { await onUpload(file); setFile(null); } catch (caught) { setError(caught instanceof Error ? caught.message : "Upload failed"); } finally { setUploading(false); } }}>{uploading ? "Uploading…" : "Upload photo"} <ArrowUpRight size={16}/></button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </article>
    <div className="two-col-layout">
      <article className="panel calendar-panel">
        <div className="panel-heading"><div><span className="eyebrow">August 2026</span><h2>Your activity</h2></div><CalendarDays size={20} /></div>
        <div className="calendar-days">{["M","T","W","T","F","S","S"].map((day,index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
        <div className="calendar-grid"><span /><span /><span /><span /><span />{days.map((day) => <button key={day} className={entryDays.has(day) ? "has-entry" : day === new Date().getDate() ? "is-today" : ""}>{day}</button>)}</div>
        <div className="calendar-key"><span><i className="key-checkin" /> Check-in</span><span><i className="key-photo" /> Photo</span></div>
      </article>
      <article className="panel timeline-panel">
        <div className="panel-heading timeline-heading"><div><span className="eyebrow">Recent activity</span><h2>Your timeline</h2></div><div className="filter-pills">{(["all","checkin","photo"] as const).map(item => <button key={item} className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>{item === "all" ? "All" : item === "checkin" ? "Check-ins" : "Photos"}</button>)}</div></div>
        <div className="timeline-list">{entries.filter(entry => filter === "all" || entry.type === filter).map((entry) => { const stamp = formatEntryDate(entry.createdAt); const photoHref = entry.fileKey?.startsWith("data:") ? entry.fileKey : entry.fileKey ? `/api/files?key=${encodeURIComponent(entry.fileKey)}` : null; return <div className="timeline-entry" key={entry.id}><span className={`timeline-icon ${entry.type === "photo" ? "photo" : "good"}`}>{entry.type === "photo" ? <Camera size={18} /> : <ClipboardCheck size={18} />}</span><div><span>{stamp.day} · {stamp.time}</span><strong>{entry.title}</strong><p>{entry.detail}</p>{photoHref && <a className="photo-link" href={photoHref} target="_blank" rel="noreferrer">View private photo <ArrowUpRight size={13}/></a>}</div><ChevronRight size={18} /></div>; })}</div>
      </article>
    </div>
  </section>;
}

function ProgressView({ data }: { data: AppData }) {
  const score = wellbeing(data.checkins);
  const latest = data.checkins[0] || fallbackData.checkins[0];
  const dimensions = [["Output",latest.output * 20],["Skin",latest.skin * 20],["Comfort",latest.comfort * 20],["Mood",latest.mood * 20]] as const;
  const uniqueDays = new Set(data.checkins.map((item) => item.createdAt.slice(0,10))).size;
  const exportSummary = () => downloadFile("stoma-alert-progress.csv", `date,output,skin,comfort,mood\n${data.checkins.map((item) => `${item.createdAt},${item.output},${item.skin},${item.comfort},${item.mood}`).join("\n")}`, "text/csv");
  return <section className="product-view">
    <ViewHeading eyebrow="Outcome tracking" title="Your progress" copy="See patterns in your own check-ins over time. These insights support care conversations and are not a diagnosis." action={<button className="button button--quiet" onClick={exportSummary}><Download size={17} /> Download summary</button>} />
    <div className="progress-summary">
      <article className="score-card"><ProgressRing value={score} /><div><span className="eyebrow">Wellbeing index</span><strong>{score >= 75 ? "Moving forward" : "Keep checking in"}</strong><p>Based on your latest four ratings</p></div></article>
      <article><span className="summary-icon mint"><ClipboardCheck size={21} /></span><div><strong>{data.checkins.length}</strong><small>Total check-ins</small></div></article>
      <article><span className="summary-icon peach"><CalendarDays size={21} /></span><div><strong>{uniqueDays}</strong><small>Days tracked</small></div></article>
      <article><span className="summary-icon lilac"><Camera size={21} /></span><div><strong>{data.diaryEntries.filter((entry) => entry.type === "photo").length}</strong><small>Diary photos</small></div></article>
    </div>
    <div className="progress-layout">
      <article className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">Last 10 check-ins</span><h2>Confidence & quality of life</h2></div><span className="trend-pill">↗ Improving</span></div>
        <div className="chart-wrap"><div className="y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 600 210" role="img" aria-label="Wellbeing trend rising from 58 to 78 percent"><defs><linearGradient id="wellbeing-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2563eb" stopOpacity=".25"/><stop offset="1" stopColor="#2563eb" stopOpacity="0"/></linearGradient></defs><path d="M10 157 C65 140 90 150 140 130 S220 106 270 119 S350 84 410 94 S500 54 590 46 L590 200 L10 200Z" fill="url(#wellbeing-fill)"/><path d="M10 157 C65 140 90 150 140 130 S220 106 270 119 S350 84 410 94 S500 54 590 46" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round"/><circle cx="590" cy="46" r="7" fill="#fff" stroke="#2563eb" strokeWidth="5"/></svg></div>
        <div className="chart-axis"><span>7 Aug</span><span>10 Aug</span><span>13 Aug</span><span>16 Aug</span><span>Today</span></div>
      </article>
      <article className="panel dimensions-panel"><div className="panel-heading"><div><span className="eyebrow">Your ratings</span><h2>Latest check-in by area</h2></div></div>{dimensions.map(([label,value]) => <div className="dimension-row" key={label}><div><strong>{label}</strong><span>{value >= 80 ? "Good" : value >= 60 ? "Steady" : "Keep in view"}</span></div><div className="bar"><i style={{width:`${value}%`}} /></div><b>{value}%</b></div>)}</article>
    </div>
    <article className="streak-card"><span className="streak-icon"><Sparkles size={26} /></span><div><span className="eyebrow">Check-in consistency</span><h3>{Math.min(7, uniqueDays)} active days recorded</h3><p>Small, regular updates give your care team the clearest view of recovery.</p></div><div className="week-dots">{["M","T","W","T","F","S","S"].map((day,index) => <span key={`${day}-${index}`}><i>{index < Math.min(7, uniqueDays) && <Check size={13} />}</i>{day}</span>)}</div></article>
  </section>;
}

function SuppliesView({ data, onAction }: { data: AppData; onAction: (action: AppAction) => Promise<void> }) {
  const [supplier, setSupplier] = useState(data.profile.supplier);
  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");
  return <section className="product-view">
    <ViewHeading eyebrow="Product support" title="Your supplies" copy="Keep track of your products and request the next delivery from your chosen supplier." action={<button className="button button--quiet" onClick={() => setShowHistory(!showHistory)}><PackageOpen size={17} /> {showHistory ? "Hide history" : "Request history"}</button>} />
    {requested && <div className="success-banner"><CheckCircle2 size={19} /><div><strong>Reorder request sent</strong><p>{supplier} will contact you to confirm the delivery.</p></div><button onClick={() => setRequested(false)} aria-label="Dismiss"><X size={17}/></button></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {showHistory && <article className="panel request-history"><div className="panel-heading"><div><span className="eyebrow">Saved requests</span><h2>Reorder history</h2></div></div>{data.supplyRequests.length ? data.supplyRequests.map((item) => <div key={item.id}><span><strong>{item.product}</strong><small>{new Date(item.createdAt).toLocaleString("en-GB")}</small></span><b>{item.supplier}</b><i className="status-pill review">{item.status}</i></div>) : <p>No requests yet. Your next reorder will appear here.</p>}</article>}
    <div className="supplies-layout">
      <div>
        <article className="panel inventory-card"><div className="panel-heading"><div><span className="eyebrow">Live inventory</span><h2>Products at home</h2></div><Box size={20}/></div><p>Adjust quantities as you use or receive products. Low-stock items are highlighted automatically.</p><div className="inventory-list">{data.inventory.map((item) => { const low = item.quantity <= item.reorderAt; return <div key={item.id} className={low ? "is-low" : ""}><span className="inventory-icon"><PackageCheck size={19}/></span><span><strong>{item.name}</strong><small>{item.productCode} · reorder at {item.reorderAt}</small></span><i className={`status-pill ${low ? "review" : "stable"}`}>{low ? "Low stock" : "In stock"}</i><div className="stepper-control"><button aria-label={`Remove one ${item.name}`} onClick={() => onAction({ type:"adjust_inventory", id:item.id, change:-1 })}><Minus size={14}/></button><b>{item.quantity}</b><button aria-label={`Add one ${item.name}`} onClick={() => onAction({ type:"adjust_inventory", id:item.id, change:1 })}><Plus size={14}/></button></div></div>})}</div></article>
        <article className="panel request-card"><div><span className="eyebrow">Quick reorder</span><h2>Ready for your next box?</h2><p>Your request goes to {supplier}. They’ll confirm quantities and delivery.</p></div><button className="button" onClick={async () => { setRequesting(true); setError(""); try { await onAction({ type:"request_supplies", supplier }); setRequested(true); } catch (caught) { setError(caught instanceof Error ? caught.message : "Request could not be sent"); } finally { setRequesting(false); } }} disabled={requested || requesting}>{requesting ? "Sending…" : requested ? "Request sent" : "Request supplies"} <ArrowRight size={17} /></button></article>
      </div>
      <aside className="panel supplier-card"><span className="eyebrow">Delivery partner</span><h2>Your supplier</h2><p>Choose who receives this demo reorder request.</p><label htmlFor="supplier">Selected supplier</label><div className="select-wrap"><select id="supplier" value={supplier} onChange={(event) => { setSupplier(event.target.value); setRequested(false); }}>{["Fittleworth","Coloplast Charter","SecuriCare","Amcare","Bullen","Respond","Salts Healthcare"].map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={17}/></div><div className="supplier-help"><MessageCircle size={18}/><div><strong>Having a product problem?</strong><p>Message your care team for fitting support.</p></div><ChevronRight size={17}/></div></aside>
    </div>
  </section>;
}

function LearnView({ data, onAction }: { data: AppData; onAction: (action: AppAction) => Promise<void> }) {
  const done = data.profile.learning;
  const completed = done.filter(Boolean).length;
  const guides = [
    { title: "Caring for the skin around your stoma", category: "Everyday care", time: "6 min", tone: "mint" },
    { title: "Eating and drinking with confidence", category: "Food & hydration", time: "8 min", tone: "peach" },
    { title: "Getting out and about again", category: "Living well", time: "5 min", tone: "lilac" },
  ];
  return <section className="product-view"><ViewHeading eyebrow="Education · for you" title="Living well, week by week" copy="Clear, trusted guidance that meets you where you are in recovery." />
    <div className="learn-hero"><div><span className="eyebrow">Your learning</span><h2>{completed} of 3 guides completed</h2><p>Build confidence at your own pace. Pick up wherever you left off.</p></div><div className="learn-progress"><ProgressRing value={Math.round((completed/3)*100)}/></div></div>
    <div className="guide-grid">{guides.map((guide,index) => <article className="guide-card" key={guide.title}><span className={`guide-visual ${guide.tone}`}><BookOpen size={28}/></span><div className="guide-card__copy"><span className="eyebrow">{guide.category}</span><h3>{guide.title}</h3><p><Clock3 size={14}/> {guide.time} read</p></div><button className={done[index] ? "is-complete" : ""} onClick={() => onAction({ type:"toggle_guide", index })}>{done[index] ? <><CheckCircle2 size={17}/> Completed</> : <>Mark complete <ChevronRight size={17}/></>}</button></article>)}</div>
    <article className="support-strip"><span><Stethoscope size={25}/></span><div><span className="eyebrow">Need to speak to someone?</span><h3>Colostomy UK Stoma Helpline</h3><p>Open 9am–10pm, 365 days a year</p></div><a href="tel:08003284257">0800 328 4257</a></article>
  </section>;
}

function ProfileView({ data, onAction }: { data: AppData; onAction: (action: AppAction) => Promise<void> }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<ProfileData>(data.profile);
  const options = ["Drainable pouch","Closed pouch","Barrier spray","Adhesive remover","Support belt","Ostomy powder"];
  const update = (field: keyof ProfileData, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const save = async () => { setSaving(true); setError(""); try { await onAction({ type:"update_profile", profile:draft }); setSaved(true); setTimeout(() => setSaved(false),2200); } catch (caught) { setError(caught instanceof Error ? caught.message : "Profile could not be saved"); } finally { setSaving(false); } };
  return <section className="product-view"><ViewHeading eyebrow="Your details" title="Stoma profile" copy="Keep your care information up to date. It is shared securely with your care team." action={<button className="button" disabled={saving} onClick={save}>{saved ? <><Check size={17}/> Saved</> : saving ? "Saving…" : "Save changes"}</button>} />
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="profile-layout"><div><article className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">Personal details</span><h2>About you</h2></div><CircleUserRound size={20}/></div><div className="form-grid"><label>First name<input value={draft.firstName} onChange={(event) => update("firstName", event.target.value)}/></label><label>Email address<input type="email" value={draft.email} readOnly/></label></div></article>
      <article className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">Clinical profile</span><h2>Your stoma</h2></div><HeartPulse size={20}/></div><div className="form-grid"><label>Type of stoma<select value={draft.stomaType} onChange={(event) => update("stomaType", event.target.value)}><option>Colostomy</option><option>Ileostomy</option><option>Urostomy</option></select></label><label>Duration<select value={draft.duration} onChange={(event) => update("duration", event.target.value)}><option>Permanent</option><option>Temporary</option><option>Not sure</option></select></label><label>Date created<input type="date" value={draft.dateCreated} onChange={(event) => update("dateCreated", event.target.value)}/></label><label>Stoma care nurse<input value={draft.nurse} readOnly/></label></div></article></div>
      <aside><article className="panel products-panel"><span className="eyebrow">Your routine</span><h2>Products you use</h2><p>Select all that apply.</p><div className="product-checks">{options.map(option => <button key={option} className={draft.products.includes(option) ? "is-selected" : ""} onClick={() => setDraft((current) => ({ ...current, products: current.products.includes(option) ? current.products.filter(item => item !== option) : [...current.products,option] }))}><span>{draft.products.includes(option) && <Check size={13}/>}</span>{option}</button>)}</div></article><article className="data-card"><ShieldCheck size={22}/><div><strong>Your data, your rights</strong><p>Download a copy of all records saved in this prototype.</p><button onClick={() => downloadFile("stoma-alert-data.json", JSON.stringify(data, null, 2))}><Download size={15}/> Download my data</button></div></article></aside>
    </div>
  </section>;
}

function PatientMessagePanel({ data, onAction, onClose }: { data: AppData; onAction: (action: AppAction) => Promise<void>; onClose: () => void }) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  return <div className="sheet-backdrop" role="presentation" onMouseDown={onClose}><section className="message-sheet" role="dialog" aria-modal="true" aria-labelledby="message-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="eyebrow">Secure care message</span><h2 id="message-title">Message {data.profile.nurse}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close messages"><X size={20}/></button></header><div className="messages patient-messages">{data.messages.map((message) => <div className={`message ${message.sender}`} key={message.id}><p>{message.body}</p><span>{new Date(message.createdAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span></div>)}</div><div className="patient-composer"><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message to your care team…" maxLength={1000}/><div><small>{body.length}/1000</small><button className="button" disabled={!body.trim() || sending} onClick={async () => { setSending(true); try { await onAction({type:"send_message",body,sender:"patient"}); setBody(""); } finally { setSending(false); } }}>{sending ? "Sending…" : "Send message"}<ArrowRight size={17}/></button></div></div></section></div>;
}

type Role = "Patient" | "Nurse" | "Administrator";
type StaffView = "caseload" | "messages" | "reports" | "supplies" | "content";

function StaffDashboard({ role, view, data, onAction }: { role: Exclude<Role,"Patient">; view: StaffView; data: AppData; onAction: (action: AppAction) => Promise<void> }) {
  const isAdmin = role === "Administrator";
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [contentDraft, setContentDraft] = useState({ homeSubtitle:data.profile.homeSubtitle, checkinHeading:data.profile.checkinHeading });
  const [contentSaved, setContentSaved] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const latestCare = data.careLogs[0];
  const careNeedsReview = Boolean(latestCare && (latestCare.leak || latestCare.skinStatus === "sore" || latestCare.skinStatus === "broken" || latestCare.pain >= 7));
  const lowStockItems = data.inventory.filter((item) => item.quantity <= item.reorderAt).length;
  const adminContentCards = [
    { title:"App copy", copy:"Home prompts, check-in language and guidance", icon:FileText },
    { title:"Learning articles", copy:"Patient guides and education pathways", icon:BookOpen },
    { title:"Product helper", copy:"FAQs, suppliers and product guidance", icon:PackageOpen },
    { title:"Safety content", copy:"Escalation wording and support contacts", icon:ShieldCheck },
  ];
  const patients = [
    { name:`${data.profile.firstName} Doyle`, initials:`${data.profile.firstName.slice(0,1)}D`, status:careNeedsReview?"Review":"Connected", tone:careNeedsReview?"review":"stable", score:latestCare ? `${latestCare.outputMl} ml · ${latestCare.skinStatus} skin` : "Awaiting detailed log", when:"Now", last:"Today" },
    { name:"Margaret Lewis", initials:"ML", status:"Review", tone:"review", score:"2 areas easing", when:"09:24", last:"Today" },
    { name:"Peter Walsh", initials:"PW", status:"Stable", tone:"stable", score:"All areas steady", when:"08:51", last:"Today" },
    { name:"Amira Khan", initials:"AK", status:"New photo", tone:"photo", score:"Photo ready to review", when:"Yesterday", last:"Yesterday" },
    { name:"David Rose", initials:"DR", status:"No check-in", tone:"missing", score:"3 days since last update", when:"17 Aug", last:"17 Aug" },
    { name:"Joanne Field", initials:"JF", status:"Improving", tone:"improving", score:"Wellbeing +9%", when:"16 Aug", last:"16 Aug" },
  ];
  const visiblePatients = patients.filter((patient) => patient.name.toLowerCase().includes(patientSearch.toLowerCase()));
  const saveContent = async () => { await onAction({ type:"update_content", ...contentDraft }); setContentSaved(true); setTimeout(() => setContentSaved(false), 1800); };
  if (view === "content") return <section className="product-view staff-view"><ViewHeading eyebrow="Administrator" title="Patient-facing content" copy="Manage the information, learning and product support patients see." action={<button className="button" onClick={saveContent}>{contentSaved ? "Published" : "Publish updates"} <Check size={17}/></button>}/><div className="content-admin-grid">{adminContentCards.map(({title,copy,icon:Icon}) => <button className="admin-content-card" key={title}><span><Icon size={23}/></span><div><strong>{title}</strong><p>{copy}</p></div><ChevronRight size={18}/></button>)}</div><article className="panel editor-preview"><div><span className="eyebrow">Live app copy</span><h2>Home and check-in</h2><label>Home check-in subtitle<textarea value={contentDraft.homeSubtitle} onChange={(event) => setContentDraft((current) => ({...current,homeSubtitle:event.target.value}))}/></label><label>Check-in heading<input value={contentDraft.checkinHeading} onChange={(event) => setContentDraft((current) => ({...current,checkinHeading:event.target.value}))}/></label><button className="button" onClick={saveContent}>{contentSaved ? "Saved" : "Save section"}</button></div><div className="phone-preview"><span className="eyebrow">Patient preview</span><h3>Good evening, {data.profile.firstName}</h3><div><strong>{contentDraft.checkinHeading}</strong><p>{contentDraft.homeSubtitle}</p><button>Start today’s check-in</button></div></div></article></section>;
  if (view === "supplies") return <section className="product-view staff-view"><ViewHeading eyebrow="Administrator" title="Supplies overview" copy="Reorder demand across patients, suppliers and products." action={<button className="button button--quiet" onClick={() => downloadFile("supply-requests.csv", `supplier,product,status,date\n${data.supplyRequests.map((item) => `${item.supplier},${item.product},${item.status},${item.createdAt}`).join("\n")}`, "text/csv")}><Download size={17}/> Export</button>}/><div className="staff-stats"><article><PackageOpen size={20}/><div><strong>{data.supplyRequests.length}</strong><small>Open requests</small></div>{data.supplyRequests.length > 0 && <span className="status-pill review">Needs action</span>}</article><article><CheckCircle2 size={20}/><div><strong>42</strong><small>Completed this month</small></div></article><article><Clock3 size={20}/><div><strong>1.4 days</strong><small>Average fulfilment</small></div></article></div><article className="panel supplier-table"><div className="panel-heading"><div><span className="eyebrow">This month</span><h2>Latest requests</h2></div></div>{data.supplyRequests.length ? data.supplyRequests.map((item,index) => <div className="supplier-row" key={item.id}><strong>{item.supplier}</strong><div className="bar"><i style={{width:`${Math.max(18,100-index*16)}%`}}/></div><b>1</b><span>{item.status}</span></div>) : <p>No requests have been submitted yet.</p>}</article></section>;
  if (view === "reports") return <section className="product-view staff-view"><ViewHeading eyebrow={isAdmin?"Administrator":"Nurse portal"} title="Reports & audit" copy="Caseload activity for monitoring, handover and record-keeping—not diagnosis." action={<button className="button" onClick={() => downloadFile("care-team-report.csv", `date,wellbeing_output,skin,comfort,mood,detailed_output_ml,consistency,hydration_ml,skin_observation,pain,leak\n${data.checkins.map((item,index) => { const care=data.careLogs[index]; return `${item.createdAt},${item.output},${item.skin},${item.comfort},${item.mood},${care?.outputMl||""},${care?.consistency||""},${care?.hydrationMl||""},${care?.skinStatus||""},${care?.pain||""},${care?.leak||false}` }).join("\n")}`, "text/csv")}><Download size={17}/> Export care record</button>}/><div className="staff-stats"><article><ClipboardCheck size={20}/><div><strong>{data.checkins.length}</strong><small>Wellbeing check-ins</small></div></article><article><Droplets size={20}/><div><strong>{data.careLogs.length}</strong><small>Detailed care logs</small></div></article><article><AlertCircle size={20}/><div><strong>{careNeedsReview ? 1 : 0}</strong><small>Patient-reported review signals</small></div>{careNeedsReview && <span className="status-pill review">Review</span>}</article><article><PackageOpen size={20}/><div><strong>{lowStockItems}</strong><small>Low-stock products</small></div></article></div><div className="reports-grid"><article className="panel report-bars"><div className="panel-heading"><div><span className="eyebrow">Recent check-ins</span><h2>Wellbeing activity</h2></div></div>{data.checkins.slice(0,7).reverse().map((item,index) => <span key={item.id}><i style={{height:`${wellbeing([item])}%`}}/><small>{new Date(item.createdAt).toLocaleDateString("en-GB",{weekday:"narrow"}) || index}</small></span>)}</article><article className="panel audit-list"><div className="panel-heading"><div><span className="eyebrow">Patient status</span><h2>At a glance</h2></div></div>{[["Latest wellbeing",wellbeing(data.checkins),"stable"],["Detailed care logs",data.careLogs.length,careNeedsReview?"review":"stable"],["Diary entries",data.diaryEntries.length,"photo"],["Messages",data.messages.length,"missing"]].map(([label,count,tone]) => <div key={String(label)}><span className={`status-dot ${tone}`}/><strong>{label}</strong><b>{count}</b></div>)}</article></div></section>;
  if (view === "messages") return <section className="product-view staff-view"><ViewHeading eyebrow="Care team" title="Patient conversations" copy="Secure messages between patients and their stoma care team."/><div className="messages-layout"><article className="panel thread-list"><label className="search-box"><Search size={17}/><input placeholder="Search conversations…"/></label><button className="is-active"><span className="patient-avatar">{data.profile.firstName.slice(0,1)}D</span><span><strong>{data.profile.firstName} Doyle</strong><small>{data.messages.at(-1)?.body || "No messages yet"}</small></span><b>Now</b></button>{patients.slice(0,3).map((patient) => <button key={patient.name}><span className="patient-avatar">{patient.initials}</span><span><strong>{patient.name}</strong><small>Demo conversation</small></span><b>{patient.when}</b></button>)}</article><article className="panel conversation"><header><span className="patient-avatar">{data.profile.firstName.slice(0,1)}D</span><div><strong>{data.profile.firstName} Doyle</strong><small><i/> Demo workspace</small></div><span className="status-pill stable">Connected</span></header><div className="messages">{data.messages.map((message) => <div className={`message ${message.sender}`} key={message.id}><p>{message.body}</p><span>{new Date(message.createdAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span></div>)}</div><div className="composer"><input value={messageBody} onChange={(event) => setMessageBody(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && messageBody.trim()) event.currentTarget.nextElementSibling?.dispatchEvent(new MouseEvent("click",{bubbles:true})); }} placeholder={`Reply to ${data.profile.firstName}…`}/><button disabled={sending || !messageBody.trim()} onClick={async () => { setSending(true); try { await onAction({type:"send_message",body:messageBody,sender:"nurse"}); setMessageBody(""); } finally { setSending(false); } }} aria-label="Send message"><ArrowRight size={19}/></button></div></article></div></section>;
  return <section className="product-view staff-view"><ViewHeading eyebrow={isAdmin?"Administrator":"Nurse portal"} title="Today’s caseload" copy="Patient-reported information for review and follow-up—not diagnosis."/><div className="staff-stats"><article><UsersRound size={20}/><div><strong>31</strong><small>Patients</small></div></article><article><AlertCircle size={20}/><div><strong>{3 + Number(careNeedsReview)}</strong><small>Need review</small></div><span className="status-pill review">Review</span></article><article><ClipboardCheck size={20}/><div><strong>{data.careLogs.length}</strong><small>Detailed care logs</small></div></article><article><PackageOpen size={20}/><div><strong>{lowStockItems}</strong><small>Supply alerts</small></div></article></div><article className="panel caseload-panel"><div className="caseload-tools"><label className="search-box"><Search size={17}/><input value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} placeholder="Search by patient name…"/></label><button><CalendarDays size={17}/> Today <ChevronDown size={16}/></button></div><div className="patient-table"><div className="table-head"><span>Patient</span><span>Status</span><span>Latest signal</span><span>Last check-in</span><span/></div>{visiblePatients.map(patient => <button className="patient-row" key={patient.name}><span className="patient-name"><i className="patient-avatar">{patient.initials}</i><span><strong>{patient.name}</strong><small>Patient since Mar 2026</small></span></span><span><i className={`status-pill ${patient.tone}`}>{patient.status}</i></span><span>{patient.score}</span><span>{patient.last}</span><ChevronRight size={18}/></button>)}</div></article></section>;
}

export default function StomaAlertApp() {
  const [data, setData] = useState<AppData>(fallbackData);
  const [syncState, setSyncState] = useState<"loading" | "saved" | "saving" | "error">("loading");
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<PatientView>("home");
  const [staffView, setStaffView] = useState<StaffView>("caseload");
  const [role, setRole] = useState<Role>("Patient");
  const [roleOpen, setRoleOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/app", { headers:{ accept:"application/json" } }).then(async (response) => {
      const result = await response.json() as { data?: AppData; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error || "Could not connect to saved data");
      if (active) { setData(result.data); setSyncState("saved"); }
    }).catch(() => {
      if (!active) return;
      const local = readLocalData();
      if (local) setData(local);
      setSyncState("saved");
      setNotice(local ? "This prototype is using the test data saved on this device." : "This prototype is using test data. Changes will be saved on this device.");
    });
    return () => { active = false; };
  }, []);
  const performAction = async (action: AppAction) => {
    setSyncState("saving"); setNotice("");
    try {
      const response = await fetch("/api/app", { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify(action) });
      const result = await response.json() as { data?: AppData; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error || "Change could not be saved");
      setData(result.data); setSyncState("saved");
    } catch {
      const next = applyLocalAction(data, action);
      try { saveLocalData(next); } catch { setSyncState("error"); throw new Error("This device does not have enough storage for the change"); }
      setData(next); setSyncState("saved");
      setNotice("Saved on this device in prototype mode.");
    }
  };
  const uploadPhoto = async (file: File) => {
    setSyncState("saving");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/files", { method:"POST", body:form });
      const result = await response.json() as { data?: AppData; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error || "Photo could not be uploaded");
      setData(result.data); setSyncState("saved");
    } catch {
      if (!file.type.startsWith("image/")) { setSyncState("error"); throw new Error("Only image files are supported"); }
      if (file.size > localPhotoLimit) { setSyncState("error"); throw new Error("On-device prototype photos must be smaller than 1 MB"); }
      const now = new Date().toISOString();
      const fileKey = await readFileAsDataUrl(file);
      const next: AppData = { ...data, diaryEntries: [{ id:createId(), type:"photo", title:"Diary photo added", detail:`Image: ${file.name} · Saved on this device`, fileKey, fileName:file.name, createdAt:now }, ...data.diaryEntries] };
      try { saveLocalData(next); } catch { setSyncState("error"); throw new Error("This device does not have enough storage for the photo"); }
      setData(next); setSyncState("saved"); setNotice("Photo saved on this device in prototype mode.");
    }
  };
  const staffNav = [
    {id:"caseload" as const,label:"Patients",icon:UsersRound}, {id:"messages" as const,label:"Messages",icon:MessageCircle},
    {id:"reports" as const,label:"Reports",icon:FileText}, ...(role === "Administrator" ? [{id:"supplies" as const,label:"Supplies",icon:PackageOpen},{id:"content" as const,label:"Content",icon:Settings2}] : []),
  ];
  const patientContent = view === "home" ? <PatientHome data={data} syncState={syncState} onCheckIn={() => setCheckInOpen(true)} onMessage={() => setMessageOpen(true)} onNavigate={setView} /> : view === "care" ? <CareView data={data} onAction={performAction} onMessage={() => setMessageOpen(true)} onNavigate={setView}/> : view === "diary" ? <DiaryView data={data} onCheckIn={() => setCheckInOpen(true)} onUpload={uploadPhoto} /> : view === "progress" ? <ProgressView data={data} /> : view === "supplies" ? <SuppliesView data={data} onAction={performAction} /> : view === "learn" ? <LearnView data={data} onAction={performAction} /> : <ProfileView data={data} onAction={performAction} />;

  return (
    <div className="site-shell">
      <div className="prototype-banner"><span>Prototype</span> Test data only — not for use with real patients</div>
      {notice && <div className="app-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
      <header className="mobile-header"><Brand compact /><div className="mobile-header__actions">{role === "Patient" && <button className="mobile-header__profile" onClick={() => setView("profile")} aria-label="Open your profile"><CircleUserRound size={20}/></button>}<button className="icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu"><Menu size={21} /></button></div></header>
      <aside className={`sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="sidebar__top"><Brand /><button className="icon-button sidebar__close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
        <div className="role-switcher">
          <button className="role-card" onClick={() => setRoleOpen(!roleOpen)} aria-expanded={roleOpen}><span className="role-card__icon">{role === "Patient" ? <CircleUserRound size={20}/> : role === "Nurse" ? <Stethoscope size={20}/> : <Settings2 size={20}/>}</span><span><small>Viewing as</small><strong>{role}</strong></span><ChevronDown size={17}/></button>
          {roleOpen && <div className="role-menu">{(["Patient","Nurse","Administrator"] as Role[]).map(item => <button key={item} className={role === item ? "is-active" : ""} onClick={() => {setRole(item);setRoleOpen(false);setMenuOpen(false);}}>{item === "Patient" ? <CircleUserRound size={17}/> : item === "Nurse" ? <Stethoscope size={17}/> : <Settings2 size={17}/>}<span>{item}</span>{role === item && <Check size={15}/>}</button>)}</div>}
        </div>
        <nav aria-label={`${role} navigation`}>
          <span className="nav-label">{role === "Patient" ? "Your recovery" : "Care workspace"}</span>
          {role === "Patient" ? navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "is-active" : ""} onClick={() => { setView(id); setMenuOpen(false); }}><Icon size={20}/><span>{label}</span>{view === id && <span className="nav-dot"/>}</button>) : staffNav.map(({id,label,icon:Icon}) => <button key={id} className={staffView===id?"is-active":""} onClick={() => {setStaffView(id);setMenuOpen(false)}}><Icon size={20}/><span>{label}</span>{staffView===id&&<span className="nav-dot"/>}</button>)}
        </nav>
        <div className="sidebar__support"><span>{role === "Patient" ? <Stethoscope size={19}/> : <ShieldCheck size={19}/>}</span><div><strong>{role === "Patient" ? "Need help?" : "Clinical safety"}</strong><p>{role === "Patient" ? "Contact your care team" : "Non-diagnostic workspace"}</p></div><ChevronRight size={17}/></div>
        <p className="sidebar__footnote"><ShieldCheck size={14}/> Secure {role.toLowerCase()} experience</p>
      </aside>
      {menuOpen && <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu"/>}
      <main className="app-content">{role === "Patient" ? patientContent : <StaffDashboard role={role} view={staffView} data={data} onAction={performAction}/>}</main>
      {role === "Patient" && <nav className="mobile-nav" aria-label="Quick navigation">
        <button className={view==="home"?"is-active":""} onClick={() => setView("home")}><Home size={21}/><span>Home</span></button>
        <button className={view==="care"?"is-active":""} onClick={() => setView("care")}><HeartPulse size={21}/><span>Daily care</span></button>
        <button className="mobile-nav__checkin" onClick={() => setCheckInOpen(true)} aria-label="Start today’s check-in"><i><ClipboardCheck size={23}/></i><span>Check in</span></button>
        <button className={view==="diary"?"is-active":""} onClick={() => setView("diary")}><BookOpen size={21}/><span>Diary</span></button>
        <button className={!["home","care","diary"].includes(view)?"is-active":""} onClick={() => setMenuOpen(true)}><Menu size={21}/><span>More</span></button>
      </nav>}
      {checkInOpen && <CheckInPanel heading={data.profile.checkinHeading} onSave={(scores) => performAction({ type:"save_checkin", scores })} onClose={() => setCheckInOpen(false)}/>} 
      {messageOpen && <PatientMessagePanel data={data} onAction={performAction} onClose={() => setMessageOpen(false)}/>} 
    </div>
  );
}
