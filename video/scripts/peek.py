# Contact sheet of a live recording: python3 scripts/peek.py sahay out.png sec sec ...  (0 = first frame); no secs = around events
import json,sys
from PIL import Image,ImageDraw
c=sys.argv[1]; idx=json.load(open(f'public/rec/{c}/index.json')); fr=idx['frames']; t0=fr[0]['t']
print('dur',round((fr[-1]['t']-t0)/1000,1))
for e in idx['events']: print(round((e['t']-t0)/1000,1),e['name'],e.get('id',''),end=' ; ')
print()
for s in idx['sounds']: print(round((s['t']-t0)/1000,1),s['kind'],round(s['dur'],1),end=' ; ')
print()
secs=[float(x) for x in sys.argv[3:]]
W,H=640,360; n=len(secs); cols=3; S=Image.new('RGB',(W*cols,H*((n+2)//3)))
for i,s in enumerate(secs):
    f=min(fr,key=lambda x:abs(x['t']-t0-s*1000)); m=Image.open(f"public/rec/{c}/f/{f['n']}").resize((W,H)); d=ImageDraw.Draw(m); d.rectangle((0,0,44,14),fill='yellow'); d.text((2,1),str(s),fill='black'); S.paste(m,((i%cols)*W,(i//cols)*H))
S.save(sys.argv[2])
