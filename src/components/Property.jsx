import { useState, useMemo, useEffect } from "react";

/* ---------------- STATIC DATA ---------------- */
const PLOTS = [
  { id: "C-01", size: 200, rate: 28000, status: "sold" },
  { id: "C-02", size: 200, rate: 28000, status: "sold" },
  { id: "C-03", size: 150, rate: 29500, status: "available" },
  { id: "C-04", size: 150, rate: 29500, status: "available" },
  { id: "C-05", size: 250, rate: 27500, status: "sold" },
  { id: "C-06", size: 200, rate: 28000, status: "resale" },
  { id: "C-07", size: 180, rate: 28500, status: "available" },
  { id: "C-08", size: 200, rate: 28000, status: "sold" },
  { id: "C-09", size: 200, rate: 28000, status: "available" },
  { id: "C-10", size: 220, rate: 27800, status: "sold" },
  { id: "C-11", size: 150, rate: 29500, status: "resale" },
  { id: "C-12", size: 200, rate: 28000, status: "available" },
];

const PROJECTS = [
  { name: "Greenfield Meadows", loc: "Sector 112, Greenfield Road", total: 64, sold: 35, status: "Ongoing" },
  { name: "Riverside Enclave", loc: "NH-34 Bypass, Riverside", total: 120, sold: 120, status: "Completed" },
  { name: "Sunrise Acres", loc: "Village Chandpur", total: 80, sold: 76, status: "Completed" },
];

const RESALE_PLOTS = [
  { id: "R-14", project: "Riverside Enclave", size: 200, original: 4200000, resale: 5100000 },
  { id: "R-27", project: "Sunrise Acres", size: 150, original: 2850000, resale: 3400000 },
  { id: "C-06", project: "Greenfield Meadows", size: 200, original: 5600000, resale: 6050000 },
];

const DOCUMENTS_BY_PLOT = {
  "C-04": { name: "Ramesh Kumar", phone: "98xxxxxx21", docs: ["Registry Deed", "GPA (General Power of Attorney)", "Sale Agreement", "Allotment Letter"] },
  "C-08": { name: "Sunita Devi", phone: "98xxxxxx45", docs: ["Registry Deed", "Sale Agreement", "Allotment Letter"] },
};

const REMINDERS = [
  { title: "Plot C-04 — Installment 3 of 5", date: "05 Aug 2026", amount: 450000, state: "upcoming" },
  { title: "Plot C-08 — Final Installment", date: "18 Jul 2026", amount: 280000, state: "overdue" },
  { title: "Plot C-11 — Installment 2 of 4", date: "22 Aug 2026", amount: 600000, state: "upcoming" },
];

const HERO_CELLS = Array.from({ length: 64 }, (_, i) => {
  const n = i + 1;
  if (n % 9 === 0) return { cls: "resale", label: "R" };
  if (n % 2 === 0) return { cls: "sold", label: "●" };
  return { cls: "available", label: "+" };
});

/* ---------------- HELPERS ---------------- */
const inr = (n) => "₹ " + Math.round(n || 0).toLocaleString("en-IN");

