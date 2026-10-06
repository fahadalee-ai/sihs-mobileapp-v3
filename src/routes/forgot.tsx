import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CallHook, ScreenHeader } from "@/components/Chrome";
import { Button, Field, Input } from "@/components/kit";

export const Route = createFileRoute("/forgot")({
  head: () => ({ meta: [{ title: "SIH&S — Forgot password" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="theme-dark min-h-dvh bg-brand text-white">
      <ScreenHeader title="Forgot Password" backTo="/login" dark />
      <form
        className="px-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.includes("@")) {
            setError("Enter a valid email address.");
            return;
          }
          setError("");
          setSent(true);
        }}
      >
        <p className="mb-4 text-sm text-[#c5d4cc]">
          Enter the email on your SIH&S account. If it matches, we will send reset instructions.
        </p>
        <Field label="Email" error={error || undefined}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
        </Field>
        <Button type="submit" full>
          Send reset link
        </Button>
        {sent && (
          <p role="status" className="mt-4 text-sm text-[#8fd86f]">
            If an account exists for that email, reset instructions are on the way.
          </p>
        )}
        <div className="mt-8">
          <CallHook dark />
        </div>
      </form>
    </div>
  );
}
