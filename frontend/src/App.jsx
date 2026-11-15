import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, PlusSquare, Video, CalendarDays, FolderOpen, Send,
  BarChart3, Settings, Bell, ChevronDown, Plus, Instagram, Youtube,
  Facebook, Menu, Image as ImageIcon, Type, Scissors, Crop, RotateCw,
  Gauge, Volume2, Download, Play, Pause, Trash2, CheckCircle2,
  FileText, Upload, X, Sparkles, MoreHorizontal, Link2, Eye,
  SlidersHorizontal, CalendarPlus, Film, WandSparkles, CircleHelp,
  Save, Layers
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const STORAGE_KEY = 'orbitpost-v1';

const defaultStore = {
  posts: [],
  channels: [
    { id: 'instagram', name: 'Instagram', handle: 'Not connected', connected: false, color: '#e66a9a' },
    { id: 'youtube', name: 'YouTube', handle: 'Not connected', connected: false, color: '#ef4444' },
    { id: 'facebook', name: 'Facebook', handle: 'Not connected', connected: false, color: '#5794ed' },
    { id: 'tiktok', name: 'TikTok', handle: 'Not connected', connected: false, color: '#9b8cff' }
  ],
  media: []
};

const navItems = [
  ['Overview', LayoutDashboard], ['Create post', PlusSquare],
  ['Video studio', Video], ['Content planner', CalendarDays],
  ['Published posts', Send], ['Drafts', FileText],
  ['Media library', FolderOpen], ['Channels', Link2], ['Analytics', BarChart3]
];

const uid = () => Math.random().toString(36).slice(2, 10);
const formatDate = value => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...defaultStore, ...saved };
  } catch {
    return defaultStore;
  }
}

export default function App() {
  const [store, setStore] = useState(loadStore);
  const [page, setPage] = useState('Overview');
  const [mobile, setMobile] = useState(false);
  const [toast, setToast] = useState('');
  const [apiState, setApiState] = useState('checking');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    let active = true;
    fetch(`${API}/api/health`)
      .then(response => { if (active) setApiState(response.ok ? 'online' : 'offline'); })
      .catch(() => { if (active) setApiState('local'); });
    return () => { active = false; };
  }, []);

  const notify = message => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const addPost = post => {
    setStore(current => ({
      ...current,
      posts: [{ id: uid(), createdAt: new Date().toISOString(), status: 'Draft', ...post }, ...current.posts]
    }));
    notify('Saved to your workspace');
  };

  const updatePost = (id, changes) => {
    setStore(current => ({ ...current, posts: current.posts.map(post => post.id === id ? { ...post, ...changes } : post) }));
  };

  const removePost = id => {
    setStore(current => ({ ...current, posts: current.posts.filter(post => post.id !== id) }));
  };

  const addMedia = file => {
    const item = { id: uid(), name: file.name, type: file.type, url: URL.createObjectURL(file), size: file.size };
    setStore(current => ({ ...current, media: [...current.media, item] }));
  };

  const stats = {
    published: store.posts.filter(post => post.status === 'Published').length,
    scheduled: store.posts.filter(post => post.status === 'Scheduled').length,
    drafts: store.posts.filter(post => post.status === 'Draft').length
  };

  const sidebar = (
    <aside className={`sidebar ${mobile ? 'open' : ''}`}>
      <div className="brand">
        <div className="brandmark">◉</div>
        <div><b>orbitpost</b><small>CREATOR WORKSPACE</small></div>
        <button className="icon-btn mobile-close" onClick={() => setMobile(false)}><X /></button>
      </div>
      <div className="workspace-switch">
        <div className="workspace-avatar">O</div>
        <div><b>My workspace</b><small>Personal space</small></div>
        <ChevronDown size={15} />
      </div>
      <div className="nav-label">WORKSPACE</div>
      {navItems.map(([name, Icon]) => (
        <button key={name} className={`nav-item ${page === name ? 'active' : ''}`} onClick={() => { setPage(name); setMobile(false); }}>
          <Icon size={18} /><span>{name}</span>
          {name === 'Drafts' && stats.drafts > 0 && <em>{stats.drafts}</em>}
        </button>
      ))}
      <div className="sidebar-bottom">
        <div className="plan-card">
          <Sparkles size={17} /><b>Your creative space</b><small>Make something worth sharing.</small>
          <button onClick={() => setPage('Create post')}>Create content <span>↗</span></button>
        </div>
        <button className={`nav-item ${page === 'Settings' ? 'active' : ''}`} onClick={() => setPage('Settings')}><Settings size={18} />Settings</button>
        <div className="user-row"><div className="user-avatar">V</div><div><b>Creator</b><small>Personal account</small></div><MoreHorizontal size={18} /></div>
      </div>
    </aside>
  );

  return (
    <div className="app-shell">
      {sidebar}
      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}
      <main className="main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setMobile(true)}><Menu /></button>
          <div className="crumb">Workspace <span>/</span> <b>{page}</b></div>
          <div className="top-actions">
            <div className="api-pill"><i className={apiState === 'online' ? 'green-dot' : 'grey-dot'} />{apiState === 'online' ? 'API connected' : apiState === 'local' ? 'Local mode' : 'Checking API'}</div>
            <button className="icon-btn"><Bell size={18} /></button>
            <div className="user-avatar small">V</div>
          </div>
        </header>
        <div className="content">
          {page === 'Overview' && <Dashboard store={store} stats={stats} setPage={setPage} />}
          {page === 'Create post' && <Composer store={store} onSave={addPost} notify={notify} />}
          {page === 'Video studio' && <VideoStudio notify={notify} onAddMedia={addMedia} />}
          {page === 'Content planner' && <Planner posts={store.posts} updatePost={updatePost} notify={notify} />}
          {page === 'Published posts' && <PostList posts={store.posts.filter(post => post.status === 'Published')} remove={removePost} title="Published posts" />}
          {page === 'Drafts' && <PostList posts={store.posts.filter(post => post.status === 'Draft')} remove={removePost} title="Drafts" />}
          {page === 'Media library' && <MediaLibrary media={store.media} notify={notify} onUpload={items => setStore(current => ({ ...current, media: [...current.media, ...items] }))} />}
          {page === 'Channels' && <Channels channels={store.channels} notify={notify} />}
          {page === 'Analytics' && <Analytics posts={store.posts} />}
          {page === 'Settings' && <SettingsPage apiState={apiState} />}
        </div>
      </main>
      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );
}

