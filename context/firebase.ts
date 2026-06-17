const FIREBASE_URL = "https://imunikids-b523a-default-rtdb.firebaseio.com";

export function toUserKey(nama: string): string {
  return nama.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
}

export async function fbGet<T>(path: string): Promise<T | null> {
  try {
    const url = `${FIREBASE_URL}/${path}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data as T;
  } catch (e) {
    return null;
  }
}

export async function fbSet(path: string, data: unknown): Promise<boolean> {
  try {
    const url = `${FIREBASE_URL}/${path}.json`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