/* ---------------- STYLES ---------------- */
const GlobalStyles = () => (
  <style>{`
    .pw-root{
      --bg:#F6F4EE; --surface:#FFFFFF; --ink:#1F2A22; --ink-soft:#5B6459;
      --primary:#1F4D3A; --primary-light:#2E6B4F; --primary-dark:#153325;
      --accent:#B8862E; --accent-soft:#EFE3C6; --line:#DDD6C4;
      --danger:#AE4430; --danger-soft:#F5E1DA; --success-soft:#DFEAE2;
      --shadow:0 1px 2px rgba(31,42,34,0.06), 0 8px 24px -12px rgba(31,42,34,0.18);
      background:var(--bg); color:var(--ink); font-family:'Inter',sans-serif; line-height:1.55;
    }
    .pw-root *{box-sizing:border-box;}
    .pw-root h1,.pw-root h2,.pw-root h3,.pw-root h4{font-family:'Fraunces',serif; color:var(--primary-dark); font-weight:600; letter-spacing:-0.01em; margin:0;}
    .pw-root .mono{font-family:'IBM Plex Mono',monospace;}
    .pw-root a{color:inherit;}
    .pw-wrap{max-width:1180px; margin:0 auto; padding:0 28px;}
    .pw-root img{max-width:100%; display:block;}
    .pw-root button{font-family:inherit; cursor:pointer;}
    .pw-eyebrow{font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:0.14em; text-transform:uppercase; color:var(--accent); font-weight:600; display:flex; align-items:center; gap:8px;}
    .pw-eyebrow::before{content:""; width:16px; height:1px; background:var(--accent);}

    .pw-nav{position:sticky; top:0; z-index:100; background:rgba(246,244,238,0.92); backdrop-filter:blur(8px); border-bottom:1px solid var(--line);}
    .pw-nav-inner{max-width:1180px; margin:0 auto; padding:16px 28px; display:flex; align-items:center; justify-content:space-between;}
    .pw-brand{display:flex; align-items:center; gap:10px;}
    .pw-brand-mark{width:34px; height:34px; border-radius:3px; background:var(--primary); display:flex; align-items:center; justify-content:center;}
    .pw-brand-name{font-family:'Fraunces',serif; font-weight:600; font-size:18px; color:var(--primary-dark);}
    .pw-brand-tag{font-size:10.5px; color:var(--ink-soft); font-family:'IBM Plex Mono',monospace; letter-spacing:0.06em;}
    .pw-nav-links{display:flex; gap:30px; font-size:14px; font-weight:500;}
    .pw-nav-links a{text-decoration:none; color:var(--ink);}
    .pw-nav-links a:hover{color:var(--primary);}
    .pw-nav-cta{background:var(--primary); color:#fff; border:none; padding:10px 20px; border-radius:3px; font-size:13.5px; font-weight:600; text-decoration:none;}
    .pw-nav-cta:hover{background:var(--primary-dark);}

    .pw-hero{padding:72px 0 56px; border-bottom:1px solid var(--line);}
    .pw-hero-grid{display:grid; grid-template-columns:1.05fr 0.95fr; gap:56px; align-items:center;}
    .pw-hero h1{font-size:44px; line-height:1.08; margin:16px 0 20px;}
    .pw-hero h1 em{font-style:normal; color:var(--primary);}
    .pw-hero p.lead{font-size:16.5px; color:var(--ink-soft); max-width:480px; margin-bottom:28px;}
    .pw-hero-actions{display:flex; gap:14px; margin-bottom:36px; flex-wrap:wrap;}
    .pw-btn-primary{background:var(--primary); color:#fff; padding:13px 24px; border:none; border-radius:3px; font-weight:600; font-size:14.5px; text-decoration:none; display:inline-block;}
    .pw-btn-primary:hover{background:var(--primary-dark);}
    .pw-btn-secondary{background:transparent; color:var(--primary-dark); padding:13px 24px; border:1px solid var(--line); border-radius:3px; font-weight:600; font-size:14.5px; text-decoration:none; display:inline-block;}
    .pw-btn-secondary:hover{border-color:var(--primary);}
    .pw-trust-row{display:flex; gap:28px; flex-wrap:wrap;}
    .pw-trust-item .num{font-family:'Fraunces',serif; font-size:26px; font-weight:600; color:var(--primary-dark); display:block;}
    .pw-trust-item .label{font-size:12px; color:var(--ink-soft); font-family:'IBM Plex Mono',monospace; letter-spacing:0.03em;}
    .pw-trust-badges{display:flex; gap:10px; margin-top:26px; flex-wrap:wrap;}
    .pw-badge{display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; background:var(--success-soft); color:var(--primary-dark); padding:6px 11px; border-radius:20px;}

    .pw-plotmap-card{background:var(--surface); border:1px solid var(--line); border-radius:6px; padding:20px; box-shadow:var(--shadow);}
    .pw-plotmap-head{display:flex; justify-content:space-between; align-items:baseline; margin-bottom:14px;}
    .pw-plotmap-head h4{font-size:14px;}
    .pw-plotmap-head span{font-size:11px; color:var(--ink-soft); font-family:'IBM Plex Mono',monospace;}
    .pw-plotmap-grid{display:grid; grid-template-columns:repeat(8,1fr); gap:5px;}
    .pw-plotcell{aspect-ratio:1; border-radius:2px; font-family:'IBM Plex Mono',monospace; font-size:9px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:600; opacity:0.95;}
    .pw-plotcell.sold{background:var(--primary);}
    .pw-plotcell.resale{background:var(--accent);}
    .pw-plotcell.available{background:var(--surface); border:1.5px dashed var(--primary-light); color:var(--primary-light);}
    .pw-plotmap-legend{display:flex; gap:16px; margin-top:14px; flex-wrap:wrap;}
    .pw-legend-item{display:flex; align-items:center; gap:6px; font-size:11.5px; color:var(--ink-soft);}
    .pw-legend-dot{width:9px; height:9px; border-radius:2px; display:inline-block;}

    .pw-section{padding:80px 0;}
    .pw-section.alt{background:var(--surface); border-top:1px solid var(--line); border-bottom:1px solid var(--line);}
    .pw-section-head{max-width:620px; margin-bottom:44px;}
    .pw-section-head h2{font-size:32px; margin-top:12px;}
    .pw-section-head p{color:var(--ink-soft); margin-top:12px; font-size:15px;}

    .pw-filter-row{display:flex; gap:10px; margin-bottom:24px; flex-wrap:wrap; align-items:center; justify-content:space-between;}
    .pw-filter-tabs{display:flex; gap:8px; flex-wrap:wrap;}
    .pw-filter-tab{padding:8px 16px; border-radius:20px; border:1px solid var(--line); background:transparent; font-size:13px; font-weight:600; color:var(--ink-soft);}
    .pw-filter-tab.active{background:var(--primary); border-color:var(--primary); color:#fff;}
    .pw-search-box{display:flex; align-items:center; gap:8px; border:1px solid var(--line); border-radius:20px; padding:8px 14px; background:var(--bg); min-width:220px;}
    .pw-search-box input{border:none; background:transparent; outline:none; font-size:13px; width:100%; font-family:inherit;}

    .pw-table-wrap{border:1px solid var(--line); border-radius:6px; overflow:hidden; background:var(--surface);}
    .pw-root table{width:100%; border-collapse:collapse;}
    .pw-root thead tr{background:var(--bg); border-bottom:1px solid var(--line);}
    .pw-root th{text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:var(--ink-soft); font-weight:600; padding:14px 16px; font-family:'IBM Plex Mono',monospace;}
    .pw-root td{padding:15px 16px; font-size:14px; border-bottom:1px solid var(--line);}
    .pw-root tbody tr:last-child td{border-bottom:none;}
    .pw-root tbody tr:hover{background:var(--bg);}
    .pw-status-pill{padding:4px 10px; border-radius:20px; font-size:11.5px; font-weight:600; display:inline-block;}
    .pw-status-pill.available{background:var(--success-soft); color:var(--primary-dark);}
    .pw-status-pill.sold{background:#EEECE4; color:var(--ink-soft);}
    .pw-status-pill.resale{background:var(--accent-soft); color:#7A5A1E;}
    .pw-rate-num{font-family:'IBM Plex Mono',monospace; font-weight:500;}
    .pw-use-btn{background:transparent; border:1px solid var(--line); border-radius:3px; padding:6px 12px; font-size:12px; font-weight:600; color:var(--primary-dark);}
    .pw-use-btn:hover{border-color:var(--primary); color:var(--primary);}
    .pw-empty-row td{text-align:center; color:var(--ink-soft); padding:36px 16px; font-size:13.5px;}

    .pw-calc-grid{display:grid; grid-template-columns:1fr 1fr; gap:24px;}
    .pw-calc-card{background:var(--surface); border:1px solid var(--line); border-radius:6px; padding:28px; box-shadow:var(--shadow);}
    .pw-calc-card h3{font-size:18px; margin-bottom:6px;}
    .pw-calc-card .sub{font-size:13px; color:var(--ink-soft); margin-bottom:22px;}
    .pw-field{margin-bottom:16px;}
    .pw-field label{display:block; font-size:12.5px; font-weight:600; color:var(--ink-soft); margin-bottom:6px;}
    .pw-field-row{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
    .pw-root input[type=number], .pw-root input[type=text], .pw-root select{
      width:100%; padding:11px 12px; border:1px solid var(--line); border-radius:3px;
      font-family:'IBM Plex Mono',monospace; font-size:14px; background:var(--bg); color:var(--ink); outline:none;
    }
    .pw-root input:focus, .pw-root select:focus{border-color:var(--primary);}
    .pw-result-box{margin-top:20px; background:var(--bg); border:1px solid var(--line); border-radius:4px; padding:18px;}
    .pw-result-line{display:flex; justify-content:space-between; align-items:center; padding:7px 0; font-size:14px;}
    .pw-result-line.total{border-top:1px dashed var(--line); margin-top:6px; padding-top:14px; font-weight:700; font-size:16px; color:var(--primary-dark);}
    .pw-result-line .val{font-family:'IBM Plex Mono',monospace; font-weight:600;}
    .pw-progress-track{height:8px; background:var(--line); border-radius:20px; overflow:hidden; margin:14px 0;}
    .pw-progress-fill{height:100%; background:var(--primary); border-radius:20px; transition:width 0.4s ease;}
    .pw-progress-labels{display:flex; justify-content:space-between; font-size:11.5px; color:var(--ink-soft); font-family:'IBM Plex Mono',monospace;}

    .pw-reminder-list{display:flex; flex-direction:column; gap:12px; margin-top:20px;}
    .pw-reminder-item{display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border:1px solid var(--line); border-radius:4px; background:var(--surface);}
    .pw-reminder-item.overdue{border-color:#E5C4B8; background:var(--danger-soft);}
    .pw-reminder-left{display:flex; align-items:center; gap:12px;}
    .pw-reminder-dot{width:9px; height:9px; border-radius:50%; display:inline-block;}
    .pw-reminder-dot.overdue{background:var(--danger);}
    .pw-reminder-dot.upcoming{background:var(--accent);}
    .pw-reminder-title{font-size:13.5px; font-weight:600;}
    .pw-reminder-date{font-size:12px; color:var(--ink-soft); font-family:'IBM Plex Mono',monospace;}
    .pw-reminder-amt{font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:14px;}
    .pw-tag-overdue{color:var(--danger); font-size:11px; font-weight:700; font-family:'IBM Plex Mono',monospace;}
    .pw-tag-upcoming{color:var(--accent); font-size:11px; font-weight:700; font-family:'IBM Plex Mono',monospace;}

    .pw-doc-lookup{display:flex; gap:12px; margin-bottom:28px; flex-wrap:wrap; align-items:flex-end;}
    .pw-doc-lookup .pw-field{margin-bottom:0; min-width:220px; flex:1;}
    .pw-doc-lookup button{background:var(--primary); color:#fff; border:none; padding:12px 22px; border-radius:3px; font-weight:600; font-size:13.5px; height:44px;}
    .pw-doc-grid{display:grid; grid-template-columns:repeat(4,1fr); gap:16px;}
    .pw-doc-card{border:1px solid var(--line); border-radius:6px; padding:20px; background:var(--surface); display:flex; flex-direction:column; gap:10px;}
    .pw-doc-icon{width:36px; height:36px; border-radius:4px; background:var(--success-soft); display:flex; align-items:center; justify-content:center;}
    .pw-doc-icon svg{width:18px; height:18px; color:var(--primary);}
    .pw-doc-card h4{font-size:14px;}
    .pw-doc-card p{font-size:12px; color:var(--ink-soft); margin:0;}
    .pw-doc-actions{display:flex; gap:8px; margin-top:auto;}
    .pw-doc-actions button{flex:1; font-size:12px; font-weight:600; padding:8px; border-radius:3px; border:1px solid var(--line); background:transparent;}
    .pw-doc-actions button.primary{background:var(--primary); color:#fff; border-color:var(--primary);}
    .pw-doc-verified{display:flex; align-items:center; gap:5px; font-size:11px; color:var(--primary); font-weight:600;}
    .pw-doc-empty{border:1px dashed var(--line); border-radius:6px; padding:48px; text-align:center; color:var(--ink-soft); font-size:13.5px;}

    .pw-project-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:20px;}
    .pw-project-card{border:1px solid var(--line); border-radius:6px; overflow:hidden; background:var(--surface);}
    .pw-project-media{height:150px; background:linear-gradient(135deg, var(--primary-light), var(--primary-dark)); position:relative;}
    .pw-project-media .pstatus{position:absolute; top:12px; left:12px; background:rgba(255,255,255,0.92); color:var(--primary-dark); font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px;}
    .pw-project-body{padding:18px;}
    .pw-project-body h4{font-size:15.5px; margin-bottom:4px;}
    .pw-project-loc{font-size:12px; color:var(--ink-soft); margin-bottom:14px;}
    .pw-project-stats{display:flex; justify-content:space-between; font-size:12px; border-top:1px solid var(--line); padding-top:12px;}
    .pw-project-stats div{text-align:center;}
    .pw-project-stats .n{font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--primary-dark); font-size:15px; display:block;}

    .pw-resale-note{font-size:12px; color:var(--ink-soft); background:var(--accent-soft); padding:10px 14px; border-radius:4px; margin-bottom:16px; display:inline-block;}
    .pw-gain{color:var(--primary); font-weight:600;}

    .pw-contact-band{background:var(--primary-dark); color:#F1EFE6; padding:64px 0;}
    .pw-contact-inner{display:grid; grid-template-columns:1.2fr 1fr; gap:48px; align-items:center;}
    .pw-contact-inner h2{color:#fff; font-size:30px;}
    .pw-contact-inner p{color:#C9D2CB; margin-top:12px; font-size:14.5px; max-width:420px;}
    .pw-contact-form{background:#fff; border-radius:6px; padding:26px; box-shadow:var(--shadow);}
    .pw-contact-form .pw-field label{color:var(--ink-soft);}
    .pw-contact-form button{width:100%; background:var(--accent); color:#fff; border:none; padding:13px; border-radius:3px; font-weight:700; font-size:14px; margin-top:6px;}
    .pw-footer{background:var(--primary-dark); border-top:1px solid rgba(255,255,255,0.1); padding:28px 0; color:#9FAFA4; font-size:12.5px;}
    .pw-footer-inner{display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px;}

    @media(max-width:900px){
      .pw-nav-links, .pw-nav-cta{display:none;}
      .pw-hero-grid{grid-template-columns:1fr;}
      .pw-calc-grid, .pw-project-grid, .pw-contact-inner{grid-template-columns:1fr;}
      .pw-doc-grid{grid-template-columns:repeat(2,1fr);}
      .pw-hero h1{font-size:32px;}
      .pw-table-wrap{overflow-x:auto;}
      .pw-root table{min-width:640px;}
    }
  `}</style>
);

