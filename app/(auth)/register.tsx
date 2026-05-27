import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Link } from "expo-router";
import LottieView from "lottie-react-native";
import { useState } from "react";
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
} from "react-native";
import { IconSymbol } from "../../components/ui/icon-symbol";

type Role = "cliente" | "vendedor";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("cliente");
  const { register, isLoading, error } = useAuth();

  const handleRegister = () => {
    console.log("ROLE ENVIADO:", role);
    register({ email, password, username, role });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LottieView
            source={require("../../assets/animations/shopchat.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.title}>Crea tu cuenta</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <IconSymbol
                name="exclamationmark.triangle.fill"
                color={CORAL}
                size={16}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        )}

        {/* Roles */}
        <Text style={styles.roleLabel}>¿Cómo quieres usar ShopChat?</Text>

        <View style={styles.roleRow}>
          {/* CLIENTE */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.roleCard,
              role === "cliente" && styles.roleCardActiveTeal,
            ]}
            onPress={() => setRole("cliente")}
          >
            {role === "cliente" && (
              <IconSymbol name="checkmark" color="#00A699" size={14} />
            )}
            <IconSymbol name="cart.fill" color="#00A699" size={28} />
            <Text
              style={[
                styles.roleCardTitle,
                role === "cliente" && { color: "#00A699" },
              ]}
            >
              CLIENTE
            </Text>
            <Text style={styles.roleCardDesc}>Consulta y compra</Text>
          </TouchableOpacity>

          {/* VENDEDOR */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.roleCard,
              role === "vendedor" && styles.roleCardActiveCoral,
            ]}
            onPress={() => setRole("vendedor")}
          >
            {role === "vendedor" && (
              <IconSymbol name="checkmark" color="#FF385C" size={14} />
            )}
            <IconSymbol name="bag.fill" color="#FF385C" size={28} />
            <Text
              style={[
                styles.roleCardTitle,
                role === "vendedor" && { color: "#FF385C" },
              ]}
            >
              VENDEDOR
            </Text>
            <Text style={styles.roleCardDesc}>Vende y atiende</Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <IconSymbol name="person.fill" color="#9A9A9A" size={18} />
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
            <IconSymbol name="envelope.fill" color="#9A9A9A" size={18} />
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
            <IconSymbol name="lock.fill" color="#9A9A9A" size={18} />
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
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        {/* Link login */}
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkBtn}>
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.linkAccent}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CORAL = "#FF385C";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FCFAF8" },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },

  header: { alignItems: "center", marginBottom: 20 },
  lottie: { width: 130, height: 130, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: "800", color: "#222222" },

  errorBox: {
    backgroundColor: "#FFF0F2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: CORAL, fontSize: 13 },

  roleLabel: {
    fontSize: 14,
    color: "#717171",
    fontWeight: "600",
    marginBottom: 12,
  },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#EBEBEB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  roleCardActiveTeal: {
    borderColor: "#00A699",
    backgroundColor: "rgba(0,166,153,0.04)",
  },
  roleCardActiveCoral: {
    borderColor: CORAL,
    backgroundColor: "rgba(255,56,92,0.04)",
  },
  roleCheck: {
    position: "absolute",
    top: 8,
    right: 10,
    fontSize: 13,
    fontWeight: "800",
  },
  roleEmoji: { fontSize: 30, marginBottom: 6 },
  roleCardTitle: { fontSize: 12, fontWeight: "700", color: "#222222" },
  roleCardDesc: { fontSize: 11, color: "#717171", marginTop: 3 },

  form: { marginBottom: 20, gap: 4 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#DDDDDD",
    paddingVertical: 14,
    gap: 12,
  },
  inputIcon: { fontSize: 18, width: 24, textAlign: "center" },
  input: { flex: 1, fontSize: 16, color: "#222222" },

  btnPrimary: {
    backgroundColor: CORAL,
    borderRadius: 100,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  linkBtn: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 14, color: "#717171" },
  linkAccent: { color: CORAL, fontWeight: "700" },
});
