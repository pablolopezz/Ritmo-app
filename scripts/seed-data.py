"""Editable seed catalogue: approximate generic values per 100 g edible raw food.
Packaged foods are illustrative; replace with the values on your own labels.
"""
from pathlib import Path
import json

root=Path(__file__).resolve().parents[1]/'dist/data'
rows='''avena|Copos de avena|Cereales|389|16.9|66.3|6.9|gluten
arroz|Arroz blanco seco|Cereales|360|7|79|1| 
arroz-integral|Arroz integral seco|Cereales|367|7.5|76|2.8| 
pasta|Pasta de trigo seca|Cereales|353|12|72|1.5|gluten
pasta-integral|Pasta integral seca|Cereales|348|14|65|2.5|gluten
pan|Pan integral|Cereales|247|13|41|4.2|gluten
quinoa|Quinoa seca|Cereales|368|14|64|6| 
cuscus|Cuscús seco|Cereales|376|13|77|0.6|gluten
bulgur|Bulgur seco|Cereales|342|12|76|1.3|gluten
maiz|Maíz cocido escurrido|Cereales|96|3.4|19|1.5| 
tortitas-arroz|Tortitas de arroz|Cereales|387|8|81|3| 
harina|Harina de trigo|Cereales|364|10|76|1|gluten
trigo-sarraceno|Trigo sarraceno seco|Cereales|343|13|72|3.4| 
patata|Patata|Verduras|77|2|17|0.1| 
boniato|Boniato|Verduras|86|1.6|20|0.1| 
brocoli|Brócoli|Verduras|34|2.8|6.6|0.4| 
espinaca|Espinacas|Verduras|23|2.9|3.6|0.4| 
zanahoria|Zanahoria|Verduras|41|0.9|9.6|0.2| 
calabacin|Calabacín|Verduras|17|1.2|3.1|0.3| 
tomate|Tomate|Verduras|18|0.9|3.9|0.2| 
pimiento|Pimiento rojo|Verduras|31|1|6|0.3| 
cebolla|Cebolla|Verduras|40|1.1|9.3|0.1| 
ajo|Ajo|Verduras|149|6.4|33|0.5| 
lechuga|Lechuga|Verduras|15|1.4|2.9|0.2| 
pepino|Pepino|Verduras|15|0.7|3.6|0.1| 
berenjena|Berenjena|Verduras|25|1|6|0.2| 
coliflor|Coliflor|Verduras|25|1.9|5|0.3| 
judia-verde|Judías verdes|Verduras|31|1.8|7|0.1| 
champinon|Champiñones|Verduras|22|3.1|3.3|0.3| 
calabaza|Calabaza|Verduras|26|1|6.5|0.1| 
esparrago|Espárragos|Verduras|20|2.2|3.9|0.1| 
repollo|Repollo|Verduras|25|1.3|5.8|0.1| 
remolacha|Remolacha|Verduras|43|1.6|9.6|0.2| 
apio|Apio|Verduras|16|0.7|3|0.2|apio
guisante|Guisantes congelados|Verduras|81|5.4|14|0.4| 
platano|Plátano|Fruta|89|1.1|23|0.3| 
manzana|Manzana|Fruta|52|0.3|14|0.2| 
naranja|Naranja|Fruta|47|0.9|12|0.1| 
pera|Pera|Fruta|57|0.4|15|0.1| 
fresa|Fresas|Fruta|32|0.7|7.7|0.3| 
arandano|Arándanos|Fruta|57|0.7|14|0.3| 
kiwi|Kiwi|Fruta|61|1.1|15|0.5| 
melon|Melón|Fruta|34|0.8|8|0.2| 
sandia|Sandía|Fruta|30|0.6|7.6|0.2| 
uva|Uvas|Fruta|69|0.7|18|0.2| 
melocoton|Melocotón|Fruta|39|0.9|9.5|0.3| 
mango|Mango|Fruta|60|0.8|15|0.4| 
pina|Piña|Fruta|50|0.5|13|0.1| 
aguacate|Aguacate|Fruta|160|2|8.5|14.7| 
limon|Limón|Fruta|29|1.1|9|0.3| 
pollo|Pechuga de pollo|Carnes|110|23|0|1.5|carne
pavo|Pechuga de pavo|Carnes|104|24|0|1|carne
ternera|Ternera magra|Carnes|137|21|0|6|carne
cerdo|Lomo de cerdo|Carnes|143|21|0|6|carne
conejo|Conejo|Carnes|136|20|0|6|carne
salmon|Salmón|Pescados|208|20|0|13|pescado
merluza|Merluza|Pescados|82|18|0|1|pescado
atun|Atún al natural escurrido|Pescados|116|26|0|1|pescado
sardina|Sardinas frescas|Pescados|185|21|0|11|pescado
bacalao|Bacalao fresco|Pescados|82|18|0|0.7|pescado
gamba|Gambas peladas|Pescados|85|20|0|0.5|crustaceos
mejillon|Mejillones sin concha|Pescados|86|12|3.7|2.2|moluscos
huevo|Huevo entero sin cáscara|Huevos y lácteos|143|12.6|0.7|9.5|huevo
clara|Clara de huevo|Huevos y lácteos|52|11|0.7|0.2|huevo
leche|Leche semidesnatada|Huevos y lácteos|46|3.4|4.8|1.6|leche
yogur|Yogur natural|Huevos y lácteos|61|3.5|4.7|3.3|leche
skyr|Skyr natural|Huevos y lácteos|63|11|4|0.2|leche
queso-fresco|Queso fresco batido 0 %|Huevos y lácteos|46|8|4|0.2|leche
queso-cottage|Queso cottage|Huevos y lácteos|98|11|3.4|4.3|leche
mozzarella|Mozzarella|Huevos y lácteos|250|18|2|19|leche
parmesano|Queso parmesano|Huevos y lácteos|431|38|4|29|leche
lenteja|Lentejas cocidas escurridas|Legumbres|116|9|20|0.4| 
garbanzo|Garbanzos cocidos escurridos|Legumbres|164|8.9|27|2.6| 
alubia|Alubias cocidas escurridas|Legumbres|127|8.7|23|0.5| 
alubia-negra|Alubias negras cocidas escurridas|Legumbres|132|8.9|24|0.5| 
soja-texturizada|Soja texturizada seca|Legumbres|330|50|20|1.5|soja
tofu|Tofu firme|Legumbres|144|17|3|8|soja
tempeh|Tempeh|Legumbres|193|20|8|11|soja
edamame|Edamame desgranado|Legumbres|121|12|9|5|soja
bebida-soja|Bebida de soja sin azúcar|Alternativas vegetales|33|3.3|0.7|1.8|soja
yogur-soja|Yogur de soja natural|Alternativas vegetales|45|4|2|2.3|soja
bebida-avena|Bebida de avena|Alternativas vegetales|46|1|7|1.5|gluten
seitan|Seitán|Legumbres|140|25|8|2|gluten
aceite|Aceite de oliva virgen extra|Aceites y frutos secos|884|0|0|100| 
almendra|Almendras|Aceites y frutos secos|579|21|22|50|frutos-secos
nuez|Nueces|Aceites y frutos secos|654|15|14|65|frutos-secos
cacahuete|Cacahuetes|Aceites y frutos secos|567|26|16|49|cacahuete
crema-cacahuete|Crema de cacahuete 100 %|Aceites y frutos secos|588|25|20|50|cacahuete
anacardo|Anacardos|Aceites y frutos secos|553|18|30|44|frutos-secos
pistacho|Pistachos|Aceites y frutos secos|562|20|28|45|frutos-secos
chia|Semillas de chía|Aceites y frutos secos|486|17|42|31| 
lino|Semillas de lino|Aceites y frutos secos|534|18|29|42| 
sesamo|Semillas de sésamo|Aceites y frutos secos|573|18|23|50|sesamo
pipa|Pipas de calabaza peladas|Aceites y frutos secos|559|30|11|49| 
tahini|Tahini|Aceites y frutos secos|595|17|21|54|sesamo
aceituna|Aceitunas verdes escurridas|Aceites y frutos secos|145|1|3.8|15| 
cacao|Cacao puro|Despensa|228|20|58|14| 
chocolate|Chocolate negro 85 %|Despensa|600|10|19|52|leche
miel|Miel|Despensa|304|0.3|82|0|animal
pasas|Uvas pasas|Despensa|299|3.1|79|0.5| 
datil|Dátiles sin hueso|Despensa|282|2.5|75|0.4| 
tomate-triturado|Tomate triturado|Despensa|29|1.4|5|0.2| 
hummus|Hummus|Legumbres|166|8|14|10|sesamo
mostaza|Mostaza|Despensa|66|4|6|4|mostaza
sal|Sal yodada|Despensa|0|0|0|0| 
agua|Agua|Despensa|0|0|0|0| '''
foods=[]
for row in rows.splitlines():
    id,name,section,kcal,protein,carbs,fat,tags=row.split('|')
    allergens=tags.strip().split(',') if tags.strip() else []
    vegan=section not in ['Carnes','Pescados','Huevos y lácteos'] and 'animal' not in allergens and 'leche' not in allergens
    foods.append(dict(id=id,name=name,section=section,kcal=float(kcal),protein=float(protein),carbs=float(carbs),fat=float(fat),allergens=allergens,vegan=vegan,vegetarian=section not in ['Carnes','Pescados']))
