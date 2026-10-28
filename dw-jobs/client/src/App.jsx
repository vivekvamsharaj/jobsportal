import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, getPosition } from './api';

const CATS = ['construction', 'farming', 'driver', 'cooking', 'cleaning', 'other'];
const box = { maxWidth: 720, margin: '0 auto', padding: 16, fontFamily: 'system-ui, "Noto Sans Telugu", "Noto Sans Devanagari", sans-serif' };
const card = { border: '1px solid #ccc', borderRadius: 8, padding: 12, margin: '10px 0' };
const inp = { display: 'block', width: '100%', padding: 10, margin: '8px 0', fontSize: 16, boxSizing: 'border-box' };
const btn = { padding: '10px 16px', fontSize: 16, cursor: 'pointer', marginRight: 8, marginTop: 6 };

function OwnerMap({ job, me }) {
  const { t } = useTranslation();
  const [lng, lat] = job.geo.coordinates, d = 0.01;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`;
  const dir = `https://www.google.com/maps/dir/?api=1&origin=${me.lat},${me.lng}&destination=${lat},${lng}`;
  return <div>
    <iframe title="map" src={embed} style={{ width: '100%', height: 250, border: 0, marginTop: 8 }} />
    <a href={dir} target="_blank" rel="noreferrer"><button style={btn}>🧭 {t('directions')}</button></a>
  </div>;
}

