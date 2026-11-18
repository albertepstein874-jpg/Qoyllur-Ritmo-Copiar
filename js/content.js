/* Contenido de aprendizaje. Cada ficha mantiene enlazadas sus fuentes y créditos visuales. */
window.QR_CONTENT = {
  categories: [
    { id: 'danzas', title: 'Danzas del Perú', short: 'Danzas', description: 'Pasos, música e historias que nacen en comunidades de costa, Andes y Amazonía.', icon: '✺', tone: 'clay', label: '3 lecciones' },
    { id: 'musica', title: 'Música peruana', short: 'Música', description: 'Instrumentos y prácticas musicales transmitidos en distintos territorios.', icon: '♫', tone: 'blue', label: '3 lecciones' }
  ],
  lessons: [
    {
      id: 'marinera', category: 'danzas', region: 'Varias regiones', title: 'Marinera: variantes y expresiones locales', shortTitle: 'Marinera', duration: '4 min',
      objective: 'Reconocer que la marinera se practica en distintas regiones y que sus formas locales tienen características propias.',
      summary: 'Una tradición compartida con muchas expresiones locales.',
      intro: 'La marinera no suena ni se baila igual en todas partes. Sus formas regionales guardan rasgos propios de las comunidades donde se practican.',
      sections: [
        { heading: 'Un nombre, muchos lugares', body: 'Hay marineras de Lima, del norte, de Puno, Arequipa, Ayacucho y Lamas, entre otras. Cada expresión local puede tener rasgos musicales y coreográficos particulares.' },
        { heading: 'Escuchar el contexto', body: 'En Lamas, San Martín, el Ministerio de Cultura ha presentado la marinera lamista junto a otras expresiones regionales. Mirar el mapa y escuchar ejemplos ayuda a notar la diversidad sin convertirla en una sola forma homogénea.' }
      ],
      fact: 'Las formas coreográficas y musicales de la marinera fueron declaradas Patrimonio Cultural de la Nación en 1986.',
      question: { text: '¿Cuál de estos ejemplos pertenece a San Martín?', options: [{ id: 'lima', text: 'Marinera limeña' }, { id: 'lamas', text: 'Marinera de Lamas' }, { id: 'puno', text: 'Marinera puneña' }], correctOptionId: 'lamas', feedback: 'Lamas está en San Martín. La marinera lamista es una de las expresiones regionales nombradas por el Ministerio de Cultura.' },
      image: { src: 'https://www.rumbosdelperu.com/wp-content/uploads/2024/09/10.jfif_.jpg', alt: 'Pareja de bailarines de marinera lamista en una celebración comunitaria de Lamas', caption: 'Marinera lamista en Lamas · fotografía publicada por Rumbos del Perú', href: 'https://www.rumbosdelperu.com/cultura/09-09-2024/marinera-lamista-mil-colores-de-la-amazonia-peruana/' },
      sources: [
        { title: 'Ministerio de Cultura: disfruta de la magia de nuestra marinera con el Ballet Folclórico Nacional en el Gran Teatro Nacional', author: 'Ministerio de Cultura', year: '2024', url: 'https://www.gob.pe/institucion/cultura/noticias/1041850-ministerio-de-cultura-disfruta-de-la-magia-de-nuestra-marinera-con-el-ballet-folclorico-nacional-en-el-gran-teatro-nacional', supports: 'Presentación de variedades regionales de marinera.' },
        { title: 'La Marinera de fiesta en espectáculo del Elenco Nacional de Folclore', author: 'Ministerio de Cultura', year: '2014', url: 'https://www.gob.pe/institucion/cultura/noticias/46855-la-marinera-de-fiesta-en-espectaculo-del-elenco-nacional-de-folclore', supports: 'Ejemplos regionales que incluyen las marineras de Lamas, Cusco, Arequipa, Puno, Ayacucho y Lima; declaratoria de 1986.' },
        { title: 'Declaratorias del Patrimonio Cultural de la Nación: formas coreográficas y musicales de La Marinera', author: 'Ministerio de Cultura', year: '1986', url: 'https://serviciosweb.cultura.gob.pe/dpcn/consulta.jsp?pagina=24', supports: 'Registro de la declaratoria de Patrimonio Cultural de la Nación.' }
      ]
    },
    {
      id: 'tijeras', category: 'danzas', region: 'Apurímac · Ayacucho · Huancavelica', title: 'Danza de las tijeras: destreza, música y comunidad', shortTitle: 'Danza de las tijeras', duration: '5 min',
      objective: 'Identificar el contexto regional y ritual de la danza de las tijeras y explicar su relación con la música y la competencia.',
      summary: 'Una danza ritual que enlaza destreza, música y calendario agrícola.',
      intro: 'En comunidades quechuas del sur de la cordillera andina central, esta danza reúne una exigente demostración de destreza y una dimensión ritual.',
      sections: [
        { heading: 'Una competencia ritual', body: 'La UNESCO describe la danza como una competición entre intérpretes. Se baila durante la estación seca y su ejecución coincide con fases importantes del calendario agrícola.' },
        { heading: 'El objeto metálico', body: 'El danzante sostiene un par de hojas metálicas articuladas con forma de tijeras y las hace sonar durante su presentación. La danza se acompaña de música, movimiento y pruebas de destreza.' }
      ],
      fact: 'La UNESCO inscribió esta expresión en 2010 en la Lista Representativa del Patrimonio Cultural Inmaterial de la Humanidad.',
      question: { text: '¿Qué relación señala la UNESCO entre esta danza y el calendario agrícola?', options: [{ id: 'dry-no-calendar', text: 'Se baila en la estación seca, pero no se vincula al calendario agrícola' }, { id: 'rainy-season', text: 'Se baila en la estación lluviosa y coincide con fases del calendario agrícola' }, { id: 'dry-season', text: 'Se baila durante la estación seca y coincide con fases importantes' }], correctOptionId: 'dry-season', feedback: 'La descripción de la UNESCO vincula su ejecución durante la estación seca con fases importantes del calendario agrícola.' },
      image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Danza_de_las_Tijeras.jpg?width=1100', alt: 'Danzantes interpretan la danza de las tijeras durante una presentación pública', caption: 'Danza de las tijeras · Almendra Bazan / Wikimedia Commons · CC0', href: 'https://commons.wikimedia.org/wiki/File:Danza_de_las_Tijeras.jpg' },
      sources: [
        { title: 'La danza de las tijeras', author: 'UNESCO', year: '2010', url: 'https://ich.unesco.org/es/RL/la-danza-de-las-tijeras-00391', supports: 'Contexto de práctica, carácter ritual y competitivo, estación seca, calendario agrícola e inscripción.' }
      ]
    },
    {
      id: 'hatajo', category: 'danzas', region: 'Ica · costa sur-central', title: 'Hatajo de Negritos y Las Pallitas', shortTitle: 'Hatajo y Pallitas', duration: '5 min',
      objective: 'Distinguir las características descritas para cada expresión y ubicarlas en su contexto de celebración navideña en Ica.',
      summary: 'Dos expresiones complementarias de canto, baile y celebración.',
      intro: 'El Hatajo de Negritos y Las Pallitas son expresiones complementarias originarias de Ica y vinculadas a las celebraciones navideñas.',
      sections: [
        { heading: 'Hatajo de Negritos', body: 'Según la descripción de la UNESCO, lo interpretan varones con canto y zapateo, acompañados de violín y campanillas.' },
        { heading: 'Las Pallitas', body: 'En la descripción de la UNESCO, Las Pallitas son interpretadas por mujeres con canto y zapateo, acompañados de guitarra.' },
        { heading: 'Un patrimonio vivo', body: 'Son expresiones específicas de comunidades de Ica. Sus características no deben tratarse como reglas generales para otras danzas.' }
      ],
      fact: 'La UNESCO inscribió el Hatajo de Negritos y Las Pallitas en 2019 en la Lista Representativa del Patrimonio Cultural Inmaterial de la Humanidad.',
      question: { text: '¿Qué instrumento acompaña a Las Pallitas según la descripción de la UNESCO?', options: [{ id: 'siku', text: 'Siku' }, { id: 'guitarra', text: 'Guitarra' }, { id: 'violin', text: 'Violín' }], correctOptionId: 'guitarra', feedback: 'La descripción señala la guitarra para Las Pallitas. Para el Hatajo de Negritos señala violín y campanillas.' },
      image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Atajo_de_los_negritos.jpg?width=1100', alt: 'Presentación del Hatajo de Negritos en Ica', caption: 'Atajo de los negritos · Andresestebanpro / Wikimedia Commons · CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Atajo_de_los_negritos.jpg' },
      sources: [
        { title: 'El “Hatajo de Negritos” y “Las Pallitas”, danzas del sur de la costa central del Perú', author: 'UNESCO', year: '2019', url: 'https://ich.unesco.org/es/RL/el-hatajo-de-negritos-y-las-pallitas-danzas-del-sur-de-la-costa-central-del-peru-01309', supports: 'Origen en Ica, contexto navideño, rasgos e instrumentos descritos para cada expresión e inscripción.' }
      ]
    },
    {
      id: 'sikuri', category: 'musica', region: 'Altiplano · Puno', title: 'Siku y sikuris: una práctica colectiva', shortTitle: 'Siku y sikuris', duration: '5 min',
      objective: 'Distinguir el siku del conjunto de sikuris y reconocer el carácter colectivo y la diversidad local de esta práctica.',
      summary: 'Una melodía tejida en conjunto, con estilos que varían entre localidades.',
      intro: 'El siku —también conocido como zampoña en determinados contextos— es un instrumento de viento hecho tradicionalmente de caña. El sikuri es la práctica musical colectiva en que se interpreta.',
      sections: [
        { heading: 'Música en diálogo', body: 'En la forma descrita en la publicación sobre Conima, el siku consta de dos partes complementarias, arka e ira. Quienes las tocan alternan notas para entretejer la melodía y crear un diálogo musical.' },
        { heading: 'Estilos de cada lugar', body: 'La práctica es colectiva y cambia entre localidades. Hay diferencias en los instrumentos utilizados, las técnicas de ejecución y la vestimenta; algunos estilos reciben el nombre del pueblo donde se interpretan.' }
      ],
      fact: 'El sikuri fue declarado Patrimonio Cultural de la Nación en 2003.',
      question: { text: '¿Los estilos de sikuri son idénticos en todas las localidades?', options: [{ id: 'same-everywhere', text: 'Sí; se usan los mismos instrumentos y técnicas en todas las localidades' }, { id: 'clothing-only', text: 'No; solo cambia la vestimenta, mientras la ejecución se mantiene igual' }, { id: 'local-variation', text: 'No; hay variaciones locales en instrumentos y técnicas de ejecución' }], correctOptionId: 'local-variation', feedback: 'La publicación de Ricardo López Alcas describe variaciones locales en instrumentos, técnicas de ejecución y vestimenta.' },
      image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Agrupaci%C3%B3n_Cultural_de_Sikuris_Claveles_Rojos_de_Huancan%C3%A9_-_M%C3%BAsicos.jpg?width=1100', alt: 'Músicos de la Agrupación Cultural de Sikuris Claveles Rojos de Huancané', caption: 'Músicos de Huancané · Abelchristian111 / Wikimedia Commons · CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Agrupaci%C3%B3n_Cultural_de_Sikuris_Claveles_Rojos_de_Huancan%C3%A9_-_M%C3%BAsicos.jpg' },
      sources: [
        { title: 'Don Mario Cahuapaza Chambi - irpiri mayor del sikuri de Conima en Lima', author: 'Ricardo López Alcas; apoyo del Ministerio de Cultura', year: '2020 (línea de apoyo D. U. 058-2020)', url: 'https://geoportal.cultura.gob.pe/assets/patinmaterial/archivos/doc/Don%20Mario%20Cahuapaza%20Chambi%20irpiri%20mayor%20del%20sikuri%20de%20Conima%20en%20Lima.pdf', supports: 'Carácter colectivo, estilos locales, arka e ira, ejecución dialogada, siku de caña y declaratoria de 2003.' },
        { title: 'Declaratorias del Patrimonio Cultural de la Nación: Sikuri / Siku', author: 'Ministerio de Cultura', year: '2003', url: 'https://serviciosweb.cultura.gob.pe/dpcn/consulta.jsp?pagina=24', supports: 'Reconocimiento del Sikuri/Siku como Patrimonio Cultural de la Nación.' }
      ]
    },
    {
      id: 'cajon', category: 'musica', region: 'Costa · tradición afroperuana', title: 'Cajón peruano y música afroperuana', shortTitle: 'Cajón peruano', duration: '4 min',
      objective: 'Reconocer el cajón como instrumento de percusión relacionado con la música afroperuana y conocer ejemplos de géneros donde se utiliza.',
      summary: 'Un instrumento de percusión con usos diversos según el género y la interpretación.',
      intro: 'El cajón es parte del patrimonio cultural inmaterial del pueblo afroperuano. Su uso varía de acuerdo con la interpretación y el género musical.',
      sections: [
        { heading: 'Géneros de raíz afro', body: 'Como ejemplos documentados, el cajón se utiliza en el festejo, el landó y el panalivio. Las combinaciones rítmicas dependen de cada interpretación.' },
        { heading: 'También en géneros criollos', body: 'El instrumento también acompaña géneros criollos como el vals y la polca. No es exclusivo de un solo género ni se usa de una única forma.' }
      ],
      fact: 'Los saberes, prácticas y valores asociados a la transmisión y ejecución del cajón fueron declarados Patrimonio Cultural de la Nación en 2001.',
      question: { text: '¿Cuál de estas opciones reúne géneros de raíz afro mencionados en la lección?', options: [{ id: 'afro-peruvian', text: 'Festejo, landó y panalivio' }, { id: 'criollo-mix', text: 'Festejo, vals criollo y polca' }, { id: 'mixed-regions', text: 'Landó, vals criollo y polca' }], correctOptionId: 'afro-peruvian', feedback: 'El festejo, el landó y el panalivio son ejemplos de géneros de raíz afro en los que se utiliza el cajón.' },
      image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cajon_peruano._Instrumento_de_percusi%C3%B3n.JPG?width=1100', alt: 'Músico interpreta un cajón peruano con las manos', caption: 'Intérprete de cajón · SLR / Wikimedia Commons · CC BY 3.0', href: 'https://commons.wikimedia.org/wiki/File:Cajon_peruano._Instrumento_de_percusi%C3%B3n.JPG' },
      sources: [
        { title: '21M: Clase maestra gratuita de cajoneada por un Perú sin racismo', author: 'Ministerio de Cultura', year: '2026', url: 'https://www.gob.pe/institucion/cultura/noticias/1368663-21m-clase-maestra-gratuita-de-cajoneada-por-un-peru-sin-racismo', supports: 'Relación del cajón con el patrimonio afroperuano y uso en festejo, vals criollo y polca, entre otros géneros.' },
        { title: 'OEA declaró al cajón peruano como “Instrumento del Perú para las Américas”', author: 'Agencia Peruana de Noticias Andina', year: '2014', url: 'https://andina.pe/agencia/noticia-oea-declaro-al-cajon-peruano-como-instrumento-del-peru-para-las-americas-529866.aspx', supports: 'Uso documentado del cajón en festejo, landó, vals y panalivio.' },
        { title: 'Memoria Anual 2024', author: 'Ministerio de Cultura', year: '2025', url: 'https://transparencia.cultura.gob.pe/sites/default/files/transparencia/2025/05/informes-oficiales/memoriaanual2024220525vf.pdf', supports: 'Declaratoria de 2001 de los saberes, prácticas y valores asociados al cajón.' }
      ]
    },
    {
      id: 'esuwa', category: 'musica', region: 'Amazonía · pueblo Wachiperi', title: 'Esuwa: cánticos sagrados Wachiperi', shortTitle: 'Esuwa', duration: '4 min',
      objective: 'Reconocer una tradición vocal amazónica Harakbut y comprender que sus cantos tienen un sentido cultural y espiritual específico.',
      summary: 'Una tradición de cánticos sagrados vinculada a lengua, comunidad y cosmovisión.',
      intro: 'Esuwa es la denominación principal de esta tradición de cánticos sagrados del pueblo Wachiperi, perteneciente al pueblo Harakbut, en la Amazonía peruana. Anteriormente se conocía como Eshuva.',
      sections: [
        { heading: 'Cantos en lengua Harakbut', body: 'La UNESCO describe estos cánticos como vocales, sin instrumentos musicales y realizados en lengua Harakbut.' },
        { heading: 'Una expresión cultural específica', body: 'Los cantos se relacionan con creencias y prácticas de invocación a espíritus de la naturaleza. Esta tradición pertenece a una comunidad concreta; no representa de manera genérica la música amazónica.' }
      ],
      fact: 'La UNESCO inscribió Esuwa en 2011 en la Lista del Patrimonio Cultural Inmaterial que requiere medidas urgentes de salvaguardia.',
      question: { text: '¿En qué lengua se realizan los cánticos de Esuwa según la UNESCO?', options: [{ id: 'aimara', text: 'Aimara' }, { id: 'quechua', text: 'Quechua' }, { id: 'harakbut', text: 'Harakbut' }], correctOptionId: 'harakbut', feedback: 'La UNESCO describe Esuwa como cánticos en lengua Harakbut del pueblo Wachiperi.' },
      image: { src: 'https://ich.unesco.org/img/photo/thumb/03761-HUG.jpg?t=1782998067', alt: 'Integrantes del pueblo Wachiperi en una imagen documental de la UNESCO sobre Esuwa', caption: 'Pueblo Wachiperi · documentación fotográfica de UNESCO', href: 'https://ich.unesco.org/es/USL/esuwa-canticos-sagrados-de-los-harakbut-del-pueblo-wachiperi-en-peru-00531' },
      sources: [
        { title: 'Esuwa, cánticos sagrados de los Harakbut del pueblo Wachiperi en Perú', author: 'UNESCO', year: '2011', url: 'https://ich.unesco.org/es/USL/esuwa-canticos-sagrados-de-los-harakbut-del-pueblo-wachiperi-en-peru-00531', supports: 'Denominación Esuwa, pueblo Wachiperi/Harakbut, contexto amazónico, lengua, tradición vocal e inscripción en la lista de salvaguardia urgente.' },
        { title: 'Eshuva, Harákmbut sung prayers of Peru’s Huachipaire people', author: 'UNESCO', year: '2011', url: 'https://ich.unesco.org/doc/src/17330-EN.pdf?t=1344431951', supports: 'Nombre anterior Eshuva, cantos rezados y relación con creencias y naturaleza.' },
        { title: 'Harakbut', author: 'Base de Datos de Pueblos Indígenas u Originarios, Ministerio de Cultura', year: 's. f.', url: 'https://bdpi.cultura.gob.pe/pueblos/harakbut', supports: 'Contexto del pueblo Harakbut y descripción de Eshuva como práctica ancestral vinculada especialmente a los Wachiperi.' }
      ]
    }
  ],
  trivia: [
    { prompt: '¿Cuál de estos ejemplos corresponde a la región San Martín?', options: [{ id: 'lima', text: 'Marinera limeña' }, { id: 'puno', text: 'Marinera puneña' }, { id: 'lamas', text: 'Marinera de Lamas' }], correctOptionId: 'lamas', explanation: 'Lamas está en San Martín. La marinera lamista es una de las expresiones regionales nombradas por el Ministerio de Cultura.', lesson: 'marinera' },
    { prompt: '¿Qué objeto metálico sostiene el danzante de la danza de las tijeras?', options: [{ id: 'campanilla', text: 'Una campanilla' }, { id: 'tijeras', text: 'Un par de tijeras' }, { id: 'siku', text: 'Un siku' }], correctOptionId: 'tijeras', explanation: 'El nombre de la danza alude al objeto metálico que sostiene el danzante.', lesson: 'tijeras' },
    { prompt: '¿Qué instrumentos acompañan al Hatajo de Negritos según la descripción de la UNESCO?', options: [{ id: 'guitarra-cajon', text: 'La guitarra junto con el cajón' }, { id: 'siku-bombo', text: 'El siku junto con el bombo' }, { id: 'violin-campanillas', text: 'El violín junto con campanillas' }], correctOptionId: 'violin-campanillas', explanation: 'La descripción menciona violín y campanillas, además de canto y zapateo.', lesson: 'hatajo' },
    { prompt: '¿Qué instrumento acompaña a Las Pallitas según la descripción de la UNESCO?', options: [{ id: 'violin', text: 'Violín' }, { id: 'guitarra', text: 'Guitarra' }, { id: 'cajon', text: 'Cajón' }], correctOptionId: 'guitarra', explanation: 'Para Las Pallitas, la descripción señala guitarra, además de canto y zapateo.', lesson: 'hatajo' },
    { prompt: '¿Qué caracteriza a la práctica de los sikuris?', options: [{ id: 'cajon', text: 'Es una práctica musical colectiva con cajón en géneros afroperuanos' }, { id: 'esuwa', text: 'Es una práctica vocal sin instrumentos, con cantos en lengua Harakbut' }, { id: 'sikuris', text: 'Es una práctica musical colectiva de interpretación del siku por sikuris' }], correctOptionId: 'sikuris', explanation: 'Sikuri es la práctica musical colectiva asociada a la ejecución del siku.', lesson: 'sikuri' },
    { prompt: '¿Qué describe una forma de ejecución dialogada del siku?', options: [{ id: 'unison', text: 'Las partes arka e ira se tocan al unísono durante toda la melodía' }, { id: 'alternation', text: 'Las notas se alternan entre partes complementarias para formar la melodía' }, { id: 'independent', text: 'Cada parte mantiene una melodía independiente, sin alternar notas' }], correctOptionId: 'alternation', explanation: 'La melodía se puede entretejer alternando notas entre partes complementarias.', lesson: 'sikuri' },
    { prompt: '¿Cuál opción reúne géneros de raíz afro mencionados en la lección del cajón?', options: [{ id: 'afro-peruvian', text: 'Festejo, landó y panalivio' }, { id: 'criollo-mix', text: 'Festejo, vals criollo y polca' }, { id: 'mixed-regions', text: 'Landó, vals criollo y polca' }], correctOptionId: 'afro-peruvian', explanation: 'Festejo, landó y panalivio son ejemplos de géneros de raíz afro en los que se utiliza el cajón.', lesson: 'cajon' },
    { prompt: '¿Qué afirmación sobre Esuwa es correcta?', options: [{ id: 'sikuris', text: 'Es una práctica colectiva de siku asociada a comunidades sikuris de Puno' }, { id: 'marinera', text: 'Es una expresión navideña de canto y zapateo de comunidades de Ica' }, { id: 'eshua', text: 'Es una tradición de cánticos sagrados Wachiperi en lengua Harakbut' }], correctOptionId: 'eshua', explanation: 'La UNESCO registra Esuwa como tradición del pueblo Wachiperi, perteneciente al pueblo Harakbut.', lesson: 'esuwa' }
  ],
  memberships: [
    { id: 'gratis', name: 'Gratis', price: 'S/ 0', period: 'siempre', batteries: 5, accent: 'sand', perks: ['5 baterías · recarga cada 24 h', '6 lecciones iniciales', 'Trivia y progreso local'], button: 'Plan actual' },
    { id: 'basico', name: 'Ritmo Básico', price: 'S/ 2.90', period: 'al mes', batteries: 10, accent: 'clay', perks: ['10 baterías · recarga cada 24 h', '6 lecciones iniciales', 'Trivia y progreso local'], button: 'Probar en demo' },
    { id: 'plus', name: 'Ritmo Plus', price: 'S/ 4.90', period: 'al mes', batteries: 20, accent: 'blue', perks: ['20 baterías · recarga cada 24 h', 'Sin anuncios', 'Reto relámpago extra'], button: 'Probar en demo' },
    { id: 'premium', name: 'Ritmo Premium', price: 'S/ 6.90', period: 'al mes', batteries: null, accent: 'gold', perks: ['Energía ilimitada', 'Sin anuncios', 'Acceso a todas las actividades'], button: 'Probar en demo' }
  ]
};
