# Prisma listens back to every Timbre line, so wrong readings show up as text.
import json,subprocess,sys
sys.path.insert(0,'scripts'); from lines import LINES
key=[l.split('=',1)[1].strip() for l in open('../server/.env') if l.startswith('GNANI_API_KEY=')][0]
for id_,sc,v,lang,*_ in LINES:
    r=subprocess.run(['curl','-s','-m','40','-A','nyayamitra/1.0','-H',f'X-API-Key-ID: {key}','-F','model=prisma-v3.0','-F',f'language_code={lang}','-F','format=transcribe','-F',f'audio_file=@public/vo/{id_}.wav','https://api.vachana.ai/stt/v3'],capture_output=True,text=True).stdout
    try: j=json.loads(r); print(id_,'->',j.get('transcript') or j.get('text') or str(j)[:160])
    except Exception: print(id_,'??',r[:160])
