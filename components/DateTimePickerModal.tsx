import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (datetime: string) => void;
  title?: string;
  initialValue?: string;
}

const MONTHS = [
  "Jan","Feb","Mar","Apr","Mei","Jun",
  "Jul","Agu","Sep","Okt","Nov","Des",
];

const currentYear = new Date().getFullYear();

function parseInitial(val: string) {
  if (val && val.length >= 10) {
    const datePart = val.substring(0, 10);
    const timePart = val.length >= 19 ? val.substring(11, 19) : "08:00:00";
    const dp = datePart.split("/");
    const tp = timePart.split(":");
    if (dp.length === 3) {
      const d = parseInt(dp[0], 10);
      const m = parseInt(dp[1], 10);
      const y = parseInt(dp[2], 10);
      const h = parseInt(tp[0] || "8", 10);
      const min = parseInt(tp[1] || "0", 10);
      const sec = parseInt(tp[2] || "0", 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900) {
        return { day: d, month: m, year: y, hour: h, minute: min, second: sec };
      }
    }
  }
  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    hour: 8,
    minute: 0,
    second: 0,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface SpinnerColProps {
  label: string;
  value: number;
  onUp: () => void;
  onDown: () => void;
  display?: string;
  flex?: number;
}

function SpinnerCol({ label, value, onUp, onDown, display, flex = 1 }: SpinnerColProps) {
  return (
    <View style={[styles.colWrap, { flex }]}>
      <Text style={styles.colHeader}>{label}</Text>
      <TouchableOpacity style={styles.arrowBtn} onPress={onUp}>
        <Text style={styles.arrow}>▲</Text>
      </TouchableOpacity>
      <View style={styles.valueBox}>
        <Text style={styles.valueText}>{display ?? pad(value)}</Text>
      </View>
      <TouchableOpacity style={styles.arrowBtn} onPress={onDown}>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

export function DateTimePickerModal({
  visible,
  onClose,
  onSelect,
  title = "Pilih Tanggal & Waktu",
  initialValue = "",
}: DateTimePickerModalProps) {
  const init = parseInitial(initialValue);
  const [day, setDay] = useState(init.day);
  const [month, setMonth] = useState(init.month);
  const [year, setYear] = useState(init.year);
  const [hour, setHour] = useState(init.hour);
  const [minute, setMinute] = useState(init.minute);
  const [second, setSecond] = useState(init.second);

  const maxDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, maxDay);

  const spin = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    min: number,
    max: number,
    dir: number
  ) => {
    setter((v) => {
      const next = v + dir;
      if (next < min) return max;
      if (next > max) return min;
      return next;
    });
  };

  const handleConfirm = () => {
    const dateStr = `${pad(safeDay)}/${pad(month)}/${year}`;
    const timeStr = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
    onSelect(`${dateStr} ${timeStr}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.sectionLabel}>📅 Tanggal</Text>
          <View style={styles.columnsRow}>
            <SpinnerCol
              label="Tgl"
              value={safeDay}
              onUp={() => spin(setDay, 1, maxDay, 1)}
              onDown={() => spin(setDay, 1, maxDay, -1)}
            />
            <Text style={styles.separator}>/</Text>
            <SpinnerCol
              label="Bulan"
              value={month}
              display={MONTHS[month - 1]}
              onUp={() => spin(setMonth, 1, 12, 1)}
              onDown={() => spin(setMonth, 1, 12, -1)}
              flex={2}
            />
            <Text style={styles.separator}>/</Text>
            <SpinnerCol
              label="Tahun"
              value={year}
              display={String(year)}
              onUp={() => setYear((y) => Math.min(y + 1, currentYear + 5))}
              onDown={() => setYear((y) => Math.max(y - 1, currentYear))}
              flex={1.5}
            />
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>⏰ Waktu</Text>
          <View style={styles.columnsRow}>
            <SpinnerCol
              label="Jam"
              value={hour}
              onUp={() => spin(setHour, 0, 23, 1)}
              onDown={() => spin(setHour, 0, 23, -1)}
            />
            <Text style={styles.colon}>:</Text>
            <SpinnerCol
              label="Menit"
              value={minute}
              onUp={() => spin(setMinute, 0, 59, 1)}
              onDown={() => spin(setMinute, 0, 59, -1)}
            />
            <Text style={styles.colon}>:</Text>
            <SpinnerCol
              label="Detik"
              value={second}
              onUp={() => spin(setSecond, 0, 59, 1)}
              onDown={() => spin(setSecond, 0, 59, -1)}
            />
          </View>

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Waktu pengingat:</Text>
            <Text style={styles.previewValue}>
              {pad(safeDay)} {MONTHS[month - 1]} {year} — {pad(hour)}:{pad(minute)}:{pad(second)}
            </Text>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Pilih ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 420,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#297191",
    textAlign: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#507A93",
    marginBottom: 6,
    marginLeft: 2,
  },
  columnsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 2,
  },
  separator: {
    fontSize: 20,
    color: "#C5DDE8",
    fontWeight: "bold",
    marginTop: 18,
  },
  colon: {
    fontSize: 22,
    color: "#5EA7D3",
    fontWeight: "bold",
    marginTop: 18,
  },
  colWrap: {
    flex: 1,
    alignItems: "center",
  },
  colHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#507A93",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  arrowBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  arrow: {
    fontSize: 16,
    color: "#5EA7D3",
    fontWeight: "bold",
  },
  valueBox: {
    backgroundColor: "#EEF7FC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 40,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#5EA7D3",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#297191",
    textAlign: "center",
  },
  preview: {
    backgroundColor: "#F0F8FF",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  previewLabel: {
    fontSize: 11,
    color: "#A9CDDC",
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#297191",
    textAlign: "center",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#5EA7D3",
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#5EA7D3",
    fontWeight: "bold",
    fontSize: 15,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#5EA7D3",
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
