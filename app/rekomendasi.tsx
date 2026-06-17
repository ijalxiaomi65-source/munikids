import { SideMenu } from "@/components/SideMenu";
import { useAuth } from "@/context/AuthContext";
import { fbGet, toUserKey } from "@/context/firebase";
import {
  VACCINE_SCHEDULE,
  calculateAge,
  getAgeInMonths,
  getScheduledDate,
} from "@/constants/vaccines";
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

export default function RekomendasiScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [menuVisible, setMenuVisible] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [lastImunDate, setLastImunDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    const key = toUserKey(user.nama);
    const [checklistData, imunDate] = await Promise.all([
      fbGet<Record<string, boolean>>(`users/${key}/checklist`),
      fbGet<string>(`users/${key}/lastImunDate`),
    ]);
    if (checklistData) setChecklist(checklistData);
    if (imunDate) setLastImunDate(imunDate);
    setLoading(false);
  }, [user]);

  if (!user) return null;

  const age = calculateAge(user.ttl);
  const ageMonths = getAgeInMonths(user.ttl);

  const upcoming = VACCINE_SCHEDULE.filter(
    (v) => !checklist[v.name] && v.ageMonths >= ageMonths
  ).slice(0, 5);

  const nextVaccine = upcoming[0] ?? null;
  const nextDate = nextVaccine
    ? getScheduledDate(user.ttl, nextVaccine.ageMonths)
    : "-";

  interface VaccineInfo {
    desc: string;
    tepat: string;
    diperbolehkan?: string;
    kejar?: string;
  }

  const vaccineInfoMap: Record<string, VaccineInfo> = {
    "Hepatitis B": {
      desc: "Vaksin ini penting untuk mencegah penyakit hepatitis B dan kanker hati.",
      tepat: "0 bulan (< 24 jam setelah lahir)",
    },
    "BCG": {
      desc: "Vaksin ini penting untuk mencegah penyakit TBC.",
      tepat: "0 - 1 bulan",
      diperbolehkan: "2 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Polio Tetes 1": {
      desc: "Vaksin ini penting untuk mencegah polio yang menyebabkan lumpuh layu pada tungkai dan atau lengan.",
      tepat: "0 - 1 bulan",
      diperbolehkan: "2 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "DPT-HB-HiB 1": {
      desc: "Vaksin untuk mencegah difteri, pertusis, tetanus, hepatitis B, dan infeksi Hib.",
      tepat: "2 bulan",
      diperbolehkan: "3 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Polio Tetes 2": {
      desc: "Dosis lanjutan polio untuk perlindungan optimal.",
      tepat: "2 bulan",
      diperbolehkan: "3 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Rotavirus (RV 1)": {
      desc: "Vaksin untuk mencegah diare berat akibat rotavirus pada bayi.",
      tepat: "2 bulan",
      diperbolehkan: "3 - 6 bulan",
      kejar: "12 - 59 bulan",
    },
    "PCV 1": {
      desc: "Vaksin untuk mencegah infeksi pneumokokus penyebab pneumonia dan meningitis.",
      tepat: "2 bulan",
      diperbolehkan: "3 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "DPT-HB-HiB 2": {
      desc: "Dosis lanjutan DPT-HB-HiB untuk memperkuat kekebalan.",
      tepat: "3 bulan",
      diperbolehkan: "4 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Polio Tetes 3": {
      desc: "Dosis lanjutan polio untuk perlindungan optimal.",
      tepat: "3 bulan",
      diperbolehkan: "4 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Rotavirus (RV 2)": {
      desc: "Dosis kedua rotavirus untuk perlindungan lebih kuat terhadap diare berat.",
      tepat: "3 bulan",
      diperbolehkan: "4 - 6 bulan",
      kejar: "12 - 59 bulan",
    },
    "PCV 2": {
      desc: "Dosis lanjutan PCV untuk memperkuat perlindungan dari infeksi pneumokokus.",
      tepat: "3 bulan",
      diperbolehkan: "4 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "DPT-HB-HiB 3": {
      desc: "Dosis ketiga DPT-HB-HiB untuk perlindungan penuh.",
      tepat: "4 bulan",
      diperbolehkan: "5 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Polio Tetes 4": {
      desc: "Dosis terakhir polio tetes sebelum booster.",
      tepat: "4 bulan",
      diperbolehkan: "5 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Polio Suntik (IPV 1)": {
      desc: "Vaksin polio suntik untuk melengkapi perlindungan dari semua jenis virus polio.",
      tepat: "4 bulan",
      diperbolehkan: "5 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Rotavirus (RV 3)": {
      desc: "Dosis terakhir rotavirus untuk perlindungan optimal terhadap diare berat.",
      tepat: "4 bulan",
      diperbolehkan: "5 - 6 bulan",
      kejar: "12 - 59 bulan",
    },
    "Campak-Rubella (MR)": {
      desc: "Vaksin untuk mencegah campak dan rubela.",
      tepat: "9 bulan",
      diperbolehkan: "10 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Polio Suntik (IPV 2)": {
      desc: "Dosis kedua polio suntik untuk melengkapi perlindungan polio.",
      tepat: "9 bulan",
      diperbolehkan: "10 - 11 bulan",
      kejar: "12 - 59 bulan",
    },
    "Japanese Encephalitis (JE)": {
      desc: "Vaksin untuk mencegah radang otak akibat virus Japanese Encephalitis.",
      tepat: "10 bulan",
      kejar: "11 - 59 bulan",
    },
    "PCV 3": {
      desc: "Dosis booster PCV untuk perlindungan jangka panjang dari infeksi pneumokokus.",
      tepat: "12 bulan",
      diperbolehkan: "18 - 23 bulan",
      kejar: "24 - 59 bulan",
    },
    "DPT-HB-HiB Lanjutan": {
      desc: "Dosis booster DPT-HB-HiB untuk memperpanjang perlindungan.",
      tepat: "18 bulan",
      diperbolehkan: "23 bulan",
      kejar: "24 - 59 bulan",
    },
    "Campak-Rubella (MR) Lanjutan": {
      desc: "Dosis booster vaksin campak-rubella untuk perlindungan jangka panjang.",
      tepat: "18 bulan",
      diperbolehkan: "23 bulan",
      kejar: "24 - 59 bulan",
    },
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.menuBtn}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Informasi Jadwal Imunisasi</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Bayi</Text>
            <Text style={styles.infoValue}>{user.nama}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRowSplit}>
            <Text style={styles.infoLabel}>Tanggal Lahir</Text>
            <Text style={styles.infoValueRight}>{user.ttl}</Text>
          </View>
          <View style={styles.infoRowSplit}>
            <Text style={styles.infoLabel}>Umur</Text>
            <Text style={styles.infoValueRight}>{age}</Text>
          </View>
          <View style={styles.infoRowSplit}>
            <Text style={styles.infoLabel}>Terakhir Imunisasi</Text>
            <Text style={styles.infoValueRight}>{lastImunDate || "-"}</Text>
          </View>
        </View>

        <View style={styles.rekomCard}>
          <Text style={styles.rekomTitle}>Rekomendasi Vaksin Berikutnya:</Text>
          <Text style={styles.rekomSubtitle}>
            Si kecil sudah tumbuh semakin kuat! Berdasarkan usianya, vaksin berikutnya yang dianjurkan adalah:
          </Text>

          {loading ? (
            <Text style={styles.loadingText}>Memuat...</Text>
          ) : upcoming.length === 0 ? (
            <Text style={styles.doneText}>Semua vaksin sudah selesai!</Text>
          ) : (
            upcoming.map((v, i) => {
              const info = vaccineInfoMap[v.name];
              return (
                <View key={i} style={styles.vaccineItem}>
                  <Text style={styles.vaccineName}>• {v.name}</Text>
                  <View style={styles.descBox}>
                    <Text style={styles.descText}>
                      {info?.desc ?? "Vaksin penting untuk kesehatan si kecil."}
                    </Text>
                  </View>
                  <Text style={styles.ageLabel}>
                    Usia Tepat Pemberian Imunisasi:{" "}
                    <Text style={styles.ageValue}>{info?.tepat ?? v.label}</Text>
                  </Text>
                  {info?.diperbolehkan && (
                    <Text style={styles.ageLabelOrange}>
                      Usia Masih Diperbolehkan:{" "}
                      <Text style={styles.ageValueOrange}>{info.diperbolehkan}</Text>
                    </Text>
                  )}
                  {info?.kejar && (
                    <Text style={styles.ageLabelKejar}>
                      Usia Pemberian Imunisasi yang Belum Lengkap (Imunisasi Kejar):{" "}
                      <Text style={styles.ageValueKejar}>{info.kejar}</Text>
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.nextDateCard}>
          <Text style={styles.nextDateLabel}>Tanggal Imunisasi Berikutnya</Text>
          <Text style={styles.nextDateValue}>{nextDate}</Text>
        </View>

        <TouchableOpacity
          style={styles.aturBtn}
          onPress={() => router.push("/atur-pengingat")}
          activeOpacity={0.85}
        >
          <Text style={styles.aturBtnText}>Atur Pengingat</Text>
        </TouchableOpacity>

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
    backgroundColor: "rgba(253,251,251,0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoRowSplit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: "#507A93",
    fontWeight: "bold",
    flex: 1,
  },
  infoValue: { fontSize: 14, color: "#1a1a2e", flex: 2 },
  infoValueRight: { fontSize: 14, color: "#1a1a2e", textAlign: "right" },
  infoDivider: {
    height: 1,
    backgroundColor: "#D3E8EC",
    marginVertical: 8,
  },
  rekomCard: {
    backgroundColor: "rgba(253,251,251,0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rekomTitle: {
    fontFamily: "StickyBread",
    fontSize: 17,
    color: "#297191",
    marginBottom: 6,
  },
  rekomSubtitle: {
    fontSize: 13,
    color: "#507A93",
    marginBottom: 14,
    lineHeight: 18,
  },
  loadingText: { color: "#507A93", textAlign: "center", padding: 10 },
  doneText: {
    color: "#3A9034",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
  },
  vaccineItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D3E8EC",
  },
  vaccineName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  descBox: {
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  descText: { fontSize: 13, color: "#5a4a00", lineHeight: 18 },
  ageLabel: { fontSize: 13, color: "#1a1a2e", marginBottom: 3 },
  ageValue: { fontWeight: "bold" },
  ageLabelOrange: { fontSize: 13, color: "#B8520B", marginBottom: 3 },
  ageValueOrange: { fontWeight: "bold" },
  ageLabelKejar: { fontSize: 12, color: "#7A3A9A", marginBottom: 3, lineHeight: 18 },
  ageValueKejar: { fontWeight: "bold" },
  nextDateCard: {
    backgroundColor: "rgba(253,251,251,0.9)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextDateLabel: {
    fontSize: 14,
    color: "#507A93",
    fontWeight: "bold",
    flex: 1,
  },
  nextDateValue: {
    fontSize: 14,
    color: "#297191",
    fontWeight: "bold",
  },
  aturBtn: {
    backgroundColor: "#297191",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  aturBtnText: {
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
});
