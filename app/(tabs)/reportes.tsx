import React, { useState, useMemo } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  Platform,
  ActivityIndicator
} from "react-native";
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter, X, ChevronDown, PieChart, Activity, Share2, FileText, Presentation } from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";
import Colors from "@/constants/colors";
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '@/components/AppHeader';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { members, groups, attendance, user, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [selectedPeriod, setSelectedPeriod] = useState<'semanal' | 'mensual' | 'trimestral' | 'anual'>('mensual');
  const [selectedGroup, setSelectedGroup] = useState<string | 'todos'>('todos');
  const [selectedMetric, setSelectedMetric] = useState<'asistencia' | 'membresia' | 'discipulado' | 'bautizados'>('asistencia');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Filtrar datos según el grupo seleccionado
  const filteredMembers = useMemo(() => {
    if (selectedGroup === 'todos') return members;
    return members.filter(m => m.grupoId === selectedGroup);
  }, [members, selectedGroup]);

  const filteredAttendance = useMemo(() => {
    if (selectedGroup === 'todos') return attendance;
    return attendance.filter(a => a.grupoId === selectedGroup);
  }, [attendance, selectedGroup]);

  // Calcular estadísticas
  const activeMembers = filteredMembers.filter(m => m.estatus === 'activo').length;
  const baptizedCount = filteredMembers.filter(m => m.bautizado).length;
  const discipleshipCount = filteredMembers.filter(m => m.discipulado).length;
  const baptizedPercentage = filteredMembers.length > 0 
    ? Math.round((baptizedCount / filteredMembers.length) * 100)
    : 0;
  const discipleshipPercentage = filteredMembers.length > 0
    ? Math.round((discipleshipCount / filteredMembers.length) * 100)
    : 0;

  // Calcular promedio de asistencia
  const averageAttendance = filteredAttendance.length > 0
    ? Math.round(filteredAttendance.reduce((sum, a) => sum + a.asistentes.length, 0) / filteredAttendance.length)
    : 0;

  const totalVisitors = filteredAttendance.reduce((sum, a) => sum + a.visitantes, 0);

  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'csv' | 'presentation'>('pdf');

  const generateReportHTML = () => {
    const reportDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 40px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2B6CB0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h1 {
              color: #2B6CB0;
              font-size: 32px;
              margin: 0 0 10px 0;
            }
            .subtitle {
              color: #6B7280;
              font-size: 18px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 30px 0;
            }
            .stat-card {
              background: linear-gradient(135deg, #F3F4F6 0%, #FFFFFF 100%);
              border: 1px solid #E5E7EB;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
            }
            .stat-value {
              font-size: 36px;
              font-weight: bold;
              color: #1F2937;
              margin: 10px 0;
            }
            .stat-label {
              color: #6B7280;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .chart-section {
              margin: 40px 0;
              page-break-inside: avoid;
            }
            .chart-title {
              font-size: 24px;
              color: #1F2937;
              margin-bottom: 20px;
              border-bottom: 2px solid #E5E7EB;
              padding-bottom: 10px;
            }
            .group-summary {
              background: #F9FAFB;
              border-radius: 8px;
              padding: 15px;
              margin: 15px 0;
            }
            .group-name {
              font-weight: bold;
              color: #2B6CB0;
              font-size: 18px;
            }
            .group-stats {
              display: flex;
              justify-content: space-around;
              margin-top: 10px;
            }
            .group-stat {
              text-align: center;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #E5E7EB;
              text-align: center;
              font-size: 12px;
              color: #6B7280;
            }
            @media print {
              .stat-card, .group-summary {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte de ${selectedMetric === 'asistencia' ? 'Asistencia' : 
                             selectedMetric === 'membresia' ? 'Membresía' :
                             selectedMetric === 'discipulado' ? 'Discipulado' : 'Bautizados'}</h1>
            <div class="subtitle">Período: ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} | ${reportDate}</div>
          </div>

          <div class="stats-grid">
            ${stats.map(stat => `
              <div class="stat-card">
                <div class="stat-label">${stat.title}</div>
                <div class="stat-value">${stat.value}</div>
                <div style="color: #10B981; font-size: 14px;">${stat.trend}</div>
              </div>
            `).join('')}
          </div>

          <div class="chart-section">
            <h2 class="chart-title">Resumen por Grupos</h2>
            ${groups.map(group => {
              const groupMembers = members.filter(m => m.grupoId === group.id);
              const groupAttendance = attendance.filter(a => a.grupoId === group.id);
              const avgAttendance = groupAttendance.length > 0
                ? Math.round(groupAttendance.reduce((sum, a) => sum + a.asistentes.length, 0) / groupAttendance.length)
                : 0;
              const baptizedInGroup = groupMembers.filter(m => m.bautizado).length;
              const baptizedPerc = groupMembers.length > 0 ? Math.round((baptizedInGroup / groupMembers.length) * 100) : 0;
              
              return `
                <div class="group-summary">
                  <div class="group-name">${group.nombre}</div>
                  <div style="color: #6B7280; font-size: 14px; margin: 5px 0;">${group.ubicacion} • ${group.horario}</div>
                  <div class="group-stats">
                    <div class="group-stat">
                      <div style="font-size: 24px; font-weight: bold; color: #2B6CB0;">${groupMembers.length}</div>
                      <div style="font-size: 12px; color: #6B7280;">Miembros</div>
                    </div>
                    <div class="group-stat">
                      <div style="font-size: 24px; font-weight: bold; color: #10B981;">${avgAttendance}</div>
                      <div style="font-size: 12px; color: #6B7280;">Promedio Asistencia</div>
                    </div>
                    <div class="group-stat">
                      <div style="font-size: 24px; font-weight: bold; color: #8B5CF6;">${baptizedPerc}%</div>
                      <div style="font-size: 12px; color: #6B7280;">Bautizados</div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="footer">
            <p><strong>Iglesia Casa de Dios</strong></p>
            <p>Reporte generado automáticamente</p>
            <p>iglesiacasadedios33@gmail.com</p>
          </div>
        </body>
      </html>
    `;
  };

  const generateCSVContent = () => {
    let csvContent = 'Reporte de ' + (selectedMetric === 'asistencia' ? 'Asistencia' : 
                                      selectedMetric === 'membresia' ? 'Membresía' :
                                      selectedMetric === 'discipulado' ? 'Discipulado' : 'Bautizados') + '\n';
    csvContent += 'Período: ' + selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1) + '\n';
    csvContent += 'Fecha: ' + new Date().toLocaleDateString('es-ES') + '\n\n';
    
    // Estadísticas generales
    csvContent += 'ESTADÍSTICAS GENERALES\n';
    csvContent += 'Métrica,Valor,Tendencia\n';
    stats.forEach(stat => {
      csvContent += `"${stat.title}","${stat.value}","${stat.trend}"\n`;
    });
    
    csvContent += '\n\nRESUMEN POR GRUPOS\n';
    csvContent += 'Grupo,Ubicación,Horario,Miembros,Promedio Asistencia,% Bautizados,Activos\n';
    
    groups.forEach(group => {
      const groupMembers = members.filter(m => m.grupoId === group.id);
      const groupAttendance = attendance.filter(a => a.grupoId === group.id);
      const avgAttendance = groupAttendance.length > 0
        ? Math.round(groupAttendance.reduce((sum, a) => sum + a.asistentes.length, 0) / groupAttendance.length)
        : 0;
      const baptizedInGroup = groupMembers.filter(m => m.bautizado).length;
      const baptizedPerc = groupMembers.length > 0 ? Math.round((baptizedInGroup / groupMembers.length) * 100) : 0;
      const activeCount = groupMembers.filter(m => m.estatus === 'activo').length;
      
      csvContent += `"${group.nombre}","${group.ubicacion}","${group.horario}",${groupMembers.length},${avgAttendance},${baptizedPerc}%,${activeCount}\n`;
    });
    
    return csvContent;
  };

  const generatePresentationHTML = async () => {
    setIsExporting(true);
    try {
      // Llamar a la API de IA para generar contenido de presentación
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente que genera presentaciones profesionales en HTML con diseño moderno y gráficos visuales atractivos. Usa colores, iconos y diseño responsivo.'
            },
            {
              role: 'user',
              content: `Genera una presentación HTML profesional con los siguientes datos de la iglesia:
                
                Período: ${selectedPeriod}
                Métrica principal: ${selectedMetric}
                
                Estadísticas:
                ${stats.map(s => `- ${s.title}: ${s.value} (${s.trend})`).join('\n')}
                
                Grupos:
                ${groups.map(g => {
                  const gMembers = members.filter(m => m.grupoId === g.id);
                  return `- ${g.nombre}: ${gMembers.length} miembros, ubicación: ${g.ubicacion}`;
                }).join('\n')}
                
                Crea una presentación con:
                1. Portada atractiva
                2. Resumen ejecutivo con KPIs
                3. Gráficos visuales (usa SVG o CSS para crear gráficos)
                4. Análisis por grupos
                5. Conclusiones y recomendaciones
                6. Diseño moderno con gradientes y colores profesionales
                
                La presentación debe ser visualmente atractiva, profesional y fácil de entender.`
            }
          ]
        })
      });

      const data = await response.json();
      return data.completion;
    } catch (error) {
      console.error('Error generando presentación:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const html = exportType === 'presentation' && user?.role === 'admin' 
        ? await generatePresentationHTML()
        : generateReportHTML();
      
      const { uri } = await Print.printToFileAsync({ 
        html,
        base64: false
      });
      
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: 'Compartir Reporte',
          });
        } else {
          Alert.alert('Información', 'Función de compartir no disponible en esta plataforma');
        }
      }
      
      Alert.alert('Éxito', 'Reporte generado correctamente');
    } catch (error) {
      console.error('Error exportando PDF:', error);
      Alert.alert('Error', 'No se pudo generar el reporte');
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const csvContent = generateCSVContent();
      const fileName = `reporte_${selectedMetric}_${Date.now()}.csv`;
      
      if (Platform.OS === 'web') {
        // Para web, crear un blob y descargarlo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      } else {
        // Para móvil, usar FileSystem y Sharing
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Compartir Reporte CSV',
            UTI: 'public.comma-separated-values-text',
          });
        } else {
          Alert.alert('Información', 'Función de compartir no disponible en esta plataforma');
        }
      }
      
      Alert.alert('Éxito', 'Datos exportados correctamente');
    } catch (error) {
      console.error('Error exportando CSV:', error);
      Alert.alert('Error', 'No se pudo exportar los datos');
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleExport = () => {
    if (exportType === 'csv') {
      handleExportCSV();
    } else {
      handleExportPDF();
    }
  };

  const stats = [
    {
      title: "Miembros Activos",
      value: activeMembers,
      icon: Users,
      color: '#2B6CB0',
      trend: '+5%',
    },
    {
      title: "Promedio Asistencia",
      value: averageAttendance,
      icon: Calendar,
      color: '#38B2AC',
      trend: '+12%',
    },
    {
      title: "Bautizados",
      value: `${baptizedPercentage}%`,
      icon: TrendingUp,
      color: '#38A169',
      trend: '+3%',
    },
    {
      title: "Total Visitantes",
      value: totalVisitors,
      icon: Users,
      color: '#805AD5',
      trend: '+8%',
    },
  ];

  // Generar datos para gráficos según el período y métrica
  const chartData = useMemo(() => {
    const generateData = () => {
      switch (selectedPeriod) {
        case 'semanal':
          return [
            { label: 'Lun', value: Math.floor(Math.random() * 30) + 10, color: colors.primary },
            { label: 'Mar', value: Math.floor(Math.random() * 30) + 15, color: colors.primary },
            { label: 'Mié', value: Math.floor(Math.random() * 30) + 18, color: colors.primary },
            { label: 'Jue', value: Math.floor(Math.random() * 30) + 14, color: colors.primary },
            { label: 'Vie', value: Math.floor(Math.random() * 30) + 22, color: colors.secondary },
            { label: 'Sáb', value: Math.floor(Math.random() * 30) + 25, color: colors.secondary },
            { label: 'Dom', value: Math.floor(Math.random() * 50) + 45, color: colors.success },
          ];
        case 'mensual':
          return [
            { label: 'Sem 1', value: Math.floor(Math.random() * 40) + 60, color: colors.primary },
            { label: 'Sem 2', value: Math.floor(Math.random() * 40) + 70, color: colors.primary },
            { label: 'Sem 3', value: Math.floor(Math.random() * 40) + 55, color: colors.secondary },
            { label: 'Sem 4', value: Math.floor(Math.random() * 40) + 80, color: colors.success },
          ];
        case 'trimestral':
          return [
            { label: 'Mes 1', value: Math.floor(Math.random() * 100) + 200, color: colors.primary },
            { label: 'Mes 2', value: Math.floor(Math.random() * 100) + 250, color: colors.secondary },
            { label: 'Mes 3', value: Math.floor(Math.random() * 100) + 280, color: colors.success },
          ];
        case 'anual':
          return [
            { label: 'Q1', value: Math.floor(Math.random() * 200) + 800, color: colors.primary },
            { label: 'Q2', value: Math.floor(Math.random() * 200) + 900, color: colors.secondary },
            { label: 'Q3', value: Math.floor(Math.random() * 200) + 850, color: colors.info },
            { label: 'Q4', value: Math.floor(Math.random() * 200) + 950, color: colors.success },
          ];
        default:
          return [];
      }
    };
    return generateData();
  }, [selectedPeriod, selectedMetric, colors]);

  // Datos para gráfico circular
  const pieData = useMemo(() => {
    const total = filteredMembers.length;
    if (total === 0) return [];
    
    switch (selectedMetric) {
      case 'membresia':
        return [
          { label: 'Activos', value: filteredMembers.filter(m => m.estatus === 'activo').length, color: colors.success },
          { label: 'Inactivos', value: filteredMembers.filter(m => m.estatus !== 'activo').length, color: colors.danger },
        ];
      case 'bautizados':
        return [
          { label: 'Bautizados', value: baptizedCount, color: colors.primary },
          { label: 'No Bautizados', value: total - baptizedCount, color: colors.tabIconDefault },
        ];
      case 'discipulado':
        return [
          { label: 'Con Discipulado', value: discipleshipCount, color: colors.secondary },
          { label: 'Sin Discipulado', value: total - discipleshipCount, color: colors.tabIconDefault },
        ];
      default:
        return [];
    }
  }, [selectedMetric, filteredMembers, baptizedCount, discipleshipCount, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Reportes" 
        subtitle={user?.role === 'admin' ? 'Vista Administrativa' : 'Vista de Supervisor'}
        rightActions={
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color="#FFFFFF" />
            <Text style={styles.filterText}>Filtros</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Selector de período */}
        <View style={styles.periodSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['semanal', 'mensual', 'trimestral', 'anual'] as const).map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && [styles.periodButtonActive, { backgroundColor: colors.primary }]
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selector de métrica */}
        <View style={styles.metricSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { id: 'asistencia', label: 'Asistencia', icon: Calendar },
              { id: 'membresia', label: 'Membresía', icon: Users },
              { id: 'discipulado', label: 'Discipulado', icon: Activity },
              { id: 'bautizados', label: 'Bautizados', icon: TrendingUp },
            ].map(metric => (
              <TouchableOpacity
                key={metric.id}
                style={[
                  styles.metricButton,
                  selectedMetric === metric.id && { backgroundColor: colors.secondary + '20', borderColor: colors.secondary }
                ]}
                onPress={() => setSelectedMetric(metric.id as typeof selectedMetric)}
              >
                <metric.icon size={16} color={selectedMetric === metric.id ? colors.secondary : colors.tabIconDefault} />
                <Text style={[
                  styles.metricText,
                  { color: selectedMetric === metric.id ? colors.secondary : colors.tabIconDefault }
                ]}>
                  {metric.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* KPIs con gradientes */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity 
              key={stat.title} 
              style={[styles.statCard, { backgroundColor: colors.card }]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[stat.color + '10', stat.color + '05']}
                style={styles.statGradient}
              >
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  <Text style={[styles.statTrend, { color: colors.success }]}>
                    {stat.trend}
                  </Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statTitle, { color: colors.tabIconDefault }]}>{stat.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gráfico Principal */}
        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              {selectedMetric === 'asistencia' ? 'Tendencia de Asistencia' : 
               selectedMetric === 'membresia' ? 'Estado de Membresía' :
               selectedMetric === 'discipulado' ? 'Progreso de Discipulado' :
               'Estado de Bautizados'}
            </Text>
            <Text style={[styles.chartPeriod, { color: colors.tabIconDefault }]}>
              {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
            </Text>
          </View>
          
          {selectedMetric === 'asistencia' ? (
            <View style={styles.chart}>
              {chartData.map((item, index) => {
                const maxValue = Math.max(...chartData.map(d => d.value));
                const barHeight = (item.value / maxValue) * 150;
                
                return (
                  <View key={index} style={styles.barContainer}>
                    <Text style={[styles.barValue, { color: colors.text }]}>{item.value}</Text>
                    <LinearGradient
                      colors={[item.color, item.color + '80']}
                      style={[styles.bar, { height: barHeight }]}
                    />
                    <Text style={[styles.barLabel, { color: colors.tabIconDefault }]}>
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.pieChartContainer}>
              <View style={styles.pieChart}>
                {pieData.map((segment, index) => {
                  const total = pieData.reduce((sum, s) => sum + s.value, 0);
                  const percentage = total > 0 ? Math.round((segment.value / total) * 100) : 0;
                  
                  return (
                    <View key={index} style={styles.pieSegment}>
                      <View style={[styles.pieColor, { backgroundColor: segment.color }]} />
                      <Text style={[styles.pieLabel, { color: colors.text }]}>
                        {segment.label}
                      </Text>
                      <Text style={[styles.pieValue, { color: colors.tabIconDefault }]}>
                        {segment.value} ({percentage}%)
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.pieGraphic}>
                <PieChart size={120} color={colors.primary} />
              </View>
            </View>
          )}
        </View>

        {/* Resumen por Grupos Mejorado */}
        <View style={styles.groupSummary}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumen por Grupos</Text>
          {groups.map(group => {
            const groupMembers = members.filter(m => m.grupoId === group.id);
            const groupAttendance = attendance.filter(a => a.grupoId === group.id);
            const avgAttendance = groupAttendance.length > 0
              ? Math.round(groupAttendance.reduce((sum, a) => sum + a.asistentes.length, 0) / groupAttendance.length)
              : 0;
            const baptizedInGroup = groupMembers.filter(m => m.bautizado).length;
            const baptizedPerc = groupMembers.length > 0 ? Math.round((baptizedInGroup / groupMembers.length) * 100) : 0;
            
            return (
              <TouchableOpacity 
                key={group.id} 
                style={[styles.groupCard, { backgroundColor: colors.card }]}
                onPress={() => setSelectedGroup(group.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={selectedGroup === group.id ? [colors.primary + '20', colors.primary + '10'] : ['transparent', 'transparent']}
                  style={styles.groupCardGradient}
                >
                  <View style={styles.groupHeader}>
                    <View>
                      <Text style={[styles.groupName, { color: colors.text }]}>{group.nombre}</Text>
                      <Text style={[styles.groupLocation, { color: colors.tabIconDefault }]}>
                        {group.ubicacion} • {group.horario}
                      </Text>
                    </View>
                    <View style={styles.groupBadge}>
                      <Text style={[styles.groupMemberCount, { color: colors.primary }]}>
                        {groupMembers.length}
                      </Text>
                      <Text style={[styles.groupMemberLabel, { color: colors.tabIconDefault }]}>miembros</Text>
                    </View>
                  </View>
                  
                  <View style={styles.groupStats}>
                    <View style={styles.groupStatItem}>
                      <Calendar size={16} color={colors.secondary} />
                      <Text style={[styles.groupStatLabel, { color: colors.tabIconDefault }]}>Asistencia</Text>
                      <Text style={[styles.groupStatValue, { color: colors.text }]}>{avgAttendance}</Text>
                    </View>
                    <View style={styles.groupStatItem}>
                      <TrendingUp size={16} color={colors.success} />
                      <Text style={[styles.groupStatLabel, { color: colors.tabIconDefault }]}>Bautizados</Text>
                      <Text style={[styles.groupStatValue, { color: colors.text }]}>
                        {baptizedPerc}%
                      </Text>
                    </View>
                    <View style={styles.groupStatItem}>
                      <Users size={16} color={colors.info} />
                      <Text style={[styles.groupStatLabel, { color: colors.tabIconDefault }]}>Activos</Text>
                      <Text style={[styles.groupStatValue, { color: colors.text }]}>
                        {groupMembers.filter(m => m.estatus === 'activo').length}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.groupProgressBar}>
                    <View style={[styles.progressBarFill, { width: `${baptizedPerc}%`, backgroundColor: colors.primary }]} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botones de Exportación Mejorados */}
        <View style={styles.exportSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Exportar y Compartir</Text>
          <TouchableOpacity 
            style={[styles.mainExportButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowExportModal(true)}
          >
            <Share2 size={20} color="#fff" />
            <Text style={styles.mainExportButtonText}>Generar y Compartir Reporte</Text>
          </TouchableOpacity>
          
          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={[styles.presentationButton, { backgroundColor: colors.secondary }]}
              onPress={() => {
                setExportType('presentation');
                setShowExportModal(true);
              }}
            >
              <Presentation size={20} color="#fff" />
              <Text style={styles.presentationButtonText}>Generar Presentación con IA</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal de Exportación */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceLight }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Opciones de Exportación</Text>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.exportOptions}>
              <TouchableOpacity
                style={[
                  styles.exportOption,
                  exportType === 'pdf' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                ]}
                onPress={() => setExportType('pdf')}
              >
                <FileText size={24} color={exportType === 'pdf' ? colors.primary : colors.tabIconDefault} />
                <Text style={[styles.exportOptionTitle, { color: colors.text }]}>PDF</Text>
                <Text style={[styles.exportOptionDesc, { color: colors.tabIconDefault }]}>
                  Documento formateado con gráficos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.exportOption,
                  exportType === 'csv' && { backgroundColor: colors.success + '20', borderColor: colors.success }
                ]}
                onPress={() => setExportType('csv')}
              >
                <Download size={24} color={exportType === 'csv' ? colors.success : colors.tabIconDefault} />
                <Text style={[styles.exportOptionTitle, { color: colors.text }]}>CSV</Text>
                <Text style={[styles.exportOptionDesc, { color: colors.tabIconDefault }]}>
                  Datos para Excel o Google Sheets
                </Text>
              </TouchableOpacity>
              
              {user?.role === 'admin' && (
                <TouchableOpacity
                  style={[
                    styles.exportOption,
                    exportType === 'presentation' && { backgroundColor: colors.secondary + '20', borderColor: colors.secondary }
                  ]}
                  onPress={() => setExportType('presentation')}
                >
                  <Presentation size={24} color={exportType === 'presentation' ? colors.secondary : colors.tabIconDefault} />
                  <Text style={[styles.exportOptionTitle, { color: colors.text }]}>Presentación</Text>
                  <Text style={[styles.exportOptionDesc, { color: colors.tabIconDefault }]}>
                    Presentación profesional con IA
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.shareMethodsSection}>
              <Text style={[styles.shareMethodsTitle, { color: colors.text }]}>El archivo se compartirá por:</Text>
              <Text style={[styles.shareMethodsDesc, { color: colors.tabIconDefault }]}>
                {Platform.OS === 'ios' ? 'AirDrop, WhatsApp, Correo, Mensajes y más' :
                 Platform.OS === 'android' ? 'WhatsApp, Correo, Bluetooth, Drive y más' :
                 'Descarga directa en tu navegador'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.confirmExportButton, 
                { backgroundColor: colors.primary },
                isExporting && styles.disabledButton
              ]}
              onPress={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Share2 size={20} color="#FFFFFF" />
                  <Text style={styles.confirmExportButtonText}>
                    {exportType === 'presentation' ? 'Generar con IA' : 'Generar y Compartir'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Filtros */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceLight }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filtros Avanzados</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Grupo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedGroup === 'todos' && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setSelectedGroup('todos')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedGroup === 'todos' ? '#FFFFFF' : colors.text }
                  ]}>
                    Todos
                  </Text>
                </TouchableOpacity>
                {groups.map(group => (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.filterOption,
                      selectedGroup === group.id && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setSelectedGroup(group.id)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      { color: selectedGroup === group.id ? '#FFFFFF' : colors.text }
                    ]}>
                      {group.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Mes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.filterOption,
                      selectedMonth === index && { backgroundColor: colors.secondary }
                    ]}
                    onPress={() => setSelectedMonth(index)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      { color: selectedMonth === index ? '#FFFFFF' : colors.text }
                    ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Año</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[2023, 2024, 2025].map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.filterOption,
                      selectedYear === year && { backgroundColor: colors.info }
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      { color: selectedYear === year ? '#FFFFFF' : colors.text }
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  periodSelector: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#FFFFFF10',
  },
  periodButtonActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#718096',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  metricSelector: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  metricText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    borderRadius: 16,
    width: '48%',
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
  },
  chartContainer: {
    margin: 15,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  chartPeriod: {
    fontSize: 14,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    borderRadius: 8,
    marginVertical: 5,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 5,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  pieChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieChart: {
    flex: 1,
  },
  pieSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pieColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  pieLabel: {
    flex: 1,
    fontSize: 14,
  },
  pieValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  pieGraphic: {
    padding: 20,
  },
  groupSummary: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 15,
  },
  groupCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  groupCardGradient: {
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  groupLocation: {
    fontSize: 12,
  },
  groupBadge: {
    alignItems: 'center',
  },
  groupMemberCount: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  groupMemberLabel: {
    fontSize: 10,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  groupStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  groupStatLabel: {
    fontSize: 11,
  },
  groupStatValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  groupProgressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  exportSection: {
    padding: 20,
    paddingBottom: 40,
  },
  mainExportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  mainExportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  presentationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  presentationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  exportOptions: {
    padding: 20,
    gap: 12,
  },
  exportOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  exportOptionDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  shareMethodsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  shareMethodsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  shareMethodsDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  confirmExportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmExportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F7FAFC',
    marginRight: 10,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  applyButton: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});