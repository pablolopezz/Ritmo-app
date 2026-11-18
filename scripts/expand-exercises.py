"""Curated strength variations. Stable IDs preserve existing routines and history."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'dist/data/exercises.json'; old=json.loads(p.read_text())
groups={
'Pecho':{
'Barra':['Press de banca agarre medio','Press de banca con pausa','Press declinado con barra','Press inclinado con barra','Press de suelo con barra','Press de banca agarre ancho'],
'Mancuernas':['Press de banca con mancuernas','Press declinado con mancuernas','Press de suelo con mancuernas','Press con agarre neutro','Aperturas con mancuernas','Aperturas inclinadas','Press inclinado agarre neutro'],
'Polea':['Cruce de poleas altas','Cruce de poleas bajas','Press de pecho en polea','Aperturas unilaterales en polea'],
'Máquina':['Press de pecho en máquina','Press inclinado en máquina','Aperturas en peck deck','Press de pecho convergente'],
'Peso corporal':['Flexiones inclinadas','Flexiones con rodillas apoyadas','Flexiones declinadas','Flexiones con pausa','Flexiones con agarre ancho','Fondos con inclinación de torso'],
'Banda elástica':['Press de pecho con banda','Aperturas con banda']},
'Espalda':{
'Barra':['Peso muerto convencional','Remo Pendlay','Remo con agarre supino','Remo landmine','Remo Meadows'],
'Mancuernas':['Remo a una mano','Remo con pecho apoyado','Remo inclinado con mancuernas','Pullover con mancuerna','Remo con agarre neutro'],
'Polea':['Jalón agarre neutro','Jalón agarre supino','Jalón unilateral','Jalón con brazos rectos','Remo unilateral en polea','Remo alto en polea','Remo sentado agarre ancho','Pullover en polea'],
'Máquina':['Remo en máquina con pecho apoyado','Jalón en máquina','Remo alto en máquina','Pullover en máquina','Dominadas asistidas'],
'Barra de dominadas':['Dominadas supinas','Dominadas neutras','Dominadas con lastre','Dominadas escapulares'],
'Peso corporal':['Remo invertido','Remo invertido supino'],
'Banda elástica':['Remo con banda','Jalón con banda']},
'Hombros':{
'Barra':['Press militar sentado','Press landmine unilateral','Press militar con pausa'],
'Mancuernas':['Press de hombros sentado','Press Arnold','Press de hombros agarre neutro','Elevaciones frontales','Elevaciones laterales sentado','Elevaciones laterales inclinado','Pájaros con pecho apoyado'],
'Polea':['Elevación lateral unilateral en polea','Elevación frontal en polea','Pájaros en polea','Face pull','Elevación lateral tras el cuerpo en polea'],
'Máquina':['Press de hombros en máquina','Elevación lateral en máquina','Aperturas inversas en máquina'],
'Peso corporal':['Flexiones pica','Deslizamientos escapulares en pared'],
'Banda elástica':['Aperturas de banda','Rotación externa con banda','Elevaciones laterales con banda']},
'Cuádriceps':{
'Barra':['Sentadilla frontal','Sentadilla con pausa','Sentadilla a cajón','Sentadilla con talones elevados','Sentadilla Zercher','Zancada atrás con barra','Sentadilla dividida con barra'],
'Mancuernas':['Sentadilla goblet','Sentadilla búlgara','Zancadas caminando','Zancadas inversas','Subida a cajón','Sentadilla con mancuernas','Sentadilla dividida con mancuernas'],
'Máquina':['Sentadilla hack','Sentadilla en multipower','Prensa unilateral','Prensa horizontal','Extensión unilateral de cuádriceps','Sentadilla pendular','Sentadilla con cinturón'],
'Peso corporal':['Sentadilla al aire','Zancada sin carga','Sentadilla dividida sin carga','Subida a escalón sin carga','Sentarse y levantarse de banco'],
'Kettlebell':['Sentadilla goblet con kettlebell','Sentadilla frontal con dos kettlebells']},
'Isquios':{
'Barra':['Peso muerto con piernas semirrígidas','Buenos días con barra','Peso muerto rumano con pausa'],
'Mancuernas':['Peso muerto rumano con mancuernas','Peso muerto rumano a una pierna','Peso muerto rumano en posición B'],
'Máquina':['Curl femoral sentado','Curl femoral tumbado','Curl femoral de pie','Curl femoral unilateral','Peso muerto rumano en multipower'],
'Peso corporal':['Curl nórdico asistido','Curl femoral deslizante','Curl femoral con fitball','Caminata de talones desde puente'],
'Polea':['Peso muerto rumano en polea'],
'Banda elástica':['Curl femoral con banda']},
'Glúteos':{
'Barra':['Puente de glúteos con barra','Hip thrust con pausa','Peso muerto sumo'],
'Mancuernas':['Hip thrust con mancuerna','Peso muerto sumo con mancuerna','Zancada larga con mancuernas','Puente de glúteos con mancuerna'],
'Polea':['Patada de glúteo en polea','Pull through','Abducción de cadera en polea'],
'Máquina':['Hip thrust en máquina','Patada de glúteo en máquina','Hip thrust en multipower','Extensión de cadera en banco a 45 grados'],
'Peso corporal':['Puente de glúteos','Puente de glúteos unilateral','Hip thrust sin carga','Patada de glúteo en cuadrupedia','Abducción de cadera tumbado'],
'Banda elástica':['Abducción de cadera con banda','Puente de glúteos con banda','Caminata lateral con banda']},
'Bíceps':{
'Barra':['Curl con barra EZ','Curl con agarre inverso','Curl predicador con barra EZ','Curl araña con barra EZ'],
'Mancuernas':['Curl martillo','Curl inclinado','Curl concentrado','Curl alterno','Curl araña con mancuernas','Curl predicador unilateral','Curl martillo cruzado'],
'Polea':['Curl de bíceps en polea baja','Curl bayesiano','Curl martillo con cuerda','Curl de bíceps en polea alta','Curl unilateral en polea'],
'Máquina':['Curl de bíceps en máquina','Curl predicador en máquina'],
'Banda elástica':['Curl de bíceps con banda']},
'Tríceps':{
'Barra':['Press de banca agarre cerrado','Press francés con barra EZ','Extensión de tríceps sobre cabeza con barra EZ'],
'Mancuernas':['Extensión de tríceps sobre cabeza','Press francés con mancuernas','Patada de tríceps con mancuerna','Extensión unilateral sobre cabeza'],
'Polea':['Extensión de tríceps con cuerda','Extensión de tríceps con barra recta','Extensión sobre cabeza en polea','Extensión unilateral en polea','Extensión de tríceps agarre inverso'],
'Máquina':['Extensión de tríceps en máquina','Fondos en máquina','Fondos asistidos'],
'Peso corporal':['Flexiones con agarre cerrado','Fondos con torso vertical'],
'Banda elástica':['Extensión de tríceps con banda']},
'Gemelos':{
'Máquina':['Elevación de gemelos sentado','Elevación de gemelos de pie','Elevación de gemelos en prensa','Elevación unilateral en máquina','Elevación de gemelos en multipower'],
'Mancuernas':['Elevación de gemelos con mancuernas','Elevación unilateral de gemelo con mancuerna'],
'Peso corporal':['Elevación de gemelos en escalón','Elevación unilateral de gemelo','Elevación de tibial anterior en pared']},
'Core':{
'Polea':['Crunch en polea','Crunch oblicuo en polea','Rotación de tronco en polea','Press Pallof dinámico'],
'Peso corporal':['Crunch en suelo','Crunch inverso','Dead bug','Bird dog','Elevación de rodillas colgado','Crunch bicicleta','Toques de talón','Elevación de rodillas en paralelas','Encogimiento de rodillas sentado','Crunch con piernas elevadas'],
'Rueda abdominal':['Despliegue de rueda de rodillas'],
'Máquina':['Crunch abdominal sentado','Rotación de tronco en máquina'],
'Banda elástica':['Press Pallof con banda','Crunch con banda']},
'Antebrazos':{'Mancuernas':['Curl de muñeca','Extensión de muñeca','Pronación y supinación con mancuerna'],'Barra':['Curl de muñeca con barra','Extensión de muñeca con barra'],'Polea':['Curl de muñeca en polea']},
'Aductores':{'Máquina':['Aducción de cadera en máquina'],'Polea':['Aducción de cadera en polea'],'Peso corporal':['Aducción de cadera tumbado'],'Banda elástica':['Aducción de cadera con banda']},
'Trapecio':{'Barra':['Encogimiento de hombros con barra'],'Mancuernas':['Encogimiento con mancuernas','Elevación Y con pecho apoyado'],'Polea':['Encogimiento en polea'],'Máquina':['Encogimiento en máquina']}
}
cues={
'Pecho':['Apoya bien el cuerpo y mantén las muñecas alineadas.','Controla la bajada y empuja sin rebotes ni dolor en el hombro.'],
'Espalda':['Mantén el tronco estable y el cuello alineado.','Guía el movimiento con los codos y controla el regreso sin tirones.'],
'Hombros':['Mantén las costillas controladas y evita arquear la zona lumbar.','Mueve la carga de forma controlada dentro de un recorrido cómodo.'],
'Cuádriceps':['Apoya toda la planta del pie y acompaña la dirección de los pies con las rodillas.','Baja con control hasta donde puedas mantener una posición estable.'],
'Isquios':['Mantén el tronco estable y evita compensar con la zona lumbar.','Controla la fase de estiramiento y usa una carga que puedas frenar.'],
'Glúteos':['Mantén la pelvis estable y el abdomen activo.','Extiende la cadera sin terminar arqueando la espalda.'],
'Bíceps':['Mantén los brazos estables y evita balancear el tronco.','Flexiona el codo y baja la carga lentamente.'],
'Tríceps':['Mantén estable el brazo y las muñecas alineadas.','Extiende el codo con control, sin impulsos ni dolor.'],
'Gemelos':['Mantén el apoyo estable y utiliza un recorrido cómodo del tobillo.','Sube y baja despacio; evita rebotar.'],
'Core':['Respira durante el esfuerzo y conserva el control del tronco.','Acorta el recorrido si pierdes la posición o notas dolor lumbar.'],
'Antebrazos':['Apoya el antebrazo y utiliza una carga ligera.','Mueve la muñeca con control, sin forzar el final del recorrido.'],
'Aductores':['Mantén la pelvis estable y evita girar el tronco.','Acerca la pierna con control y sin rebotes.'],
'Trapecio':['Mantén el cuello en posición neutra.','Controla el movimiento de las escápulas y evita tirones.']}
# Keep original e1..e26 intact; only enrich them with optional local guidance.
for e in old:e.setdefault('instructions',cues[e['group']])
names={(e['name'].casefold(),e['equipment']) for e in old}
for group,equipment in groups.items():
 for eq,nameset in equipment.items():
  for name in nameset:
   if (name.casefold(),eq) in names:continue
   e={'id':f'ex-{len(old)+1:03d}','name':name,'group':group,'equipment':eq,'instructions':cues[group]}
   old.append(e);names.add((name.casefold(),eq))
p.write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n')
print(f'{len(old)} ejercicios de fuerza; identificadores originales conservados.')
