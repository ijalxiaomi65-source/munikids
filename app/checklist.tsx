import { DatePickerModal } from "@/components/DatePickerModal";
import { SideMenu } from "@/components/SideMenu";
import { useAuth } from "@/context/AuthContext";
import { fbGet, fbSet, toUserKey } from "@/context/firebase";
import { VACCINE_SCHEDULE } from "@/constants/vaccines";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChecklistScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [menuVisible, setMenuVisible] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [imunDate, setImunDate] = useState("");
  const [imunDateVisible, setImunDateVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadChecklist();
  }, [user]);

  const loadChecklist = useCallback(async () => {
    if (!user) return;
    const key = toUserKey(user.nama);
    const data = await fbGet<Record<string, boolean>>(
      `users/${key}/checklist`
    );
    if (data) setChecklist(data);
  }, [user]);

  const toggleVaccine = (name: string) => {
    setChecklist((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setError("");
    setSaving(true);
    const key = toUserKey(user.nama);
    const ok = await fbSet(`users/${key}/checklist`, checklist);
    if (imunDate) {
      await fbSet(`users/${key}/lastImunDate`, imunDate);
    }
    setSaving(false);
    if (ok) {
      router.replace("/rekomendasi");
    } else {
      setError("Gagal menyimpan. Periksa koneksi internet!");
    }
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
          <Text style={styles.topTitle}>Ceklis Jadwal Imunisasi</Text>
          <View style={{ width: 44 }} />
        </View>

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

        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>Tanggal Imunisasi</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setImunDateVisible(true)}
          >
            <Text style={[styles.dateValue, !imunDate && { color: "#A9CDDC" }]}>
              {imunDate || "Pilih tanggal imunisasi terakhir"}
            </Text>
            <Text style={styles.calIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Daftar Imunisasi</Text>
          {VACCINE_SCHEDULE.map((vaccine, i) => (
            <TouchableOpacity
              key={i}
              style={styles.vaccineRow}
              onPress={() => toggleVaccine(vaccine.name)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  checklist[vaccine.name] && styles.checkboxChecked,
                ]}
              >
                {checklist[vaccine.name] && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>
              <View style={styles.vaccineInfo}>
                <Text style={styles.vaccineName}>{vaccine.name}</Text>
                <Text style={styles.vaccineAge}>{vaccine.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Menyimpan..." : "Simpan & Atur Pengingat →"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <DatePickerModal
        visible={imunDateVisible}
        onClose={() => setImunDateVisible(false)}
        onSelect={(d) => {
          setImunDate(d);
          setImunDateVisible(false);
        }}
        title="Tanggal Imunisasi"
      />

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
  dateCard: {
    backgroundColor: "rgba(253,251,251,0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  dateLabel: {
    fontFamily: "Oswald",
    fontSize: 15,
    fontWeight: "bold",
    color: "#297191",
    marginBottom: 8,
  },
  datePicker: {
    borderWidth: 1,
    borderColor: "#C5DDE8",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateValue: { fontSize: 15, color: "#1a1a2e", flex: 1 },
  calIcon: { fontSize: 18 },
  listCard: {
    backgroundColor: "rgba(253,251,251,0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  listTitle: {
    fontFamily: "StickyBread",
    fontSize: 17,
    color: "#297191",
    marginBottom: 12,
  },
  vaccineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF7FC",
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#5EA7D3",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#3A9034",
    borderColor: "#3A9034",
  },
  checkMark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  vaccineInfo: { flex: 1 },
  vaccineName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 2,
  },
  vaccineAge: { fontSize: 12, color: "#507A93" },
  errorBox: {
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
  saveBtn: {
    backgroundColor: "#297191",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: "StickyBread",
    fontSize: 17,
    color: "#fff",
    fontWeight: "bold",
  },
});