function PageHead({ eyebrow, title, sub, action }) {
  return <div className="page-head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{action}</div>;
}

function Status({ status }) {
  return <span className={`status ${String(status).toLowerCase()}`}>{status}</span>;
}

function Empty({ icon: Icon, title, text, action }) {
  return <div className="empty"><div><Icon size={22} /></div><b>{title}</b><p>{text}</p>{action && <button className="secondary" onClick={action}>Get started</button>}</div>;
}

function Dashboard({ store, stats, setPage }) {
  const recent = store.posts.slice(0, 4);
  return <>
    <PageHead eyebrow="YOUR WORKSPACE" title="Good things are in motion." sub="Create, organize and publish your content from one place." action={<button className="primary" onClick={() => setPage('Create post')}><Plus size={17} /> Create post</button>} />
    <div className="stat-grid">
      {[['Published', stats.published, Send], ['Scheduled', stats.scheduled, CalendarDays], ['Drafts', stats.drafts, FileText], ['Media assets', store.media.length, ImageIcon]].map(([label, count, Icon]) => (
        <div className="stat-card" key={label}><div className="stat-top"><span>{label}</span><Icon size={17} /></div><strong>{String(count).padStart(2, '0')}</strong><small>In this workspace</small></div>
      ))}
    </div>
    <div className="dash-grid">
      <section className="panel recent-panel">
        <div className="panel-head"><div><h3>Recent content</h3><p>Your latest work in one place</p></div><button className="text-btn" onClick={() => setPage('Drafts')}>View all ↗</button></div>
        {recent.length ? recent.map(post => <div className="post-row" key={post.id}><div className="post-thumb">{post.mediaUrl ? <img src={post.mediaUrl} alt="Post media" /> : <ImageIcon />}</div><div className="post-info"><b>{post.title || post.caption || 'Untitled post'}</b><small>{post.platform || 'No channel'} · {formatDate(post.createdAt)}</small></div><Status status={post.status} /></div>) : <Empty icon={Layers} title="Your content will appear here" text="Start with a post or open the video studio." action={() => setPage('Create post')} />}
      </section>
      <section className="panel">
        <div className="panel-head"><div><h3>Quick create</h3><p>Pick up where inspiration takes you</p></div><Sparkles size={18} /></div>
        <div className="quick-grid">
          <button onClick={() => setPage('Create post')}><ImageIcon /><b>Social post</b><small>Image, caption & tags</small></button>
          <button onClick={() => setPage('Video studio')}><Film /><b>Edit a video</b><small>Trim, style & export</small></button>
          <button onClick={() => setPage('Content planner')}><CalendarPlus /><b>Plan content</b><small>Organize your queue</small></button>
          <button onClick={() => setPage('Media library')}><FolderOpen /><b>Media library</b><small>Browse your assets</small></button>
        </div>
      </section>
    </div>
    <section className="panel channel-strip">
      <div className="panel-head"><div><h3>Your channels</h3><p>Connect accounts to prepare publishing</p></div><button className="text-btn" onClick={() => setPage('Channels')}>Manage channels ↗</button></div>
      <div className="channel-mini">{store.channels.map(channel => <div key={channel.id}><span className="channel-icon" style={{ '--channel': channel.color }}>{channel.id === 'instagram' ? <Instagram /> : channel.id === 'youtube' ? <Youtube /> : channel.id === 'facebook' ? <Facebook /> : <Video />}</span><b>{channel.name}</b><small>{channel.connected ? 'Connected' : 'Not connected'}</small></div>)}</div>
    </section>
  </>;
}

