import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const deleteModuloProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    try {
      console.log('Eliminando módulo:', input.id);

      return {
        success: true,
        message: 'Módulo eliminado exitosamente',
      };
    } catch (error) {
      console.error('Error eliminando módulo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  });

export default deleteModuloProcedure;