root.joinpath('foods.json').write_text(json.dumps(foods,ensure_ascii=False,indent=2)+'\n')

recipes=[]
def recipe(name,kind,ingredients,steps):
    recipes.append(dict(id='r'+str(len(recipes)+1),name=name,kind=kind,minutes=20,ingredients=[dict(foodId=i,grams=g) for i,g in ingredients],steps=steps))
for protein,vegetable,title in [('pollo','brocoli','Pollo con brócoli'),('pavo','calabacin','Pavo con calabacín'),('ternera','pimiento','Ternera con pimientos'),('merluza','espinaca','Merluza con espinacas'),('salmon','esparrago','Salmón con espárragos'),('atun','tomate','Atún con tomate'),('tofu','brocoli','Tofu con brócoli'),('tempeh','calabacin','Tempeh con calabacín'),('soja-texturizada','pimiento','Soja con pimientos'),('seitan','champinon','Seitán con champiñones')]:
    for carb,grams,label in [('arroz',75,'arroz'),('quinoa',75,'quinoa'),('patata',250,'patata')]:
        recipe(title+' y '+label,'main',[(protein,60 if protein=='soja-texturizada' else 160),(carb,grams),(vegetable,180),('aceite',10)],'Cuece el cereal o la patata. Cocina la proteína completamente y saltea la verdura con el aceite indicado. Sirve todo junto. Para soja texturizada, hidrata y escurre antes de cocinar. La patata puede hacerse en microondas en un recipiente apto.')