function Composer({ store, onSave, notify }) {
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [when, setWhen] = useState('now');
  const [schedule, setSchedule] = useState('');
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const fileInput = useRef(null);

  const submit = () => {
    if (!caption.trim() && !file) { notify('Add a caption or media first'); return; }
    if (when === 'schedule' && !schedule) { notify('Choose a schedule date and time'); return; }
    onSave({ title: title || caption.slice(0, 48), caption, platform, hashtags: tags, mediaName: file?.name, mediaUrl: file ? URL.createObjectURL(file) : null, status: when === 'schedule' ? 'Scheduled' : 'Draft', scheduledAt: when === 'schedule' ? schedule : null });
    setCaption(''); setTitle(''); setTags(''); setFile(null); setWhen('now');
  };

  return <>
    <PageHead eyebrow="CONTENT CREATION" title="Create a post" sub="Shape your idea, choose a channel and save it to your workspace." action={<button className="secondary" onClick={() => fileInput.current?.click()}><Upload size={16} /> Add media</button>} />
    <div className="composer-layout">
      <section className="panel composer-form">
        <label>Post title<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Give your post a name (optional)" /></label>
        <label>Caption<textarea rows="7" value={caption} onChange={event => setCaption(event.target.value)} placeholder="What's on your mind? Write your caption here..." /></label>
        <div className="field-row">
          <label>Channel<select value={platform} onChange={event => setPlatform(event.target.value)}>{store.channels.map(channel => <option key={channel.id}>{channel.name}</option>)}</select></label>
          <label>Publishing<select value={when} onChange={event => setWhen(event.target.value)}><option value="now">Save as draft</option><option value="schedule">Schedule</option></select></label>
        </div>
        {when === 'schedule' && <label>Schedule date & time<input type="datetime-local" value={schedule} onChange={event => setSchedule(event.target.value)} /></label>}
        <label>Hashtags<input value={tags} onChange={event => setTags(event.target.value)} placeholder="#yourbrand #newpost" /></label>
        <input ref={fileInput} type="file" accept="image/*,video/*" hidden onChange={event => setFile(event.target.files?.[0] || null)} />
        <div className="upload-zone" onClick={() => fileInput.current?.click()}><Upload /><b>{file ? file.name : 'Drop media here or browse files'}</b><small>Images and videos · Stored locally in this browser</small>{file && <button className="text-btn" onClick={event => { event.stopPropagation(); setFile(null); }}>Remove</button>}</div>
        <div className="form-actions"><span className="muted">External publishing requires a connected platform account.</span><button className="primary" onClick={submit}><Save size={16} />{when === 'schedule' ? 'Add to queue' : 'Save draft'}</button></div>
      </section>
      <section className="panel preview-panel">
        <div className="panel-head"><div><h3>Live preview</h3><p>Post preview</p></div><Eye size={18} /></div>
        <div className="social-preview"><div className="preview-account"><div className="user-avatar small">O</div><div><b>Your account</b><small>{platform}</small></div></div><MoreHorizontal /></div>
        {file && file.type.startsWith('image/') ? <img className="preview-media" src={URL.createObjectURL(file)} alt="Preview" /> : <div className="preview-placeholder"><ImageIcon /><span>{file?.name || 'Your media preview'}</span></div>}
        <div className="preview-caption"><b>Your account</b> {caption || 'Your caption will appear here.'}<p>{tags}</p></div>
        <div className="preview-note"><CircleHelp size={15} /> Preview is illustrative. Platform formatting may vary.</div>
      </section>
    </div>
  </>;
}

