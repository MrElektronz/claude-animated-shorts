import json,sys,glob,os,re
src,dst=sys.argv[1],sys.argv[2]; os.makedirs(dst,exist_ok=True)
for f in glob.glob(os.path.join(src,'*.en.json3')):
    vid=os.path.basename(f).split('.')[0]
    d=json.load(open(f,encoding='utf-8'))
    words=[]
    for e in d.get('events',[]):
        t0=e.get('tStartMs',0)
        for s in e.get('segs',[]) or []:
            w=s.get('utf8','').strip()
            if w and w!='\n': words.append((t0+s.get('tOffsetMs',0),w))
    # paragraphs every ~20s
    out=[];cur=[];last=-1e9
    for t,w in words:
        if t-last>20000 and cur: out.append(cur);cur=[]
        if not cur: last=t
        cur.append((t,w))
    if cur: out.append(cur)
    with open(os.path.join(dst,vid+'.txt'),'w',encoding='utf-8') as o:
        for p in out:
            ts=p[0][0]//1000; o.write(f"[{ts//60:02d}:{ts%60:02d}] "+' '.join(w for _,w in p)+"\n")
    dur=words[-1][0]/1000 if words else 0
    print(vid,len(words),'words',round(dur),'s',round(len(words)/max(dur,1),2),'w/s')
