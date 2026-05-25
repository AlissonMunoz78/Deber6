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