function Jobs({ user }) {
  const { t } = useTranslation();
  const [me, setMe] = useState(null), [jobs, setJobs] = useState([]), [radius, setRadius] = useState(10);
  const [cat, setCat] = useState(''), [msg, setMsg] = useState(''), [applied, setApplied] = useState({}), [open, setOpen] = useState({});
  const locate = async () => {
    setMsg(t('locating'));
    try { setMe(await getPosition()); setMsg(''); } catch { setMsg(t('locDenied')); }
  };
  useEffect(() => { locate(); }, []);
  useEffect(() => {
    if (me) api(`/jobs/nearby?lat=${me.lat}&lng=${me.lng}&radius=${radius}&category=${cat}`).then(setJobs).catch(e => setMsg(e.message));
  }, [me, radius, cat]);
  const apply = async id => { try { await api('/applications/' + id, 'POST'); setApplied({ ...applied, [id]: true }); } catch (e) { setMsg(e.message); } };
  return <div>
    <h3>📍 {t('nearby')}</h3>
    <button style={btn} onClick={locate}>{t('useMyLocation')}</button>
    <select style={inp} value={radius} onChange={e => setRadius(e.target.value)}>
      {[5, 10, 20, 30].map(r => <option key={r} value={r}>{t('radius')}: {r} {t('km')}</option>)}</select>
    <select style={inp} value={cat} onChange={e => setCat(e.target.value)}>
      <option value="">{t('category')}: {t('all')}</option>{CATS.map(c => <option key={c} value={c}>{t(c)}</option>)}</select>
    {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
    {me && jobs.length === 0 && <p>{t('noJobs')}</p>}
    {jobs.map(j => <div key={j._id} style={card}>
      <h3>{j.title}</h3><p>{j.description}</p>
      <p>💰 ₹{j.wage} {t('perDay')} · {t(j.category || 'other')}</p>
      <p>📏 {t('distance')}: <b>{j.distanceKm} {t('km')}</b></p>
      <p>🏠 {j.address}</p>
      <p>👤 {t('owner')}: {j.employer?.name} · <a href={`tel:${j.employer?.phone}`}>📞 {j.employer?.phone}</a></p>
      <button style={btn} onClick={() => setOpen({ ...open, [j._id]: !open[j._id] })}>🗺️ {open[j._id] ? t('hideMap') : t('viewMap')}</button>
      {user?.role === 'worker' && (applied[j._id] ? <b>✓ {t('applied')}</b> : <button style={btn} onClick={() => apply(j._id)}>{t('apply')}</button>)}
      {open[j._id] && <OwnerMap job={j} me={me} />}
    </div>)}
  </div>;
}

function Auth({ mode, setUser }) {
  const { t } = useTranslation(), nav = useNavigate();
  const [f, setF] = useState({ role: 'worker' }), [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const go = async () => {
    try {
      const d = await api('/auth/' + mode, 'POST', f);
      localStorage.setItem('token', d.token); localStorage.setItem('user', JSON.stringify(d.user));
      setUser(d.user); nav('/');
    } catch (e) { setErr(e.message); }
  };
  return <div>
    {mode === 'register' && <input style={inp} placeholder={t('name')} onChange={set('name')} />}
    <input style={inp} placeholder={t('phone')} onChange={set('phone')} />
    <input style={inp} type="password" placeholder={t('password')} onChange={set('password')} />
    {mode === 'register' && <>
      <input style={inp} placeholder={t('address')} onChange={set('address')} />
      <select style={inp} onChange={set('role')}><option value="worker">{t('worker')}</option><option value="employer">{t('employer')}</option></select></>}
    {err && <p style={{ color: 'crimson' }}>{err}</p>}
    <button style={btn} onClick={go}>{t(mode)}</button>
  </div>;
}

function PostJob() {
  const { t } = useTranslation(), nav = useNavigate();
  const [f, setF] = useState({ category: 'construction' }), [err, setErr] = useState(''), [ok, setOk] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const locate = async () => { try { const p = await getPosition(); setF({ ...f, ...p }); setOk(true); setErr(''); } catch { setErr(t('locDenied')); } };
  const go = async () => { try { await api('/jobs', 'POST', { ...f, wage: Number(f.wage) }); nav('/my-jobs'); } catch (e) { setErr(e.message); } };
  return <div>
    <input style={inp} placeholder={t('title')} onChange={set('title')} />
    <textarea style={inp} placeholder={t('description')} onChange={set('description')} />
    <select style={inp} onChange={set('category')}>{CATS.map(c => <option key={c} value={c}>{t(c)}</option>)}</select>
    <input style={inp} placeholder={t('address')} onChange={set('address')} />
    <input style={inp} type="number" placeholder={t('wage')} onChange={set('wage')} />
    <button style={btn} onClick={locate}>📍 {t('useMyLocation')}</button> {ok && <b>✓ {t('locationSet')} ({f.lat?.toFixed(4)}, {f.lng?.toFixed(4)})</b>}
    {err && <p style={{ color: 'crimson' }}>{err}</p>}
    <div><button style={btn} onClick={go} disabled={!ok}>{t('submit')}</button></div>
  </div>;
}

function MyApplications() {
  const { t } = useTranslation(); const [a, setA] = useState([]);
  useEffect(() => { api('/applications/mine').then(setA); }, []);
  return <div>{a.map(x => <div key={x._id} style={card}><b>{x.job?.title}</b> — {t('status')}: {t(x.status)}</div>)}</div>;
}

function MyJobs() {
  const { t } = useTranslation(); const [jobs, setJobs] = useState([]), [apps, setApps] = useState({});
  useEffect(() => { api('/jobs/mine').then(setJobs); }, []);
  const show = async id => setApps({ ...apps, [id]: await api(`/jobs/${id}/applicants`) });
  return <div>{jobs.map(j => <div key={j._id} style={card}>
    <b>{j.title}</b> <button onClick={() => show(j._id)}>{t('applicants')}</button>
    {(apps[j._id] || []).map(a => <p key={a._id}>👷 {a.worker.name} · <a href={`tel:${a.worker.phone}`}>📞 {a.worker.phone}</a></p>)}
  </div>)}</div>;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const lang = e => { i18n.changeLanguage(e.target.value); localStorage.setItem('lang', e.target.value); };
  const logout = () => { localStorage.clear(); setUser(null); };
  return <div style={box}>
    <header style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <h2 style={{ flex: 1 }}>🛠️ {t('appName')}</h2>
      <select value={i18n.language} onChange={lang}>
        <option value="te">తెలుగు</option><option value="en">English</option><option value="hi">हिन्दी</option></select>
    </header>
    <nav style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '10px 0' }}>
      <Link to="/">{t('jobs')}</Link>
      {!user && <><Link to="/login">{t('login')}</Link><Link to="/register">{t('register')}</Link></>}
      {user?.role === 'employer' && <><Link to="/post">{t('postJob')}</Link><Link to="/my-jobs">{t('myJobs')}</Link></>}
      {user?.role === 'worker' && <Link to="/my-applications">{t('myApplications')}</Link>}
      {user && <a href="#" onClick={logout}>{t('logout')} ({user.name})</a>}
    </nav>
    <Routes>
      <Route path="/" element={<Jobs user={user} />} />
      <Route path="/login" element={<Auth mode="login" setUser={setUser} />} />
      <Route path="/register" element={<Auth mode="register" setUser={setUser} />} />
      <Route path="/post" element={<PostJob />} />
      <Route path="/my-jobs" element={<MyJobs />} />
      <Route path="/my-applications" element={<MyApplications />} />
    </Routes>
  </div>;
}
