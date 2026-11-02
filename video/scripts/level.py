# Repairs Timbre's streamed WAVs, trims edge silence, levels loudness, rebuilds the timeline.
import json,os,sys,wave
import numpy as np
sys.path.insert(0,'scripts'); from lines import LINES, SHORT, MIC, STORY
os.makedirs('public/vo',exist_ok=True)
SR=24000
def write(p,x,sr=SR,ch=1):
    w=wave.open(p,'wb'); w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x,-1,1)*32767).astype('<i2').tobytes()); w.close()
def build(lines,out):
    tot=0;tl=[]
    for id_,sc,v,lang,text,cap,gap in lines:
        b=open(f'public/voice/{id_}.wav','rb').read()
        i=b.find(b'data')+8
        x=np.frombuffer(b[i:len(b)-((len(b)-i)%2)],'<i2').astype(float)/32768
        fr=480; e=np.array([np.sqrt((x[k:k+fr]**2).mean()) for k in range(0,len(x)-fr,fr)])
        on=np.where(e>10**(-42/20))[0]; a=max(on[0]*fr-720,0); z=min((on[-1]+1)*fr+1800,len(x)); x=x[a:z]
        rms=np.sqrt((x[np.abs(x)>0.01]**2).mean()); x=x*(10**(-19/20)/rms)
        x=np.tanh(x*1.0/0.9)*0.9 if np.abs(x).max()>0.9 else x
        f=np.linspace(0,1,240); x[:240]*=f; x[-480:]*=np.linspace(1,0,480)
        write(f'public/vo/{id_}.wav',x); d=len(x)/SR
        tl.append({'id':id_,'scene':sc,'voice':v,'caption':cap,'start':round(tot,3),'dur':round(d,3)}); tot+=d+gap
        print(id_,round(d,2),end=' | ')
    json.dump({'total':round(tot,3),'lines':tl},open(out,'w'),ensure_ascii=False,indent=0)
    print('\nTOTAL',out,round(tot,1))
build(STORY,'public/timeline-story.json')
