# Ritmo — versión 1.14

App personal en español con las cinco fases implementadas. Ritmo es el nuevo nombre de Dieta y Gym; se conservan su base de datos, identificadores y formato de copia para no perder registros. HTML, CSS y JavaScript puro; sin framework de interfaz ni librerías remotas. Los únicos paquetes de producción son Capacitor 8.6.2 y los plugins oficiales Filesystem 8.1.5 y Share 8.0.3 para exportar archivos desde Android/iOS. La web no necesita esos paquetes para ejecutarse.

## Ejecutar la web

Desde esta carpeta, con Python 3:

```sh
python3 -m http.server 8080 --directory dist
```

Abrir http://localhost:8080. No abrir index.html con doble clic: los módulos necesitan HTTP. No hace falta instalar paquetes ni compilar. Python solo sirve archivos estáticos, no es un servidor de datos.

PWA y service worker necesitan HTTPS o localhost. GitHub Pages sirve solo archivos estáticos; la app no crea cuentas ni envía tus registros de dieta al servidor. En el móvil empaquetado los archivos son locales y no se usa ese acceso remoto.

## Las cinco fases

1. **Perfil:** Mifflin-St Jeor, actividad, objetivo, macros ajustables, preferencias y avisos de seguridad. Se conserva el perfil guardado en fase 1.
2. **Menú y compra:** 106 alimentos editables, 66 recetas y menú de siete días con 2–6 comidas; sustituciones y bloqueos; compra sumada y agrupada con casillas. Menú JSON, compra CSV e impresión/PDF en navegador. Catálogo JSON importable/exportable y editor de alimentos en la app.
3. **Entrenamientos:** 535 ejercicios de fuerza y ejercicios propios; rutinas con días semanales; Push/Pull/Legs de ejemplo; sesiones libres. Series con kg/repeticiones/RPE opcional, descanso, sesión anterior, récords e historial con notas. Se conserva la sesión en curso.
4. **Progreso:** peso, cintura/cadera/pecho opcionales; gráficos SVG de peso y 1RM estimado; volumen semanal por grupo; resumen de sesiones, series con récord y cumplimiento energético. Registro de comidas consumidas o total manual.
5. **PWA:** manifest, iconos, caché sin conexión, actualización con recarga confirmada, modo oscuro/claro, controles táctiles, zonas seguras, copias JSON y restauración validada y atómica. Proyectos Android/iOS sincronizados e iconos propios.

La instrucción de completar hasta fase 5 sustituyó las pausas entre fases. La implementación no equivale a una publicación en las tiendas: siguen pendientes compilación, firma y pruebas nativas. Ver MOVIL.md.

## Uso y prueba rápida

- Perfil de referencia: masculino, 30 años, 80 kg, 180 cm, actividad moderada, perder grasa al 15 %, proteína 2 g/kg y grasa 30 %. Da 1.780 kcal de basal, 2.759 de gasto, objetivo 2.346 kcal; proteína 160 g, hidratos 250,55 g y grasa 78,2 g.
- En Menú, elige inicio y genera. Bloquea una comida y regenera: conserva receta y gramos. Cambiar la semana reemplaza el menú; cambiar el número de comidas exige desbloquear antes. La compra está debajo.
- En Entrenar, empieza una sesión, guarda series y termina. El primer registro es una referencia; después pueden aparecer récords.
- En Progreso, guarda peso y medidas. Un total calórico manual tiene prioridad sobre las comidas marcadas para esa fecha. Quita el total manual si quieres volver a calcular desde las casillas.
- En Ajustes, exporta una copia antes de borrar datos o desinstalar. Restaurar reemplaza todos los registros locales, tras confirmar y validar el archivo.

## Reglas de cálculo y seguridad

