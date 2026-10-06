import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CallHook, ScreenHeader } from "@/components/Chrome";
import { Button } from "@/components/kit";
import { LAB_DISCLOSURE } from "@/lib/content";
import { useApp } from "@/lib/store";

const searchSchema = z.object({ id: z.string().catch("") });

export const Route = createFileRoute("/_app/confirmation")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "SIH&S — Confirmation" }] }),
  component: Confirmation,
});

function Confirmation() {
  const { id } = Route.useSearch();
  const { bookings } = useApp();
  const navigate = useNavigate();
  const booking = bookings.find((b) => b.id === id) ?? bookings[0];

  return (
    <div>
      <ScreenHeader title="Confirmation" />
      <div className="px-4 pb-8">
        <h2 className="text-2xl font-semibold">Request received</h2>
        {booking ? (
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Service</dt>
              <dd className="font-semibold">{booking.serviceTitle}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Booking ID</dt>
              <dd className="font-semibold">{booking.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Square reference</dt>
              <dd className="font-semibold">{booking.squareRef}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">When</dt>
              <dd>{booking.when}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Service area</dt>
              <dd>{booking.area}</dd>
            </div>
            {booking.locationType && (
              <div>
                <dt className="text-muted-foreground">Location type</dt>
                <dd>{booking.locationType}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-3 text-sm">Your request was recorded.</p>
        )}
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Powered by Square</p>
        {(booking?.serviceSlug === "drug-alcohol" || booking?.serviceSlug === "dna") && (
          <p className="mt-4 rounded-md border border-border bg-card p-3 text-sm">
            {LAB_DISCLOSURE}
          </p>
        )}
        <div className="mt-6 space-y-3">
          {(booking?.serviceSlug === "towing" ||
            booking?.serviceSlug === "lockouts" ||
            booking?.serviceSlug === "jump-starts" ||
            booking?.serviceSlug === "fuel-delivery") && <CallHook />}
          <Button type="button" full onClick={() => navigate({ to: "/home" })}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
