import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Message } from "@features/chat/domain/entities/Message";
import { useChat } from "@features/chat/presentation/hooks/useChat";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/icon-symbol";

const CORAL = "#A86A5A";
const TEAL = "#7D9BAB";

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage, isSending } = useChat(roomId);
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const listRef = useRef<FlatList>(null);

  const isVendedor = user?.role === "vendedor";
  const myBubbleColor = isVendedor ? CORAL : TEAL;

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para enviar fotos.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && !imageUri) return;
    await sendMessage(text, imageUri ?? undefined);
    setInput("");
    setImageUri(null);
    setReplyTo(null);
  }, [input, imageUri, sendMessage]);

  const selectReply = (item: Message) => {
    setReplyTo(item);
    // bring input into view
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const renderMsg = ({ item }: { item: Message }) => {
    const isOwn = item.userId === user?.id;
    return (
      <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
        {!isOwn && (
          <View style={[styles.avatar, { backgroundColor: TEAL }]}>
            <Text style={styles.avatarText}>
              {item.authorUsername?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}

        <View style={styles.msgColumn}>
          {!isOwn && (
            <Text style={styles.authorName}>{item.authorUsername}</Text>
          )}
          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={() => selectReply(item)}
            style={[
              styles.bubble,
              isOwn
                ? [styles.bubbleOwn, { backgroundColor: myBubbleColor }]
                : styles.bubbleOther,
            ]}
          >
            {/* Imagen en la burbuja */}
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.msgImage}
                resizeMode="cover"
              />
            )}
            {/* Texto (si hay) */}
            {!!item.content && (
              <Text style={[styles.msgText, isOwn && styles.msgTextOwn]}>
                {item.content}
              </Text>
            )}
            <View style={styles.msgMeta}>
              <Text style={[styles.msgTime, isOwn && styles.msgTimeOwn]}>
                {item.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              {isOwn && (
                <IconSymbol
                  name="checkmark.circle"
                  color="rgba(255,255,255,0.7)"
                  size={12}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
        {isOwn && (
          <View style={[styles.avatar, { backgroundColor: myBubbleColor }]}>
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Banner de rol */}
      <View
        style={[
          styles.roleBanner,
          { backgroundColor: isVendedor ? "#FFF5F6" : "#F0FAF9" },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <IconSymbol
            name={isVendedor ? "bag.fill" : "cart.fill"}
            color={isVendedor ? CORAL : TEAL}
            size={14}
          />
          <Text
            style={[
              styles.roleBannerText,
              { color: isVendedor ? CORAL : TEAL },
            ]}
          >
            {isVendedor
              ? "Respondiendo como Vendedor"
              : "Consultando como Cliente"}
          </Text>
        </View>
      </View>

      {/* Mensajes */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMsg}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <IconSymbol name="message.fill" color="#717171" size={48} />
            <Text style={styles.emptyChatText}>
              {isVendedor
                ? "Esperando preguntas del cliente..."
                : "¡Haz tu primera pregunta al vendedor!"}
            </Text>
          </View>
        }
      />

      {/* Reply preview (mini-thumbnail) */}
      {replyTo && (
        <View style={styles.replyPreview}>
          <TouchableOpacity
            onPress={() => {
              const idx = messages.findIndex((m) => m.id === replyTo.id);
              if (idx >= 0) {
                try {
                  listRef.current?.scrollToIndex({
                    index: idx,
                    animated: true,
                    viewPosition: 0.5,
                  });
                } catch (e) {
                  listRef.current?.scrollToOffset({
                    offset: Math.max(0, idx * 80),
                    animated: true,
                  });
                }
              }
            }}
            style={styles.replyThumbBtn}
          >
            {replyTo.imageUrl ? (
              <Image
                source={{ uri: replyTo.imageUrl }}
                style={styles.replyThumb}
              />
            ) : (
              <IconSymbol name="camera.fill" color="#717171" size={18} />
            )}
          </TouchableOpacity>
          <View style={{ flex: 1, paddingLeft: 8 }}>
            <Text style={styles.replyAuthor}>
              {replyTo.authorUsername ?? "Usuario"}
            </Text>
            <Text style={styles.replySnippet} numberOfLines={1}>
              {replyTo.imageUrl
                ? "Imagen"
                : (replyTo.content ?? "").slice(0, 80)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setReplyTo(null)}
            style={styles.replyClose}
          >
            <IconSymbol name="xmark" color="#717171" size={16} />
          </TouchableOpacity>
        </View>
      )}

      {/* Preview imagen */}
      {imageUri && (
        <View style={styles.imagePreviewBox}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.imageCancelBtn}
            onPress={() => setImageUri(null)}
          >
            <IconSymbol name="xmark" color="#fff" size={12} />
          </TouchableOpacity>
          <Text style={styles.imagePreviewLabel}>Imagen lista para enviar</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputArea}>
        <TouchableOpacity
          style={[styles.photoBtn, { backgroundColor: myBubbleColor + "20" }]}
          onPress={handlePickImage}
          activeOpacity={0.7}
        >
          <IconSymbol name="camera.fill" color={myBubbleColor} size={20} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={
              isVendedor ? "Responde al cliente..." : "¿Tienes alguna pregunta?"
            }
            placeholderTextColor="#BBBBBB"
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                (input.trim() || imageUri) && !isSending
                  ? myBubbleColor
                  : "#EBEBEB",
            },
          ]}
          onPress={handleSend}
          disabled={(!input.trim() && !imageUri) || isSending}
          activeOpacity={0.85}
        >
          {isSending ? (
            <Text style={{ fontSize: 10, color: "#fff" }}>...</Text>
          ) : (
            <IconSymbol
              name="paperplane.fill"
              color={input.trim() || imageUri ? "#fff" : "#BBBBBB"}
              size={18}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },

  roleBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  roleBannerText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.2 },

  listContent: { padding: 16, gap: 6, paddingBottom: 12 },

  emptyChat: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyChatText: {
    fontSize: 14,
    color: "#717171",
    textAlign: "center",
    maxWidth: 200,
  },

  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginVertical: 2,
  },
  msgRowOwn: { justifyContent: "flex-end" },
  msgColumn: { maxWidth: "72%", gap: 3 },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 13, fontWeight: "800" },

  bubble: { padding: 12, borderRadius: 18, overflow: "hidden" },
  bubbleOwn: { borderBottomRightRadius: 4 },
  bubbleOther: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderBottomLeftRadius: 4,
  },
  authorName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#717171",
    marginLeft: 2,
  },
  msgImage: { width: 180, height: 180, borderRadius: 10, marginBottom: 6 },
  msgText: { fontSize: 15, color: "#1B1C1C", lineHeight: 20 },
  msgTextOwn: { color: "#fff" },
  msgMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  msgTime: { fontSize: 10, color: "#BBBBBB" },
  msgTimeOwn: { color: "rgba(255,255,255,0.7)" },
  msgCheck: { fontSize: 10, color: "rgba(255,255,255,0.7)" },

  imagePreviewBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    gap: 10,
  },
  imagePreview: { width: 48, height: 48, borderRadius: 8 },
  imageCancelBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#A86A5A",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCancelText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  imagePreviewLabel: { fontSize: 12, color: "#717171", flex: 1 },

  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    gap: 10,
  },
  replyThumbBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  replyThumb: { width: 44, height: 44, borderRadius: 8 },
  replyAuthor: { fontSize: 12, fontWeight: "700", color: "#111827" },
  replySnippet: { fontSize: 12, color: "#717171" },
  replyClose: { padding: 6 },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    gap: 8,
  },
  photoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  photoBtnIcon: { fontSize: 20 },
  inputWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#EBEBEB",
    borderRadius: 24,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  input: { fontSize: 15, color: "#222222" },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: { fontSize: 16 },
});