function VideoStudio({ notify, onAddMedia }) {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [ratio, setRatio] = useState('9:16');
  const [rotation, setRotation] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [overlay, setOverlay] = useState('');
  const [filter, setFilter] = useState('none');
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInput = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); cancelAnimationFrame(animationRef.current); }, [url]);

  const loadVideo = selectedFile => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('video/')) { notify('Choose a video file'); return; }
    if (url) URL.revokeObjectURL(url);
    const objectUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile); setUrl(objectUrl); setStart(0); setEnd(0); setDuration(0); onAddMedia(selectedFile);
  };

  const onMetadata = () => {
    const length = videoRef.current?.duration || 0;
    setDuration(length); setEnd(length);
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); }
    else { video.pause(); setPlaying(false); }
  };

  const exportVideo = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !file) { notify('Upload a video first'); return; }
    if (!video.captureStream || !canvas?.getContext) { notify('Video export is not supported in this browser. Try Chrome or Edge.'); return; }
    if (end <= start) { notify('Choose a valid trim range'); return; }
    setExporting(true);
    try {
      video.pause(); video.currentTime = start; video.playbackRate = speed; video.volume = volume;
      await new Promise(resolve => {
        if (Math.abs(video.currentTime - start) < 0.05) resolve();
        else video.addEventListener('seeked', resolve, { once: true });
      });
      const [width, height] = ratio === '9:16' ? [720, 1280] : ratio === '1:1' ? [1080, 1080] : ratio === '4:5' ? [864, 1080] : [1280, 720];
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d');
      const stream = canvas.captureStream(30);
      const sourceStream = video.captureStream();
      sourceStream.getAudioTracks().forEach(track => stream.addTrack(track));
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
        const downloadUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a'); anchor.href = downloadUrl;
        anchor.download = `${file.name.replace(/\.[^.]+$/, '') || 'orbitpost-edit'}.webm`;
        anchor.click(); URL.revokeObjectURL(downloadUrl);
        setExporting(false); setPlaying(false); notify('Export ready');
      };
      const drawFrame = () => {
        if (video.currentTime >= end || video.ended) { recorder.stop(); video.pause(); return; }
        context.save(); context.clearRect(0, 0, width, height);
        context.filter = filter === 'mono' ? 'grayscale(1)' : filter === 'warm' ? 'sepia(.35) saturate(1.3)' : filter === 'vivid' ? 'contrast(1.25) saturate(1.2)' : 'none';
        const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
        const drawWidth = video.videoWidth * scale; const drawHeight = video.videoHeight * scale;
        context.translate(width / 2, height / 2); context.rotate(rotation * Math.PI / 180);
        context.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight); context.restore();
        if (overlay) { context.save(); context.font = 'bold 42px Arial'; context.textAlign = 'center'; context.lineWidth = 5; context.strokeStyle = 'rgba(0,0,0,.7)'; context.fillStyle = 'white'; context.strokeText(overlay, width / 2, height * .82); context.fillText(overlay, width / 2, height * .82); context.restore(); }
        animationRef.current = requestAnimationFrame(drawFrame);
      };
      recorder.start();
      await video.play(); setPlaying(true); drawFrame();
    } catch (error) {
      setExporting(false); setPlaying(false); notify('Could not export this video. Try another file or browser.');
    }
  };

  const currentTime = () => videoRef.current?.currentTime || 0;
  return <>
    <PageHead eyebrow="CREATIVE STUDIO" title="Video studio" sub="Edit a clip, shape the frame and export your video." action={<button className="primary" onClick={() => fileInput.current?.click()}><Upload size={16} /> Upload video</button>} />
    <input ref={fileInput} type="file" accept="video/*" hidden onChange={event => loadVideo(event.target.files?.[0])} />
    <div className="studio-layout">
      <section className="panel editor-preview">
        <div className="panel-head"><div><h3>Preview canvas</h3><p>{file ? file.name : 'Start with a video clip'}</p></div><span className="live-dot">LOCAL EDITOR</span></div>
        <div className="video-stage"><div className={`video-frame ratio-${ratio.replace(':', '-')}`}>
          {url ? <video ref={videoRef} src={url} onLoadedMetadata={onMetadata} onTimeUpdate={() => { if (videoRef.current && videoRef.current.currentTime >= end && end > 0) { videoRef.current.pause(); setPlaying(false); } }} style={{ filter: filter === 'mono' ? 'grayscale(1)' : filter === 'warm' ? 'sepia(.35)' : filter === 'vivid' ? 'contrast(1.2)' : 'none', transform: `rotate(${rotation}deg)` }} playsInline /> : <div className="video-empty" onClick={() => fileInput.current?.click()}><Film size={38} /><b>Drop a video to get started</b><span>or browse files from your device</span></div>}
          {overlay && <div className="video-overlay">{overlay}</div>}
        </div></div>
        <div className="player-controls"><button className="play-btn" onClick={togglePlayback} disabled={!url}>{playing ? <Pause /> : <Play />}</button><span>{new Date(currentTime() * 1000).toISOString().slice(14, 19)}</span><input type="range" min="0" max={duration || 1} step="0.1" value={currentTime()} onChange={event => { if (videoRef.current) videoRef.current.currentTime = Number(event.target.value); }} disabled={!url} /><span>{new Date(duration * 1000).toISOString().slice(14, 19)}</span></div>
        <div className="timeline"><div className="timeline-head"><b><Layers size={15} /> Timeline</b><span>{file ? '1 clip' : '0 clips'}</span></div>{file ? <div className="clip-track"><div className="clip-block"><Film size={15} />{file.name}</div></div> : <div className="timeline-empty">Upload a video to create your first clip</div>}
          <div className="trim-control"><label>In <input type="number" min="0" max={duration} step="0.1" value={start} onChange={event => setStart(Math.min(Number(event.target.value), end))} /></label><label>Out <input type="number" min="0" max={duration} step="0.1" value={end} onChange={event => setEnd(Math.max(Number(event.target.value), start))} /></label></div>
        </div>
      </section>
      <section className="panel tools-panel">
        <div className="panel-head"><div><h3>Editing tools</h3><p>Adjust your selected clip</p></div><SlidersHorizontal size={18} /></div>
        <div className="tool-section"><h4><Crop /> Frame & canvas</h4><label>Aspect ratio<select value={ratio} onChange={event => setRatio(event.target.value)}><option>9:16</option><option>1:1</option><option>4:5</option><option>16:9</option></select></label><button className="tool-button" onClick={() => setRotation(value => (value + 90) % 360)}><RotateCw /> Rotate 90° <span>{rotation}°</span></button></div>
        <div className="tool-section"><h4><Scissors /> Trim</h4><label>Start <input type="range" min="0" max={duration || 1} step="0.1" value={start} onChange={event => setStart(Math.min(Number(event.target.value), end))} /></label><label>End <input type="range" min="0" max={duration || 1} step="0.1" value={end} onChange={event => setEnd(Math.max(Number(event.target.value), start))} /></label><small className="muted">Selected length: {Math.max(0, end - start).toFixed(1)} seconds</small></div>
        <div className="tool-section"><h4><Type /> Text overlay</h4><input value={overlay} onChange={event => setOverlay(event.target.value)} placeholder="Add text to your video" /><small className="muted">Text is rendered into the exported video.</small></div>
        <div className="tool-section"><h4><WandSparkles /> Filters</h4><select value={filter} onChange={event => setFilter(event.target.value)}><option value="none">Original</option><option value="mono">Black & white</option><option value="warm">Warm</option><option value="vivid">Vivid contrast</option></select></div>
        <div className="tool-section"><h4><Gauge /> Playback speed</h4><select value={speed} onChange={event => { setSpeed(Number(event.target.value)); if (videoRef.current) videoRef.current.playbackRate = Number(event.target.value); }}><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></div>
        <div className="tool-section"><h4><Volume2 /> Audio volume</h4><input type="range" min="0" max="1" step="0.05" value={volume} onChange={event => { setVolume(Number(event.target.value)); if (videoRef.current) videoRef.current.volume = Number(event.target.value); }} /></div>
        <button className="primary export-btn" disabled={!url || exporting} onClick={exportVideo}><Download size={16} />{exporting ? 'Rendering video…' : 'Export video'}</button><small className="muted">Exports as WebM where supported. Exported file downloads to your device.</small>
      </section>
    </div>
    <canvas ref={canvasRef} hidden />
  </>;
}

