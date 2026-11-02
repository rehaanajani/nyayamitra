# Whoosh and pop are built from filtered noise. Page, thud and shutter are public-domain recordings
# from Wikimedia Commons; music is Scott Buckley, "The Long Dark" (CC BY 3.0).
import wave,numpy as np
SR=48000
def write(p,x):
    x=x/np.abs(x).max()*0.9; w=wave.open(p,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
def read(p):
    w=wave.open(p); x=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(float)/32768; return x.reshape(-1,w.getnchannels()).mean(1)
rng=np.random.default_rng(7)
def sweep(d,f0,f1,shape):
    n=int(d*SR); t=np.arange(n)/SR; x=rng.standard_normal(n); y=np.zeros(n); lo=0; bp=0
    fc=f0+(f1-f0)*np.sin(np.pi*t/d)**2
    for i in range(n):
        g=2*np.sin(np.pi*min(fc[i],SR/7)/SR); hi=x[i]-lo-0.5*bp; bp+=g*hi; lo+=g*bp; y[i]=bp
    return y*shape(t/d)
write('public/sfx/whoosh.wav',sweep(.55,350,3600,lambda u:np.sin(np.pi*u**.75)**2))
write('public/sfx/whoosh-soft.wav',sweep(.38,300,1900,lambda u:np.sin(np.pi*u**.8)**2))
t=np.arange(int(.11*SR))/SR; write('public/sfx/pop.wav',np.sin(2*np.pi*(900-3800*t)*t)*np.exp(-t*48))
# gavel: the recorded thud plus a short wooden knock
th=read('public/sfx/thud.wav'); t=np.arange(len(th))/SR
kn=(np.sin(2*np.pi*520*t)+.6*np.sin(2*np.pi*1270*t))*np.exp(-t*42); write('public/sfx/gavel.wav',th/np.abs(th).max()+.55*kn)
m=read('public/sfx/music.wav'); fr=SR*5; e=[np.sqrt((m[i:i+fr]**2).mean()) for i in range(0,len(m)-fr,fr)]
print('music rms per 5s (dB):',[int(20*np.log10(v+1e-6)) for v in e][:44])
