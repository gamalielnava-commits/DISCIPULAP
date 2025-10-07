import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const createModuloProcedure = publicProcedure
  .input(
    z.object({
      fileName: z.string(),
      fileContent: z.string().optional(),
      fileBase64: z.string().optional(),
      fileMimeType: z.string(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      throw new Error('La funcionalidad de IA no está disponible en producción. Esta función solo está disponible en desarrollo local con Rork Toolkit.');
    } catch (error) {
      console.error('Error creando módulo:', error);
      throw error;
    }
  });

export default createModuloProcedure;
