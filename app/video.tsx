import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
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

const CATEGORIES = ["Semua", "Imunisasi", "Tumbuh Kembang", "MPASI & GTM"];

const VIDEOS = [
  {
    id: "SKrokoo0iVo",
    title: "Imunisasi Dasar Lengkap",
    channel: "Agus Fitriangga",
    category: "Imunisasi",
    url: "https://youtu.be/SKrokoo0iVo",
  },
  {
    id: "wybpCVQg9E0",
    title: "Jenis-jenis Vaksin untuk Bayi dan Anak",
    channel: "Teman Bumil dan Parenting",
    category: "Imunisasi",
    url: "https://youtu.be/wybpCVQg9E0",
  },
  {
    id: "qv2PsFCvzeg",
    title: "Pentingnya Imunisasi Dasar Lengkap",
    channel: "Puskesmas Kecamatan Koja",
    category: "Imunisasi",
    url: "https://youtu.be/qv2PsFCvzeg",
  },
  {
    id: "w-9j6gs8s14",
    title: "8 Tips Persiapan Toilet Training",
    channel: "HappyKidsParenting",
    category: "Tumbuh Kembang",
    url: "https://youtu.be/w-9j6gs8s14",
  },
  {
    id: "stjPEWJALrc",
    title: "5 Kebiasaan yang Bikin Anak GTM",
    channel: "HappyKidsParenting",
    category: "MPASI & GTM",
    url: "https://youtu.be/stjPEWJALrc",
  },
  {
    id: "6gmyVplB6ko",
    title: "Cara Membaca Grafik Berat Badan WHO",
    channel: "HappyKidsParenting",
    category: "Tumbuh Kembang",
    url: "https://youtu.be/6gmyVplB6ko",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Imunisasi: "#5EA7D3",
  "Tumbuh Kembang": "#3A9034",
  "MPASI & GTM": "#E07C3A",
};

export default function VideoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filtered =
    activeCategory === "Semua"
      ? VIDEOS
      : VIDEOS.filter((v) => v.category === activeCategory);

  const openVideo = async (video: (typeof VIDEOS)[0]) => {
    if (Platform.OS === "web") {
      router.push({
        pathname: "/webview",
        params: {
          url: encodeURIComponent(video.url),
          title: encodeURIComponent(video.title),
        },
      });
      return;
    }
    await WebBrowser.openBrowserAsync(video.url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      toolbarColor: "#D3E8EC",
      controlsColor: "#297191",
    });
  };

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
        <Text style={styles.headerTitle}>🎬 Video Edukasi</Text>
        <TouchableOpacity
          style={styles.ytBtn}
          onPress={() =>
            router.push({
              pathname: "/webview",
              params: {
                url: encodeURIComponent("https://m.youtube.com"),
                title: encodeURIComponent("Cari Video di YouTube"),
              },
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.ytIcon}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Kategori */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                activeCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeCategory === cat && styles.filterChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Jumlah video */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filtered.length} video tersedia
        </Text>
      </View>

      {/* Daftar Video */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((video) => (
          <TouchableOpacity
            key={video.id}
            style={styles.card}
            onPress={() => openVideo(video)}
            activeOpacity={0.88}
          >
            {/* Thumbnail */}
            <View style={styles.thumbWrapper}>
              <Image
                source={{
                  uri: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
                }}
                style={styles.thumb}
                resizeMode="cover"
              />
              {/* Play button overlay */}
              <View style={styles.playOverlay}>
                <View style={styles.playCircle}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </View>
              {/* Category badge */}
              <View
                style={[
                  styles.badge,
                  { backgroundColor: CATEGORY_COLORS[video.category] ?? "#5EA7D3" },
                ]}
              >
                <Text style={styles.badgeText}>{video.category}</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {video.title}
              </Text>
              <View style={styles.channelRow}>
                <Text style={styles.channelIcon}>📺</Text>
                <Text style={styles.channelName} numberOfLines={1}>
                  {video.channel}
                </Text>
              </View>
              <Text style={styles.tapHint}>Tap untuk menonton</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const THUMB_H = (width - 32) * (9 / 16);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D3E8EC",
    paddingBottom: 12,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  ytBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF0000",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ytIcon: { fontSize: 14, color: "#fff", marginLeft: 2 },
  backIcon: { fontSize: 20, color: "#297191", fontWeight: "bold" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#297191",
    fontFamily: "StickyBread",
  },
  filterWrapper: {
    backgroundColor: "#D3E8EC",
    paddingBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "#5EA7D3",
  },
  filterChipActive: {
    backgroundColor: "#297191",
    borderColor: "#297191",
  },
  filterChipText: {
    fontSize: 13,
    color: "#297191",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  countRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 13,
    color: "#507A93",
    fontStyle: "italic",
  },
  list: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbWrapper: {
    width: "100%",
    height: THUMB_H,
    backgroundColor: "#000",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  playIcon: { fontSize: 22, color: "#297191" },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "700",
  },
  cardInfo: {
    padding: 12,
    gap: 4,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
    lineHeight: 20,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  channelIcon: { fontSize: 12 },
  channelName: {
    fontSize: 12,
    color: "#507A93",
    flex: 1,
  },
  tapHint: {
    fontSize: 11,
    color: "#5EA7D3",
    fontWeight: "600",
    marginTop: 4,
  },
});
