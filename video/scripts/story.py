# Lays out the story film: narration from lines.py, live scenes cut from the real recordings.
# Subtitles show exactly what is spoken, in short lines timed against the audio itself.
# Writes public/story.json and public/story-short.json, plus levelled copies of the recorded audio.
import json,os,re,sys,wave
import numpy as np
sys.path.insert(0,'scripts'); from lines import STORY, MIC
CAP={l[0]:l[5] for l in STORY}; MICTXT={l[0]:l[4] for l in MIC}
idx={c:json.load(open(f'public/rec/{c}/index.json')) for c in ['sahay','court']}
t0={c:idx[c]['frames'][0]['t'] for c in idx}
for c in idx:
    json.dump([[f['t']-t0[c],f['n']] for f in idx[c]['frames']],open(f'public/rec/{c}/frames.json','w'))
    os.makedirs(f'public/rec/{c}/lv',exist_ok=True)
    for s in idx[c]['sounds']:
        w=wave.open(f"public/rec/{c}/a/{s['file']}"); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(float)/32768
        v=x[np.abs(x)>0.01]
        if len(v): x=x*(10**(-19/20)/np.sqrt((v**2).mean()))
        x=np.clip(x,-1,1); o=wave.open(f"public/rec/{c}/lv/{s['file']}",'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((x*32767).astype('<i2').tobytes()); o.close()
    MICS=[s for s in idx[c]['sounds'] if s['kind']=='mic']
    ids=['m1','m2','m3','m4','m5'] if c=='sahay' else ['a1','a2','a3']
    for s,i in zip(MICS,ids): s['text']=MICTXT[i]

def pcm(path):
    w=wave.open(path); sr=w.getframerate(); return np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(float)/32768,sr
def weight(w):
    return max(1,len(re.sub(r'[^\w]','',w)))+4*sum(ch.isdigit() for ch in w)
def chunks(words):
    out=[];cur=[]
    for w in words:
        cur.append(w)
        if len(cur)>=5 or len(' '.join(cur))>=30 or re.search(r'[.,?!:;।]["\']?$',w) and len(cur)>=2:
            out.append(cur);cur=[]
    if cur:
        if out and len(cur)==1 and len(' '.join(out[-1]))<28: out[-1]+=cur
        else: out.append(cur)
    return out
def align(path,text):
    """Short subtitle lines with times: word positions are mapped onto the voiced parts of the audio."""
    x,sr=pcm(path); fr=max(1,sr//50); e=np.array([np.sqrt((x[i:i+fr]**2).mean()) for i in range(0,len(x)-fr+1,fr)])
    voiced=e>max(0.006,e.max()*0.04); cum=np.cumsum(voiced)/50.0; total=cum[-1] or 1e-3
    ws=text.split(); ww=[weight(w) for w in ws]; tw=sum(ww); res=[];pos=0
    def at(frac):
        return float(np.searchsorted(cum,frac*total))/50.0
    for ch in chunks(ws):
        a=sum(ww[:pos]); b=a+sum(weight(w) for w in ch); pos+=len(ch)
        res.append((at(a/tw),at(b/tw)+0.08,' '.join(ch)))
    return res
def vo_dur(i):
    x,sr=pcm(f'public/vo/{i}.wav'); return len(x)/sr
def sounds(c,a,b):
    out=[]
    for s in idx[c]['sounds']:
        st=(s['t']-t0[c])/1000; en=st+s['dur']
        if st<a or st>=b-0.02: continue  # never start inside another sound
        out.append({'file':f"rec/{c}/lv/{s['file']}",'at':st-a,'skip':0,'dur':min(en,b)-st,'text':s.get('text',''),'kind':s['kind']})
    return out
def vo(i,v,hold=0.0,gap=0.15,cap=True,card=None):
    return {'kind':'vo','id':i,'v':v,'card':card,'dur':vo_dur(i)+hold+gap,'voice':f'vo/{i}.wav','cap':CAP[i] if cap else None}
def live(c,a,b,card,v=None,tag=None,gavel=None):
    e={'kind':'live','card':card,'v':{'t':'live','clip':c,'from':a,'rate':1,**(v or {})},'dur':b-a,'sounds':sounds(c,a,b),'who':tag or {}}
    if gavel is not None: e['gavel']=gavel-a
    return e
def quiet(c,a,keys=None,rate=1,tag=None): return {'t':'live','clip':c,'from':a,'rate':rate,'keys':keys,'tag':tag}
def K(*p): return [dict(f=f,**d) for f,d in p]
Y=dict(x=28,y=55,z=1.3); B=dict(x=50,y=50,z=1.4); O=dict(x=90,y=45,z=1.3); C2=dict(x=40,y=45,z=1.25)
SC=dict(x=50,y=96,z=1.25); V=dict(x=50,y=6,z=1.2)
T_A='Arjun · 2:04 AM'; T_M='Meena talks to Sahay'; T_H="Arjun rehearses Meena's case"

def cold(end2): return [
 live('court',22.5,29.6,'cold',{'keys':K((0,Y),),'tag':T_A},{'mic':'ARJUN'}),
 live('court',31.2,end2,'cold',{'keys':K((0,B),),'tag':T_A},{'app':'THE BENCH'},gavel=31.4),
]
GREET=live('sahay',2.9,9.6,'sahay',{'keys':K((0,dict(x=25,y=50,z=1.3)),(3,dict(x=25,y=50,z=1.3)),(4.5,C2)),'tag':T_M},{'app':'SAHAY'})
M1=live('sahay',10.8,16.6,'sahay',{'keys':K((0,C2),),'tag':T_M},{'mic':'MEENA'})
REPLY=live('sahay',56.3,62.9,'sahay',{'keys':K((0,C2),),'tag':T_M},{'app':'SAHAY'})
CARD=K((0,dict(x=96,y=14,z=1.35)),(1.5,dict(x=96,y=26,z=1.35)))
VERDICT=quiet('court',218.1,K((0,V),(3.8,dict(x=50,y=36,z=1.2))),rate=.62,tag='The verdict')
FILM=[
 *cold(44.55),
 vo('n1',{'t':'photo','src':'scene-practice','tag':T_A},gap=.2),
 vo('n2',{'t':'title','big':'Three weeks earlier','small':'Meena and Arjun are fictional. The app, and everything it says here, is real.'},gap=.3),
 vo('n3',{'t':'photo','src':'scene-sahay','pos':'60% 45%','tag':'Meena · Lucknow, 11 PM'},gap=.2),
 vo('n4',{'t':'stats'},gap=.2),
 vo('n5',{'t':'brand','lion':'left'},gap=.1),
 GREET,M1,REPLY,
 vo('n6',quiet('sahay',64.5,K((0,C2),),tag=T_M),card='sahay'),
 vo('n7',quiet('sahay',135.3,CARD,tag="Meena's path")),
 vo('n8',{'t':'aid','lion':'right','tag':'A free lawyer'},gap=.25),
 vo('n9',{'t':'laws','tag':'Arjun, 26'},gap=.2),
 vo('n10',quiet('court',3.7,K((0,dict(x=30,y=45,z=1.3)),),rate=2.2,tag='Arjun · Bring your own case')),
 vo('n11',quiet('court',42.6,K((0,B),),tag=T_H),card='hearing'),
 live('court',45.9,55.8,'hearing',{'keys':K((0,Y),),'tag':T_H},{'mic':'ARJUN'}),
 live('court',96.1,100.8,'hearing',{'keys':K((0,O),),'tag':T_H},{'app':'OPPOSING COUNSEL'}),
 live('court',133.0,134.95,'hearing',{'keys':K((0,B),),'tag':T_H},{'app':'THE BENCH'}),
 live('court',136.3,148.7,'hearing',{'keys':K((0,B),(5,SC),(10,B)),'tag':T_H},{'app':'THE BENCH'}),
 vo('n12',VERDICT,gap=.25),
 vo('n13',{'t':'title','big':'So he started again.'},hold=.9),
 vo('n14',{'t':'photo','src':'scene-journey','pos':'55% 45%','tag':'This morning'},gap=.2),
 vo('n15',{'t':'photo','src':'scene-court'},gap=.3),
 vo('n16',{'t':'models','lion':'left','lionH':300},gap=.25),
 vo('n17',{'t':'close'},gap=.1,cap=False),
 vo('n18',{'t':'close','cont':True},hold=2.6,cap=False),
]
SHORT=[
 *cold(36.65),
 vo('n1',{'t':'photo','src':'scene-practice','tag':T_A},gap=.15),
 vo('n3',{'t':'photo','src':'scene-sahay','pos':'60% 45%','tag':'Three weeks earlier · Meena'},gap=.15),
 vo('n5',{'t':'brand','lion':'left'},gap=.05),
 M1,live('sahay',56.3,62.9,'sahay',{'keys':K((0,C2),),'tag':T_M},{'app':'SAHAY'}),
 vo('n7',quiet('sahay',135.3,CARD,tag="Meena's path")),
 vo('n8',{'t':'aid','lion':'right','tag':'A free lawyer'},gap=.15),
 vo('n12',VERDICT,gap=.15),
 vo('n15',{'t':'photo','src':'scene-journey','pos':'55% 45%','tag':'This morning'},gap=.25),
 vo('n18',{'t':'close','tiny':True},hold=2.2,cap=False),
]
def layout(items,out):
    t=0;lines=[];spans=[]
    for e in items:
        e=e; e['start']=round(t,3); e['dur']=round(e['dur'],3)
        if e['kind']=='vo':
            spans.append((t,t+vo_dur(e['id']),e['id']))
            if e.get('cap'):
                for a,b,tx in align(f"public/vo/{e['id']}.wav",e['cap']): lines.append({'tag':None,'caption':tx,'start':round(t+a,3),'dur':round(b-a,3)})
        for s in e.get('sounds',[]):
            spans.append((t+s['at'],t+s['at']+s['dur'],s['text'][:20]))
            if s['text']:
                tag=e['who'].get(s['kind'])
                x,sr=pcm('public/'+s['file'])
                for a,b,tx in align('public/'+s['file'],s['text']):
                    if a<s['dur']-0.1: lines.append({'tag':tag,'caption':tx,'start':round(t+s['at']+a,3),'dur':round(min(b,s['dur'])-a,3)})
        t+=e['dur']
    spans.sort(); bad=[(round(a[0],1),a[2],b[2]) for a,b in zip(spans,spans[1:]) if b[0]<a[1]-0.03]
    print(out,'total',round(t,1),'voices',len(spans),'OVERLAPS',bad,'sub lines',len(lines))
    # each subtitle holds until the next one, unless there is a real gap
    lines.sort(key=lambda l:l['start'])
    for a,b in zip(lines,lines[1:]): a['dur']=round(min(a['dur']+0.25,b['start']-a['start']),3)
    json.dump({'total':round(t,3),'items':items,'lines':lines},open(out,'w'),ensure_ascii=False)
    return lines
import copy
l=layout(copy.deepcopy(FILM),'public/story.json'); layout(copy.deepcopy(SHORT),'public/story-short.json')
print([ (round(x['start'],1),x['tag'] or '',x['caption']) for x in l[:14]])
