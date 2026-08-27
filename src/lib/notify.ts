import { localDateKey } from "@/lib/stats";

const NOTIFY_KEY = "jeju-mal:notify";
const NOTIFY_DAY_KEY = "jeju-mal:notify-day";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function isNotifyOn(): boolean {
  try {
    return localStorage.getItem(NOTIFY_KEY) === "1" && Notification.permission === "granted";
  } catch {
    return false;
  }
}

export async function setNotifyOn(on: boolean): Promise<boolean> {
  if (!on) {
    try {
      localStorage.setItem(NOTIFY_KEY, "0");
    } catch {
      /* ignore */
    }
    return false;
  }
  if (!notificationsSupported()) return false;
  let permission = Notification.permission;
  if (permission === "default") permission = await Notification.requestPermission();
  const granted = permission === "granted";
  try {
    localStorage.setItem(NOTIFY_KEY, granted ? "1" : "0");
  } catch {
    /* ignore */
  }
  return granted;
}

export function maybeRemind(dueCount: number) {
  if (!isNotifyOn() || dueCount <= 0 || !notificationsSupported()) return;
  const today = localDateKey();
  try {
    if (localStorage.getItem(NOTIFY_DAY_KEY) === today) return;
    localStorage.setItem(NOTIFY_DAY_KEY, today);
  } catch {
    return;
  }
  try {
    new Notification("제주말", {
      body: `오늘 복습 ${dueCount}장이 기다리고 있습니다.`,
      tag: "jeju-mal-review",
    });
  } catch {
    /* ignore */
  }
}
