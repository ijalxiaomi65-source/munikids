import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

const CHANNEL_ID = "imunisasi-reminder";

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.deleteNotificationChannelAsync(CHANNEL_ID).catch(() => {});
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Pengingat Imunisasi",
    importance: Notifications.AndroidImportance.MAX,
    sound: "alarm.mp3",
    vibrationPattern: [0, 500, 300, 500, 300, 500],
    lightColor: "#297191",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
    enableVibrate: true,
    showBadge: true,
  });
}

// Register a "STOP_ALARM" action category so user can dismiss from notification
export async function registerNotificationCategories() {
  if (Platform.OS === "web") return;
  await Notifications.setNotificationCategoryAsync("ALARM_CATEGORY", [
    {
      identifier: "STOP_ALARM",
      buttonTitle: "⏹ Matikan Alarm",
      options: { isDestructive: false, isAuthenticationRequired: false },
    },
  ]);
}

function parseDateTimeStr(dateStr: string): Date | null {
  const spaceIdx = dateStr.indexOf(" ");
  const datePart = spaceIdx !== -1 ? dateStr.substring(0, spaceIdx) : dateStr;
  const timePart = spaceIdx !== -1 ? dateStr.substring(spaceIdx + 1) : "08:00:00";

  const dp = datePart.split("/");
  if (dp.length !== 3) return null;

  const dd = parseInt(dp[0], 10);
  const mm = parseInt(dp[1], 10);
  const yyyy = parseInt(dp[2], 10);
  if (isNaN(dd) || isNaN(mm) || isNaN(yyyy)) return null;

  const tp = timePart.split(":");
  const hh = parseInt(tp[0] ?? "8", 10);
  const min = parseInt(tp[1] ?? "0", 10);
  const sec = parseInt(tp[2] ?? "0", 10);

  const d = new Date(yyyy, mm - 1, dd, hh, min, sec, 0);
  return isNaN(d.getTime()) ? null : d;
}

export async function scheduleReminderNotification(
  vaccine: string,
  dateStr: string
): Promise<{ id: string; immediate: boolean } | null> {
  if (Platform.OS === "web") return null;

  await ensureAndroidChannel();
  await registerNotificationCategories();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const triggerDate = parseDateTimeStr(dateStr);
  if (!triggerDate) return null;

  const now = new Date();

  const notifContent: Notifications.NotificationContentInput = {
    title: "💉 Pengingat Imunisasi ImuniKids",
    body: `Jadwal imunisasi: ${vaccine}. Tekan untuk membuka atau tekan Matikan Alarm. 💙`,
    sound: "alarm.mp3",
    priority: Notifications.AndroidNotificationPriority.MAX,
    categoryIdentifier: "ALARM_CATEGORY",
    data: { vaccine, date: dateStr, type: "ALARM" },
    ...(Platform.OS === "android" && { channelId: CHANNEL_ID }),
  };

  if (triggerDate <= now) {
    const id = await Notifications.scheduleNotificationAsync({
      content: notifContent,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        repeats: false,
      },
    });
    return { id, immediate: true };
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: notifContent,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  return { id, immediate: false };
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