Mifflin-St Jeor: 10 × kg + 6,25 × cm − 5 × edad + 5 (masculino) o −161 (femenino). Fuente: Mifflin et al., AJCN 1990;51(2):241–247, DOI 10.1093/ajcn/51.2.241. Actividad: 1,2 / 1,375 / 1,55 / 1,725 / 1,9, factores orientativos ajenos a la ecuación original.

Déficit inicial 15 %, ajustable 0–20 %; superávit 10 %, ajustable 0–15 %. El objetivo no baja del 80 % del gasto ni de 1.200 kcal femenino / 1.500 masculino; redondeo hacia arriba. Estos mínimos son barreras orientativas, no garantía de ingesta suficiente. Proteína 1,2–2,4 g/kg; grasa 20–35 %; hidratos completan la energía con 4/4/9 kcal por gramo. Se rechazan hidratos negativos.

No se generan planes para menores de 18, mayores de 80, IMC <18,5 o ≥40 o situaciones que requieren supervisión, incluidos embarazo, lactancia y enfermedades. IMC y 1RM no son diagnósticos. La app no sustituye a un médico o dietista.

El generador ajusta cada ingrediente entre 0,4 y 3 veces su ración base y penaliza repeticiones. Conserva los bloqueos. La energía diaria generada no puede quedar por debajo de las barreras anteriores; si las preferencias o bloqueos lo impiden, rechaza el menú. Las sustituciones no reducen la energía de la comida y admiten hasta un 15 % más. Se avisa si un día se aleja más de 10 % en energía o 20 % en un macro. No se garantiza ajuste exacto, especialmente con dietas muy restrictivas.

Las exclusiones se separan por comas, punto y coma o saltos de línea. Los términos desconocidos bloquean la generación. Se filtran ingredientes y etiquetas, pero no se garantizan trazas: comprueba los envases. La avena genérica se marca con gluten salvo que edites un producto certificado. Los valores de alimentos son aproximaciones genéricas, no una base clínica certificada; adáptalos a tus etiquetas. Cantidades para una persona, peso comestible, cereales en seco y legumbres cocidas y escurridas.

## Métricas de entrenamiento

Carga externa en kg; en mancuernas mantén el mismo criterio. Peso corporal sin lastre = 0 kg. Volumen: kg × repeticiones, asignado al grupo principal; no incluye el peso corporal implícito.

Récords de mayor peso, más repeticiones independientemente de carga y mejor 1RM estimado. Empates no cuentan. Epley para 2–12 repeticiones con carga positiva; una repetición usa el peso real. Al añadir sesiones antiguas o borrar sesiones se recalculan los récords cronológicamente. Una serie con varios récords cuenta una vez en el resumen.

El descanso conserva la hora final y se recalcula al volver del segundo plano. No hay notificaciones ni alarma garantizada con pantalla bloqueada. Las notas de sesión se guardan al terminar; las del historial se pueden editar.

## Almacenamiento y copias

IndexedDB dieta-gym, versión de DB 1, almacén settings: clave profile original; app-state con esquema 2 para el resto. localStorage guarda el tema. No hay sincronización ni cifrado propio. Cada origen, puerto, navegador o instalación tiene datos independientes. Desinstalar o borrar datos puede eliminarlos. Las copias del sistema operativo dependen de sus ajustes.

Las copias JSON contienen información personal sin cifrar. En móvil se usa un archivo temporal de caché y la hoja de compartir/guardar del sistema. Cada operación valida y persiste un clon antes de actualizar el estado visible; un fallo de guardado muestra aviso. Restaurar escribe perfil y registros en una sola transacción. Importar alimentos combina por ID, conservando los productos que no aparecen en el archivo. Editar un alimento recalcula el menú visible, no los totales históricos. Cambiar perfil conserva el menú anterior con aviso hasta regenerarlo.

## PWA y actualizaciones

Tras la primera carga, espera «Lista para usar sin conexión». Chrome/Edge: Instalar app. Safari iPhone: Compartir → Añadir a pantalla de inicio. El navegador decide instalación y persistencia.

