import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

function getYoutubeVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /m\.youtube\.com\/watch\?v=([^&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [playing, setPlaying] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const decodedUrl = url ? decodeURIComponent(url) : "";
  const decodedTitle = title ? decodeURIComponent(title) : "Video";

  const youtubeId = getYoutubeVideoId(decodedUrl);
  const isYoutube = !!youtubeId;

  const openInBrowser = async () => {
    if (decodedUrl) {
      await WebBrowser.openBrowserAsync(decodedUrl, {
        toolbarColor: "#D3E8EC",
        controlsColor: "#297191",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {decodedTitle}
        </Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {Platform.OS === "web" ? (
        <View style={styles.fallback}>
          <Text style={styles.fallbackIcon}>📱</Text>
          <Text style={styles.fallbackTitle}>Buka di HP</Text>
          <Text style={styles.fallbackText}>
            Fitur video hanya tersedia di aplikasi Android/iOS.{"\n"}
            Scan QR code dengan Expo Go untuk menonton.
          </Text>
        </View>
      ) : isYoutube && youtubeId ? (
        <YoutubePlayerNative
          videoId={youtubeId}
          title={decodedTitle}
          playing={playing}
          onEnd={() => setPlaying(false)}
          onOpenBrowser={openInBrowser}
        />
      ) : decodedUrl ? (
        <View style={styles.fallback}>
          <Text style={styles.fallbackIcon}>🌐</Text>
          <Text style={styles.fallbackTitle}>{decodedTitle}</Text>
          <TouchableOpacity style={styles.openBtn} onPress={openInBrowser}>
            <Text style={styles.openBtnText}>Buka di Browser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>URL tidak valid</Text>
        </View>
      )}
    </View>
  );
}

function YoutubePlayerNative({
  videoId,
  title,
  playing,
  onEnd,
  onOpenBrowser,
}: {
  videoId: string;
  title: string;
  playing: boolean;
  onEnd: () => void;
  onOpenBrowser: () => void;
}) {
  let YoutubePlayer: React.ComponentType<{
    height: number;
    width: number;
    videoId: string;
    play: boolean;
    onChangeState: (state: string) => void;
  }> | null = null;

  try {
    YoutubePlayer = require("react-native-youtube-iframe").default;
  } catch {
    YoutubePlayer = null;
  }

  if (!YoutubePlayer) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackIcon}>▶️</Text>
        <Text style={styles.fallbackTitle}>{title}</Text>
        <TouchableOpacity style={styles.openBtn} onPress={onOpenBrowser}>
          <Text style={styles.openBtnText}>Tonton di YouTube</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.youtubeWrap}>
      <YoutubePlayer
        height={width * (9 / 16)}
        width={width}
        videoId={videoId}
        play={playing}
        onChangeState={(state: string) => {
          if (state === "ended") onEnd();
        }}
      />
      <View style={styles.youtubeInfo}>
        <Text style={styles.youtubeTitle} numberOfLines={3}>{title}</Text>
        <TouchableOpacity style={styles.openBtn} onPress={onOpenBrowser}>
          <Text style={styles.openBtnText}>Buka di YouTube</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D3E8EC",
    paddingBottom: 10,
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
    backgroundColor: "rgba(255,255,255,0.3)",
    marginRight: 6,
  },
  backIcon: { fontSize: 20, color: "#297191", fontWeight: "bold" },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: "#297191",
    textAlign: "center",
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginLeft: 6,
  },
  closeIcon: { fontSize: 16, color: "#297191", fontWeight: "bold" },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },
  fallbackIcon: { fontSize: 56 },
  fallbackTitle: { fontSize: 18, fontWeight: "bold", color: "#297191", textAlign: "center" },
  fallbackText: { fontSize: 14, color: "#507A93", textAlign: "center", lineHeight: 22 },
  openBtn: {
    marginTop: 8,
    backgroundColor: "#FF0000",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  openBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  youtubeWrap: { flex: 1, backgroundColor: "#0f0f0f" },
  youtubeInfo: {
    padding: 16,
    gap: 10,
    backgroundColor: "#fff",
    alignItems: "flex-start",
  },
  youtubeTitle: { fontSize: 15, fontWeight: "700", color: "#1a1a2e", lineHeight: 22 },
});
