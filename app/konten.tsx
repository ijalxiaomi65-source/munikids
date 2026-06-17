import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ── Konten per kategori ────────────────────────────────────────────────
interface KontenItem {
  type: "image" | "heading" | "text" | "tip" | "warning";
  content?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  src?: any;
  caption?: string;
  tall?: boolean;
}

const KONTEN: Record<string, { title: string; color: string; items: KontenItem[] }> = {
  edukasi: {
    title: "Edukasi Imunisasi",
    color: "#297191",
    items: [
      { type: "image", src: require("@/assets/images/Imunisasi_Edukasi.jpg"), caption: "Imunisasi — Perlindungan Kecil, Masa Depan Hebat", tall: true },
      { type: "heading", content: "Mitos vs Fakta" },
      { type: "warning", content: "MITOS: Imunisasi menyebabkan demam tinggi dan berbahaya.\nFAKTA: Demam ringan setelah imunisasi adalah respons normal tubuh yang menandakan sistem imun bekerja." },
      { type: "warning", content: "MITOS: Anak yang sudah sehat tidak perlu imunisasi.\nFAKTA: Imunisasi justru menjaga agar anak tetap sehat dari ancaman penyakit menular." },
      { type: "warning", content: "Sumber: Kementerian Kesehatan Republik Indonesia (KEMENKES RI)" },
      { type: "heading", content: "Jadwal Imunisasi" },
      { type: "image", src: require("@/assets/images/Imunisasi_Dasar.jpg"), caption: "Jadwal Imunisasi Dasar Bayi & Baduta", tall: true },
      { type: "image", src: require("@/assets/images/Jadwal_Lanjutan.jpg"), caption: "Jadwal Imunisasi Lanjutan (Baduta Lengkap)", tall: true },
      { type: "image", src: require("@/assets/images/Imunisasi_Kejar.jpg"), caption: "Imunisasi Kejar — Tidak Perlu Mengulang dari Awal", tall: true },
      { type: "warning", content: "Gunakan fitur Pengingat di aplikasi ini agar tidak terlewat jadwal imunisasi si kecil!\n\nSumber: Kementerian Kesehatan Republik Indonesia (KEMENKES RI)" },
    ],
  },
  tips: {
    title: "Tips Imunisasi",
    color: "#507A93",
    items: [
      { type: "image", src: require("@/assets/images/Tips_1.jpg"), caption: "Tips Imunisasi Anak — Sebelum & Setelah", tall: true },
      { type: "image", src: require("@/assets/images/Tips_2.jpg"), caption: "Cara Penanganan Efek Samping Setelah Imunisasi", tall: true },
      { type: "warning", content: "Efek samping biasanya ringan dan hilang dalam 1–2 hari. Jika keluhan berlanjut atau memburuk, segera hubungi tenaga kesehatan.\n\nSumber: Kementerian Kesehatan Republik Indonesia (KEMENKES RI)" },
    ],
  },
  tumbuhkembang: {
    title: "Edukasi Tumbuh Kembang Anak",
    color: "#3A9034",
    items: [
      { type: "image", src: require("@/assets/images/Tumbang_1.jpg"), caption: "Tahapan Tumbuh Kembang 0–9 Bulan", tall: true },
      { type: "image", src: require("@/assets/images/Tumbang_2.jpg"), caption: "Tahapan Tumbuh Kembang 10 Bulan – 5 Tahun", tall: true },
      { type: "image", src: require("@/assets/images/Tumbang_5.jpg"), caption: "Tinggi & Berat Badan Optimal Anak 0–5 Tahun", tall: true },
      { type: "image", src: require("@/assets/images/Tumbang_3.jpg"), caption: "Tanda Keterlambatan Perkembangan (0–9 Bulan)", tall: true },
      { type: "image", src: require("@/assets/images/Tumbang_4.jpg"), caption: "Tanda Keterlambatan Perkembangan (10 Bulan – 5 Tahun)", tall: true },
      { type: "warning", content: "Jika orang tua menemukan tanda keterlambatan perkembangan pada anak, segera konsultasikan dengan tenaga kesehatan. Deteksi dini mendukung tumbuh kembang optimal!\n\nSumber: IDAI & Buku KIA / Pedoman SDIDTK Kemenkes RI" },
    ],
  },
  mpasi: {
    title: "Asupan Nutrisi & MPASI Sehat",
    color: "#7A3A9A",
    items: [
      { type: "image", src: require("@/assets/images/MPASI_1.jpg"), caption: "Panduan MPASI Sehat untuk Bayi", tall: true },
      { type: "heading", content: "Jadwal Makan Bayi" },
      { type: "tip", content: "6–8 Bulan: 2–3 kali makan utama + ASI sesering mungkin." },
      { type: "tip", content: "9–11 Bulan: 3–4 kali makan utama + 1–2 snack + ASI." },
      { type: "tip", content: "12–23 Bulan: 3–4 kali makan utama + 1–2 snack + ASI/susu." },
      { type: "image", src: require("@/assets/images/MPASI_3.jpg"), caption: "Tips Memberikan MPASI yang Tepat", tall: true },
      { type: "heading", content: "GTM — Gerakan Tutup Mulut pada Anak" },
      { type: "text", content: "GTM adalah kondisi ketika anak menolak makan, memuntahkan makanan, atau sulit makan dalam periode tertentu. Sering terjadi pada bayi dan balita." },
      { type: "image", src: require("@/assets/images/Gtm_1.jpg"), caption: "Apa itu GTM dan Penyebabnya", tall: true },
      { type: "image", src: require("@/assets/images/Gtm_2.jpg"), caption: "Cara Mencegah GTM pada Anak", tall: true },
      { type: "image", src: require("@/assets/images/Gtm_3.jpg"), caption: "Cara Mengatasi GTM", tall: true },
      { type: "warning", content: "Sumber: Kementerian Kesehatan RI & IDAI — Panduan Praktis GTM pada Anak (2022).\n\nSegera konsultasi ke dokter jika GTM berlangsung lebih dari 2 minggu dan berat badan anak tidak naik!" },
    ],
  },
  kebersihan: {
    title: "Menjaga Kebersihan Tubuh Anak",
    color: "#1A7A6A",
    items: [
      { type: "heading", content: "Cuci Tangan" },
      { type: "image", src: require("@/assets/images/Cuci_Tangan_Edukasi.jpg"), caption: "Edukasi Cuci Tangan untuk Anak & Keluarga", tall: true },
      { type: "image", src: require("@/assets/images/Cuci_Tangan_Langkah.jpg"), caption: "6 Langkah Cuci Tangan yang Benar (20 Detik)", tall: true },
      { type: "heading", content: "Memandikan Bayi" },
      { type: "image", src: require("@/assets/images/Mandi_Edukasi.jpg"), caption: "Edukasi Memandikan Bayi", tall: true },
      { type: "image", src: require("@/assets/images/Mandi_Persiapan.jpg"), caption: "Persiapan Sebelum Memandikan Bayi", tall: true },
      { type: "image", src: require("@/assets/images/Mandi_Langkah.jpg"), caption: "8 Langkah Memandikan Bayi dengan Benar", tall: true },
      { type: "heading", content: "Kesehatan Gigi & Mulut" },
      { type: "image", src: require("@/assets/images/Gigi_Perawatan.jpg"), caption: "Perawatan Gigi & Mulut pada Anak", tall: true },
      { type: "image", src: require("@/assets/images/Gigi_Cara_Merawat.jpg"), caption: "Cara Merawat Gigi & Mulut Anak (7 Langkah)", tall: true },
      { type: "image", src: require("@/assets/images/Gigi_Masalah.jpg"), caption: "Tanda Masalah Gigi & Mulut yang Perlu Diwaspadai", tall: true },
      { type: "heading", content: "Toilet Training" },
      { type: "image", src: require("@/assets/images/Toilet_Training_Siap.jpg"), caption: "Tanda Anak Siap Toilet Training", tall: true },
      { type: "image", src: require("@/assets/images/Toilet_Training_Cara.jpg"), caption: "Cara Melatih Toilet Training pada Anak", tall: true },
      { type: "warning", content: "Kebersihan yang baik mendukung efektivitas imunisasi karena tubuh anak lebih kuat melawan penyakit!\n\nSumber: Kemenkes RI — Panduan Perawatan Bayi Sehari-hari & Tips Menjaga Kesehatan Anak" },
    ],
  },
};