El service worker guarda todos los recursos locales y no cachea rutas de autenticación. Una instalación falla si falta un archivo o recibe HTML en lugar de un módulo. Una actualización espera al botón Actualizar; guarda formularios antes de recargar. Caché y DB son independientes. En nativo los archivos se empaquetan y no se registra el service worker web.

Tras cambiar cualquier archivo de dist, regenerar la caché y sincronizar las plataformas:

```sh
npm run build:offline
npm run native:sync
```

## Pruebas

Con Node 22 o posterior, sin librerías de test externas:

```sh
npm run build:offline
npm run check
npm test
```

120 casos automatizados; 52 están disponibles también en /tests/. Las tres pruebas del service worker utilizan simulación en Node. PRUEBAS.md separa los resultados comprobados de la revisión visual y de dispositivos pendiente. No se ha podido comprobar la interfaz en un navegador por un fallo del enlace de vista previa del entorno.

## Organización

- dist/index.html y css/: interfaz, temas e impresión.
- dist/data/: foods.json, recipes.json y exercises.json, editables.
- dist/js/app.js: perfil; features.js: navegación y acciones; storage.js/state.js: guardado y copias.
- dist/js/diet/, meals/, training/, progress/, ui/: cálculos, menú, compra, métricas, gráficos y presentación.
- dist/manifest.webmanifest, sw.js y assets/icons/: PWA.
- dist/tests/ y tests/: pruebas en navegador/Node.
- scripts/: verificaciones y generación de recursos; seed-data.py sobrescribe los JSON semilla y no es necesario para ejecutar.
- android/ e ios/: proyectos nativos con Capacitor.

## Identidad y navegación

Marca: Ritmo. Lema: «Nutrición y fuerza, a tu ritmo». Logotipo vectorial local en `dist/assets/icons/ritmo-mark.svg` y composición en `ritmo-logo.svg`; favicon y PNG para PWA/Android/iOS. `scripts/brand-assets.py` permite regenerar los PNG con Pillow como herramienta de desarrollo, sin añadir dependencias a la web. La interfaz usa `css/ritmo.css` y un pequeño conjunto local de iconos SVG.

La pantalla Hoy muestra el siguiente paso si falta el perfil, energía registrada, objetivo de macros, entrenamiento previsto y comidas del día. Acciones rápidas para peso, calorías y compra. Nutrición separa menú, compra y alimentos en tres accesos. En ordenador la navegación es lateral y en móvil se mantiene abajo. Se conserva la preferencia claro/oscuro.

## Liquid Glass, Ajustes y edición de perfil (1.2)

Liquid Glass añade superficies translúcidas con desenfoque CSS a los paneles, cabecera y navegación. Si el navegador no admite backdrop-filter se usan superficies opacas. Ajustes → Apariencia permite cambiar el tema y reducir transparencias; se respeta también prefers-reduced-transparency del sistema. No se añaden librerías.

Ajustes es una pantalla propia accesible desde el engranaje superior y la barra lateral. Incluye acceso a Editar perfil, apariencia, copias e información de instalación. Editar perfil permite actualizar nombre/apodo opcional, datos, objetivo, dieta, exclusiones y macros. El botón Guardar perfil y recalcular valida y guarda los cambios. Cambiar solo el nombre no invalida el menú. La clave de DB y el formato de copia anteriores se conservan.

El tema usa la clave theme existente; la transparencia se guarda en ritmo-glass en localStorage. Si ese guardado falla, la preferencia se aplica a la sesión y aparece un aviso. La apariencia no se incluye en la copia de registros.

## Perfil personal (1.3)

Mi perfil muestra un retrato circular, nombre, alias local, biografía, estadísticas reales, accesos redondos y una cuadrícula con Actividad, Logros y Guardado. Los entrenamientos abren un detalle; Guardado muestra comidas bloqueadas y abre su día del menú. No hay seguidores, cuentas nuevas ni red social. Los datos de dieta se editan por separado en Datos y objetivos.

