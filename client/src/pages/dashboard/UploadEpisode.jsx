import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Film, Link as LinkIcon } from 'lucide-react';
import { seriesAPI, episodeAPI, youtubeAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { DashboardLayout } from './DashboardHome';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const STEPS = ['Series', 'Episode Details', 'Upload Video', 'Publish'];

export default function UploadEpisode() {
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    seriesId: '', seasonNumber: 1, episodeNumber: 1,
    title: '', description: '', youtubeVideoId: '',
    introStart: 0, introEnd: 90, isPremium: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('youtube-id'); // 'youtube-id' | 'upload'
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  const { data: mySeries } = useQuery({
    queryKey: ['my-series', user?._id],
    queryFn: () => seriesAPI.getByCreator(user._id).then(r => r.data.series),
    enabled: !!user?._id,
  });

  const handle = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [key]: val }));
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('video', videoFile);
      fd.append('title', form.title);
      fd.append('description', form.description || '');
      const { data } = await youtubeAPI.upload(fd, (pct) => setUploadProgress(pct));
      setForm(f => ({ ...f, youtubeVideoId: data.videoId }));
      toast.success('Video uploaded to YouTube! 🎬');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Check your YouTube API credentials.');
    }
    setUploading(false);
  };

  const handlePublish = async () => {
    setError('');
    try {
      await episodeAPI.create({
        ...form,
        seasonNumber: parseInt(form.seasonNumber),
        episodeNumber: parseInt(form.episodeNumber),
        introStart: parseInt(form.introStart),
        introEnd: parseInt(form.introEnd),
      });
      setPublished(true);
      toast.success('Episode published! 🚀');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish.');
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm font-dm outline-none transition-all";
  const inputStyle = { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' };

  if (published) return (
    <DashboardLayout title="Upload Episode">
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"
             style={{ background: 'rgba(34,197,94,0.15)' }}>
          <CheckCircle size={40} style={{ color: 'var(--green)' }} />
        </div>
        <h2 className="font-syne font-black text-3xl mb-3" style={{ color: 'var(--text)' }}>Published! 🎉</h2>
        <p className="font-dm mb-6" style={{ color: 'var(--text2)' }}>Your episode is live on Celova.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setStep(0); setForm({ ...form, title: '', description: '', youtubeVideoId: '' }); setPublished(false); }}
            className="btn-orange px-6 py-2.5 rounded-xl font-syne font-bold text-sm">
            Upload Another
          </button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Upload Episode">
      <div className="max-w-2xl">
        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all"
                     style={{
                       background: i < step ? 'var(--green)' : i === step ? 'var(--orange)' : 'var(--surface)',
                       color: i <= step ? '#fff' : 'var(--text3)',
                       border: `2px solid ${i < step ? 'var(--green)' : i === step ? 'var(--orange)' : 'var(--border)'}`,
                     }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-dm hidden sm:block" style={{ color: i === step ? 'var(--text)' : 'var(--text3)' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px w-8" style={{ background: i < step ? 'var(--green)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-4 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--red)' }} />
            <p className="text-sm font-dm" style={{ color: 'var(--red)' }}>{error}</p>
          </div>
        )}

        {/* Step 0: Select Series */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text2)' }}>Select Series</label>
              <select value={form.seriesId} onChange={handle('seriesId')}
                className={inputCls} style={inputStyle}>
                <option value="">— Select a series —</option>
                {mySeries?.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text2)' }}>Season</label>
                <input type="number" min="1" value={form.seasonNumber} onChange={handle('seasonNumber')} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text2)' }}>Episode</label>
                <input type="number" min="1" value={form.episodeNumber} onChange={handle('episodeNumber')} className={inputCls} style={inputStyle} />
              </div>
            </div>
            <button disabled={!form.seriesId} onClick={() => setStep(1)}
              className="btn-orange px-6 py-3 rounded-xl font-syne font-bold text-sm disabled:opacity-40">
              Next: Episode Details →
            </button>
          </div>
        )}

        {/* Step 1: Episode Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text2)' }}>Episode Title</label>
              <input type="text" value={form.title} onChange={handle('title')} placeholder="e.g. The Awakening" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text2)' }}>Description</label>
              <textarea value={form.description} onChange={handle('description')} rows={4} placeholder="Episode synopsis..."
                className={`${inputCls} resize-none`} style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text2)' }}>Intro Start (sec)</label>
                <input type="number" min="0" value={form.introStart} onChange={handle('introStart')} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text2)' }}>Intro End (sec)</label>
                <input type="number" min="0" value={form.introEnd} onChange={handle('introEnd')} className={inputCls} style={inputStyle} />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={form.isPremium} onChange={handle('isPremium')} className="sr-only" />
                <div className="w-10 h-6 rounded-full transition-colors" style={{ background: form.isPremium ? 'var(--orange)' : 'var(--surface2)' }}>
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all" style={{ left: form.isPremium ? '20px' : '4px' }} />
                </div>
              </div>
              <span className="font-dm text-sm" style={{ color: 'var(--text2)' }}>Premium only episode</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="px-5 py-2.5 rounded-xl font-dm text-sm" style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}>← Back</button>
              <button disabled={!form.title} onClick={() => setStep(2)} className="btn-orange px-6 py-3 rounded-xl font-syne font-bold text-sm disabled:opacity-40">Next: Upload Video →</button>
            </div>
          </div>
        )}

        {/* Step 2: Upload Video */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Method toggle */}
            <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--surface)' }}>
              {[{ id: 'youtube-id', label: 'Paste YouTube ID', icon: LinkIcon }, { id: 'upload', label: 'Upload Video File', icon: Upload }].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setUploadMethod(id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-dm transition-all"
                  style={{ background: uploadMethod === id ? 'var(--orange)' : 'transparent', color: uploadMethod === id ? '#fff' : 'var(--text2)' }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {uploadMethod === 'youtube-id' ? (
              <div>
                <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text2)' }}>YouTube Video ID</label>
                <input type="text" value={form.youtubeVideoId} onChange={handle('youtubeVideoId')}
                  placeholder="e.g. dQw4w9WgXcQ"
                  className={inputCls} style={inputStyle} />
                <p className="text-xs mt-1.5 font-dm" style={{ color: 'var(--text3)' }}>The ID is the part after ?v= in a YouTube URL</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-syne font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>Video File (max 4GB)</label>
                <div
                  className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors"
                  style={{ borderColor: videoFile ? 'var(--green)' : 'var(--border)', background: videoFile ? 'rgba(34,197,94,0.05)' : 'var(--bg3)' }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith('video/')) setVideoFile(f); }}
                >
                  <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setVideoFile(e.target.files?.[0])} />
                  <Film size={28} className="mx-auto mb-2" style={{ color: videoFile ? 'var(--green)' : 'var(--text3)' }} />
                  {videoFile ? (
                    <div>
                      <p className="font-dm font-600 text-sm" style={{ color: 'var(--green)' }}>{videoFile.name}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <p className="font-dm font-600 text-sm" style={{ color: 'var(--text)' }}>Drag & drop or click to select</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>MP4, MOV, AVI (max 4GB)</p>
                    </>
                  )}
                </div>

                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5 font-mono" style={{ color: 'var(--text2)' }}>
                      <span>Uploading to YouTube...</span><span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: 'var(--orange)' }} />
                    </div>
                  </div>
                )}

                {videoFile && !uploading && !form.youtubeVideoId && (
                  <button onClick={handleVideoUpload} className="mt-4 btn-orange px-6 py-2.5 rounded-xl font-syne font-bold text-sm w-full">
                    Upload to YouTube
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl font-dm text-sm" style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}>← Back</button>
              <button
                disabled={!form.youtubeVideoId}
                onClick={() => setStep(3)}
                className="btn-orange px-6 py-3 rounded-xl font-syne font-bold text-sm disabled:opacity-40">
                Next: Publish →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Publish */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 className="font-syne font-bold mb-4" style={{ color: 'var(--text)' }}>Episode Summary</h3>
              {[
                ['Series', mySeries?.find(s => s._id === form.seriesId)?.title || '—'],
                ['Episode', `S${form.seasonNumber}:E${form.episodeNumber}`],
                ['Title', form.title],
                ['YouTube ID', form.youtubeVideoId],
                ['Premium Only', form.isPremium ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-syne uppercase tracking-wider" style={{ color: 'var(--text3)' }}>{label}</span>
                  <span className="text-sm font-dm font-600" style={{ color: 'var(--text)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl font-dm text-sm" style={{ background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)' }}>← Back</button>
              <button onClick={handlePublish} className="flex-1 btn-orange py-3 rounded-xl font-syne font-bold text-sm">
                🚀 Publish Episode
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
