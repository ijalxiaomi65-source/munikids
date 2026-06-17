import { useAuth } from "@/context/AuthContext";
import { ResizeMode, Video } from "expo-av";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const LOGO_DURATION = 2500;

export default function SplashVideoScreen() {
  const router = useRouter();
  const { user, loading: authLoading, reload } = useAuth();
  const [phase, setPhase] = useState<"logo" | "video">("logo");
  const [videoDone, setVideoDone] = useState(false);
  const [starting, setStarting] = useState(false);
  const navigated = useRef(false);
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === "android") {
      try {
        NativeModules.StatusBarManager?.setHidden(true);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (authLoading) return;
    if (navigated.current) return;
    navigated.current = true;
    if (user) router.replace("/home");
    else router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setPhase("video");
      });
    }, LOGO_DURATION);

    return () => clearTimeout(timer);
  }, [logoOpacity]);

  const handleStart = async () => {
    if (navigated.current) return;
    setStarting(true);
    if (reload) await reload();
    navigated.current = true;
    if (user) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  };

  if (Platform.OS === "web") {
    return null;
  }

  if (phase === "logo") {
    return (
      <View style={styles.logoContainer}>
        <StatusBar hidden />
        <Animated.Image
          source={require("@/assets/images/logo-imunikids.jpg")}
          style={[styles.logo, { opacity: logoOpacity }]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Video
        source={require("@/assets/videos/splash.mp4")}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            setVideoDone(true);
          }
        }}
        onError={() => setVideoDone(true)}
      />

      {videoDone && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={[styles.startBtn, starting && { opacity: 0.7 }]}
            onPress={handleStart}
            activeOpacity={0.85}
            disabled={starting}
          >
            {starting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.startText}>Mulai</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.65,
    height: width * 0.65,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 80,
  },
  startBtn: {
    backgroundColor: "#5EA7D3",
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 160,
    alignItems: "center",
  },
  startText: {
    fontFamily: "StickyBread",
    fontSize: 24,
    color: "#fff",
    letterSpacing: 1,
  },
});
