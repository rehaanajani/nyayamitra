import json,os,re,sys,time,wave,urllib.request
sys.path.insert(0,'scripts'); from lines import LINES
key=[l.split('=',1)[1].strip() for l in open('../server/.env') if l.startswith('GNANI_API_KEY=')][0]
force=set(sys.argv[1:])
for id_,sc,v,lang,text,cap,gap in LINES:
    p=f'public/voice/{id_}.wav'
    if os.path.exists(p) and id_ not in force: continue
    body=json.dumps({'text':text,'model':'timbre-v3.0','voice':v,'language':lang,'speed':1.0,'audio_config':{'sample_rate':24000,'num_channels':1,'sample_width':2,'encoding':'linear_pcm','container':'wav'}}).encode()
    for a in range(4):
        try:
            r=urllib.request.urlopen(urllib.request.Request('https://api.vachana.ai/api/v1/tts/inference',data=body,headers={'X-API-Key-ID':key,'Content-Type':'application/json','User-Agent':'nyayamitra/1.0 httpx'}),timeout=60)
            open(p,'wb').write(r.read()); break
        except urllib.error.HTTPError as e:
            print(id_,e.code,e.read()[:200]); time.sleep(3)
    else: sys.exit('failed '+id_)
    w=wave.open(p); print(id_,v,round(w.getnframes()/w.getframerate(),2)); time.sleep(.3)
tot=0
tl=[]
for id_,sc,v,lang,text,cap,gap in LINES:
    w=wave.open(f'public/voice/{id_}.wav'); d=w.getnframes()/w.getframerate()
    tl.append({'id':id_,'scene':sc,'voice':v,'caption':cap,'start':round(tot,3),'dur':round(d,3)}); tot+=d+gap
json.dump({'total':round(tot,3),'lines':tl},open('public/timeline.json','w'),ensure_ascii=False,indent=0)
print('total',round(tot,1))