for leg,label in [('lenteja','Lentejas'),('garbanzo','Garbanzos'),('alubia','Alubias'),('alubia-negra','Alubias negras')]:
    recipe(label+' con verduras y arroz','main',[(leg,220),('arroz',55),('zanahoria',100),('tomate',100),('aceite',10)],'Cuece el arroz. Enjuaga y escurre las legumbres ya cocidas. Saltea las verduras y añade las legumbres; sirve con el arroz.')
    recipe('Ensalada de '+label.lower()+' y quinoa','main',[(leg,200),('quinoa',60),('pepino',100),('pimiento',100),('aceite',10)],'Cuece la quinoa y enfríala. Mezcla con las legumbres cocidas y escurridas y las verduras lavadas. Aliña con el aceite.')
recipe('Pasta con soja y tomate','main',[('pasta',85),('soja-texturizada',55),('tomate-triturado',180),('aceite',10)],'Cuece la pasta. Hidrata la soja y escúrrela; cocínala con el tomate y el aceite. Mezcla.')
recipe('Tortilla con patata y ensalada','main',[('huevo',150),('clara',120),('patata',230),('lechuga',100),('aceite',10)],'Cuece la patata. Cuaja por completo el huevo y las claras con la patata y el aceite. Acompaña de lechuga lavada.')
for base,label in [('skyr','Skyr'),('yogur-soja','Yogur de soja'),('queso-fresco','Queso fresco batido')]:
    for fruit,title in [('platano','plátano'),('fresa','fresas'),('manzana','manzana')]:
        recipe(label+' con avena y '+title,'breakfast',[(base,230),('avena',65),(fruit,140),('chia',10)],'Mezcla la avena con el yogur o queso y deja reposar. Añade la fruta lavada y troceada y las semillas. Puedes ablandar la avena con un poco de agua.')
