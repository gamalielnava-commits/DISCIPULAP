import React, { useState, useMemo } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal
} from "react-native";
import { Calendar, Users, UserPlus, BookOpen, Check, X, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";
import Colors from "@/constants/colors";
import { LinearGradient } from 'expo-linear-gradient';
import { moduloSantidad } from "@/constants/modulo-santidad";
import { moduloEspirituSanto } from "@/constants/modulo-espiritu-santo";
import AppHeader from '@/components/AppHeader';

export default function AttendanceScreen() {
  const { groups, members, attendance, addAttendance, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceList, setAttendanceList] = useState<{ [key: string]: boolean }>({});
  const [visitors, setVisitors] = useState("0");
  const [sundayAttendance, setSundayAttendance] = useState("0");
  const [notes, setNotes] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLessonPicker, setShowLessonPicker] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [noMeeting, setNoMeeting] = useState(false);
  const [noMeetingReason, setNoMeetingReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");

  const allLessons = useMemo(() => {
    const santidadLessons = moduloSantidad.lecciones.map(l => ({
      id: l.id,
      titulo: `Santidad - Lección ${l.numero}: ${l.titulo}`,
      modulo: 'Santidad'
    }));
    const espirituLessons = moduloEspirituSanto.lecciones.map(l => ({
      id: l.id,
      titulo: `Espíritu Santo - Lección ${l.numero}: ${l.titulo}`,
      modulo: 'Espíritu Santo'
    }));
    return [...santidadLessons, ...espirituLessons];
  }, []);

  const noMeetingReasons = [
    { id: 'clima', label: 'Clima adverso' },
    { id: 'personal', label: 'Razones personales' },
    { id: 'vacaciones', label: 'Vacaciones' },
    { id: 'feriado', label: 'Día feriado' },
    { id: 'otro', label: 'Otra razón' }
  ];

  const groupMembers = selectedGroup 
    ? members.filter(m => m.grupoId === selectedGroup && m.estatus === 'activo')
    : [];

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroup(groupId);
    const initialAttendance: { [key: string]: boolean } = {};
    members
      .filter(m => m.grupoId === groupId && m.estatus === 'activo')
      .forEach(m => {
        initialAttendance[m.id] = false;
      });
    setAttendanceList(initialAttendance);
  };

  const toggleAttendance = (memberId: string) => {
    setAttendanceList(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedGroup) {
      Alert.alert("Error", "Por favor seleccione un grupo");
      return;
    }

    if (noMeeting && !noMeetingReason) {
      Alert.alert("Error", "Por favor indique la razón por la cual no se realizó la reunión");
      return;
    }

    if (noMeeting && noMeetingReason === 'otro' && !customReason) {
      Alert.alert("Error", "Por favor especifique la razón");
      return;
    }

    const presentMembers = Object.entries(attendanceList)
      .filter(([_, present]) => present)
      .map(([id]) => id);

    let finalTopic = "";
    if (selectedLesson && !isCustomTopic) {
      const lesson = allLessons.find(l => l.id === selectedLesson);
      finalTopic = lesson ? lesson.titulo : "";
    } else if (isCustomTopic) {
      finalTopic = customTopic;
    }

    const attendanceRecord = {
      grupoId: selectedGroup,
      fecha: selectedDate.toISOString().split('T')[0],
      asistentes: presentMembers,
      visitantes: parseInt(visitors) || 0,
      asistenciaDominical: parseInt(sundayAttendance) || 0,
      tema: finalTopic,
      notas: notes,
      noReunion: noMeeting,
      razonNoReunion: noMeeting ? (noMeetingReason === 'otro' ? customReason : noMeetingReason) : undefined,
    };

    addAttendance(attendanceRecord);

    Alert.alert(
      "Éxito", 
      "Asistencia guardada correctamente",
      [{ text: "OK", onPress: () => resetForm() }]
    );
  };

  const resetForm = () => {
    setSelectedGroup("");
    setAttendanceList({});
    setVisitors("0");
    setSundayAttendance("0");
    setNotes("");
    setSelectedLesson("");
    setCustomTopic("");
    setIsCustomTopic(false);
    setNoMeeting(false);
    setNoMeetingReason("");
    setCustomReason("");
  };

  const renderCalendar = () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return (
      <View style={[styles.calendarContainer, { backgroundColor: colors.card }]}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setSelectedDate(newDate);
          }}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.calendarTitle, { color: colors.text }]}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setSelectedDate(newDate);
          }}>
            <ChevronRight size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekDays}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <Text key={day} style={[styles.weekDay, { color: colors.tabIconDefault }]}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                day === selectedDate.getDate() && { backgroundColor: colors.primary }
              ]}
              onPress={() => {
                if (day) {
                  const newDate = new Date(currentYear, currentMonth, day);
                  setSelectedDate(newDate);
                  setShowCalendar(false);
                }
              }}
              disabled={!day}
            >
              {day && (
                <Text style={[
                  styles.calendarDayText,
                  { color: day === selectedDate.getDate() ? '#fff' : colors.text }
                ]}>
                  {day}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const presentCount = Object.values(attendanceList).filter(v => v).length;
  const totalMembers = groupMembers.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Asistencia" 
        subtitle="Registro de asistencia"
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Selector de Grupo */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Seleccionar Grupo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {groups.map(group => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupChip,
                  selectedGroup === group.id && styles.groupChipSelected
                ]}
                onPress={() => handleSelectGroup(group.id)}
              >
                <LinearGradient
                  colors={selectedGroup === group.id ? [colors.primary, colors.secondary] : ['transparent', 'transparent']}
                  style={styles.chipGradient}
                >
                  <Users size={16} color={selectedGroup === group.id ? '#fff' : colors.primary} />
                  <Text style={[
                    styles.groupChipText,
                    { color: selectedGroup === group.id ? '#fff' : colors.primary }
                  ]}>
                    {group.nombre}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Fecha */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Fecha de Reunión</Text>
          <TouchableOpacity 
            style={[styles.dateContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
            onPress={() => setShowCalendar(true)}
          >
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.dateInput, { color: colors.text }]}>
              {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal de Calendario */}
        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          >
            <TouchableOpacity activeOpacity={1}>
              {renderCalendar()}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {selectedGroup && (
          <>
            {/* Opción de No Reunión */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={[styles.noMeetingContainer, noMeeting && { backgroundColor: colors.warning + '20' }]}
                onPress={() => setNoMeeting(!noMeeting)}
              >
                <View style={[
                  styles.checkbox,
                  { borderColor: noMeeting ? colors.warning : colors.border },
                  noMeeting && { backgroundColor: colors.warning }
                ]}>
                  {noMeeting && <Check size={16} color="#fff" />}
                </View>
                <Text style={[styles.noMeetingText, { color: colors.text }]}>
                  No se realizó reunión
                </Text>
              </TouchableOpacity>
              
              {noMeeting && (
                <View style={styles.reasonContainer}>
                  <Text style={[styles.reasonLabel, { color: colors.text }]}>Razón (obligatorio):</Text>
                  {noMeetingReasons.map(reason => (
                    <TouchableOpacity
                      key={reason.id}
                      style={[
                        styles.reasonOption,
                        noMeetingReason === reason.id && { backgroundColor: colors.primary + '20' }
                      ]}
                      onPress={() => setNoMeetingReason(reason.id)}
                    >
                      <View style={[
                        styles.radioButton,
                        { borderColor: noMeetingReason === reason.id ? colors.primary : colors.border },
                        noMeetingReason === reason.id && { backgroundColor: colors.primary }
                      ]}>
                        {noMeetingReason === reason.id && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <Text style={[styles.reasonText, { color: colors.text }]}>
                        {reason.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
                  {noMeetingReason === 'otro' && (
                    <TextInput
                      style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text, marginTop: 10 }]}
                      value={customReason}
                      onChangeText={setCustomReason}
                      placeholder="Especifique la razón..."
                      placeholderTextColor={colors.tabIconDefault}
                    />
                  )}
                </View>
              )}
            </View>

            {/* Lista de Asistencia */}
            {!noMeeting && (
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Lista de Asistencia</Text>
                  <View style={[styles.attendanceBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.attendanceCount, { color: colors.success }]}>
                      {presentCount}/{totalMembers}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.membersList}>
                  {groupMembers.map(member => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberRow,
                        { backgroundColor: attendanceList[member.id] ? colors.success + '10' : colors.surfaceMedium },
                        { borderColor: attendanceList[member.id] ? colors.success : colors.border }
                      ]}
                      onPress={() => toggleAttendance(member.id)}
                    >
                      <View style={styles.memberInfo}>
                        <Text style={[styles.memberName, { color: colors.text }]}>
                          {member.nombre} {member.apellido}
                        </Text>
                        <View style={styles.memberTags}>
                          {member.bautizado && (
                            <LinearGradient
                              colors={[colors.success, colors.secondary]}
                              style={styles.tag}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <Text style={styles.tagText}>Bautizado</Text>
                            </LinearGradient>
                          )}
                          {member.discipulado && (
                            <LinearGradient
                              colors={[colors.info, colors.primary]}
                              style={styles.tag}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <Text style={styles.tagText}>Discipulado</Text>
                            </LinearGradient>
                          )}
                        </View>
                      </View>
                      
                      <View style={[
                        styles.checkbox,
                        { borderColor: attendanceList[member.id] ? colors.success : colors.border },
                        attendanceList[member.id] && { backgroundColor: colors.success }
                      ]}>
                        {attendanceList[member.id] && (
                          <Check size={16} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Información Adicional */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Adicional</Text>
              
              {!noMeeting && (
                <>
                  <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.primary + '10' }]}>
                      <UserPlus size={24} color={colors.primary} />
                      <TextInput
                        style={[styles.statInput, { color: colors.text }]}
                        value={visitors}
                        onChangeText={setVisitors}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.tabIconDefault}
                      />
                      <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Visitantes</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.secondary + '10' }]}>
                      <Users size={24} color={colors.secondary} />
                      <TextInput
                        style={[styles.statInput, { color: colors.text }]}
                        value={sundayAttendance}
                        onChangeText={setSundayAttendance}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.tabIconDefault}
                      />
                      <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Asist. Dominical</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={styles.inputHeader}>
                      <BookOpen size={20} color={colors.primary} />
                      <Text style={[styles.inputLabel, { color: colors.text }]}>Tema de la Reunión:</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={[styles.lessonSelector, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                      onPress={() => setShowLessonPicker(true)}
                    >
                      <Text style={[styles.lessonSelectorText, { color: selectedLesson || isCustomTopic ? colors.text : colors.tabIconDefault }]}>
                        {selectedLesson ? allLessons.find(l => l.id === selectedLesson)?.titulo : 
                         isCustomTopic ? customTopic : 
                         'Seleccionar lección del discipulado'}
                      </Text>
                      <ChevronRight size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Notas:</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Observaciones adicionales..."
                  placeholderTextColor={colors.tabIconDefault}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Modal de Selección de Lección */}
            <Modal
              visible={showLessonPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowLessonPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.lessonPickerContainer, { backgroundColor: colors.card }]}>
                  <View style={styles.lessonPickerHeader}>
                    <Text style={[styles.lessonPickerTitle, { color: colors.text }]}>Seleccionar Lección</Text>
                    <TouchableOpacity onPress={() => setShowLessonPicker(false)}>
                      <X size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.lessonList}>
                    {allLessons.map(lesson => (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[
                          styles.lessonItem,
                          selectedLesson === lesson.id && { backgroundColor: colors.primary + '20' }
                        ]}
                        onPress={() => {
                          setSelectedLesson(lesson.id);
                          setIsCustomTopic(false);
                          setShowLessonPicker(false);
                        }}
                      >
                        <Text style={[styles.lessonModulo, { color: colors.primary }]}>
                          {lesson.modulo}
                        </Text>
                        <Text style={[styles.lessonTitle, { color: colors.text }]}>
                          {lesson.titulo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    
                    <View style={styles.customTopicSection}>
                      <Text style={[styles.customTopicLabel, { color: colors.text }]}>O ingrese otro tema:</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                        value={customTopic}
                        onChangeText={setCustomTopic}
                        placeholder="Tema personalizado..."
                        placeholderTextColor={colors.tabIconDefault}
                      />
                      <TouchableOpacity
                        style={[styles.customTopicButton, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          if (customTopic.trim()) {
                            setIsCustomTopic(true);
                            setSelectedLesson('');
                            setShowLessonPicker(false);
                          }
                        }}
                      >
                        <Text style={styles.customTopicButtonText}>Usar tema personalizado</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Botón Guardar */}
            <TouchableOpacity 
              onPress={handleSaveAttendance}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.saveButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Check size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar Asistencia</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '90%',
    maxWidth: 350,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 16,
  },
  noMeetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  noMeetingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  reasonContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  reasonText: {
    fontSize: 14,
    marginLeft: 12,
  },
  lessonSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  lessonSelectorText: {
    flex: 1,
    fontSize: 16,
  },
  lessonPickerContainer: {
    width: '95%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  lessonPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  lessonPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lessonList: {
    maxHeight: 400,
  },
  lessonItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  lessonModulo: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 14,
  },
  customTopicSection: {
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  customTopicLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  customTopicButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  customTopicButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },

  section: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  groupChip: {
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  },
  groupChipSelected: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  groupChipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  dateInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attendanceCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  membersList: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  memberTags: {
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  statInput: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
    minWidth: 60,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});