export interface Pregunta {
  id: string;
  tipo: 'abierta' | 'reflexion';
  texto: string;
  puntos: number;
  notasLider?: string;
}

export interface Seccion {
  id: string;
  tipo: 'introduccion' | 'conocer' | 'reflexionar' | 'examinar' | 'aplicar' | 'conclusion';
  titulo: string;
  contenido: string;
  preguntas: Pregunta[];
  versiculosApoyo?: string[];
  versiculoClave?: string;
  objetivo?: string;
  desafio?: string;
  preguntasProfundizar?: string[];
}

export interface Leccion {
  id: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  versiculoClave: string;
  objetivo: string;
  principios: string[];
  secciones: Seccion[];
  desafioSemanal: string;
}

export interface Modulo {
  id: string;
  titulo: string;
  descripcion: string;
  lecciones: Leccion[];
}

export const moduloSantidad: Modulo = {
  id: 'santidad',
  titulo: 'Una Vida de Santidad',
  descripcion: 'Aprende a vivir en santidad a través de historias bíblicas transformadoras',
  lecciones: [
    {
      id: 'santidad-1',
      numero: 1,
      titulo: 'José: La integridad trae honra de parte de Dios',
      subtitulo: 'Génesis 39',
      versiculoClave: 'Génesis 39:9',
      objetivo: 'Reconocer que la santidad se manifiesta en decisiones firmes frente a la tentación, y que Dios honra al íntegro.',
      principios: [
        'La fidelidad a Dios requiere determinación',
        'Dios honra la integridad en lo secreto',
        'La santidad tiene un costo pero trae recompensa'
      ],
      secciones: [
        {
          id: 'intro1',
          tipo: 'introduccion',
          titulo: 'Introducción',
          contenido: 'José fue vendido como esclavo, pero Jehová estaba con él en la casa de Potifar. Fue puesto sobre todo lo que tenía su amo. La esposa de Potifar intentó seducirlo, pero José respondió: "¿Cómo haría yo este grande mal y pecaría contra Dios?". Rechazó la tentación y fue acusado injustamente, pero aun en prisión, Jehová estaba con él.',
          preguntas: [],
          versiculoClave: 'Génesis 39:9'
        },
        {
          id: 'conocer1',
          tipo: 'conocer',
          titulo: 'CONOCER',
          contenido: 'Comprendamos los hechos de la historia de José en casa de Potifar.',
          preguntas: [
            {
              id: 's1-c1',
              tipo: 'abierta',
              texto: '¿Qué sucede en esta historia?',
              puntos: 15
            },
            {
              id: 's1-c2',
              tipo: 'abierta',
              texto: '¿Quiénes son los personajes principales y cuál es su papel?',
              puntos: 15
            },
            {
              id: 's1-c3',
              tipo: 'abierta',
              texto: '¿Cuál es el mensaje central del pasaje?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Proverbios 10:9', 'Salmo 15:1-2']
        },
        {
          id: 'reflexionar1',
          tipo: 'reflexionar',
          titulo: 'REFLEXIONAR',
          contenido: 'Meditemos en los principios espirituales de esta historia.',
          preguntas: [
            {
              id: 's1-r1',
              tipo: 'reflexion',
              texto: '¿Qué aprendemos sobre Dios y sobre el pecado?',
              puntos: 15
            },
            {
              id: 's1-r2',
              tipo: 'reflexion',
              texto: '¿Qué principios espirituales se pueden extraer de esta historia?',
              puntos: 15
            },
            {
              id: 's1-r3',
              tipo: 'reflexion',
              texto: '¿En qué otros pasajes vemos que Dios honra la fidelidad?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Mateo 6:6', 'Mateo 5:8']
        },
        {
          id: 'examinar1',
          tipo: 'examinar',
          titulo: 'EXAMINAR',
          contenido: 'Apliquemos esta enseñanza a nuestra vida personal.',
          preguntas: [
            {
              id: 's1-e1',
              tipo: 'abierta',
              texto: '¿Cómo se relaciona esta historia con mi vida hoy?',
              puntos: 15
            },
            {
              id: 's1-e2',
              tipo: 'abierta',
              texto: '¿En qué áreas de mi vida necesito aplicar esta enseñanza?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Salmo 119:11', '1 Corintios 10:13']
        },
        {
          id: 'aplicar1',
          tipo: 'aplicar',
          titulo: 'APLICAR',
          contenido: 'Tomemos acciones concretas basadas en lo aprendido.',
          preguntas: [
            {
              id: 's1-a1',
              tipo: 'abierta',
              texto: '¿Qué acción específica puedo tomar en base a esta enseñanza?',
              puntos: 20
            },
            {
              id: 's1-a2',
              tipo: 'abierta',
              texto: '¿Cómo puedo compartir esta verdad con otros?',
              puntos: 20
            }
          ],
          versiculosApoyo: ['2 Timoteo 2:22', 'Santiago 1:22']
        },
        {
          id: 'conclusion1',
          tipo: 'conclusion',
          titulo: 'Conclusión',
          contenido: 'La fidelidad a Dios requiere determinación aun cuando no haya reconocimiento humano.',
          preguntas: [],
          desafio: 'Memoriza Génesis 39:9 y escribe un "plan de escape" contra las tentaciones que enfrentas esta semana.',
          preguntasProfundizar: [
            '¿Qué tentación me cuesta más resistir?',
            '¿Cómo puedo fortalecer mi integridad en lo secreto?'
          ]
        }
      ],
      desafioSemanal: 'Memoriza Génesis 39:9 y escribe un "plan de escape" contra las tentaciones que enfrentas esta semana.'
    },
    {
      id: 'santidad-2',
      numero: 2,
      titulo: 'Sansón: El precio de la desobediencia',
      subtitulo: 'Jueces 16',
      versiculoClave: 'Jueces 16:20',
      objetivo: 'Entender las consecuencias del pecado y el poder de la restauración divina.',
      principios: [
        'La desobediencia trae consecuencias',
        'Dios restaura al que se arrepiente',
        'El descuido espiritual nos debilita'
      ],
      secciones: [
        {
          id: 'intro2',
          tipo: 'introduccion',
          titulo: 'Introducción',
          contenido: 'Sansón fue nazareo desde su nacimiento. Dios le dio gran fuerza, pero descuidó su consagración. Dalila lo presionó hasta que reveló el secreto de su fuerza. Los filisteos lo atraparon, le sacaron los ojos y lo llevaron preso. En su humillación clamó a Jehová, y Dios le dio fuerzas para derribar el templo de Dagón.',
          preguntas: [],
          versiculoClave: 'Jueces 16:20'
        },
        {
          id: 'conocer2',
          tipo: 'conocer',
          titulo: 'CONOCER',
          contenido: 'Exploremos los detalles de la historia de Sansón y Dalila.',
          preguntas: [
            {
              id: 's2-c1',
              tipo: 'abierta',
              texto: '¿Qué significaba el voto de nazareo?',
              puntos: 15
            },
            {
              id: 's2-c2',
              tipo: 'abierta',
              texto: '¿Qué acciones muestran el descuido espiritual de Sansón?',
              puntos: 15
            },
            {
              id: 's2-c3',
              tipo: 'abierta',
              texto: '¿Qué hizo Dalila y cómo Sansón cayó en su trampa?',
              puntos: 15
            },
            {
              id: 's2-c4',
              tipo: 'abierta',
              texto: '¿Qué consecuencias inmediatas sufrió?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Jueces 16:21', 'Números 6:1-8', 'Proverbios 7:21-23']
        },
        {
          id: 'reflexionar2',
          tipo: 'reflexionar',
          titulo: 'REFLEXIONAR',
          contenido: 'Reflexionemos sobre las lecciones espirituales de esta historia.',
          preguntas: [
            {
              id: 's2-r1',
              tipo: 'reflexion',
              texto: '¿Qué aprendemos de esta historia sobre el costo del pecado?',
              puntos: 15
            },
            {
              id: 's2-r2',
              tipo: 'reflexion',
              texto: '¿Qué revela acerca de la fidelidad y la misericordia de Dios?',
              puntos: 15
            },
            {
              id: 's2-r3',
              tipo: 'reflexion',
              texto: '¿Qué otros pasajes nos recuerdan esta enseñanza?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Gálatas 6:7-8', 'Salmo 51:10', '1 Corintios 10:12-13']
        },
        {
          id: 'examinar2',
          tipo: 'examinar',
          titulo: 'EXAMINAR',
          contenido: 'Examinemos nuestra vida a la luz de esta historia.',
          preguntas: [
            {
              id: 's2-e1',
              tipo: 'abierta',
              texto: '¿Qué hábitos o áreas muestran descuido espiritual en mi vida?',
              puntos: 15
            },
            {
              id: 's2-e2',
              tipo: 'abierta',
              texto: '¿Qué decisiones me están alejando de la consagración a Dios?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['2 Corintios 13:5', 'Lamentaciones 3:40']
        },
        {
          id: 'aplicar2',
          tipo: 'aplicar',
          titulo: 'APLICAR',
          contenido: 'Establezcamos compromisos prácticos para fortalecer nuestra vida espiritual.',
          preguntas: [
            {
              id: 's2-a1',
              tipo: 'abierta',
              texto: '¿Qué "regla de vida" puedo establecer esta semana para fortalecerme en Dios?',
              puntos: 20
            },
            {
              id: 's2-a2',
              tipo: 'abierta',
              texto: '¿Qué hábito negativo debo reemplazar por una práctica de santidad?',
              puntos: 20
            }
          ],
          versiculosApoyo: ['Romanos 12:1-2', 'Hebreos 12:1']
        },
        {
          id: 'conclusion2',
          tipo: 'conclusion',
          titulo: 'Conclusión',
          contenido: 'La desobediencia trae consecuencias, pero Dios restaura al que se arrepiente y clama a Él.',
          preguntas: [],
          desafio: 'Identifica un hábito raíz que te aleje de Dios y reemplázalo por una práctica santa durante 7 días.',
          preguntasProfundizar: [
            '¿Qué cosas pequeñas descuido que pueden robarme fuerza espiritual?',
            '¿Cómo puedo vivir más atento a mi consagración?'
          ]
        }
      ],
      desafioSemanal: 'Identifica un hábito raíz que te aleje de Dios y reemplázalo por una práctica santa durante 7 días.'
    },
    {
      id: 'santidad-3',
      numero: 3,
      titulo: 'Zaqueo: Una gracia que transforma',
      subtitulo: 'Lucas 19:1-10',
      versiculoClave: 'Lucas 19:8-9',
      objetivo: 'Comprender cómo la gracia de Dios produce transformación genuina y frutos visibles.',
      principios: [
        'La gracia verdadera transforma vidas',
        'El arrepentimiento produce frutos visibles',
        'La salvación trae restitución'
      ],
      secciones: [
        {
          id: 'intro3',
          tipo: 'introduccion',
          titulo: 'Introducción',
          contenido: 'Zaqueo, jefe de publicanos, era considerado pecador y despreciado por su pueblo. Deseaba ver a Jesús, así que corrió y se subió a un árbol. Jesús lo llamó y se hospedó en su casa. Zaqueo se arrepintió y decidió restituir lo robado y dar a los pobres. Jesús declaró: "Hoy ha venido la salvación a esta casa".',
          preguntas: [],
          versiculoClave: 'Lucas 19:8-9'
        },
        {
          id: 'conocer3',
          tipo: 'conocer',
          titulo: 'CONOCER',
          contenido: 'Analicemos los eventos del encuentro entre Jesús y Zaqueo.',
          preguntas: [
            {
              id: 's3-c1',
              tipo: 'abierta',
              texto: '¿Qué obstáculos tenía Zaqueo para ver a Jesús?',
              puntos: 15
            },
            {
              id: 's3-c2',
              tipo: 'abierta',
              texto: '¿Qué hizo para superarlos?',
              puntos: 15
            },
            {
              id: 's3-c3',
              tipo: 'abierta',
              texto: '¿Qué decisiones tomó tras recibir a Jesús?',
              puntos: 15
            },
            {
              id: 's3-c4',
              tipo: 'abierta',
              texto: '¿Qué declaró Jesús sobre él y su casa?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Lucas 19:8-9', 'Lucas 19:1-10', 'Mateo 9:9-13']
        },
        {
          id: 'reflexionar3',
          tipo: 'reflexionar',
          titulo: 'REFLEXIONAR',
          contenido: 'Meditemos en el poder transformador de la gracia.',
          preguntas: [
            {
              id: 's3-r1',
              tipo: 'reflexion',
              texto: '¿Qué nos enseña esta historia sobre la gracia y el arrepentimiento?',
              puntos: 15
            },
            {
              id: 's3-r2',
              tipo: 'reflexion',
              texto: '¿Por qué la santidad debe reflejarse en nuestra conducta?',
              puntos: 15
            },
            {
              id: 's3-r3',
              tipo: 'reflexion',
              texto: '¿Qué otros textos refuerzan esta enseñanza?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Efesios 2:8-10', 'Santiago 2:17', 'Lucas 3:8']
        },
        {
          id: 'examinar3',
          tipo: 'examinar',
          titulo: 'EXAMINAR',
          contenido: 'Evaluemos las áreas de nuestra vida que necesitan transformación.',
          preguntas: [
            {
              id: 's3-e1',
              tipo: 'abierta',
              texto: '¿Qué áreas de mi vida necesitan restitución o cambios?',
              puntos: 15
            },
            {
              id: 's3-e2',
              tipo: 'abierta',
              texto: '¿Cómo puedo vivir la generosidad de manera práctica esta semana?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Mateo 5:23-24', '2 Corintios 5:17']
        },
        {
          id: 'aplicar3',
          tipo: 'aplicar',
          titulo: 'APLICAR',
          contenido: 'Tomemos acciones concretas de restitución y generosidad.',
          preguntas: [
            {
              id: 's3-a1',
              tipo: 'abierta',
              texto: '¿A quién debo restituir o pedir perdón?',
              puntos: 20
            },
            {
              id: 's3-a2',
              tipo: 'abierta',
              texto: '¿Qué acción generosa concreta voy a realizar en estos días?',
              puntos: 20
            }
          ],
          versiculosApoyo: ['Hechos 20:35', 'Proverbios 11:25']
        },
        {
          id: 'conclusion3',
          tipo: 'conclusion',
          titulo: 'Conclusión',
          contenido: 'La gracia verdadera transforma vidas, produce frutos visibles y evidencia de arrepentimiento genuino.',
          preguntas: [],
          desafio: 'Haz una restitución real y practica un acto de generosidad en esta semana.',
          preguntasProfundizar: [
            '¿Qué cambios visibles muestra mi vida desde que recibí la gracia de Dios?',
            '¿Cómo puedo ser intencional en la generosidad?'
          ]
        }
      ],
      desafioSemanal: 'Haz una restitución real y practica un acto de generosidad en esta semana.'
    },
    {
      id: 'santidad-4',
      numero: 4,
      titulo: 'Sinaí: Un pueblo apartado para Dios',
      subtitulo: 'Éxodo 19:1-8',
      versiculoClave: '1 Pedro 2:9',
      objetivo: 'Comprender nuestra identidad como pueblo santo y nuestra misión en el mundo.',
      principios: [
        'La santidad es identidad y misión',
        'Somos apartados para mostrar el carácter de Dios',
        'La obediencia es respuesta al llamado divino'
      ],
      secciones: [
        {
          id: 'intro4',
          tipo: 'introduccion',
          titulo: 'Introducción',
          contenido: 'En el monte Sinaí, Dios llamó a Israel a ser su pueblo especial, un reino de sacerdotes y una nación santa. El pueblo respondió afirmativamente al pacto. Este llamado refleja también nuestra identidad y misión como iglesia en Cristo.',
          preguntas: [],
          versiculoClave: '1 Pedro 2:9'
        },
        {
          id: 'conocer4',
          tipo: 'conocer',
          titulo: 'CONOCER',
          contenido: 'Estudiemos el llamado de Dios a Israel en el Sinaí.',
          preguntas: [
            {
              id: 's4-c1',
              tipo: 'abierta',
              texto: '¿Qué le pidió Dios a Israel?',
              puntos: 15
            },
            {
              id: 's4-c2',
              tipo: 'abierta',
              texto: '¿Qué promesa les dio?',
              puntos: 15
            },
            {
              id: 's4-c3',
              tipo: 'abierta',
              texto: '¿Cómo respondió el pueblo?',
              puntos: 15
            },
            {
              id: 's4-c4',
              tipo: 'abierta',
              texto: '¿Qué significa "reino de sacerdotes y nación santa"?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Éxodo 19:5-6', 'Deuteronomio 7:6', 'Levítico 20:26']
        },
        {
          id: 'reflexionar4',
          tipo: 'reflexionar',
          titulo: 'REFLEXIONAR',
          contenido: 'Reflexionemos sobre nuestra identidad y llamado como pueblo de Dios.',
          preguntas: [
            {
              id: 's4-r1',
              tipo: 'reflexion',
              texto: '¿Qué enseña esto sobre identidad y obediencia?',
              puntos: 15
            },
            {
              id: 's4-r2',
              tipo: 'reflexion',
              texto: '¿Qué principios podemos extraer de este llamado?',
              puntos: 15
            },
            {
              id: 's4-r3',
              tipo: 'reflexion',
              texto: '¿Qué otros pasajes confirman esta enseñanza?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['1 Pedro 2:9', 'Mateo 5:14']
        },
        {
          id: 'examinar4',
          tipo: 'examinar',
          titulo: 'EXAMINAR',
          contenido: 'Examinemos cómo estamos viviendo nuestra identidad de pueblo santo.',
          preguntas: [
            {
              id: 's4-e1',
              tipo: 'abierta',
              texto: '¿Cómo vivo hoy mi identidad de "pueblo santo"?',
              puntos: 15
            },
            {
              id: 's4-e2',
              tipo: 'abierta',
              texto: '¿Qué áreas debo consagrar más al Señor?',
              puntos: 15
            }
          ],
          versiculosApoyo: ['Romanos 12:1', 'Colosenses 3:17']
        },
        {
          id: 'aplicar4',
          tipo: 'aplicar',
          titulo: 'APLICAR',
          contenido: 'Comprometámonos con prácticas espirituales y acciones misioneras.',
          preguntas: [
            {
              id: 's4-a1',
              tipo: 'abierta',
              texto: '¿Qué práctica espiritual (ayuno, oración, intercesión) puedo intensificar esta semana?',
              puntos: 20
            },
            {
              id: 's4-a2',
              tipo: 'abierta',
              texto: '¿Qué acción misionera concreta haré para reflejar el carácter de Dios?',
              puntos: 20
            }
          ],
          versiculosApoyo: ['Mateo 28:19-20', 'Hechos 1:8']
        },
        {
          id: 'conclusion4',
          tipo: 'conclusion',
          titulo: 'Conclusión',
          contenido: 'La santidad es identidad y misión: ser apartados para mostrar el carácter de Dios al mundo.',
          preguntas: [],
          desafio: 'Elige una práctica espiritual (oración, ayuno, estudio bíblico) y un acto de misión (servicio o evangelismo) para vivir una semana de consagración y compartir la experiencia en tu grupo.',
          preguntasProfundizar: [
            '¿Cómo estoy reflejando el carácter de Dios en mi entorno?',
            '¿Qué pasos concretos me harán crecer en obediencia y misión?'
          ]
        }
      ],
      desafioSemanal: 'Elige una práctica espiritual (oración, ayuno, estudio bíblico) y un acto de misión (servicio o evangelismo) para vivir una semana de consagración y compartir la experiencia en tu grupo.'
    }
  ]
};