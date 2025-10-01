import { Platform } from 'react-native';

interface DatosExportar {
  modulo: string;
  leccion: string;
  respuestas: Record<string, string>;
  fecha: string;
}

export const exportToCSV = async (datos: DatosExportar): Promise<string> => {
  const csv = generarCSV(datos);
  
  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${datos.leccion.replace(/\s+/g, '_')}_${datos.fecha}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return url;
  } else {
    // En móvil, retornar el contenido como string
    // En una app real, usarías react-native-fs o similar para guardar el archivo
    return csv;
  }
};

const generarCSV = (datos: DatosExportar): string => {
  const headers = ['Módulo', 'Lección', 'Pregunta ID', 'Respuesta', 'Fecha'];
  const rows = Object.entries(datos.respuestas).map(([preguntaId, respuesta]) => [
    datos.modulo,
    datos.leccion,
    preguntaId,
    `"${(respuesta || 'Sin respuesta').replace(/"/g, '""')}"`,
    datos.fecha,
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
  
  // Agregar BOM para UTF-8
  return '\ufeff' + csvContent;
};