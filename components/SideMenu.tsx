import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function SideMenu({ visible, onClose }: SideMenuProps) {
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const navigate = (path: string) => {
    onClose();
    setTimeout(() => router.replace(path as any), 300);
  };

  const openKonten = (category: string) => {
    onClose();
    setTimeout(() => {
      router.push({ pathname: "/konten", params: { category } });
    }, 300);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    setTimeout(() => router.replace("/login"), 300);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}
      >
        <ImageBackground
          source={require("@/assets/images/sidemenu.jpg")}
          style={[styles.header, { paddingTop: topPad + 20 }]}
          resizeMode="cover"
        >
          <Text style={styles.userName}>{user?.nama || "Pengguna"}</Text>
          <Text style={styles.userTtl}>{user?.ttl || ""}</Text>
        </ImageBackground>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigate("/home")}
        >
          <Image
            source={require("@/assets/images/homesidemenu.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => openKonten("edukasi")}
        >
          <Image
            source={require("@/assets/images/jadwalsidemenu.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />
          <Text style={styles.menuText}>Edukasi Jadwal Imunisasi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigate("/reminder")}
        >
          <Image
            source={require("@/assets/images/remindersidemenu.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />
          <Text style={styles.menuText}>Reminder Imunisasi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigate("/checklist")}
        >
          <Image
            source={require("@/assets/images/checklist.jpg")}
            style={styles.menuIcon}
            resizeMode="contain"
          />
          <Text style={styles.menuText}>Atur Jadwal Imunisasi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Image
            source={require("@/assets/images/keluarsidemenu.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />
          <Text style={[styles.menuText, { color: "#C0392B" }]}>
            Keluar Aplikasi
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: "100%",
    backgroundColor: "#fff",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    height: 180,
    justifyContent: "flex-end",
    padding: 16,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  userTtl: {
    color: "#fff",
    fontSize: 13,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuIcon: {
    width: 28,
    height: 28,
    marginRight: 14,
  },
  menuText: {
    fontSize: 15,
    color: "#297191",
    fontWeight: "600",
    flex: 1,
  },
});
