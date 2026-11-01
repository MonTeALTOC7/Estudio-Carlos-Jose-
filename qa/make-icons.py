#!/usr/bin/env python3
"""Genera la identidad de instalación (íconos) a partir de la fotografía auténtica de Carlos José con su cubo.
Uso:  python3 qa/make-icons.py [--fuente=ruta/foto_original.webp]   (la fuente solo hace falta para regenerar qa/brand/carlos-cubo.webp)
Entradas versionadas: qa/brand/carlos-cubo.webp (recorte limpio, sin rótulos ni adornos del diseño publicitario).
Salidas (raíz del proyecto): icon-192/512.png (any), icon-maskable-192/512.png, apple-touch-icon.png, favicon-32/48.png, logo-128.png
y las variantes del canal de prueba icon-prueba-*.png (con distintivo PRUEBA, solo para Cloudflare).
Sin IA generativa: solo recorte, limpieza de adornos finos y composición; no se deforma el rostro."""
import sys,os,math
import numpy as np
from PIL import Image,ImageDraw,ImageFilter,ImageFont
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
BRAND=os.path.join(ROOT,'qa','brand','carlos-cubo.webp')
src=[a.split('=',1)[1] for a in sys.argv[1:] if a.startswith('--fuente=')]

def inpaint(img,mask,iters=400):
    a=np.asarray(img,dtype=np.float32).copy();m=mask.astype(bool)
    for c in range(3):
        ch=a[:,:,c];ch[m]=ch[~m].mean()
    for _ in range(iters):
        for c in range(3):
            ch=a[:,:,c];p=np.pad(ch,1,mode='edge');avg=(p[:-2,1:-1]+p[2:,1:-1]+p[1:-1,:-2]+p[1:-1,2:])/4;ch[m]=avg[m]
    return Image.fromarray(np.clip(a,0,255).astype(np.uint8))

if src:
    im=Image.open(src[0]).convert('RGB')
    # 1) quitar trazos finos blancos (flecha y arcos del diseño) dentro del recorte
    arr=np.asarray(im).astype(int);H,W=arr.shape[:2];mask=np.zeros((H,W),bool)
    for (x0,y0,x1,y1) in [(290,45,395,135),(268,140,362,196)]:
        sub=arr[y0:y1,x0:x1];white=(sub.min(axis=2)>205)
        mask[y0:y1,x0:x1]|=white
    mk=Image.fromarray((mask*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))
    im=inpaint(im,np.asarray(mk)>0)
    # 2) recorte cuadrado de 600 px: x 150-750, y 0-600 (cara + cubo; deja fuera rótulos, estrella y caja)
    crop=im.crop((150,0,750,600));os.makedirs(os.path.dirname(BRAND),exist_ok=True);crop.save(BRAND,quality=93,method=6)
    print('recorte limpio →',BRAND)
photo=Image.open(BRAND).convert('RGB')                     # 600×600; el círculo inscrito (centro 300,300 · radio 300) es el medallón

S=1024
def gradient(size,round_px=0):
    g=np.zeros((size,size,3),np.float32);stops=[(0,(59,63,134)),(.55,(228,87,63)),(1,(245,177,61))]
    for y in range(size):
        t=y/(size-1)
        for i in range(len(stops)-1):
            if stops[i][0]<=t<=stops[i+1][0]:
                u=(t-stops[i][0])/(stops[i+1][0]-stops[i][0]);c=[stops[i][1][k]*(1-u)+stops[i+1][1][k]*u for k in range(3)];g[y,:]=c;break
    im=Image.fromarray(g.astype(np.uint8)).convert('RGBA')
    if round_px:
        m=Image.new('L',(size,size),0);ImageDraw.Draw(m).rounded_rectangle((0,0,size-1,size-1),round_px,fill=255);im.putalpha(m)
    return im
