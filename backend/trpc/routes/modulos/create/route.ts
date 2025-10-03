import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { generateObject } from '@rork/toolkit-sdk';

export const createModuloProcedure = publicProcedure
  .input(
    z.object({
      guideContent: z.string(),
      guideImages: z.array(z.object({
        type: z.literal('image'),
        image: z.string(),
      })).optional(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('Iniciando creación de módulo con IA...');

      const messages: any[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analiza esta guía de discipulado y extrae TODA la información para crear un módulo completo.

IMPORTANTE: Debes seguir EXACTAMENTE el mismo formato, estilo y organización que los módulos existentes.

La guía contiene:
${input.guideContent}

Extrae y estructura la información en el siguiente formato JSON (SIGUE ESTE FORMATO EXACTAMENTE):
{
  "titulo": "Título del módulo",
  "descripcion": "Descripción breve del módulo",
  "lecciones": [
    {
      "numero": 1,
      "titulo": "Título de la lección",
      "subtitulo": "Referencia bíblica (ej: Génesis 39)",
      "versiculoClave": "Referencia del versículo (ej: Génesis 39:9)",
      "objetivo": "Objetivo de la lección",
      "principios": ["Principio 1", "Principio 2", "Principio 3"],
      "secciones": [
        {
          "tipo": "introduccion",
          "titulo": "Introducción",
          "contenido": "Resumen narrativo de la historia bíblica",
          "preguntas": [],
          "versiculoClave": "Referencia del versículo"
        },
        {
          "tipo": "conocer",
          "titulo": "CONOCER",
          "contenido": "Descripción de esta sección",
          "preguntas": [
            {
              "tipo": "abierta",
              "texto": "¿Qué sucede en esta historia?",
              "puntos": 15
            },
            {
              "tipo": "abierta",
              "texto": "¿Quiénes son los personajes principales y cuál es su papel?",
              "puntos": 15
            },
            {
              "tipo": "abierta",
              "texto": "¿Cuál es el mensaje central del pasaje?",
              "puntos": 15
            }
          ],
          "versiculosApoyo": ["Versículo 1", "Versículo 2"]
        },
        {
          "tipo": "reflexionar",
          "titulo": "REFLEXIONAR",
          "contenido": "Descripción de esta sección",
          "preguntas": [
            {
              "tipo": "reflexion",
              "texto": "¿Qué aprendemos sobre Dios y sobre el pecado?",
              "puntos": 15
            },
            {
              "tipo": "reflexion",
              "texto": "¿Qué principios espirituales se pueden extraer de esta historia?",
              "puntos": 15
            },
            {
              "tipo": "reflexion",
              "texto": "¿En qué otros pasajes vemos esta enseñanza?",
              "puntos": 15
            }
          ],
          "versiculosApoyo": ["Versículo 1", "Versículo 2"]
        },
        {
          "tipo": "examinar",
          "titulo": "EXAMINAR",
          "contenido": "Descripción de esta sección",
          "preguntas": [
            {
              "tipo": "abierta",
              "texto": "¿Cómo se relaciona esta historia con mi vida hoy?",
              "puntos": 15
            },
            {
              "tipo": "abierta",
              "texto": "¿En qué áreas de mi vida necesito aplicar esta enseñanza?",
              "puntos": 15
            }
          ],
          "versiculosApoyo": ["Versículo 1", "Versículo 2"]
        },
        {
          "tipo": "aplicar",
          "titulo": "APLICAR",
          "contenido": "Descripción de esta sección",
          "preguntas": [
            {
              "tipo": "abierta",
              "texto": "¿Qué acción específica puedo tomar en base a esta enseñanza?",
              "puntos": 20
            },
            {
              "tipo": "abierta",
              "texto": "¿Cómo puedo compartir esta verdad con otros?",
              "puntos": 20
            }
          ],
          "versiculosApoyo": ["Versículo 1", "Versículo 2"]
        },
        {
          "tipo": "conclusion",
          "titulo": "Conclusión",
          "contenido": "Resumen de la enseñanza principal",
          "preguntas": [],
          "desafio": "Desafío práctico para la semana",
          "preguntasProfundizar": [
            "Pregunta reflexiva 1",
            "Pregunta reflexiva 2"
          ]
        }
      ],
      "desafioSemanal": "Mismo desafío que en la conclusión"
    }
  ]
}

REGLAS CRÍTICAS (NO OMITIR NINGUNA):
1. ESTRUCTURA DE SECCIONES: Cada lección DEBE tener exactamente 6 secciones en este orden:
   - introduccion (sin preguntas, con versiculoClave)
   - conocer (3 preguntas de 15 puntos cada una)
   - reflexionar (3 preguntas de 15 puntos cada una)
   - examinar (2 preguntas de 15 puntos cada una)
   - aplicar (2 preguntas de 20 puntos cada una)
   - conclusion (sin preguntas, con desafio y preguntasProfundizar)

2. PREGUNTAS: Extrae TODAS las preguntas de la guía y distribúyelas en las secciones apropiadas
   - Preguntas de conocer/reflexionar/examinar: 15 puntos
   - Preguntas de aplicar: 20 puntos
   - Tipo "abierta" para preguntas de conocer, examinar y aplicar
   - Tipo "reflexion" para preguntas de reflexionar

3. TÍTULOS: Usa MAYÚSCULAS para secciones principales (CONOCER, REFLEXIONAR, EXAMINAR, APLICAR)

4. PRINCIPIOS: Cada lección debe tener 3 principios claros y concisos

5. VERSÍCULOS: Incluye versiculosApoyo en cada sección (excepto introducción y conclusión)

6. DESAFÍO: El desafioSemanal debe ser idéntico al desafio en la sección de conclusión

7. CONTENIDO: Mantén el contenido claro, conciso y fiel a la guía original

8. IDs: Se generarán automáticamente, no los incluyas en el JSON`,
            },
            ...(input.guideImages || []),
          ],
        },
      ];

      const extractedData = await generateObject({
        messages,
        schema: z.object({
          titulo: z.string(),
          descripcion: z.string(),
          lecciones: z.array(
            z.object({
              numero: z.number(),
              titulo: z.string(),
              subtitulo: z.string(),
              versiculoClave: z.string(),
              objetivo: z.string(),
              principios: z.array(z.string()),
              secciones: z.array(
                z.object({
                  tipo: z.enum(['introduccion', 'conocer', 'reflexionar', 'examinar', 'aplicar', 'conclusion']),
                  titulo: z.string(),
                  contenido: z.string(),
                  preguntas: z.array(
                    z.object({
                      tipo: z.enum(['abierta', 'reflexion']),
                      texto: z.string(),
                      puntos: z.number(),
                      notasLider: z.string().optional(),
                    })
                  ),
                  versiculosApoyo: z.array(z.string()).optional(),
                  versiculoClave: z.string().optional(),
                  objetivo: z.string().optional(),
                  desafio: z.string().optional(),
                  preguntasProfundizar: z.array(z.string()).optional(),
                })
              ),
              desafioSemanal: z.string(),
            })
          ),
        }),
      });

      console.log('Datos extraídos por IA:', JSON.stringify(extractedData, null, 2));

      const moduloId = `modulo-${Date.now()}`;
      const lecciones = extractedData.lecciones.map((leccion, leccionIndex) => ({
        id: `${moduloId}-leccion-${leccion.numero}`,
        numero: leccion.numero,
        titulo: leccion.titulo,
        subtitulo: leccion.subtitulo,
        versiculoClave: leccion.versiculoClave,
        objetivo: leccion.objetivo,
        principios: leccion.principios,
        secciones: leccion.secciones.map((seccion, seccionIndex) => ({
          id: `${moduloId}-leccion-${leccion.numero}-${seccion.tipo}-${seccionIndex}`,
          tipo: seccion.tipo,
          titulo: seccion.titulo,
          contenido: seccion.contenido,
          preguntas: seccion.preguntas.map((pregunta, preguntaIndex) => ({
            id: `${moduloId}-leccion-${leccion.numero}-${seccion.tipo}-pregunta-${preguntaIndex}`,
            tipo: pregunta.tipo,
            texto: pregunta.texto,
            puntos: pregunta.puntos,
            notasLider: pregunta.notasLider,
          })),
          versiculosApoyo: seccion.versiculosApoyo,
          versiculoClave: seccion.versiculoClave,
          objetivo: seccion.objetivo,
          desafio: seccion.desafio,
          preguntasProfundizar: seccion.preguntasProfundizar,
        })),
        desafioSemanal: leccion.desafioSemanal,
      }));

      const nuevoModulo = {
        id: moduloId,
        titulo: extractedData.titulo,
        descripcion: extractedData.descripcion,
        lecciones,
        createdAt: new Date().toISOString(),
        createdBy: input.userId,
      };

      console.log('Módulo creado:', JSON.stringify(nuevoModulo, null, 2));

      return {
        success: true,
        modulo: nuevoModulo,
        message: `Módulo "${nuevoModulo.titulo}" creado exitosamente con ${lecciones.length} lección(es)`,
      };
    } catch (error) {
      console.error('Error creando módulo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  });

export default createModuloProcedure;
