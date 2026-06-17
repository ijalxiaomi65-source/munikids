import { DateTimePickerModal } from "@/components/DateTimePickerModal";
import { SideMenu } from "@/components/SideMenu";
import { useAuth } from "@/context/AuthContext";
import { fbSet, toUserKey } from "@/context/firebase";
import {
  requestNotificationPermission,
  scheduleReminderNotification,
} from "@/context/notifications";
import { VACCINE_SCHEDULE } from "@/constants/vaccines";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AturPengingatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState("");
  const [vaccinePickerVisible, setVaccinePickerVisible] = useState(false);
  const [jadwal, setJadwal] = useState("");
  const [dateTimeVisible, setDateTimeVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatDisplay = (dt: string) => {
    if (!dt) return "";
    const MONTHS = [
      "Jan","Feb","Mar","Apr","Mei","Jun",
      "Jul","Agu","Sep","Okt","Nov","Des",
    ];
    const datePart = dt.substring(0, 10);
    const timePart = dt.length >= 19 ? dt.substring(11, 19) : "";
    const dp = datePart.split("/");
    if (dp.length === 3) {
      const d = dp[0];
      const m = parseInt(dp[1], 10);
      const y = dp[2];
      const monthName = MONTHS[m - 1] ?? dp[1];
      if (timePart) {
        return `${d} ${monthName} ${y}, ${timePart}`;
      }
      return `${d} ${monthName} ${y}`;
    }
    return dt;
  };

  const handleSave = async () => {
    if (!selectedVaccine) {
      setError("Pilih jenis imunisasi terlebih dahulu!");
      return;
    }
    if (!jadwal) {
      setError("Pilih tanggal & waktu jadwal terlebih dahulu!");
      return;
    }
    if (!user) return;
    setError("");
    setSaving(true);
    const key = toUserKey(user.nama);
    const reminder = { vaccine: selectedVaccine, date: jadwal };
    const ok = await fbSet(`users/${key}/reminder`, reminder);
    if (ok) {
      const granted = await requestNotificationPermission();
      if (granted) {
        const result = await scheduleReminderNotification(selectedVaccine, jadwal);
        if (result) {
          if (result.immediate) {
            setSuccess(
              `Pengingat berhasil disimpan!\n${selectedVaccine}\n${formatDisplay(jadwal)}\n\n🔔 Waktu sudah tiba! Alarm akan berbunyi sebentar lagi...`
            );
          } else {
            setSuccess(
              `Pengingat berhasil disimpan!\n${selectedVaccine}\n\n🔔 Alarm dijadwalkan pada:\n${formatDisplay(jadwal)}`
            );
          }
        } else {
          setSuccess(`Pengingat berhasil disimpan!\n${selectedVaccine}`);
        }
      } else {
        setSuccess(
          `Pengingat berhasil disimpan!\n${selectedVaccine}\n\n⚠️ Aktifkan izin notifikasi di pengaturan agar alarm berbunyi.`
        );
      }
    } else {
      setError("Gagal menyimpan. Periksa koneksi internet!");
    }
    setSaving(false);
  };

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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.menuBtn}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Atur Pengingat</Text>
          <View style={{ width: 44 }} />
        </View>

        {user && (
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
        )}

        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Jenis Imunisasi</Text>
          <TouchableOpacity
            style={[styles.picker, !!selectedVaccine && styles.pickerFilled]}
            onPress={() => setVaccinePickerVisible(true)}
          >
            <Text style={[styles.pickerText, !selectedVaccine && { color: "#A9CDDC" }]}>
              {selectedVaccine || "Pilih imunisasi..."}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>

          <Text style={[styles.formLabel, { marginTop: 16 }]}>
            Tanggal & Waktu Jadwal
          </Text>
          <TouchableOpacity
            style={[styles.picker, !!jadwal && styles.pickerFilled]}
            onPress={() => setDateTimeVisible(true)}
          >
            <Text style={[styles.pickerText, !jadwal && { color: "#A9CDDC" }]}>
              {jadwal ? formatDisplay(jadwal) : "Pilih tanggal & waktu..."}
            </Text>
            <Text style={styles.pickerArrow}>⏰</Text>
          </TouchableOpacity>
          <Text style={styles.hintText}>
            Atur tanggal, bulan, tahun, jam, menit, dan detik kapan alarm berbunyi
          </Text>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!!success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        {!success && (
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Menyimpan..." : "Simpan Pengingat"}
            </Text>
          </TouchableOpacity>
        )}

        {!!success && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              setSuccess("");
              setSelectedVaccine("");
              setJadwal("");
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Atur Pengingat Baru</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/home")}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Vaccine Picker Modal */}
      <Modal
        visible={vaccinePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVaccinePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Pilih Imunisasi</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {VACCINE_SCHEDULE.map((v, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.vaccineOption,
                    selectedVaccine === v.name && styles.vaccineOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedVaccine(v.name);
                    setVaccinePickerVisible(false);
                    setError("");
                  }}
                >
                  <Text
                    style={[
                      styles.vaccineOptionText,
                      selectedVaccine === v.name && { color: "#fff" },
                    ]}
                  >
                    {v.name}
                  </Text>
                  <Text
                    style={[
                      styles.vaccineOptionAge,
                      selectedVaccine === v.name && { color: "rgba(255,255,255,0.8)" },
                    ]}
                  >
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setVaccinePickerVisible(false)}
            >
              <Text style={styles.closeModalText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        visible={dateTimeVisible}
        onClose={() => setDateTimeVisible(false)}
        onSelect={(dt) => {
          setJadwal(dt);
          setDateTimeVisible(false);
          setError("");
        }}
        title="Atur Tanggal & Waktu Alarm"
        initialValue={jadwal}
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
  formCard: {
    backgroundColor: "rgba(253,251,251,0.75)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  formLabel: {
    fontFamily: "Oswald",
    fontSize: 15,
    fontWeight: "bold",
    color: "#297191",
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#C5DDE8",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerFilled: {
    borderColor: "#3A9034",
  },
  pickerText: { fontSize: 15, color: "#1a1a2e", flex: 1 },
  pickerArrow: { fontSize: 16, color: "#507A93" },
  hintText: {
    fontSize: 12,
    color: "#A9CDDC",
    marginTop: 6,
    marginLeft: 2,
  },
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
  successBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 22,
  },
  saveBtn: {
    backgroundColor: "#297191",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  saveBtnText: {
    fontFamily: "StickyBread",
    fontSize: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontFamily: "StickyBread",
    fontSize: 18,
    color: "#297191",
    textAlign: "center",
    marginBottom: 14,
  },
  vaccineOption: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F0F8FF",
  },
  vaccineOptionSelected: {
    backgroundColor: "#297191",
  },
  vaccineOptionText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 2,
  },
  vaccineOptionAge: {
    fontSize: 12,
    color: "#507A93",
  },
  closeModalBtn: {
    marginTop: 14,
    backgroundColor: "#5EA7D3",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeModalText: {
    fontFamily: "StickyBread",
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
