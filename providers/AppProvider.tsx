import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User, UserRole, getUserPermissions, Zone, GroupMemberRole, Sermon, SermonSeries, CustomRolePermissions, RolePermissions, ROLE_PERMISSIONS } from '@/types/auth';
import { AuthService, ChurchDataService } from '@/services/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface Member {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  bautizado: boolean;
  discipulado: boolean;
  ministerio: string;
  grupoId: string;
  estatus: 'activo' | 'inactivo';
}

interface Group {
  id: string;
  nombre: string;
  lideres: string[];
  miembros: string[];
  ubicacion: string;
  horario: string;
  direccion?: string;
  dia?: string;
  hora?: string;
  zonaId?: string;
  zonaNombre?: string;
}

interface Attendance {
  id: string;
  grupoId: string;
  fecha: string;
  asistentes: string[];
  visitantes: number;
  asistenciaDominical: number;
  tema: string;
  notas: string;
  leccionDelDia?: string;
  noHuboReunion?: boolean;
  razonNoReunion?: string;
}

interface Resource {
  id: string;
  titulo: string;
  tipo: 'pdf' | 'video' | 'imagen';
  categoria: string;
  url: string;
  grupoId?: string;
  visibilidad: 'todos' | 'lideres' | 'grupo';
}

interface Announcement {
  id: string;
  titulo: string;
  contenido: string;
  creadoPorUid: string;
  destinatarios: 'todos' | 'lideres' | string;
  fecha: string;
  prioridad: 'normal' | 'alta';
  adjunto?: string;
  imagen?: string;
  programadaPara?: string;
  estado: 'activo' | 'archivado' | 'programado';
}

