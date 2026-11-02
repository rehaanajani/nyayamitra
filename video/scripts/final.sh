#!/bin/zsh
# Renders one film to a temp file, decodes every frame and the audio, and only then moves it into place.
comp=$1; name=$2; T=out/chk/$name-tmp.mp4
npx remotion render src/index.jsx $comp $T --codec=h264 --crf=19 --audio-bitrate=256k --concurrency=6 2>&1 | tail -1 | cut -c1-100
rm -rf out/chk/all; mkdir -p out/chk/all
npx remotion ffmpeg -hide_banner -v error -y -i $T -map 0:v -vf scale=32:18 out/chk/all/%05d.png 2>&1 | grep -v 'exited with' | head -3
npx remotion ffmpeg -hide_banner -v error -y -i $T -map 0:a -ac 1 -ar 8000 out/chk/a.wav 2>&1 | grep -v 'exited with' | head -3
python3 - "$name" <<'P'
import os,sys,wave,numpy as np
w=wave.open('out/chk/a.wav'); x=np.frombuffer(w.readframes(w.getnframes()),'<i2')/32768
v=[20*np.log10(np.sqrt((x[i:i+8000]**2).mean())+1e-6) for i in range(0,len(x)-8000,8000)]
print(sys.argv[1],'frames',len(os.listdir('out/chk/all')),'seconds',round(len(x)/8000,1),'peak',round(abs(x).max(),2),'rms',round(20*np.log10(np.sqrt((x**2).mean())),1),'quiet secs',[i for i,d in enumerate(v) if d<-40])
P
npx remotion ffmpeg -hide_banner -v error -y -i $T -c copy -movflags +faststart out/$name.mp4 2>&1 | grep -v 'exited with'
rm -rf out/chk/all out/chk/a.wav $T; ls -la out/$name.mp4
