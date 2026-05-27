import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Stack } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../../components/ui/icon-symbol";

const CORAL = "#A86A5A";
const TEAL = "#7D9BAB";

export default function AppLayout() {
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const isVendedor = user?.role === "vendedor";
  const headerBgColor = isVendedor ? CORAL : TEAL;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: headerBgColor },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800", fontSize: 18 },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "ShopChat",
          headerRight: () => (
            <View style={styles.headerRight}>
              <View style={styles.rolePill}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <IconSymbol
                    name={isVendedor ? "bag.fill" : "cart.fill"}
                    color="#fff"
                    size={12}
                  />
                  <Text style={styles.rolePillText}>
                    {isVendedor ? "Vendedor" : "Cliente"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={logout} activeOpacity={0.7}>
                <Text style={styles.logoutText}>Salir</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen name="chat/[roomId]" options={{ title: "Chat" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 4,
  },
  rolePill: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rolePillText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  logoutText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