function Planner({ posts, updatePost, notify }) {
  const [month, setMonth] = useState(new Date());
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const scheduled = posts.filter(post => post.status === 'Scheduled');
  return <>
    <PageHead eyebrow="PUBLISHING" title="Content planner" sub="A simple view of your upcoming content." action={<button className="primary" onClick={() => notify('Create a post and choose Schedule to add it here')}><Plus size={16} /> Plan content</button>} />
    <section className="panel calendar-panel"><div className="calendar-toolbar"><button className="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button><h3>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3><button className="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button><button className="text-btn" onClick={() => setMonth(new Date())}>Today</button></div>
      <div className="calendar-grid">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <b className="weekday" key={day}>{day}</b>)}{Array.from({ length: firstDay }, (_, index) => <div className="calendar-cell blank" key={`blank-${index}`} />)}{Array.from({ length: days }, (_, index) => { const day = index + 1; const events = scheduled.filter(post => { const date = post.scheduledAt ? new Date(post.scheduledAt) : null; return date && date.getDate() === day && date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear(); }); return <div className="calendar-cell" key={day}><span>{day}</span>{events.map(post => <div className="calendar-event" key={post.id} title={post.title}>{post.title || 'Scheduled post'}</div>)}</div>; })}</div>
    </section>
    <section className="panel queue-panel"><div className="panel-head"><div><h3>Publishing queue</h3><p>Posts waiting for their moment</p></div></div>{scheduled.length ? scheduled.map(post => <div className="post-row" key={post.id}><div className="post-thumb"><CalendarDays /></div><div className="post-info"><b>{post.title || 'Scheduled post'}</b><small>{post.platform} · {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'Time not set'}</small></div><Status status="Scheduled" /><button className="secondary small-btn" onClick={() => { updatePost(post.id, { status: 'Draft' }); notify('Moved to drafts'); }}>Move to drafts</button></div>) : <Empty icon={CalendarDays} title="Your queue is clear" text="Schedule a post to see it here." />}</section>
  </>;
}

