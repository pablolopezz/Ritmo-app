# Verificación de Ritmo 1.14

## Ejecutado

- npm run check: sintaxis, importaciones, referencias HTML y manifest.
- npm test: 120 casos correctos de cálculo/seguridad, menús, compra, métricas, copias y modo sin conexión simulado.
- Menús probados con 2–6 comidas, dieta omnívora/vegetariana/vegana, exclusiones combinadas, bloqueos y sustituciones. Se comprueban mínimos energéticos y conservación de bloqueos.
- Compra contrastada con la suma total de los ingredientes semanales, productos similares y decimales.
- Récords recalculados al insertar/borrar sesiones históricas, volumen semanal y fechas.
- Simulación de instalación de caché, corte de red, carga de páginas/módulos/JSON/iconos, fallo ante respuestas de autenticación y actualización solicitada.
- npm run native:sync: ambas plataformas incluyen los archivos y los plugins Filesystem/Share. Se comparan también las copias de archivos originales.

## Límites de verificación

La vista previa gestionada falla con «relay could not open browser port 4173». No se ha validado visualmente la interfaz, la persistencia real de IndexedDB, impresión, instalación ni modo avión en navegador/móvil. La simulación offline no sustituye esas pruebas.

El entorno no incluye Android SDK ni Xcode. No se han compilado/firmado APK, AAB ni IPA ni ejecutado emuladores o móviles. Los iconos y el manifiesto de privacidad están preparados, pero requieren revisión en una compilación release. No se ha enviado nada a las tiendas.

## Cómo probar cada fase

1. Perfil: usar el caso del README y comprobar 2.346 kcal; guardar y recargar; probar 17 años, bajo peso y supervisión. Cambiar datos debe ocultar la recomendación anterior.
2. Menú: generar siete días; bloquear una comida y regenerar; comprobar receta y gramos; sustituir otra; revisar totales, compra, casillas y exportaciones. Probar dieta vegana y exclusiones. Un término desconocido impide generar.
3. Entrenar: crear ejercicio/rutina con días, iniciar sesión y guardar una serie. Recargar y recuperar. Terminar; repetir en otra sesión con más peso/repeticiones para ver récords. Comprobar descanso tras pasar a segundo plano y notas del historial.
4. Progreso: guardar pesos en varias fechas y medidas; contrastar gráficos y volumen con carga × repeticiones. Marcar comidas consumidas en fecha pasada/hoy y registrar total manual para comprobar su prioridad.
5. PWA: esperar el aviso offline, instalar, cerrar, activar modo avión y abrir; repetir cálculo/registro. Exportar copia y restaurarla en una instalación de prueba. Guardar copia previa antes de reemplazar datos reales. Actualizar sin desinstalar y verificar perfil y sesión en curso.

En Android/iOS, seguir MOVIL.md y comprobar también la hoja de compartir archivos, zonas seguras, teclado y conservación de datos tras actualizar con el mismo identificador y firma.

## Rediseño Ritmo 1.1

Se repiten los 55 casos y las comprobaciones de recursos. Se ha ejecutado la presentación con estado vacío, perfil seguro y un menú generado, incluyendo las tres secciones de Nutrición. Los iconos PNG se han inspeccionado. El cambio mantiene la DB, esquema de copia, origen y Application ID. Los recursos de inicio y los nombres nativos se han actualizado, pero no se ha compilado ni probado en un móvil.

## Ritmo 1.2 — Ajustes y Liquid Glass

60 pruebas automatizadas: se añaden cinco casos de preferencias, almacenamiento bloqueado, compatibilidad del nombre opcional y presentación segura del perfil. Se verifica la sintaxis y referencias de los nuevos módulos. La apariencia completa, los controles en navegador y las transparencias en móviles reales requieren revisión visual; los tests no verifican la estética. Probar Ajustes → Apariencia, alternar tema y Liquid Glass, recargar y comprobar preferencias; después Editar perfil, guardar y comprobar recuperación.

## Ritmo 1.3 — Perfil personal

Se añaden ocho casos: normalización de identidad, límites de campos, restricciones de avatar, límites de archivo antes de decodificar, copias antiguas sin identidad, restauración de foto/bio/alias, estadísticas reales y texto personal escapado. Siguen pendientes las pruebas de seleccionar/cancelar/quitar foto en navegador y móvil, permisos del selector iOS, recorte de retratos con orientación y la revisión visual de las nuevas transparencias.

## Ritmo 1.4 — Comprobaciones añadidas

