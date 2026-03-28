import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const updateModuloProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      titulo: z.string().optional(),
      descripcion: z.string().optional(),
      lecciones: z.any().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('Actualizando módulo:', input.id);

      return {
        success: true,
        message: 'Módulo actualizado exitosamente',
      };
    } catch (error) {
      console.error('Error actualizando módulo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  });

export default updateModuloProcedure;