Editar perfil permite seleccionar o quitar una foto y cambiar nombre, alias y biografía sin completar un perfil de dieta. Las fotos JPG/PNG/WebP de hasta 8 MB se recortan por el centro y reducen localmente a 320 × 320 JPEG; no se suben y no se conserva el archivo original. El navegador debe poder decodificarlas. La foto preparada se conserva solo al pulsar Guardar perfil, y se incluye en las copias JSON. Los archivos restaurados solo admiten avatares raster locales acotados, no URLs ni SVG. En iOS se añaden textos de permiso por si se utiliza el selector de fotos o la cámara desde ese selector; no se solicita acceso al iniciar.

La extensión identity es opcional dentro del estado de esquema 2, para aceptar copias anteriores. El nombre ya guardado se recupera al iniciar una instalación previa. Las preferencias, Application ID, DB y claves de los registros se conservan. Liquid Glass usa ahora capas más transparentes (34 % en oscuro y 46 % en claro), manteniendo campos sólidos y la opción de transparencia reducida.

### Icono en la pantalla de inicio

La instalación usa el logotipo de Ritmo: PNG de 192 y 512 px y variante maskable para Android, y `apple-touch-icon` opaco de 180 px para iPhone/iPad. Se regeneran con `python3 scripts/brand-assets.py` (Pillow solo durante el desarrollo).

En Safari: Compartir → Añadir a pantalla de inicio. En Chrome para Android: Instalar aplicación / Añadir a pantalla de inicio. Si un acceso anterior conserva otro icono, quita solo ese acceso y vuelve a añadirlo desde la web actualizada. Evita borrar los datos del sitio para conservar tus registros.

## Ritmo 1.4 — Biblioteca ampliada y Apple Salud

- 257 ejercicios de fuerza con indicaciones generales de ejecución. Buscador sin tildes, filtros por músculo/equipo y biblioteca disponible sin red. No es una lista exhaustiva de todas las variantes posibles: se pueden añadir ejercicios propios. Esta biblioteca registra carga y repeticiones; no introduce métricas ficticias para cardio o ejercicios por tiempo.
- La biblioteca se amplía en instalaciones existentes por ID, conservando ejercicios propios, rutinas e historial. Los IDs originales `e1`–`e26` se mantienen. `scripts/expand-exercises.py` permite regenerar/ampliar el catálogo; revisar datos antes de publicarlos.
- Buscador de ejercicios dentro de una sesión; añadir uno a una sesión de rutina no cambia la rutina guardada. Búsqueda en el editor de rutinas sin perder las casillas marcadas. Corrección de peso/repeticiones/RPE de una serie con recálculo de récords. Historial en bloques de 20 sesiones.
- Se registra `endedAt` al terminar las nuevas sesiones. Las copias antiguas siguen funcionando. Al enviar una sesión a Salud se revisan fecha, hora y duración; no se estiman calorías.

### Apple Salud / Fitness: estado real

El proyecto **nativo iOS** incluye un puente local de HealthKit escrito en Swift, registrado en el controlador usado por la escena y el storyboard. Incluye entitlement y textos de permisos de lectura/escritura de entrenamientos. No se añaden dependencias JavaScript ni plugins de terceros.

En la app nativa compilada: Ajustes → Apple Salud y Fitness → Vincular / revisar permisos. Después, Consultar últimos 30 días muestra hasta 100 entrenamientos de Salud, incluidos los de Apple Watch sincronizados al iPhone; el filtro Solo Apple Watch usa la información de origen/dispositivo. Los resultados están en memoria y fuera de las copias de Ritmo. Apple no permite distinguir entre permiso de lectura denegado y ausencia de resultados. La autorización de escritura se consulta por separado.