Automatizadas: catálogo de 257 ejercicios sin IDs/nombres-equipo repetidos; conservación de IDs originales; migración idempotente de instalaciones existentes con ejercicios propios y rutinas; búsqueda sin tildes y filtros; texto escapado; historial por bloques; edición de series y recálculo; duración opcional y copias antiguas; puente HealthKit con doble de prueba (sin datos reales), ausencia de acceso en web/Android, rangos de duración, horarios imposibles/futuros y filtro Apple Watch.

Revisión pendiente en navegador: buscar «biceps», filtrar Pecho + Mancuernas, crear rutina buscando sin desmarcar lo anterior, iniciar sesión, buscar/añadir ejercicio, registrar/editar serie y terminar. Recargar y comprobar catálogo, rutina e historial. Probar offline tras actualizar.

Revisión obligatoria en Xcode/iPhone: compilar Swift; confirmar registro del plugin en SceneDelegate y storyboard; firmar con HealthKit; solicitar permisos de entrenamientos; probar denegación total, solo lectura, solo escritura y revocación; sincronizar un entrenamiento real del Watch y filtrarlo; guardar una sesión terminada y verificarla en Salud/Fitness; reenviar la misma sesión y comprobar que no se duplica; comprobar que no se crean calorías estimadas. Probar pantalla de permisos cancelada y errores con el teléfono bloqueado. Estas comprobaciones **no se han ejecutado** aquí.

## Ritmo 1.5 — Simplificación y recorridos

- 85 pruebas automatizadas correctas. Se añaden comprobaciones de contenido por pestaña, etiquetas completas, configuración previa del menú y herramientas secundarias plegadas.
- Se ejecutan los controladores reales de la app con dobles de navegador/IndexedDB: datos de perfil, crear menú con doble pulsación (un único guardado), marcar compra, seleccionar rutina, iniciar sesión, registrar y editar una serie, terminar y consultar historial/ejercicios.
- 11 vistas renderizadas comprobadas con un analizador HTML: etiquetas balanceadas y sin IDs repetidos.
- La vista previa gestionada vuelve a fallar por timeout del relay. No se afirma haber validado visualmente las nuevas pantallas, IndexedDB real, teclado móvil o impresión.

Revisión manual prioritaria: Inicio → Configurar alimentación → guardar datos → Comidas → Crear menú semanal → Lista de compra. Entrenar → Rutinas → Usar rutina → Empezar entrenamiento → Guardar serie → Editar → Terminar → Historial. Abrir un gráfico de Progreso, cambiar de ejercicio y comprobar que el apartado sigue abierto. Verificar ambos temas y ancho móvil de 320 px.

## Ritmo 1.6 — Entrenamiento fácil

90 pruebas correctas. Se comprueban el inicio directo con doble pulsación (un único guardado), la selección explícita del primer ejercicio libre, la recuperación de ejercicios de sesiones libres antiguas, el orden y límite de Siguiente ejercicio, las series visibles del ejercicio actual, los nombres de rutinas de ejemplo y la búsqueda compacta. El recorrido de controladores reales con almacenamiento simulado cubre elegir ejercicios, registrar una serie, cambiar de ejercicio y terminar una sesión libre, además del flujo anterior.

Revisión manual pendiente: en móvil, tocar Empuje → anotar peso/repeticiones → Guardar serie → tocar la fila para editar → Siguiente ejercicio → Terminar. Probar sesión libre → elegir primer ejercicio → guardar → añadir otro. Comprobar teclado, descanso, selección de ejercicios y accesibilidad en un navegador/dispositivo real. La infraestructura de vista previa sigue sin estar disponible; estas pruebas no se presentan como realizadas.

## Ritmo 1.7 — Preferencias de apariencia

95 casos automatizados correctos. Nuevas pruebas de persistencia/migración de preferencias, colores y valores manipulados, contraste de botones/acentos/texto de página en ambos temas, aplicación/restablecimiento con datos conservados y almacenamiento bloqueado. El recorrido de controladores reales prueba Ajustes → Personalización → color de fondo → texto grande → restablecer, además de los recorridos de alimentación y entrenamiento.

Pendiente en navegador/dispositivo real: selector de color del sistema, legibilidad sobre fondos extremos, texto grande en 320 px, movimiento reducido del sistema, conservación al cerrar/reabrir, pantalla de inicio sin hash, actualización del manifest de una instalación existente y los cuatro accesos de navegación móvil. No se ha podido completar revisión visual por la infraestructura de vista previa.

## Ritmo 1.8 — Catálogo completo en Elegir ejercicio

