import { publicProcedure } from '../../../create-context';

export const listModulosProcedure = publicProcedure.query(async () => {
  try {
    return {
      success: true,
      modulos: [],
    };
  } catch (error) {
    console.error('Error listando módulos:', error);
    return {
      success: false,
      modulos: [],
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
});

export default listModulosProcedure;
