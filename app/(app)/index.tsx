import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Room } from "@features/chat/domain/entities/Message";
import { useRooms } from "@features/chat/presentation/hooks/useRooms";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../components/ui/icon-symbol";
import { TEXT_SECONDARY } from "../../src/constants/colors";

const CORAL = "#A86A5A";
const TEAL = "#7D9BAB";

export default function RoomsScreen() {
  const { rooms, isLoading, createRoom, isCreating, createError } = useRooms();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState("");

  const isVendedor = user?.role === "vendedor";
  const roleColor = isVendedor ? CORAL : TEAL;

  const handleCreate = async () => {
    if (!roomName.trim() || isCreating) return;
    try {
      await createRoom(roomName.trim());
      setRoomName("");
      setModalVisible(false);
    } catch {
      /* createError se muestra en UI */
    }
  };

  const renderRoom = ({ item }: { item: Room }) => (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={() => router.push(`/chat/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.roomIconBox}>
        <Text style={styles.roomIconText}>#</Text>
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomSub}>Toca para entrar</Text>
      </View>
      <IconSymbol name="chevron.right" color="#BBBBBB" size={18} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CORAL} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner de rol */}
      <View style={[styles.banner, { backgroundColor: roleColor }]}>
        <IconSymbol
          name={isVendedor ? "bag.fill" : "cart.fill"}
          color="#fff"
          size={26}
        />
        <View>
          <Text style={styles.bannerName}>Hola, {user?.username}</Text>
          <Text style={styles.bannerRole}>
            {isVendedor
              ? "Gestiona tus ventas en tiempo real."
              : "Descubre productos y chatea con tiendas."}
          </Text>
        </View>
      </View>

      {/* Label sección */}
      <Text style={styles.sectionLabel}>SALAS DISPONIBLES</Text>

      {/* Lista */}
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        renderItem={renderRoom}
        contentContainerStyle={
          rooms.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <IconSymbol
                name="message.fill"
                color={TEXT_SECONDARY}
                size={36}
              />
            </View>
            <Text style={styles.emptyTitle}>No hay salas disponibles</Text>
            <Text style={styles.emptyDesc}>
              {isVendedor
                ? "Crea una sala para atender clientes"
                : "Espera a que un vendedor cree una sala"}
            </Text>
          </View>
        }
      />

      {/* FAB solo vendedor */}
      {isVendedor && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <IconSymbol name="plus" color="#fff" size={26} />
        </TouchableOpacity>
      )}

      {/* Modal crear sala */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.sheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Ícono */}
            <View style={styles.sheetIconCircle}>
              <IconSymbol name="bag.fill" color={CORAL} size={26} />
            </View>

            <Text style={styles.sheetTitle}>Nueva sala</Text>
            <Text style={styles.sheetSubtitle}>
              Los clientes verán esta sala y podrán unirse
            </Text>

            <View style={styles.sheetDivider} />

            {createError && (
              <Text style={styles.sheetError}>{createError}</Text>
            )}

            <Text style={styles.sheetFieldLabel}>NOMBRE DE LA SALA</Text>
            <View style={styles.sheetInputWrapper}>
              <TextInput
                style={styles.sheetInput}
                placeholder="Ej: Consultas sobre laptops"
                placeholderTextColor="#BBBBBB"
                value={roomName}
                onChangeText={setRoomName}
                autoFocus
                maxLength={50}
              />
              <Text style={styles.sheetCounter}>{roomName.length} / 50</Text>
            </View>

            <TouchableOpacity
              style={[styles.sheetBtnCreate, isCreating && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sheetBtnCreateText}>Crear sala</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetBtnCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.sheetBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FCFAF8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
    paddingTop: 24,
  },
  bannerEmoji: { fontSize: 36 },
  bannerName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  bannerRole: { color: "rgba(255,255,255,0.82)", fontSize: 13, marginTop: 2 },

  // Sección
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#717171",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },

  // Lista
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  separator: { height: 1, backgroundColor: "#F0EDED", marginHorizontal: 16 },
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  roomIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#F0EDED",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  roomIconText: { fontSize: 18, fontWeight: "800", color: "#5B5C5C" },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 15, fontWeight: "700", color: "#1B1C1C" },
  roomSub: { fontSize: 12, color: "#717171", marginTop: 2 },
  roomChevron: { fontSize: 22, color: "#BBBBBB" },

  // Empty
  emptyContainer: { flex: 1 },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#1B1C1C" },
  emptyDesc: {
    fontSize: 14,
    color: "#717171",
    textAlign: "center",
    maxWidth: 220,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CORAL,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: "#fff", fontSize: 30, lineHeight: 34 },

  // Modal / Bottom Sheet
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#EBEBEB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF0F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 4,
  },
  sheetSubtitle: { fontSize: 13, color: "#717171", marginBottom: 16 },
  sheetDivider: { height: 1, backgroundColor: "#EBEBEB", marginBottom: 16 },
  sheetError: { color: CORAL, fontSize: 13, marginBottom: 10 },
  sheetFieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#717171",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sheetInputWrapper: {
    borderWidth: 1.5,
    borderColor: "#EBEBEB",
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
  },
  sheetInput: { fontSize: 15, color: "#222222" },
  sheetCounter: {
    fontSize: 11,
    color: "#BBBBBB",
    textAlign: "right",
    marginTop: 6,
  },
  sheetBtnCreate: {
    backgroundColor: CORAL,
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sheetBtnCreateText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sheetBtnCancel: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  sheetBtnCancelText: { color: "#717171", fontSize: 15 },
});