98 pruebas correctas. Catálogo de 535 ejercicios con IDs y pares nombre/equipo únicos, validación de estructura y referencias originales conservadas. Se recorren todos los bloques del selector para comprobar que cada ejercicio es alcanzable; una búsqueda de más de 40 resultados permite acceder a todos; ejercicios propios y variantes nuevas aparecen en la búsqueda. El recorrido de controladores prueba abrir el selector, Mostrar más (80 de 535), buscar Curl Zottman y elegir un ejercicio.

Pendiente en móvil real: desplazamiento entre bloques, teclado de búsqueda y selección del último ejercicio con y sin red. No se presenta esta comprobación visual como realizada.

## Ritmo 1.9 — Estilos y controles avanzados

105 pruebas correctas. Se validan los ocho temas, contraste en tarjetas, parámetros numéricos, CSS generado, almacenamiento de 12 estilos, nombres/ajustes manipulados, exportación/importación sin datos ajenos y restablecimiento de estilos. El recorrido de controladores reales prueba aplicar un tema, cambiar ángulo, guardar con nombre, aplicar otro tema, recuperar el guardado, importar y eliminar estilos, conservando las sesiones.

Revisión visual pendiente: degradados/patrones, familias de fuentes locales, transparencia y opacidad en fondos extremos, desenfoque, sombras, formas, texto muy grande en 320 px y accesibilidad del selector de color nativo. No se afirma haber realizado estas comprobaciones en un navegador real.

## Ritmo 1.10 — Logo y favicon

106 pruebas correctas: el color y fondo de contraste del logo se aplican junto a las preferencias; el favicon se genera para acentos claros/oscuros y rechaza valores no seguros. La revisión visual del logo/SVG de la vista previa y el favicon en navegador real sigue pendiente. No se afirma modificar el icono ya instalado en la pantalla de inicio.

## Ritmo 1.11 — Identidad, precisión y deshacer

112 pruebas correctas. Se comprueba la retirada del subtítulo y las reglas de fuente/color neutro del nombre; símbolo con color independiente; rangos intermedios de ángulo, opacidad y desenfoque; nuevos parámetros seguros; restablecimiento por grupos y archivos compatibles. El recorrido real de controladores con DOM/almacenamiento simulado verifica previsualización sin guardado durante arrastre, guardado al cambiar, deshacer, color propio del logo y restablecer botones sin tocar el símbolo ni los entrenamientos.

Pendiente en navegador real: apariencia de la cabecera sin solapamientos, contraste de cada combinación, continuidad del arrastre de los deslizadores, foco de teclado, escala del símbolo y tipografías en dispositivos reales. Los análisis y pruebas simuladas no sustituyen esa revisión visual.

## Ritmo 1.12 — Cristal y Mi espacio

116 pruebas correctas. Nuevas comprobaciones: mantener cristal ante temas que lo desactivaban; respetar una desactivación explícita; variar ambiente/superficies con el acento; mantener colores manuales; generar superficies translúcidas y variables de perfil. El recorrido de controladores también activa/desactiva el bloqueo de cristal y comprueba que los cambios de color lo conservan.

Revisión visual pendiente en móvil/navegador: reflejos, transparencia, saturación, aro del avatar y fondos de Mi perfil con distintos acentos; contraste de combinaciones extremas; ajustes de transparencia reducida y navegadores sin backdrop-filter. No se afirma haber ejecutado esa revisión visual aquí.

## Ritmo 1.13 — Cristal en controles y navegación

Las 116 pruebas funcionales siguen pasando, junto a comprobaciones de sintaxis/importaciones/archivos. Se revisan las alternativas de accesibilidad en el CSS, sin presentar esa revisión estática como una prueba de navegador.

La vista previa vuelve a fallar con timeout del relay al abrir el puerto 4173. Pendiente revisión real en iPhone/Android/ordenador de cabecera/barra flotante, márgenes seguros, campos, listas, ventanas, foco, teclado, scroll, contrastes y accesibilidad. No se ha generado una captura ni comprobado visualmente esta capa.

## Ritmo 1.14 — Movimiento del cristal

120 pruebas automatizadas correctas. Nuevos casos de política de movimiento reducido/visibilidad/cristal desactivado, máximo de seis animaciones de entrada y cancelación, ondas decorativas y botones desactivados, y validación de preferencias de intensidad/movimiento. Continúan pasando los recorridos completos con API de animaciones ausente, comprobando degradación sin bloquear funciones. Las pruebas específicas de color/cristal y movimiento se repiten tras ajustar el presupuesto de brillos para contraste.

Pendiente en navegador/móvil real: percepción de transparencia, fluidez, duración/rebote, ondas al tocar, brillo con cursor, consumo de batería/GPU, retorno de una pestaña oculta y cancelación al activar reducción de movimiento. No se ha podido revisar visualmente por el fallo persistente de la infraestructura de vista previa.
