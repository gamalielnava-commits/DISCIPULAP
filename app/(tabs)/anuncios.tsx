import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Share,
  ActivityIndicator,
} from "react-native";
import { Image } from 'expo-image';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Users,
  Image as ImageIcon,
  X,
  Check,
  Archive,
  Clock,
  Share2,
} from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";
import Colors from "@/constants/colors";
import AppHeader from "@/components/AppHeader";
import { pickImageFromLibrary, takePhoto, uploadImageToFirebase, showImagePickerOptions } from '@/utils/imageUpload';

interface AnnouncementForm {
  titulo: string;
  contenido: string;
  destinatarios: "todos" | "lideres" | string;
  prioridad: "normal" | "alta";
  imagen?: string;
  programadaPara?: string;
}

export default function AnunciosScreen() {
  const {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    user,
    isDarkMode,
    groups,
  } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"activo" | "archivado" | "todos">("activo");
  const [form, setForm] = useState<AnnouncementForm>({
    titulo: "",
    contenido: "",
    destinatarios: "todos",
    prioridad: "normal",
  });
  const [uploadingImage, setUploadingImage] = useState(false);


  const filteredAnnouncements = announcements.filter((a) => {
    if (filterStatus === "todos") return true;
    return a.estado === filterStatus;
  }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos");
      return;
    }

    const announcementData = {
      ...form,
      fecha: new Date().toISOString(),
      creadoPorUid: user?.id || "admin",
      estado: (form.programadaPara ? "programado" : "activo") as "activo" | "archivado" | "programado",
    };

    if (editingId) {
      await updateAnnouncement(editingId, announcementData);
    } else {
      await addAnnouncement(announcementData);
    }

    setShowModal(false);
    setEditingId(null);
    setForm({
      titulo: "",
      contenido: "",
      destinatarios: "todos",
      prioridad: "normal",
    });
  };

  const handleEdit = (announcement: any) => {
    setEditingId(announcement.id);
    setForm({
      titulo: announcement.titulo,
      contenido: announcement.contenido,
      destinatarios: announcement.destinatarios,
      prioridad: announcement.prioridad,
      imagen: announcement.imagen,
      programadaPara: announcement.programadaPara,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar Anuncio",
      "¿Estás seguro de que deseas eliminar este anuncio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteAnnouncement(id),
        },
      ]
    );
  };

  const handleArchive = async (id: string) => {
    const announcement = announcements.find((a) => a.id === id);
    if (announcement) {
      await updateAnnouncement(id, {
        estado: announcement.estado === "archivado" ? "activo" : "archivado",
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader 
        title="Anuncios" 
        subtitle={`${filteredAnnouncements.length} anuncios ${filterStatus !== "todos" ? filterStatus + "s" : ""}`}
        rightActions={
          user?.role === 'admin' ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setEditingId(null);
                setForm({
                  titulo: "",
                  contenido: "",
                  destinatarios: "todos",
                  prioridad: "normal",
                });
                setShowModal(true);
              }}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "activo" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilterStatus("activo")}
          >
            <Text
              style={[
                styles.filterText,
                { color: filterStatus === "activo" ? "#FFFFFF" : colors.text },
              ]}
            >
              Activos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "archivado" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilterStatus("archivado")}
          >
            <Text
              style={[
                styles.filterText,
                { color: filterStatus === "archivado" ? "#FFFFFF" : colors.text },
              ]}
            >
              Archivados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "todos" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilterStatus("todos")}
          >
            <Text
              style={[
                styles.filterText,
                { color: filterStatus === "todos" ? "#FFFFFF" : colors.text },
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de anuncios */}
        {filteredAnnouncements.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={colors.tabIconDefault} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No hay anuncios
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
              {filterStatus === "activo" 
                ? "No hay anuncios activos en este momento"
                : filterStatus === "archivado"
                ? "No hay anuncios archivados"
                : "No se han creado anuncios aún"}
            </Text>
          </View>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <View
              key={announcement.id}
              style={[
                styles.announcementCard,
                { backgroundColor: colors.card },
                announcement.prioridad === "alta" && styles.highPriority,
              ]}
            >
              <View style={styles.announcementHeader}>
                <View style={styles.announcementInfo}>
                  <View style={styles.priorityBadge}>
                    <Bell
                      size={16}
                      color={announcement.prioridad === "alta" ? colors.danger : colors.primary}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color:
                            announcement.prioridad === "alta" ? colors.danger : colors.primary,
                        },
                      ]}
                    >
                      {announcement.prioridad === "alta" ? "Alta" : "Normal"}
                    </Text>
                  </View>
                  {announcement.estado === "archivado" && (
                    <View style={[styles.statusBadge, { backgroundColor: colors.tabIconDefault }]}>
                      <Archive size={12} color="#FFFFFF" />
                      <Text style={styles.statusText}>Archivado</Text>
                    </View>
                  )}
                  {announcement.estado === "programado" && (
                    <View style={[styles.statusBadge, { backgroundColor: colors.info }]}>
                      <Clock size={12} color="#FFFFFF" />
                      <Text style={styles.statusText}>Programado</Text>
                    </View>
                  )}
                </View>
                <View style={styles.announcementActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={async () => {
                      try {
                        const shareContent = `📢 *${announcement.titulo}*\n\n${announcement.contenido}\n\nCompartido desde la App de Discipulado`;
                        await Share.share({
                          message: shareContent,
                          title: announcement.titulo,
                        });
                      } catch (error) {
                        console.error('Error sharing:', error);
                      }
                    }}
                  >
                    <Share2 size={18} color={colors.primary} />
                  </TouchableOpacity>
                  {user?.role === 'admin' && (
                    <>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEdit(announcement)}
                      >
                        <Edit2 size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleArchive(announcement.id)}
                      >
                        <Archive size={18} color={colors.info} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(announcement.id)}
                      >
                        <Trash2 size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              <Text style={[styles.announcementTitle, { color: colors.text }]}>
                {announcement.titulo}
              </Text>
              <Text style={[styles.announcementContent, { color: colors.tabIconDefault }]}>
                {announcement.contenido}
              </Text>

              {announcement.imagen && (
                <Image
                  source={{ uri: announcement.imagen }}
                  style={styles.announcementImage}
                  contentFit="cover"
                />
              )}

              <View style={styles.announcementFooter}>
                <View style={styles.destinatariosInfo}>
                  <Users size={14} color={colors.tabIconDefault} />
                  <Text style={[styles.destinatariosText, { color: colors.tabIconDefault }]}>
                    {announcement.destinatarios === "todos"
                      ? "Todos"
                      : announcement.destinatarios === "lideres"
                      ? "Líderes"
                      : `Grupo ${announcement.destinatarios.replace("grupo:", "")}`}
                  </Text>
                </View>
                <Text style={[styles.dateText, { color: colors.tabIconDefault }]}>
                  {new Date(announcement.fecha).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de creación/edición */}
      <Modal
        visible={showModal && user?.role === 'admin'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingId ? "Editar Anuncio" : "Nuevo Anuncio"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Título *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={form.titulo}
                  onChangeText={(text) => setForm({ ...form, titulo: text })}
                  placeholder="Título del anuncio"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Contenido *</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={form.contenido}
                  onChangeText={(text) => setForm({ ...form, contenido: text })}
                  placeholder="Contenido del anuncio"
                  placeholderTextColor={colors.tabIconDefault}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Destinatarios</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      form.destinatarios === "todos" && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setForm({ ...form, destinatarios: "todos" })}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        { color: form.destinatarios === "todos" ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      Todos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      form.destinatarios === "lideres" && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setForm({ ...form, destinatarios: "lideres" })}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        { color: form.destinatarios === "lideres" ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      Líderes
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Prioridad</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      form.prioridad === "normal" && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setForm({ ...form, prioridad: "normal" })}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        { color: form.prioridad === "normal" ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      Normal
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      form.prioridad === "alta" && { backgroundColor: colors.danger },
                    ]}
                    onPress={() => setForm({ ...form, prioridad: "alta" })}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        { color: form.prioridad === "alta" ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      Alta
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {form.imagen && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: form.imagen }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={[styles.removeImageButton, { backgroundColor: colors.danger }]}
                    onPress={() => setForm({ ...form, imagen: undefined })}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.imageButton, { borderColor: colors.border }]}
                onPress={() => {
                  showImagePickerOptions(
                    async () => {
                      const result = await pickImageFromLibrary();
                      if (result && result.uri) {
                        setUploadingImage(true);
                        try {
                          const downloadUrl = await uploadImageToFirebase(
                            result.uri,
                            `announcements/${Date.now()}.jpg`
                          );
                          setForm({ ...form, imagen: downloadUrl });
                        } catch (error) {
                          console.error('Error uploading image:', error);
                          Alert.alert('Error', 'No se pudo subir la imagen');
                        } finally {
                          setUploadingImage(false);
                        }
                      }
                    },
                    async () => {
                      const result = await takePhoto();
                      if (result && result.uri) {
                        setUploadingImage(true);
                        try {
                          const downloadUrl = await uploadImageToFirebase(
                            result.uri,
                            `announcements/${Date.now()}.jpg`
                          );
                          setForm({ ...form, imagen: downloadUrl });
                        } catch (error) {
                          console.error('Error uploading image:', error);
                          Alert.alert('Error', 'No se pudo subir la imagen');
                        } finally {
                          setUploadingImage(false);
                        }
                      }
                    }
                  );
                }}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <ImageIcon size={24} color={colors.tabIconDefault} />
                    <Text style={[styles.imageButtonText, { color: colors.tabIconDefault }]}>
                      {form.imagen ? 'Cambiar imagen' : 'Agregar imagen (opcional)'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {editingId ? "Actualizar" : "Crear"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF20",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#00000010",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  announcementCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  highPriority: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  announcementInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  announcementActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  announcementFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  destinatariosInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  destinatariosText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  accessDeniedText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#00000010",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 10,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#00000010",
  },
  radioText: {
    fontSize: 14,
    fontWeight: "600",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    marginBottom: 20,
  },
  imageButtonText: {
    fontSize: 14,
  },
  announcementImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#00000010",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});