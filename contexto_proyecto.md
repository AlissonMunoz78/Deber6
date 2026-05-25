# Contexto Completo del Proyecto CV-CREATOR-APP


================================================
📄 ARCHIVO: .claude\settings.json
================================================

{
  "enabledPlugins": {
    "expo@claude-plugins-official": true
  }
}


================================================
📄 ARCHIVO: .env
================================================

EXPO_PUBLIC_SUPABASE_URL=https://hhqbimpesprnxffuqzqe.supabase.co

EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_a3m4A1wsQWe3zDW6lKTBgQ_jWYEHxGM

================================================
📄 ARCHIVO: .env.d.ts
================================================

declare const process: {
  env: {
    readonly EXPO_PUBLIC_SUPABASE_URL: string;
    readonly EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    readonly [key: string]: string | undefined;
  };
};

================================================
📄 ARCHIVO: .env.example
================================================

# Supabase Configuration
# Copy this file to .env.local and fill in your Supabase credentials
# Get these from your Supabase project at https://supabase.com/dashboard

EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=


================================================
📄 ARCHIVO: .env.local
================================================

EXPO_PUBLIC_SUPABASE_URL=https://hhqbimpesprnxffuqzqe.supabase.co

EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_a3m4A1wsQWe3zDW6lKTBgQ_jWYEHxGM

================================================
📄 ARCHIVO: .gitignore
================================================

# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

app-example

# generated native folders
/ios
/android
.env.local
.env

================================================
📄 ARCHIVO: AGENTS.md
================================================

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.


================================================
📄 ARCHIVO: app\(app)\chat\[roomId].tsx
================================================

import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { Message } from '@features/chat/domain/entities/Message';
import { useChat } from '@features/chat/presentation/hooks/useChat';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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
} from 'react-native';

const CORAL = '#FF385C';
const TEAL  = '#00A699';

