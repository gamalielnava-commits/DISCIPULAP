import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { Plus, Search, X, Trash2, Edit, AlertCircle } from "lucide-react-native";
import { FirestoreService } from "@/services/firebase";
import { useApp } from "@/providers/AppProvider";
import { uploadImage } from "@/utils/imageUpload";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";

type Mensaje = {
  id: string;
  titulo: string;
  contenido: string;
  imagenUrl?: string;
  tipo: "general" | "importante" | "urgente";
  creadoPor: string;
  creadoPorNombre: string;
  fechaCreacion: any;
  createdAt?: any;
  activo: boolean;
};

export default function MensajesScreen() {
  const { user, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [filteredMensajes, setFilteredMensajes] = useState<Mensaje[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMensaje, setEditingMensaje] = useState<Mensaje | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    imagenUrl: "",
    tipo: "general" as "general" | "importante" | "urgente",
  });

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadMensajes();
  }, []);

  useEffect(() => {
    filterMensajes();
  }, [searchQuery, mensajes]);

  const loadMensajes = async () => {
    try {
      setLoading(true);
      const mensajesData = await FirestoreService.getAll("mensajes");
      const activeMensajes = mensajesData
        .filter((m: any) => m.activo !== false)
        .sort((a: any, b: any) => {
          const dateA = a.fechaCreacion?.toDate?.() || a.fechaCreacion || a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const dateB = b.fechaCreacion?.toDate?.() || b.fechaCreacion || b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return dateB - dateA;
        });
      setMensajes(activeMensajes);
      setFilteredMensajes(activeMensajes);
    } catch (error) {
      console.error("Error loading mensajes:", error);
      Alert.alert("Error", "No se pudieron cargar los mensajes");
    } finally {
      setLoading(false);
    }
  };

  const filterMensajes = () => {
    if (!searchQuery.trim()) {
      setFilteredMensajes(mensajes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = mensajes.filter(
      (mensaje) =>
        mensaje.titulo.toLowerCase().includes(query) ||
        mensaje.contenido.toLowerCase().includes(query) ||
        mensaje.creadoPorNombre.toLowerCase().includes(query)
    );
    setFilteredMensajes(filtered);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const imageUrl = await uploadImage(result.assets[0].uri, "mensajes");
        setFormData({ ...formData, imagenUrl: imageUrl });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setUploading(true);

      if (editingMensaje) {
        await FirestoreService.update("mensajes", editingMensaje.id, {
          titulo: formData.titulo,
          contenido: formData.contenido,
          imagenUrl: formData.imagenUrl,
          tipo: formData.tipo,
        });
        Alert.alert("Éxito", "Mensaje actualizado correctamente");
      } else {
        await FirestoreService.create("mensajes", {
          ...formData,
          creadoPor: user?.id || "",
          creadoPorNombre: `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || user?.email || "Usuario",
          fechaCreacion: new Date(),
          activo: true,
        });
        Alert.alert("Éxito", "Mensaje creado correctamente");
      }

      resetForm();
      setModalVisible(false);
      loadMensajes();
    } catch (error) {
      console.error("Error saving mensaje:", error);
      Alert.alert("Error", "No se pudo guardar el mensaje");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar este mensaje?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await FirestoreService.delete("mensajes", id);
              Alert.alert("Éxito", "Mensaje eliminado correctamente");
              loadMensajes();
            } catch (error) {
              console.error("Error deleting mensaje:", error);
              Alert.alert("Error", "No se pudo eliminar el mensaje");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (mensaje: Mensaje) => {
    setEditingMensaje(mensaje);
    setFormData({
      titulo: mensaje.titulo,
      contenido: mensaje.contenido,
      imagenUrl: mensaje.imagenUrl || "",
      tipo: mensaje.tipo,
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      contenido: "",
      imagenUrl: "",
      tipo: "general",
    });
    setEditingMensaje(null);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "importante":
        return "#FF9800";
      case "urgente":
        return "#F44336";
      default:
        return "#4CAF50";
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "importante":
        return "Importante";
      case "urgente":
        return "Urgente";
      default:
        return "General";
    }
  };

  const renderMensaje = ({ item }: { item: Mensaje }) => (
    <View style={[styles.mensajeCard, { backgroundColor: colors.card }]}>
      <View style={[styles.tipoIndicator, { backgroundColor: getTipoColor(item.tipo) }]}>
        <Text style={styles.tipoText}>{getTipoLabel(item.tipo)}</Text>
      </View>

      {item.imagenUrl && (
        <Image source={{ uri: item.imagenUrl }} style={styles.mensajeImage} />
      )}

      <View style={styles.mensajeContent}>
        <Text style={[styles.mensajeTitulo, { color: colors.text }]}>{item.titulo}</Text>
        <Text style={[styles.mensajeContenido, { color: colors.tabIconDefault }]}>{item.contenido}</Text>

        <View style={styles.mensajeFooter}>
          <Text style={[styles.mensajeAutor, { color: colors.tabIconDefault }]}>Por: {item.creadoPorNombre}</Text>
          <Text style={[styles.mensajeFecha, { color: colors.tabIconDefault }]}>
            {item.fechaCreacion instanceof Date
              ? item.fechaCreacion.toLocaleDateString()
              : item.createdAt instanceof Date
              ? item.createdAt.toLocaleDateString()
              : "Hoy"}
          </Text>
        </View>

        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item)}
            >
              <Edit size={18} color="#2196F3" />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Trash2 size={18} color="#F44336" />
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Mensajes",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerRight: () =>
            isAdmin ? (
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setModalVisible(true);
                }}
                style={styles.addButton}
              >
                <Plus size={24} color={colors.primary} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.tabIconDefault} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar mensajes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.tabIconDefault}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredMensajes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AlertCircle size={64} color={colors.tabIconDefault} />
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            {searchQuery ? "No se encontraron mensajes" : "No hay mensajes"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMensajes}
          renderItem={renderMensaje}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          resetForm();
          setModalVisible(false);
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingMensaje ? "Editar Mensaje" : "Nuevo Mensaje"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setModalVisible(false);
              }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={[styles.label, { color: colors.text }]}>Título *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.titulo}
              onChangeText={(text) => setFormData({ ...formData, titulo: text })}
              placeholder="Título del mensaje"
              placeholderTextColor={colors.tabIconDefault}
            />

            <Text style={[styles.label, { color: colors.text }]}>Contenido *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={formData.contenido}
              onChangeText={(text) => setFormData({ ...formData, contenido: text })}
              placeholder="Contenido del mensaje"
              placeholderTextColor={colors.tabIconDefault}
              multiline
              numberOfLines={4}
            />

            <Text style={[styles.label, { color: colors.text }]}>Tipo</Text>
            <View style={styles.tipoButtons}>
              {(["general", "importante", "urgente"] as const).map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.tipoButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    formData.tipo === tipo && {
                      backgroundColor: getTipoColor(tipo),
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, tipo })}
                >
                  <Text
                    style={[
                      styles.tipoButtonText,
                      { color: colors.text },
                      formData.tipo === tipo && styles.tipoButtonTextActive,
                    ]}
                  >
                    {getTipoLabel(tipo)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Imagen (opcional)</Text>
            <TouchableOpacity
              style={[styles.imageButton, { backgroundColor: colors.primary }]}
              onPress={handlePickImage}
              disabled={uploading}
            >
              <Text style={styles.imageButtonText}>
                {uploading ? "Subiendo..." : "Seleccionar Imagen"}
              </Text>
            </TouchableOpacity>

            {formData.imagenUrl && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: formData.imagenUrl }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setFormData({ ...formData, imagenUrl: "" })}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }, uploading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={uploading}
            >
              <Text style={styles.submitButtonText}>
                {uploading
                  ? "Guardando..."
                  : editingMensaje
                  ? "Actualizar"
                  : "Crear Mensaje"}
              </Text>
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
  addButton: {
    marginRight: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  mensajeCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tipoIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  tipoText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "uppercase",
  },
  mensajeImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  mensajeContent: {
    padding: 16,
  },
  mensajeTitulo: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  mensajeContenido: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  mensajeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  mensajeAutor: {
    fontSize: 14,
  },
  mensajeFecha: {
    fontSize: 14,
  },
  adminActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  deleteButtonText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  tipoButtons: {
    flexDirection: "row",
    gap: 12,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  tipoButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  tipoButtonTextActive: {
    color: "#fff",
  },
  imageButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 6,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700" as const,
  },
});
