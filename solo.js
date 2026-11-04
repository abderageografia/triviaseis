(function SoloGame() {
'use strict';

/* EDITORIAL_GLOBAL_20261104 — Correcciones compartidas por todos los modos.
   El banco original es mutable y se conserva el orden/ID de cada pregunta.
   Los enunciados editados y alias correctos se usan en clásico, individual,
   VS y online. No se elimina ningún registro ni se cambian identificadores. */
(function() {
 const bank=(window.GAME_BANK||[]).concat(window.TRIVIA_BONUS_QUIZ||[]);
 const norm=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const updated={questions:0,shortAnswers:0,country:0,aliasesRemoved:0,options:0};
 const rewrites=[
  ['¿Qué capital europea acogió la cumbre del clima de 2015 donde se adoptó el Acuerdo de París?','¿En qué capital europea se adoptó el acuerdo internacional sobre el clima de diciembre de 2015?','París'],
  ['¿Qué material incorporaron Picasso y Braque a algunas obras cubistas mediante papeles pegados?','¿Qué material cotidiano, recortado y pegado, utilizaron Picasso y Braque para crear collages cubistas?','Papel'],
  ['¿Qué película de 2015 muestra al astronauta Mark Watney cultivando patatas en Marte?','¿Qué película de 2015 narra la supervivencia de Mark Watney, un astronauta abandonado en el planeta rojo?','Marte',['El marciano','The Martian']],
  ['¿Qué filme de George A. Romero presenta zombis en un centro comercial de Pensilvania?','¿Qué película de 1978 dirigida por George A. Romero transcurre en un centro comercial asediado por muertos vivientes?','Zombi',['Dawn of the Dead']],
  ['¿Qué pueblo de Malí construyó la Gran Mezquita de Djenné con adobe?','¿Qué material de construcción tradicional predomina en la Gran Mezquita de Djenné, en Malí?','Adobe'],
  ['¿Qué es una ciudad dormitorio?','¿Cómo se llama una localidad residencial cuyos habitantes trabajan mayoritariamente fuera de ella?','Ciudad dormitorio'],
  ['¿Qué criterio de Gaussen identifica un mes seco en un climograma?','¿Qué criterio de aridez considera seco un mes cuando la precipitación no supera el doble de la temperatura?','Gaussen',['Índice de Gaussen','Criterio de Gaussen']],
  ['¿A qué se refiere la expresión «transición demográfica»?','¿Cómo se denomina el paso histórico de tasas altas de natalidad y mortalidad a otras bajas?','Transición demográfica'],
  ['¿Qué mecanismo explica la formación de la brisa marina durante el día?','¿Qué viento local sopla de mar hacia tierra durante el día por la diferencia de calentamiento?','Brisa marina'],
  ['¿Qué se entiende por población activa?','¿Cómo se denomina el conjunto de personas ocupadas y desempleadas que buscan trabajo?','Población activa'],
  ['¿En qué obra literaria aparece el personaje de Nemo?','¿Qué novela de Julio Verne narra la supervivencia de cinco náufragos en una isla del Pacífico?','La isla misteriosa',['La isla misteriosa de Julio Verne']],
  ['¿En qué novela de Julio Verne aparece el submarino Nautilus?','¿Qué submarino ficticio capitanea Nemo en las novelas de Julio Verne?','Nautilus',['El Nautilus']],
  ['¿En qué novela de Verne aparece el capitán Nemo?','¿En qué novela de Julio Verne aparece por primera vez el capitán Nemo?','Veinte mil leguas',['Veinte mil leguas de viaje submarino']],
  ['¿Qué obra de Horacio Quiroga incluye relatos como «La gallina degollada»?','¿Qué escritor uruguayo es autor del célebre cuento «La gallina degollada»?','Horacio Quiroga',['Quiroga']],
  ['¿Qué novela de Yuri Herrera imagina un viaje entre México y Estados Unidos con resonancias míticas?','¿Qué escritor mexicano publicó «Señales que precederán al fin del mundo», novela sobre migración y mitología?','Yuri Herrera',['Herrera']],
  ['¿Qué novela de Ocean Vuong está escrita como una carta dirigida a una madre que no sabe leer?','¿Qué escritor de origen vietnamita publicó una novela epistolar dirigida a su madre que no sabe leer?','Ocean Vuong',['Vuong']],
  ['¿Qué novela de Becky Chambers inaugura la serie Wayfarers con una tripulación espacial diversa?','¿Qué escritora inició la saga de ciencia ficción Wayfarers, centrada en una tripulación espacial diversa?','Becky Chambers',['Chambers']]
 ];
 const map=new Map(rewrites.map(([before,...rest])=>[before,rest]));
 const shorter=new Map([
  ['Antemio de Tralles e Isidoro de Mileto','Antemio e Isidoro'],
  ['Movimiento de independencia de la India','Movimiento independentista indio'],
  ['Sindicato Democrático de Estudiantes','Sindicato Democrático'],
  ['Comisaría General de Abastecimientos y Transportes','Comisaría de Abastecimientos'],
  ['Tribunal Penal Internacional para la ex Yugoslavia','TPIY'],
  ['Declaración de los Derechos del Hombre y del Ciudadano','Declaración de Derechos del Hombre'],
  ['Ley de Sucesión en la Jefatura del Estado','Ley de Sucesión'],
  ['María Cristina de Borbón-Dos Sicilias','María Cristina'],
  ['La lección de anatomía del doctor Tulp','La lección de anatomía'],
  ['Bodegón con limones, naranjas y una rosa','Bodegón de Zurbarán'],
  ['Los cuatro libros de la arquitectura','Los cuatro libros'],
  ['marco convertible de Bosnia y Herzegovina','Marco convertible'],
  ['dírham de los Emiratos Árabes Unidos','Dírham'],
  ['Línea internacional de cambio de fecha','Línea de cambio de fecha'],
  ['La vida invisible de Eurídice Gusmão','La vida invisible'],
  ['La llegada de un tren a la estación de La Ciotat','Llegada de un tren'],
  ['La chica que saltaba a través del tiempo','La chica que saltaba en el tiempo'],
  ['El tío Boonmee recuerda sus vidas pasadas','El tío Boonmee'],
  ['Vivir es fácil con los ojos cerrados','Vivir es fácil'],
  ['Los trabajos de Persiles y Sigismunda','Persiles y Sigismunda'],
  ['Las aventuras de Priscilla, reina del desierto','Priscilla, reina del desierto'],
  ['The Real Housewives of Salt Lake City','Real Housewives of Salt Lake City']
 ]);
 for(const q of bank){
  if(!Array.isArray(q)||typeof q[2]!=='string'||typeof q[3]!=='string')continue;
  if(!Array.isArray(q[4]))q[4]=[];
  const edit=map.get(q[2]);
  if(edit){
    const [prompt,answer,aliases]=edit;
    q[2]=prompt;
    q[3]=answer;
    if(aliases)q[4].push(...aliases);
    // La solución antigua puede referirse a otra pregunta: no copiarla a ciegas.
    updated.questions++;
  }
  if(!q[8]?.special_choice && shorter.has(q[3])){
    const original=q[3],short=shorter.get(original);
    q[3]=short;q[4].push(original);
    updated.shortAnswers++;
  }
  if(q[0]==='historia'){
    if(q[3]==='Macedonios'&&/pueblo del norte de Grecia/.test(q[2])){
      const n=q[4].length;q[4]=q[4].filter(a=>norm(a)!=='macedonia');updated.aliasesRemoved+=n-q[4].length;
    }
    if(q[3]==='Normandos'&&/casa nobiliaria normanda/.test(q[2])){
      const n=q[4].length;q[4]=q[4].filter(a=>norm(a)!=='normandia');updated.aliasesRemoved+=n-q[4].length;
    }
  }
  if(q[0]==='geo'){
   const old=q[2];
   q[2]=q[2].replace(/^¿Qué Estado (?:insular|independiente|báltico|europeo)\b/i,(s)=>s.replace('Estado','país'))
      .replace(/^¿Qué estado (insular|independiente|báltico|europeo)\b/i,(s)=>s.replace('estado','país'))
      .replace(/^¿Qué Estado aparece representado\b/,'¿Qué país aparece representado');
   if(old!==q[2])updated.country++;
  }
  if(q[0]==='cine'){
   // Evitar el genérico «actor o actriz» cuando se pregunta por una persona.
   const old=q[2];
   q[2]=q[2].replace(/^¿Qué actor o actriz interpreta a /,'¿Quién interpreta a ')
     .replace(/^¿Qué actor o actriz da vida a /,'¿Quién da vida a ');
   if(old!==q[2])updated.questions++;
  }
  q[4]=[...new Set(q[4].filter(v=>typeof v==='string'&&v.trim()&&norm(v)!==norm(q[3])))];
 }
 window.TRIVIA_GLOBAL_QUALITY_AUDIT=updated;
})();


/* EDITORIAL_PASADA_FINAL_20261104 — eliminar filtraciones de respuestas
   y aumentar tolerancia a títulos largos sin falsear el concepto. */
(function(){
 const bank=(window.GAME_BANK||[]).concat(window.TRIVIA_BONUS_QUIZ||[]);
 const normalize=v=>String(v??'').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 // Formato: enunciado antiguo, nuevo, solución, alternativas válidas.
 const repairs=[
  ['¿Qué bodegón de Zurbarán presenta limones, naranjas y una rosa?',
   '¿Qué pintor barroco español realizó en 1633 un célebre bodegón de limones, naranjas y una rosa?','Francisco de Zurbarán',['Zurbarán']],
  ['¿Qué película de los hermanos Lumière muestra la llegada de un tren a una estación?',
   '¿Qué hermanos pioneros del cine rodaron la célebre llegada de un tren a una estación francesa?','Hermanos Lumière',['Lumière','Lumiere','Los Lumière']],
  ['¿Qué personaje histórico se relaciona con las reformas legislativas de Solón en Atenas?',
   '¿Qué legislador ateniense del siglo VI a. C. impulsó reformas sociales y políticas contra los abusos aristocráticos?','Solón'],
  ['¿Qué personaje histórico se relaciona con la batalla de Heraclea entre Roma y Pirro?',
   '¿Qué rey de Epiro derrotó a un ejército romano en la batalla de Heraclea (280 a. C.)?','Pirro'],
  ['¿En qué país actual tuvo lugar la unificación de China bajo los Qin?',
   '¿Qué dinastía fundó el primer imperio chino unificado en el siglo III a. C.?','Qin',['Dinastía Qin']],
  ['¿Qué personaje histórico se relaciona con el incendio de Roma en época de Nerón?',
   '¿Qué emperador romano reinaba cuando se produjo el gran incendio de Roma en el año 64?','Nerón',['Neron']],
  ['¿En qué país actual tuvo lugar el primer intento mongol de invadir Japón?',
   '¿Qué kan mongol ordenó la primera expedición de invasión de Japón en 1274?','Kublai Kan',['Kublai','Kublai Khan']],
  ['¿En qué país actual tuvo lugar la independencia de India del dominio británico?',
   '¿En qué año obtuvo la India su independencia del Imperio británico?','1947'],
  ['¿En qué país actual tuvo lugar la proclamación de la República Popular China?',
   '¿Qué dirigente comunista proclamó la República Popular China en 1949?','Mao Zedong',['Mao','Mao Tse-tung','Mao Zedong']],
  ['¿Qué padre de Áyax Telamonio participó en la primera expedición contra Troya con Heracles?',
   '¿Qué héroe fue padre del guerrero Áyax y acompañó a Heracles en una expedición contra Troya?','Telamón',['Telamon']],
  ['¿Qué hermano de Casandra posee también un don profético y se llama Héleno?',
   '¿Qué príncipe troyano, hermano de Casandra, poseía también dotes proféticas?','Héleno',['Heleno']],
  ['¿Cómo se llama la tierra de los lotófagos que hace olvidar el regreso a quienes comen su fruto?',
   '¿Qué pueblo de la Odisea ofrecía un fruto que hacía olvidar a los viajeros el deseo de regresar?','Lotófagos',['Los lotófagos']],
  ['¿En qué película interpreta Cillian Murphy a J. Robert Oppenheimer?',
   '¿Qué actor interpreta al físico J. Robert Oppenheimer en la película biográfica de Christopher Nolan (2023)?','Cillian Murphy',['Murphy']],
  ['¿En qué película interpreta Kirsten Dunst a María Antonieta, en su versión de 2006?',
   '¿Qué actriz interpreta a María Antonieta en la película de Sofia Coppola de 2006?','Kirsten Dunst',['Dunst']],
  ['¿En qué película interpreta Sandra Escacena a Verónica, en su versión de 2017?',
   '¿Qué actriz protagoniza la película española de terror «Verónica» (2017), de Paco Plaza?','Sandra Escacena',['Escacena']],
  ['¿En qué película se ve a Keanu Reeves interpretando a John Constantine, en su versión de 2005?',
   '¿Qué actor encarnó al exorcista John Constantine en la adaptación cinematográfica de 2005?','Keanu Reeves',['Reeves']],
  ['¿En qué película se ve a Joseph Gordon-Levitt interpretando a Edward Snowden?',
   '¿Qué actor interpreta a Edward Snowden en el drama biográfico de Oliver Stone (2016)?','Joseph Gordon-Levitt',['Gordon-Levitt','Gordon Levitt']],
  ['¿En qué película se ve a Keira Knightley interpretando a Anna Karenina, en su versión de 2012?',
   '¿Qué actriz interpretó a Anna Karenina en la adaptación cinematográfica estrenada en 2012?','Keira Knightley',['Knightley']],
  ['¿En qué película se ve a Jennifer Lawrence interpretando a la madre?',
   '¿Qué actriz protagoniza el thriller psicológico «¡Madre!» (2017), de Darren Aronofsky?','Jennifer Lawrence',['Lawrence']],
  ['¿En qué película se ve a Denzel Washington interpretando a Malcolm X, en su versión de 1992?',
   '¿Qué actor encarna a Malcolm X en la película biográfica de Spike Lee (1992)?','Denzel Washington',['Washington']],
  ['¿En qué película se ve a Charlton Heston interpretando a Judá Ben-Hur, en su versión de 1959?',
   '¿Qué actor protagoniza «Ben-Hur» (1959) interpretando a Judá Ben-Hur?','Charlton Heston',['Heston']],
  ['¿En qué película se ve a Meryl Streep interpretando a Karen Silkwood?',
   '¿Qué actriz protagoniza «Silkwood» (1983), drama inspirado en una activista sindical estadounidense?','Meryl Streep',['Streep']],
  ['¿Qué película estrenada en 2023 enfrenta el mundo de las muñecas Barbieland con las convenciones de la sociedad real?',
   '¿Qué drama de Wim Wenders (2023) retrata la vida cotidiana de un limpiador de baños públicos en Tokio?','Días perfectos',['Perfect Days']],
  ['¿Qué película estrenada en 2023 cuenta el matrimonio de Elvis Presley desde la perspectiva de Priscilla?',
   '¿Qué actriz interpreta a Priscilla Presley en la película de Sofia Coppola de 2023?','Cailee Spaeny',['Spaeny']],
  ['¿Qué película muestra a dos mujeres que se reencuentran tras emigrar una de ellas de Corea a Estados Unidos?',
   '¿Qué película de 2023 narra el reencuentro en Nueva York de una mujer coreana emigrada y un amigo de la infancia?','Vidas pasadas',['Past Lives']],
  ['¿Qué acontecimiento histórico relacionado con Hammurabi se produjo hacia 1750 a. C.?',
   '¿Qué cuerpo legal babilónico se recopiló hacia 1750 a. C. y se conserva en una famosa estela?','Código de Hammurabi',['Código de Hamurabi']],
  ['¿Qué acontecimiento histórico relacionado con Caracalla se produjo en 212?',
   '¿Qué edicto del año 212 concedió la ciudadanía romana a casi todos los habitantes libres del Imperio?','Constitutio Antoniniana',['Edicto de Caracalla']],
  ['¿Qué movimiento liderado por Gandhi promovió la independencia india mediante la desobediencia civil?',
   '¿Qué concepto de Gandhi designa la resistencia no violenta basada en la fuerza de la verdad?','Satyagraha',['Satia graha','Satya graha']]
 ];
 const repairsMap=new Map(repairs.map(([key,...v])=>[key,v]));
 const shorter=new Map([
  ['¿Sueñan los androides con ovejas eléctricas?','Sueñan los androides'],
  ['Las venas abiertas de América Latina','Las venas abiertas'],
  ['La cama construida alrededor de un olivo','Lecho de olivo'],
  ['Mujeres al borde de un ataque de nervios','Mujeres al borde'],
  ['Los Tenenbaums. Una familia de genios','Los Tenenbaums'],
  ['Millennium: Los hombres que no amaban a las mujeres','Millennium'],
  ['La Virgen, el Niño Jesús y santa Ana','Santa Ana, la Virgen y el Niño'],
  ['Descendimiento de la capilla Capponi','Descendimiento de Pontormo'],
  ['Marquesina histórica de la estación de Atocha','Marquesina de Atocha'],
  ['Leonor de Toledo con su hijo Giovanni','Leonor de Toledo'],
  ['Efectos del Buen Gobierno en la ciudad','Efectos del Buen Gobierno'],
  ['La última cena de San Giorgio Maggiore','Última cena de Tintoretto'],
  ['Psique reanimada por el beso del Amor','Psique reanimada por el amor'],
  ['Formas únicas de continuidad en el espacio','Formas únicas de continuidad'],
  ['Pantocrátor de San Clemente de Taüll','Pantocrátor de Taüll'],
  ['Sala Labrouste de la Biblioteca Nacional de Francia','Sala Labrouste'],
  ['Magdalena penitente de Pedro de Mena','Magdalena penitente'],
  ['Puerta sur del Baptisterio de Florencia','Puerta sur del Baptisterio'],
  ['Edificio original del Museo del Prado','Museo del Prado'],
  ['Puerta de la Justicia de la Alhambra','Puerta de la Justicia'],
  ['Capilla de Notre-Dame du Haut de Ronchamp','Capilla de Ronchamp'],
  ['La última cena de Santa Maria delle Grazie','Última cena de Leonardo']
 ]);
 const recorded={rewritten:0,abbreviated:0};
 for(const q of bank){
  if(!Array.isArray(q)||typeof q[2]!=='string'||typeof q[3]!=='string'||q[8]?.special_choice)continue;
  if(!Array.isArray(q[4]))q[4]=[];
  const fix=repairsMap.get(q[2]);
  if(fix){
    q[2]=fix[0];q[3]=fix[1];q[4]=fix[2]||[];
    recorded.rewritten++;
  }else if(shorter.has(q[3])){
    const original=q[3];
    q[3]=shorter.get(original);
    q[4].push(original);
    recorded.abbreviated++;
  }
  q[4]=[...new Set(q[4].filter(a=>typeof a==='string'&&normalize(a)!==normalize(q[3])))];
 }
 window.TRIVIA_FINAL_EDITORIAL_AUDIT=recorded;
})();


/* EDITORIAL_ULTIMO_FILTRO_20261104:
   nueve respuestas restantes de más de 35 caracteres y alias Kafka. */
(function(){
 const rows=(window.GAME_BANK||[]).concat(window.TRIVIA_BONUS_QUIZ||[]);
 const replacements=new Map([
  ['Redacción de las Doce Tablas romanas','Ley de las Doce Tablas'],
  ['Quema de libros ordenada por los Qin','Quema de libros'],
  ['Fracaso del asedio de Constantinopla','Fin del asedio de Constantinopla'],
  ['Inicio de la Guerra de los Cien Años','Guerra de los Cien Años'],
  ['Final de la primera circunnavegación','Primera vuelta al mundo'],
  ['Saqueo de Roma por tropas imperiales','Saco de Roma'],
  ['Declaración Universal de Derechos Humanos','Declaración Universal']
 ]);
 let shorter=0,phrases=0,aliases=0;
 for(const q of rows){
  if(!Array.isArray(q)||typeof q[2]!=='string'||typeof q[3]!=='string'||q[8]?.special_choice)continue;
  if(!Array.isArray(q[4]))q[4]=[];
  const old=q[3];
  if(replacements.has(old)){q[3]=replacements.get(old);q[4].push(old);shorter++}
  if(q[2]==='¿Qué obra corresponde a esta descripción: una escultura policromada de un Cristo muerto con fuerte realismo anatómico?'){
   q[2]='¿Qué escultor barroco castellano realizó célebres Cristos yacentes de madera policromada y gran realismo?';
   q[3]='Gregorio Fernández';q[4]=['Gregorio Fernandez','Fernández'];phrases++;
  }
  if(q[2]==='¿Qué obra encaja con la descripción «una cúpula decorada con el milagro de un santo ante un gentío popular»?'){
   q[2]='¿Qué pintor español decoró la cúpula de la ermita madrileña de San Antonio de la Florida?';
   q[3]='Francisco de Goya';q[4]=['Goya'];phrases++;
  }
  if(/(?:gregor|gregorio)\s+samsa/i.test(q[2]) && /^(?:un )?insecto(?: monstruoso)?$/i.test(q[3])){
    for(const alt of ['Cucaracha','Escarabajo','Bicho','Un insecto','Un escarabajo','Una cucaracha']){
      if(!q[4].some(x=>x.toLowerCase()===alt.toLowerCase())){q[4].push(alt);aliases++}
    }
  }
 }
 window.TRIVIA_LAST_QUALITY_AUDIT={shorter,phrases,aliases};
})();


/* Agrupación semántica entre partidas y modos: una misma obra/película
   no se repite por tener preguntas redactadas de forma distinta. */
window.TRIVIA_QUESTION_TOPIC=function triviaQuestionTopic(q){
 if(!Array.isArray(q)||!q[2])return '';
 const normalize=x=>String(x??'').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const c=q[0],prompt=normalize(q[2]),answer=normalize(q[3]);
 const title=q[2].match(/«([^»]+)»/);
 if(c==='cine'){
  if(/\bnader y simin\b|\buna separacion\b/.test(prompt+' '+answer))return 'cine:pelicula:nader-simin';
  if(title&&normalize(title[1]).length>=5)return 'cine:pelicula:'+normalize(title[1]);
  if(/^(?:que|cual|en que) (?:pelicula|filme|cinta|largometraje)/.test(prompt)
    && answer.length>=5&&!/^\d+$/.test(answer))return 'cine:pelicula:'+answer;
 }
 if(c==='arte'){
  if(title&&normalize(title[1]).length>=6)return 'arte:obra:'+normalize(title[1]);
  if(q[7]==='obra'&&answer.length>=8)return 'arte:obra:'+answer;
  if(q[8]?.wiki && answer.length>=6)return 'arte:obra:'+answer;
 }
 if(c==='lit'){
  if(title&&normalize(title[1]).length>=6)return 'lit:obra:'+normalize(title[1]);
  if(/^(?:que|cual|en que) (?:novela|obra literaria|libro|poema)/.test(prompt)&&answer.length>=8)return 'lit:obra:'+answer;
 }
 if(c==='mix'){
  if(title&&normalize(title[1]).length>=6)return 'mix:referencia:'+normalize(title[1]);
  if(/musica.interprete|pop.ampliacion|albumes/.test(String(q[6]||'')+' '+String(q[7]||''))&&answer.length>=5&&!/^\d+$/.test(answer))
    return 'mix:artista:'+answer;
 }
 return '';
};

const BANK = (window.GAME_BANK || []).concat(window.TRIVIA_BONUS_QUIZ || []);

/* CLARIDAD_DE_ENUNCIADOS_2026_11
 * Corrige el banco que comparten los modos de juego, sin alterar respuestas ni puntajes.
 * En especial, evita confundir Estado con país, admite países constituyentes
 * del Reino Unido cuando corresponda y contextualiza referencias poco conocidas.
 */
(function mejorarEnunciadosDelBanco() {
 const norm = v => String(v ?? '').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
 const countryAnswers = new Set([
  'reino unido','francia','alemania','italia','espana','portugal','paises bajos',
  'belgica','suiza','austria','irlanda','grecia','polonia','noruega','suecia',
  'dinamarca','finlandia','islandia','rusia','ucrania','turquia','canada',
  'estados unidos','mexico','brasil','argentina','chile','colombia','peru',
  'japon','china','india','australia','nueva zelanda','egipto','marruecos'
 ]);
 const ukCities = [
  ['newcastle upon tyne', 'Inglaterra'],
  ['cambridge', 'Inglaterra'], ['oxford', 'Inglaterra'],
  ['manchester', 'Inglaterra'], ['liverpool', 'Inglaterra'],
  ['bristol', 'Inglaterra'], ['durham', 'Inglaterra'],
  ['york', 'Inglaterra'], ['londres', 'Inglaterra'],
  ['london', 'Inglaterra'], ['glasgow', 'Escocia'],
  ['edimburgo', 'Escocia'], ['edinburgh', 'Escocia'],
  ['cardiff', 'Gales'], ['belfast', 'Irlanda del Norte']
 ];
 const yearByFilm = new Map();
 function registerYear(title, year) {
  if(!title || !year)return;
  const key = norm(title);
  if(!key)return;
  if(!yearByFilm.has(key))yearByFilm.set(key, String(year));
  else if(yearByFilm.get(key)!==String(year))yearByFilm.set(key, null);
 }
 for(const q of BANK) {
  if(!Array.isArray(q))continue;
  const prompt=String(q[2] ?? ''), answer=String(q[3] ?? '');
  if(q[0]==='geo' && /(?:en qué país|a qué país|en cuál país)/i.test(prompt))countryAnswers.add(norm(answer));
  if(q[0]!=='cine')continue;
  const title=prompt.match(/«([^»]+)»/);
  if(title && /^\d{4}$/.test(answer) && /(?:qué año|año se estrenó|año fue estrenada)/i.test(prompt))registerYear(title[1], answer);
  const filmYear=prompt.match(/¿Qué película de ((?:19|20)\d{2})\b/i);
  if(filmYear)registerYear(answer, filmYear[1]);
 }
 const artPeriod = {
  'Grecia':'obra de la Grecia antigua',
  'Roma':'obra de la Roma antigua',
  'Bizancio':'obra del arte bizantino',
  'Al-Ándalus':'obra del arte andalusí',
  'Románico':'obra del románico (siglos XI-XII)',
  'Gótico':'obra del gótico medieval',
  'Trecento':'obra del Trecento italiano (siglo XIV)',
  'Quattrocento':'obra del Renacimiento italiano del siglo XV',
  'Cinquecento':'obra del Renacimiento italiano del siglo XVI',
  'Manierismo':'obra manierista del siglo XVI',
  'Barroco europeo':'obra del Barroco europeo',
  'Barroco español':'obra del Barroco español',
  'Siglo XVIII':'obra del siglo XVIII',
  'Goya':'obra española de finales del XVIII o comienzos del XIX',
  'Hierro y vidrio':'obra de arquitectura e ingeniería del siglo XIX',
  '1900-1950':'obra de la primera mitad del siglo XX',
  '1950-2000':'obra de la segunda mitad del siglo XX'
 };
 for(const q of BANK) {
  if(!Array.isArray(q) || typeof q[2]!=='string')continue;
  let prompt=q[2], answer=String(q[3] ?? '');
  if(q[0]==='geo') {
   // «Estado» (país soberano) no debe confundirse con estado federado.
   if(/^¿En qué Estado (?:está|se encuentra|queda|se sitúa|se ubica)\b/i.test(prompt)
      && countryAnswers.has(norm(answer))) {
    prompt=prompt.replace(/^¿En qué Estado\b/i, '¿En qué país');
   }
   // Inglaterra, Escocia, Gales e Irlanda del Norte también son países.
   if(norm(answer)==='reino unido' && /(?:país|Estado)/i.test(prompt)) {
    const np=norm(prompt);
    for(const [city, constituent] of ukCities) {
     if(new RegExp('(?:^| )'+city+'(?: |$)').test(np)) {
      if(!Array.isArray(q[4]))q[4]=[];
      if(!q[4].some(a=>norm(a)===norm(constituent)))q[4].push(constituent);
      break;
     }
    }
   }
  }
  if(q[0]==='cine') {
   if(/Deirdre\s+Beaub/i.test(prompt) && /Jamie Lee Curtis/i.test(answer)) {
    prompt='En «Todo a la vez en todas partes» (2022), ¿qué actriz interpreta a Deirdre Beaubeirdre, la inspectora de Hacienda que revisa las cuentas de la familia protagonista?';
   } else if(/señora O['’]Brien/i.test(prompt) && /Jessica Chastain/i.test(answer)
          && !/\(2011\)/.test(prompt)) {
    prompt='En «El árbol de la vida» (2011), ¿qué actriz interpreta a la señora O’Brien, madre de los tres hermanos y esposa del personaje de Brad Pitt?';
   } else if(/(?:interpreta|encarna|dio vida|da vida)/i.test(prompt)) {
    const match=prompt.match(/«([^»]+)»/);
    if(match && !/\((?:19|20)\d{2}\)/.test(prompt)) {
     const year=yearByFilm.get(norm(match[1]));
     if(year)prompt=prompt.replace(match[0], match[0]+' ('+year+')');
    }
   }
  }
  if(q[0]==='arte') {
   if(/Retrato de un joven con medalla/i.test(prompt) && /Botticelli/i.test(answer)
       && /(?:quién|pintó|autor|artista)/i.test(prompt)) {
    prompt='¿Quién pintó «Retrato de un joven con medalla» (h. 1475), retrato del Renacimiento florentino conservado en los Uffizi cuyo protagonista sostiene una medalla de Cosme de Médici?';
   } else if(q[7]==='autor' && /^arte:ampliación /i.test(String(q[6] ?? ''))
       && /«[^»]+»\?$/.test(prompt) && !/siglo|renacim|barroco|románic|gótic/i.test(prompt)) {
    const period=String(q[6]).replace(/^arte:ampliación /i, '');
    const hint=artPeriod[period];
    if(hint)prompt=prompt.replace(/»\?$/, '», '+hint+'?');
   }
  }
  q[2]=prompt;
 }
})();


/* REFERENCIAS_ARTISTICAS_2026_11_04
 * Aporta siglo y estilo a las preguntas originales sobre atribuciones
 * y ubicaciones de obras, reutilizando metadatos de arte_datos.js.
 * No da pistas de época en preguntas que precisamente evalúan la época.
 */
(function contextualizarObrasOriginales(){
 const entries=window.TRIVIA_ART_WORKS;
 if(!entries||typeof entries!=='object')return;
 const normalize=s=>String(s??'').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const works=new Map();
 for(const list of Object.values(entries)){
  if(!Array.isArray(list))continue;
  for(const work of list){
   if(!Array.isArray(work)||!work[0])continue;
   const key=normalize(work[0]);
   if(!works.has(key))works.set(key,work);
  }
 }
 let count=0;
 for(const q of BANK){
  if(!Array.isArray(q)||q[0]!=='arte'||typeof q[2]!=='string')continue;
  const text=q[2],title=text.match(/«([^»]+)»/);
  if(!title || text.length>127 || /[,;] obra del |obra vinculada|siglo (?:[IVX]+|\d+)|estilo (?:rom[aá]nico|g[oó]tico|barroco|renacentista)/i.test(text))continue;
  // Contexto solo para autoría y ubicación. El resto podría revelar la solución.
  const authorship=/¿(?:qui[eé]n|quienes|qu[eé] pintor|qu[eé] artista|qu[eé] escultor|qu[eé] arquitecto)|autor(?:es)? de|pint[oó]|esculpi[oó]|diseñ[oó]/i.test(text);
  const location=/¿(?:en qu[eé] ciudad|d[oó]nde|en qu[eé] museo|en qu[eé] localidad|en qu[eé] pa[ií]s)/i.test(text);
  if(!authorship && !location)continue;
  const work=works.get(normalize(title[1]));
  if(!work)continue;
  const century=String(work[3]||'').match(/^([IVXLCDM]+)\s*(a\.\s*C\.|d\.\s*C\.)$/i);
  const style=String(work[5]||'').trim();
  let hint='';
  if(century)hint='obra del siglo '+century[1]+(/a\./i.test(century[2])?' a. C.':'');
  if(style && normalize(style)!==normalize(q[3])){
   // Etiquetas históricas, sin revelar la respuesta esperada.
   if(hint)hint+=' ('+style.toLowerCase()+')';
   else hint='obra de '+style.toLowerCase();
  }
  if(!hint || normalize(hint).includes(normalize(q[3])) && normalize(q[3]).length>9)continue;
  const rewritten=text.replace(/»\?$/,'», '+hint+'?');
  if(rewritten!==text&&rewritten.length<=170){q[2]=rewritten;count++}
 }
 window.TRIVIA_ART_CLUES_ADDED=count;
})();

const byCat = ['historia','arte','geo','cine','lit','mix'];
const names = ['Historia','Arte','Geografía','Cine','Literatura y política','Miscelánea'];
const icons = ['🏛️','🎨','🌍','🎬','📚','🎤'];
const colors = ['#ef7186','#f2bf62','#42c8be','#6a9efa','#b99aff','#67d087'];
const KEY = 'triviaSeisSoloV1';
const RECORDS_KEY='triviaSeisSoloRecords';
function soloRecords(){try{return JSON.parse(localStorage.getItem(RECORDS_KEY)||'{}')}catch{return {}}}
function saveSoloRecord(){const all=soloRecords(),mode=state.mode,prev=all[mode]||{points:0,streak:0,correct:0,plays:0,wins:0};prev.points=Math.max(prev.points,state.points);prev.streak=Math.max(prev.streak,state.bestStreak);prev.correct=Math.max(prev.correct,state.correct);prev.plays++;if(state.mode==='classic'&&state.stars===6)prev.wins++;all[mode]=prev;try{localStorage.setItem(RECORDS_KEY,JSON.stringify(all))}catch{}}
function soloMedal(key,label){state.medals??=[];if(!state.medals.includes(key)){state.medals.push(key);state.lastMessage+=' 🏅 '+label+'.';window.TRIVIA_FX?.show('crown','🏅','LOGRO DESBLOQUEADO',label)}}
const htmlEscape = v => String(v??'').replace(/[&<>"']/g, a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]));
const root = document.createElement('section');
root.id = 'soloRoot';
root.hidden = true;
root.setAttribute('aria-label','Modo para un jugador');
document.body.appendChild(root);
const css = document.createElement('style');
css.textContent = `
#soloRoot{position:fixed;z-index:15000;inset:0;overflow:auto;background:radial-gradient(circle at 50% -10%,#263e71 0,#0a1229 55%,#070c1b 100%);color:#f5f6ff;font:inherit;padding:18px 12px 46px;overscroll-behavior:contain}
#soloRoot[hidden]{display:none!important}
#soloRoot *{box-sizing:border-box}
.solo-wrap{max-width:720px;margin:auto}
.solo-top{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.solo-logo{font-size:19px;font-weight:900;flex:1;letter-spacing:.4px}
.solo-small{font-size:12px;color:#9ce6e9;letter-spacing:1.5px}
.solo-back{color:#f5f6ff;background:#263553;border:1px solid #58709c;border-radius:14px;padding:11px 13px;font-weight:700;cursor:pointer}
.solo-panel{background:linear-gradient(140deg,#223253,#15213d);border:1px solid #596c94;box-shadow:0 12px 30px #0004;border-radius:24px;padding:20px;margin:12px 0}
.solo-panel h2{font-size:clamp(23px,6vw,34px);line-height:1.14;text-align:center;margin:12px 0 16px}
.solo-note{color:#b5c4e0;font-size:14px;line-height:1.5;text-align:center}
.solo-cta{border:1px solid #9d98ff;border-bottom:5px solid #34238c;background:linear-gradient(120deg,#7862ff,#5142e8);color:#fff;border-radius:19px;padding:17px;font-weight:900;font-size:17px;min-height:58px;display:block;width:100%;cursor:pointer;margin:12px auto;touch-action:manipulation}
.solo-cta:disabled,.solo-pill:disabled{opacity:.45;cursor:default}
.solo-secondary{background:#283b5f;border:1px solid #6e85b1;border-radius:14px;padding:13px;color:#fff;font-weight:750;cursor:pointer}
.solo-choices{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.solo-choice{padding:17px 10px;min-height:110px;text-align:left;border-radius:16px;border:1px solid #6a80aa;background:#172640;color:#fff;cursor:pointer}
.solo-choice b{display:block;font-size:17px;margin-bottom:7px}
.solo-choice small{color:#b8c8e4;font-size:12px;line-height:1.3}
.solo-choice.active{border:2px solid #9ce7df;box-shadow:0 0 0 2px #42d8c22e}
.solo-select{display:block;background:#0c1932;color:#fff;border:1px solid #6c80b1;border-radius:13px;padding:13px;width:100%;font-size:16px;margin:9px 0 15px}
.solo-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;text-align:center}
.solo-stat{background:#10203a;border:1px solid #536e98;border-radius:15px;padding:12px 3px}
.solo-stat b{color:#ffe094;display:block;font-size:27px}
.solo-stat small{color:#9ee4e7;font-size:11px;font-weight:700}
.solo-pips{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin:15px 0 5px}
.solo-pip{background:#12233e;border-radius:12px;text-align:center;padding:8px 2px;min-width:0;border:1px solid #536786}
.solo-pip b{display:block;font-size:10px;margin-top:5px;color:#d3e5fc}
.solo-circles{display:flex;justify-content:center;gap:3px;margin-top:5px}
.solo-circles i{display:block;width:10px;height:10px;border-radius:50%;background:#344665}
.solo-circles i.on{background:var(--cc);box-shadow:0 0 7px var(--cc)}
.solo-wheel-wrap{width:min(72vw,290px);height:min(72vw,290px);position:relative;margin:12px auto 17px}
.solo-disc{width:100%;height:100%;transition:transform 1500ms cubic-bezier(.17,.78,.09,1);border-radius:50%;box-shadow:0 4px 25px #0009}
.solo-pointer{position:absolute;z-index:2;top:-16px;left:calc(50% - 14px);border-left:14px solid transparent;border-right:14px solid transparent;border-top:25px solid #fff0;border-bottom:25px solid #ffe09c;transform:rotate(180deg);filter:drop-shadow(0 2px 3px #000)}
.solo-wheel-center{position:absolute;left:33%;top:33%;width:34%;height:34%;background:#0d1630;border:5px solid #ccd9ec;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 2px 13px #0007}
.solo-tag{text-align:center;font-size:13px;font-weight:800;color:#9fe5e8;letter-spacing:1.7px;margin:5px 0 13px}
.solo-question{font-size:clamp(23px,5.5vw,34px);line-height:1.25;font-weight:850;text-align:center;margin:23px 0}
.solo-field{width:100%;background:#09152d;border-radius:16px;border:1px solid #607ba7;color:white;padding:17px;font-size:19px;outline-offset:3px}
.solo-media{width:100%;max-width:480px;max-height:280px;display:block;object-fit:contain;margin:12px auto;border-radius:13px;background:#0a1020}
.solo-crop{margin:12px auto;width:min(100%,320px);aspect-ratio:1/1;overflow:hidden;border-radius:14px}
.solo-crop img{width:100%;height:100%;object-fit:cover;transform:scale(var(--z,2));transform-origin:var(--pos,center center)}
.solo-time{height:12px;border-radius:9px;background:#0a1732;overflow:hidden;border:1px solid #52618a;margin:10px 0}
.solo-time > div{height:100%;width:100%;background:#65d8ca;transition:width 250ms linear}
.solo-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0}
.solo-option{background:#24375a;color:white;border:1px solid #748bb8;border-radius:16px;min-height:74px;padding:14px 9px;font:inherit;font-weight:750;line-height:1.25;cursor:pointer}
.solo-option:disabled{display:none}
.solo-quiz-type{background:#2c3559;border:1px solid #9c91c8;border-radius:12px;padding:9px 12px;color:#ffe0a7;font-size:12px;font-weight:900;letter-spacing:.5px;margin:9px 0}
.solo-write{background:none;border:0;color:#a9dbed;text-decoration:underline;padding:12px 8px;cursor:pointer}
.solo-powers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:15px}
.solo-pill{background:#283a5c;border:1px solid #7388ae;color:#fff;border-radius:13px;padding:11px 4px;font-size:12px;cursor:pointer}
.solo-ok{border:1px solid #5eddb6;background:#173c3b;color:#8bffdb;border-radius:15px;padding:14px;text-align:center;font-size:20px;font-weight:850}
.solo-no{border:1px solid #ec8195;background:#3b233f;color:#ffabbc;border-radius:15px;padding:14px;text-align:center;font-size:20px;font-weight:850}
.solo-kicker{font-size:12px;font-weight:800;letter-spacing:1.7px;text-align:center;color:#a1e6ed}
@media(min-width:640px){#soloRoot{padding:25px}}

/* Tablero móvil actualizado */
#soloRoot{background:radial-gradient(ellipse 90% 45% at 50% -15%,#314673,transparent 87%),linear-gradient(#101a33,#080f21);padding:calc(12px + env(safe-area-inset-top)) 12px calc(26px + env(safe-area-inset-bottom))}
.solo-wrap{max-width:580px}
.solo-top{gap:7px;margin-bottom:9px}
.solo-logo{font-size:clamp(16px,4.6vw,21px);line-height:1.2}
.solo-small{font-size:10px}
.solo-back,.solo-vibrate{flex-shrink:0;min-height:42px;padding:8px 10px;border:1px solid #6785af;border-radius:12px;color:#f1f5ff;background:#213555;font-size:12px;font-weight:800}
.solo-vibrate[aria-pressed="true"]{border-color:#70e5d3;color:#a8fff2}
.solo-vibrate:disabled{opacity:.6}
.solo-panel{padding:clamp(13px,4vw,21px);border:1px solid #617ba9;border-radius:23px;box-shadow:0 14px 36px #02071488,inset 0 1px #ffffff1b}
.solo-panel h2{margin:8px auto 12px;font-size:clamp(22px,6vw,29px)}
.solo-hud{display:grid;gap:8px;margin:8px 0}
.solo-stats{gap:7px}
.solo-stat{min-height:78px;min-width:0;padding:9px 3px;border-radius:15px;background:linear-gradient(160deg,#1a2b49,#0c1b33)}
.solo-stat b{font-size:clamp(22px,7vw,30px);line-height:1.25;font-variant-numeric:tabular-nums}
.solo-stat small{letter-spacing:.5px;font-size:10px}
.solo-stat .solo-hearts{display:flex;align-items:center;justify-content:center;gap:1px;flex-wrap:wrap;font-size:clamp(20px,6vw,28px);min-height:38px;letter-spacing:-2px;color:#ff7689}
.solo-hearts .lost{color:#455270;filter:saturate(.4)}
.solo-pips{gap:5px;margin:0}
.solo-pip{border-radius:12px;padding:8px 1px 6px;background:linear-gradient(145deg,#172743,#101c33);border-color:#4a638a}
.solo-pip.complete{border-color:var(--cc);box-shadow:0 0 11px color-mix(in srgb,var(--cc) 30%,transparent)}
.solo-pip-icon{display:block;font-size:clamp(18px,5.6vw,24px);line-height:1.1}
.solo-pip b{font-size:10px;margin-top:4px}
.solo-circles{gap:3px;margin-top:6px}
.solo-circles i{width:7px;height:7px}
.solo-inventory{display:flex;justify-content:center;flex-wrap:wrap;gap:5px;font-size:11px;color:#d7e6ff}
.solo-inventory span{border:1px solid #526b96;border-radius:99px;background:#162640;padding:5px 9px;white-space:nowrap}
.solo-hud.compact .solo-stat{min-height:58px;padding:5px 3px}
.solo-hud.compact .solo-stat b{font-size:23px}
.solo-hud.compact .solo-stat .solo-hearts{font-size:20px;min-height:29px}
.solo-hud.compact .solo-pip{padding:5px 0}
.solo-hud.compact .solo-pip-icon{font-size:19px}
.solo-hud.compact .solo-circles{margin-top:3px}
.solo-game-panel{margin-top:8px;text-align:center}
.solo-wheel-panel{background:radial-gradient(circle at 50% 33%,#293e67,#192743 65%,#141e36)}
.solo-wheel-wrap{width:clamp(185px,min(78vw,37dvh),338px);height:auto;aspect-ratio:1;position:relative;margin:10px auto 16px;isolation:isolate;filter:drop-shadow(0 10px 21px #000a)}
.solo-wheel-wrap:before{content:'';position:absolute;inset:-3%;z-index:-1;background:conic-gradient(#ef718655,#f2bf6255,#42c8be55,#6a9efa55,#b99aff55,#67d08755,#ef718655);border-radius:50%;filter:blur(12px)}
.solo-disc{width:100%;height:100%;border:4px solid #d7e4ff;border-radius:50%;transition:none;will-change:transform;box-shadow:inset 0 0 18px #0007,0 0 0 3px #334671;overflow:hidden}
.solo-wheel-icons{position:absolute;inset:0;pointer-events:none}
.solo-wheel-icon{position:absolute;transform:translate(-50%,-50%);width:17%;height:17%;display:grid;place-items:center;border:2px solid var(--cc);border-radius:50%;background:radial-gradient(circle at 35% 20%,#2c3d63,#0b172b 80%);font-size:clamp(21px,7vw,34px);box-shadow:0 3px 10px #000b,0 0 12px color-mix(in srgb,var(--cc) 44%,transparent)}
.solo-pointer{z-index:5;top:-7px;left:50%;width:0;height:0;transform:translateX(-50%);border-left:15px solid transparent;border-right:15px solid transparent;border-top:29px solid #ffe7aa;border-bottom:0;filter:drop-shadow(0 3px 3px #000a) drop-shadow(0 0 7px #ffe18f)}
.solo-wheel-center{z-index:6;left:33%;top:33%;width:34%;height:34%;border:4px solid #e4dfff;background:radial-gradient(circle at 30% 23%,#354b7e,#111d39 80%);box-shadow:0 0 0 3px #ffffff1a,0 3px 15px #000a;font-size:clamp(27px,9vw,37px)}
.solo-wheel-action{pointer-events:auto;display:flex;flex-direction:column;gap:1px;color:#fff;font-size:clamp(13px,3.7vw,18px);font-weight:900;line-height:1.05;text-align:center;text-shadow:0 1px 4px #000a;cursor:pointer;touch-action:manipulation;user-select:none;background:radial-gradient(circle at 30% 18%,#856cff,#4334af 68%,#271d61);border-color:#f5e1ff;box-shadow:0 0 0 4px #ffffff25,0 5px 20px #1d134fbf,0 0 20px #826aff80}
.solo-wheel-action span{font-size:clamp(21px,6vw,29px);line-height:1}
.solo-wheel-action:active:not(:disabled){transform:scale(.96)}
.solo-wheel-action:disabled{opacity:.76;cursor:default;font-size:clamp(11px,3vw,15px)}
.solo-spin-status{font-size:12px;font-weight:850;color:#b9cce9;min-height:18px;margin:0 0 6px}
.solo-spin-status.spinning{color:#ffe3ab}
.solo-cta{min-height:54px;margin:10px auto;padding:13px 16px;font-size:16px;border:1px solid #b4a7ff;border-bottom:4px solid #342a8a;box-shadow:0 4px 0 #302776,0 11px 24px #4b39bd40}
.solo-cta:active:not(:disabled){transform:translateY(2px);box-shadow:0 2px 0 #302776}
.solo-cta:disabled{opacity:.68}
.solo-game-panel .solo-note{font-size:12px;margin:9px 0 0}
.solo-question-panel .solo-question{font-size:clamp(20px,5.6vw,29px);line-height:1.23;margin:17px auto;text-wrap:balance;overflow-wrap:anywhere}
.solo-question-panel .solo-option{min-height:66px;padding:11px 8px;font-size:14px}
.solo-question-panel .solo-options{margin:12px 0}
.solo-question-panel .solo-pill{min-height:43px}
.solo-question-panel .solo-time{height:9px;margin:9px 0}
.solo-question-panel .solo-field{padding:13px 14px;font-size:17px}
.solo-result-panel h2{font-size:clamp(19px,5vw,26px);overflow-wrap:anywhere}
.solo-choice.active{background:#24455a;border-color:#79eddd}
.solo-haptics-help{font-size:12px;text-align:center;color:#b9cce8;margin:12px auto;line-height:1.4}
.solo-haptics-help button{margin-left:5px;background:#263e62;border:1px solid #719ac7;border-radius:10px;color:#fff;padding:7px 10px;font-weight:800}
#soloRoot button:focus-visible,#soloRoot input:focus-visible,#soloRoot select:focus-visible{outline:3px solid #ffe39e;outline-offset:2px}
@media(max-width:370px){#soloRoot{padding-left:8px;padding-right:8px}.solo-panel{padding:12px}.solo-logo{font-size:15px}.solo-small{font-size:9px}.solo-back,.solo-vibrate{padding:7px 8px;font-size:11px}.solo-wheel-wrap{width:clamp(176px,min(75vw,35dvh),298px)}.solo-inventory{gap:3px}.solo-inventory span{padding:4px 6px}}
@media(max-height:640px){.solo-panel{margin:7px 0}.solo-wheel-wrap{width:clamp(160px,min(69vw,32dvh),280px);margin:5px auto 9px}.solo-game-panel h2{margin:4px 0}.solo-stat{min-height:69px}.solo-stat b{font-size:23px}.solo-inventory{font-size:10px}.solo-cta{min-height:46px;padding:10px}}
`;
css.textContent += "\n.solo-result-answers{display:grid;gap:8px;margin:14px 0 11px;text-align:left}\n.solo-answer-row{display:grid;grid-template-columns:minmax(90px,32%) minmax(0,1fr);gap:9px;align-items:center;padding:12px;border:1px solid #64769c;border-radius:14px;background:#11213c}\n.solo-answer-row .solo-answer-label{font-size:11px;letter-spacing:.5px;font-weight:900;color:#b0c5e5;text-transform:uppercase}\n.solo-answer-row .solo-answer-value{font-size:clamp(14px,4vw,17px);line-height:1.3;overflow-wrap:anywhere;color:#f4f7ff}\n.solo-answer-row.correct{border-color:#4b9e87;background:#133535}\n.solo-answer-row.correct .solo-answer-value{color:#a2ffce}\n.solo-answer-row.user-wrong{border-color:#a46483;background:#38243b}\n.solo-answer-row.user-wrong .solo-answer-value{color:#ffbbca}\n.solo-answer-row .solo-empty{font-weight:600;font-style:italic;color:#d5bed1}\n#soloRoot #soloHint{font-size:clamp(16px,4.5vw,19px)!important;line-height:1.42;font-weight:800;color:#e4f5ff;background:#173456;border:1px solid #6c98ba;border-radius:13px;padding:10px 12px;text-align:left;overflow-wrap:anywhere}\n#soloRoot .solo-crown-details{margin:8px 0 0;padding:13px;border:1px solid #d1b57e;border-radius:15px;background:#242841;color:#eaf2ff;text-align:left;font-size:13px;line-height:1.35}\n#soloRoot .solo-crown-details p{margin:8px 0;font-size:12px;color:#d1def5}\n#soloRoot .solo-crown-heading{font-size:16px;color:#ffe4ae}\n#soloRoot .solo-crown-line{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #ffffff20;padding:7px 2px}\n#soloRoot .solo-crown-line:last-of-type{border-bottom:none;margin-bottom:10px}\n#soloRoot .solo-crown-line strong{color:#ffe2a7;white-space:nowrap}\n#soloRoot .solo-crown-details .solo-secondary{display:block;margin:10px auto 0}\n\n.solo-effect-log{display:flex;justify-content:center;flex-wrap:wrap;gap:7px;margin:13px 0 3px}\n.solo-effect-tag{display:inline-flex;align-items:center;gap:5px;padding:8px 11px;border-radius:12px;border:1px solid #7184a9;background:#172640;font-size:12px;font-weight:850;line-height:1.22;animation:solo-event-arrive .42s cubic-bezier(.15,.75,.22,1) both}\n.solo-effect-tag:nth-child(2){animation-delay:.14s}.solo-effect-tag:nth-child(3){animation-delay:.28s}\n.solo-effect-tag.shield-gain,.solo-effect-tag.life-gain{border-color:#6fe7bb;color:#9fffd6;background:#153b39}\n.solo-effect-tag.shield-use{border-color:#e9b377;color:#ffe0a5;background:#3b302b}\n.solo-effect-tag.life-loss{border-color:#f07b95;color:#ffc0c9;background:#442538}\n.solo-effect-tag.crown-gain{border-color:#f4d17b;color:#ffedae;background:#42371d}\n.solo-inventory button.solo-crown-info{border:1px solid #7d719e;border-radius:99px;background:#262342;color:#ffdf98;padding:5px 9px;font:inherit;font-size:11px;cursor:pointer}\n.solo-crown-tip{font-size:11px;color:#e7d8ae;text-align:center;line-height:1.35;margin:0 5px}\n.solo-hearts .solo-heart-just-lost{animation:solo-life-fall 1.15s ease both;display:inline-block}\n.solo-hearts .solo-heart-just-gained{animation:solo-life-return 1.25s cubic-bezier(.1,.75,.2,1) both;display:inline-block}\n.solo-stat.solo-life-loss{animation:solo-life-box-loss 1.2s ease}\n.solo-stat.solo-life-gain{animation:solo-life-box-gain 1.2s ease}\n.solo-shield-stat.solo-shield-gain{animation:solo-shield-box-gain 1.3s ease}\n.solo-shield-stat.solo-shield-use{animation:solo-shield-box-use 1.2s ease}\n@keyframes solo-event-arrive{from{opacity:0;transform:translateY(10px) scale(.95)}to{opacity:1;transform:none}}\n@keyframes solo-life-fall{0%{transform:scale(1);color:#ff6c85;opacity:1}33%{transform:scale(1.5) rotate(-15deg);color:#ff3268;opacity:1}100%{transform:translateY(12px) scale(.75) rotate(18deg);opacity:.58}}\n@keyframes solo-life-return{0%{transform:translateY(18px) scale(.3);opacity:.2;color:#d45365}40%{transform:translateY(-6px) scale(1.45);opacity:1;color:#fff1ef}100%{transform:none;opacity:1;color:#ff7689}}\n@keyframes solo-life-box-loss{0%,100%{border-color:#536e98}25%,65%{border-color:#ff637b;box-shadow:0 0 23px #f04e7473}}\n@keyframes solo-life-box-gain{0%,100%{border-color:#536e98}25%,65%{border-color:#7df3bb;box-shadow:0 0 23px #53e39c92}}\n@keyframes solo-shield-box-gain{0%,100%{box-shadow:none}30%,65%{box-shadow:0 0 17px #63dceaad;transform:scale(1.12)}}\n@keyframes solo-shield-box-use{0%,100%{box-shadow:none;opacity:1}30%{box-shadow:0 0 18px #f4ab608a;transform:scale(.91);opacity:.65}}\n@media(prefers-reduced-motion:reduce){.solo-effect-tag,.solo-hearts .solo-heart-just-lost,.solo-hearts .solo-heart-just-gained,.solo-stat.solo-life-loss,.solo-stat.solo-life-gain,.solo-shield-stat.solo-shield-gain,.solo-shield-stat.solo-shield-use{animation:none!important}}\n";
document.head.appendChild(css);
let state = null, tick = 0, spinning = false, wheelRotation = 0, mediaTicket = 0, chosenMode = 'classic', chosenLevel = 'both';
const HAPTIC_KEY='triviaSeisSoloHaptics';
let hapticsOn=true;
try{hapticsOn=localStorage.getItem(HAPTIC_KEY)!=='off'}catch{}
let wheelFrame=0,wheelToken=0,landingTimer=0;
// La Web Vibration API no expone potencia; los pulsos cortos se perciben como toques suaves.
const SOLO_HAPTIC={
 tap:6,spin:5,stop:[8,36,11],hint:[6,32,6],swap:[7,38,9],
 correct:[9,42,15],streak:[9,33,12,39,17],wrong:[22,85,20],
 life:[36,100,38],lifeGain:[8,37,14,40,20],shield:[7,35,7,38,11],shieldUse:[19,85,12],
 crown:[11,36,16,40,22],win:[10,35,15,37,19,40,24],
 gameover:[28,95,28,110,38],test:[6,45,10,45,15]
};
function soloVibrate(pattern){
 if(!hapticsOn||root.hidden||document.hidden||typeof navigator.vibrate!=='function')return false;
 try{return navigator.vibrate(typeof pattern==='string'?(SOLO_HAPTIC[pattern]||SOLO_HAPTIC.tap):pattern)!==false}catch{return false}
}
function stopWheelVibration(){
 try{if(typeof navigator.vibrate==='function')navigator.vibrate(0)}catch{}
}
function cancelWheelAnimation(){
 wheelToken++;if(wheelFrame)cancelAnimationFrame(wheelFrame);
 if(landingTimer)clearTimeout(landingTimer);
 landingTimer=0;wheelFrame=0;spinning=false;stopWheelVibration();
}

const save=()=>{if(state)try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
function load(){try{
 let old=JSON.parse(localStorage.getItem(KEY)||'null');
 if(old?.v===2&&Array.isArray(old.pips)&&Array.isArray(old.used)&&old.stage!=='finished'){
  // Compatibilidad con partidas que ya habían gastado pistas en la versión antigua.
  if(!Array.isArray(old.hintPositions)){
   old.hintPositions=[];
   if(old.stage==='question'&&old.hintUses>0){
    const answer=Array.from(String(BANK[old.qid]?.[3]??'').trim());
    const indices=answer.map((ch,i)=>/[\p{L}\p{N}]/u.test(ch)?i:-1).filter(i=>i>=0);
    old.hintPositions=indices.slice(0,Math.min(indices.length-1,old.hintUses+1));
   }
  }
  return old;
 }
 }catch{}return null}
function resetSave(){try{localStorage.removeItem(KEY)}catch{}}
function stopTimer(){if(tick){clearInterval(tick);tick=0}}
function close(){
 // Salir descarta la partida, no la suspende.
 if(state&&state.stage!=='finished'&&!confirm('¿Salir del modo individual y eliminar la partida actual? No podrás recuperarla.'))return;
 stopTimer();cancelWheelAnimation();mediaTicket++;
 window.TRIVIA_FX?.cancel?.();
 resetSave();state=null;root.hidden=true;document.body.style.overflow='';
}
function open(){root.hidden=false;document.body.style.overflow='hidden';state=load();if(state&&state.stage==='question'&&Date.now()>Number(state.deadline))grade('',true);else render()}
const currentCat=()=>state?.cat??0;
const playerQuestion=()=>BANK[state?.qid]||null;
function screen(content){
 const supported=typeof navigator.vibrate==='function';
 const hapticButton='<button class="solo-vibrate" type="button" data-solo="haptics" aria-pressed="'+(hapticsOn?'true':'false')+'" title="'+(supported?'Activar o desactivar la vibración':'Este navegador no permite vibración')+'" '+(supported?'':'disabled')+'>'+(supported?(hapticsOn?'📳':'🔕'):'🔕')+' <span>Vibración</span></button>';
 root.innerHTML='<div class="solo-wrap"><div class="solo-top"><div class="solo-logo">🎯 TRIVIA·SEIS <span class="solo-small">EN SOLITARIO</span></div>'+hapticButton+'<button class="solo-back" data-solo="close" type="button">'+(state?'Salir y borrar':'Salir')+'</button></div>'+content+'</div>';
}
function actionButton(cmd,title,cl='solo-cta'){return '<button class="'+cl+'" data-solo="'+cmd+'">'+title+'</button>'}
// Cada pista descubre una posición aleatoria nueva; jamás revela la respuesta entera.
function soloHintParts(){
 const chars=Array.from(String(playerQuestion()?.[3]??'').trim());
 const isLetter=ch=>/[\p{L}\p{N}]/u.test(ch);
 const letterIndexes=chars.map((ch,i)=>isLetter(ch)?i:-1).filter(i=>i>=0);
 const max=Math.max(0,letterIndexes.length-1);
 const visible=new Set(Array.isArray(state?.hintPositions)?state.hintPositions:[]);
 const shown=letterIndexes.filter(i=>visible.has(i)).length;
 const mask=chars.map((ch,i)=>!isLetter(ch)||visible.has(i)?ch:'·').join('');
 return {max,shown,mask,letterIndexes,visible};
}
function canUseSoloHint(){
 if(!state||state.stage!=='question'||state.aids.hint<1)return false;
 if(state.options?.length===4)return (state.hiddenChoices?.length||0)<2;
 const {max,shown}=soloHintParts();
 return max>shown;
}
function soloHintText(){
 if(state.options?.length===4)return (state.hiddenChoices?.length||0)>=2?'Comodín 50:50: eliminadas dos opciones incorrectas.':'';
 return soloHintParts().shown?'Pista: «'+soloHintParts().mask+'» · Cada pista descubre una letra en posición aleatoria.':'';
}
function summary(){
 const compact=state.stage!=='wheel';
 const maxLives=state.mode==='classic'?5:3;
 const recent=state.stage==='result'?state.lastChange||{}:{};
 const prevLives=recent.livesBefore??state.lives;
 const prevShields=recent.shieldsBefore??state.shields;
 const livesDelta=state.lives-prevLives;
 const shieldsDelta=state.shields-prevShields;
 const hearts=Array.from({length:maxLives},(_,i)=>{
  const lost=i>=state.lives;
  const changedToLost=state.stage==='result'&&i>=state.lives&&i<prevLives;
  const changedToFull=state.stage==='result'&&i>=prevLives&&i<state.lives;
  return '<span class="'+(lost?'lost ':'')+(changedToLost?'solo-heart-just-lost ':'')+(changedToFull?'solo-heart-just-gained':'')+'">♥</span>';
 }).join('');
 const lifePulse=livesDelta<0?'solo-life-loss':livesDelta>0?'solo-life-gain':'';
 const shieldPulse=shieldsDelta<0?'solo-shield-use':shieldsDelta>0?'solo-shield-gain':'';
 const stats='<div class="solo-stats"><div class="solo-stat"><b>'+state.points+'</b><small>PUNTOS</small></div>'+
  '<div class="solo-stat '+lifePulse+'"><b class="solo-hearts" aria-label="'+state.lives+' vidas restantes">'+hearts+'</b><small>VIDAS</small></div>'+
  '<div class="solo-stat"><b>🔥 '+state.streak+'</b><small>RACHA</small></div></div>';
 // Las categorías no ocupan espacio en el marcador individual; Conquista las consulta bajo demanda.
 const inventory='<div class="solo-inventory"><span class="solo-shield-stat '+shieldPulse+'" data-solo-stat="shields" aria-label="'+state.shields+' escudos disponibles">🛡️ '+state.shields+' escudos</span>'+
  (state.mode==='classic'?'<button class="solo-crown-info" type="button" data-solo="crownInfo" aria-label="Consultar el progreso de las seis coronas">👑 '+state.stars+'/6 coronas · Ver progreso</button>':'')+
  '<span>✅ '+state.correct+' aciertos'+(state.mode==='sprint'?' / '+state.goal:'')+'</span></div>';
 const value=state.mode==='classic'?state.pips.reduce((a,n)=>a+n,0):state.mode==='survival'?state.correct:Math.min(state.goal,state.correct);
 const goal=state.mode==='classic'?18:state.mode==='survival'?Math.max(10,Math.ceil((state.correct+1)/10)*10):state.goal;
 const prog='<div class="solo-progress" role="group" aria-label="Progreso de la partida"><div class="solo-progress-label"><span>'+(state.mode==='classic'?'👑 CONQUISTA':'⚡ DESAFÍO')+'</span><strong>'+value+' / '+goal+'</strong></div><div class="solo-progress-track" role="progressbar" aria-valuenow="'+value+'" aria-valuemin="0" aria-valuemax="'+goal+'"><span style="width:'+(value/goal*100)+'%"></span></div><div class="solo-progress-foot">'+(state.mode==='classic'?state.stars+' de 6 coronas completadas':state.mode==='survival'?state.asked+' preguntas resistidas':Math.max(0,state.goal-state.correct)+' aciertos para completar el desafío')+'</div></div>';
 const crownTip=state.mode==='classic'&&state.stage==='wheel'?'<div class="solo-crown-tip">👑 Completa 3 avances en cada categoría para ganar su corona. Consigue las 6.</div>':'';
 return '<div class="solo-hud'+(compact?' compact':'')+'">'+stats+prog+inventory+crownTip+(state.medals?.length?'<div class="solo-inventory">🏅 '+state.medals.length+' logros conseguidos</div>':'')+'</div>';
}
function wheelSvg(){
 const step=2*Math.PI/6,cx=150,cy=150,r=145;
 return '<svg viewBox="0 0 300 300" class="solo-wheel-svg" style="width:100%;height:100%" role="img" aria-label="Ruleta de seis categorías">'+
 colors.map((col,i)=>{
  const a=i*step-Math.PI/2,b=(i+1)*step-Math.PI/2;
  const x1=cx+r*Math.cos(a),y1=cy+r*Math.sin(a),x2=cx+r*Math.cos(b),y2=cy+r*Math.sin(b);
  return '<path d="M 150 150 L '+x1+' '+y1+' A '+r+' '+r+' 0 0 1 '+x2+' '+y2+' Z" fill="'+col+'" stroke="#111a34" stroke-width="3" opacity="'+(state.pips[i]===3?'.28':'1')+'"/>';
 }).join('')+'<circle cx="150" cy="150" r="141" fill="none" stroke="#ffffff53" stroke-width="2"/><circle cx="150" cy="150" r="57" fill="#131e3a" stroke="#ffffff5a" stroke-width="3"/></svg>';
}
function wheelIconsHtml(){
 return '<div class="solo-wheel-icons" id="soloWheelIcons" aria-hidden="true">'+icons.map((v,i)=>
  '<span class="solo-wheel-icon" style="--cc:'+colors[i]+'" data-solo-icon="'+i+'">'+v+'</span>'
 ).join('')+'</div>';
}
function paintWheel(angle){
 const disc=root.querySelector('#soloDisc');
 if(disc)disc.style.transform='rotate('+angle+'deg)';
 const iconsWrap=root.querySelector('#soloWheelIcons');
 if(!iconsWrap)return;
 Array.from(iconsWrap.children).forEach((badge,i)=>{
  const a=(-60+i*60+angle)*Math.PI/180;
  badge.style.left=(50+30*Math.cos(a))+'%';
  badge.style.top=(50+30*Math.sin(a))+'%';
 });
}
function render(){
 if(root.hidden)return;
 stopTimer();
 if(!state){
  const record=soloRecords()[chosenMode]||{};
  screen('<div class="solo-panel solo-game-panel"><div class="solo-kicker">UN JUGADOR · SIN FIREBASE</div><h2>Tu ruleta. Tu desafío.</h2><div class="solo-choices"><button class="solo-choice '+(chosenMode==='classic'?'active':'')+'" data-solo="classic"><b>👑 Conquista</b><small>Tres avances por categoría dan una corona. Consigue las seis. Cinco vidas.</small></button><button class="solo-choice '+(chosenMode==='sprint'?'active':'')+'" data-solo="sprint"><b>⚡ Desafío 15</b><small>Consigue 15 aciertos antes de perder las tres vidas.</small></button><button class="solo-choice '+(chosenMode==='survival'?'active':'')+'" data-solo="survival"><b>💀 Supervivencia</b><small>Tres vidas. Juega hasta fallar. Compite por tu mejor récord.</small></button></div><label class="solo-note" style="display:block;margin-top:17px">Dificultad</label><select id="soloDifficulty" class="solo-select"><option value="both">Media y difícil</option><option value="media">Media</option><option value="dificil">Difícil</option></select>'+(record.plays?'<p class="solo-note" style="margin:12px 0 4px">🏆 Récord de este modo: <b>'+Number(record.points||0)+' puntos</b> · 🔥 Mejor racha: <b>'+Number(record.streak||0)+'</b> · Partidas: '+Number(record.plays||0)+'</p>':'')+actionButton('start','EMPEZAR →')+'<p class="solo-note">Rachas x2, preguntas bomba, récords locales, supervivencia, escudos y comodines. El progreso queda guardado en este móvil.</p><div class="solo-haptics-help" id="soloHapticsMessage">'+(typeof navigator.vibrate==='function'?(hapticsOn?'La vibración está activada.':'La vibración está desactivada.')+' <button type="button" data-solo="testHaptics" '+(hapticsOn?'':'disabled')+'>Probar vibración</button>':'Tu navegador no admite vibración. En Chrome para Android suele estar disponible.')+'</div></div>');
  const selector=root.querySelector('#soloDifficulty');if(selector)selector.value=chosenLevel;return;
 }
 let main=summary();
 if(state.stage==='wheel'){
  main+='<div class="solo-panel solo-game-panel solo-wheel-panel"><div class="solo-kicker">'+(state.mode==='classic'?'CONQUISTA LAS SEIS CORONAS':state.mode==='survival'?'SUPERVIVENCIA · SIN LÍMITE':'DESAFÍO DE 15 ACIERTOS')+'</div><h2>Gira la ruleta</h2><div class="solo-wheel-wrap"><div class="solo-pointer"></div><div id="soloDisc" class="solo-disc">'+wheelSvg()+'</div>'+wheelIconsHtml()+'<button class="solo-wheel-center solo-wheel-action" data-solo="spin" type="button" aria-label="Girar la ruleta"><span aria-hidden="true">↻</span><b>GIRAR</b></button></div><div id="soloSpinStatus" class="solo-spin-status" aria-live="polite">Pulsa GIRAR para descubrir tu próxima categoría</div>'+'<p class="solo-note">Los aciertos mantienen tu racha. Cada cuatro aciertos seguidos recuperas un escudo (máximo dos). Cada diez seguidos recuperas una vida, si te falta.</p></div>';
 }else if(state.stage==='offer'){
  main+='<div class="solo-panel solo-game-panel"><div class="solo-kicker">⚡ DESAFÍO ESPECIAL</div><h2>¿Te arriesgas?</h2><p class="solo-note">La siguiente pregunta será de <b>'+names[state.cat]+'</b>. Si aceptas, conseguirás doble avance y puntos extra al acertar. Si fallas perderás una vida adicional.</p>'+actionButton('risk','ACEPTAR EL RETO ⚡')+actionButton('normal','PREGUNTA NORMAL','solo-cta solo-secondary')+'</div>';
 }else if(state.stage==='question'){
  const q=playerQuestion(); if(!q){state.stage='wheel';save();render();return}
  let seconds=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  main+='<div class="solo-panel solo-game-panel solo-question-panel">'+(q[8]?.surprise?'<div class="solo-kicker" style="color:#ffe59c;font-size:16px;margin-bottom:10px">🎁 ¡PREGUNTA SORPRESA! · 500 PUNTOS · AVANCE DOBLE</div>':'')+'<div class="solo-tag" style="color:'+colors[state.cat]+'">'+icons[state.cat]+' '+names[state.cat].toUpperCase()+' · '+(q[1]==='dificil'?'DIFÍCIL':'MEDIA')+(state.risk?' · ⚡ RETO':'')+(state.bomb?' · 💣 PREGUNTA BOMBA':'')+(q[8]?.mythology?' · 🏺 MITOLOGÍA':'')+'</div><div class="solo-kicker" id="soloCountdown">⏳ '+seconds+' SEGUNDOS</div><div class="solo-time"><div id="soloBar" style="width:'+Math.max(0,seconds/state.seconds*100)+'%"></div></div><div class="solo-question">'+htmlEscape(q[2])+'</div>'+(state.options?.length===4?'<div class="solo-quiz-type">'+(q[8]?.special_choice?((q[8]?.variant==='intruso'||q[8]?.variant==='asociacion-falsa')?'🚫 ENCUENTRA EL INTRUSO':'🎯 PREGUNTA ESPECIAL · 4 OPCIONES'):'🎯 RONDA ESPECIAL · 4 OPCIONES')+'</div>':'')+'<div id="soloMedia"></div>'+(state.options?.length===4?'<div class="solo-options">'+state.options.map((answer,i)=>'<button class="solo-option" type="button" data-solo="option" data-idx="'+i+'" '+(state.hiddenChoices?.includes(i)?'disabled':'')+'>'+htmlEscape(answer)+'</button>').join('')+'</div>':'<form id="soloAnswerForm"><input class="solo-field" id="soloAnswer" autocomplete="off" maxlength="120" placeholder="Escribe tu respuesta" required>'+actionButton('submit','COMPROBAR ✓')+'</form>')+'<div class="solo-powers"><button class="solo-pill" data-solo="hint" '+(!canUseSoloHint()?'disabled':'')+'>'+(state.options?.length===4?'💡 50:50 · ':'💡 Pista · ')+state.aids.hint+'</button><button class="solo-pill" data-solo="swap" '+(state.aids.swap===0?'disabled':'')+'>🔄 Cambiar · '+state.aids.swap+'</button><button class="solo-pill" data-solo="shield" '+(state.aids.shield===0||state.shields>=2?'disabled':'')+'>🛡️ Escudo · '+state.aids.shield+'</button></div><p class="solo-note" id="soloHint">'+htmlEscape(soloHintText())+'</p></div>';
 }else if(state.stage==='result'){
  const entered=String(state.lastUserAnswer??'').trim();
  const own=entered?htmlEscape(entered):'<span class="solo-empty">'+(state.lastExpired?'Sin responder (tiempo agotado)':'Sin respuesta')+'</span>';
  const events=(state.lastEffects||[]).map(item=>'<span class="solo-effect-tag '+htmlEscape(item.kind)+'">'+htmlEscape(item.symbol)+' '+htmlEscape(item.short)+'</span>').join('');
  main+='<div class="solo-panel solo-game-panel solo-result-panel"><div class="solo-kicker">'+(state.lastCorrect?'RESPUESTA CORRECTA':'RESPUESTA INCORRECTA')+'</div><h2>'+htmlEscape(state.lastQText)+'</h2>'+
    '<div class="'+(state.lastCorrect?'solo-ok':'solo-no')+'">'+(state.lastCorrect?'✓ ¡ACERTASTE!':'✕ FALLO')+'</div>'+
    '<div class="solo-result-answers"><div class="solo-answer-row '+(state.lastCorrect?'':'user-wrong')+'"><span class="solo-answer-label">Tu respuesta</span><strong class="solo-answer-value">'+own+'</strong></div>'+
    '<div class="solo-answer-row correct"><span class="solo-answer-label">Respuesta correcta</span><strong class="solo-answer-value">'+htmlEscape(state.lastAnswer)+'</strong></div></div>'+
    (events?'<div class="solo-effect-log" aria-label="Cambios de vidas, escudos y coronas">'+events+'</div>':'')+
    '<p class="solo-note">'+htmlEscape(state.lastMessage)+'</p>'+actionButton('next','CONTINUAR →')+'</div>';
 }else if(state.stage==='finished'){
  main+='<div class="solo-panel solo-game-panel solo-result-panel"><div class="solo-kicker">🏆 FIN DEL RETO</div><h2>'+htmlEscape(state.endReason||'Partida terminada')+'</h2><p class="solo-note">Has conseguido <b>'+state.points+' puntos</b> con '+state.correct+' aciertos en '+state.asked+' preguntas. Máxima racha: '+state.bestStreak+'. '+(state.mode==='classic'?'Coronas: '+state.stars+'/6. ':'')+'Logros: '+(state.medals?.length||0)+'. Récord del modo: '+Number(soloRecords()[state.mode]?.points||0)+' puntos.</p>'+actionButton('again','VOLVER A JUGAR ↻')+'</div>';
 }
 screen(main);if(state.stage==='wheel')paintWheel(wheelRotation);if(state.stage==='question'){loadPhoto();startTimer()}
}
// Historial persistente: una partida nueva no debe reciclar preguntas que el jugador ya ha visto.
// En Cine, distintas formulaciones sobre la misma película se consideran el mismo tema.
const SOLO_QUESTION_HISTORY_KEY='triviaSeisSoloQuestionsSeenV1';
const soloNorm=v=>String(v??'').toLocaleLowerCase('es').normalize('NFD')
 .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
function soloQuestionTopic(q){
 if(!q)return '';
 const common=window.TRIVIA_QUESTION_TOPIC?.(q);
 if(common)return common;
 const prompt=soloNorm(q[2]),answer=soloNorm(q[3]);
 if(q[0]==='cine'){
  if(/\bnader y simin\b|\buna separacion\b/.test(prompt+' '+answer))return 'cine:pelicula:nader-simin';
  if(/^(que pelicula|cual pelicula|en que pelicula|que filme|cual filme|que cinta|cual cinta|que largometraje|como se titula la pelicula)/.test(prompt)
     && answer.length>=6 && !/^\d+$/.test(answer))return 'cine:pelicula:'+answer;
  const title=String(q[2]).match(/«([^»]+)»/);
  if(title&&soloNorm(title[1]).length>=10)return 'cine:pelicula:'+soloNorm(title[1]);
 }
 return 'pregunta:'+prompt;
}
function soloReadQuestionHistory(){
 try{const data=JSON.parse(localStorage.getItem(SOLO_QUESTION_HISTORY_KEY)||'[]');
  return Array.isArray(data)?data.filter(v=>typeof v==='string'&&v.length<240).slice(-12000):[];
 }catch{return []}
}
const soloQuestionHistory=new Set(soloReadQuestionHistory());
function soloRememberQuestion(q){
 const key=soloQuestionTopic(q);
 if(!key)return;
 soloQuestionHistory.delete(key);soloQuestionHistory.add(key);
 while(soloQuestionHistory.size>12000)soloQuestionHistory.delete(soloQuestionHistory.values().next().value);
 try{localStorage.setItem(SOLO_QUESTION_HISTORY_KEY,JSON.stringify([...soloQuestionHistory]))}catch{}
}
function candidates(cat,level){
 const seenTopics=new Set(state.used.map(i=>soloQuestionTopic(BANK[i])));
 const pool=BANK.map((q,i)=>(q[0]===byCat[cat]&&!q[8]?.surprise&&!state.used.includes(i)
  &&!seenTopics.has(soloQuestionTopic(q))&&!q[8]?.geo_visual
  &&(!q[8]||!!q[8].src||!!q[8].wiki||!!q[8].mythology||!!q[8].special_choice)
  &&(!level||level==='both'||q[1]===level))?i:-1).filter(i=>i>=0);
 return pool;
}
function createSoloOptions(q){
  return window.TRIVIA_OPTIONS?.make(q,BANK,4,(candidate,question)=>!!window.TRIVIA_MATCH?.(candidate,question))||[];
}
function startQuestion(){
 let pool=candidates(state.cat,state.risk?'dificil':state.diff);
 if(!pool.length&&state.risk)pool=candidates(state.cat,state.diff);
 if(!pool.length)pool=candidates(state.cat,'both');
 if(!pool.length){state.stage='wheel';save();render();return}
 // Priorizar contenidos inéditos entre partidas; si se agotan, usar otros no vistos en ESTA partida.
 const fresh=pool.filter(i=>!soloQuestionHistory.has(soloQuestionTopic(BANK[i])));
 if(fresh.length)pool=fresh;
 const specials=pool.filter(i=>BANK[i]?.[8]?.special_choice);
 const surpriseId=!state.risk?(window.TRIVIA_SURPRISE_PICK?.(state.used,!!state.surpriseSeen)??-1):-1;
 const regular=pool.filter(i=>!BANK[i]?.[8]?.special_choice);
 const take=a=>a[Math.floor(Math.random()*a.length)];
 const showSpecial=specials.length>0&&(!regular.length||Math.random()<.12);
 const id=surpriseId>=0?surpriseId:(showSpecial?take(specials):take(regular.length?regular:specials));
 if(surpriseId>=0)state.surpriseSeen=true;
 state.qid=id;state.used.push(id);soloRememberQuestion(BANK[id]);state.asked++;state.stage='question';state.seconds=state.mode==='sprint'?35:BANK[id][1]==='dificil'?60:45;state.deadline=Date.now()+state.seconds*1000;
 // La respuesta escrita es la regla. Las elecciones son una excepción difícil.
 const question=BANK[id];
 state.options=question[8]?.surprise?[]:(question[8]?.special_choice||(question[1]==='dificil'&&Math.random()<.17)?createSoloOptions(question):[]);
 state.hiddenChoices=[];state.hintUses=0;state.hintPositions=[];
 save();render();
}
function spin(){
 if(spinning||!state||state.stage!=='wheel')return;
 const available=byCat.map((_,i)=>i).filter(i=>state.mode!=='classic'||state.pips[i]<3);
 if(!available.length){end('Has conquistado los seis quesitos');return}
 cancelWheelAnimation();
 spinning=true;
 const token=wheelToken;
 const selected=available[Math.floor(Math.random()*available.length)];
 const startAngle=wheelRotation;
 const current=((startAngle%360)+360)%360;
 const target=(360-(selected+0.5)*60+360)%360;
 const offset=(target-current+360)%360;
 const finishAngle=startAngle+(4+Math.floor(Math.random()*2))*360+offset;
 const duration=2800;
 const btn=root.querySelector('[data-solo="spin"]');
 const status=root.querySelector('#soloSpinStatus');
 if(btn){btn.disabled=true;btn.textContent='GIRANDO…'}
 if(status){status.classList.add('spinning');status.textContent='La ruleta está eligiendo una categoría…'}
 // Este primer pulso se solicita directamente desde el toque del jugador.
 soloVibrate('tap');
 let started=null,lastPulse=-Infinity,lastSection=Math.floor((startAngle+30)/60);
 function frame(now){
  if(token!==wheelToken||!state||root.hidden||state.stage!=='wheel')return;
  if(started===null)started=now;
  const t=Math.min(1,(now-started)/duration);
  const eased=1-Math.pow(1-t,3.4);
  wheelRotation=startAngle+(finishAngle-startAngle)*eased;
  paintWheel(wheelRotation);
  // Pulsos breves al pasar a otro sector, con mayor separación al frenar.
  const section=Math.floor((wheelRotation+30)/60);
  if(section!==lastSection&&now-lastPulse>=130+240*t*t&&t<0.97){
   soloVibrate('spin');
   lastPulse=now;
  }
  lastSection=section;
  if(t<1){wheelFrame=requestAnimationFrame(frame);return}
  wheelFrame=0;wheelRotation=finishAngle;paintWheel(wheelRotation);
  stopWheelVibration();soloVibrate('stop');
  if(status){status.classList.remove('spinning');status.textContent=icons[selected]+' '+names[selected]+' · ¡categoría elegida!'}
  landingTimer=setTimeout(()=>{
   landingTimer=0;
   if(token!==wheelToken||root.hidden||!state||state.stage!=='wheel')return;
   spinning=false;state.cat=selected;state.risk=false;state.bomb=Math.random()<.12;
   state.stage=state.bomb?'question':Math.random()<.18?'offer':'question';
   if(state.stage==='question')startQuestion();
   else{save();render()}
  },380);
 }
 wheelFrame=requestAnimationFrame(frame);
}
function grade(answer,expired=false){
 if(!state||state.stage!=='question')return;
 stopTimer();
 const q=playerQuestion();
 if(!q)return;
 const typed=String(answer??'').trim();
 const correct=!expired&&!!typed&&!!window.TRIVIA_MATCH?.(typed,q);
 const beforeFx={lives:state.lives,shields:state.shields,stars:state.stars,points:state.points,streak:state.streak};
 state.lastCorrect=correct;
 state.lastQText=q[2];
 state.lastAnswer=q[3];
 state.lastUserAnswer=typed;
 state.lastExpired=!!expired;
 state.lastMessage='';
 if(correct){
  state.correct++;state.streak++;state.bestStreak=Math.max(state.streak,state.bestStreak);
  const bonus=(state.risk||q[8]?.surprise||state.bomb)?2:1;
  const fire=state.streak>=3?2:1;
  const gain=(q[8]?.surprise?500+Math.min(100,state.streak*10):(q[1]==='dificil'?150:100)*bonus+Math.min(100,state.streak*10))*fire+(state.bomb?200:0);
  state.points+=gain;
  if(state.mode==='classic'){state.pips[state.cat]=Math.min(3,state.pips[state.cat]+bonus);state.stars=state.pips.filter(n=>n===3).length}
  const messages=['+'+gain+' puntos'+(state.risk||q[8]?.surprise||state.bomb?' y avance doble':'')+(fire===2?' · 🔥 RACHA x2':'')];
  if(state.streak%4===0&&state.shields<2){state.shields++;messages.push('🛡️ Recuperas un escudo')}
  if(state.streak%10===0&&state.lives<(state.mode==='classic'?5:3)){state.lives++;messages.push('❤️ Recuperas una vida por diez aciertos seguidos')}
  state.lastMessage=messages.join(' · ')+'.';
  if(state.streak>=5)soloMedal('streak5','Cinco aciertos seguidos');
  if(state.correct>=20)soloMedal('correct20','Veinte respuestas acertadas');
  if(state.correct>=50)soloMedal('correct50','Cincuenta respuestas acertadas');
 }else{
  const penalty=1+Number(!!state.risk)+Number(!!state.bomb);
  const shielded=state.shields>0?1:0;
  const livesLost=Math.min(state.lives,Math.max(0,penalty-shielded));
  if(shielded)state.shields--;
  state.lives=Math.max(0,state.lives-livesLost);state.streak=0;
  const cause=state.bomb?' (fallo + penalización de pregunta bomba)':state.risk?' (fallo + penalización del reto)':'';
  state.lastMessage=(expired?'Se ha agotado el tiempo. ':'')+(shielded?'🛡️ Un escudo ha absorbido una penalización. ':'')+
   (livesLost===0?'No has perdido ninguna vida.':'Has perdido '+livesLost+' vida'+(livesLost===1?'':'s')+cause+'.')+
   (state.lives===0?' No te quedan vidas.':' Te quedan '+state.lives+' vida'+(state.lives===1?'':'s')+'.');
 }
 const events=[];
 const add=(kind,type,symbol,title,short,description)=>events.push({kind,type,symbol,title,short,description});
 if(state.shields<beforeFx.shields)add('shield-use','shieldUsed','🛡️','ESCUDO UTILIZADO','−1 escudo utilizado','Ha bloqueado una penalización');
 if(state.lives<beforeFx.lives)add('life-loss','life','💔','VIDA PERDIDA','−'+(beforeFx.lives-state.lives)+' vida'+(beforeFx.lives-state.lives===1?'':'s'),state.lives+' vidas restantes');
 if(state.shields>beforeFx.shields)add('shield-gain','shield','🛡️','ESCUDO RECUPERADO','+1 escudo recuperado',state.shields+' de 2 escudos disponibles');
 if(state.lives>beforeFx.lives)add('life-gain','lifeEarned','❤️','VIDA RECUPERADA','+1 vida recuperada',state.lives+' vidas disponibles');
 if(state.stars>beforeFx.stars)add('crown-gain','crown','👑','¡CORONA CONSEGUIDA!','+1 corona',state.stars+' de 6 categorías conquistadas');
 state.lastEffects=events;
 state.lastChange={livesBefore:beforeFx.lives,shieldsBefore:beforeFx.shields};
 state.stage='result';state.risk=false;state.bomb=false;
 save();render();
 if(state.lives<beforeFx.lives)soloVibrate('life');
 else if(state.shields<beforeFx.shields)soloVibrate('shieldUse');
 else if(state.lives>beforeFx.lives)soloVibrate('lifeGain');
 else if(state.shields>beforeFx.shields)soloVibrate('shield');
 else if(state.stars>beforeFx.stars)soloVibrate('crown');
 else soloVibrate(correct?(state.streak>=3?'streak':'correct'):'wrong');
 if(window.TRIVIA_FX){
  if(events.length){
   if(window.TRIVIA_FX.play)window.TRIVIA_FX.play(events);
   else {const event=events[0];window.TRIVIA_FX.show(event.type,event.symbol,event.title,event.description)}
  }else if(correct)window.TRIVIA_FX.show('right',q[8]?.surprise?'🎁':state.streak>1?'🔥':'✨',q[8]?.surprise?'¡SORPRESA ACERTADA!':state.streak>1?'¡RACHA DE '+state.streak+'!':'¡ACERTASTE!','+'+(state.points-beforeFx.points)+' puntos');
  else window.TRIVIA_FX.show('wrong','✕',expired?'TIEMPO AGOTADO':'RESPUESTA INCORRECTA','Inténtalo en la siguiente');
 }
}
function end(message){stopTimer();state.endReason=message;state.stage='finished';saveSoloRecord();save();render();soloVibrate(state.lives&&state.mode==='classic'&&state.stars===6?'win':'gameover');window.TRIVIA_FX?.show(state.lives&&state.mode==='classic'&&state.stars===6?'win':'end',state.lives&&state.mode==='classic'&&state.stars===6?'🏆':'🏁',state.lives&&state.mode==='classic'&&state.stars===6?'¡LOS SEIS QUESITOS!':'PARTIDA TERMINADA',message)}
function advance(){
 if(!state||state.stage!=='result')return;
 window.TRIVIA_FX?.cancel?.();
 if(!state.lives){end('Te has quedado sin vidas');return}
 if(state.mode==='classic'&&state.pips.every(n=>n===3)){end('¡Has conseguido los seis quesitos!');return}
 if(state.mode==='sprint'&&state.correct>=state.goal){end('¡Has conseguido 15 aciertos!');return}
 state.stage='wheel';save();render();
}
function startTimer(){
 if(!state||state.stage!=='question')return;
 tick=setInterval(()=>{
  if(root.hidden||!state||state.stage!=='question')return;
  const left=Math.max(0,state.deadline-Date.now()),secs=Math.ceil(left/1000);
  const label=root.querySelector('#soloCountdown'),bar=root.querySelector('#soloBar');
  if(label)label.textContent='⏳ '+secs+' SEGUNDOS';
  if(bar)bar.style.width=Math.min(100,Math.max(0,left/state.seconds/1000*100))+'%';
  if(left<=0)grade(root.querySelector('#soloAnswer')?.value||'',true);
 },250);
}
async function loadPhoto(){
 const q=playerQuestion(),meta=q?.[8],box=root.querySelector('#soloMedia');
 if(!box||!meta||(!meta.src&&!meta.wiki))return;
 const ticket=++mediaTicket;
 let source=meta.src;
 if(!source&&meta.wiki){
  try{const res=await fetch('https://'+(meta.lang||'es')+'.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(meta.wiki));
   if(!res.ok)throw Error('Imagen no disponible');const json=await res.json();source=json.originalimage?.source||json.thumbnail?.source}catch{if(box.isConnected)box.innerHTML='<p class="solo-note">No se ha cargado la imagen.</p><button class="solo-secondary" data-solo="mediaFail">Otra pregunta sin penalización</button>';return}
 }
 if(!source||ticket!==mediaTicket||!box.isConnected)return;
 const img=document.createElement('img');img.src=source;img.loading='eager';img.alt='Imagen para identificar';
 if(meta.fit==='cover'&&Number(meta.zoom)>1){const div=document.createElement('div');div.className='solo-crop';const zoom=Math.min(4,Math.max(1.1,Number(meta.zoom)));div.style.setProperty('--z',zoom);div.style.setProperty('--pos',meta.position||'center center');div.appendChild(img);box.appendChild(div)}
 else{img.className='solo-media';box.appendChild(img)}
}
function swapQuestion(){
 if(!state||state.stage!=='question'||state.aids.swap<1)return;
 soloVibrate('swap');state.aids.swap--;state.used.pop();state.asked=Math.max(0,state.asked-1);startQuestion();
}
root.addEventListener('click',e=>{
 const btn=e.target.closest('[data-solo]');if(!btn||btn.disabled)return;
 const cmd=btn.dataset.solo;
 if(cmd==='close')return close();
 if(cmd==='haptics'){
  hapticsOn=!hapticsOn;
  try{localStorage.setItem(HAPTIC_KEY,hapticsOn?'on':'off')}catch{}
  if(hapticsOn)soloVibrate('tap');else stopWheelVibration();
  const toggle=root.querySelector('[data-solo="haptics"]');
  if(toggle){toggle.setAttribute('aria-pressed',hapticsOn?'true':'false');toggle.innerHTML=(hapticsOn?'📳':'🔕')+' <span>Vibración</span>';}
  const info=root.querySelector('#soloHapticsMessage');
  if(info){
   info.innerHTML=(hapticsOn?'La vibración está activada.':'La vibración está desactivada.')+' <button type="button" data-solo="testHaptics" '+(hapticsOn?'':'disabled')+'>Probar vibración</button>';
  }
  return;
 }
 if(cmd==='testHaptics'){
  const ok=soloVibrate('test');
  const info=root.querySelector('#soloHapticsMessage');
  if(info)info.textContent=ok?'Vibración solicitada. Si no la notas, revisa los ajustes de respuesta táctil del móvil.':'Este navegador o dispositivo ha rechazado la vibración.';
  return;
 }
 if(cmd==='classic'||cmd==='sprint'||cmd==='survival'){chosenMode=cmd;render();return}
 if(cmd==='crownInfo'){
  if(state.mode!=='classic')return;
  const current=root.querySelector('#soloCrownDetails');
  if(current){current.remove();return}
  const lines=names.map((name,i)=>'<div class="solo-crown-line"><span>'+icons[i]+' '+htmlEscape(name)+'</span><strong>'+state.pips[i]+'/3 '+(state.pips[i]===3?'👑':'')+'</strong></div>').join('');
  const panel=document.createElement('div');
  panel.id='soloCrownDetails';panel.className='solo-crown-details';
  panel.innerHTML='<strong class="solo-crown-heading">👑 Progreso de Conquista</strong><p>Completa tres avances en cada categoría para conseguir su corona. Reúne las seis.</p>'+lines+'<button type="button" class="solo-secondary" data-solo="crownInfo">CERRAR</button>';
  const inventory=root.querySelector('.solo-inventory');if(inventory)inventory.insertAdjacentElement('afterend',panel);
  return;
 }
 if(cmd==='start'||cmd==='again'){
  chosenLevel=root.querySelector('#soloDifficulty')?.value||chosenLevel;
  cancelWheelAnimation();wheelRotation=0;
  state={v:2,mode:chosenMode,diff:chosenLevel,points:0,lives:chosenMode==='classic'?5:3,streak:0,bestStreak:0,shields:0,aids:{hint:3,swap:2,shield:1},correct:0,asked:0,goal:15,stars:0,pips:[0,0,0,0,0,0],used:[],surpriseSeen:false,stage:'wheel',risk:false,bomb:false,medals:[],cat:0,qid:-1};
  save();render();return;
 }
 if(!state)return;
 if(cmd==='spin')return spin();
 if(cmd==='risk'){soloVibrate('tap');state.risk=true;startQuestion();return}
 if(cmd==='normal'){soloVibrate('tap');state.risk=false;startQuestion();return}
 if(cmd==='next'){soloVibrate('tap');return advance()}
 if(cmd==='option'&&state.stage==='question'&&state.options?.length===4){const i=Number(btn.dataset.idx);if(Number.isInteger(i)&&i>=0&&i<4&&!state.hiddenChoices?.includes(i))grade(state.options[i]);return}
 if(cmd==='mediaFail'&&state.stage==='question'){state.used.pop();state.asked=Math.max(0,state.asked-1);startQuestion();return}
 if(cmd==='submit'){e.preventDefault();let input=root.querySelector('#soloAnswer');if(input?.value.trim())grade(input.value);return}
 if(cmd==='hint'&&canUseSoloHint()){
  soloVibrate('hint');state.aids.hint--;
  if(state.options?.length===4){
   const wrong=state.options.map((v,i)=>({v,i})).filter(x=>!window.TRIVIA_MATCH(x.v,playerQuestion())&&!state.hiddenChoices.includes(x.i));
   for(const x of wrong.slice(0,2)){state.hiddenChoices.push(x.i);const btn=root.querySelector('[data-solo="option"][data-idx="'+x.i+'"]');if(btn)btn.disabled=true}
  }else{
   const {letterIndexes,visible}=soloHintParts();
   const available=letterIndexes.filter(i=>!visible.has(i));
   // Conservar siempre al menos una letra oculta.
   if(available.length>1){
    const next=available[Math.floor(Math.random()*available.length)];
    (state.hintPositions??=[]).push(next);
    state.hintUses=(state.hintUses||0)+1;
   }
  }
  save();
  const hint=root.querySelector('#soloHint');
  if(hint)hint.textContent=soloHintText();
  const b=root.querySelector('[data-solo="hint"]');
  if(b){b.textContent=(state.options?.length===4?'💡 50:50 · ':'💡 Pista · ')+state.aids.hint;b.disabled=!canUseSoloHint()}
  return;
 }
 if(cmd==='swap')return swapQuestion();
 if(cmd==='shield'&&state.stage==='question'&&state.aids.shield>0&&state.shields<2){
  soloVibrate('shield');state.aids.shield--;state.shields++;save();
  window.TRIVIA_FX?.show('shield','🛡️','ESCUDO ACTIVADO','+1 escudo: tu próximo fallo estará protegido');
  const chip=root.querySelector('[data-solo-stat="shields"]');
  if(chip){chip.textContent='🛡️ '+state.shields+' escudos';chip.setAttribute('aria-label',state.shields+' escudos disponibles');chip.classList.remove('solo-shield-gain');void chip.offsetWidth;chip.classList.add('solo-shield-gain')}
  const b=root.querySelector('[data-solo="shield"]');if(b){b.textContent='🛡️ Escudo · '+state.aids.shield;b.disabled=state.aids.shield===0||state.shields>=2}
  const n=root.querySelector('#soloHint');if(n)n.textContent='🛡️ Escudo activado (+1). Te protegerá al fallar.';
  return;
 }
});
root.addEventListener('submit',e=>{if(e.target.id==='soloAnswerForm'){e.preventDefault();const v=root.querySelector('#soloAnswer')?.value;if(v?.trim())grade(v)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopWheelVibration()});
document.getElementById('soloLaunch')?.addEventListener('click',open);
})();

(function TriviaFeedback(){
'use strict';
const style=document.createElement('style');
style.textContent="\n/* Feedback visual compartido entre solitario, ruleta y VS */\n.solo-progress{padding:10px 12px 9px;margin:10px 0 12px;border:1px solid #52688e;background:#0e1c35;border-radius:15px}\n.solo-progress-label{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:#c8dafa;font-weight:900;letter-spacing:.9px}\n.solo-progress-label strong{color:#ffe295;font-size:13px;letter-spacing:0}\n.solo-progress-track,.trivia-fx-track{height:10px;border-radius:20px;background:#0a1326;border:1px solid #52658d;overflow:hidden;position:relative}\n.solo-progress-track{margin:8px 0 4px}\n.solo-progress-track>span,.trivia-fx-track>span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#58c9d4,#a48bff,#ffd47f);box-shadow:0 0 12px #9cceff88;transition:width .7s cubic-bezier(.2,.8,.2,1)}\n.solo-progress-foot{font-size:10px;color:#a4b9db;text-align:right}\n.solo-pip.complete{animation:trivia-pip-glow 1s ease-out}\n.trivia-fx-progress{margin:7px 0 0;padding:0 4px 2px}\n.trivia-fx-caption{font-size:10px;font-weight:800;letter-spacing:.6px;color:#c9d5f0;display:flex;justify-content:space-between;margin-bottom:5px}\n.trivia-fx-track{height:8px}\n.trivia-fx-layer{position:fixed;inset:0;pointer-events:none;z-index:25000;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:16px;animation:trivia-overlay-enter .16s ease-out}\n.trivia-fx-shade{position:absolute;inset:0;background:radial-gradient(circle,#12183300 5%,#0b112350 90%);animation:trivia-overlay-fade 1.6s ease-out forwards}\n.trivia-fx-card{position:relative;isolation:isolate;min-width:min(78vw,285px);max-width:min(90vw,390px);text-align:center;border:2px solid var(--fx-color);border-radius:26px;background:linear-gradient(150deg,#263451f7,#0e1932f7);padding:20px 21px 21px;color:#fff;box-shadow:0 14px 60px #000c,0 0 45px var(--fx-glow);animation:trivia-reward-pop 1.62s ease-in-out both}\n.trivia-fx-symbol{font-size:clamp(57px,16vw,86px);line-height:1.1;display:block;margin:2px auto 8px;filter:drop-shadow(0 7px 12px var(--fx-glow));animation:trivia-symbol-bounce .8s ease-out}\n.trivia-fx-title{font-size:clamp(21px,6vw,31px);font-weight:1000;line-height:1.13;text-wrap:balance;letter-spacing:.3px}\n.trivia-fx-sub{font-size:14px;color:#dbe7ff;font-weight:650;margin-top:8px;line-height:1.25}\n.trivia-fx-layer.life .trivia-fx-card,.trivia-fx-layer.wrong .trivia-fx-card{animation:trivia-loss-pop 1.48s ease-in-out both}\n.trivia-fx-particle{position:absolute;left:50%;top:48%;width:8px;height:13px;border-radius:2px;background:var(--c);transform:translate(-50%,-50%);animation:trivia-confetti var(--t) cubic-bezier(.17,.65,.36,1) both;animation-delay:var(--delay)}\n.trivia-fx-layer.life .trivia-fx-symbol{animation:trivia-broken-heart .65s ease-out}\n.trivia-fx-layer.shield .trivia-fx-symbol{animation:trivia-shield-shine .8s ease-out}\n.trivia-fx-layer.crown .trivia-fx-symbol,.trivia-fx-layer.win .trivia-fx-symbol{animation:trivia-crown-rise .85s cubic-bezier(.1,.7,.2,1)}\n@keyframes trivia-overlay-enter{from{opacity:0}to{opacity:1}}\n@keyframes trivia-overlay-fade{0%{opacity:1}90%,100%{opacity:0}}\n@keyframes trivia-reward-pop{0%{opacity:0;transform:scale(.45) translateY(30px)}17%{opacity:1;transform:scale(1.10) translateY(-5px)}27%{transform:scale(1)}72%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.9) translateY(-20px)}}\n@keyframes trivia-loss-pop{0%{opacity:0;transform:scale(1.2)}15%{opacity:1;transform:scale(.95)}22%{transform:translateX(-11px)}30%{transform:translateX(10px)}38%{transform:translateX(-7px)}48%{transform:none}80%{opacity:1}100%{opacity:0;transform:scale(.95)}}\n@keyframes trivia-symbol-bounce{0%{transform:scale(.3) rotate(-20deg)}55%{transform:scale(1.2) rotate(9deg)}100%{transform:none}}\n@keyframes trivia-broken-heart{0%{transform:scale(1.3)}45%{transform:scale(.87) rotate(-17deg)}100%{transform:scale(1) rotate(0)}}\n@keyframes trivia-shield-shine{0%{transform:scale(.5) rotate(-17deg);filter:brightness(3)}60%{transform:scale(1.22) rotate(8deg)}100%{transform:scale(1)}}\n@keyframes trivia-crown-rise{0%{transform:translateY(50px) rotate(-15deg) scale(.5)}65%{transform:translateY(-12px) scale(1.2)}100%{transform:translateY(0) scale(1)}}\n@keyframes trivia-confetti{0%{opacity:1;transform:translate(-50%,-50%) rotate(0)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(var(--rot))}}\n@keyframes trivia-pip-glow{0%{filter:brightness(1)}35%{filter:brightness(1.9)}100%{filter:brightness(1)}}\n@media(prefers-reduced-motion:reduce){.trivia-fx-card,.trivia-fx-symbol,.trivia-fx-particle,.trivia-fx-shade,.solo-pip.complete{animation:none!important}.trivia-fx-layer{animation:none}.solo-progress-track>span,.trivia-fx-track>span{transition:none!important}}\n";
style.textContent+=' #players .trivia-fx-progress{margin:4px 0 0;padding:0} #players .trivia-fx-caption{font-size:9px;margin-bottom:2px} #players .trivia-fx-track{height:5px}';
style.textContent += "\n.trivia-fx-layer.shieldUsed .trivia-fx-card{animation:trivia-loss-pop 1.48s ease-in-out both}\n.trivia-fx-layer.shieldUsed .trivia-fx-symbol{animation:trivia-shield-break .7s ease-out both}\n.trivia-fx-layer.lifeEarned .trivia-fx-symbol{animation:trivia-heart-revive .85s cubic-bezier(.12,.72,.2,1) both}\n@keyframes trivia-shield-break{0%{transform:scale(1.25);filter:brightness(2)}44%{transform:scale(.89) rotate(-20deg);opacity:.7}100%{transform:scale(1) rotate(0);opacity:1}}\n@keyframes trivia-heart-revive{0%{transform:translateY(36px) scale(.4);opacity:.3}50%{transform:translateY(-12px) scale(1.35);opacity:1}100%{transform:none;opacity:1}}\n@media(prefers-reduced-motion:reduce){.trivia-fx-layer.shieldUsed .trivia-fx-card,.trivia-fx-layer.shieldUsed .trivia-fx-symbol,.trivia-fx-layer.lifeEarned .trivia-fx-symbol{animation:none!important}}\n";
document.head.appendChild(style);
const colors={shield:['#6edcf1','#6edcf155'],crown:['#ffd676','#ffcf535c'],win:['#ffd676','#ffcf535c'],life:['#ff788d','#f756775b'],lifeEarned:['#82f3c6','#5ee5ac7a'],shieldUsed:['#f5b774','#f5b77470'],wrong:['#ff788d','#f756775b'],right:['#67ecc0','#67ecc05b'],round:['#a99aff','#aa99ff50'],end:['#a5b8dd','#9dabdd45']};
let cleanup=0,notificationToken=0;
function show(type,symbol,title,description){
 const tone=colors[type]||colors.round;
 if(cleanup)clearTimeout(cleanup);
 document.querySelectorAll('.trivia-fx-layer').forEach(e=>e.remove());
 const layer=document.createElement('div');
 layer.className='trivia-fx-layer '+type;
 layer.setAttribute('aria-hidden','true');
 layer.style.setProperty('--fx-color',tone[0]);layer.style.setProperty('--fx-glow',tone[1]);
 const shade=document.createElement('div');shade.className='trivia-fx-shade';layer.append(shade);
 const card=document.createElement('div');card.className='trivia-fx-card';
 for(const [cls,content] of [['trivia-fx-symbol',symbol],['trivia-fx-title',title],['trivia-fx-sub',description||'']]){
  const node=document.createElement('div');node.className=cls;node.textContent=content;card.append(node);
 }
 layer.append(card);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&['crown','shield','lifeEarned','win','right','round'].includes(type)){
  for(let i=0;i<30;i++){
   const particle=document.createElement('i');particle.className='trivia-fx-particle';
   const angle=Math.PI*2*i/30,spread=70+Math.random()*Math.min(200,innerWidth*.28);
   particle.style.setProperty('--c',['#ffd775','#78efc1','#aa9aff','#fff1ba'][i%4]);
   particle.style.setProperty('--dx',Math.cos(angle)*spread+'px');
   particle.style.setProperty('--dy',(Math.sin(angle)*spread+150)+'px');
   particle.style.setProperty('--rot',(Math.random()*960-480)+'deg');
   particle.style.setProperty('--t',(1.1+Math.random()*.65)+'s');
   particle.style.setProperty('--delay',(Math.random()*.16)+'s');
   layer.append(particle);
  }
 }
 document.body.appendChild(layer);
 const token=++notificationToken;
 cleanup=setTimeout(()=>{if(token===notificationToken)layer.remove();cleanup=0},1800);
}
let sequenceTimers=[];
function cancel(){
 sequenceTimers.forEach(clearTimeout);sequenceTimers=[];
 if(cleanup){clearTimeout(cleanup);cleanup=0}
 document.querySelectorAll('.trivia-fx-layer').forEach(el=>el.remove());
}
function play(events){
 cancel();
 const items=Array.isArray(events)?events.filter(Boolean):[];
 items.forEach((event,i)=>{
  const display=()=>show(event.type,event.symbol,event.title,event.description);
  if(i===0)display();
  else sequenceTimers.push(setTimeout(display,i*1700));
 });
}
window.TRIVIA_FX={show,play,cancel};
const progress=(value,max,label)=>{
 const n=Math.max(0,Math.min(max,Number(value)||0));
 return '<div class="trivia-fx-progress"><div class="trivia-fx-caption"><span>'+label+'</span><span>'+n+' / '+max+'</span></div><div class="trivia-fx-track" role="progressbar" aria-valuenow="'+n+'" aria-valuemin="0" aria-valuemax="'+max+'"><span style="width:'+(n/max*100)+'%"></span></div></div>';
};
let previousKey='',previousData=null,queued=false;
const getNumber=(text)=>Number(String(text||'').match(/\d+/)?.[0]||0);
function observeState(){
 queued=false;
 const online=document.getElementById('onlineRoot');
 const inOnline=online&&!online.hidden;
 const solo=document.getElementById('soloRoot');
 if(solo&&!solo.hidden){previousKey='';previousData=null;return}
 if(inOnline){
  const view=document.getElementById('onlineView');
  if(!view)return;
  const roomMarker=view.querySelector('.online-kicker')?.textContent||'';
  const key='online:'+roomMarker.match(/SALA\s+([A-Z0-9]{6})/)?.[1];
  const versus=!!view.querySelector('.vs-scoreboard');
  if(versus){
   const nodes=[...view.querySelectorAll('.vs-scoreboard .vs-player')];
   if(nodes.length!==2)return;
   const scores=nodes.map(n=>getNumber(n.querySelector('.vs-points')?.textContent));
   const roundText=view.querySelector('.vs-round-badge')?.textContent||'';
   const m=roundText.match(/RONDA\s+(\d+)\s*\/\s*(\d+)/i);
   if(m){
    const value=Number(m[1]),max=Number(m[2]);
    const bar=progress(Math.min(value,max),max,'RONDA ACTUAL');
    const holder=view.querySelector('.vs-round-badge');
    if(holder&&!holder.nextElementSibling?.classList.contains('trivia-fx-progress'))holder.insertAdjacentHTML('afterend',bar);
   }
   const cheeses=nodes.map(n=>getNumber(n.querySelector('.vs-cheese-score')?.textContent));
   const here=key+':vs';
   if(previousKey===here&&previousData){
    const self=nodes.findIndex(n=>n.classList.contains('self'));
    if(self>=0){
     const gain=scores[self]-(previousData.scores?.[self]||0);
     const cheeseChange=cheeses[self]-(previousData.cheeses?.[self]||0);
     if(cheeseChange>0)show('crown','🧀','¡QUESITO CONSEGUIDO!','Ahora tienes '+cheeses[self]+' quesitos');
     else if(cheeseChange<0)show('shieldUsed','🧀','¡TE HAN ROBADO UN QUESITO!','Defiéndete en la siguiente ronda');
     else if(gain<0)show('life','💥','PENALIZACIÓN DE PUNTOS',gain+' puntos en esta ronda');
     else if(gain>0)show('right','⚡','+'+gain+' PUNTOS','¡Buen resultado en el duelo!');
     else if(scores[1-self]>(previousData.scores?.[1-self]||0))show('round','⚔️','PUNTÚA TU RIVAL','La siguiente ronda puede cambiar el marcador');
    }
   }
   previousKey=here;previousData={scores,cheeses};return;
  }
  const cards=[...view.querySelectorAll('.online-players .online-player')];
  if(cards.length!==2)return;
  const scores=cards.map(n=>getNumber(n.querySelector('.score')?.textContent));
  const shields=cards.map(n=>getNumber(n.querySelector('small')?.textContent?.split('🛡️')[1]));
  cards.forEach((card,i)=>{if(!card.querySelector('.trivia-fx-progress'))card.insertAdjacentHTML('beforeend',progress(scores[i],6,'QUESITOS CONSEGUIDOS'))});
  const here=key+':roulette';
  if(previousKey===here&&previousData){
   const earned=scores.findIndex((n,i)=>n>(previousData.scores?.[i]||0));
   const lost=scores.findIndex((n,i)=>n<(previousData.scores?.[i]||0));
   if(earned>=0)show('crown','🧀','¡QUESITO CONSEGUIDO!',cards[earned].querySelector('b')?.textContent||'');
   else if(lost>=0)show('life','💔','QUESITO PERDIDO',cards[lost].querySelector('b')?.textContent||'');
   else {
    const gained=shields.findIndex((n,i)=>n>(previousData.shields?.[i]||0));
    const spent=shields.findIndex((n,i)=>n<(previousData.shields?.[i]||0));
    if(gained>=0)show('shield','🛡️','ESCUDO CONSEGUIDO','Giro protegido disponible');
    else if(spent>=0)show('shield','🛡️','ESCUDO UTILIZADO','Giro protegido');
   }
  }
  previousKey=here;previousData={scores,shields};return;
 }
 const game=document.getElementById('game');
 if(!game||game.classList.contains('hide')){previousKey='';previousData=null;return}
 const cards=[...document.querySelectorAll('#players .mini-player')];
 if(!cards.length)return;
 const scores=cards.map(n=>getNumber(n.querySelector('.number')?.textContent));
 cards.forEach((card,i)=>{
  if(!card.querySelector('.trivia-fx-progress'))card.insertAdjacentHTML('beforeend',progress(scores[i],6,'QUESITOS'));
  card.querySelectorAll('.q-dot').forEach(dot=>{
   const done=Math.max(0,Math.min(3,Number((dot.title.split(': ').pop()||'0').split('/')[0])||0));
   dot.style.background='linear-gradient(90deg,var(--cheese-color) '+(done/3*100)+'%,#2d3a56 '+(done/3*100)+'%)';
  });
 });
 const here='local:'+cards.map(n=>n.querySelector('.player-name')?.textContent).join('|');
 if(previousKey===here&&previousData){
  const earned=scores.findIndex((n,i)=>n>(previousData.scores?.[i]||0));
  const lost=scores.findIndex((n,i)=>n<(previousData.scores?.[i]||0));
  if(earned>=0)show('crown','🧀','¡QUESITO CONSEGUIDO!',cards[earned].querySelector('.player-name')?.textContent||'');
  else if(lost>=0)show('life','💔','QUESITO PERDIDO',cards[lost].querySelector('.player-name')?.textContent||'');
 }
 previousKey=here;previousData={scores};
}
const observer=new MutationObserver(()=>{
 if(queued)return;
 queued=true;
 requestAnimationFrame(observeState);
});
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
requestAnimationFrame(observeState);
})();
