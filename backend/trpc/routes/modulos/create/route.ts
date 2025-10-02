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

IMPORTANTE: Debes extraer TODAS las preguntas que encuentres en la guía, sin excepción.

La guía contiene:
${input.guideContent}

Extrae y estructura la información en el siguiente formato JSON:
{
  "titulo": "Título del módulo",
  "descripcion": "Descripción breve del módulo",
  "lecciones": [
    {
      "numero": 1,
      "titulo": "Título de la lección",
      "subtitulo": "Referencia bíblica",
      "versiculoClave": "Versículo principal",
      "objetivo": "Objetivo de la lección",
      "principios": ["Principio 1", "Principio 2"],
      "secciones": [
        {
          "tipo": "introduccion" | "conocer" | "reflexionar" | "examinar" | "aplicar" | "conclusion",
          "titulo": "Título de la sección",
          "contenido": "Contenido de la sección",
          "preguntas": [
            {
              "tipo": "abierta" | "reflexion",
              "texto": "Texto de la pregunta",
              "puntos": 15
            }
          ],
          "versiculosApoyo": ["Versículo 1", "Versículo 2"],
          "versiculoClave": "Versículo clave",
          "objetivo": "Objetivo específico",
          "desafio": "Desafío de la semana",
          "preguntasProfundizar": ["Pregunta 1", "Pregunta 2"]
        }
      ],
      "desafioSemanal": "Desafío semanal"
    }
  ]
}

REGLAS IMPORTANTES:
1. Extrae TODAS las preguntas que encuentres en la guía
2. Clasifica cada pregunta como "abierta" o "reflexion" según su naturaleza
3. Asigna 15 puntos a preguntas de conocer/reflexionar/examinar y 20 puntos a preguntas de aplicar
4. Mantén el orden y estructura original de la guía
5. Incluye todos los versículos, objetivos y desafíos mencionados
6. Si hay múltiples lecciones, créalas todas
7. Genera IDs únicos para cada elemento usando el formato: "leccion-{numero}", "seccion-{tipo}-{numero}", "pregunta-{numero}"`,
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