Para escribir: Entrenar → historial → Guardar en Salud → revisar horario y duración → confirmar. HealthKit recibe una sesión de fuerza con un identificador de sincronización estable por sesión para evitar duplicados al reintentar; no se enviarán las series, notas personales, peso corporal ni calorías inventadas. Una sesión exportada no se modifica al editar o borrar los datos locales. Si también se grabó con el reloj, no volver a exportarla: son fuentes distintas y no se pueden deduplicar con certeza.

**No funciona en Safari, en la PWA ni en Android.** Hace falta compilar/firmar el proyecto iOS con HealthKit habilitado en el perfil de desarrollo e instalarlo en un iPhone. Este entorno no dispone de Xcode ni de iPhone: el código Swift no se ha compilado ni se ha verificado la conexión con Salud. La web publicada muestra esta limitación de forma explícita. No hay app de Apple Watch ni control de Fitness+.

Documentación utilizada: [autorización de HealthKit](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data), [HKWorkoutBuilder](https://developer.apple.com/documentation/healthkit/hkworkoutbuilder), [sincronización y duplicados](https://developer.apple.com/videos/play/wwdc2020/10184/) y [puentes nativos de Capacitor 8](https://capacitorjs.com/docs/ios/custom-code).

## Ritmo 1.5 — Interfaz simplificada

Inicio centrado en el registro de alimentación y el entrenamiento del día. Entrenar se divide en cuatro pestañas: sesión, rutinas, ejercicios e historial. Los nutrientes, el esfuerzo/descanso, las notas, los gráficos avanzados, las copias y la instalación se consultan desplegándolos. Los avisos de seguridad siguen visibles cuando son necesarios.

Accesos directos a Datos y objetivos cuando falta configurar alimentación. El menú no ofrece generar un plan que esté bloqueado por seguridad. La compra vacía lleva al menú. Las calorías y los nutrientes usan etiquetas completas. Los apartados de progreso y las recetas mantienen su estado abierto al actualizar sus datos; las notas pendientes de una sesión se conservan entre renderizados. El generador evita ejecuciones simultáneas por pulsaciones repetidas. La conexión Apple Salud no disponible en web queda en un apartado plegado de Ajustes.

Prueba adicional de controladores reales con dobles de DOM/IndexedDB: inicio sin perfil, configurar perfil, generación (incluida doble pulsación), marcar compra, preparar rutina, iniciar sesión, guardar/editar serie, terminar y consultar historial/biblioteca. No sustituye las pruebas visuales ni la persistencia en un navegador real.

## Ritmo 1.6 — Entrenamiento paso a paso

Tocar una tarjeta de rutina inicia la sesión de hoy directamente; las plantillas Push/Pull/Legs se muestran como Empuje/Tirón/Piernas sin cambiar los nombres guardados ni los nombres personalizados. La entrada de otra fecha sigue disponible como opción secundaria.

Durante una sesión se muestra un único ejercicio, dos campos (peso y repeticiones) y Guardar serie. Se reutilizan los últimos valores reales del ejercicio cuando existen. El descanso empieza automáticamente; el esfuerzo y la duración del descanso son opcionales. Tocar una serie guardada permite corregirla o eliminarla. Siguiente ejercicio recorre los ejercicios de la sesión en orden. Las notas, técnica y descarte quedan en opciones secundarias; las pestañas de gestión se ocultan mientras se registra una sesión.

Una sesión libre comienza sin ejercicio preseleccionado. El selector ofrece pocas opciones habituales más las de la sesión, y busca en todo el catálogo. Añadir un ejercicio solo modifica esa sesión. Las sesiones libres antiguas sin lista explícita recuperan sus ejercicios a partir de las series guardadas. No se generan recomendaciones automáticas de carga ni objetivos de series/repeticiones.

## Ritmo 1.7 — Personalización y navegación

Ajustes → Personalización abre una pantalla propia con paletas de fondo y botones, selector libre de color, tema claro/oscuro, texto normal/grande, efecto cristal, reducción de animaciones y pantalla de inicio (Hoy/Entrenar/Comidas). Restablecer apariencia no toca registros. Las preferencias se validan y se guardan en `localStorage`, conservando las preferencias anteriores de tema y cristal. No forman parte de la copia de registros ni se sincronizan entre dispositivos. Si el navegador bloquea el almacenamiento, el cambio es temporal y se avisa.

Los colores de texto de botones y acentos se adaptan mediante contraste; con fondo personalizado se usan tarjetas más opacas para mantener legibilidad. Las preferencias de movimiento reducido del sistema también se respetan. La selección de pantalla inicial se usa al abrir sin una ruta directa; el manifest ahora inicia en `./` y conserva el mismo ID de instalación.

La barra móvil queda en cuatro accesos principales: Hoy, Comidas, Entrenar y Mi perfil. Progreso sigue disponible desde Hoy, con un botón para volver. Ajustes se abre con la tuerca; los controles de apariencia se agrupan en su propia pantalla.

## Ritmo 1.8 — 535 ejercicios en el selector

Se añaden 278 variantes de fuerza (535 en total), conservando IDs originales y ejercicios propios. Incluye barra, mancuernas, máquinas, poleas, bandas, kettlebells, anillas, suspensión y peso corporal. `scripts/more-exercises.py` contiene la ampliación editada localmente y evita duplicados al ejecutarlo otra vez. El catálogo registra carga y repeticiones; no añade actividades de cardio o isométricos con métricas inventadas.

Elegir ejercicio ahora ofrece acceso a **todos** los ejercicios, no solo a una lista de favoritos o a los primeros resultados. Muestra 40 por bloque con Mostrar más ejercicios hasta alcanzar el total. La búsqueda consulta todo el catálogo y también permite continuar cuando hay más de 40 coincidencias. Los ejercicios de la sesión aparecen primero al abrir sin búsqueda. Los ejercicios propios siguen accesibles.

## Ritmo 1.9 — Personalización ampliada

Personalización agrupa los controles en apartados desplegables y muestra una tarjeta de ejemplo. Incluye ocho estilos completos: Ritmo, Océano, Atardecer, Bosque, Papel, Neón, Minimal y Espacio. Aplicar estos temas conserva las preferencias de tamaño de texto, movimiento y pantalla de inicio.

Opciones: fondo sólido/degradado, segundo color y dirección, patrones de puntos/cuadrícula, color de tarjetas, opacidad automática/70/80/90/100 %, desenfoque, esquinas, sombras, botones rellenos/contorno y su forma, cuatro familias de fuentes locales, texto normal/grande/muy grande y tres separaciones. Las superficies translúcidas calculan su texto sobre el color compuesto; la transparencia y el desenfoque respetan las capacidades/preferencias del dispositivo. No se cargan fuentes externas ni imágenes.

Mis estilos permite guardar hasta 12 configuraciones con nombre en `localStorage` (`ritmo-saved-styles`), aplicarlas o eliminarlas. El archivo `ritmo-estilo.json` solo contiene preferencias de apariencia: puede exportarse e importarse en otra instalación. No contiene nombre/foto de perfil, menús, series ni medidas. Restablecer apariencia mantiene tanto los registros como los estilos guardados. La copia general de registros sigue sin incluir preferencias o estilos; exportarlos por separado antes de cambiar de dispositivo.

Los valores de colores, enumeraciones y parámetros numéricos se validan antes de usarse como CSS. El importador admite solo el formato `ritmo-appearance` versión 1 y archivos de hasta 128 KB. Los nombres se escapan al mostrarse. Almacenamiento bloqueado o lleno genera un aviso sin afirmar que el estilo se guardó.

## Ritmo 1.10 — Logo con el color elegido

El logo de la cabecera y su muestra en Personalización usan el color de acento elegido, sin depender de la imagen fija original. El fondo del icono se adapta para conservar contraste, incluso con un acento blanco o negro. El favicon de la pestaña del navegador se genera localmente con el mismo color. Estos cambios siguen los temas, estilos guardados y preferencias recuperadas al iniciar. No se envían imágenes ni colores a servicios externos.

El icono de una PWA ya instalada en la pantalla de inicio lo gestiona el sistema operativo; no se cambia dinámicamente al personalizar la web. Los iconos de instalación conservan la identidad original de Ritmo.

## Ritmo 1.11 — Identidad fija y ajustes de precisión

La cabecera retira el subtítulo de marca y el contexto repetido junto al logo. El nombre «ritmo» conserva una fuente fija del sistema y color neutro, independientemente de la fuente o el acento de la app. El símbolo gráfico permanece intacto y permite color vinculado a botones o propio, fondo automático/transparente, tamaño y forma del fondo. El icono del navegador sigue el color del símbolo; el icono ya instalado en la pantalla de inicio sigue gestionado por el sistema.

Se añaden ajustes de tamaño de botones (mínimo 44 px), bordes, ancho del contenido en ordenador, separación entre líneas y grosor del texto. Ángulo del degradado 0–360, desenfoque 0–32 px y opacidad 70–100 % usan deslizadores con previsualización sin reconstruir el control durante el arrastre. El cambio se guarda al finalizar. La opción de opacidad automática sigue disponible.

Deshacer recupera hasta diez cambios de apariencia durante la sesión; no incluye datos de dieta/entrenamientos. Cada apartado se puede restablecer sin afectar a los demás. Abrir/cerrar apartados conserva la organización elegida entre cambios. Los estilos guardados y archivos de versión anterior siguen siendo compatibles. Los temas rápidos conservan las preferencias específicas del símbolo, accesibilidad y pantalla de inicio.

## Ritmo 1.12 — Liquid Glass vinculado al espacio personal

El acento tiñe el ambiente de fondo y las superficies automáticas de forma suave, además del aro del avatar, reflejos y tarjetas de actividad de Mi perfil. La opción Color de Mi espacio permite desvincular esa ambientación para usar tonos neutros. Los colores de fondo y tarjetas elegidos explícitamente se conservan; los efectos del espacio personal los acompañan sin modificar la foto de perfil.

La opacidad automática de Liquid Glass vuelve a ser translúcida (62 % oscuro, 70 % claro), también con colores personalizados. Se mantienen reflejos interiores, bordes y saturación/desenfoque en tarjetas, cabecera y navegación. Los valores manuales de opacidad/desenfoque siguen disponibles. Los navegadores sin soporte o los ajustes del sistema de transparencia reducida usan superficies opacas.

Conservar Liquid Glass es el comportamiento predeterminado al aplicar colores, temas, estilos guardados o archivos importados. Desactivar explícitamente el efecto cambia este comportamiento a libre; volver a elegir Conservar Liquid Glass lo activa. La tipografía y color neutro del nombre de la app siguen protegidos.

## Ritmo 1.13 — Material de cristal en toda la interfaz

Liquid Glass se extiende a navegación, cabecera, botones, campos de formulario, selectores, pestañas, listas, biblioteca, rutinas, tarjetas pequeñas, chips, ventanas y avisos. En móvil, cabecera y barra inferior flotan con márgenes de zona segura; en ordenador, la navegación lateral usa el mismo material. Se conservan el color del espacio personal, las preferencias y la identidad tipográfica de Ritmo.

`css/iphone-glass.css` contiene la capa visual. Usa superficies translúcidas, reflejos interiores, bordes suaves y backdrop-filter, sin librerías ni recursos remotos. Las listas reutilizan un material interior sin añadir desenfoque a cada fila para limitar capas de composición. Los controles pequeños usan fondos más densos y texto con contraste calculado.

Es una apariencia web inspirada en iPhone: los selectores, el teclado y las hojas nativas los dibuja el sistema. Se mantienen alternativas opacas para navegadores sin soporte y preferencias de transparencia reducida/colores forzados, y se evitan transformaciones con movimiento reducido. La impresión conserva fondos blancos.

## Ritmo 1.14 — Cristal intenso y animaciones

La intensidad Intenso (predeterminada) aumenta transparencia automática y bordes/reflejos; Discreto conserva la apariencia más suave. Los reflejos se limitan según contraste con el texto. La opacidad elegida manualmente sigue teniendo prioridad. El fondo tiene dos luces suaves decorativas con movimiento lento, sin filtros animados en toda la pantalla.

`js/ui/liquid-motion.js` implementa animaciones web: entrada escalonada de hasta seis elementos al navegar, entrada de ventanas, confirmación de series, pulsación con rebote suave y onda de luz, apertura de apartados iniciada por el usuario y reflejo que sigue al cursor en ordenador. `css/liquid-motion.css` añade reflejos más visibles y luces ambientales. No se usan librerías ni se modifica estado de salud desde las animaciones; no se bloquean eventos táctiles.

En Personalización → Tarjetas y Liquid Glass se eligen intensidad y animaciones expresivas/suaves. Reducir movimiento (app o sistema) cancela animaciones activas y desactiva luces en movimiento, ondas, rebotes y seguimiento del cursor. Se pausan/cancelan efectos al ocultar la pestaña. Los navegadores sin Web Animations API conservan los controles funcionales sin esas animaciones. Se respetan transparencia reducida, colores forzados e impresión.

## Publicar en GitHub Pages

1. En el repositorio, abrir **Settings → Pages**.
2. En **Build and deployment → Source**, elegir **GitHub Actions**.
3. Abrir **Actions → Publicar Ritmo en GitHub Pages → Run workflow**.
4. Cuando termine el trabajo `deploy`, abrir la URL mostrada en el resultado. Los cambios posteriores en `main` actualizan la página automáticamente.

El workflow comprueba el código, ejecuta las 120 pruebas, prepara el service worker y publica solamente `dist/`. No requiere tokens personales ni secretos adicionales. La web usa rutas relativas, por lo que funciona bajo el subdirectorio del repositorio. No seleccionar publicación directa desde la raíz: el archivo `index.html` de la app está en `dist/`.

Los registros existentes en el alojamiento anterior no se trasladan automáticamente porque cada dominio usa su propio almacenamiento. Antes de cambiar a GitHub Pages, exportar la copia desde Ajustes en la versión anterior y restaurarla en la nueva. Exportar los estilos de apariencia por separado si se quieren conservar. No subir copias personales al repositorio.

Los proyectos nativos iOS/Android se incluyen como código fuente; Pages no los compila ni habilita HealthKit desde la web.

## Publicar en Vercel

Importar el repositorio `pablolopezz/Ritmo-app` desde Vercel, con la raíz del proyecto en `.`. El archivo `vercel.json` selecciona el preset estático, ejecuta comprobaciones, pruebas y la generación del service worker, y publica únicamente `dist/`. El proceso web usa Node.js 22 o posterior y no necesita instalar las dependencias de Capacitor, que se reservan a los proyectos móviles. No se requieren variables de entorno ni base de datos remota.

Los archivos se revalidan al descargarse y el service worker tiene una cabecera específica para evitar versiones antiguas en la caché del servidor. Los metadatos ocultos del alojamiento, como `.nojekyll`, se excluyen de la precarga sin conexión. La navegación usa fragmentos (`#home`, `#train`, etc.); no necesita reescribir todas las rutas a HTML.

Cada dominio guarda registros independientes. Para mover los datos desde otra dirección: exportar una copia en Ajustes en la app anterior y restaurarla en el dominio final de producción de Vercel. Las preferencias de apariencia se exportan por separado. No usar una URL de vista previa como instalación permanente. La integración Apple Salud/Watch requiere compilar y firmar la versión nativa para iOS; publicar la web no habilita HealthKit.
