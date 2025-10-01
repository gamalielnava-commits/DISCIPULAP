import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

interface Pregunta {
  id: string;
  numero?: number;
  texto?: string;
  pregunta?: string;
  tipo: string;
  puntos?: number;
}

export async function exportarLeccionCSV(
  leccion: {
    titulo: string;
    descripcion?: string;
    numeroLeccion?: number;
    nombreModulo?: string;
  },
  preguntas: Pregunta[],
  respuestas: { [key: string]: any }
): Promise<void> {
  try {
    // Crear el contenido CSV
    let csvContent = 'Número,Pregunta,Tipo,Puntos,Respuesta\n';
    
    preguntas.forEach((pregunta, index) => {
      const textoPregunta = (pregunta.texto || pregunta.pregunta || '').replace(/"/g, '""');
      const respuesta = respuestas[pregunta.id];
      let respuestaTexto = 'Sin responder';
      
      if (respuesta !== undefined && respuesta !== null && respuesta !== '') {
        if (typeof respuesta === 'string') {
          respuestaTexto = respuesta.replace(/"/g, '""');
        } else if (typeof respuesta === 'boolean') {
          respuestaTexto = respuesta ? 'Verdadero' : 'Falso';
        } else if (typeof respuesta === 'number') {
          respuestaTexto = `Opción ${respuesta + 1}`;
        } else {
          respuestaTexto = String(respuesta);
        }
      }
      
      csvContent += `${index + 1},"${textoPregunta}","${pregunta.tipo}",${pregunta.puntos},"${respuestaTexto}"\n`;
    });
    
    // Agregar metadatos al final
    csvContent += '\n\nMetadatos\n';
    csvContent += `Lección:,"${leccion.titulo}"\n`;
    if (leccion.descripcion) {
      csvContent += `Descripción:,"${leccion.descripcion}"\n`;
    }
    if (leccion.nombreModulo) {
      csvContent += `Módulo:,"${leccion.nombreModulo}"\n`;
    }
    if (leccion.numeroLeccion) {
      csvContent += `Número de lección:,${leccion.numeroLeccion}\n`;
    }
    csvContent += `Fecha de exportación:,"${new Date().toLocaleDateString('es-ES')}"\n`;
    
    // Guardar el archivo
    const fileName = `leccion_${leccion.titulo.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Compartir el archivo
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Compartir respuestas en CSV',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch (error) {
    console.error('Error exportando CSV:', error);
    throw new Error('No se pudo exportar el CSV');
  }
}

export async function exportarModuloCSV(
  modulo: { titulo: string; descripcion?: string },
  lecciones: any[],
  todasLasRespuestas: { [leccionId: string]: { [preguntaId: string]: any } }
): Promise<void> {
  try {
    // Crear el contenido CSV para todo el módulo
    let csvContent = `Módulo: ${modulo.titulo}\n`;
    if (modulo.descripcion) {
      csvContent += `Descripción: ${modulo.descripcion}\n`;
    }
    csvContent += `Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}\n\n`;
    csvContent += 'Lección,Número Pregunta,Pregunta,Tipo,Puntos,Respuesta\n';
    
    lecciones.forEach((leccion, leccionIndex) => {
      const respuestasLeccion = todasLasRespuestas[leccion.id] || {};
      const preguntas = leccion.preguntas || [];
      
      preguntas.forEach((pregunta: any, preguntaIndex: number) => {
        const textoPregunta = (pregunta.texto || pregunta.pregunta || '').replace(/"/g, '""');
        const respuesta = respuestasLeccion[pregunta.id];
        let respuestaTexto = 'Sin responder';
        
        if (respuesta !== undefined && respuesta !== null && respuesta !== '') {
          if (typeof respuesta === 'string') {
            respuestaTexto = respuesta.replace(/"/g, '""');
          } else if (typeof respuesta === 'boolean') {
            respuestaTexto = respuesta ? 'Verdadero' : 'Falso';
          } else if (typeof respuesta === 'number') {
            respuestaTexto = `Opción ${respuesta + 1}`;
          } else {
            respuestaTexto = String(respuesta);
          }
        }
        
        csvContent += `"Lección ${leccionIndex + 1}: ${leccion.titulo}",${preguntaIndex + 1},"${textoPregunta}","${pregunta.tipo}",${pregunta.puntos},"${respuestaTexto}"\n`;
      });
    });
    
    // Guardar el archivo
    const fileName = `modulo_${modulo.titulo.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Compartir el archivo
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Compartir módulo completo en CSV',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch (error) {
    console.error('Error exportando CSV del módulo:', error);
    throw new Error('No se pudo exportar el CSV del módulo');
  }
}