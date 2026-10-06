import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { clearStorage, readStorage, writeStorage } from "./storage";

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
};

export type SavedLocation = {
  id: string;
  label: string;
  line: string;
};

export type BookingStatus = "ongoing" | "completed" | "canceled";

export type Booking = {
  id: string;
  serviceSlug: string;
  serviceTitle: string;
  status: BookingStatus;
  area: string;
  when: string;
  locationType?: string;
  cancelReason?: "User canceled" | "No-show" | "Provider canceled";
  depositDispatched?: boolean;
  squareRef?: string;
};

export type DraftRequest = {
  serviceSlug: string;
  locationType?: "in-office" | "mobile";
  when?: string;
  vehicle?: {
    make: string;
    model: string;
    year: string;
    color: string;
    plate: string;
    notes: string;
  };
  termsAccepted?: boolean;
  smsAccepted?: boolean;
};

export type Toast = { id: number; title: string; body?: string };

type Store = {
  user: User | null;
  guest: boolean;
  onboarded: boolean;
  pendingEmail: string | null;
  verifyCode: string | null;
  locations: SavedLocation[];
  bookings: Booking[];
  draft: DraftRequest | null;
  cardLast4: string | null;
  toasts: Toast[];
  markOnboarded: () => void;
  continueAsGuest: () => void;
  login: (email: string, password: string) => { ok: true } | { ok: false; reason: string };
  beginSignup: (input: Omit<User, "id">) => { ok: true; email: string; code: string } | { ok: false; reason: string };
  verifyEmail: (code: string) => boolean;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  addLocation: (loc: Omit<SavedLocation, "id">) => void;
  updateLocation: (id: string, patch: Partial<SavedLocation>) => void;
  removeLocation: (id: string) => void;
  setDraft: (draft: DraftRequest | null) => void;
  patchDraft: (patch: Partial<DraftRequest>) => void;
  completeBooking: (input: { squareRef: string; when: string; locationType?: string }) => string;
  cancelBooking: (id: string) => void;
  rateBooking: (id: string) => void;
  pushToast: (title: string, body?: string) => void;
  dismissToast: (id: number) => void;
};

const Ctx = createContext<Store | null>(null);

const SEED_USER: User = {
  id: "u-demo",
  fullName: "Susan Hooks",
  email: "sihs@susanshooks.com",
  phone: "(302) 406-4665",
  password: "Standing1",
  address: "1201 N. Orange St., Suite 7724, Wilmington, DE 19801",
};