recipe('Tostadas de tofu y tomate','breakfast',[('pan',100),('tofu',130),('tomate',130),('aceite',7)],'Tuesta el pan. Cocina el tofu desmenuzado con el aceite y sirve sobre el pan con tomate lavado.')
recipe('Tostadas con huevo','breakfast',[('pan',90),('huevo',100),('clara',100),('tomate',120),('aceite',5)],'Tuesta el pan y cocina por completo el huevo y las claras. Sirve con tomate lavado y el aceite indicado.')
recipe('Quinoa con soja y fruta','breakfast',[('quinoa',65),('bebida-soja',230),('platano',120),('chia',10)],'Cuece la quinoa en agua siguiendo el envase. Añade la bebida de soja y calienta suavemente. Sirve con fruta y semillas.')
recipe('Tortitas de arroz con tofu','breakfast',[('tortitas-arroz',65),('tofu',160),('tomate',120),('aceite',5)],'Cocina el tofu desmenuzado con el aceite. Sirve con las tortitas y el tomate lavado. Comprueba que el envase de las tortitas no incluya gluten.')
recipe('Huevos con patata y fruta','breakfast',[('huevo',100),('clara',130),('patata',180),('naranja',130),('aceite',5)],'Cuece o cocina la patata en microondas con un recipiente apto. Cocina por completo huevos y claras con el aceite y acompaña con la naranja.')
for base,label in [('skyr','Skyr'),('yogur-soja','Yogur de soja'),('queso-cottage','Cottage')]:
    for fruit,title in [('platano','plátano'),('pera','pera'),('kiwi','kiwi')]:
        recipe(label+' y '+title,'snack',[(base,180),(fruit,130),('almendra',20)],'Lava y corta la fruta. Acompaña con el yogur o queso y las almendras.')
recipe('Hummus con pan y zanahoria','snack',[('hummus',90),('pan',60),('zanahoria',120)],'Sirve el hummus con el pan y la zanahoria lavada y cortada en bastones.')
recipe('Edamame y tortitas de arroz','snack',[('edamame',150),('tortitas-arroz',35),('manzana',100)],'Cuece el edamame siguiendo las instrucciones del envase. Sirve con tortitas de arroz y manzana lavada.')
recipe('Tofu con tortitas y fruta','snack',[('tofu',120),('tortitas-arroz',40),('naranja',130)],'Cocina el tofu en una sartén antiadherente y acompaña de tortitas de arroz y naranja.')
root.joinpath('recipes.json').write_text(json.dumps(recipes,ensure_ascii=False,indent=2)+'\n')

exercises=[]
for group,items in {
 'Pecho':[('Press de banca','Barra'),('Press inclinado','Mancuernas'),('Aperturas','Polea'),('Flexiones','Peso corporal')],
 'Espalda':[('Dominadas','Barra de dominadas'),('Jalón al pecho','Polea'),('Remo con barra','Barra'),('Remo sentado','Polea')],
 'Hombros':[('Press militar','Barra'),('Elevaciones laterales','Mancuernas'),('Pájaros','Mancuernas')],
 'Cuádriceps':[('Sentadilla','Barra'),('Prensa de piernas','Máquina'),('Extensión de cuádriceps','Máquina'),('Zancadas','Mancuernas')],
 'Isquios':[('Peso muerto rumano','Barra'),('Curl femoral','Máquina')],
 'Glúteos':[('Hip thrust','Barra'),('Abducción de cadera','Máquina')],
 'Bíceps':[('Curl de bíceps','Mancuernas'),('Curl con barra','Barra')],
 'Tríceps':[('Extensión de tríceps','Polea'),('Press francés','Barra')],
 'Gemelos':[('Elevación de gemelos','Máquina')],
 'Core':[('Crunch','Máquina'),('Elevación de piernas','Peso corporal')]
}.items():
 for name,equipment in items: exercises.append(dict(id='e'+str(len(exercises)+1),name=name,group=group,equipment=equipment))
root.joinpath('exercises.json').write_text(json.dumps(exercises,ensure_ascii=False,indent=2)+'\n')
print(f'{len(foods)} alimentos, {len(recipes)} recetas, {len(exercises)} ejercicios')
