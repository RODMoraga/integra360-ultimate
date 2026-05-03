import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { authService } from "../services/auth.service";

/**
 * Thresholds (in seconds) used to trigger warning callbacks.
 */
const WARN_SOON_THRESHOLD = 300; // 5 minutes
const WARN_CRITICAL_THRESHOLD = 60; // 1 minute

/**
 * Composable that tracks JWT session expiry in real time.
 *
 * Provides reactive countdown state and fires one-shot callbacks at critical
 * thresholds so callers can show warnings or auto-logout the user.
 *
 * @param onWarnSoon     Fired once when secondsLeft drops below 5 minutes.
 * @param onWarnCritical Fired once when secondsLeft drops below 1 minute.
 * @param onExpired      Fired once when secondsLeft reaches 0.
 */
export function useSessionExpiry(
  onWarnSoon?: () => void,
  onWarnCritical?: () => void,
  onExpired?: () => void
) {
  const nowSeconds = ref(Math.floor(Date.now() / 1000));
  const expiresAtUnix = ref<number | null>(null);

  // One-shot flags so callbacks fire exactly once per session
  let firedWarnSoon = false;
  let firedWarnCritical = false;
  let firedExpired = false;

  let tickInterval: ReturnType<typeof setInterval> | null = null;

  function refresh() {
    const payload = authService.getTokenPayload();
    expiresAtUnix.value = payload?.exp ?? null;
  }

  function tick() {
    nowSeconds.value = Math.floor(Date.now() / 1000);

    const left = secondsLeft.value;
    if (left === null) return;

    if (!firedWarnSoon && left <= WARN_SOON_THRESHOLD && left > WARN_CRITICAL_THRESHOLD) {
      firedWarnSoon = true;
      onWarnSoon?.();
    }

    if (!firedWarnCritical && left <= WARN_CRITICAL_THRESHOLD && left > 0) {
      firedWarnCritical = true;
      onWarnCritical?.();
    }

    if (!firedExpired && left <= 0) {
      firedExpired = true;
      onExpired?.();
    }
  }

  /** Seconds remaining until expiry. null when no token is loaded. */
  const secondsLeft = computed<number | null>(() => {
    if (expiresAtUnix.value === null) return null;
    return Math.max(0, expiresAtUnix.value - nowSeconds.value);
  });

  /** Exact expiry as a Date object. null when no token is loaded. */
  const expiresAtDate = computed<Date | null>(() => {
    if (expiresAtUnix.value === null) return null;
    return new Date(expiresAtUnix.value * 1000);
  });

  /** True when less than 5 minutes remain. */
  const isExpiringSoon = computed(() =>
    secondsLeft.value !== null && secondsLeft.value <= WARN_SOON_THRESHOLD
  );

  /** True when less than 1 minute remains. */
  const isCritical = computed(() =>
    secondsLeft.value !== null && secondsLeft.value <= WARN_CRITICAL_THRESHOLD
  );

  /** True when session is still valid (> 0 seconds left) and token was found. */
  const isAlive = computed(() => secondsLeft.value !== null && secondsLeft.value > 0);

  /**
   * Human-readable time label.
   * - Hidden (null) when more than 2 hours remain — avoids clutter on fresh tokens.
   * - "1h 45m" between 2h and 5min.
   * - "MM:SS" when fewer than 5 minutes remain.
   */
  const timeLabel = computed<string | null>(() => {
    const s = secondsLeft.value;
    if (s === null) return null;
    if (s > 7200) return null; // More than 2 hours → hide

    if (s >= WARN_SOON_THRESHOLD) {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    }

    // < 5 minutes: MM:SS countdown
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  });

  /**
   * Tooltip text with the exact expiry date and time.
   */
  const expiresAtLabel = computed<string | null>(() => {
    if (!expiresAtDate.value) return null;
    return expiresAtDate.value.toLocaleString("es-CL", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  });

  onMounted(() => {
    refresh();
    tickInterval = setInterval(tick, 1000);
  });

  onBeforeUnmount(() => {
    if (tickInterval !== null) {
      clearInterval(tickInterval);
    }
  });

  return {
    secondsLeft,
    expiresAtDate,
    expiresAtLabel,
    timeLabel,
    isExpiringSoon,
    isCritical,
    isAlive,
    refresh
  };
}
