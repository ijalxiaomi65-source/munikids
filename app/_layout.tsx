import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { fbGet, toUserKey } from "@/context/firebase";
import {
  cancelAllReminders,
  registerNotificationCategories,
  requestNotificationPermission,
  scheduleReminderNotification,
} from "@/context/notifications";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

async function askNotifPermissionOnce() {
  if (Platform.OS === "web") return;
  try {
    const asked = await AsyncStorage.getItem("@imunikids_notif_asked");
    if (!asked) {
      await requestNotificationPermission();
      await AsyncStorage.setItem("@imunikids_notif_asked", "1");
    }
  } catch {}
}

// Global sound ref accessible across renders
let globalAlarmSound: Audio.Sound | null = null;

async function startAlarmLoop() {
  if (Platform.OS === "web") return;
  try {
    // Stop any existing alarm first
    await stopAlarmLoop();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/audio/alarm.mp3"),
      { shouldPlay: true, volume: 1.0, isLooping: true }
    );
    globalAlarmSound = sound;
  } catch {}
}

async function stopAlarmLoop() {
  if (Platform.OS === "web") return;
  try {
    if (globalAlarmSound) {
      await globalAlarmSound.stopAsync();
      await globalAlarmSound.unloadAsync();
      globalAlarmSound = null;
    }
  } catch {}
}

function AlarmOverlay({
  visible,
  vaccine,
  onStop,
}: {
  visible: boolean;
  vaccine: string;
  onStop: () => void;
}) {
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onStop}
    >
      <View style={overlayStyles.bg}>
        <View style={overlayStyles.card}>
          <Text style={overlayStyles.icon}>💉</Text>
          <Text style={overlayStyles.title}>Pengingat Imunisasi!</Text>
          <Text style={overlayStyles.vaccine}>{vaccine}</Text>
          <Text style={overlayStyles.body}>
            Segera bawa si kecil ke posyandu atau fasilitas kesehatan terdekat.
          </Text>
          <TouchableOpacity style={overlayStyles.stopBtn} onPress={onStop} activeOpacity={0.85}>
            <Text style={overlayStyles.stopText}>⏹ Matikan Alarm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function NotificationRecaller() {
  const { user } = useAuth();
  const [alarmVisible, setAlarmVisible] = useState(false);
  const [alarmVaccine, setAlarmVaccine] = useState("");
  const foregroundSub = useRef<Notifications.EventSubscription | null>(null);
  const responseSub = useRef<Notifications.EventSubscription | null>(null);

  const stopAlarm = async () => {
    await stopAlarmLoop();
    setAlarmVisible(false);
    await Notifications.dismissAllNotificationsAsync().catch(() => {});
  };

  useEffect(() => {
    if (Platform.OS === "web") return;

    registerNotificationCategories();

    // Foreground: notification arrives while app is open
    foregroundSub.current = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const data = notification.request.content.data as Record<string, string> | undefined;
        if (data?.type === "ALARM") {
          const vax = data.vaccine ?? "Imunisasi";
          setAlarmVaccine(vax);
          setAlarmVisible(true);
          await startAlarmLoop();
        }
      }
    );

    // Response: user taps notification or action button (works from lock screen too)
    responseSub.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const data = response.notification.request.content.data as Record<string, string> | undefined;
        const actionId = response.actionIdentifier;

        if (data?.type === "ALARM") {
          if (
            actionId === "STOP_ALARM" ||
            actionId === Notifications.DEFAULT_ACTION_IDENTIFIER
          ) {
            const vax = data.vaccine ?? "Imunisasi";
            setAlarmVaccine(vax);
            setAlarmVisible(true);
            await startAlarmLoop();
          }
        }
      }
    );

    return () => {
      foregroundSub.current?.remove();
      responseSub.current?.remove();
    };
  }, []);

  // Recall saved reminder when user logs in
  useEffect(() => {
    if (!user) return;
    (async () => {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      const key = toUserKey(user.nama);
      const reminder = await fbGet<{ vaccine: string; date: string }>(
        `users/${key}/reminder`
      );
      if (reminder?.vaccine && reminder?.date) {
        await scheduleReminderNotification(reminder.vaccine, reminder.date);
      }
    })();
  }, [user]);

  return (
    <AlarmOverlay
      visible={alarmVisible}
      vaccine={alarmVaccine}
      onStop={stopAlarm}
    />
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false, animation: "none" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="home" />
      <Stack.Screen name="reminder" />
      <Stack.Screen name="checklist" />
      <Stack.Screen name="atur-pengingat" />
      <Stack.Screen name="rekomendasi" />
      <Stack.Screen name="webview" />
      <Stack.Screen name="konten" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    StickyBread: require("../assets/fonts/StickyBread.otf"),
    Oswald: require("../assets/fonts/Oswald.otf"),
    Chocolate: require("../assets/fonts/Chocolate.otf"),
  });

  useEffect(() => {
    askNotifPermissionOnce();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <NotificationRecaller />
              <RootLayoutNav />
            </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const overlayStyles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  icon: { fontSize: 56, marginBottom: 12 },
  title: {
    fontFamily: "StickyBread",
    fontSize: 24,
    color: "#297191",
    textAlign: "center",
    marginBottom: 8,
  },
  vaccine: {
    fontFamily: "Oswald",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: "#507A93",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  stopBtn: {
    backgroundColor: "#E74C3C",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  stopText: {
    fontFamily: "StickyBread",
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});