export default function ChatScreen() {
  const { roomId }                    = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage }     = useChat(roomId);
  const user                          = useAuthStore((s) => s.user);
  const [input, setInput]             = useState('');
  const [imageUri, setImageUri]       = useState<string | null>(null);
  const listRef                       = useRef<FlatList>(null);

  const isVendedor    = user?.role === 'vendedor';
  const myBubbleColor = isVendedor ? CORAL : TEAL;

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para enviar fotos.');
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

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text && !imageUri) return;

    if (imageUri) {
      sendMessage(text ? `📷 [Imagen] ${text}` : '📷 [Imagen]');
      setImageUri(null);
    } else {
      sendMessage(text);
    }
    setInput('');
  }, [input, imageUri, sendMessage]);

  const handleCancelImage = () => setImageUri(null);

  const renderMsg = ({ item }: { item: Message }) => {
    const isOwn = item.userId === user?.id;
    return (
      <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
        {/* Avatar ajeno */}
        {!isOwn && (
          <View style={[styles.avatar, { backgroundColor: TEAL }]}>
            <Text style={styles.avatarText}>
              {item.authorUsername?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}

        <View style={styles.msgColumn}>
          {!isOwn && (
            <Text style={styles.authorName}>{item.authorUsername}</Text>
          )}
          <View style={[
            styles.bubble,
            isOwn
              ? [styles.bubbleOwn, { backgroundColor: myBubbleColor }]
              : styles.bubbleOther,
          ]}>
            <Text style={[styles.msgText, isOwn && styles.msgTextOwn]}>
              {item.content}
            </Text>
            <View style={styles.msgMeta}>
              <Text style={[styles.msgTime, isOwn && styles.msgTimeOwn]}>
                {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {isOwn && <Text style={styles.msgCheck}>✓✓</Text>}
            </View>
          </View>
        </View>

        {/* Avatar propio */}
        {isOwn && (
          <View style={[styles.avatar, { backgroundColor: myBubbleColor }]}>
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Banner de rol */}
      <View style={[
        styles.roleBanner,
        { backgroundColor: isVendedor ? '#FFF5F6' : '#F0FAF9' },
      ]}>
        <Text style={[styles.roleBannerText, { color: isVendedor ? CORAL : TEAL }]}>
          {isVendedor ? '🏪 Respondiendo como Vendedor' : '🛒 Consultando como Cliente'}
        </Text>
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
            <Text style={{ fontSize: 48 }}>💬</Text>
            <Text style={styles.emptyChatText}>
              {isVendedor
                ? 'Esperando preguntas del cliente...'
                : '¡Haz tu primera pregunta al vendedor!'}
            </Text>
          </View>
        }
      />

      {/* Preview imagen seleccionada */}
      {imageUri && (
        <View style={styles.imagePreviewBox}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.imageCancelBtn} onPress={handleCancelImage}>
            <Text style={styles.imageCancelText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.imagePreviewLabel}>Imagen lista para enviar</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputArea}>
        {/* Botón foto */}
        <TouchableOpacity
          style={[styles.photoBtn, { backgroundColor: myBubbleColor + '20' }]}
          onPress={handlePickImage}
          activeOpacity={0.7}
        >
          <Text style={[styles.photoBtnIcon, { color: myBubbleColor }]}>📷</Text>
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={isVendedor ? 'Responde al cliente...' : '¿Tienes alguna pregunta?'}
            placeholderTextColor="#BBBBBB"
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: (input.trim() || imageUri) ? myBubbleColor : '#EBEBEB' },
          ]}
          onPress={handleSend}
          disabled={!input.trim() && !imageUri}
          activeOpacity={0.85}
        >
          <Text style={[
            styles.sendIcon,
            { color: (input.trim() || imageUri) ? '#fff' : '#BBBBBB' },
          ]}>
            ➤
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F7F7F7' },

  roleBanner:        { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  roleBannerText:    { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

  listContent:       { padding: 16, gap: 6, paddingBottom: 12 },

  emptyChat:         { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyChatText:     { fontSize: 14, color: '#717171', textAlign: 'center', maxWidth: 200 },

  msgRow:            { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 2 },
  msgRowOwn:         { justifyContent: 'flex-end' },
  msgColumn:         { maxWidth: '72%', gap: 3 },

  avatar:            { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText:        { color: '#fff', fontSize: 13, fontWeight: '800' },

  bubble:            { padding: 12, borderRadius: 18 },
  bubbleOwn:         { borderBottomRightRadius: 4 },
  bubbleOther:       { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EBEBEB', borderBottomLeftRadius: 4 },
  authorName:        { fontSize: 11, fontWeight: '700', color: '#717171', marginLeft: 2 },
  msgText:           { fontSize: 15, color: '#1B1C1C', lineHeight: 20 },
  msgTextOwn:        { color: '#fff' },
  msgMeta:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  msgTime:           { fontSize: 10, color: '#BBBBBB' },
  msgTimeOwn:        { color: 'rgba(255,255,255,0.7)' },
  msgCheck:          { fontSize: 10, color: 'rgba(255,255,255,0.7)' },

  imagePreviewBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#EBEBEB', gap: 10 },
  imagePreview:      { width: 48, height: 48, borderRadius: 8 },
  imageCancelBtn:    { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FF385C', justifyContent: 'center', alignItems: 'center' },
  imageCancelText:   { color: '#fff', fontSize: 10, fontWeight: '800' },
  imagePreviewLabel: { fontSize: 12, color: '#717171', flex: 1 },

  inputArea:         { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EBEBEB', gap: 8 },
  photoBtn:          { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  photoBtnIcon:      { fontSize: 20 },
  inputWrapper:      { flex: 1, borderWidth: 1.5, borderColor: '#EBEBEB', borderRadius: 24, backgroundColor: '#F7F7F7', paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100 },
  input:             { fontSize: 15, color: '#222222' },
  sendBtn:           { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendIcon:          { fontSize: 16 },
});

================================================
📄 ARCHIVO: app\(app)\index.tsx
================================================

import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { Room } from '@features/chat/domain/entities/Message';
import { useRooms } from '@features/chat/presentation/hooks/useRooms';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CORAL = '#FF385C';
const TEAL  = '#00A699';

export default function RoomsScreen() {
  const { rooms, isLoading, createRoom, isCreating, createError } = useRooms();
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName]         = useState('');

  const isVendedor = user?.role === 'vendedor';
  const roleColor  = isVendedor ? CORAL : TEAL;

  const handleCreate = async () => {
    if (!roomName.trim() || isCreating) return;
    try {
      await createRoom(roomName.trim());
      setRoomName('');
      setModalVisible(false);
    } catch { /* createError se muestra en UI */ }
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
      <Text style={styles.roomChevron}>›</Text>
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
        <Text style={styles.bannerEmoji}>{isVendedor ? '🏪' : '🛒'}</Text>
        <View>
          <Text style={styles.bannerName}>Hola, {user?.username}</Text>
          <Text style={styles.bannerRole}>
            {isVendedor ? 'Gestiona tus ventas en tiempo real.' : 'Descubre productos y chatea con tiendas.'}
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
        contentContainerStyle={rooms.length === 0 ? styles.emptyContainer : styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Text style={{ fontSize: 36 }}>💬</Text>
            </View>
            <Text style={styles.emptyTitle}>No hay salas disponibles</Text>
            <Text style={styles.emptyDesc}>
              {isVendedor
                ? 'Crea una sala para atender clientes'
                : 'Espera a que un vendedor cree una sala'}
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
          <Text style={styles.fabText}>+</Text>
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
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.sheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Ícono */}
            <View style={styles.sheetIconCircle}>
              <Text style={{ fontSize: 26 }}>🏪</Text>
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
              {isCreating
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.sheetBtnCreateText}>Crear sala</Text>
              }
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
  container:        { flex: 1, backgroundColor: '#FCFAF8' },
  centered:         { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Banner
  banner:           { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, paddingTop: 24 },
  bannerEmoji:      { fontSize: 36 },
  bannerName:       { color: '#fff', fontSize: 16, fontWeight: '700' },
  bannerRole:       { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 2 },

  // Sección
  sectionLabel:     { fontSize: 11, fontWeight: '700', color: '#717171', letterSpacing: 1.2, textTransform: 'uppercase', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },

  // Lista
  listContent:      { paddingHorizontal: 16, paddingBottom: 100 },
  separator:        { height: 1, backgroundColor: '#F0EDED', marginHorizontal: 16 },
  roomItem:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  roomIconBox:      { width: 44, height: 44, backgroundColor: '#F0EDED', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  roomIconText:     { fontSize: 18, fontWeight: '800', color: '#5B5C5C' },
  roomInfo:         { flex: 1 },
  roomName:         { fontSize: 15, fontWeight: '700', color: '#1B1C1C' },
  roomSub:          { fontSize: 12, color: '#717171', marginTop: 2 },
  roomChevron:      { fontSize: 22, color: '#BBBBBB' },

  // Empty
  emptyContainer:   { flex: 1 },
  emptyBox:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyIconCircle:  { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle:       { fontSize: 18, fontWeight: '800', color: '#1B1C1C' },
  emptyDesc:        { fontSize: 14, color: '#717171', textAlign: 'center', maxWidth: 220 },

  // FAB
  fab:              { position: 'absolute', right: 20, bottom: 32, width: 56, height: 56, borderRadius: 28, backgroundColor: CORAL, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  fabText:          { color: '#fff', fontSize: 30, lineHeight: 34 },

  // Modal / Bottom Sheet
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetHandle:      { width: 40, height: 4, backgroundColor: '#EBEBEB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetIconCircle:  { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF0F2', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  sheetTitle:       { fontSize: 22, fontWeight: '800', color: '#222222', marginBottom: 4 },
  sheetSubtitle:    { fontSize: 13, color: '#717171', marginBottom: 16 },
  sheetDivider:     { height: 1, backgroundColor: '#EBEBEB', marginBottom: 16 },
  sheetError:       { color: CORAL, fontSize: 13, marginBottom: 10 },
  sheetFieldLabel:  { fontSize: 11, fontWeight: '700', color: '#717171', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  sheetInputWrapper:{ borderWidth: 1.5, borderColor: '#EBEBEB', borderRadius: 10, padding: 14, marginBottom: 6 },
  sheetInput:       { fontSize: 15, color: '#222222' },
  sheetCounter:     { fontSize: 11, color: '#BBBBBB', textAlign: 'right', marginTop: 6 },
  sheetBtnCreate:   { backgroundColor: CORAL, borderRadius: 8, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  sheetBtnCreateText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sheetBtnCancel:   { height: 44, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  sheetBtnCancelText: { color: '#717171', fontSize: 15 },
});

================================================
📄 ARCHIVO: app\(app)\_layout.tsx
================================================

import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CORAL = '#FF385C';
const TEAL  = '#00A699';

export default function AppLayout() {
  const { logout }     = useAuth();
  const user           = useAuthStore((s) => s.user);
  const isVendedor     = user?.role === 'vendedor';
  const headerBgColor  = isVendedor ? CORAL : TEAL;

  return (
    <Stack screenOptions={{
      headerStyle:      { backgroundColor: headerBgColor },
      headerTintColor:  '#fff',
      headerTitleStyle: { fontWeight: '800', fontSize: 18 },
    }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'ShopChat',
          headerRight: () => (
            <View style={styles.headerRight}>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>
                  {isVendedor ? '🏪 Vendedor' : '🛒 Cliente'}
                </Text>
              </View>
              <TouchableOpacity onPress={logout} activeOpacity={0.7}>
                <Text style={styles.logoutText}>Salir</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="chat/[roomId]"
        options={{ title: 'Chat' }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 4 },
  rolePill:      { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  rolePillText:  { color: '#fff', fontSize: 12, fontWeight: '700' },
  logoutText:    { color: '#fff', fontSize: 13, fontWeight: '600' },
});

================================================
📄 ARCHIVO: app\(auth)\login.tsx
================================================

import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { Link } from 'expo-router';
import { useState } from 'react';
import LottieView from 'lottie-react-native';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Decoración de fondo */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LottieView
            source={require('../../assets/animations/shopchat.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.title}>ShopChat</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#B0B0B0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Botón principal */}
        <TouchableOpacity
          style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
          onPress={() => login({ email, password })}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryText}>Ingresar</Text>
          }
        </TouchableOpacity>

        {/* Divisor */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botón Google (visual) */}
        <TouchableOpacity style={styles.btnGoogle} activeOpacity={0.85}>
          <Text style={styles.btnGoogleIcon}>G</Text>
          <Text style={styles.btnGoogleText}>Continuar con Google</Text>
        </TouchableOpacity>

        {/* Link registro */}
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.linkBtn}>
            <Text style={styles.linkText}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.linkAccent}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CORAL = '#FF385C';

const styles = StyleSheet.create({
  flex:           { flex: 1, backgroundColor: '#FFFFFF' },

  blobTopRight:   { position: 'absolute', top: -80, right: -60, width: 300, height: 300, borderRadius: 150, backgroundColor: '#a52a3adb', opacity: 0.5 },
  blobBottomLeft: { position: 'absolute', bottom: -60, left: -40, width: 240, height: 240, borderRadius: 120, backgroundColor: '#a52a3adb', opacity: 0.6 },

  container:      { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40, justifyContent: 'center' },

  header:         { alignItems: 'center', marginBottom: 32 },
  lottie:         { width: 160, height: 160, marginBottom: 4 },
  title:          { fontSize: 32, fontWeight: '800', color: '#222222', letterSpacing: -0.5, marginBottom: 4 },
  subtitle:       { fontSize: 16, fontWeight: '500', color: '#717171' },

  errorBox:       { backgroundColor: '#FFF0F2', borderRadius: 8, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: CORAL },
  errorText:      { color: CORAL, fontSize: 13, fontWeight: '500' },

  form:           { marginBottom: 20, gap: 4 },
  inputWrapper:   { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#DDDDDD', paddingVertical: 14, gap: 12 },
  inputIcon:      { fontSize: 18, width: 24, textAlign: 'center' },
  input:          { flex: 1, fontSize: 16, color: '#222222', paddingVertical: 0 },

  btnPrimary:     { backgroundColor: CORAL, borderRadius: 8, height: 54, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4, elevation: 4, marginTop: 8 },
  btnDisabled:    { opacity: 0.7 },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider:        { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: '#EBEBEB' },
  dividerText:    { fontSize: 12, color: '#717171', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },

  btnGoogle:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 54, borderWidth: 1.5, borderColor: '#222222', borderRadius: 8, gap: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  btnGoogleIcon:  { fontSize: 18, fontWeight: '900', color: '#f44242' },
  btnGoogleText:  { fontSize: 16, fontWeight: '600', color: '#222222' },

  linkBtn:        { marginTop: 28, alignItems: 'center' },
  linkText:       { fontSize: 14, color: '#222222' },
  linkAccent:     { fontWeight: '700', textDecorationLine: 'underline' },
});

================================================
📄 ARCHIVO: app\(auth)\register.tsx
================================================

import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { Link } from 'expo-router';
import { useState } from 'react';
import LottieView from 'lottie-react-native';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Role = 'cliente' | 'vendedor';

export default function RegisterScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole]         = useState<Role>('cliente');
  const { register, isLoading, error } = useAuth();

  const handleRegister = () => {
    console.log('ROLE ENVIADO:', role);
    register({ email, password, username, role });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LottieView
            source={require('../../assets/animations/shopchat.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.title}>Crea tu cuenta</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Roles */}
        <Text style={styles.roleLabel}>
          ¿Cómo quieres usar ShopChat?
        </Text>

        <View style={styles.roleRow}>
          {/* CLIENTE */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.roleCard, role === 'cliente' && styles.roleCardActiveTeal]}
            onPress={() => setRole('cliente')}
          >
            {role === 'cliente' && (
              <Text style={[styles.roleCheck, { color: '#00A699' }]}>✓</Text>
            )}
            <Text style={styles.roleEmoji}>🛒</Text>
            <Text style={[styles.roleCardTitle, role === 'cliente' && { color: '#00A699' }]}>
              CLIENTE
            </Text>
            <Text style={styles.roleCardDesc}>Consulta y compra</Text>
          </TouchableOpacity>

          {/* VENDEDOR */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.roleCard, role === 'vendedor' && styles.roleCardActiveCoral]}
            onPress={() => setRole('vendedor')}
          >
            {role === 'vendedor' && (
              <Text style={[styles.roleCheck, { color: '#FF385C' }]}>✓</Text>
            )}
            <Text style={styles.roleEmoji}>🏪</Text>
            <Text style={[styles.roleCardTitle, role === 'vendedor' && { color: '#FF385C' }]}>
              VENDEDOR
            </Text>
            <Text style={styles.roleCardDesc}>Vende y atiende</Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              placeholderTextColor="#B0B0B0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#B0B0B0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
          disabled={isLoading}
          activeOpacity={0.85}
          onPress={handleRegister}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
          }
        </TouchableOpacity>

        {/* Link login */}
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkBtn}>
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.linkAccent}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CORAL = '#FF385C';

const styles = StyleSheet.create({
  flex:                { flex: 1, backgroundColor: '#FCFAF8' },

  container:           { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },

  header:              { alignItems: 'center', marginBottom: 20 },
  lottie:              { width: 130, height: 130, marginBottom: 4 },
  title:               { fontSize: 28, fontWeight: '800', color: '#222222' },

  errorBox:            { backgroundColor: '#FFF0F2', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText:           { color: CORAL, fontSize: 13 },

  roleLabel:           { fontSize: 14, color: '#717171', fontWeight: '600', marginBottom: 12 },
  roleRow:             { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleCard:            { flex: 1, borderWidth: 1.5, borderColor: '#EBEBEB', borderRadius: 12, padding: 16, alignItems: 'center', backgroundColor: '#FFFFFF', position: 'relative' },
  roleCardActiveTeal:  { borderColor: '#00A699', backgroundColor: 'rgba(0,166,153,0.04)' },
  roleCardActiveCoral: { borderColor: CORAL, backgroundColor: 'rgba(255,56,92,0.04)' },
  roleCheck:           { position: 'absolute', top: 8, right: 10, fontSize: 13, fontWeight: '800' },
  roleEmoji:           { fontSize: 30, marginBottom: 6 },
  roleCardTitle:       { fontSize: 12, fontWeight: '700', color: '#222222' },
  roleCardDesc:        { fontSize: 11, color: '#717171', marginTop: 3 },

  form:                { marginBottom: 20, gap: 4 },
  inputWrapper:        { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#DDDDDD', paddingVertical: 14, gap: 12 },
  inputIcon:           { fontSize: 18, width: 24, textAlign: 'center' },
  input:               { flex: 1, fontSize: 16, color: '#222222' },

  btnPrimary:          { backgroundColor: CORAL, borderRadius: 100, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnDisabled:         { opacity: 0.7 },
  btnPrimaryText:      { color: '#fff', fontSize: 16, fontWeight: '700' },

  linkBtn:             { marginTop: 24, alignItems: 'center' },
  linkText:            { fontSize: 14, color: '#717171' },
  linkAccent:          { color: CORAL, fontWeight: '700' },
});

================================================
📄 ARCHIVO: app\(auth)\_layout.tsx
================================================

import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

================================================
📄 ARCHIVO: app\_layout.tsx
================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@shared/infrastructure/supabase/client';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { SupabaseAuthRepository } from '@features/auth/infrastructure/repositories/SupabaseAuthRepository';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});
const authRepo = new SupabaseAuthRepository();

function AuthGuard() {
  const { user, setUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Restaurar sesión al iniciar
    authRepo.getCurrentUser().then((u) => {
      setUser(u);
      setIsReady(true); // Solo navegar después de conocer el estado de sesión
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const u = await authRepo.getCurrentUser();
          setUser(u);
        } else {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return; // No navegar hasta tener el estado de sesión

    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user  && inAuth)  router.replace('/(app)');
  }, [user, segments, isReady]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}

================================================
📄 ARCHIVO: app.json
================================================

{
  "expo": {
    "name": "mi-chat-app",
    "slug": "mi-chat-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "michatapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "extra": {
      "supabaseUrl": "YOUR_SUPABASE_URL",
      "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
    }
  }
}



================================================
📄 ARCHIVO: CLAUDE.md
================================================

@AGENTS.md


================================================
📄 ARCHIVO: components\external-link.tsx
================================================

import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}


================================================
📄 ARCHIVO: components\haptic-tab.tsx
================================================

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}


================================================
📄 ARCHIVO: components\hello-wave.tsx
================================================

import Animated from 'react-native-reanimated';

export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}


================================================
📄 ARCHIVO: components\parallax-scroll-view.tsx
================================================

import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});


================================================
📄 ARCHIVO: components\themed-text.tsx
================================================

import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});


================================================
📄 ARCHIVO: components\themed-view.tsx
================================================

import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}


================================================
📄 ARCHIVO: components\ui\collapsible.tsx
================================================

import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});


================================================
📄 ARCHIVO: components\ui\icon-symbol.ios.tsx
================================================

import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}


================================================
📄 ARCHIVO: components\ui\icon-symbol.tsx
================================================

// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}


================================================
📄 ARCHIVO: constants\theme.ts
================================================

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});


================================================
📄 ARCHIVO: eslint.config.js
================================================

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);


================================================
📄 ARCHIVO: expo-env.d.ts
================================================

/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore

================================================
📄 ARCHIVO: hooks\use-color-scheme.ts
================================================

export { useColorScheme } from 'react-native';


================================================
📄 ARCHIVO: hooks\use-color-scheme.web.ts
================================================

import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}


================================================
📄 ARCHIVO: hooks\use-theme-color.ts
================================================

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}


================================================
📄 ARCHIVO: package.json
================================================

{
  "name": "mi-chat-app",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "@supabase/supabase-js": "^2.106.1",
    "@tanstack/react-query": "^5.100.13",
    "appwrite": "^25.2.0",
    "expo": "~54.0.33",
    "expo-constants": "~18.0.13",
    "expo-font": "~14.0.11",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-image-picker": "~17.0.11",
    "expo-linking": "~8.0.11",
    "expo-router": "~6.0.23",
    "expo-secure-store": "~15.0.8",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.5.1",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "typescript": "~5.9.2"
  },
  "private": true
}


================================================
📄 ARCHIVO: README.md
================================================

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


================================================
📄 ARCHIVO: scripts\reset-project.js
================================================

#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It deletes or moves the /app, /components, /hooks, /scripts, and /constants directories to /app-example based on user input and creates a new /app directory with an index.tsx and _layout.tsx file.
 * You can remove the `reset-project` script from package.json and safely delete this file after running it.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const oldDirs = ["app", "components", "hooks", "constants", "scripts"];
const exampleDir = "app-example";
const newAppDir = "app";
const exampleDirPath = path.join(root, exampleDir);

const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") {
      // Create the app-example directory
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

    // Move old directories to new app-example directory or delete them
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Create new /app directory
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\n📁 New /app directory created.");

    // Create index.tsx
    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 app/index.tsx created.");

    // Create _layout.tsx
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 app/_layout.tsx created.");

    console.log("\n✅ Project reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit app/index.tsx to edit the main screen.${
        userInput === "y"
          ? `\n3. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

rl.question(
  "Do you want to move existing files to /app-example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);


================================================
📄 ARCHIVO: src\features\auth\application\use-cases\LoginUseCase.ts
================================================

import { AuthError } from '../../../../shared/domain/errors/AppError';
import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !password)
      throw new AuthError('Email y contraseña son requeridos');
    try {
      return await this.authRepo.login(email, password);
    } catch (error) {
      throw new AuthError('Credenciales inválidas', error);
    }
  }
}

================================================
📄 ARCHIVO: src\features\auth\application\use-cases\RegisterUseCase.ts
================================================

import { AuthError } from '../../../../shared/domain/errors/AppError';
import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class RegisterUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string, username: string, role: 'vendedor' | 'cliente'): Promise<User> {
    if (!email || !password || !username)
      throw new AuthError('Todos los campos son requeridos');
    if (password.length < 6)
      throw new AuthError('La contraseña debe tener al menos 6 caracteres');
    if (username.includes(' '))
      throw new AuthError('El username no puede contener espacios');
    if (!['vendedor', 'cliente'].includes(role))
      throw new AuthError('El rol debe ser vendedor o cliente');
    try {
      return await this.authRepo.register(email, password, username, role);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar usuario';
      throw new AuthError(message, error);
    }
  }
}

================================================
📄 ARCHIVO: src\features\auth\domain\entities\User.ts
================================================

export type UserRole = 'vendedor' | 'cliente';

export interface User {
  id:         string;
  email:      string;
  username:   string;
  role:       UserRole;
  avatarUrl?: string;
}

================================================
📄 ARCHIVO: src\features\auth\domain\repositories\IAuthRepository.ts
================================================

import { User } from '../entities/User';

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  register(email: string, password: string, username: string, role: 'vendedor' | 'cliente'): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

================================================
📄 ARCHIVO: src\features\auth\infrastructure\repositories\SupabaseAuthRepository.ts
================================================

import { supabase } from '../../../../shared/infrastructure/supabase/client';
import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class SupabaseAuthRepository implements IAuthRepository {

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw error ?? new Error('Error al iniciar sesión');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, avatar_url, role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    return {
      id:        data.user.id,
      email:     data.user.email!,
      username:  profile.username,
      role:      profile.role as 'cliente' | 'vendedor',
      avatarUrl: profile.avatar_url ?? undefined,
    };
  }

  async register(
    email: string,
    password: string,
    username: string,
    role: 'vendedor' | 'cliente'
  ): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No se pudo crear el usuario');

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        username,
        role,
      });

    if (profileError) throw new Error(profileError.message);

    return {
      id:       data.user.id,
      email:    data.user.email!,
      username,
      role,
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, avatar_url, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return null;

    return {
      id:       user.id,
      email:    user.email!,
      username: profile.username,
      role:     profile.role as 'cliente' | 'vendedor',
      avatarUrl: profile.avatar_url ?? undefined,
    };
  }
}

================================================
📄 ARCHIVO: src\features\auth\presentation\hooks\useAuth.ts
================================================

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { SupabaseAuthRepository } from '../../infrastructure/repositories/SupabaseAuthRepository';
import { useAuthStore } from '../store/authStore';

const authRepo     = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepo);
const registerUseCase = new RegisterUseCase(authRepo);

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUseCase.execute(email, password),
    onSuccess: (u) => { setUser(u); router.replace('/(app)'); },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, username, role }: {
      email: string; password: string; username: string; role: 'vendedor' | 'cliente';
    }) => registerUseCase.execute(email, password, username, role),
    onSuccess: (u) => { setUser(u); router.replace('/(app)'); },
  });

  const logout = async () => {
    try { await authRepo.logout(); }
    finally { setUser(null); router.replace('/(auth)/login'); }
  };

  return {
    user,
    login:      loginMutation.mutate,
    register:   registerMutation.mutate,
    logout,
    isLoading:  loginMutation.isPending || registerMutation.isPending,
    error:      loginMutation.error?.message ?? registerMutation.error?.message ?? null,
  };
}

================================================
📄 ARCHIVO: src\features\auth\presentation\store\authStore.ts
================================================

import { create } from 'zustand';
import { User } from '../../domain/entities/User';

interface AuthState {
  user:    User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  setUser: (user) => set({ user }),
}));

================================================
📄 ARCHIVO: src\features\chat\application\use-cases\CreateRoomUseCase.ts
================================================

import { ChatError } from '../../../../shared/domain/errors/AppError';
import { Room } from '../../domain/entities/Message';
import { IChatRepository } from '../../domain/repositories/IChatRepository';

export class CreateRoomUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(name: string, userId: string): Promise<Room> {
    if (!name.trim()) throw new ChatError('El nombre de la sala es requerido');
    return this.chatRepo.createRoom(name.trim(), userId);
  }
}

================================================
📄 ARCHIVO: src\features\chat\application\use-cases\GetMessagesUseCase.ts
================================================

import { Message } from '../../domain/entities/Message';
import { IChatRepository } from '../../domain/repositories/IChatRepository';

export class GetMessagesUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  execute(roomId: string): Promise<Message[]> {
    return this.chatRepo.getMessages(roomId);
  }
}

================================================
📄 ARCHIVO: src\features\chat\application\use-cases\SendMessageUseCase.ts
================================================

import { ChatError } from '../../../../shared/domain/errors/AppError';
import { Message } from '../../domain/entities/Message';
import { IChatRepository } from '../../domain/repositories/IChatRepository';

export class SendMessageUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(roomId: string, userId: string, content: string): Promise<Message> {
    const trimmed = content.trim();
    if (!trimmed) throw new ChatError('El mensaje no puede estar vacío');
    if (trimmed.length > 500) throw new ChatError('Máximo 500 caracteres');
    return this.chatRepo.sendMessage(roomId, userId, trimmed);
  }
}

================================================
📄 ARCHIVO: src\features\chat\application\use-cases\SubscribeToRoomUseCase.ts
================================================

import { Message } from '../../domain/entities/Message';
import { IChatRepository } from '../../domain/repositories/IChatRepository';

export class SubscribeToRoomUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  execute(roomId: string, onMessage: (msg: Message) => void): () => void {
    return this.chatRepo.subscribeToRoom(roomId, onMessage);
  }
}

================================================
📄 ARCHIVO: src\features\chat\domain\entities\Message.ts
================================================

export interface Message {
  id:               string;
  roomId:           string;
  userId:           string;
  content:          string;
  createdAt:        Date;
  authorUsername?:  string; // Desnormalización controlada para la UI
}

export interface Room {
  id:        string;
  name:      string;
  createdBy: string;
  createdAt: Date;
}

================================================
📄 ARCHIVO: src\features\chat\domain\entities\Room.ts
================================================



================================================
📄 ARCHIVO: src\features\chat\domain\repositories\IChatRepository.ts
================================================

import { Message, Room } from '../entities/Message';

export interface IChatRepository {
  getRooms(): Promise<Room[]>;
  createRoom(name: string, userId: string): Promise<Room>;
  getMessages(roomId: string): Promise<Message[]>;
  sendMessage(
    roomId: string,
    userId: string,
    content: string,
  ): Promise<Message>;
  // Devuelve la función unsubscribe, compatible con el return de useEffect
  subscribeToRoom(
    roomId: string,
    onMessage: (msg: Message) => void,
  ): () => void;
}

================================================
📄 ARCHIVO: src\features\chat\infrastructure\repositories\AppwriteChatRepository.ts
================================================

// MIGRACIÓN: Reemplaza SupabaseChatRepository sin tocar ninguna otra capa
// Solo cambia la inyección de dependencia en los hooks

import { Message, Room } from '@features/chat/domain/entities/Message';
import { IChatRepository } from '@features/chat/domain/repositories/IChatRepository';
import { Client, Databases, ID, Query, RealtimeResponseEvent } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DB_ID       = process.env.EXPO_PUBLIC_APPWRITE_DB_ID!;
const ROOMS_COL   = 'rooms';
const MESSAGES_COL = 'messages';

export class AppwriteChatRepository implements IChatRepository {
  async getRooms(): Promise<Room[]> {
    const res = await databases.listDocuments(DB_ID, ROOMS_COL, [
      Query.orderDesc('$createdAt'),
    ]);
    return res.documents.map(this.mapRoom);
  }

  async createRoom(name: string, userId: string): Promise<Room> {
    const doc = await databases.createDocument(DB_ID, ROOMS_COL, ID.unique(), {
      name,
      created_by: userId,
    });
    return this.mapRoom(doc);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const res = await databases.listDocuments(DB_ID, MESSAGES_COL, [
      Query.equal('room_id', roomId),
      Query.orderAsc('$createdAt'),
      Query.limit(50),
    ]);
    return res.documents.map(this.mapMessage);
  }

  async sendMessage(roomId: string, userId: string, content: string): Promise<Message> {
    const doc = await databases.createDocument(DB_ID, MESSAGES_COL, ID.unique(), {
      room_id: roomId,
      user_id: userId,
      content,
    });
    return this.mapMessage(doc);
  }

  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const unsubscribe = client.subscribe(
      `databases.${DB_ID}.collections.${MESSAGES_COL}.documents`,
      (response: RealtimeResponseEvent<any>) => {
        if (
          response.events.includes('databases.*.collections.*.documents.*.create') &&
          response.payload.room_id === roomId
        ) {
          onMessage(this.mapMessage(response.payload));
        }
      }
    );
    return unsubscribe;
  }

  private mapRoom = (doc: any): Room => ({
    id:        doc.$id,
    name:      doc.name,
    createdBy: doc.created_by,
    createdAt: new Date(doc.$createdAt),
  });

  private mapMessage = (doc: any): Message => ({
    id:              doc.$id,
    roomId:          doc.room_id,
    userId:          doc.user_id,
    content:         doc.content,
    createdAt:       new Date(doc.$createdAt),
    authorUsername:  doc.author_username,
  });
}

================================================
📄 ARCHIVO: src\features\chat\infrastructure\repositories\SupabaseChatRepository.ts
================================================

import { supabase } from "@shared/infrastructure/supabase/client";
import { Message, Room } from "@features/chat/domain/entities/Message";
import { IChatRepository } from "@features/chat/domain/repositories/IChatRepository";

export class SupabaseChatRepository implements IChatRepository {

  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapRoom);
  }

  async createRoom(name: string, userId: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert({ name, created_by: userId })
      .select()
      .single();
    if (error) throw error;
    return this.mapRoom(data);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('id, room_id, user_id, content, created_at, profiles(username)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map(this.mapMessage);
  }

  async sendMessage(roomId: string, userId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ room_id: roomId, user_id: userId, content })
      .select('id, room_id, user_id, content, created_at, profiles(username)')
      .single();
    if (error) throw error;
    return this.mapMessage(data);
  }

  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // El payload no incluye el username — se obtiene con una query extra
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.user_id)
            .single();

          onMessage({
            id:             payload.new.id,
            roomId:         payload.new.room_id,
            userId:         payload.new.user_id,
            content:        payload.new.content,
            createdAt:      new Date(payload.new.created_at),
            authorUsername: profile?.username,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  private mapRoom = (raw: any): Room => ({
    id: raw.id,
    name: raw.name,
    createdBy: raw.created_by,
    createdAt: new Date(raw.created_at),
  });

  private mapMessage = (raw: any): Message => ({
    id: raw.id,
    roomId: raw.room_id,
    userId: raw.user_id,
    content: raw.content,
    createdAt: new Date(raw.created_at),
    authorUsername: raw.profiles?.username,
  });
}

================================================
📄 ARCHIVO: src\features\chat\presentation\hooks\useChat.ts
================================================

import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { GetMessagesUseCase } from "@features/chat/application/use-cases/GetMessagesUseCase";
import { SendMessageUseCase } from "@features/chat/application/use-cases/SendMessageUseCase";
import { SubscribeToRoomUseCase } from "@features/chat/application/use-cases/SubscribeToRoomUseCase";
import { Message } from "@features/chat/domain/entities/Message";
import { SupabaseChatRepository } from "@features/chat/infrastructure/repositories/SupabaseChatRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const chatRepo = new SupabaseChatRepository();
const getMessagesUseCase = new GetMessagesUseCase(chatRepo);
const sendMessageUseCase = new SendMessageUseCase(chatRepo);
const subscribeUseCase = new SubscribeToRoomUseCase(chatRepo);

export function useChat(roomId: string) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => getMessagesUseCase.execute(roomId),
    enabled: !!user,
    staleTime: Infinity, // Realtime se encarga de los nuevos
  });

  useEffect(() => {
    const unsubscribe = subscribeUseCase.execute(roomId, (newMsg) => {
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => {
        const exists = old.some((m) => m.id === newMsg.id);
        return exists ? old : [...old, newMsg];
      });
    });
    return unsubscribe;
  }, [roomId]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessageUseCase.execute(roomId, user!.id, content),
    onMutate: async (content) => {
      const tempMsg: Message = { id: `temp-${Date.now()}`, roomId, userId: user!.id, content, createdAt: new Date(), authorUsername: user!.username };
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => [...old, tempMsg]);
      return { tempMsg };
    },
    onSuccess: (realMsg, _content, context) => {
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) =>
        old.map((m) => (m.id === context?.tempMsg.id ? realMsg : m))
      );
    },
    onError: (_err, _content, context) => {
      if (context?.tempMsg) {
        queryClient.setQueryData(["messages", roomId], (old: Message[] = []) =>
          old.filter((m) => m.id !== context.tempMsg.id)
        );
      }
    },
  });

  return { messages, sendMessage: sendMutation.mutate, isLoading, isSending: sendMutation.isPending };
}

================================================
📄 ARCHIVO: src\features\chat\presentation\hooks\useRooms.ts
================================================

import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { CreateRoomUseCase } from "@features/chat/application/use-cases/CreateRoomUseCase";
import { Room } from "@features/chat/domain/entities/Message";
import { SupabaseChatRepository } from "@features/chat/infrastructure/repositories/SupabaseChatRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const chatRepo = new SupabaseChatRepository();
const createRoomUseCase = new CreateRoomUseCase(chatRepo);

export function useRooms() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading, error } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => chatRepo.getRooms(),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createRoomUseCase.execute(name, user!.id),
    onSuccess: (newRoom) => {
      queryClient.setQueryData(["rooms"], (old: Room[]) => [newRoom, ...(old ?? [])]);
    },
  });

  return {
    rooms, isLoading,
    error: error?.message ?? null,
    createRoom: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message ?? null,
  };
}

================================================
📄 ARCHIVO: src\shared\domain\errors\AppError.ts
================================================

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('AUTH_ERROR', message, cause);
  }
}

export class ChatError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('CHAT_ERROR', message, cause);
  }
}

================================================
📄 ARCHIVO: src\shared\infrastructure\supabase\client.ts
================================================

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

================================================
📄 ARCHIVO: tsconfig.json
================================================

{
  "extends": "expo/tsconfig.base",
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "env.d.ts",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "lib": [
      "ESNext"
    ],
    "ignoreDeprecations": "6.0",
    "paths": {
      "@features/*": [
        "src/features/*"
      ],
      "@shared/*": [
        "src/shared/*"
      ]
    }
  }
}