function loadJson<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadJson("users", [SEED_USER]));
  const [user, setUser] = useState<User | null>(() => {
    const id = readStorage("session");
    if (!id) return null;
    const list = loadJson<User[]>("users", [SEED_USER]);
    return list.find((u) => u.id === id) ?? null;
  });
  const [guest, setGuest] = useState(() => readStorage("guest") === "1");
  const [onboarded, setOnboarded] = useState(() => readStorage("onboarded") === "1");
  const [pending, setPending] = useState<{ user: User; code: string } | null>(null);
  const [locations, setLocations] = useState<SavedLocation[]>(() =>
    loadJson("locations", [
      {
        id: "loc-hq",
        label: "Wilmington office",
        line: "1201 N. Orange St., Suite 7724, Wilmington, DE 19801",
      },
    ]),
  );
  const [bookings, setBookings] = useState<Booking[]>(() => loadJson("bookings", []));
  const [draft, setDraftState] = useState<DraftRequest | null>(null);
  const [cardLast4, setCardLast4] = useState<string | null>(() => readStorage("card") || "4242");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<Store>(() => {
    const pushToast = (title: string, body?: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, title, body }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    };

    const persistUsers = (list: User[]) => {
      setUsers(list);
      writeStorage("users", JSON.stringify(list));
    };

    return {
      user,
      guest,
      onboarded,
      pendingEmail: pending?.user.email ?? null,
      verifyCode: pending?.code ?? null,
      locations,
      bookings,
      draft,
      cardLast4,
      toasts,
      markOnboarded: () => {
        setOnboarded(true);
        writeStorage("onboarded", "1");
      },
      continueAsGuest: () => {
        setGuest(true);
        setUser(null);
        writeStorage("guest", "1");
        clearStorage("session");
        writeStorage("onboarded", "1");
        setOnboarded(true);
      },
      login: (email, password) => {
        const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found || found.password !== password) return { ok: false, reason: "Email or password is incorrect." };
        setUser(found);
        setGuest(false);
        writeStorage("session", found.id);
        clearStorage("guest");
        writeStorage("onboarded", "1");
        setOnboarded(true);
        return { ok: true };
      },
      beginSignup: (input) => {
        if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
          return { ok: false, reason: "An account with that email already exists." };
        }
        const created: User = {
          id: `u${Date.now()}`,
          fullName: input.fullName.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone.trim(),
          password: input.password,
          address: input.address?.trim() || undefined,
        };
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setPending({ user: created, code });
        return { ok: true, email: created.email, code };
      },
      verifyEmail: (code) => {
        if (!pending || pending.code !== code.trim()) return false;
        const next = [...users, pending.user];
        persistUsers(next);
        setUser(pending.user);
        setGuest(false);
        writeStorage("session", pending.user.id);
        clearStorage("guest");
        writeStorage("onboarded", "1");
        setOnboarded(true);
        setPending(null);
        return true;
      },
      logout: () => {
        setUser(null);
        setGuest(false);
        clearStorage("session");
        clearStorage("guest");
      },
      updateUser: (patch) => {
        if (!user) return;
        const next = { ...user, ...patch };
        setUser(next);
        persistUsers(users.map((u) => (u.id === next.id ? next : u)));
        pushToast("Profile updated");
      },
      addLocation: (loc) => {
        const next = [{ ...loc, id: `loc${Date.now()}` }, ...locations];
        setLocations(next);
        writeStorage("locations", JSON.stringify(next));
        pushToast("Location saved");
      },
      updateLocation: (id, patch) => {
        const next = locations.map((l) => (l.id === id ? { ...l, ...patch } : l));
        setLocations(next);
        writeStorage("locations", JSON.stringify(next));
        pushToast("Location updated");
      },
      removeLocation: (id) => {
        const next = locations.filter((l) => l.id !== id);
        setLocations(next);
        writeStorage("locations", JSON.stringify(next));
        pushToast("Location deleted");
      },
      setDraft: (next) => setDraftState(next),
      patchDraft: (patch) => setDraftState((d) => (d ? { ...d, ...patch } : d)),
      completeBooking: ({ squareRef, when, locationType }) => {
        const slug = draft?.serviceSlug ?? "towing";
        const title =
          slug === "towing"
            ? "Delaware Intrastate Towing"
            : slug === "lockouts"
              ? "Lockouts"
              : slug === "jump-starts"
                ? "Jump Starts"
                : slug === "fuel-delivery"
                  ? "Fuel Delivery"
                  : slug === "drug-alcohol"
                    ? "Drug & Alcohol Collections"
                    : slug === "dna"
                      ? "DNA Services"
                      : slug === "pim-vee"
                        ? "PIM-VEE™"
                        : "Notary";
        const id = `SIHS-${Date.now().toString().slice(-6)}`;
        const booking: Booking = {
          id,
          serviceSlug: slug,
          serviceTitle: title,
          status: "ongoing",
          area: "Northern New Castle County, DE",
          when,
          locationType,
          squareRef,
        };
        const next = [booking, ...bookings];
        setBookings(next);
        writeStorage("bookings", JSON.stringify(next));
        setCardLast4("4242");
        writeStorage("card", "4242");
        setDraftState(null);
        return id;
      },
      cancelBooking: (id) => {
        const next = bookings.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "canceled" as const,
                cancelReason: "User canceled" as const,
                depositDispatched: b.serviceSlug === "towing" || b.serviceSlug === "lockouts",
              }
            : b,
        );
        setBookings(next);
        writeStorage("bookings", JSON.stringify(next));
        pushToast("Booking canceled");
      },
      rateBooking: (id) => {
        const next = bookings.map((b) => (b.id === id ? { ...b, status: "completed" as const } : b));
        setBookings(next);
        writeStorage("bookings", JSON.stringify(next));
        pushToast("Thank you", "Your rating was recorded.");
      },
      pushToast,
      dismissToast: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    };
  }, [user, guest, onboarded, pending, locations, bookings, draft, cardLast4, toasts, users]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
