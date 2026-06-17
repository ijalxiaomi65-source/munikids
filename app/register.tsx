import { DatePickerModal } from "@/components/DatePickerModal";
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

export default function RegisterScreen() {
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [ttl, setTtl] = useState("");
  const [dateVisible, setDateVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleRegister = async () => {
    setError("");
    if (!nama.trim()) {
      setError("Nama Lengkap tidak boleh kosong!");
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      setError("Password minimal 6 karakter!");
      return;
    }
    if (!ttl) {
      setError("Tanggal Lahir tidak boleh kosong!");
      return;
    }
    setLoading(true);
    try {
      const result = await register(nama.trim(), password.trim(), ttl);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => router.replace("/login"), 1500);
      } else {
        setError(result.msg);
      }
    } catch (e) {
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

        <Text style={styles.subtitle}>
          Teman bunda untuk senyum sehat si kecil setiap hari
        </Text>

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✓ Registrasi Berhasil! Mengalihkan ke halaman login...
            </Text>
          </View>
        ) : (
          <>
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
                  placeholder="Masukan Nama Lengkap"
                  placeholderTextColor="#A9CDDC"
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(""); }}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#A9CDDC"
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>Tanggal Lahir Anak</Text>
              <TouchableOpacity
                style={[styles.inputWrap, !!ttl && styles.inputWrapFilled]}
                onPress={() => setDateVisible(true)}
              >
                <Text style={[styles.input, !ttl && { color: "#A9CDDC" }]}>
                  {ttl || "Klik untuk pilih tanggal lahir"}
                </Text>
              </TouchableOpacity>
              {!ttl && (
                <Text style={styles.hintText}>
                  Format: DD/MM/YYYY (contoh: 15/06/2023)
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.daftarBtn, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.daftarText}>Daftar</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.backText}>Sudah punya akun? Log In</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <DatePickerModal
        visible={dateVisible}
        onClose={() => setDateVisible(false)}
        onSelect={(d) => {
          setTtl(d);
          setDateVisible(false);
          setError("");
        }}
        title="Pilih Tanggal Lahir Anak"
        initialValue={ttl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#fff" },
  scroll: { alignItems: "center", paddingHorizontal: 20 },
  logo: { width: "85%", height: 180, marginBottom: 8 },
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
  successBox: {
    width: "100%",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 15,
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
  inputWrapFilled: {
    borderColor: "#3A9034",
  },
  input: { fontSize: 16, color: "#1a1a2e" },
  hintText: {
    fontSize: 12,
    color: "#A9CDDC",
    marginBottom: 4,
    marginLeft: 4,
  },
  daftarBtn: {
    width: "90%",
    backgroundColor: "#5EA7D3",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14,
    minHeight: 50,
    justifyContent: "center",
  },
  daftarText: {
    fontFamily: "Oswald",
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 1,
  },
  backBtn: { paddingVertical: 10 },
  backText: {
    fontFamily: "Oswald",
    fontSize: 15,
    color: "#297191",
    textDecorationLine: "underline",
  },
});
