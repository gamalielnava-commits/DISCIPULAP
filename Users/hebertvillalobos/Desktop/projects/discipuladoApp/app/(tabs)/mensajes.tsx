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
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Plus, Search, X, Trash2, Edit, AlertCircle } from "lucide-react-native";
import { db } from "@/services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/providers/AppProvider";
import { uploadImage } from "@/utils/imageUpload";
import * as ImagePicker from "expo-image-picker";

type Mensaje = {
  id: string;
  titulo: string;
  contenido: string;
  imagenUrl?: string;
  tipo: "general" | "importante" | "urgente";
  creadoPor: string;
  creadoPorNombre: string;
  fechaCreacion: any;
  activo: boolean;
};

export default function MensajesScreen() {
  const { user } = useAuth();
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

  const isAdmin = user?.email === "admin@example.com";

  useEffect(() => {
    loadMensajes();
  }, []);

  useEffect(() => {
    filterMensajes();
  }, [searchQuery, mensajes]);

  const loadMensajes = async () => {
    try {
      setLoading(true);
      const mensajesRef = collection(db, "mensajes");
      const q = query(
        mensajesRef,
        where("activo", "==", true),
        orderBy("fechaCreacion", "desc")
      );

      const snapshot = await getDocs(q);
      const mensajesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Mensaje[];

      setMensajes(mensajesData);
      setFilteredMensajes(mensajesData);
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
        const mensajeRef = doc(db, "mensajes", editingMensaje.id);
        await updateDoc(mensajeRef, {
          titulo: formData.titulo,
          contenido: formData.contenido,
          imagenUrl: formData.imagenUrl,
          tipo: formData.tipo,
          fechaActualizacion: serverTimestamp(),
        });
        Alert.alert("Éxito", "Mensaje actualizado correctamente");
      } else {
        const mensajesRef = collection(db, "mensajes");
        await addDoc(mensajesRef, {
          ...formData,
          creadoPor: user?.uid || "",
          creadoPorNombre: user?.displayName || user?.email || "Usuario",
          fechaCreacion: serverTimestamp(),
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
              const mensajeRef = doc(db, "mensajes", id);
              await deleteDoc(mensajeRef);
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
    <View style={styles.mensajeCard}>
      <View style={[styles.tipoIndicator, { backgroundColor: getTipoColor(item.tipo) }]}>
        <Text style={styles.tipoText}>{getTipoLabel(item.tipo)}</Text>
      </View>

      {item.imagenUrl && (
        <Image source={{ uri: item.imagenUrl }} style={styles.mensajeImage} />
      )}

      <View style={styles.mensajeContent}>
        <Text style={styles.mensajeTitulo}>{item.titulo}</Text>
        <Text style={styles.mensajeContenido}>{item.contenido}</Text>

        <View style={styles.mensajeFooter}>
          <Text style={styles.mensajeAutor}>Por: {item.creadoPorNombre}</Text>
          <Text style={styles.mensajeFecha}>
            {item.fechaCreacion?.toDate?.()?.toLocaleDateString() || "Hoy"}
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Mensajes",
          headerRight: () =>
            isAdmin ? (
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setModalVisible(true);
                }}
                style={styles.addButton}
              >
                <Plus size={24} color="#fff" />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar mensajes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredMensajes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AlertCircle size={64} color="#ccc" />
          <Text style={styles.emptyText}>
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
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMensaje ? "Editar Mensaje" : "Nuevo Mensaje"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setModalVisible(false);
              }}
            >
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={formData.titulo}
              onChangeText={(text) => setFormData({ ...formData, titulo: text })}
              placeholder="Título del mensaje"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Contenido *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.contenido}
              onChangeText={(text) => setFormData({ ...formData, contenido: text })}
              placeholder="Contenido del mensaje"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.tipoButtons}>
              {(["general", "importante", "urgente"] as const).map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.tipoButton,
                    formData.tipo === tipo && {
                      backgroundColor: getTipoColor(tipo),
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, tipo })}
                >
                  <Text
                    style={[
                      styles.tipoButtonText,
                      formData.tipo === tipo && styles.tipoButtonTextActive,
                    ]}
                  >
                    {getTipoLabel(tipo)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Imagen (opcional)</Text>
            <TouchableOpacity
              style={styles.imageButton}
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
              style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
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
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  addButton: {
    marginRight: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
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
    color: "#333",
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
    color: "#999",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  mensajeCard: {
    backgroundColor: "#fff",
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
    color: "#333",
    marginBottom: 8,
  },
  mensajeContenido: {
    fontSize: 16,
    color: "#666",
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
    color: "#999",
  },
  mensajeFecha: {
    fontSize: 14,
    color: "#999",
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
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#333",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
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
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tipoButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#666",
  },
  tipoButtonTextActive: {
    color: "#fff",
  },
  imageButton: {
    backgroundColor: "#007AFF",
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
    backgroundColor: "#007AFF",
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