/* ---------------- ICONS ---------------- */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M20 6L9 17l-5-5"/></svg>
);
const DocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B6459" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
);

/* ---------------- MAIN COMPONENT ---------------- */
export default function PropertyWebsite() {
  // Inventory
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Rate calculator
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [rateSize, setRateSize] = useState(200);
  const [ratePerYd, setRatePerYd] = useState(28000);
  const [rateMisc, setRateMisc] = useState(150000);
  const [rateGst, setRateGst] = useState(6);

  // Payment calculator
  const [payTotal, setPayTotal] = useState(5750000);
  const [payTotalAuto, setPayTotalAuto] = useState(true);
  const [payPaid, setPayPaid] = useState(2500000);
  const [payInstallments, setPayInstallments] = useState(4);

  // Documents
  const [docQuery, setDocQuery] = useState("");
  const [docSubmitted, setDocSubmitted] = useState("");

  const availablePlots = useMemo(() => PLOTS.filter((p) => p.status === "available"), []);

  const filteredPlots = useMemo(() => {
    let rows = PLOTS.filter((p) => filter === "all" || p.status === filter);
    if (search.trim()) rows = rows.filter((p) => p.id.toLowerCase().includes(search.trim().toLowerCase()));
    return rows;
  }, [filter, search]);

  const counts = useMemo(() => ({
    all: PLOTS.length,
    available: PLOTS.filter((p) => p.status === "available").length,
    sold: PLOTS.filter((p) => p.status === "sold").length,
    resale: PLOTS.filter((p) => p.status === "resale").length,
  }), []);

  // Rate calc derived values
  const rateBase = (parseFloat(rateSize) || 0) * (parseFloat(ratePerYd) || 0);
  const rateGstAmt = rateBase * ((parseFloat(rateGst) || 0) / 100);
  const rateTotal = rateBase + rateGstAmt + (parseFloat(rateMisc) || 0);

  // Keep payment total synced to rate calculator total unless user typed their own value
  useEffect(() => {
    if (payTotalAuto) setPayTotal(Math.round(rateTotal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateTotal, payTotalAuto]);

  const remaining = Math.max((parseFloat(payTotal) || 0) - (parseFloat(payPaid) || 0), 0);
  const pctPaid = payTotal > 0 ? Math.min(((parseFloat(payPaid) || 0) / payTotal) * 100, 100) : 0;
  const perInstallment = payInstallments > 0 ? remaining / payInstallments : remaining;

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const useInCalculator = (id) => {
    const p = PLOTS.find((pl) => pl.id === id);
    if (p) {
      setSelectedPlotId(id);
      setRateSize(p.size);
      setRatePerYd(p.rate);
    }
    scrollTo("calculator");
  };

  const viewDocsFor = (id) => {
    setDocQuery(id);
    setDocSubmitted(id);
    scrollTo("documents");
  };

  const submitDocLookup = () => setDocSubmitted(docQuery.trim());

  const docRecord = DOCUMENTS_BY_PLOT[docSubmitted.toUpperCase()];

  return (
    <div className="pw-root">
      <GlobalStyles />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <header className="pw-nav">
        <div className="pw-nav-inner">
          <div className="pw-brand">
            <div className="pw-brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="18" height="18"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>
            </div>
            <div>
              <div className="pw-brand-name">Nirman Bhoomi Estates</div>
              <div className="pw-brand-tag">RERA REG. NO. UPRERAPRJ00000 &middot; EST. 2011</div>
            </div>
          </div>
          <nav className="pw-nav-links">
            <a href="#inventory">Plots</a>
            <a href="#calculator">Calculator</a>
            <a href="#payments">Payments</a>
            <a href="#documents">Documents</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </nav>
          <a href="#contact" className="pw-nav-cta">Talk to Us</a>
        </div>
      </header>

      {/* HERO */}
      <section className="pw-hero">
        <div className="pw-wrap pw-hero-grid">
          <div>
            <div className="pw-eyebrow">Trusted land partner since 2011</div>
            <h1>Plots you can invest in <em>with your eyes open.</em></h1>
            <p className="lead">Clear rates, transparent payment tracking and every document — registry, GPA, agreement — available to you the moment you ask for it. No surprises, no chasing the dealer.</p>
            <div className="pw-hero-actions">
              <a href="#inventory" className="pw-btn-primary">View Available Plots</a>
              <a href="#calculator" className="pw-btn-secondary">Calculate My Plot Cost</a>
            </div>
            <div className="pw-trust-row">
              <div className="pw-trust-item"><span className="num">1,240+</span><span className="label">PLOTS DELIVERED</span></div>
              <div className="pw-trust-item"><span className="num">3,800+</span><span className="label">FAMILIES SERVED</span></div>
              <div className="pw-trust-item"><span className="num">14</span><span className="label">PROJECTS COMPLETED</span></div>
              <div className="pw-trust-item"><span className="num">13 yrs</span><span className="label">IN BUSINESS</span></div>
            </div>
            <div className="pw-trust-badges">
              <span className="pw-badge"><CheckIcon /> RERA Registered</span>
              <span className="pw-badge"><CheckIcon /> Clear Title Verified</span>
              <span className="pw-badge"><CheckIcon /> Registry on Your Name</span>
            </div>
          </div>

          <div className="pw-plotmap-card">
            <div className="pw-plotmap-head">
              <h4>Greenfield Meadows &mdash; Live Layout</h4>
              <span>Block C &middot; 64 plots</span>
            </div>
            <div className="pw-plotmap-grid">
              {HERO_CELLS.map((c, i) => (
                <div key={i} className={`pw-plotcell ${c.cls}`} title={`Plot ${i + 1}`}>{c.label}</div>
              ))}
            </div>
            <div className="pw-plotmap-legend">
              <div className="pw-legend-item"><span className="pw-legend-dot" style={{ background: "var(--primary)" }}></span>Sold</div>
              <div className="pw-legend-item"><span className="pw-legend-dot" style={{ background: "var(--accent)" }}></span>Resale</div>
              <div className="pw-legend-item"><span className="pw-legend-dot" style={{ background: "var(--surface)", border: "1.5px dashed var(--primary-light)" }}></span>Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* INVENTORY */}
      <section className="pw-section" id="inventory">
        <div className="pw-wrap">
          <div className="pw-section-head">
            <div className="pw-eyebrow">Live inventory</div>
            <h2>How many plots are left, sold &amp; on resale</h2>
            <p>Real-time count across our active project. Filter to see exactly what's open for booking today.</p>
          </div>

          <div className="pw-filter-row">
            <div className="pw-filter-tabs">
              {["all", "available", "sold", "resale"].map((f) => (
                <button
                  key={f}
                  className={`pw-filter-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? `All Plots (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
                </button>
              ))}
            </div>
            <div className="pw-search-box">
              <SearchIcon />
              <input type="text" placeholder="Search plot no. e.g. C-14" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="pw-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plot No.</th>
                  <th>Size (sq.yd)</th>
                  <th>Rate / sq.yd</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredPlots.length === 0 ? (
                  <tr className="pw-empty-row"><td colSpan={6}>No plots match this filter yet — try clearing your search.</td></tr>
                ) : (
                  filteredPlots.map((p) => (
                    <tr key={p.id}>
                      <td className="mono">{p.id}</td>
                      <td className="mono">{p.size} yd²</td>
                      <td className="pw-rate-num">{inr(p.rate)}</td>
                      <td className="pw-rate-num">{inr(p.size * p.rate)}</td>
                      <td><span className={`pw-status-pill ${p.status}`}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span></td>
                      <td>
                        {p.status === "available" ? (
                          <button className="pw-use-btn" onClick={() => useInCalculator(p.id)}>Use in Calculator</button>
                        ) : (
                          <button className="pw-use-btn" onClick={() => viewDocsFor(p.id)}>View Docs</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CALCULATORS */}
      <section className="pw-section alt" id="calculator">
        <div className="pw-wrap">
          <div className="pw-section-head">
            <div className="pw-eyebrow">Know your numbers</div>
            <h2>Rate &amp; payment calculators</h2>
            <p>Work out the exact cost of a plot, and see at a glance how much you've paid the dealer and how much is still left.</p>
          </div>

          <div className="pw-calc-grid">
            {/* RATE CALCULATOR */}
            <div className="pw-calc-card">
              <h3>Plot Rate Calculator</h3>
              <p className="sub">Enter the size and rate to get the total plot price instantly.</p>

              <div className="pw-field">
                <label>Choose a plot (optional)</label>
                <select value={selectedPlotId} onChange={(e) => {
                  const id = e.target.value;
                  setSelectedPlotId(id);
                  const p = availablePlots.find((pl) => pl.id === id);
                  if (p) { setRateSize(p.size); setRatePerYd(p.rate); }
                }}>
                  <option value="">— Enter manually —</option>
                  {availablePlots.map((p) => (
                    <option key={p.id} value={p.id}>{p.id} — {p.size} sq.yd @ ₹{p.rate}/sq.yd</option>
                  ))}
                </select>
              </div>
              <div className="pw-field-row">
                <div className="pw-field">
                  <label>Plot size (sq. yards)</label>
                  <input type="number" value={rateSize} onChange={(e) => setRateSize(e.target.value)} />
                </div>
                <div className="pw-field">
                  <label>Rate (₹ per sq. yard)</label>
                  <input type="number" value={ratePerYd} onChange={(e) => setRatePerYd(e.target.value)} />
                </div>
              </div>
              <div className="pw-field-row">
                <div className="pw-field">
                  <label>Registry &amp; misc. charges (₹)</label>
                  <input type="number" value={rateMisc} onChange={(e) => setRateMisc(e.target.value)} />
                </div>
                <div className="pw-field">
                  <label>GST / stamp duty (%)</label>
                  <input type="number" value={rateGst} onChange={(e) => setRateGst(e.target.value)} />
                </div>
              </div>

              <div className="pw-result-box">
                <div className="pw-result-line"><span>Base plot value</span><span className="val mono">{inr(rateBase)}</span></div>
                <div className="pw-result-line"><span>Stamp duty / GST</span><span className="val mono">{inr(rateGstAmt)}</span></div>
                <div className="pw-result-line"><span>Registry &amp; misc. charges</span><span className="val mono">{inr(rateMisc)}</span></div>
                <div className="pw-result-line total"><span>Total payable</span><span className="val mono">{inr(rateTotal)}</span></div>
              </div>
            </div>

            {/* PAYMENT CALCULATOR */}
            <div className="pw-calc-card" id="payments">
              <h3>Payment Progress Calculator</h3>
              <p className="sub">See how much you've already given the dealer and how much is left.</p>

              <div className="pw-field">
                <label>Total plot price (₹)</label>
                <input
                  type="number"
                  value={payTotal}
                  onChange={(e) => { setPayTotal(e.target.value); setPayTotalAuto(false); }}
                />
              </div>
              <div className="pw-field-row">
                <div className="pw-field">
                  <label>Amount already paid (₹)</label>
                  <input type="number" value={payPaid} onChange={(e) => setPayPaid(e.target.value)} />
                </div>
                <div className="pw-field">
                  <label>Remaining installments</label>
                  <input type="number" value={payInstallments} onChange={(e) => setPayInstallments(e.target.value)} />
                </div>
              </div>

              <div className="pw-result-box">
                <div className="pw-progress-track"><div className="pw-progress-fill" style={{ width: `${pctPaid}%` }}></div></div>
                <div className="pw-progress-labels">
                  <span>{pctPaid.toFixed(1)}% paid</span>
                  <span>{(100 - pctPaid).toFixed(1)}% left</span>
                </div>
                <div className="pw-result-line" style={{ marginTop: 10 }}><span>Amount paid</span><span className="val mono">{inr(payPaid)}</span></div>
                <div className="pw-result-line"><span>Amount remaining</span><span className="val mono">{inr(remaining)}</span></div>
                <div className="pw-result-line total"><span>Next installment (approx.)</span><span className="val mono">{inr(perInstallment)}</span></div>
              </div>
            </div>
          </div>

          {/* REMINDERS */}
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>Upcoming payment reminders</h3>
            <p className="sub" style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 0 }}>Sample reminders for demonstration — connect this to your client records to make it live.</p>
            <div className="pw-reminder-list">
              {REMINDERS.map((r, i) => (
                <div key={i} className={`pw-reminder-item ${r.state}`}>
                  <div className="pw-reminder-left">
                    <span className={`pw-reminder-dot ${r.state}`}></span>
                    <div>
                      <div className="pw-reminder-title">{r.title}</div>
                      <div className="pw-reminder-date">
                        Due {r.date} &middot; <span className={r.state === "overdue" ? "pw-tag-overdue" : "pw-tag-upcoming"}>{r.state === "overdue" ? "OVERDUE" : "UPCOMING"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pw-reminder-amt">{inr(r.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTS */}
      <section className="pw-section" id="documents">
        <div className="pw-wrap">
          <div className="pw-section-head">
            <div className="pw-eyebrow">Your paperwork, on demand</div>
            <h2>View your plot documents anytime</h2>
            <p>Enter your registered mobile number or plot number to pull up your registry, GPA, agreement and allotment letter.</p>
          </div>

          <div className="pw-doc-lookup">
            <div className="pw-field">
              <label>Plot number or mobile number</label>
              <input
                type="text"
                placeholder="e.g. C-04 or 98xxxxxxxx"
                value={docQuery}
                onChange={(e) => setDocQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitDocLookup()}
              />
            </div>
            <button onClick={submitDocLookup}>View Documents</button>
          </div>

          {docSubmitted === "" ? null : docRecord ? (
            <>
              <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <strong>{docRecord.name}</strong> &middot; Plot {docSubmitted.toUpperCase()} &middot; <span style={{ color: "var(--ink-soft)" }}>{docRecord.phone}</span>
                </div>
                <span className="pw-doc-verified"><CheckIcon /> Ownership Verified</span>
              </div>
              <div className="pw-doc-grid">
                {docRecord.docs.map((d, i) => (
                  <div className="pw-doc-card" key={i}>
                    <div className="pw-doc-icon"><DocIcon /></div>
                    <h4>{d}</h4>
                    <p>Ready &middot; issued and on file</p>
                    <div className="pw-doc-actions">
                      <button onClick={() => alert("Preview coming soon — connect your document storage to enable this.")}>View</button>
                      <button className="primary" onClick={() => alert("Download coming soon — connect your document storage to enable this.")}>Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="pw-doc-empty">
              No documents found for "<strong>{docSubmitted}</strong>". Try plot <strong>C-04</strong> or <strong>C-08</strong> for a demo, or contact us to link your record.
            </div>
          )}
        </div>
      </section>

      {/* PROJECTS */}
      <section className="pw-section alt" id="projects">
        <div className="pw-wrap">
          <div className="pw-section-head">
            <div className="pw-eyebrow">Track record</div>
            <h2>Our projects, old and current</h2>
            <p>A look at where we've delivered before, and what's still available for resale.</p>
          </div>

          <div className="pw-project-grid">
            {PROJECTS.map((p, i) => (
              <div className="pw-project-card" key={i}>
                <div className="pw-project-media"><span className="pstatus">{p.status}</span></div>
                <div className="pw-project-body">
                  <h4>{p.name}</h4>
                  <div className="pw-project-loc">{p.loc}</div>
                  <div className="pw-project-stats">
                    <div><span className="n">{p.total}</span>Total Plots</div>
                    <div><span className="n">{p.sold}</span>Sold</div>
                    <div><span className="n">{p.total - p.sold}</span>Left</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>Resale plots currently listed</h3>
            <span className="pw-resale-note">Resale plots are owner-listed, verified by us before being shown here.</span>
            <div className="pw-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Plot No.</th>
                    <th>Project</th>
                    <th>Size</th>
                    <th>Original Price</th>
                    <th>Resale Price</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {RESALE_PLOTS.map((r, i) => {
                    const change = r.resale - r.original;
                    const pct = ((change / r.original) * 100).toFixed(1);
                    return (
                      <tr key={i}>
                        <td className="mono">{r.id}</td>
                        <td>{r.project}</td>
                        <td className="mono">{r.size} yd²</td>
                        <td className="pw-rate-num">{inr(r.original)}</td>
                        <td className="pw-rate-num">{inr(r.resale)}</td>
                        <td className="pw-gain mono">+{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="pw-contact-band" id="contact">
        <div className="pw-wrap pw-contact-inner">
          <div>
            <div className="pw-eyebrow" style={{ color: "var(--accent)" }}>Get in touch</div>
            <h2>Have a question about a plot or your payment?</h2>
            <p>Our team replies within a few hours. For urgent document requests, call us directly — we keep every client's paperwork ready to hand over.</p>
            <div style={{ marginTop: 22, display: "flex", gap: 22, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: "#9FAFA4", fontFamily: "'IBM Plex Mono',monospace" }}>CALL</div>
                <div style={{ fontWeight: 600 }}>+91 98xxx xxxxx</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9FAFA4", fontFamily: "'IBM Plex Mono',monospace" }}>OFFICE</div>
                <div style={{ fontWeight: 600 }}>Sector 12, Greenfield Road</div>
              </div>
            </div>
          </div>
          <form className="pw-contact-form" onSubmit={(e) => { e.preventDefault(); alert("Thanks! We will reach out shortly."); }}>
            <div className="pw-field"><label>Full name</label><input type="text" required /></div>
            <div className="pw-field"><label>Mobile number</label><input type="text" required /></div>
            <div className="pw-field">
              <label>I'm interested in</label>
              <select>
                <option>Buying a new plot</option>
                <option>Resale plot</option>
                <option>Payment / documents query</option>
              </select>
            </div>
            <button type="submit">Request a Callback</button>
          </form>
        </div>
      </section>

      <footer className="pw-footer">
        <div className="pw-wrap pw-footer-inner">
          <span>&copy; 2026 Nirman Bhoomi Estates. All rights reserved.</span>
          <span>Template site &mdash; replace sample data with your live plot &amp; client records.</span>
        </div>
      </footer>
    </div>
  );
}