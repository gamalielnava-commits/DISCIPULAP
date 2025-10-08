import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { auth, db, IS_FIREBASE_CONFIGURED } from '@/services/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

type TestResult = {
  key: string;
  label: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
};

const initialTests: TestResult[] = [
  { key: 'env', label: 'Variables de entorno', status: 'pending' },
  { key: 'firebaseInit', label: 'Inicialización de Firebase', status: 'pending' },
  { key: 'apiKeyCheck', label: 'Validación de API Key', status: 'pending' },
  { key: 'trpcHi', label: 'API Backend tRPC /example.hi', status: 'pending' },
  { key: 'firestoreRead', label: 'Lectura Firestore (colección users)', status: 'pending' },
];

export default function PruebasScreen() {
  const [results, setResults] = useState<TestResult[]>(initialTests);
  const maskedApiKey = useMemo(() => {
    const k = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';
    if (!k) return '—';
    const start = k.slice(0, 6);
    const end = k.slice(-4);
    return `${start}…${end}`;
  }, []);

  const update = useCallback((key: string, patch: Partial<TestResult>) => {
    setResults(prev => prev.map(t => (t.key === key ? { ...t, ...patch } : t)));
  }, []);

  const runEnv = useCallback(async () => {
    update('env', { status: 'running', message: undefined });
    try {
      const missing: string[] = [];
      const need = [
        'EXPO_PUBLIC_FIREBASE_API_KEY',
        'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
        'EXPO_PUBLIC_FIREBASE_APP_ID',
        'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      ];
      need.forEach(n => {
        if (!process.env[n as keyof NodeJS.ProcessEnv]) missing.push(n);
      });
      if (missing.length > 0) {
        update('env', { status: 'failed', message: `Faltan: ${missing.join(', ')}` });
      } else {
        update('env', { status: 'passed', message: 'OK' });
      }
    } catch (e: any) {
      update('env', { status: 'failed', message: String(e?.message ?? e) });
    }
  }, [update]);

  const runFirebaseInit = useCallback(async () => {
    update('firebaseInit', { status: 'running', message: undefined });
    try {
      if (IS_FIREBASE_CONFIGURED && auth?.app?.name) {
        update('firebaseInit', { status: 'passed', message: `App: ${auth.app.name}` });
        return;
      }
      update('firebaseInit', { status: 'failed', message: 'No configurado' });
    } catch (e: any) {
      update('firebaseInit', { status: 'failed', message: String(e?.message ?? e) });
    }
  }, [update]);

  const runApiKeyCheck = useCallback(async () => {
    update('apiKeyCheck', { status: 'running', message: undefined });
    try {
      const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';
      const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${encodeURIComponent(apiKey)}`;
      const r = await fetch(url, { method: 'POST' });
      if (!r.ok) {
        const tx = await r.text();
        update('apiKeyCheck', { status: 'failed', message: `HTTP ${r.status}: ${tx}` });
        return;
      }
      const json = (await r.json()) as Record<string, any> | undefined;
      const pid = json?.projectId ?? json?.projectNumber ?? 'desconocido';
      update('apiKeyCheck', { status: 'passed', message: `Proyecto: ${String(pid)}` });
    } catch (e: any) {
      update('apiKeyCheck', { status: 'failed', message: String(e?.message ?? e) });
    }
  }, [update]);

  const runTRPCHi = useCallback(async () => {
    update('trpcHi', { status: 'running', message: undefined });
    try {
      const base = process.env.EXPO_PUBLIC_RORK_API_BASE_URL ?? (typeof window !== 'undefined' ? '' : 'http://localhost:3000');
      const url = `${base}/api/trpc/example.hi?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: null } }))}`;
      const r = await fetch(url);
      if (!r.ok) {
        update('trpcHi', { status: 'failed', message: `HTTP ${r.status}` });
        return;
      }
      const data = await r.json();
      const msg = JSON.stringify(data)?.slice(0, 120);
      update('trpcHi', { status: 'passed', message: msg });
    } catch (e: any) {
      update('trpcHi', { status: 'failed', message: String(e?.message ?? e) });
    }
  }, [update]);

  const runFirestoreRead = useCallback(async () => {
    update('firestoreRead', { status: 'running', message: undefined });
    try {
      const qRef = query(collection(db, 'users'), limit(1));
      const snap = await getDocs(qRef);
      update('firestoreRead', { status: 'passed', message: `Docs: ${snap.size}` });
    } catch (e: any) {
      update('firestoreRead', { status: 'failed', message: String(e?.message ?? e) });
    }
  }, [update]);

  const runAll = useCallback(async () => {
    await runEnv();
    await runFirebaseInit();
    await runApiKeyCheck();
    await runTRPCHi();
    await runFirestoreRead();
  }, [runEnv, runFirebaseInit, runApiKeyCheck, runTRPCHi, runFirestoreRead]);

  return (
    <View style={styles.container} testID="pruebas-screen">
      <Stack.Screen options={{ title: 'Pruebas y Diagnóstico' }} />
      <View style={styles.header} testID="header">
        <Text style={styles.title}>Diagnóstico</Text>
        <Text style={styles.subtitle}>Proyecto: {process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '—'}</Text>
        <Text style={styles.subtitle}>API Key: {maskedApiKey}</Text>
        <Text style={styles.subtitle}>Plataforma: {Platform.OS}</Text>
      </View>
      <View style={styles.actions} testID="actions">
        <TouchableOpacity onPress={runAll} style={[styles.btn, styles.btnPrimary]} testID="run-all">
          <Text style={styles.btnText}>Ejecutar todas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setResults(initialTests)} style={[styles.btn, styles.btnGhost]} testID="reset">
          <Text style={[styles.btnText, styles.btnTextGhost]}>Reset</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} testID="results-list">
        {results.map(t => (
          <View key={t.key} style={styles.card} testID={`test-${t.key}`}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t.label}</Text>
              <StatusPill status={t.status} />
            </View>
            {!!t.message && <Text style={styles.cardMessage}>{t.message}</Text>}
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={
                  t.key === 'env' ? runEnv :
                  t.key === 'firebaseInit' ? runFirebaseInit :
                  t.key === 'apiKeyCheck' ? runApiKeyCheck :
                  t.key === 'trpcHi' ? runTRPCHi :
                  runFirestoreRead
                }
                style={[styles.btn, styles.btnSecondary]}
                testID={`run-${t.key}`}
              >
                <Text style={styles.btnText}>Ejecutar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function StatusPill({ status }: { status: TestResult['status'] }) {
  const bg = status === 'passed' ? '#10B981' : status === 'failed' ? '#EF4444' : status === 'running' ? '#F59E0B' : '#6B7280';
  const text = status === 'passed' ? 'OK' : status === 'failed' ? 'Fallo' : status === 'running' ? 'Ejecutando' : 'Pendiente';
  return (
    <View style={[styles.pill, { backgroundColor: bg }]} testID={`status-${status}`}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' as const },
  subtitle: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  btnPrimary: { backgroundColor: '#2563EB' },
  btnSecondary: { backgroundColor: '#111827' },
  btnGhost: { borderWidth: 1, borderColor: '#374151' },
  btnText: { color: '#FFFFFF', fontWeight: '600' as const },
  btnTextGhost: { color: '#9CA3AF' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#111827', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' as const },
  cardMessage: { color: '#D1D5DB', marginTop: 8 },
  cardActions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' as const },
});
