import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLogin = async () => {
    setError("");
    if (!nama.trim()) {
      setError("Nama Lengkap tidak boleh kosong!");
      return;
    }
    if (!password.trim()) {
      setError("Password tidak boleh kosong!");
      return;
    }
    setLoading(true);
    try {
      const ok = await login(nama.trim(), password.trim());
      if (ok) {
        router.replace("/home");
      } else {
        setError("Nama atau Password tidak sesuai!");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad }]}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("@/assets/images/Desain_tanpa_judul_(5).jpg")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.welcome}>Selamat Datang</Text>
        <Text style={styles.subtitle}>
          Teman bunda untuk senyum sehat si kecil setiap hari
        </Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.label}>Nama Lengkap Anak</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={nama}
              onChangeText={(t) => { setNama(t); setError(""); }}
              placeholder="Masukkan Nama Lengkap"
              placeholderTextColor="#A9CDDC"
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={password}
              onChangeText={(t) => { setPassword(t); setError(""); }}
              placeholder="Masukan Password"
              placeholderTextColor="#A9CDDC"
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.loginText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <Text style={styles.noAccount}>Anda belum terdaftar?</Text>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push("/register")}
          activeOpacity={0.8}
        >
          <Text style={styles.registerText}>REGISTER NOW</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#fff" },
  scroll: { alignItems: "center", paddingHorizontal: 20 },
  logo: { width: "85%", height: 180, marginBottom: 8 },
  welcome: {
    fontFamily: "StickyBread",
    fontSize: 28,
    color: "#297191",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "StickyBread",
    fontSize: 15,
    color: "#507A93",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#FDECEA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F5A8A8",
  },
  errorText: {
    color: "#C0392B",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  formCard: {
    width: "100%",
    backgroundColor: "rgba(94,192,211,0.18)",
    borderRadius: 30,
    padding: 20,
    marginBottom: 18,
  },
  label: {
    fontFamily: "Oswald",
    fontSize: 15,
    fontWeight: "bold",
    color: "#297191",
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrap: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#C5DDE8",
  },
  input: { fontSize: 16, color: "#1a1a2e" },
  loginBtn: {
    width: "90%",
    backgroundColor: "#5EA7D3",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14,
    minHeight: 50,
    justifyContent: "center",
  },
  loginText: {
    fontFamily: "Oswald",
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 1,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginBottom: 14,
  },
  orLine: { flex: 1, height: 1, backgroundColor: "#C5DDE8" },
  orText: {
    color: "#A9CDDC",
    fontSize: 13,
    marginHorizontal: 10,
    fontWeight: "bold",
  },
  noAccount: {
    fontFamily: "Oswald",
    fontSize: 15,
    color: "#507A93",
    marginBottom: 10,
  },
  registerBtn: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#5EA7D3",
    marginBottom: 6,
  },
  registerText: {
    fontFamily: "Oswald",
    fontSize: 18,
    fontWeight: "bold",
    color: "#297191",
    letterSpacing: 1,
  },
});
