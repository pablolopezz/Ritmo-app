"""Additional named strength variations; preserve seed IDs and skip duplicates."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'dist/data/exercises.json'
exercises=json.loads(p.read_text())
# These movements are registered by load/repetitions, not invented cardio metrics.
variations={
'Pecho':{
'Mancuernas':['Press de banca alterno con mancuernas','Press de banca unilateral con mancuerna','Press inclinado unilateral con mancuerna','Press de suelo unilateral con mancuerna','Press de banca con mancuernas y pausa','Press inclinado con mancuernas y pausa','Press squeeze con mancuernas','Aperturas en suelo con mancuernas','Aperturas declinadas con mancuernas'],
'Barra':['Press de banca Spoto','Press de banca desde soportes','Press de banca con tempo','Press de banca Larsen','Press inclinado con pausa'],
'Máquina':['Press de banca en multipower','Press inclinado en multipower','Press declinado en multipower','Press unilateral en máquina','Aperturas unilaterales en peck deck'],
'Polea':['Press unilateral de pecho en polea','Press inclinado en polea','Press declinado en polea','Cruce de poleas a media altura','Aperturas en banco con poleas'],
'Peso corporal':['Flexiones sobre asas','Flexiones en anillas','Flexiones con manos elevadas en banco','Flexiones arquero','Flexiones con lastre','Fondos en anillas','Flexiones escapulares'],
'Banda elástica':['Flexiones con banda','Press unilateral de pecho con banda']},
'Espalda':{
'Mancuernas':['Remo unilateral con pecho apoyado','Remo con mancuernas agarre supino','Remo con mancuernas a dos apoyos','Remo con codos abiertos y mancuernas','Remo renegado alterno'],
'Barra':['Remo con barra y pausa','Remo landmine con agarre estrecho','Remo landmine con apoyo de pecho','Remo con barra desde bloques','Peso muerto desde bloques','Peso muerto con pausa bajo la rodilla','Peso muerto con barra hexagonal'],
'Máquina':['Remo unilateral en máquina','Remo en máquina agarre supino','Remo en máquina agarre neutro','Jalón unilateral en máquina','Remo en multipower','Dominadas supinas asistidas','Dominadas neutras asistidas'],
'Polea':['Remo en polea baja agarre supino','Remo en polea baja con cuerda','Remo en polea de pie','Remo arrodillado en polea','Jalón al pecho agarre estrecho','Jalón al pecho agarre ancho','Jalón con cuerda arrodillado','Pullover unilateral en polea','Remo diagonal en polea'],
'Barra de dominadas':['Dominadas con pausa','Dominadas con agarre mixto','Dominadas con toalla','Dominadas excéntricas','Dominadas supinas con lastre'],
'Anillas':['Remo en anillas','Remo supino en anillas','Dominadas en anillas'],
'Banda elástica':['Jalón unilateral con banda','Pullover con banda','Remo unilateral con banda']},
'Hombros':{
'Mancuernas':['Press de hombros de pie con mancuernas','Press unilateral de hombros con mancuerna','Press Z con mancuernas','Elevación lateral unilateral con mancuerna','Elevación lateral tumbado de lado','Elevación frontal con agarre neutro','Elevación frontal alterna','Pájaros sentado','Rotación externa tumbado con mancuerna','Elevación Y con mancuernas'],
'Barra':['Press Z con barra','Press landmine a dos manos','Press landmine de rodillas','Press militar agarre cerrado'],
'Polea':['Elevación lateral en polea con apoyo','Elevación lateral bilateral en polea','Elevación lateral en polea a media altura','Rotación externa en polea','Elevación Y en polea','Face pull unilateral','Press de hombros en polea'],
'Máquina':['Press de hombros en multipower','Press unilateral de hombros en máquina','Aperturas inversas unilaterales en máquina'],
'Banda elástica':['Press de hombros con banda','Elevaciones frontales con banda','Face pull con banda','Rotación externa bilateral con banda'],
'Kettlebell':['Press de hombros con kettlebell','Press unilateral con kettlebell arrodillado'],
'Peso corporal':['Flexiones pica con pies elevados','Flexiones de hombros con apoyo en pared']},
'Cuádriceps':{
'Mancuernas':['Sentadilla búlgara con pie delantero elevado','Sentadilla dividida con talón elevado','Zancada lateral con mancuernas','Zancada hacia delante con mancuernas','Subida lateral a cajón con mancuernas','Sentadilla ciclista con mancuerna','Sentadilla goblet a cajón','Sentadilla goblet con pausa'],
'Barra':['Sentadilla high bar','Sentadilla low bar','Sentadilla frontal con pausa','Sentadilla con barra de seguridad','Sentadilla a cajón con barra de seguridad','Zancadas caminando con barra','Sentadilla dividida con pie delantero elevado'],
'Máquina':['Sentadilla frontal en multipower','Sentadilla búlgara en multipower','Zancada inversa en multipower','Sentadilla dividida en multipower','Prensa a 45 grados','Prensa con pies bajos','Extensión de cuádriceps con pausa','Sentadilla sissy asistida en máquina'],
'Peso corporal':['Sentadilla a una pierna asistida','Sentadilla pistol a banco','Sentadilla skater asistida','Bajada controlada de escalón','Zancada lateral sin carga','Sentadilla con pausa sin carga'],
'Kettlebell':['Zancada inversa con kettlebell','Sentadilla con kettlebell en posición de maleta'],
'Suspensión':['Sentadilla asistida en suspensión','Sentadilla a una pierna en suspensión']},
'Isquios':{
'Barra':['Peso muerto rumano agarre ancho','Peso muerto rumano desde soportes','Buenos días con barra de seguridad','Buenos días sentado con barra'],
'Mancuernas':['Peso muerto rumano con mancuernas y pausa','Peso muerto rumano unilateral con apoyo'],
'Máquina':['Curl femoral sentado unilateral','Curl femoral tumbado unilateral','Curl femoral sentado con pausa','Curl femoral tumbado con pausa','Peso muerto rumano en máquina'],
'Polea':['Curl femoral de pie en polea','Curl femoral tumbado en polea','Peso muerto rumano unilateral en polea'],
'Peso corporal':['Curl nórdico excéntrico','Curl femoral deslizante unilateral','Curl femoral con fitball unilateral','Extensión de cadera en banco horizontal'],
'Suspensión':['Curl femoral en suspensión'],
'Banda elástica':['Buenos días con banda','Peso muerto rumano con banda']},
'Glúteos':{
'Barra':['Hip thrust unilateral con barra','Hip thrust en posición B','Puente de glúteos con pausa y barra','Peso muerto sumo desde bloques'],
'Mancuernas':['Hip thrust unilateral con mancuerna','Hip thrust en posición B con mancuerna','Peso muerto sumo con dos mancuernas','Subida a cajón alto con mancuernas'],
'Máquina':['Abducción unilateral en máquina','Hip thrust unilateral en máquina','Patada de glúteo unilateral en multipower'],
'Polea':['Patada diagonal de glúteo en polea','Extensión de cadera de pie en polea','Abducción de cadera de pie en polea','Abducción sentada en polea'],
'Peso corporal':['Hip thrust unilateral sin carga','Puente de glúteos con talones elevados','Puente de glúteos en posición B','Abducción de cadera en cuadrupedia','Clamshell sin banda'],
'Banda elástica':['Clamshell con banda','Patada de glúteo con banda','Abducción sentada con banda','Hip thrust con banda']},
'Bíceps':{
'Mancuernas':['Curl de bíceps sentado','Curl de bíceps supino bilateral','Curl Zottman','Curl martillo sentado','Curl inclinado alterno','Curl con pecho apoyado','Curl de concentración de pie'],
'Barra':['Curl estricto contra pared','Curl con barra agarre estrecho','Curl con barra agarre ancho','Curl predicador con barra recta','Curl de arrastre con barra'],
'Polea':['Curl de bíceps con barra EZ en polea','Curl predicador en polea','Curl tumbado en polea baja','Curl de arrastre en polea','Curl de bíceps en polea tras el cuerpo','Curl inverso en polea','Curl con cuerda a una mano'],
'Máquina':['Curl unilateral en máquina','Curl en máquina con agarre neutro'],
'Anillas':['Curl de bíceps en anillas'],
'Suspensión':['Curl de bíceps en suspensión'],
'Banda elástica':['Curl martillo con banda','Curl inverso con banda']},
'Tríceps':{
'Mancuernas':['Extensión de tríceps tumbado en suelo','Press Tate con mancuernas','Press cerrado con mancuernas','Extensión sobre cabeza sentado con mancuerna'],
'Barra':['Press cerrado con pausa','Press francés con barra recta en banco inclinado','Press francés con barra EZ en banco inclinado'],
'Polea':['Extensión sobre cabeza con cuerda','Extensión cruzada de tríceps en polea','Extensión unilateral agarre inverso en polea','Patada de tríceps en polea','Extensión de tríceps tumbado en polea','Extensión sobre cabeza unilateral en polea'],
'Máquina':['Press cerrado en multipower','Extensión unilateral de tríceps en máquina'],
'Anillas':['Extensión de tríceps en anillas'],
'Suspensión':['Extensión de tríceps en suspensión'],
'Banda elástica':['Extensión sobre cabeza con banda','Patada de tríceps con banda']},
'Gemelos':{
'Mancuernas':['Elevación de gemelos sentado con mancuernas','Elevación unilateral sentado con mancuerna'],
'Máquina':['Elevación unilateral de gemelo en prensa','Elevación de gemelos con pausa en máquina','Elevación de gemelos sentado unilateral'],
'Barra':['Elevación de gemelos con barra'],
'Peso corporal':['Elevación de gemelos con rodillas flexionadas','Elevación unilateral con rodilla flexionada','Elevación de tibial anterior contra pared unilateral'],
'Banda elástica':['Flexión plantar con banda','Dorsiflexión con banda']},
'Core':{
'Peso corporal':['Crunch con brazos extendidos','Crunch inverso en banco','Elevación de piernas tumbado','Elevación de rodillas sentado en banco','Dead bug con toque de talón','Bird dog con acercamiento de rodilla y codo','Toques de hombro en plancha','Encogimientos laterales tumbado','Rodillas al pecho en fitball'],
'Polea':['Crunch de rodillas con cuerda','Crunch unilateral en polea','Rotación diagonal de arriba abajo en polea','Rotación diagonal de abajo arriba en polea','Press Pallof arrodillado'],
'Mancuernas':['Crunch con mancuerna sobre el pecho','Flexión lateral con mancuerna','Rotación rusa con mancuerna'],
'Banda elástica':['Dead bug con banda','Rotación de tronco con banda'],
'Suspensión':['Encogimiento de rodillas en suspensión'],
'Rueda abdominal':['Despliegue de rueda con recorrido limitado']},
'Antebrazos':{
'Mancuernas':['Curl de muñeca unilateral','Extensión de muñeca unilateral','Desviación radial con mancuerna','Desviación cubital con mancuerna'],
'Barra':['Curl de muñeca tras la espalda con barra','Curl de dedos con barra'],
'Polea':['Extensión de muñeca en polea','Curl de muñeca unilateral en polea'],
'Banda elástica':['Extensión de dedos con banda','Flexión de muñeca con banda']},
'Aductores':{
'Polea':['Aducción de cadera con apoyo en polea'],
'Banda elástica':['Aducción de cadera tumbado con banda'],
'Peso corporal':['Aducción de cadera con pelota entre rodillas']},
'Trapecio':{
'Barra':['Encogimiento de hombros con barra hexagonal','Encogimiento de hombros con barra y pausa'],
'Mancuernas':['Encogimiento de hombros sentado con mancuernas','Encogimiento con pecho apoyado'],
'Polea':['Encogimiento unilateral en polea','Elevación Y unilateral en polea'],
'Máquina':['Encogimiento en multipower']}
}
existing={(e['name'].casefold(),e['equipment']) for e in exercises}
cues={e['group']:e.get('instructions',[]) for e in exercises}
added=0
for group,equipment in variations.items():
 for equipment_name,names in equipment.items():
  for name in names:
   key=(name.casefold(),equipment_name)
   if key in existing:continue
   exercises.append({'id':f'ex-{len(exercises)+1:03d}','name':name,'group':group,'equipment':equipment_name,'instructions':cues[group]})
   existing.add(key);added+=1
p.write_text(json.dumps(exercises,ensure_ascii=False,indent=2)+'\n')
print(f'{len(exercises)} ejercicios de fuerza: {added} variantes añadidas.')
