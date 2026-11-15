import subprocess,json,sys,numpy as np
vid=sys.argv[1]; sr=16000
a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f'vids/{vid}.mp4','-ac','1','-ar',str(sr),'-f','f32le','-'],capture_output=True).stdout,np.float32)
d=json.load(open(f'subs/{vid}.en.json3',encoding='utf-8'))
ws=[]
for e in d['events']:
    for s in e.get('segs',[]) or []:
        if s.get('utf8','').strip() and '[' not in s['utf8']: ws.append((e['tStartMs']+s.get('tOffsetMs',0))/1000)
ws=np.array(sorted(ws))
gaps=[(ws[i]+0.45,ws[i+1]-0.1) for i in range(len(ws)-1) if ws[i+1]-ws[i]>1.2]
def db(x): return 20*np.log10(np.sqrt(np.mean(x**2))+1e-9)
sp=np.concatenate([a[int(t*sr):int((t+0.3)*sr)] for t in ws[::3]])
gp=[a[int(s*sr):int(e*sr)] for s,e in gaps if e>s+0.3]
g=np.concatenate(gp) if gp else np.zeros(10)
def cent(x):
    X=np.abs(np.fft.rfft(x[:sr*20]*np.hanning(len(x[:sr*20]))));f=np.fft.rfftfreq(len(x[:sr*20]),1/sr);return float((X*f).sum()/X.sum())
print(vid,'speech_rms_db',round(db(sp),1),'gap_rms_db',round(db(g),1),'bed_under_voice_db',round(db(sp)-db(g),1),'n_gaps',len(gp),'gap_centroid_hz',round(cent(g)),'speech_centroid_hz',round(cent(sp)))
# first 3 s before voice
print('  pre-voice first word at',round(ws[0],2),'s; intro rms',round(db(a[:int(max(ws[0],0.05)*sr)]),1))
