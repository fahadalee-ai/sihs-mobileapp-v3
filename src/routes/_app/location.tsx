import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { HQ, PHONE_DISPLAY, PHONE_TEL, SERVICE_AREA } from "@/lib/content";

export const Route = createFileRoute("/_app/location")({
  head: () => ({ meta: [{ title: "SIH&S — Location" }] }),
  component: LocationScreen,
});

function LocationScreen() {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const card = `sih&s wilmington northern new castle county delaware ${HQ}`.toLowerCase();
    return !q || card.includes(q);
  }, [query]);

  return (
    <div className="pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="px-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#2f7a1c]">Service area</p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight text-[#001e16]">Find SIH&S Near You.</h1>
        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#3d4a44]">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by area, street..."
            className="min-h-11 w-full rounded-[12px] border border-[#d7e3da] bg-white px-3 text-[15px] text-[#001e16] outline-none placeholder:text-[#3d4a44]"
          />
        </label>
      </div>

      <div className="relative mt-4">
        <iframe
          title="Map of Northern New Castle County, Delaware"
          className="h-72 w-full border-0"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-75.72%2C39.55%2C-75.35%2C39.85&layer=mapnik&marker=39.7391%2C-75.5398"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#f4f6f4] to-transparent" />
      </div>

      <div className="relative z-10 -mt-6 px-4">
        {visible ? (
          <article className="rounded-[16px] border border-[#d7e3da] bg-white p-4 shadow-[0_10px_28px_rgba(0,30,22,0.08)]">
            <p className="inline-flex rounded-full bg-[#001e16] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              {SERVICE_AREA}
            </p>
            <h2 className="mt-3 text-[18px] font-semibold leading-snug text-[#001e16]">
              SIH&S — Wilmington, DE Service Area
            </h2>
            <p className="mt-3 flex gap-2 text-[15px] leading-snug text-[#3d4a44]">
              <MapPin size={18} className="mt-0.5 shrink-0 text-[#2f7a1c]" aria-hidden />
              <span>{HQ}</span>
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-[#3d4a44]">
              Delaware intrastate towing only. Interstate movements coordinated through properly authorized carriers.
            </p>
            <a
              href={`tel:${PHONE_TEL}`}
              className="mt-4 flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#5fbb3f] text-[16px] font-semibold text-[#001e16]"
            >
              <Phone size={18} aria-hidden />
              {PHONE_DISPLAY}
            </a>
          </article>
        ) : (
          <article className="rounded-[16px] border border-[#d7e3da] bg-white p-4 text-[15px] leading-relaxed text-[#001e16]">
            No SIH&S service area matches that search. The primary area is Northern New Castle County, Delaware.
          </article>
        )}
      </div>
    </div>
  );
}
