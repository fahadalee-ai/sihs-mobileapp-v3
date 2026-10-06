import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import emptyOngoing from "@/img/empty-ongoing.jpg";
import emptyCompleted from "@/img/empty-completed.jpg";
import emptyCanceled from "@/img/empty-canceled.jpg";
import { DEPOSIT_EARNED, REFUND_LINE } from "@/lib/content";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/_app/bookings")({
  head: () => ({ meta: [{ title: "SIH&S — Bookings" }] }),
  component: Bookings,
});

const TABS = ["ongoing", "completed", "canceled"] as const;

const EMPTY_ART = {
  ongoing: emptyOngoing,
  completed: emptyCompleted,
  canceled: emptyCanceled,
} as const;

function Bookings() {
  const { bookings, cancelBooking, rateBooking } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]>("ongoing");
  const navigate = useNavigate();
  const list = bookings.filter((b) => b.status === tab);

  return (
    <div className="px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <h1 className="text-2xl font-semibold">Bookings</h1>
      <div className="mt-4 grid grid-cols-3 gap-2" role="tablist" aria-label="Booking status">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`min-h-11 rounded-md text-sm font-semibold capitalize ${
              tab === item ? "bg-brand text-white" : "border border-border bg-card text-foreground"
            }`}
          >
            {item === "canceled" ? "Canceled" : item}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {list.length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-white p-6 text-center">
            <img
              src={EMPTY_ART[tab]}
              alt=""
              className="mx-auto h-36 w-36 object-contain"
            />
            <p className="mt-3 text-sm font-semibold text-[#001e16]">No {tab} bookings</p>
            <button
              type="button"
              onClick={() => navigate({ to: "/home" })}
              className="mt-3 min-h-11 text-sm font-semibold text-accent-text underline"
            >
              Book New Service
            </button>
          </div>
        )}
        {list.map((booking) => (
          <article key={booking.id} className="rounded-md border border-border bg-card p-4">
            <h2 className="font-semibold">{booking.serviceTitle}</h2>
            <p className="mt-1 text-sm">ID {booking.id}</p>
            <p className="text-sm">{booking.area}</p>
            <p className="text-sm">{booking.when}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{booking.status}</p>
            {booking.status === "canceled" && (
              <div className="mt-3 space-y-2 text-sm">
                <p>Reason: {booking.cancelReason}</p>
                <p>{REFUND_LINE}</p>
                {booking.depositDispatched && <p>{DEPOSIT_EARNED}</p>}
              </div>
            )}
            <div className="mt-3">
              {booking.status === "ongoing" && (
                <button
                  type="button"
                  onClick={() => cancelBooking(booking.id)}
                  className="min-h-11 text-sm font-semibold text-danger underline"
                >
                  Cancel Booking
                </button>
              )}
              {booking.status === "completed" && (
                <button
                  type="button"
                  onClick={() => rateBooking(booking.id)}
                  className="min-h-11 text-sm font-semibold text-accent-text underline"
                >
                  Rate Service
                </button>
              )}
              {booking.status === "canceled" && (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/home" })}
                  className="min-h-11 text-sm font-semibold text-accent-text underline"
                >
                  Book New Service
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
