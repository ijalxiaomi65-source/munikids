import { SideMenu } from "@/components/SideMenu";
import { useAuth } from "@/context/AuthContext";
import { fbGet, fbSet, toUserKey } from "@/context/firebase";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ReminderData {
  vaccine: string;
  date: string;
}

export default function ReminderScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [menuVisible, setMenuVisible] = useState(false);
  const [reminder, setReminder] = useState<ReminderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadReminder();
  }, [user]);

  const loadReminder = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const key = toUserKey(user.nama);
    const data = await fbGet<ReminderData>(`users/${key}/reminder`);
    setReminder(data);
    setLoading(false);
  }, [user]);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    const key = toUserKey(user.nama);
    await fbSet(`users/${key}/reminder`, null);
    setReminder(null);
    setDeleting(false);
    setDeleteSuccess(true);
  };

  if (!user) return null;

  return (
    <ImageBackground
      source={require("@/assets/images/bgallscreen.jpeg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 10, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.menuBtn}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Reminder Imunisasi</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Info Anak */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Anak</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{user.nama}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>TTL</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{user.ttl}</Text>
          </View>
        </View>

        {/* Reminder Content */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#297191" />
            <Text style={styles.loadingText}>Memuat pengingat...</Text>
          </View>
        ) : deleteSuccess ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Pengingat Dihapus</Text>
            <Text style={styles.successSub}>
              Pengingat imunisasi berhasil dihapus.
            </Text>
            <TouchableOpacity
              style={styles.aturBtn}
              onPress={() => router.push("/atur-pengingat")}
            >
              <Text style={styles.aturBtnText}>Buat Pengingat Baru</Text>
            </TouchableOpacity>
          </View>
        ) : reminder ? (
          <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderHeaderText}>Pengingat Aktif</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Aktif</Text>
              </View>
            </View>

            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>Imunisasi</Text>
              <Text style={styles.reminderValue}>{reminder.vaccine}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>Tanggal</Text>
              <Text style={styles.reminderValue}>{reminder.date}</Text>
            </View>

            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push("/atur-pengingat")}
                activeOpacity={0.8}
              >
                <Text style={styles.editBtnText}>Edit Pengingat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
                onPress={handleDelete}
                activeOpacity={0.8}
                disabled={deleting}
              >
                <Text style={styles.deleteBtnText}>
                  {deleting ? "Menghapus..." : "Hapus"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum Ada Pengingat</Text>
            <Text style={styles.emptySub}>
              Atur pengingat imunisasi agar tidak terlewat jadwal penting si kecil.
            </Text>
            <TouchableOpacity
              style={styles.aturBtn}
              onPress={() => router.push("/atur-pengingat")}
              activeOpacity={0.85}
            >
              <Text style={styles.aturBtnText}>Atur Pengingat Sekarang</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/home")}
          activeOpacity={0.85}
        >
          <Text style={styles.backBtnText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </ScrollView>

      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  menuBtn: { padding: 8 },
  menuIcon: { fontSize: 26, color: "#297191" },
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: "StickyBread",
    fontSize: 18,
    color: "#297191",
  },
  infoCard: {
    backgroundColor: "rgba(253,251,251,0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoRow: { flexDirection: "row", marginBottom: 6 },
  infoLabel: {
    fontFamily: "Oswald",
    fontSize: 15,
    fontWeight: "bold",
    color: "#297191",
    width: 80,
  },
  infoColon: { fontSize: 15, color: "#297191", marginHorizontal: 4 },
  infoValue: { fontSize: 15, color: "#1a1a2e", flex: 1 },
  loadingBox: {
    backgroundColor: "rgba(253,251,251,0.75)",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  loadingText: { fontSize: 14, color: "#507A93" },
  reminderCard: {
    backgroundColor: "rgba(253,251,251,0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  reminderHeaderText: {
    fontFamily: "StickyBread",
    fontSize: 17,
    color: "#297191",
  },
  activeBadge: {
    backgroundColor: "#3A9034",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  divider: { height: 1, backgroundColor: "#D3E8EC" },
  reminderLabel: { fontSize: 14, color: "#507A93", fontWeight: "bold" },
  reminderValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1a1a2e",
    textAlign: "right",
    flex: 1,
    marginLeft: 8,
  },
  actionBtns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#5EA7D3",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  editBtnText: {
    fontFamily: "Oswald",
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  deleteBtn: {
    backgroundColor: "#FDECEA",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F5A8A8",
  },
  deleteBtnText: {
    fontFamily: "Oswald",
    fontSize: 15,
    fontWeight: "bold",
    color: "#C0392B",
  },
  emptyCard: {
    backgroundColor: "rgba(253,251,251,0.9)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: "StickyBread",
    fontSize: 18,
    color: "#297191",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: "#507A93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: "rgba(253,251,251,0.9)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 14,
  },
  successIcon: { fontSize: 40, color: "#3A9034", marginBottom: 8 },
  successTitle: {
    fontFamily: "StickyBread",
    fontSize: 20,
    color: "#297191",
    marginBottom: 6,
  },
  successSub: {
    fontSize: 14,
    color: "#507A93",
    textAlign: "center",
    marginBottom: 20,
  },
  aturBtn: {
    backgroundColor: "#297191",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  aturBtnText: {
    fontFamily: "StickyBread",
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  backBtn: {
    backgroundColor: "#3A9034",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  backBtnText: {
    fontFamily: "StickyBread",
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
