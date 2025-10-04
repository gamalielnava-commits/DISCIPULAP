import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

interface Pregunta {
  id: string;
  numero?: number;
  texto?: string;
  pregunta?: string;
  tipo: string;
  puntos?: number;
  respuesta?: any;
}

interface Leccion {
  titulo: string;
  descripcion?: string;
  numeroLeccion?: number;
  nombreModulo?: string;
  versiculoClave?: string;
  desafioSemanal?: string;
}

export async function exportarLeccionPDF(
  leccion: Leccion,
  preguntas: Pregunta[],
  respuestas: { [key: string]: any }
): Promise<void> {
  try {
    console.log('Exportando lección a PDF:', leccion.titulo);
    console.log('Número de preguntas:', preguntas.length);
    console.log('Número de respuestas:', Object.keys(respuestas).length);
    
    // Generar HTML para el PDF
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${leccion.titulo}</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 40px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              border-bottom: 3px solid #9333EA;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h1 {
              color: #9333EA;
              font-size: 28px;
              margin: 0 0 10px 0;
            }
            h2 {
              color: #6B21A8;
              font-size: 20px;
              margin-top: 30px;
              margin-bottom: 15px;
              border-bottom: 1px solid #E9D5FF;
              padding-bottom: 5px;
            }
            .info {
              background-color: #F3E8FF;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .info-item {
              margin: 5px 0;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
              color: #6B21A8;
            }
            .pregunta-container {
              background-color: #FAFAFA;
              border: 1px solid #E5E5E5;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .pregunta-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .pregunta-numero {
              background-color: #9333EA;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
            }
            .pregunta-puntos {
              color: #F59E0B;
              font-weight: bold;
              font-size: 14px;
            }
            .pregunta-texto {
              font-size: 16px;
              margin: 15px 0;
              color: #1F2937;
            }
            .respuesta {
              background-color: white;
              border: 1px solid #D1D5DB;
              border-radius: 6px;
              padding: 15px;
              margin-top: 10px;
              min-height: 60px;
            }
            .respuesta-vacia {
              color: #9CA3AF;
              font-style: italic;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #E5E5E5;
              text-align: center;
              font-size: 12px;
              color: #6B7280;
            }
            .desafio {
              background-color: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 15px;
              margin: 30px 0;
            }
            .desafio-titulo {
              color: #92400E;
              font-weight: bold;
              margin-bottom: 10px;
            }
            @media print {
              .pregunta-container {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${leccion.titulo}</h1>
            ${leccion.descripcion ? `<p>${leccion.descripcion}</p>` : ''}
          </div>

          <div class="info">
            ${leccion.nombreModulo ? `
              <div class="info-item">
                <span class="info-label">Módulo:</span> ${leccion.nombreModulo}
              </div>
            ` : ''}
            ${leccion.numeroLeccion ? `
              <div class="info-item">
                <span class="info-label">Lección:</span> ${leccion.numeroLeccion}
              </div>
            ` : ''}
            ${leccion.versiculoClave ? `
              <div class="info-item">
                <span class="info-label">Versículo clave:</span> ${leccion.versiculoClave}
              </div>
            ` : ''}
            <div class="info-item">
              <span class="info-label">Fecha de exportación:</span> ${new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <h2>Respuestas del Estudio</h2>
          
          ${preguntas.map((pregunta, index) => {
            const textoP = pregunta.texto || pregunta.pregunta || '';
            const respuesta = respuestas[pregunta.id];
            let respuestaHTML = '<span class="respuesta-vacia">Sin responder</span>';
            
            if (respuesta !== undefined && respuesta !== null && respuesta !== '') {
              if (typeof respuesta === 'string') {
                respuestaHTML = respuesta.replace(/\n/g, '<br>');
              } else if (typeof respuesta === 'boolean') {
                respuestaHTML = respuesta ? 'Verdadero' : 'Falso';
              } else if (typeof respuesta === 'number') {
                respuestaHTML = `Opción ${respuesta + 1}`;
              } else {
                respuestaHTML = String(respuesta);
              }
            }
            
            return `
              <div class="pregunta-container">
                <div class="pregunta-header">
                  <span class="pregunta-numero">#${index + 1}</span>
                  <span class="pregunta-puntos">${pregunta.puntos} puntos</span>
                </div>
                <div class="pregunta-texto">${textoP}</div>
                <div class="respuesta">
                  ${respuestaHTML}
                </div>
              </div>
            `;
          }).join('')}

          ${leccion.desafioSemanal ? `
            <div class="desafio">
              <div class="desafio-titulo">DESAFÍO SEMANAL</div>
              <div>${leccion.desafioSemanal}</div>
            </div>
          ` : ''}

          <div class="footer">
            <p>Iglesia Casa de Dios</p>
            <p>iglesiacasadedios33@gmail.com</p>
            <p style="margin-top: 10px; font-style: italic;">
              "Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre, 
              y del Hijo, y del Espíritu Santo; enseñándoles que guarden todas las cosas que os he mandado; 
              y he aquí yo estoy con vosotros todos los días, hasta el fin del mundo. Amén."
              <br>- Mateo 28:19-20 (RVR1960)
            </p>
          </div>
        </body>
      </html>
    `;

    // Generar el PDF
    const { uri } = await Print.printToFileAsync({ 
      html,
      base64: false 
    });
    
    console.log('PDF generado exitosamente en:', uri);
    
    // Compartir el PDF
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir lección',
        });
      } else {
        console.warn('Sharing no está disponible en esta plataforma');
      }
    } else if (Platform.OS === 'web') {
      // En web, abrir el PDF en una nueva ventana
      await Print.printAsync({ html });
    }
  } catch (error) {
    console.error('Error exportando PDF:', error);
    throw new Error(`No se pudo exportar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

export async function exportarModuloPDF(
  modulo: { titulo: string; descripcion?: string },
  lecciones: any[],
  todasLasRespuestas: { [leccionId: string]: { [preguntaId: string]: any } }
): Promise<void> {
  try {
    console.log('Exportando módulo completo a PDF:', modulo.titulo);
    console.log('Número de lecciones:', lecciones.length);
    
    // Generar HTML para todo el módulo
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${modulo.titulo}</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 40px;
              color: #333;
              line-height: 1.6;
            }
            .portada {
              text-align: center;
              padding: 100px 20px;
              page-break-after: always;
            }
            .portada h1 {
              color: #9333EA;
              font-size: 36px;
              margin-bottom: 20px;
            }
            .portada p {
              font-size: 18px;
              color: #6B7280;
            }
            .leccion {
              page-break-before: always;
            }
            .leccion-header {
              border-bottom: 3px solid #9333EA;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h2 {
              color: #9333EA;
              font-size: 28px;
              margin: 0 0 10px 0;
            }
            h3 {
              color: #6B21A8;
              font-size: 20px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .pregunta-container {
              background-color: #FAFAFA;
              border: 1px solid #E5E5E5;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
            }
            .pregunta-texto {
              font-size: 16px;
              margin: 10px 0;
              color: #1F2937;
            }
            .respuesta {
              background-color: white;
              border: 1px solid #D1D5DB;
              border-radius: 6px;
              padding: 15px;
              margin-top: 10px;
            }
            .respuesta-vacia {
              color: #9CA3AF;
              font-style: italic;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #E5E5E5;
              text-align: center;
              font-size: 12px;
              color: #6B7280;
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="portada">
            <h1>${modulo.titulo}</h1>
            ${modulo.descripcion ? `<p>${modulo.descripcion}</p>` : ''}
            <p style="margin-top: 50px;">Fecha de exportación: ${new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>

          ${lecciones.map((leccion, leccionIndex) => {
            const respuestasLeccion = todasLasRespuestas[leccion.id] || {};
            const preguntas = leccion.preguntas || [];
            
            return `
              <div class="leccion">
                <div class="leccion-header">
                  <h2>Lección ${leccionIndex + 1}: ${leccion.titulo}</h2>
                  ${leccion.descripcion ? `<p>${leccion.descripcion}</p>` : ''}
                </div>
                
                ${preguntas.map((pregunta: any, index: number) => {
                  const respuesta = respuestasLeccion[pregunta.id];
                  let respuestaHTML = '<span class="respuesta-vacia">Sin responder</span>';
                  
                  if (respuesta !== undefined && respuesta !== null && respuesta !== '') {
                    if (typeof respuesta === 'string') {
                      respuestaHTML = respuesta.replace(/\n/g, '<br>');
                    } else {
                      respuestaHTML = String(respuesta);
                    }
                  }
                  
                  return `
                    <div class="pregunta-container">
                      <div class="pregunta-texto">
                        <strong>Pregunta ${index + 1}:</strong> ${pregunta.texto || pregunta.pregunta}
                      </div>
                      <div class="respuesta">
                        ${respuestaHTML}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}

          <div class="footer">
            <p>Iglesia Casa de Dios</p>
            <p>iglesiacasadedios33@gmail.com</p>
            <p style="margin-top: 10px; font-style: italic;">
              "Por tanto, id, y haced discípulos a todas las naciones..."
              <br>- Mateo 28:19-20 (RVR1960)
            </p>
          </div>
        </body>
      </html>
    `;

    // Generar el PDF
    const { uri } = await Print.printToFileAsync({ 
      html,
      base64: false 
    });
    
    console.log('PDF del módulo generado exitosamente en:', uri);
    
    // Compartir el PDF
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir módulo completo',
        });
      } else {
        console.warn('Sharing no está disponible en esta plataforma');
      }
    } else if (Platform.OS === 'web') {
      // En web, abrir el PDF en una nueva ventana
      await Print.printAsync({ html });
    }
  } catch (error) {
    console.error('Error exportando PDF del módulo:', error);
    throw new Error(`No se pudo exportar el PDF del módulo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}