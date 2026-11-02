/* Trivial Seis · carga validada de 100 nuevas preguntas especiales por categoría.
   Se añaden únicamente a la colección especial (modos solitario y VS).
   El banco tradicional de la ruleta y sus índices permanecen intactos.
*/
(function(){
'use strict';
const defs=[
 ['historia',window.TRIVIA_SPECIAL_2026_HISTORIA],
 ['arte',window.TRIVIA_SPECIAL_2026_ARTE],
 ['geo',window.TRIVIA_SPECIAL_2026_GEO],
 ['cine',window.TRIVIA_SPECIAL_2026_CINE],
 ['lit',window.TRIVIA_SPECIAL_2026_LIT],
 ['mix',window.TRIVIA_SPECIAL_2026_MIX]
];
const normal=s=>String(s??'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const old=window.TRIVIA_BONUS_QUIZ;
if(!Array.isArray(old)){console.error('No se ha cargado el banco anterior de preguntas especiales.');return;}
if(old.some(q=>q?.[8]?.edition==='especiales2026'))return;
const previous=new Set(old.map(q=>normal(q[2])));
const seen=new Set(previous);
const output=[];
const counts={};
for(const [category,items] of defs){
 if(!Array.isArray(items)||items.length!==100){
  console.error('Banco especial incompleto:',category,items?.length);
  return;
 }
 let count=0;
 for(const item of items){
  const {q,a,d,topic}=item||{};
  if(typeof q!=='string'||typeof a!=='string'||!Array.isArray(d)||d.length!==3||
      typeof topic!=='string'||!q.startsWith('¿')||!q.endsWith('?')){
   console.error('Enunciado especial inválido:',category,q);return;
  }
  const key=normal(q);
  if(!key||seen.has(key)){console.error('Enunciado repetido:',category,q);return;}
  const answers=[a,...d].map(x=>String(x).trim());
  if(answers.some(x=>!x)||new Set(answers.map(normal)).size!==4){
   console.error('Opciones repetidas o vacías:',category,q);return;
  }
  seen.add(key);
  // Rotación reproducible: repartir la respuesta correcta entre los cuatro botones.
  let h=2166136261;
  for(const c of q){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
  const position=(h>>>0)%4;
  const options=answers.slice(1);
  options.splice(position,0,answers[0]);
  const isWrong=/\bNO\b|incorrect[ao]s?|equivocad[ao]s?|intrus[ao]/i.test(q);
  const variant=isWrong?'intruso':'eleccion';
  output.push([category,'dificil',q,a,[],'','especial:ampliacion-2026:'+topic,variant,
   {special_choice:true,options,variant,subtopic:topic,edition:'especiales2026'}]);
  count++;
 }
 counts[category]=count;
}
if(output.length!==600||Object.values(counts).some(n=>n!==100))return;
old.push(...output);
window.TRIVIA_SPECIAL_2026_COUNTS={total:output.length,byCategory:counts,all:old.length};
})();

/* 2026-11-02 · Corrección editorial de respuestas largas.
   Se ejecuta al final de todas las ampliaciones, antes de crear modos y salas.
   No elimina ni reordena preguntas; preserva sus índices para partidas en curso. */
(function(){
'use strict';
window.TRIVIA_BANK_PATCHES ??= [];
const fixes=new Map([["¿Qué es una reforma del sistema electoral?","¿Cómo se llama la modificación de las reglas que convierten los votos en escaños?","Reforma electoral"],["¿Qué significa que los actos del rey necesiten refrendo?","¿Cómo se llama la firma que valida los actos del rey y atribuye su responsabilidad a otra autoridad?","Refrendo"],["¿Qué significa que el voto sea secreto?","¿Qué característica del sufragio garantiza que nadie tenga que revelar su voto?","Secreto"],["¿Qué significa que una elección use listas cerradas y bloqueadas?","¿Qué tipo de listas electorales impide al votante alterar el orden de los candidatos?","Listas cerradas y bloqueadas"],["¿Qué función tiene la Junta Electoral Central?","¿Qué órgano supervisa y garantiza el desarrollo de los procesos electorales en España?","Junta Electoral Central"],["¿Qué valores superiores del ordenamiento menciona el artículo 1 de la Constitución?","¿Qué valor superior del artículo 1 de la Constitución española protege la diversidad de ideas políticas?","Pluralismo político"],["¿Qué significa que una comparecencia parlamentaria?","¿Cómo se llama la intervención de una autoridad ante una cámara para dar explicaciones?","Comparecencia"],["¿Qué significa una comparecencia parlamentaria?","¿Cómo se llama la intervención de una autoridad ante una cámara para dar explicaciones?","Comparecencia"],["¿Qué significa que un grupo parlamentario esté en la oposición?","¿Cómo se llama al conjunto de grupos parlamentarios que no forman parte del Gobierno y lo fiscalizan?","Oposición"],["¿Qué diferencia la mayoría simple de la absoluta?","¿Qué mayoría parlamentaria requiere más votos a favor que en contra, sin exigir la mitad más uno de los miembros?","Mayoría simple"],["¿Qué significa que España sea un Estado descentralizado?","¿Cómo se denomina un Estado que reparte competencias entre distintos niveles territoriales de gobierno?","Estado descentralizado"],["¿Qué es un voto particular en una sentencia?","¿Cómo se llama la opinión que un magistrado incorpora a una resolución para expresar su discrepancia?","Voto particular"],["¿Qué diferencia al federalismo del centralismo?","¿Qué modelo territorial reparte competencias entre las entidades federadas?","Federalismo"],["¿Qué diferencia un referéndum de unas elecciones generales?","¿Cómo se llama una consulta popular directa sobre una decisión política?","Referéndum"],["¿Qué se entiende por voto en blanco?","¿Qué tipo de voto válido no expresa preferencia por ninguna candidatura?","Voto en blanco"],["¿Qué significa una elección con listas cerradas y bloqueadas?","¿Qué tipo de listas impide modificar el orden de los candidatos?","Listas cerradas y bloqueadas"],["¿Qué significa que un Estado sea de derecho?","¿Cómo se llama el Estado en el que los poderes públicos están sometidos a la ley?","Estado de derecho"],["¿Qué significa que una ley tenga efectos retroactivos?","¿Cómo se denomina la aplicación de una ley a hechos anteriores a su entrada en vigor?","Retroactividad"],["¿Qué significa que una comunidad autónoma tenga competencias propias?","¿Cómo se llaman las materias que una comunidad autónoma puede gestionar por atribución legal?","Competencias propias"],["¿Qué diferencia al sistema de mayorías del proporcional?","¿Qué sistema electoral distribuye los escaños aproximadamente según el porcentaje de voto?","Representación proporcional"],["¿Qué limitación general afecta a un Gobierno en funciones?","¿Cómo se denomina un Gobierno cuya actividad se limita, por regla general, al despacho ordinario de los asuntos públicos?","Gobierno en funciones"],["¿Qué presidente estadounidense aparece en los billetes de cien dólares?","¿Qué personaje histórico estadounidense aparece en los billetes de cien dólares?","Benjamin Franklin"],["¿Cuáles fueron los seis Estados fundadores de la Comunidad Económica Europea?","¿Cuántos Estados fundaron la Comunidad Económica Europea en 1957?","Seis"],["¿Qué tribunal interpreta el Derecho de la Unión Europea?","¿Con qué siglas se conoce al Tribunal de Justicia de la Unión Europea?","TJUE"],["¿Qué organización regional de Asia sudoriental se conoce por las siglas ASEAN?","¿Qué siglas corresponden a la Asociación de Naciones de Asia Sudoriental?","ASEAN"],["¿Qué institución asesora al Gobierno andaluz en cuestiones socioeconómicas?","¿Qué consejo andaluz asesora al Gobierno autonómico en cuestiones socioeconómicas?","Consejo Económico y Social"],["¿Qué institución independiente vela por el acceso a la información pública estatal?","¿Cómo se abrevia el Consejo de Transparencia y Buen Gobierno de España?","CTBG"],["¿Qué dos instituciones aprueban normalmente las leyes europeas mediante el procedimiento legislativo ordinario?","¿Qué órgano comparte con el Parlamento Europeo la aprobación de la legislación ordinaria de la UE?","Consejo de la Unión Europea"],["¿Qué significa la expresión «cohabitación» en el sistema francés?","¿Cómo se llama en Francia la situación en que el presidente y el primer ministro pertenecen a distintas mayorías políticas?","Cohabitación"],["¿Qué significan las siglas PAH?","¿Qué siglas utiliza la Plataforma de Afectados por la Hipoteca?","PAH"],["¿Qué ley educativa aprobada durante el Gobierno de Rajoy se conoce como LOMCE?","¿Con qué siglas se conoce la ley educativa aprobada en 2013 durante el Gobierno de Rajoy?","LOMCE"],["¿Qué ley educativa de 2020 se conoce como LOMLOE?","¿Qué siglas identifican la ley educativa española aprobada en 2020?","LOMLOE"],["¿Qué ley española de 2022 es conocida como la del «solo sí es sí»?","¿En qué año se aprobó en España la ley conocida como la del «solo sí es sí»?","2022"],["¿Qué instrumento europeo permitió financiar inversiones españolas después de 2020?","¿Con qué siglas se conoce el Mecanismo de Recuperación y Resiliencia de la UE?","MRR"],["¿Qué elección española de 1977 fue la primera democrática desde la Segunda República?","¿En qué mes se celebraron las primeras elecciones generales democráticas en España tras la dictadura?","Junio"],["¿Qué elecciones españolas de 1977 fueron las primeras generales democráticas desde la Segunda República?","¿En qué mes se celebraron las primeras elecciones generales democráticas en España tras la dictadura?","Junio"],["¿Qué documento de 1789 proclamó en Francia derechos fundamentales tras la Revolución?","¿En qué año se proclamó en Francia la Declaración de los Derechos del Hombre y del Ciudadano?","1789"],["¿Qué acontecimiento histórico se relaciona con marqués de Lafayette en 1789?","¿Con qué revolución está relacionada la Declaración de los Derechos del Hombre y del Ciudadano de 1789?","Revolución francesa"],["¿Qué institución estatal franquista se encargó de abastecimientos y racionamientos durante la posguerra?","¿Bajo qué régimen español funcionó la Comisaría General de Abastecimientos y Transportes?","Franquismo"],["¿Qué tribunal internacional se creó en 1993 para juzgar crímenes cometidos en la antigua Yugoslavia?","¿En qué año se creó el tribunal de la ONU para juzgar los crímenes cometidos en la antigua Yugoslavia?","1993"],["¿Qué declaración aprobada en agosto de 1789 proclamó derechos y libertades fundamentales?","¿En qué país se aprobó en agosto de 1789 la Declaración de los Derechos del Hombre y del Ciudadano?","Francia"],["¿Qué es una ciudad dormitorio?","¿Cómo se llama un núcleo residencial cuyos habitantes trabajan mayoritariamente fuera de él?","Ciudad dormitorio"],["¿Qué criterio de Gaussen identifica un mes seco en un climograma?","Según el criterio de Gaussen, ¿cuántas veces la temperatura media mensual (°C) debe superar o igualar a la precipitación (mm) para considerar seco un mes?","La mitad"],["¿A qué se refiere la expresión «transición demográfica»?","¿Cómo se llama el proceso de paso de altas a bajas tasas de natalidad y mortalidad?","Transición demográfica"],["¿Qué película de 1994 narra un viaje de tres artistas drag en autobús a través de Australia?","¿Qué autobús da nombre a la película australiana de 1994 sobre tres artistas drag?","Priscilla"],["¿Qué película de los hermanos Lumière muestra la llegada de un tren a una estación?","¿Qué medio de transporte llega a la estación de La Ciotat en la película de los hermanos Lumière?","Tren"],["¿Qué conducta de los dioses representa Aracne en el tapiz con el que compite contra Atenea?","¿Con qué diosa compite Aracne en el concurso de tejido narrado por Ovidio?","Atenea"],["¿Cómo demuestra Ulises su identidad a Penélope mediante un secreto de su alcoba?","¿Alrededor de qué árbol construyó Ulises el lecho que permitió reconocerlo a Penélope?","Olivo"],["¿De qué obra se habla en la siguiente pista: tres figuras reunidas en composición piramidal ante un paisaje montañoso?","¿Qué artista pintó a santa Ana, la Virgen y el Niño en una composición piramidal?","Leonardo da Vinci"],["¿Cómo se llama la obra descrita como una gran nave ferroviaria de estructura metálica hoy integrada en un jardín tropical?","¿En qué estación madrileña se conserva una antigua nave de hierro transformada en jardín tropical?","Atocha"],["¿Qué obra corresponde a esta descripción: unas bóvedas pintadas con escenas bíblicas conocidas como capilla sixtina del románico?","¿En qué colegiata leonesa se encuentra el Panteón de los Reyes, conocido como la capilla sixtina del románico?","San Isidoro de León"],["¿Qué obra corresponde a esta descripción: un retrato cortesano donde destaca el vestido de brocado de la duquesa?","¿Qué pintor manierista retrató a Leonor de Toledo con su hijo Giovanni?","Bronzino"],["¿Qué obra encaja con la descripción «una escena de vida urbana próspera en el Palazzo Pubblico»?","¿Qué pintor sienés realizó los frescos del Buen Gobierno en el Palazzo Pubblico?","Ambrogio Lorenzetti"],["¿Qué obra encaja con la descripción «una cena sagrada en diagonal iluminada por una lámpara y ángeles»?","¿Qué pintor veneciano realizó la Última Cena de San Giorgio Maggiore?","Tintoretto"],["¿Qué obra encaja con la descripción «una pareja escultórica de mármol se abraza en un delicado movimiento circular»?","¿Qué escultor neoclásico creó Psique reanimada por el beso del Amor?","Antonio Canova"],["¿Qué obra encaja con la descripción «una figura humana metálica parece avanzar fundida con el aire»?","¿Qué escultor futurista creó Formas únicas de continuidad en el espacio?","Umberto Boccioni"],["¿Qué obra corresponde a esta descripción: un templo de planta central con un núcleo octogonal inscrito?","¿En qué ciudad se levanta la iglesia bizantina de los Santos Sergio y Baco?","Estambul"],["¿Qué obra corresponde a esta descripción: una sala de lectura cubierta por nueve cúpulas apoyadas en columnas finas?","¿Qué arquitecto francés diseñó la célebre sala de lectura de la Biblioteca Nacional de París?","Henri Labrouste"],["¿De qué obra se habla en la siguiente pista: unos cirujanos observan la disección de un brazo?","¿Qué pintor neerlandés retrató la lección de anatomía del doctor Tulp?","Rembrandt"],["¿Qué obra encaja con la descripción «unas hojas de bronce con escenas de san Juan Bautista y virtudes»?","¿Qué escultor realizó las puertas meridionales del Baptisterio de Florencia?","Andrea Pisano"],["¿Qué obra encaja con la descripción «una cúpula decorada con el milagro de un santo ante un gentío popular»?","¿Qué pintor decoró con frescos la ermita de San Antonio de la Florida?","Goya"],["¿Cómo se llama la obra descrita como Cristo flanqueado por María y Juan el Bautista en actitud de súplica?","¿En qué basílica de Estambul se conserva el famoso mosaico bizantino de la Déesis?","Santa Sofía"],["¿Cómo se llama la obra descrita como una entrada monumental nazarí de recodo con arco de herradura?","¿En qué conjunto palatino granadino se encuentra la Puerta de la Justicia?","Alhambra"],["¿Cómo se llama la obra descrita como una capilla de muros curvos gruesos y cubierta de forma escultórica?","¿Qué arquitecto diseñó la capilla de Notre-Dame du Haut de Ronchamp?","Le Corbusier"],["¿Qué obra corresponde a esta descripción: una pintura mural que sitúa a los apóstoles alrededor de Cristo tras anunciar la traición?","¿Quién pintó La última cena en el refectorio de Santa Maria delle Grazie de Milán?","Leonardo da Vinci"],["¿Quiénes son los autores de «Basílica de Santa Sofía»?","¿Qué arquitecto colaboró con Isidoro de Mileto en el diseño de Santa Sofía de Constantinopla?","Antemio de Tralles"],["¿Qué director o directora realizó «Spider-Man: Un nuevo universo», estrenada en 2018?","¿Qué director codirigió Spider-Man: Un nuevo universo (2018) junto con Peter Ramsey y Rodney Rothman?","Bob Persichetti"],["¿Qué película de 2011 lleva a un periodista y una hacker a investigar una desaparición en Suecia?","¿Qué director estadounidense realizó la adaptación cinematográfica de Millennium: Los hombres que no amaban a las mujeres (2011)?","David Fincher"]].map(([before,q,a])=>[normal(before),{q,a}]));
const events=new Map([["Unificación tradicional del Alto y Bajo Egipto","Unificación de Egipto"],["Construcción de la Gran Pirámide de Guiza","Construcción de la Gran Pirámide"],["Batalla de Megido en tiempos de la XVIII dinastía","Batalla de Megido"],["Batalla de Qadesh entre egipcios e hititas","Batalla de Qadesh"],["Caída de Nínive ante medos y babilonios","Caída de Nínive"],["Reformas legislativas de Solón en Atenas","Reformas de Solón"],["Reformas políticas de Clístenes en Atenas","Reformas de Clístenes"],["Comienzo de la construcción del Partenón","Construcción del Partenón"],["Batalla de Heraclea entre Roma y Pirro","Batalla de Heraclea"],["Quema de libros ordenada por los Qin","Quema de libros"],["Primera misión de Zhang Qian al oeste","Misión de Zhang Qian"],["Incendio de Roma en época de Nerón","Incendio de Roma"],["Fundación del reino de Wei por Cao Pi","Fundación del reino de Wei"],["Edicto de Milán sobre tolerancia religiosa","Edicto de Milán"],["Consagración de Santa Sofía de Constantinopla","Consagración de Santa Sofía"],["Batalla de Taginae contra los ostrogodos","Batalla de Taginae"],["Fracaso del gran asedio omeya de Constantinopla","Fracaso del asedio de Constantinopla"],["Batalla de Poitiers frente a los omeyas","Batalla de Poitiers"],["Proclamación del Emirato independiente de Córdoba","Emirato independiente de Córdoba"],["Cristianización oficial de la Rus de Kiev","Cristianización de la Rus de Kiev"],["Cisma entre las iglesias latina y griega","Cisma de Oriente"],["Concilio de Clermont que impulsó la cruzada","Concilio de Clermont"],["Caída del último gran bastión cruzado de Acre","Caída de Acre"],["Primeros Estados Generales de Felipe IV","Estados Generales"],["Traslado de la corte pontificia a Aviñón","Papado de Aviñón"],["Peregrinación de Mansa Musa a La Meca","Peregrinación de Mansa Musa"],["Inicio de la Guerra de los Cien Años","Guerra de los Cien Años"],["Fin del Cisma de Occidente en Constanza","Fin del Cisma de Occidente"],["Liberación de Orleans durante la Guerra de los Cien Años","Liberación de Orleans"],["Toma de Granada por los Reyes Católicos","Toma de Granada"],["Paso portugués del cabo de Buena Esperanza","Paso del cabo de Buena Esperanza"],["Llegada de Vasco da Gama a Calicut","Llegada a Calicut"],["Llegada de Cabral a la costa brasileña","Llegada a Brasil"],["Publicación del De revolutionibus de Copérnico","De revolutionibus"],["Expedición de la Armada española contra Inglaterra","Armada Invencible"],["Fundación de la Compañía Inglesa de las Indias Orientales","Compañía de las Indias Orientales"],["Fundación del asentamiento de Jamestown","Fundación de Jamestown"],["Publicación del Diálogo sobre los dos máximos sistemas","Diálogo de Galileo"],["Inicio del gobierno personal de Luis XIV","Gobierno personal de Luis XIV"],["Inicio de la Guerra de Sucesión española","Guerra de Sucesión española"],["Conquista anglo-neerlandesa de Gibraltar","Toma de Gibraltar"],["Acta de Unión de Inglaterra y Escocia","Acta de Unión"],["Comienzo de la guerra de los Siete Años","Guerra de los Siete Años"],["Declaración de Independencia de Estados Unidos","Declaración de Independencia"],["Convención de Filadelfia y redacción constitucional","Convención de Filadelfia"],["Instalación de la primera colonia británica en Sídney","Fundación de Sídney"],["Proclamación de la Primera República Francesa","Primera República Francesa"],["Levantamiento del Dos de Mayo en Madrid","Levantamiento del Dos de Mayo"],["Consumación de la independencia de México","Independencia de México"],["Revolución de Viena y caída de Metternich","Revolución de Viena"],["Revolución rusa de 1905 y Domingo Sangriento","Revolución rusa de 1905"],["Armisticio del frente occidental de la Primera Guerra Mundial","Armisticio de 1918"],["Sublevación militar que inició la Guerra Civil española","Golpe de Estado de 1936"],["Independencia de India del dominio británico","Independencia de India"],["Proclamación de la República Popular China","República Popular China"],["Llegada del Apolo 11 a la Luna","Llegada a la Luna"],["Primeras elecciones multirraciales sudafricanas","Elecciones multirraciales sudafricanas"],["Inicio de la invasión rusa a gran escala de Ucrania","Invasión rusa de Ucrania"],["Declaración de los Derechos del Hombre y del Ciudadano en Francia","Declaración de Derechos de 1789"],["Aprobación de la primera Constitución francesa","Constitución francesa de 1791"],["Congreso de Viena tras las guerras napoleónicas","Congreso de Viena"],["Intervención de los Cien Mil Hijos de San Luis","Cien Mil Hijos de San Luis"],["Convenio de Vergara durante la primera guerra carlista","Convenio de Vergara"],["Convención de Seneca Falls por los derechos de las mujeres","Convención de Seneca Falls"],["Publicación de El origen de las especies","El origen de las especies"],["Fundación de la Primera Internacional obrera","Primera Internacional"],["Proclamación de la Primera República española","Primera República española"],["Primer vuelo controlado a motor de los hermanos Wright","Primer vuelo a motor"],["Golpe de Estado de Miguel Primo de Rivera","Golpe de Primo de Rivera"],["Marcha de la Sal contra el monopolio británico","Marcha de la Sal"],["Declaración Universal de los Derechos Humanos","Declaración Universal de Derechos Humanos"],["Acuerdo de París sobre el cambio climático","Acuerdo de París"],["Retirada final de las tropas estadounidenses de Afganistán","Retirada de Afganistán"]]);
function normal(x){return String(x??'').toLocaleLowerCase('es').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function longAnswer(a){const words=String(a).trim().split(/\s+/).length;
 return String(a).length>38 || words>=7}
function invert(question,answer){
 // Las definiciones no pueden exigir la reproducción literal de frases enteras.
 let m=question.match(/^¿Qué (?:es|son) (?:un |una |el |la |los |las )?(.+)\?$/i)
 ||question.match(/^¿Qué se (?:entiende por|conoce como|considera) (?:un |una |el |la |los |las )?(.+)\?$/i)
 ||question.match(/^¿Qué (?:significa|expresa) (?:la expresión |el término |el concepto |un |una |el |la )?(.+)\?$/i)
 ||question.match(/^¿Qué son (?:las |los )?(.+)\?$/i)
 ||question.match(/^¿En qué consiste (?:el |la )?(.+)\?$/i)
 ||question.match(/^¿A qué se refiere (?:la expresión )?(.+)\?$/i);
 if(!m)return null;
 let concept=m[1].replace(/[«»]/g,'').replace(/^(?:un|una|el|la|los|las)\s+/i,'')
   .replace(/\s+en (?:España|Estados Unidos|el sistema francés|una sentencia|la política estadounidense|un parlamento)$/i,'').trim();
 if(/^que\b/i.test(concept) || concept.length>36 || concept.split(/\s+/).length>5)return null;
 let definition=answer.replace(/[.。]$/,'').trim();
 if(definition.length<20)return null;
 // La pista es la antigua explicación; la respuesta es ahora el término preciso.
 return {q:'¿Qué concepto corresponde a esta definición: «'+
  definition.charAt(0).toLowerCase()+definition.slice(1)+'»?',a:concept.charAt(0).toUpperCase()+concept.slice(1)};
}
function abbreviation(question,answer){
 // Evita exigir que se memorice cada palabra de los nombres oficiales largos.
 const match=question.match(/^¿Qué (?:significan? (?:las siglas|la sigla)|significa) ([A-ZÁÉÍÓÚ0-9]{2,9})(?:\s+.*)?\?$/);
 if(match)return {q:'¿Qué siglas corresponden a «'+answer+'»?',a:match[1]};
 const match2=question.match(/^¿Qué organización se conoce por las siglas ([A-Z0-9]{2,9})\?$/);
 if(match2)return {q:'¿Qué siglas corresponden a «'+answer+'»?',a:match2[1]};
 return null;
}
window.TRIVIA_BANK_PATCHES.push(function(){
 const bank=window.GAME_BANK;
 if(!Array.isArray(bank))return;
 const counts={manual:0,historical:0,acronyms:0,definitions:0,remaining:0,reviewed:0};
 const leftovers=[];
 for(const row of bank){
  if(!Array.isArray(row)||typeof row[2]!=='string'||typeof row[3]!=='string'
   ||!longAnswer(row[3])||row[8]?.special_choice||row[8]?.surprise)continue;
  const oldQ=row[2],oldA=row[3];
  counts.reviewed++;
  const one=fixes.get(normal(oldQ));
  if(one){
   row[2]=one.q;row[3]=one.a;row[4]=[];
   counts.manual++;continue;
  }
  if(events.has(oldA)){
   row[3]=events.get(oldA);
   row[4]=Array.from(new Set([...(Array.isArray(row[4])?row[4]:[]),oldA]));
   counts.historical++;continue;
  }
  const result=abbreviation(oldQ,oldA);
  if(result){
   row[2]=result.q;row[3]=result.a;row[4]=[];
   counts.acronyms++;continue;
  }
  const concept=invert(oldQ,oldA);
  if(concept){
   row[2]=concept.q;row[3]=concept.a;row[4]=[];
   counts.definitions++;continue;
  }
  leftovers.push({cat:row[0],question:oldQ,answer:oldA});
 }
 counts.remaining=leftovers.length;
 window.TRIVIA_SHORT_ANSWERS_AUDIT={...counts,remainingExamples:leftovers.slice(0,40)};
 if(counts.remaining)console.info('Preguntas de respuesta extensa pendientes de revisión:',counts.remaining);
});
})();
