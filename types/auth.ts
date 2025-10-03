export type UserRole = 'admin' | 'supervisor' | 'lider' | 'miembro' | 'invitado';
export type UserStatus = 'activo' | 'pendiente' | 'inactivo';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  status: UserStatus;
  username?: string;
  password?: string;
  grupoId?: string;
  grupoNombre?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  fechaIngreso?: string;
  notas?: string;
  fotoPerfil?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Zone {
  id: string;
  nombre: string;
  descripcion?: string;
  supervisorId?: string;
  supervisorNombre?: string;
  grupoIds: string[];
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  nombre: string;
  descripcion?: string;
  liderId?: string;
  liderNombre?: string;
  zonaId?: string;
  zonaNombre?: string;
  cantidadMiembros: number;
  direccion?: string;
  dia?: string;
  hora?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMemberRole {
  userId: string;
  groupId: string;
  role: 'lider' | 'asistente' | 'anfitrion' | 'amigo' | 'discipulo';
}

export interface Sermon {
  id: string;
  serieId?: string;
  titulo: string;
  fecha: string;
  contenido?: string;
  archivoUrl?: string;
  imagenUrl?: string;
  imagePrompt?: string;
  preguntas?: SermonQuestion[];
  puntosPrincipales?: string[];
  notas?: string;
  versiculos?: string[];
  youtubeUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  docUrl?: string;
  gamification?: {
    multipleChoice: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
    trueFalse: Array<{
      statement: string;
      isTrue: boolean;
    }>;
    rememberPhrase: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SermonSeries {
  id: string;
  titulo: string;
  descripcion?: string;
  imagenUrl?: string;
  sermonIds: string[];
  duracionSemanas?: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SermonQuestion {
  id: string;
  pregunta: string;
  tipo: 'abierta' | 'completar' | 'multiple';
  opciones?: string[];
  respuesta?: string;
}

export interface RolePermissions {
  // Acceso a módulos
  canAccessBiblia: boolean;
  canAccessDiscipulado: boolean;
  canAccessGrupos: boolean;
  canAccessAsistencia: boolean;
  canAccessRecursos: boolean;
  canAccessReportes: boolean;
  canAccessMensajes: boolean;
  canAccessAnuncios: boolean;
  canAccessPredicas: boolean;
  canAccessDevocionales: boolean;
  canAccessPerfil: boolean;
  canAccessAdministracion: boolean;
  canAccessUsuarios: boolean;
  canAccessZonas: boolean;
  
  // Permisos de gestión
  canManageUsers: boolean;
  canManageGroups: boolean;
  canManagePasswords: boolean;
  canSubmitAttendance: boolean;
  canUploadResources: boolean;
  canSendMessages: boolean;
  canViewAllGroups: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageAnuncios: boolean;
  canManagePredicas: boolean;
  canManageDevocionales: boolean;
  
  // Niveles de mensajería
  canMessageToAll: boolean;
  canMessageToSupervisors: boolean;
  canMessageToLeaders: boolean;
  canMessageToMembers: boolean;
  canMessageToGroup: boolean;
}

export interface ModulePermissionConfig {
  moduleKey: keyof RolePermissions;
  moduleName: string;
  description?: string;
  category: 'content' | 'management' | 'communication' | 'admin';
}

export const MODULE_PERMISSIONS: ModulePermissionConfig[] = [
  // Contenido
  { moduleKey: 'canAccessDiscipulado', moduleName: 'Discipulado', category: 'content', description: 'Acceso al módulo de discipulado y progreso' },
  { moduleKey: 'canAccessDevocionales', moduleName: 'Devocionales', category: 'content', description: 'Acceso a devocionales diarios' },
  { moduleKey: 'canAccessPredicas', moduleName: 'Prédicas', category: 'content', description: 'Acceso a prédicas y sermones' },
  { moduleKey: 'canAccessRecursos', moduleName: 'Recursos', category: 'content', description: 'Acceso a recursos y materiales' },
  
  // Gestión
  { moduleKey: 'canAccessGrupos', moduleName: 'Grupos', category: 'management', description: 'Gestión de grupos de discipulado' },
  { moduleKey: 'canAccessZonas', moduleName: 'Zonas', category: 'management', description: 'Gestión de zonas y supervisión' },
  { moduleKey: 'canAccessAsistencia', moduleName: 'Asistencia', category: 'management', description: 'Registro y control de asistencia' },
  { moduleKey: 'canAccessReportes', moduleName: 'Reportes', category: 'management', description: 'Acceso a reportes y estadísticas' },
  
  // Comunicación
  { moduleKey: 'canAccessMensajes', moduleName: 'Mensajes', category: 'communication', description: 'Sistema de mensajería' },
  { moduleKey: 'canAccessAnuncios', moduleName: 'Anuncios', category: 'communication', description: 'Gestión de anuncios' },
  
  // Administración
  { moduleKey: 'canAccessUsuarios', moduleName: 'Usuarios', category: 'admin', description: 'Gestión de usuarios' },
  { moduleKey: 'canAccessAdministracion', moduleName: 'Administración', category: 'admin', description: 'Configuración del sistema' },
  { moduleKey: 'canAccessPerfil', moduleName: 'Perfil', category: 'admin', description: 'Perfil personal del usuario' },
];

export interface CustomRolePermissions {
  roleId: UserRole;
  permissions: Partial<RolePermissions>;
  updatedAt: Date;
  updatedBy: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  invitado: {
    // Acceso muy limitado
    canAccessBiblia: false,
    canAccessDiscipulado: false,
    canAccessGrupos: false,
    canAccessAsistencia: false,
    canAccessRecursos: false,
    canAccessReportes: false,
    canAccessMensajes: false,
    canAccessAnuncios: false,
    canAccessPredicas: false,
    canAccessDevocionales: true,
    canAccessPerfil: true,
    canAccessAdministracion: false,
    canAccessUsuarios: false,
    canAccessZonas: false,
    
    // Sin permisos de gestión
    canManageUsers: false,
    canManageGroups: false,
    canManagePasswords: false,
    canSubmitAttendance: false,
    canUploadResources: false,
    canSendMessages: false,
    canViewAllGroups: false,
    canViewReports: false,
    canExportData: false,
    canManageAnuncios: false,
    canManagePredicas: false,
    canManageDevocionales: false,
    
    // No puede enviar mensajes
    canMessageToAll: false,
    canMessageToSupervisors: false,
    canMessageToLeaders: false,
    canMessageToMembers: false,
    canMessageToGroup: false,
  },
  
  admin: {
    // Acceso total a todos los módulos
    canAccessBiblia: true,
    canAccessDiscipulado: true,
    canAccessGrupos: true,
    canAccessAsistencia: true,
    canAccessRecursos: true,
    canAccessReportes: true,
    canAccessMensajes: true,
    canAccessAnuncios: true,
    canAccessPredicas: true,
    canAccessDevocionales: true,
    canAccessPerfil: true,
    canAccessAdministracion: true,
    canAccessUsuarios: true,
    canAccessZonas: true,
    
    // Permisos totales de gestión
    canManageUsers: true,
    canManageGroups: true,
    canManagePasswords: true,
    canSubmitAttendance: true,
    canUploadResources: true,
    canSendMessages: true,
    canViewAllGroups: true,
    canViewReports: true,
    canExportData: true,
    canManageAnuncios: true,
    canManagePredicas: true,
    canManageDevocionales: true,
    
    // Puede enviar mensajes a todos los niveles
    canMessageToAll: true,
    canMessageToSupervisors: true,
    canMessageToLeaders: true,
    canMessageToMembers: true,
    canMessageToGroup: true,
  },
  
  supervisor: {
    // Acceso a la mayoría de módulos
    canAccessBiblia: false,
    canAccessDiscipulado: true,
    canAccessGrupos: true,
    canAccessAsistencia: true,
    canAccessRecursos: true,
    canAccessReportes: true,
    canAccessMensajes: true,
    canAccessAnuncios: true,
    canAccessPredicas: true,
    canAccessDevocionales: true,
    canAccessPerfil: true,
    canAccessAdministracion: false,
    canAccessUsuarios: false,
    canAccessZonas: true,
    
    // Permisos de gestión limitados
    canManageUsers: false,
    canManageGroups: true,
    canManagePasswords: false,
    canSubmitAttendance: true,
    canUploadResources: true,
    canSendMessages: true,
    canViewAllGroups: true,
    canViewReports: true,
    canExportData: true,
    canManageAnuncios: false,
    canManagePredicas: false,
    canManageDevocionales: false,
    
    // Puede enviar mensajes a líderes y miembros
    canMessageToAll: false,
    canMessageToSupervisors: false,
    canMessageToLeaders: true,
    canMessageToMembers: true,
    canMessageToGroup: true,
  },
  
  lider: {
    // Acceso a módulos específicos
    canAccessBiblia: false,
    canAccessDiscipulado: true,
    canAccessGrupos: true,
    canAccessAsistencia: true,
    canAccessRecursos: true,
    canAccessReportes: false,
    canAccessMensajes: true,
    canAccessAnuncios: true,
    canAccessPredicas: true,
    canAccessDevocionales: true,
    canAccessPerfil: true,
    canAccessAdministracion: false,
    canAccessUsuarios: false,
    canAccessZonas: false,
    
    // Permisos limitados a su grupo
    canManageUsers: false,
    canManageGroups: false,
    canManagePasswords: false,
    canSubmitAttendance: true,
    canUploadResources: true,
    canSendMessages: true,
    canViewAllGroups: false,
    canViewReports: false,
    canExportData: false,
    canManageAnuncios: false,
    canManagePredicas: false,
    canManageDevocionales: false,
    
    // Solo puede enviar mensajes a su grupo
    canMessageToAll: false,
    canMessageToSupervisors: false,
    canMessageToLeaders: false,
    canMessageToMembers: true,
    canMessageToGroup: true,
  },
  
  miembro: {
    // Acceso limitado solo a discipulado y bienvenida
    canAccessBiblia: false,
    canAccessDiscipulado: true,
    canAccessGrupos: false,
    canAccessAsistencia: false,
    canAccessRecursos: false,
    canAccessReportes: false,
    canAccessMensajes: true, // Solo lectura
    canAccessAnuncios: true,
    canAccessPredicas: true,
    canAccessDevocionales: true,
    canAccessPerfil: true,
    canAccessAdministracion: false,
    canAccessUsuarios: false,
    canAccessZonas: false,
    
    // Sin permisos de gestión
    canManageUsers: false,
    canManageGroups: false,
    canManagePasswords: false,
    canSubmitAttendance: false,
    canUploadResources: false,
    canSendMessages: false,
    canViewAllGroups: false,
    canViewReports: false,
    canExportData: false,
    canManageAnuncios: false,
    canManagePredicas: false,
    canManageDevocionales: false,
    
    // No puede enviar mensajes
    canMessageToAll: false,
    canMessageToSupervisors: false,
    canMessageToLeaders: false,
    canMessageToMembers: false,
    canMessageToGroup: false,
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  lider: 'Líder',
  miembro: 'Miembro',
  invitado: 'Invitado',
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  activo: 'Activo',
  pendiente: 'Pendiente',
  inactivo: 'Inactivo',
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  supervisor: 4,
  lider: 3,
  miembro: 2,
  invitado: 1,
};

export function canUserMessageToRole(senderRole: UserRole, targetRole: UserRole): boolean {
  const senderLevel = ROLE_HIERARCHY[senderRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  return senderLevel > targetLevel;
}

export function getUserPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}