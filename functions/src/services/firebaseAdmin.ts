import { getAdminDb } from '../firebaseAdmin';

export class FirestoreAdminService {
  static async create(collectionName: string, data: any): Promise<string> {
    const db = getAdminDb();
    const docRef = await db.collection(collectionName).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  static async read(collectionName: string, docId: string): Promise<any | null> {
    const db = getAdminDb();
    const docSnap = await db.collection(collectionName).doc(docId).get();
    
    if (docSnap.exists) {
      return { id: docId, ...docSnap.data() };
    }
    return null;
  }

  static async update(collectionName: string, docId: string, updates: any): Promise<void> {
    const db = getAdminDb();
    await db.collection(collectionName).doc(docId).update({ 
      ...updates, 
      updatedAt: new Date() 
    });
  }

  static async delete(collectionName: string, docId: string): Promise<void> {
    const db = getAdminDb();
    await db.collection(collectionName).doc(docId).delete();
  }

  static async getAll(collectionName: string, orderByField?: string): Promise<any[]> {
    const db = getAdminDb();
    let query: any = db.collection(collectionName);
    
    if (orderByField) {
      query = query.orderBy(orderByField, 'desc');
    }
    
    const querySnapshot = await query.get();
    return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  static async getWhere(collectionName: string, field: string, operator: any, value: any): Promise<any[]> {
    const db = getAdminDb();
    const querySnapshot = await db.collection(collectionName).where(field, operator, value).get();
    return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
}

export class ChurchDataAdminService {
  static async upsertUserProgress(params: {
    userId: string;
    moduleId: string;
    lessonId: string;
    status: 'iniciado' | 'completado' | 'pendiente';
    score?: number;
    answers?: Record<string, any>;
    completedAt?: Date | null;
  }): Promise<string> {
    const { userId, moduleId, lessonId, ...rest } = params;
    const existing = await FirestoreAdminService.getWhere(
      'userProgress',
      'key',
      '==',
      `${userId}:${moduleId}:${lessonId}`
    );

    const payload = {
      userId,
      moduleId,
      lessonId,
      key: `${userId}:${moduleId}:${lessonId}`,
      ...rest,
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await FirestoreAdminService.update('userProgress', existing[0].id, payload);
      return existing[0].id as string;
    }
    return FirestoreAdminService.create('userProgress', {
      ...payload,
      createdAt: new Date(),
    });
  }

  static async getUserProgress(userId: string): Promise<any[]> {
    return FirestoreAdminService.getWhere('userProgress', 'userId', '==', userId);
  }

  static async getUserModuleProgress(userId: string, moduleId: string): Promise<any[]> {
    const all = await FirestoreAdminService.getWhere('userProgress', 'userId', '==', userId);
    return all.filter(p => p?.moduleId === moduleId);
  }

  static async addDiscipleshipEntry(entry: {
    userId: string;
    moduleId: string;
    lessonId?: string;
    note?: string;
    checkpoint?: 'inicio' | 'medio' | 'fin';
    extra?: Record<string, any>;
  }): Promise<string> {
    return FirestoreAdminService.create('discipleship', {
      ...entry,
      timestamp: new Date(),
    });
  }

  static async listDiscipleshipEntries(userId: string, moduleId?: string): Promise<any[]> {
    if (moduleId) {
      const byUser = await FirestoreAdminService.getWhere('discipleship', 'userId', '==', userId);
      return byUser.filter(e => e?.moduleId === moduleId);
    }
    return FirestoreAdminService.getWhere('discipleship', 'userId', '==', userId);
  }

  static async createSermon(sermon: {
    title: string;
    speaker: string;
    date: string;
    seriesId?: string;
    description?: string;
    coverUrl?: string;
    audioUrl?: string;
    durationSec?: number;
    tags?: string[];
  }): Promise<string> {
    return FirestoreAdminService.create('sermons', sermon);
  }

  static async updateSermon(id: string, updates: Partial<{
    title: string; speaker: string; date: string; description: string; coverUrl: string; audioUrl: string; durationSec: number; tags: string[];
  }>): Promise<void> {
    return FirestoreAdminService.update('sermons', id, updates);
  }

  static async listSermons(): Promise<any[]> {
    return FirestoreAdminService.getAll('sermons', 'date');
  }

  static async deleteSermon(id: string): Promise<void> {
    return FirestoreAdminService.delete('sermons', id);
  }

  static async logStat(event: {
    type: string;
    userId?: string;
    payload?: Record<string, any>;
  }): Promise<string> {
    return FirestoreAdminService.create('analytics', {
      ...event,
      createdAt: new Date(),
    });
  }

  static async getStatsByType(type: string, since?: Date): Promise<any[]> {
    const all = await FirestoreAdminService.getWhere('analytics', 'type', '==', type);
    if (!since) return all;
    return all.filter(e => {
      const d = (e?.createdAt as any) as Date | { seconds?: number } | undefined;
      if (!d) return false;
      const date = (d as any)?.seconds ? new Date((d as any).seconds * 1000) : new Date(String(d));
      return date.getTime() >= since.getTime();
    });
  }
}
