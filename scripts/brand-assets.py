"""Rasterize the Ritmo geometric mark for PWA/native icons (Pillow, build-time only).
The paths match dist/assets/icons/ritmo-mark.svg. No runtime dependency.
"""
from pathlib import Path
from PIL import Image,ImageDraw

root=Path(__file__).resolve().parents[1]
def cubic(a,b,c,d):
    return [tuple((1-t)**3*a[i]+3*(1-t)**2*t*b[i]+3*(1-t)*t*t*c[i]+t**3*d[i] for i in range(2)) for t in [n/100 for n in range(101)]]
paths=[[(33,112),(33,92)]+cubic((33,92),(33,56.65),(61.65,28),(97,28))+[(110,28)],[(68,110),(68,94)]+cubic((68,94),(68,77.43),(81.43,64),(98,64))+[(103,64)]]
def icon(size,scale=.86,background='#14201e'):
    out=Image.new('RGB',(size*4,size*4),background);d=ImageDraw.Draw(out)
    factor=size*4/144
    point=lambda p:((72+(p[0]-72)*scale)*factor,(72+(p[1]-72)*scale)*factor)
    width=22*scale*factor
    for path in paths:
        pts=[point(p) for p in path]
        d.line(pts,fill='#a7edc5',width=round(width),joint='curve')
        for x,y in pts:d.ellipse((x-width/2,y-width/2,x+width/2,y+width/2),fill='#a7edc5')
    return out.resize((size,size),Image.Resampling.LANCZOS)
for name,size,scale in [('icon-192.png',192,.86),('icon-512.png',512,.86),('maskable-512.png',512,.72),('ritmo-192.png',192,.86),('ritmo-512.png',512,.86),('ritmo-maskable-512.png',512,.72),('apple-touch-icon.png',180,.86)]:
    icon(size,scale).save(root/'dist/assets/icons'/name)
for p in (root/'android/app/src/main/res').glob('mipmap-*/*.png'):
    size=Image.open(p).width;icon(size,.72 if 'foreground' in p.name else .86).save(p)
for p in (root/'ios/App/App/Assets.xcassets/AppIcon.appiconset').glob('*.png'):
    icon(Image.open(p).width).save(p)
splashes=list((root/'android/app/src/main/res').glob('drawable*/splash.png'))+list((root/'ios/App/App/Assets.xcassets/Splash.imageset').glob('*.png'))
for p in splashes:
    width,height=Image.open(p).size
    canvas=Image.new('RGB',(width,height),'#11191c')
    mark=icon(max(48,round(min(width,height)*.18)),background='#11191c')
    canvas.paste(mark,((width-mark.width)//2,(height-mark.height)//2));canvas.save(p)
print('Ritmo: iconos y pantallas de inicio generados.')
