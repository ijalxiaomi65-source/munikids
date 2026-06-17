export interface Vaccine {
  name: string;
  ageMonths: number;
  label: string;
}

export const VACCINE_SCHEDULE: Vaccine[] = [
  { name: "Hepatitis B", ageMonths: 0, label: "Lahir" },
  { name: "BCG", ageMonths: 1, label: "1 Bulan" },
  { name: "Polio Tetes 1", ageMonths: 1, label: "1 Bulan" },
  { name: "DPT-HB-HiB 1", ageMonths: 2, label: "2 Bulan" },
  { name: "Polio Tetes 2", ageMonths: 2, label: "2 Bulan" },
  { name: "Rotavirus (RV 1)", ageMonths: 2, label: "2 Bulan" },
  { name: "PCV 1", ageMonths: 2, label: "2 Bulan" },
  { name: "DPT-HB-HiB 2", ageMonths: 3, label: "3 Bulan" },
  { name: "Polio Tetes 3", ageMonths: 3, label: "3 Bulan" },
  { name: "Rotavirus (RV 2)", ageMonths: 3, label: "3 Bulan" },
  { name: "PCV 2", ageMonths: 3, label: "3 Bulan" },
  { name: "DPT-HB-HiB 3", ageMonths: 4, label: "4 Bulan" },
  { name: "Polio Tetes 4", ageMonths: 4, label: "4 Bulan" },
  { name: "Polio Suntik (IPV 1)", ageMonths: 4, label: "4 Bulan" },
  { name: "Rotavirus (RV 3)", ageMonths: 4, label: "4 Bulan" },
  { name: "Campak-Rubella (MR)", ageMonths: 9, label: "9 Bulan" },
  { name: "Polio Suntik (IPV 2)", ageMonths: 9, label: "9 Bulan" },
  { name: "Japanese Encephalitis (JE)", ageMonths: 10, label: "10 Bulan" },
  { name: "PCV 3", ageMonths: 12, label: "12 Bulan" },
  { name: "DPT-HB-HiB Lanjutan", ageMonths: 18, label: "18 Bulan" },
  { name: "Campak-Rubella (MR) Lanjutan", ageMonths: 18, label: "18 Bulan" },
];

export function getAgeInMonths(birthDateStr: string): number {
  const parts = birthDateStr.split("/");
  if (parts.length !== 3) return 0;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const birth = new Date(year, month, day);
  const today = new Date();
  return (
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth())
  );
}

export function calculateAge(birthDateStr: string): string {
  const parts = birthDateStr.split("/");
  if (parts.length !== 3) return "-";
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const birth = new Date(year, month, day);
  const today = new Date();
  const diffMs = today.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Belum lahir";
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    return `${weeks} Minggu ${days} Hari`;
  }
  const months = getAgeInMonths(birthDateStr);
  if (months < 12) return `${months} Bulan`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years} Tahun`;
  return `${years} Tahun ${remMonths} Bulan`;
}

export function getScheduledDate(birthDateStr: string, ageMonths: number): string {
  const parts = birthDateStr.split("/");
  if (parts.length !== 3) return "-";
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const birth = new Date(year, month, day);
  birth.setMonth(birth.getMonth() + ageMonths);
  const months = [
    "Jan","Feb","Mar","Apr","Mei","Jun",
    "Jul","Agu","Sep","Okt","Nov","Des",
  ];
  return `${birth.getDate()} ${months[birth.getMonth()]} ${birth.getFullYear()}`;
}

export function getNextVaccine(
  ageMonths: number,
  checklist: Record<string, boolean>
): Vaccine | null {
  for (const vaccine of VACCINE_SCHEDULE) {
    if (!checklist[vaccine.name]) {
      return vaccine;
    }
  }
  return null;
}
