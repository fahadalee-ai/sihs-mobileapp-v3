import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, CreditCard, FileText, LogOut, MapPin, Phone, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { LEGAL_LINKS, PHONE_DISPLAY, PHONE_TEL } from "@/lib/content";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "SIH&S — Profile" }] }),
  component: Profile,
});

function Row({
  to,
  params,
  icon,
  label,
  detail,
}: {
  to: "/locations" | "/payment" | "/profile-edit" | "/signup" | "/legal/$doc";
  params?: { doc: string };
  icon: ReactNode;
  label: string;
  detail?: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      className="flex min-h-[56px] items-center gap-3 border-b border-[#e4eee7] px-4 last:border-b-0"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f3f8f4] text-[#001e16]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-medium text-[#001e16]">{label}</span>
        {detail && <span className="block truncate text-[13px] text-[#3d4a44]">{detail}</span>}
      </span>
      <ChevronRight size={18} className="text-[#3d4a44]" aria-hidden />
    </Link>
  );
}

function Profile() {
  const { user, guest, cardLast4, logout } = useApp();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const signedIn = Boolean(user) && !guest;
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || "G";

  return (
    <div className="px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <h1 className="text-[28px] font-bold text-[#001e16]">Profile</h1>

      {signedIn && user ? (
        <section className="mt-4 flex items-center gap-3 rounded-[16px] bg-[#001e16] p-4 text-white">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5fbb3f] text-[22px] font-bold text-[#001e16]">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold">{user.fullName}</p>
            <p className="truncate text-[14px] text-[#c5d4cc]">{user.email}</p>
            <a href={`tel:+1${user.phone.replace(/\D/g, "")}`} className="mt-1 inline-flex min-h-11 items-center text-[14px] font-semibold text-[#8fd86f]">
              {user.phone}
            </a>
          </div>
        </section>
      ) : (
        <section className="mt-4 rounded-[16px] bg-[#001e16] p-4 text-white">
          <p className="text-[16px] font-semibold">Browsing as a guest</p>
          <p className="mt-1 text-[14px] leading-relaxed text-[#c5d4cc]">
            Create an account to save requests, locations, and payment references.
          </p>
          <Link
            to="/signup"
            className="mt-3 inline-flex min-h-11 items-center rounded-[12px] bg-[#5fbb3f] px-4 text-[15px] font-semibold text-[#001e16]"
          >
            Create an account
          </Link>
        </section>
      )}

      <h2 className="mb-2 mt-6 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#3d4a44]">Account</h2>
      <nav className="overflow-hidden rounded-[16px] border border-[#d7e3da] bg-white" aria-label="Account">
        {signedIn && (
          <Row to="/profile-edit" icon={<UserRound size={18} aria-hidden />} label="Edit Profile" />
        )}
        <Row to="/locations" icon={<MapPin size={18} aria-hidden />} label="My Locations" detail="Saved Delaware addresses" />
        <Row
          to="/payment"
          icon={<CreditCard size={18} aria-hidden />}
          label="Payment Method"
          detail={cardLast4 ? `Square · •••• ${cardLast4}` : "Managed in Square"}
        />
      </nav>

      <h2 className="mb-2 mt-6 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#3d4a44]">Legal & Compliance</h2>
      <nav className="overflow-hidden rounded-[16px] border border-[#d7e3da] bg-white" aria-label="Legal and compliance">
        {LEGAL_LINKS.map((link) => (
          <Row key={link.id} to="/legal/$doc" params={{ doc: link.id }} icon={<FileText size={18} aria-hidden />} label={link.title} />
        ))}
      </nav>

      <a
        href={`tel:${PHONE_TEL}`}
        className="mt-6 flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#5fbb3f] text-[16px] font-semibold text-[#001e16]"
      >
        <Phone size={18} aria-hidden />
        Call {PHONE_DISPLAY}
      </a>

      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#e7c5c5] bg-white text-[16px] font-semibold text-[#9b2c2c]"
      >
        <LogOut size={18} aria-hidden />
        Log Out
      </button>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="w-full max-w-[480px] rounded-t-[16px] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <h2 id="logout-title" className="text-[20px] font-semibold text-[#001e16]">
              Log out of SIH&S?
            </h2>
            <p className="mt-1 text-[15px] text-[#3d4a44]">You can sign in again at any time.</p>
            <div className="mt-4 flex gap-3">
              <button type="button" className="min-h-11 flex-1 rounded-[12px] border border-[#d7e3da] font-semibold" onClick={() => setConfirm(false)}>
                Stay
              </button>
              <button
                type="button"
                className="min-h-11 flex-1 rounded-[12px] bg-[#001e16] font-semibold text-white"
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
