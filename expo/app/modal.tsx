import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Bell, X } from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";

export default function ModalScreen() {
  const { announcements } = useApp();
  const highPriorityAnnouncements = announcements.filter(a => a.prioridad === 'alta');
  const announcement = highPriorityAnnouncements[0] || announcements[0];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Bell size={24} color="#E53E3E" />
              <Text style={styles.title}>Anuncio Importante</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color="#718096" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll}>
            {announcement ? (
              <>
                <Text style={styles.announcementTitle}>{announcement.titulo}</Text>
                <Text style={styles.announcementContent}>{announcement.contenido}</Text>
                <View style={styles.metadata}>
                  <Text style={styles.metadataText}>
                    Fecha: {new Date(announcement.fecha).toLocaleDateString('es-ES')}
                  </Text>
                  {announcement.prioridad === 'alta' && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>Alta Prioridad</Text>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <Text style={styles.noAnnouncements}>No hay anuncios disponibles</Text>
            )}

            {/* Lista de otros anuncios */}
            {announcements.length > 1 && (
              <View style={styles.otherAnnouncements}>
                <Text style={styles.otherTitle}>Otros Anuncios</Text>
                {announcements.slice(1).map((ann, index) => (
                  <View key={index} style={styles.announcementItem}>
                    <Text style={styles.itemTitle}>{ann.titulo}</Text>
                    <Text style={styles.itemDate}>
                      {new Date(ann.fecha).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    color: '#2D3748',
  },
  contentScroll: {
    maxHeight: 400,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 10,
  },
  announcementContent: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 20,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  metadataText: {
    fontSize: 14,
    color: '#718096',
  },
  priorityBadge: {
    backgroundColor: '#FED7D7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#E53E3E',
    fontSize: 12,
    fontWeight: '600',
  },
  noAnnouncements: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 16,
    paddingVertical: 40,
  },
  otherAnnouncements: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
  },
  otherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 15,
  },
  announcementItem: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#718096',
  },
  closeButton: {
    backgroundColor: "#2B6CB0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});