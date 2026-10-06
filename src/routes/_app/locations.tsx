import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScreenHeader } from "@/components/Chrome";
import { Button, Field, Input } from "@/components/kit";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/_app/locations")({
  head: () => ({ meta: [{ title: "SIH&S — My Locations" }] }),
  component: Locations,
});

function Locations() {
  const { locations, addLocation, updateLocation, removeLocation, user } = useApp();
  const [label, setLabel] = useState("");
  const [line, setLine] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");

  return (
    <div>
      <ScreenHeader title="My Locations" backTo="/profile" />
      <div className="space-y-3 px-4 pb-8">
        {!user && <p className="text-sm">Sign in to save locations. Delaware-area addresses are used for service requests.</p>}
        {locations.map((loc) => (
          <article key={loc.id} className="rounded-md border border-border bg-card p-3">
            {editing === loc.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!label.trim() || !line.trim()) {
                    setError("Label and address are required.");
                    return;
                  }
                  updateLocation(loc.id, { label, line });
                  setEditing(null);
                  setError("");
                }}
              >
                <Field label="Label" error={error || undefined}>
                  <Input value={label} onChange={(e) => setLabel(e.target.value)} />
                </Field>
                <Field label="Address">
                  <Input value={line} onChange={(e) => setLine(e.target.value)} />
                </Field>
                <Button type="submit">Save</Button>
              </form>
            ) : (
              <>
                <h2 className="font-semibold">{loc.label}</h2>
                <p className="text-sm">{loc.line}</p>
                <div className="mt-2 flex gap-4">
                  <button
                    type="button"
                    className="min-h-11 text-sm font-semibold text-accent-text"
                    onClick={() => {
                      setEditing(loc.id);
                      setLabel(loc.label);
                      setLine(loc.line);
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="min-h-11 text-sm font-semibold text-danger" onClick={() => removeLocation(loc.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
        <form
          className="rounded-md border border-border bg-card p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!label.trim() || !line.trim() || editing) {
              setError("Enter a label and a Delaware-area address.");
              return;
            }
            addLocation({ label, line });
            setLabel("");
            setLine("");
            setError("");
          }}
        >
          <h2 className="mb-2 font-semibold">Add a location</h2>
          <Field label="Label" error={error || undefined}>
            <Input value={editing ? "" : label} onChange={(e) => setLabel(e.target.value)} placeholder="Home" disabled={Boolean(editing)} />
          </Field>
          <Field label="Address">
            <Input
              value={editing ? "" : line}
              onChange={(e) => setLine(e.target.value)}
              placeholder="Wilmington, DE"
              disabled={Boolean(editing)}
            />
          </Field>
          <Button type="submit" disabled={Boolean(editing)}>
            Add location
          </Button>
        </form>
      </div>
    </div>
  );
}
