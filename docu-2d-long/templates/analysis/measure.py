import subprocess,sys,numpy as np,glob,os,json
FF='ffmpeg'
def frames(path,fps,w=160,h=90):
    p=subprocess.run([FF,'-v','error','-i',path,'-vf',f'fps={fps},scale={w}:{h}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True)
    return np.frombuffer(p.stdout,np.uint8).reshape(-1,h,w,3).astype(np.float32)/255
res={}
for f in sorted(glob.glob(sys.argv[1]+'/*.mp4')):
    vid=os.path.basename(f)[:-4]
    F=frames(f,1)
    px=F.reshape(-1,3)
    l=px@np.array([.2126,.7152,.0722])
    mx=px.max(1);mn=px.min(1);sat=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0)
    # kmeans 8
    rng=np.random.default_rng(0);X=px[rng.choice(len(px),40000,replace=False)]
    C=X[rng.choice(len(X),8,replace=False)]
    for _ in range(25):
        d=((X[:,None]-C[None])**2).sum(2);a=d.argmin(1)
        C=np.array([X[a==k].mean(0) if (a==k).any() else C[k] for k in range(8)])
    share=np.bincount(a,minlength=8)/len(a);o=np.argsort(-share)
    pal=[('#%02x%02x%02x'%tuple((C[k]*255).astype(int)),round(float(share[k])*100,1)) for k in o]
    # motion at 10fps on 60s window
    G=frames(f,10,160,90)[:, :, :, 1]
    diff=np.abs(np.diff(G,axis=0)).mean((1,2))
    res[vid]=dict(luma_mean=round(float(l.mean()),3),luma_p5=round(float(np.percentile(l,5)),3),luma_p50=round(float(np.median(l)),3),luma_p99=round(float(np.percentile(l,99)),3),sat_med=round(float(np.median(sat)),3),
      palette=pal,still_frac=round(float((diff<0.002).mean()),2),move_frac=round(float((diff>0.01).mean()),2),big_change=int((diff>0.06).sum()))
    print(vid,json.dumps(res[vid]))
json.dump(res,open(sys.argv[2],'w'),indent=1)