function PostList({ posts, remove, title }) {
  return <><PageHead eyebrow="CONTENT" title={title} sub="Manage the content saved in your workspace." /><section className="panel">{posts.length ? posts.map(post => <div className="post-row" key={post.id}><div className="post-thumb">{post.mediaUrl ? <img src={post.mediaUrl} alt="Post media" /> : <ImageIcon />}</div><div className="post-info"><b>{post.title || 'Untitled post'}</b><small>{post.platform} · {formatDate(post.createdAt)}</small></div><Status status={post.status} /><button className="icon-btn danger" onClick={() => remove(post.id)}><Trash2 size={16} /></button></div>) : <Empty icon={FileText} title="Nothing here yet" text="Your saved content will appear here." />}</section></>;
}

function MediaLibrary({ media, notify, onUpload }) {
  const upload = event => {
    const items = Array.from(event.target.files || []).map(file => ({ id: uid(), name: file.name, type: file.type, url: URL.createObjectURL(file), size: file.size }));
    if (items.length) { onUpload(items); notify('Assets added to your library'); }
    event.target.value = '';
  };
  return <><PageHead eyebrow="ASSETS" title="Media library" sub="Your locally added creative assets." action={<label className="primary upload-label"><Upload size={16} /> Upload files<input type="file" hidden multiple accept="image/*,video/*" onChange={upload} /></label>} /><div className="media-grid">{media.map(item => <div className="media-card" key={item.id}>{item.type.startsWith('image/') ? <img src={item.url} alt={item.name} /> : <div className="media-video"><Film size={28} /></div>}<b>{item.name}</b><small>{(item.size / 1024 / 1024).toFixed(1)} MB</small></div>)}</div>{!media.length && <section className="panel"><Empty icon={FolderOpen} title="Your library is empty" text="Upload images and videos to keep your assets together." /></section>}</>;
}