export default function KontenScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const data = KONTEN[category ?? ""] ?? KONTEN.edukasi;
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  return (
    <ImageBackground
      source={require("@/assets/images/bgallscreen.jpeg")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {data.title}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {data.items.map((item, i) => {
          if (item.type === "image") {
            if (imgErrors[i]) return null;
            const imgHeight = item.tall
              ? (width - 28) * 2.0
              : (width - 28) * 0.6;
            return (
              <View key={i} style={styles.imgWrap}>
                <Image
                  source={item.src}
                  style={[styles.contentImg, { height: imgHeight }]}
                  resizeMode={item.tall ? "contain" : "cover"}
                  onError={() => setImgErrors((e) => ({ ...e, [i]: true }))}
                />
                {!!item.caption && (
                  <View style={styles.captionBox}>
                    <Text style={styles.captionText}>{item.caption}</Text>
                  </View>
                )}
              </View>
            );
          }

          if (item.type === "heading") {
            return (
              <View key={i} style={[styles.headingBox, { borderLeftColor: data.color }]}>
                <Text style={[styles.headingText, { color: data.color }]}>
                  {item.content}
                </Text>
              </View>
            );
          }

          if (item.type === "text") {
            return (
              <View key={i} style={styles.textBox}>
                <Text style={styles.bodyText}>{item.content}</Text>
              </View>
            );
          }

          if (item.type === "tip") {
            return (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: data.color }]} />
                <Text style={styles.tipText}>{item.content}</Text>
              </View>
            );
          }

          if (item.type === "warning") {
            return (
              <View key={i} style={styles.warningBox}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>{item.content}</Text>
              </View>
            );
          }

          return null;
        })}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D3E8EC",
    paddingBottom: 12,
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginRight: 8,
  },
  backIcon: { fontSize: 22, color: "#297191", fontWeight: "bold" },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#297191",
    fontFamily: "StickyBread",
    textAlign: "center",
  },
  scroll: { paddingHorizontal: 14, paddingTop: 16 },
  imgWrap: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "rgba(253,251,251,0.9)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  contentImg: {
    width: "100%",
  },
  captionBox: {
    backgroundColor: "rgba(41,113,145,0.85)",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  captionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  headingBox: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginBottom: 10,
    marginTop: 8,
    backgroundColor: "rgba(253,251,251,0.8)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingRight: 10,
  },
  headingText: {
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: "StickyBread",
  },
  textBox: {
    backgroundColor: "rgba(253,251,251,0.85)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    color: "#2a2a2a",
    lineHeight: 22,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(253,251,251,0.85)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  tipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    flexShrink: 0,
  },
  tipText: {
    fontSize: 14,
    color: "#2a2a2a",
    lineHeight: 21,
    flex: 1,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,243,205,0.95)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F5C842",
    gap: 10,
  },
  warningIcon: { fontSize: 18 },
  warningText: {
    fontSize: 13,
    color: "#7A5A00",
    lineHeight: 20,
    flex: 1,
    fontWeight: "600",
  },
});
