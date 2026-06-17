import { SideMenu } from "@/components/SideMenu";
import { useAuth } from "@/context/AuthContext";
import { fbGet, toUserKey } from "@/context/firebase";
import {
  VACCINE_SCHEDULE,
  calculateAge,
  getAgeInMonths,
  getNextVaccine,
  getScheduledDate,
} from "@/constants/vaccines";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

const MENU_ITEMS = [
  {
    label: "Edukasi\nImunisasi",
    icon: require("@/assets/images/medical.png"),
    category: "edukasi",
    route: null,
  },
  {
    label: "Jadwal\nImunisasi",
    icon: require("@/assets/images/calendar_(1).png"),
    category: null,
    route: "/checklist",
  },
  {
    label: "Tips\nImunisasi",
    icon: require("@/assets/images/baby.png"),
    category: "tips",
    route: null,
  },
  {
    label: "Tumbuh\nKembang",
    icon: require("@/assets/images/evolution.png"),
    category: "tumbuhkembang",
    route: null,
  },
  {
    label: "Video\nEdukasi",
    icon: require("@/assets/images/video.png"),
    category: null,
    route: "/video",
  },
  {
    label: "MPASI\nSehat",
    icon: require("@/assets/images/baby-feeding.png"),
    category: "mpasi",
    route: null,
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [reminder, setReminder] = useState<{ vaccine: string; date: string } | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
    const [checklistData, reminderData] = await Promise.all([
      fbGet<Record<string, boolean>>(`users/${key}/checklist`),
      fbGet<{ vaccine: string; date: string }>(`users/${key}/reminder`),
    ]);
    if (checklistData) setChecklist(checklistData);
    if (reminderData) setReminder(reminderData);
  }, [user]);

  if (!user) return null;

  const age = calculateAge(user.ttl);
  const ageMonths = getAgeInMonths(user.ttl);
  const nextVaccine = getNextVaccine(0, checklist);
  const nextDate = nextVaccine
    ? getScheduledDate(user.ttl, nextVaccine.ageMonths)
    : "-";

  const upcomingVaccines = VACCINE_SCHEDULE.filter(
    (v) => !checklist[v.name] && v.ageMonths >= ageMonths
  ).slice(0, 3);

  const openKonten = (category: string) => {
    router.push({ pathname: "/konten", params: { category } });
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("@/assets/images/bgallscreen.jpeg")}
        style={styles.bg}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad, paddingBottom: 30 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.hamburger}
              onPress={() => setMenuVisible(true)}
            >
              <Text style={styles.hamburgerIcon}>☰</Text>
            </TouchableOpacity>
            <View style={styles.headerLeft}>
              <Text style={styles.hiText}>Hi, {user.nama}</Text>
              <Text style={styles.headerSub}>
                Jangan lupa jadwal imunisasi,{"\n"}Agar tumbuh sehat
              </Text>
            </View>
            <Image
              source={require("@/assets/images/berandaicon-removebg-preview.png")}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </View>

          {/* User Info Card */}
          <View style={styles.sectionBg}>
            <View style={styles.userCard}>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Nama Anak</Text>
                <Text style={styles.userColon}>:</Text>
                <Text style={styles.userValue}>{user.nama}</Text>
              </View>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>TTL</Text>
                <Text style={styles.userColon}>:</Text>
                <Text style={styles.userValue}>{user.ttl}</Text>
              </View>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Umur</Text>
                <Text style={styles.userColon}>:</Text>
                <Text style={styles.userValue}>{age}</Text>
              </View>
            </View>
          </View>

          {/* Carousel */}
          <View style={styles.sectionBg}>
            {cardIndex === 0 && (
              <View style={styles.nextCard}>
                <Image
                  source={require("@/assets/images/alarm.png")}
                  style={styles.alarmIcon}
                  resizeMode="contain"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextLabel}>
                    Jadwal Imunisasi selanjutnya
                  </Text>
                  <Text style={styles.nextVaccine}>
                    {reminder
                      ? reminder.vaccine
                      : nextVaccine
                        ? nextVaccine.name
                        : "Semua selesai!"}
                  </Text>
                  <Text style={styles.nextDate}>
                    {reminder ? reminder.date : nextDate}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={() => router.push("/checklist")}
                >
                  <Text style={styles.nextBtnText}>Next</Text>
                </TouchableOpacity>
              </View>
            )}

            {cardIndex === 1 && (
              <View style={styles.rekomCard}>
                <Text style={styles.rekomTitle}>Rekomendasi Vaksin</Text>
                <Text style={styles.rekomSubtitle}>
                  Berdasarkan usia {age}:
                </Text>
                {upcomingVaccines.length === 0 ? (
                  <Text style={styles.rekomEmpty}>
                    Semua vaksin sudah selesai!
                  </Text>
                ) : (
                  upcomingVaccines.map((v, i) => (
                    <View key={i} style={styles.rekomRow}>
                      <View style={styles.rekomDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rekomName}>{v.name}</Text>
                        <Text style={styles.rekomAge}>
                          {getScheduledDate(user.ttl, v.ageMonths)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            <View style={styles.carouselControls}>
              <TouchableOpacity
                style={styles.carouselArrow}
                onPress={() => setCardIndex((i) => (i === 0 ? 1 : 0))}
              >
                <Text style={styles.carouselArrowText}>
                  {cardIndex === 0 ? "▶" : "◀"}
                </Text>
              </TouchableOpacity>
              <View style={styles.dotsRow}>
                <View style={[styles.dot, cardIndex === 0 && styles.dotActive]} />
                <View style={[styles.dot, cardIndex === 1 && styles.dotActive]} />
              </View>
            </View>
          </View>

          {/* Menu Grid — 5 kategori */}
          <View style={styles.menuGrid}>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.menuCard}
                onPress={() =>
                  item.route
                    ? router.push(item.route as any)
                    : openKonten(item.category!)
                }
                activeOpacity={0.8}
              >
                <Image
                  source={item.icon}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </ImageBackground>

      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

const CARD_W = (width - 60) / 3;

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { paddingHorizontal: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D3E8EC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
  },
  hamburger: { padding: 6, marginRight: 8 },
  hamburgerIcon: { fontSize: 26, color: "#297191" },
  headerLeft: { flex: 1 },
  hiText: {
    fontFamily: "StickyBread",
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  headerSub: {
    fontSize: 13,
    color: "#507A93",
    marginTop: 2,
    lineHeight: 18,
  },
  headerIcon: { width: 60, height: 60 },
  sectionBg: {
    backgroundColor: "#D3E8EC",
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userCard: {
    backgroundColor: "rgba(253,251,251,0.65)",
    borderRadius: 16,
    padding: 14,
  },
  userRow: { flexDirection: "row", marginBottom: 4 },
  userLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#297191",
    width: 90,
  },
  userColon: { fontSize: 15, color: "#297191", marginHorizontal: 4 },
  userValue: { fontSize: 15, color: "#1a1a2e", flex: 1 },
  nextCard: {
    backgroundColor: "rgba(253,251,251,0.65)",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alarmIcon: { width: 44, height: 44 },
  nextLabel: { fontSize: 13, color: "#507A93", marginBottom: 2 },
  nextVaccine: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#297191",
    marginBottom: 2,
  },
  nextDate: { fontSize: 13, color: "#507A93" },
  nextBtn: {
    backgroundColor: "#3A9034",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nextBtnText: { fontWeight: "bold", color: "#fff", fontSize: 14 },
  rekomCard: {
    backgroundColor: "rgba(253,251,251,0.65)",
    borderRadius: 16,
    padding: 14,
  },
  rekomTitle: {
    fontFamily: "StickyBread",
    fontSize: 15,
    color: "#297191",
    marginBottom: 4,
  },
  rekomSubtitle: {
    fontSize: 12,
    color: "#507A93",
    marginBottom: 8,
  },
  rekomEmpty: {
    fontSize: 14,
    color: "#3A9034",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 8,
  },
  rekomRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  rekomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5EA7D3",
    marginTop: 5,
  },
  rekomName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#297191",
  },
  rekomAge: { fontSize: 12, color: "#507A93" },
  carouselControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 12,
  },
  carouselArrow: {
    backgroundColor: "rgba(94,167,211,0.25)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  carouselArrowText: {
    color: "#297191",
    fontSize: 14,
    fontWeight: "bold",
  },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A9CDDC",
  },
  dotActive: { backgroundColor: "#297191", width: 20 },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 12,
  },
  menuCard: {
    width: CARD_W,
    backgroundColor: "rgba(253,251,251,0.65)",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  menuIcon: { width: 48, height: 48, marginBottom: 8 },
  menuLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#297191",
    textAlign: "center",
    lineHeight: 17,
  },
});