export const [AppProvider, useApp] = createContextHook(() => {
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [groupMemberRoles, setGroupMemberRoles] = useState<GroupMemberRole[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [sermonSeries, setSermonSeries] = useState<SermonSeries[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [customPermissions, setCustomPermissions] = useState<CustomRolePermissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  // Cargar datos al iniciar
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Clear any potentially corrupted data first
        await clearCorruptedData();
        await loadData();
        await loadUser();
        await loadThemePreference();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    initializeApp();
  }, []);

  const clearCorruptedData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const corruptedKeys: string[] = [];
      
      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value && value !== 'null' && value !== 'undefined' && value.trim() !== '') {
            const trimmedValue = value.trim();
            // Check if it looks like JSON but isn't valid
            if ((trimmedValue.startsWith('{') || trimmedValue.startsWith('[')) && trimmedValue.length > 1) {
              JSON.parse(trimmedValue); // This will throw if invalid
            }
          }
        } catch (parseError) {
          console.warn(`Corrupted data found for key: ${key}, removing...`);
          corruptedKeys.push(key);
        }
      }
      
      if (corruptedKeys.length > 0) {
        await AsyncStorage.multiRemove(corruptedKeys);
        console.log(`Removed ${corruptedKeys.length} corrupted keys:`, corruptedKeys);
      }
    } catch (error) {
      console.error('Error clearing corrupted data:', error);
    }
  };

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Set dark mode as default and save it
        setIsDarkMode(true);
        await AsyncStorage.setItem('theme_preference', 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem('theme_preference', value ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      console.log('AppProvider - Datos del usuario desde AsyncStorage:', userData);
      
      if (userData && userData !== 'null' && userData !== 'undefined' && userData.trim() !== '') {
        try {
          // Check if userData starts with valid JSON characters
          const trimmedData = userData.trim();
          if (trimmedData.startsWith('{') || trimmedData.startsWith('[')) {
            const parsedUser = JSON.parse(trimmedData);
            console.log('AppProvider - Usuario parseado:', parsedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            return; // Exit early if successful
          } else {
            console.log('AppProvider - Invalid JSON format, clearing user data');
            await AsyncStorage.removeItem('currentUser');
          }
        } catch (parseError) {
          console.error('AppProvider - Error parsing user data:', parseError);
          console.log('AppProvider - Raw user data:', userData);
          console.log('AppProvider - Invalid user data, clearing and creating demo user');
          await AsyncStorage.removeItem('currentUser');
        }
      }
      
      // No demo user auto-login. Keep user unauthenticated and show login screen.
      if (!userData || userData === 'null' || userData === 'undefined' || userData.trim() === '') {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const changeUserRole = async (newRole: UserRole) => {
    if (!user) return;
    
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) {
      console.log('AppProvider - No hay usuario para actualizar');
      return;
    }
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    console.log('AppProvider - Actualizando usuario:', updatedUser);
    
    setUser(updatedUser);
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // También actualizar en la lista de usuarios si existe
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers && storedUsers !== 'null' && storedUsers !== 'undefined' && storedUsers.trim() !== '') {
        try {
          const trimmedUsers = storedUsers.trim();
          if (trimmedUsers.startsWith('{') || trimmedUsers.startsWith('[')) {
            const usersList = JSON.parse(trimmedUsers);
            if (Array.isArray(usersList)) {
              const updatedUsersList = usersList.map((u: User) => 
                u.id === user.id ? updatedUser : u
              );
              await AsyncStorage.setItem('users', JSON.stringify(updatedUsersList));
              console.log('AppProvider - Usuario actualizado en la lista de usuarios');
            } else {
              console.log('AppProvider - Users data is not an array in update, creating new list');
              await AsyncStorage.setItem('users', JSON.stringify([updatedUser]));
            }
          } else {
            console.log('AppProvider - Invalid users JSON format in update, creating new list');
            await AsyncStorage.setItem('users', JSON.stringify([updatedUser]));
          }
        } catch (parseError) {
          console.error('Error parsing users list:', parseError);
          console.log('AppProvider - Raw users data in update:', storedUsers);
          await AsyncStorage.setItem('users', JSON.stringify([updatedUser]));
        }
      } else {
        await AsyncStorage.setItem('users', JSON.stringify([updatedUser]));
        console.log('AppProvider - Creada nueva lista de usuarios con el usuario actualizado');
      }
    } catch (error) {
      console.error('Error updating user in users list:', error);
      await AsyncStorage.setItem('users', JSON.stringify([updatedUser]));
    }
  };

  const loadData = async () => {
    try {
      const [membersData, groupsData, zonesData, rolesData, sermonsData, seriesData, attendanceData, resourcesData, announcementsData, customPermissionsData] = await Promise.all([
        AsyncStorage.getItem('members'),
        AsyncStorage.getItem('groups'),
        AsyncStorage.getItem('zones'),
        AsyncStorage.getItem('groupMemberRoles'),
        AsyncStorage.getItem('sermons'),
        AsyncStorage.getItem('sermonSeries'),
        AsyncStorage.getItem('attendance'),
        AsyncStorage.getItem('resources'),
        AsyncStorage.getItem('announcements'),
        AsyncStorage.getItem('customPermissions'),
      ]);

      // Parse data with error handling
      const parseJsonSafely = (data: string | null, defaultValue: any[] = []) => {
        if (!data || data === 'null' || data === 'undefined' || data.trim() === '') {
          return defaultValue;
        }
        try {
          const trimmedData = data.trim();
          if (!trimmedData.startsWith('{') && !trimmedData.startsWith('[')) {
            console.warn('Invalid JSON format detected:', trimmedData.substring(0, 50));
            return defaultValue;
          }
          const parsed = JSON.parse(trimmedData);
          // Ensure we return an array for array-expected data
          if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
            console.warn('Expected array but got:', typeof parsed);
            return defaultValue;
          }
          return parsed;
        } catch (error) {
          console.error('Error parsing JSON data:', error, 'Data preview:', data?.substring(0, 100));
          return defaultValue;
        }
      };

      setMembers(parseJsonSafely(membersData));
      setGroups(parseJsonSafely(groupsData));
      setZones(parseJsonSafely(zonesData));
      setGroupMemberRoles(parseJsonSafely(rolesData));
      setSermons(parseJsonSafely(sermonsData));
      setSermonSeries(parseJsonSafely(seriesData));
      setAttendance(parseJsonSafely(attendanceData));
      setResources(parseJsonSafely(resourcesData));
      setAnnouncements(parseJsonSafely(announcementsData));
      setCustomPermissions(parseJsonSafely(customPermissionsData));

      // Si no hay datos, crear datos de semilla
      const parsedGroups = parseJsonSafely(groupsData);
      if (!groupsData || parsedGroups.length === 0) {
        await createSeedData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSeedData = async () => {
    // Crear grupo de ejemplo
    const sampleGroup: Group = {
      id: '1',
      nombre: 'Discipulado Norte',
      lideres: ['1'],
      miembros: ['2', '3', '4', '5', '6', '7', '8'],
      ubicacion: 'Aurora, Colorado',
      horario: 'Viernes 7:30 PM',
    };

    // Crear miembros de ejemplo
    const sampleMembers: Member[] = [
      {
        id: '1',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '303-555-0101',
        direccion: '123 Main St, Aurora, CO',
        fechaNacimiento: '1985-03-15',
        bautizado: true,
        discipulado: true,
        ministerio: 'Liderazgo',
        grupoId: '1',
        estatus: 'activo',
      },
      {
        id: '2',
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@email.com',
        telefono: '303-555-0102',
        direccion: '456 Oak Ave, Aurora, CO',
        fechaNacimiento: '1990-07-22',
        bautizado: true,
        discipulado: true,
        ministerio: 'Alabanza',
        grupoId: '1',
        estatus: 'activo',
      },
      {
        id: '3',
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'carlos.rodriguez@email.com',
        telefono: '303-555-0103',
        direccion: '789 Pine St, Aurora, CO',
        fechaNacimiento: '1988-11-30',
        bautizado: true,
        discipulado: false,
        ministerio: '',
        grupoId: '1',
        estatus: 'activo',
      },
      {
        id: '4',
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana.martinez@email.com',
        telefono: '303-555-0104',
        direccion: '321 Elm St, Aurora, CO',
        fechaNacimiento: '1995-05-18',
        bautizado: false,
        discipulado: true,
        ministerio: 'Niños',
        grupoId: '1',
        estatus: 'activo',
      },
      {
        id: '5',
        nombre: 'Luis',
        apellido: 'Hernández',
        email: 'luis.hernandez@email.com',
        telefono: '303-555-0105',
        direccion: '654 Maple Dr, Aurora, CO',
        fechaNacimiento: '1992-09-10',
        bautizado: true,
        discipulado: true,
        ministerio: 'Jóvenes',
        grupoId: '1',
        estatus: 'activo',
      },
      {
        id: '6',
        nombre: 'Sofia',
        apellido: 'López',
        email: 'sofia.lopez@email.com',
        telefono: '303-555-0106',
        direccion: '987 Cedar Ln, Aurora, CO',
        fechaNacimiento: '1993-12-25',
        bautizado: true,
        discipulado: false,
        ministerio: '',
        grupoId: '1',
        estatus: 'activo',
      },
      {
        id: '7',
        nombre: 'Diego',
        apellido: 'García',
        email: 'diego.garcia@email.com',
        telefono: '303-555-0107',
        direccion: '147 Birch St, Aurora, CO',
        fechaNacimiento: '1987-06-14',
        bautizado: false,
        discipulado: false,
        ministerio: '',
        grupoId: '1',
        estatus: 'activo',
      },
      {
        id: '8',
        nombre: 'Isabella',
        apellido: 'Ramírez',
        email: 'isabella.ramirez@email.com',
        telefono: '303-555-0108',
        direccion: '258 Spruce Ave, Aurora, CO',
        fechaNacimiento: '1998-02-28',
        bautizado: true,
        discipulado: true,
        ministerio: 'Intercesión',
        grupoId: '1',
        estatus: 'activo',
      },
    ];

    // Crear asistencias de ejemplo (últimas 6 semanas)
    const sampleAttendance: Attendance[] = [
      {
        id: '1',
        grupoId: '1',
        fecha: '2024-01-05',
        asistentes: ['1', '2', '3', '5', '6', '8'],
        visitantes: 2,
        asistenciaDominical: 45,
        tema: 'El amor de Dios',
        notas: 'Excelente participación',
      },
      {
        id: '2',
        grupoId: '1',
        fecha: '2024-01-12',
        asistentes: ['1', '2', '3', '4', '5', '7', '8'],
        visitantes: 1,
        asistenciaDominical: 52,
        tema: 'La fe que mueve montañas',
        notas: 'Tiempo de oración poderoso',
      },
      {
        id: '3',
        grupoId: '1',
        fecha: '2024-01-19',
        asistentes: ['1', '2', '4', '5', '6'],
        visitantes: 3,
        asistenciaDominical: 48,
        tema: 'El fruto del Espíritu',
        notas: 'Nuevos visitantes interesados',
      },
      {
        id: '4',
        grupoId: '1',
        fecha: '2024-01-26',
        asistentes: ['1', '2', '3', '4', '5', '6', '7', '8'],
        visitantes: 0,
        asistenciaDominical: 55,
        tema: 'La armadura de Dios',
        notas: 'Todos presentes, gloria a Dios',
      },
      {
        id: '5',
        grupoId: '1',
        fecha: '2024-02-02',
        asistentes: ['1', '3', '4', '5', '7'],
        visitantes: 2,
        asistenciaDominical: 50,
        tema: 'El poder de la oración',
        notas: 'Testimonios impactantes',
      },
      {
        id: '6',
        grupoId: '1',
        fecha: '2024-02-09',
        asistentes: ['1', '2', '3', '5', '6', '7', '8'],
        visitantes: 4,
        asistenciaDominical: 58,
        tema: 'Viviendo en santidad',
        notas: 'Crecimiento notable del grupo',
      },
    ];

    // Crear recursos de ejemplo
    const sampleResources: Resource[] = [
      {
        id: '1',
        titulo: 'Manual de Discipulado Básico',
        tipo: 'pdf',
        categoria: 'Discipulado',
        url: 'https://example.com/manual-discipulado.pdf',
        visibilidad: 'todos',
      },
      {
        id: '2',
        titulo: 'Guía de Estudio Bíblico',
        tipo: 'pdf',
        categoria: 'Estudio Bíblico',
        url: 'https://example.com/guia-estudio.pdf',
        visibilidad: 'todos',
      },
      {
        id: '3',
        titulo: 'Serie: Fundamentos de la Fe',
        tipo: 'video',
        categoria: 'Enseñanza',
        url: 'https://youtube.com/watch?v=example',
        visibilidad: 'todos',
      },
    ];

    // Crear anuncios de ejemplo
    const sampleAnnouncements: Announcement[] = [
      {
        id: '1',
        titulo: '¡Retiro de Discipulado 2024!',
        contenido: 'Nos complace anunciar nuestro retiro anual de discipulado. Será del 15 al 17 de marzo en las montañas de Colorado. Costo: $50 por persona. Incluye hospedaje y alimentación. ¡No te lo pierdas!',
        creadoPorUid: 'admin',
        destinatarios: 'todos',
        fecha: new Date().toISOString(),
        prioridad: 'alta',
        estado: 'activo',
      },
      {
        id: '2',
        titulo: 'Reunión Especial - Discipulado Norte',
        contenido: 'Este viernes tendremos una reunión especial con invitado especial. Por favor, traigan algo para compartir en la cena.',
        creadoPorUid: '1',
        destinatarios: 'grupo:1',
        fecha: new Date().toISOString(),
        prioridad: 'normal',
        estado: 'activo',
      },
    ];

    // Guardar datos
    setGroups([sampleGroup]);
    setMembers(sampleMembers);
    setAttendance(sampleAttendance);
    setResources(sampleResources);
    setAnnouncements(sampleAnnouncements);

    await Promise.all([
      AsyncStorage.setItem('groups', JSON.stringify([sampleGroup])),
      AsyncStorage.setItem('members', JSON.stringify(sampleMembers)),
      AsyncStorage.setItem('attendance', JSON.stringify(sampleAttendance)),
      AsyncStorage.setItem('resources', JSON.stringify(sampleResources)),
      AsyncStorage.setItem('announcements', JSON.stringify(sampleAnnouncements)),
    ]);
  };

  // Funciones para manejar miembros
  const addMember = async (member: Omit<Member, 'id'>) => {
    const newMember = { ...member, id: Date.now().toString() };
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    await AsyncStorage.setItem('members', JSON.stringify(updatedMembers));
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    const updatedMembers = members.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    setMembers(updatedMembers);
    await AsyncStorage.setItem('members', JSON.stringify(updatedMembers));
  };

  const deleteMember = async (id: string) => {
    const updatedMembers = members.filter(m => m.id !== id);
    setMembers(updatedMembers);
    await AsyncStorage.setItem('members', JSON.stringify(updatedMembers));
  };

  // Funciones para manejar grupos
  const addGroup = async (group: Omit<Group, 'id' | 'miembros'>) => {
    const newGroup = { 
      ...group, 
      id: Date.now().toString(),
      miembros: []
    };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
  };

  const updateGroup = async (id: string, updates: Partial<Group>) => {
    const updatedGroups = groups.map(g => 
      g.id === id ? { ...g, ...updates } : g
    );
    setGroups(updatedGroups);
    await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
  };

  const deleteGroup = async (id: string) => {
    const updatedGroups = groups.filter(g => g.id !== id);
    setGroups(updatedGroups);
    await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
  };

  // Funciones para manejar asistencia
  const addAttendance = async (attendanceData: Omit<Attendance, 'id'>) => {
    const newAttendance = { ...attendanceData, id: Date.now().toString() };
    const updatedAttendance = [...attendance, newAttendance];
    setAttendance(updatedAttendance);
    await AsyncStorage.setItem('attendance', JSON.stringify(updatedAttendance));
  };

  // Funciones para manejar recursos
  const addResource = async (resource: Omit<Resource, 'id'>) => {
    const newResource = { ...resource, id: Date.now().toString() };
    const updatedResources = [...resources, newResource];
    setResources(updatedResources);
    await AsyncStorage.setItem('resources', JSON.stringify(updatedResources));
  };

  // Funciones para manejar anuncios
  const addAnnouncement = async (announcement: Omit<Announcement, 'id'>) => {
    const newAnnouncement = { 
      ...announcement, 
      id: Date.now().toString(),
      estado: announcement.estado || 'activo'
    };
    const updatedAnnouncements = [...announcements, newAnnouncement];
    setAnnouncements(updatedAnnouncements);
    await AsyncStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const updatedAnnouncements = announcements.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    setAnnouncements(updatedAnnouncements);
    await AsyncStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
  };

  const deleteAnnouncement = async (id: string) => {
    const updatedAnnouncements = announcements.filter(a => a.id !== id);
    setAnnouncements(updatedAnnouncements);
    await AsyncStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
  };

  // Funciones para manejar zonas
  const addZone = async (zone: Omit<Zone, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newZone: Zone = {
      ...zone,
      id: Date.now().toString(),
      grupoIds: zone.grupoIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedZones = [...zones, newZone];
    setZones(updatedZones);
    await AsyncStorage.setItem('zones', JSON.stringify(updatedZones));
    return newZone;
  };

  const updateZone = async (id: string, updates: Partial<Zone>) => {
    const updatedZones = zones.map(z => 
      z.id === id ? { ...z, ...updates, updatedAt: new Date() } : z
    );
    setZones(updatedZones);
    await AsyncStorage.setItem('zones', JSON.stringify(updatedZones));
  };

  const deleteZone = async (id: string) => {
    const updatedZones = zones.filter(z => z.id !== id);
    setZones(updatedZones);
    await AsyncStorage.setItem('zones', JSON.stringify(updatedZones));
  };

  // Funciones para manejar roles de miembros en grupos
  const assignGroupMemberRole = async (userId: string, groupId: string, role: GroupMemberRole['role']) => {
    const existingRole = groupMemberRoles.find(r => r.userId === userId && r.groupId === groupId);
    let updatedRoles;
    
    if (existingRole) {
      updatedRoles = groupMemberRoles.map(r => 
        (r.userId === userId && r.groupId === groupId) ? { ...r, role } : r
      );
    } else {
      const newRole: GroupMemberRole = { userId, groupId, role };
      updatedRoles = [...groupMemberRoles, newRole];
    }
    
    setGroupMemberRoles(updatedRoles);
    await AsyncStorage.setItem('groupMemberRoles', JSON.stringify(updatedRoles));
  };

  // Funciones para manejar sermones
  const addSermon = async (sermon: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSermon: Sermon = {
      ...sermon,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedSermons = [...sermons, newSermon];
    setSermons(updatedSermons);
    await AsyncStorage.setItem('sermons', JSON.stringify(updatedSermons));
    return newSermon;
  };

  const updateSermon = async (id: string, updates: Partial<Sermon>) => {
    const updatedSermons = sermons.map(s => 
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    );
    setSermons(updatedSermons);
    await AsyncStorage.setItem('sermons', JSON.stringify(updatedSermons));
  };

  const deleteSermon = async (id: string) => {
    const updatedSermons = sermons.filter(s => s.id !== id);
    setSermons(updatedSermons);
    await AsyncStorage.setItem('sermons', JSON.stringify(updatedSermons));
  };

  // Funciones para manejar series de sermones
  const addSermonSeries = async (series: Omit<SermonSeries, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSeries: SermonSeries = {
      ...series,
      id: Date.now().toString(),
      sermonIds: series.sermonIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedSeries = [...sermonSeries, newSeries];
    setSermonSeries(updatedSeries);
    await AsyncStorage.setItem('sermonSeries', JSON.stringify(updatedSeries));
    return newSeries;
  };

  const updateSermonSeries = async (id: string, updates: Partial<SermonSeries>) => {
    const updatedSeries = sermonSeries.map(s => 
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    );
    setSermonSeries(updatedSeries);
    await AsyncStorage.setItem('sermonSeries', JSON.stringify(updatedSeries));
  };

  const deleteSermonSeries = async (id: string) => {
    const updatedSeries = sermonSeries.filter(s => s.id !== id);
    setSermonSeries(updatedSeries);
    await AsyncStorage.setItem('sermonSeries', JSON.stringify(updatedSeries));
  };

  // Función para obtener permisos con personalizaciones
  const getEffectivePermissions = (role: UserRole): RolePermissions | null => {
    if (!role) return null;
    
    // Obtener permisos base del rol
    const basePermissions = ROLE_PERMISSIONS[role];
    
    // Buscar personalizaciones para este rol
    const customForRole = customPermissions.find(cp => cp.roleId === role);
    
    if (customForRole && customForRole.permissions) {
      // Combinar permisos base con personalizaciones
      return {
        ...basePermissions,
        ...customForRole.permissions
      };
    }
    
    return basePermissions;
  };

  // Función para actualizar permisos personalizados
  const updateCustomPermissions = async (roleId: UserRole, permissions: Partial<RolePermissions>) => {
    const existingIndex = customPermissions.findIndex(cp => cp.roleId === roleId);
    let updatedCustomPermissions: CustomRolePermissions[];
    
    const newCustomPermission: CustomRolePermissions = {
      roleId,
      permissions,
      updatedAt: new Date(),
      updatedBy: user?.id || 'admin'
    };
    
    if (existingIndex >= 0) {
      updatedCustomPermissions = [...customPermissions];
      updatedCustomPermissions[existingIndex] = newCustomPermission;
    } else {
      updatedCustomPermissions = [...customPermissions, newCustomPermission];
    }
    
    setCustomPermissions(updatedCustomPermissions);
    await AsyncStorage.setItem('customPermissions', JSON.stringify(updatedCustomPermissions));
  };

  // Función para resetear permisos a los valores por defecto
  const resetPermissionsToDefault = async (roleId: UserRole) => {
    const updatedCustomPermissions = customPermissions.filter(cp => cp.roleId !== roleId);
    setCustomPermissions(updatedCustomPermissions);
    await AsyncStorage.setItem('customPermissions', JSON.stringify(updatedCustomPermissions));
  };

  // Función para resetear todas las estadísticas y datos
  const resetAllData = async () => {
    try {
      // Limpiar todos los datos del AsyncStorage
      await AsyncStorage.multiRemove([
        'members',
        'groups',
        'zones',
        'groupMemberRoles',
        'sermons',
        'sermonSeries',
        'attendance',
        'resources',
        'announcements',
        'customPermissions',
        'discipleship_progress',
        'discipleship_scores',
        'devotionals',
        'devotional_progress',
        'module_visibility',
        'devocionales',
      ]);

      // Resetear todos los estados a arrays vacíos
      setMembers([]);
      setGroups([]);
      setZones([]);
      setGroupMemberRoles([]);
      setSermons([]);
      setSermonSeries([]);
      setAttendance([]);
      setResources([]);
      setAnnouncements([]);
      setCustomPermissions([]);

      // Mantener el usuario actual pero resetear sus datos si es necesario
      if (user) {
        const resetUser = {
          ...user,
          // Resetear cualquier estadística del usuario si existe
        };
        setUser(resetUser);
        await AsyncStorage.setItem('currentUser', JSON.stringify(resetUser));
      }

      console.log('Todos los datos han sido reseteados exitosamente');
      return true;
    } catch (error) {
      console.error('Error al resetear los datos:', error);
      return false;
    }
  };

  // Obtener permisos efectivos para el usuario actual
  const permissions = user ? getEffectivePermissions(user.role) : null;

  return {
    members,
    groups,
    zones,
    groupMemberRoles,
    sermons,
    sermonSeries,
    attendance,
    resources,
    announcements,
    customPermissions,
    isLoading,
    user,
    setUser,
    updateUser,
    isAuthenticated,
    setIsAuthenticated,
    permissions,
    changeUserRole,
    addMember,
    updateMember,
    deleteMember,
    addGroup,
    updateGroup,
    deleteGroup,
    addZone,
    updateZone,
    deleteZone,
    assignGroupMemberRole,
    addSermon,
    updateSermon,
    deleteSermon,
    addSermonSeries,
    updateSermonSeries,
    deleteSermonSeries,
    addAttendance,
    addResource,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    updateCustomPermissions,
    resetPermissionsToDefault,
    getEffectivePermissions,
    isDarkMode,
    setIsDarkMode: toggleDarkMode,
    resetAllData,
  };
});