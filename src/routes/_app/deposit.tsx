import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ScreenHeader } from "@/components/Chrome";
import { Button } from "@/components/kit";
import { PRICING_APPOINTMENT, SMS_CONSENT, getService } from "@/lib/content";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/_app/deposit")({
  head: () => ({ meta: [{ title: "SIH&S — Deposit" }] }),
  component: Deposit,
});

function Deposit() {
  const { draft, patchDraft, completeBooking } = useApp();
  const navigate = useNavigate();
  const service = draft ? getService(draft.serviceSlug) : undefined;
  const [terms, setTerms] = useState(Boolean(draft?.termsAccepted));
  const [sms, setSms] = useState(Boolean(draft?.smsAccepted));
  const [phase, setPhase] = useState<"ack" | "square">("ack");

  if (!draft || !service) {
    return (
      <div>
        <ScreenHeader title="Deposit" />
        <p className="px-4 text-sm">Start a request before the deposit step.</p>
      </div>
    );
  }

  const pay = (kind: "deposit" | "balance") => {
    const id = completeBooking({
      squareRef: `SQ-${kind.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      when: draft.when || "Pending SIH&S confirmation",
      locationType: draft.locationType,
    });
    navigate({ to: "/confirmation", search: { id } });
  };

  return (
    <div>
      <ScreenHeader title="Deposit & Dispatch" />
      <div className="px-4 pb-8">
        <p className="rounded-md bg-brand p-3 text-sm font-semibold text-white">{PRICING_APPOINTMENT}</p>
        <p className="mt-3 text-sm">{service.title}</p>

        {phase === "ack" ? (
          <>
            <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  patchDraft({ termsAccepted: e.target.checked });
                }}
              />
              <span>
                Accept Service Terms — I have reviewed the{" "}
                <Link to="/legal/$doc" params={{ doc: "terms" }} className="font-semibold text-accent-text underline">
                  Full Terms & Agreement
                </Link>
                .
              </span>
            </label>
            <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={sms}
                onChange={(e) => {
                  setSms(e.target.checked);
                  patchDraft({ smsAccepted: e.target.checked });
                }}
              />
              <span>
                {SMS_CONSENT}{" "}
                <Link to="/legal/$doc" params={{ doc: "privacy" }} className="font-semibold text-accent-text underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            <Button type="button" full className="mt-6" disabled={!terms || !sms} onClick={() => setPhase("square")}>
              Continue to Deposit
            </Button>
          </>
        ) : (
          <div className="mt-4 rounded-md border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Powered by Square</p>
            <p className="mt-2 text-sm">You are completing scheduling/payment through Square-hosted checkout.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This screen does not collect card numbers. Payment continues in Square.
            </p>
            <Button type="button" full className="mt-4" onClick={() => pay("deposit")}>
              Pay Deposit (Square)
            </Button>
            <Button type="button" variant="outline" full className="mt-3" onClick={() => pay("balance")}>
              Pay Balance (Square)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
