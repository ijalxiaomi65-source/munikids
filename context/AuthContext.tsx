import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { fbGet, fbSet, toUserKey } from "./firebase";

export interface User {
  nama: string;
  password: string;
  ttl: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (nama: string, password: string) => Promise<boolean>;
  register: (
    nama: string,
    password: string,
    ttl: string
  ) => Promise<{ ok: boolean; msg: string }>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => ({ ok: false, msg: "" }),
  logout: async () => {},
  reload: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const raw = await AsyncStorage.getItem("@imunikids_user");
        if (raw) setUser(JSON.parse(raw));
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const login = async (nama: string, password: string): Promise<boolean> => {
    try {
      const key = toUserKey(nama);
      const data = await fbGet<User>(`users/${key}`);
      if (
        data &&
        data.nama.trim().toLowerCase() === nama.trim().toLowerCase() &&
        data.password.trim() === password.trim()
      ) {
        await AsyncStorage.setItem("@imunikids_user", JSON.stringify(data));
        setUser(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (
    nama: string,
    password: string,
    ttl: string
  ): Promise<{ ok: boolean; msg: string }> => {
    try {
      const key = toUserKey(nama);
      const existing = await fbGet<User>(`users/${key}`);
      if (existing && existing.nama) {
        return { ok: false, msg: "Nama sudah terdaftar!" };
      }
      const newUser: User = {
        nama: nama.trim(),
        password: password.trim(),
        ttl: ttl.trim(),
      };
      const saved = await fbSet(`users/${key}`, newUser);
      if (!saved) {
        return {
          ok: false,
          msg: "Gagal menyimpan data. Periksa koneksi internet!",
        };
      }
      return { ok: true, msg: "Registrasi Berhasil!" };
    } catch {
      return { ok: false, msg: "Terjadi kesalahan. Coba lagi." };
    }
  };

  const reload = async () => {
    try {
      const raw = await AsyncStorage.getItem("@imunikids_user");
      if (raw) {
        const stored: User = JSON.parse(raw);
        const key = toUserKey(stored.nama);
        const fresh = await fbGet<User>(`users/${key}`);
        if (fresh && fresh.nama) {
          await AsyncStorage.setItem("@imunikids_user", JSON.stringify(fresh));
          setUser(fresh);
          return;
        }
      }
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("@imunikids_user");
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, reload }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