def medallion(canvas,diam,center=None,crop=None,ring=0.022,shadow=True):
    """Pega la foto recortada en círculo con aro blanco. crop=(cx,cy,r) en coordenadas del recorte 600×600."""
    cx,cy,r=crop or (300,300,300);box=photo.crop((cx-r,cy-r,cx+r,cy+r))
    # el recorte puede salirse del cuadrado: lo cubrimos replicando el borde (solo ocurre en variantes de favicon)
    d=int(diam);ph=box.resize((d,d),Image.LANCZOS).convert('RGBA')
    m=Image.new('L',(d*4,d*4),0);ImageDraw.Draw(m).ellipse((0,0,d*4-1,d*4-1),fill=255);m=m.resize((d,d),Image.LANCZOS);ph.putalpha(m)
    w,h=canvas.size;px=int((w-d)/2) if center is None else int(center[0]-d/2);py=int((h-d)/2) if center is None else int(center[1]-d/2)
    rw=int(d*ring)+1
    if shadow:
        sh=Image.new('RGBA',canvas.size,(0,0,0,0));ImageDraw.Draw(sh).ellipse((px-rw,py-rw+int(d*.02),px+d+rw,py+d+rw+int(d*.02)),fill=(15,20,50,120));canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(d*.025)))
    ringim=Image.new('RGBA',canvas.size,(0,0,0,0));ImageDraw.Draw(ringim).ellipse((px-rw,py-rw,px+d+rw,py+d+rw),fill=(255,255,255,255));canvas.alpha_composite(ringim)
    canvas.alpha_composite(ph,(px,py));return canvas
def pill(canvas,text='PRUEBA',cy=0.80):
    w,h=canvas.size;f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',int(h*0.082));d=ImageDraw.Draw(canvas)
    tw=d.textlength(text,font=f);pw,ph=tw+h*0.07,h*0.12;x0=(w-pw)/2;y0=h*cy-ph/2
    d.rounded_rectangle((x0,y0,x0+pw,y0+ph),ph/2,fill=(176,28,22,255),outline=(255,255,255,255),width=int(h*0.01))
    d.text((w/2,y0+ph/2),text,font=f,fill=(255,255,255,255),anchor='mm');return canvas
def make_any(test=False):                                   # esquinas redondeadas; medallón grande
    c=gradient(S,int(S*.22));medallion(c,S*.80);return pill(c) if test else c
def make_maskable(test=False):                              # sin esquinas: lo recorta el sistema; contenido dentro de la zona segura (círculo de 80 %)
    c=gradient(S);medallion(c,S*.745);return pill(c,cy=0.805) if test else c
def save(im,name,size,flatten=False):
    o=im.resize((size,size),Image.LANCZOS)
    if flatten:
        bg=Image.new('RGB',o.size,(59,63,134));bg.paste(o,mask=o.split()[3]);o=bg
    o.save(os.path.join(ROOT,name),optimize=True);print(name,size)
for test in (False,True):
    pre='icon-prueba-' if test else 'icon-'
    a=make_any(test);m=make_maskable(test)
    save(a,pre+'192.png',192);save(a,pre+'512.png',512)
    save(m,pre.replace('icon-','icon-')+'maskable-192.png',192);save(m,pre+'maskable-512.png',512)
mm=make_maskable(False);save(mm,'apple-touch-icon.png',180,flatten=True)
save(make_maskable(True),'apple-touch-icon-prueba.png',180,flatten=True)
# favicon: cara con una esquina del cubo, más cerca para que se reconozca a 32-48 px
for sz in (48,32):
    c=Image.new('RGBA',(S,S),(0,0,0,0));medallion(c,S*.92,crop=(260,250,250),ring=0.04,shadow=False);save(c,'favicon-%d.png'%sz,sz)
# logo de cabecera (medallón con aro, fondo transparente)
c=Image.new('RGBA',(S,S),(0,0,0,0));medallion(c,S*.94,ring=0.03,shadow=False);save(c,'logo-128.png',128)
