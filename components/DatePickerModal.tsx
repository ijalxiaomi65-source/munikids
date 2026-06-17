import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  title?: string;
  initialValue?: string;
}

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const currentYear = new Date().getFullYear();

function parseInitial(val: string) {
  if (val && val.length === 10) {
    const p = val.split("/");
    if (p.length === 3) {
      const d = parseInt(p[0], 10);
      const m = parseInt(p[1], 10);
      const y = parseInt(p[2], 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900) {
        return { day: d, month: m, year: y };
      }
    }
  }
  return { day: 1, month: 1, year: currentYear - 1 };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function DatePickerModal({
  visible,
  onClose,
  onSelect,
  title = "Pilih Tanggal",
  initialValue = "",
}: DatePickerModalProps) {
  const init = parseInitial(initialValue);
  const [day, setDay] = useState(init.day);
  const [month, setMonth] = useState(init.month);
  const [year, setYear] = useState(init.year);

  const maxDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, maxDay);

  const changeDay = (dir: number) => {
    setDay((d) => {
      const next = d + dir;
      if (next < 1) return maxDay;
      if (next > maxDay) return 1;
      return next;
    });
  };

  const changeMonth = (dir: number) => {
    setMonth((m) => {
      const next = m + dir;
      if (next < 1) return 12;
      if (next > 12) return 1;
      return next;
    });
  };

  const changeYear = (dir: number) => {
    setYear((y) => {
      const next = y + dir;
      return Math.max(1900, Math.min(currentYear, next));
    });
  };

  const handleConfirm = () => {
    onSelect(`${pad(safeDay)}/${pad(month)}/${year}`);
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

          <View style={styles.columnsRow}>
            {/* DAY */}
            <View style={styles.colWrap}>
              <Text style={styles.colHeader}>Tanggal</Text>
              <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDay(1)}>
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{pad(safeDay)}</Text>
              </View>
              <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDay(-1)}>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.separator}>/</Text>

            {/* MONTH */}
            <View style={[styles.colWrap, { flex: 2 }]}>
              <Text style={styles.colHeader}>Bulan</Text>
              <TouchableOpacity style={styles.arrowBtn} onPress={() => changeMonth(1)}>
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
              <View style={styles.valueBox}>
                <Text style={[styles.valueText, { fontSize: 14 }]}>
                  {MONTHS[month - 1]}
                </Text>
              </View>
              <TouchableOpacity style={styles.arrowBtn} onPress={() => changeMonth(-1)}>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.separator}>/</Text>

            {/* YEAR */}
            <View style={[styles.colWrap, { flex: 1.4 }]}>
              <Text style={styles.colHeader}>Tahun</Text>
              <TouchableOpacity style={styles.arrowBtn} onPress={() => changeYear(1)}>
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
              <View style={styles.valueBox}>
                <Text style={[styles.valueText, { fontSize: 15 }]}>{year}</Text>
              </View>
              <TouchableOpacity style={styles.arrowBtn} onPress={() => changeYear(-1)}>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Tanggal dipilih:</Text>
            <Text style={styles.previewValue}>
              {pad(safeDay)} {MONTHS[month - 1]} {year}
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
    paddingHorizontal: 16,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#297191",
    textAlign: "center",
    marginBottom: 18,
  },
  columnsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 4,
  },
  separator: {
    fontSize: 22,
    color: "#C5DDE8",
    fontWeight: "bold",
    marginTop: 20,
  },
  colWrap: {
    flex: 1,
    alignItems: "center",
  },
  colHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#507A93",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  arrowBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  arrow: {
    fontSize: 18,
    color: "#5EA7D3",
    fontWeight: "bold",
  },
  valueBox: {
    backgroundColor: "#EEF7FC",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    minWidth: 46,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#5EA7D3",
  },
  valueText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#297191",
    textAlign: "center",
  },
  preview: {
    backgroundColor: "#F0F8FF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  previewLabel: {
    fontSize: 12,
    color: "#A9CDDC",
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#297191",
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
    paddingVertical: 13,
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
    paddingVertical: 13,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
