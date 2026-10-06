import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/Chrome";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/_app/payment")({
  head: () => ({ meta: [{ title: "SIH&S — Payment" }] }),
  component: Payment,
});

function Payment() {
  const { cardLast4 } = useApp();
  return (
    <div>
      <ScreenHeader title="Payment Method" backTo="/profile" />
      <div className="px-4">
        <p className="text-sm leading-relaxed">
          SIH&S does not store raw card numbers. Payments are completed in Square-hosted checkout.
        </p>
        {cardLast4 ? (
          <p className="mt-4 rounded-md border border-border bg-card p-4 text-sm font-semibold">
            Card on file with Square · •••• {cardLast4}
          </p>
        ) : (
          <p className="mt-4 text-sm">No Square card reference yet.</p>
        )}
        <a
          href="https://squareup.com/"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent-text underline"
          target="_blank"
          rel="noreferrer"
        >
          Manage in Square
        </a>
      </div>
    </div>
  );
}
