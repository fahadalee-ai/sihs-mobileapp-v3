import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ScreenHeader } from "@/components/Chrome";
import { Button, Field, Input, MenuSelect, Textarea } from "@/components/kit";
import { getService } from "@/lib/content";
import { useApp } from "@/lib/store";
import { VEHICLE_COLORS, VEHICLE_MAKES, VEHICLE_YEARS, modelsForMake } from "@/lib/vehicles";

const searchSchema = z.object({ slug: z.string().catch("") });

export const Route = createFileRoute("/_app/request")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "SIH&S — Request" }] }),
  component: RequestScreen,
});

function RequestScreen() {
  const { slug } = Route.useSearch();
  const { draft, patchDraft, setDraft } = useApp();
  const navigate = useNavigate();
  const service = getService(slug) ?? (draft ? getService(draft.serviceSlug) : undefined);

  useEffect(() => {
    if (service && draft?.serviceSlug !== service.slug) {
      setDraft({ serviceSlug: service.slug, locationType: draft?.locationType });
    }
  }, [service, draft, setDraft]);
  const [make, setMake] = useState(draft?.vehicle?.make ?? "");
  const [model, setModel] = useState(draft?.vehicle?.model ?? "");
  const [year, setYear] = useState(draft?.vehicle?.year ?? "");
  const [color, setColor] = useState(draft?.vehicle?.color ?? "");
  const [plate, setPlate] = useState(draft?.vehicle?.plate ?? "");
  const [notes, setNotes] = useState(draft?.vehicle?.notes ?? "");
  const [when, setWhen] = useState(draft?.when ?? "");
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState<"make" | "model" | "year" | "color" | null>(null);

  if (!service) {
    return (
      <div>
        <ScreenHeader title="Request" />
        <p className="px-4 text-sm">Choose a service and sign in before continuing.</p>
      </div>
    );
  }

  const dispatch = service.kind === "dispatch";
  const models = modelsForMake(make);

  return (
    <div>
      <ScreenHeader title={service.title} />
      <form
        className="px-4 pb-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (dispatch && (!make.trim() || !model.trim() || !year.trim() || !color.trim())) {
            setError("Make, model, year, and color are required.");
            return;
          }
          if (!dispatch && !when) {
            setError("Choose a date and time.");
            return;
          }
          patchDraft({
            when: dispatch ? "Dispatch requested — time confirmed by SIH&S" : when,
            vehicle: dispatch ? { make, model, year, color, plate, notes } : undefined,
          });
          navigate({ to: "/deposit" });
        }}
      >
        <p className="mb-4 text-sm text-muted-foreground">{service.title}</p>
        {dispatch ? (
          <>
            {error && (
              <p className="mb-3 text-sm font-medium text-danger" role="alert">
                {error}
              </p>
            )}
            <Field label="Make" nativeLabel={false}>
              <MenuSelect
                value={make}
                placeholder="Select make"
                options={VEHICLE_MAKES}
                open={openMenu === "make"}
                onOpenChange={(next) => setOpenMenu(next ? "make" : null)}
                onChange={(next) => {
                  setMake(next);
                  if (!modelsForMake(next).includes(model)) setModel("");
                }}
              />
            </Field>
            <Field label="Model" nativeLabel={false}>
              <MenuSelect
                value={model}
                placeholder={make ? "Select model" : "Select a make first"}
                options={models}
                disabled={!make}
                open={openMenu === "model"}
                onOpenChange={(next) => setOpenMenu(next ? "model" : null)}
                onChange={setModel}
              />
            </Field>
            <Field label="Year" nativeLabel={false}>
              <MenuSelect
                value={year}
                placeholder="Select year"
                options={VEHICLE_YEARS}
                open={openMenu === "year"}
                onOpenChange={(next) => setOpenMenu(next ? "year" : null)}
                onChange={setYear}
              />
            </Field>
            <Field label="Color" nativeLabel={false}>
              <MenuSelect
                value={color}
                placeholder="Select color"
                options={VEHICLE_COLORS}
                open={openMenu === "color"}
                onOpenChange={(next) => setOpenMenu(next ? "color" : null)}
                onChange={setColor}
              />
            </Field>
            <Field label="License Plate (optional)">
              <Input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="DE plate" />
            </Field>
            <Field label="Additional Notes">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gate code, landmark, or access notes" />
            </Field>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm">
              Location: {draft?.locationType === "in-office" ? "In-office, Wilmington, DE" : draft?.locationType === "mobile" ? "Mobile — Northern New Castle County, DE" : "Appointment"}
            </p>
            <Field label="Date and time" error={error || undefined}>
              <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </Field>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Powered by Square</p>
            <p className="mt-1 text-sm">You are completing scheduling/payment through Square-hosted checkout.</p>
          </>
        )}
        <Button type="submit" full className="mt-4">
          Continue
        </Button>
      </form>
    </div>
  );
}