function Channels({ channels, notify }) {
  return <><PageHead eyebrow="DISTRIBUTION" title="Channels" sub="Manage the social platforms you plan content for." /><div className="channel-grid">{channels.map(channel => <div className="panel channel-card" key={channel.id}><div className="channel-card-top"><span className="channel-icon large" style={{ '--channel': channel.color }}>{channel.id === 'instagram' ? <Instagram /> : channel.id === 'youtube' ? <Youtube /> : channel.id === 'facebook' ? <Facebook /> : <Video />}</span><Status status={channel.connected ? 'Connected' : 'Draft'} /></div><h3>{channel.name}</h3><p>{channel.connected ? channel.handle : 'No account connected'}</p><button className="secondary full" onClick={() => notify(`Official OAuth setup is required to connect ${channel.name}`)}><Link2 size={15} /> {channel.connected ? 'Manage connection' : 'Connect account'}</button></div>)}</div><div className="notice"><CircleHelp size={17} /><span>Account connection and publishing require each platform's official OAuth/API integration. This starter app does not simulate a real connection.</span></div></>;
}

function Analytics({ posts }) {
  const published = posts.filter(post => post.status === 'Published').length;
  const scheduled = posts.filter(post => post.status === 'Scheduled').length;
  const drafts = posts.filter(post => post.status === 'Draft').length;
  return <><PageHead eyebrow="PERFORMANCE" title="Analytics" sub="Workspace activity based on your saved content." /><div className="stat-grid">{[['Published posts', published, Send], ['Scheduled posts', scheduled, CalendarDays], ['Drafts', drafts, FileText], ['Total posts', posts.length, BarChart3]].map(([label, count, Icon]) => <div className="stat-card" key={label}><div className="stat-top"><span>{label}</span><Icon size={17} /></div><strong>{count}</strong><small>Local workspace data</small></div>)}</div><section className="panel"><div className="panel-head"><div><h3>Content breakdown</h3><p>By current status</p></div></div>{[['Published', published], ['Scheduled', scheduled], ['Drafts', drafts]].map(([label, count]) => <div className="bar-row" key={label}><span>{label}</span><div className="bar-bg"><i style={{ width: `${posts.length ? count / posts.length * 100 : 0}%` }} /></div><b>{count}</b></div>)}<div className="notice"><BarChart3 size={17} /> Reach, impressions and engagement appear after real platform analytics integrations are configured.</div></section></>;
}

function SettingsPage({ apiState }) {
  return <><PageHead eyebrow="PREFERENCES" title="Settings" sub="Workspace configuration." /><section className="panel settings-panel"><h3>Application</h3><div className="setting-row"><div><b>Backend connection</b><small>FastAPI service status</small></div><Status status={apiState === 'online' ? 'Connected' : 'Draft'} /></div><div className="setting-row"><div><b>Local workspace data</b><small>Posts and preferences are stored in this browser.</small></div><button className="secondary" onClick={() => { if (window.confirm('Clear all OrbitPost local data?')) { localStorage.removeItem(STORAGE_KEY); window.location.reload(); } }}>Clear data</button></div><div className="setting-row"><div><b>Export workspace</b><small>Download your local post data as JSON.</small></div><button className="secondary" onClick={() => { const blob = new Blob([localStorage.getItem(STORAGE_KEY) || '{}'], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'orbitpost-workspace.json'; anchor.click(); URL.revokeObjectURL(url); }}>Export JSON</button></div></section></>;
}
