"""Synthesize original, offline-friendly music and sound effects (no downloads)."""
import math,wave,struct
from pathlib import Path
RATE=22050
OUT=Path('public/audio')
def write(name,samples):
    peak=max(max(map(abs,samples)),1)
    with wave.open(str(OUT/(name+'.wav')),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE)
        f.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,x/peak*.8))*32767)) for x in samples))
def note(buf,at,duration,midi,volume=.15,kind='bell'):
    hz=440*2**((midi-69)/12)
    for j in range(int(duration*RATE)):
        i=int(at*RATE)+j
        if i>=len(buf):break
        t=j/RATE
        env=min(t/.012,1)*math.exp(-t*(5 if kind=='bell' else 2))*min(1,(duration-t)/.045)
        value=math.sin(2*math.pi*hz*t)+(.22*math.sin(2*math.pi*hz*2*t) if kind=='bell' else .08*math.sin(2*math.pi*hz*3*t))
        buf[i]+=value*env*volume
for name,melody,bass in [('menu',[69,72,76,72,71,74,77,74,69,72,76,79,77,74,71,68],[45,45,50,52]),('level',[69,76,72,76,67,74,71,74,65,72,69,72,64,71,68,71],[45,43,41,40])]:
    beat=.5;buf=[0.]*(RATE*16)
    for step in range(32):note(buf,step*beat,.48,melody[step%16],.13)
    for bar in range(8):
        root=bass[bar%4]
        note(buf,bar*2,1.6,root,.11,'soft')
        for k in range(4):note(buf,bar*2+k*.5,.45,root+12+[0,7,12,7][k],.045,'soft')
    write(name,buf)
for name,notes in {'click':[76],'step':[45],'read':[72,76,79],'wrong':[62,60],'correct':[72,76,79,84],'win':[72,76,79,84,79,84],'pause':[69,64]}.items():
    spacing=.105 if name!='step' else .06
    buf=[0.] * int(RATE*(len(notes)*spacing+.23))
    for i,n in enumerate(notes):note(buf,i*spacing,.2,n,.12)
    write(name,buf)
print('Created two 16-second music loops and seven sound effects.')
