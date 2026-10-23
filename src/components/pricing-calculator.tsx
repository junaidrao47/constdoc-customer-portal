"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { messageForError } from "@/lib/errors";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/messages";
import type { Industry, Location, Package, Service, WorkerRange } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function PricingCalculator() {
  const locale = useLocale();

  const locations = useQuery({
    queryKey: ["public-locations"],
    queryFn: () => apiRequest<Location[]>("/public/locations"),
  });
  const industries = useQuery({
    queryKey: ["public-industries"],
    queryFn: () => apiRequest<Industry[]>("/public/industries"),
  });
  const ranges = useQuery({
    queryKey: ["public-ranges"],
    queryFn: () => apiRequest<WorkerRange[]>("/public/worker-ranges"),
  });
  const services = useQuery({
    queryKey: ["public-services-calc"],
    queryFn: () => apiRequest<Service[]>("/public/services"),
  });
  const packages = useQuery({
    queryKey: ["public-packages-calc"],
    queryFn: () => apiRequest<Package[]>("/public/packages"),
  });

  const [workers, setWorkers] = useState("10");
  const [locationId, setLocationId] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [packageId, setPackageId] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const selectedPackage = packages.data?.find((pkg) => pkg.id === packageId) ?? null;

  function choosePackage(id: string) {
    setPackageId(id);
    // The calculate endpoint prices workers × location × industry + services; it has no
    // packageId. Selecting a package therefore pre-fills its bundled services so the
    // estimate reflects them, while the package's own flat price is shown alongside.
    const pkg = packages.data?.find((item) => item.id === id);
    if (pkg) setServiceIds(pkg.services.map((service) => service.id));
  }

  function toggleService(id: string) {
    setPackageId("");
    setServiceIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  async function calculate() {
    if (!locationId || !industryId || !ranges.data?.length) return;
    setError("");
    setIsCalculating(true);
    try {
      const result = await apiRequest<{ total: number }>("/public/quotations/calculate", {
        method: "POST",
        body: JSON.stringify({
          workerCount: Number(workers),
          locationId,
          industryId,
          serviceIds,
        }),
      });
      setTotal(result.total);
    } catch (cause) {
      setError(messageForError(cause instanceof ApiError ? cause : cause, locale));
    } finally {
      setIsCalculating(false);
    }
  }

  const depsError = locations.isError || industries.isError || ranges.isError;

  return (
    <section id="calculator" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">
            Pricing calculator
          </p>
          <h2 className="mt-2 font-serif text-4xl">A first estimate, grounded in your details.</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Choose your location, industry, team size, and the services you need. The API
            calculates from configured database pricing.
          </p>
        </div>
        <div className="border border-border bg-card p-6">
          {depsError && (
            <p
              role="alert"
              className="mb-4 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {messageForError(locations.error ?? industries.error ?? ranges.error, locale)}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Workers
              <input
                className="mt-2 h-11 w-full border px-3"
                type="number"
                min="1"
                value={workers}
                onChange={(event) => setWorkers(event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              Location
              <select
                className="mt-2 h-11 w-full border px-3"
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
              >
                <option value="">
                  {locations.isLoading ? t(locale, "state.loading") : "Select location"}
                </option>
                {locations.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.city}, {item.state}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Industry
              <select
                className="mt-2 h-11 w-full border px-3"
                value={industryId}
                onChange={(event) => setIndustryId(event.target.value)}
              >
                <option value="">
                  {industries.isLoading ? t(locale, "state.loading") : "Select industry"}
                </option>
                {industries.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              {t(locale, "calc.package")}
              <select
                className="mt-2 h-11 w-full border px-3"
                value={packageId}
                onChange={(event) => choosePackage(event.target.value)}
              >
                <option value="">{t(locale, "calc.packageNone")}</option>
                {packages.data?.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">{t(locale, "calc.services")}</legend>
            {services.isLoading && (
              <p className="mt-2 text-sm text-muted-foreground">{t(locale, "state.loading")}</p>
            )}
            {services.isError && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {messageForError(services.error, locale)}
              </p>
            )}
            {services.data && (
              <div className="mt-2 grid max-h-44 gap-2 overflow-y-auto border border-border p-3 sm:grid-cols-2">
                {services.data.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t(locale, "calc.selectServices")}</p>
                )}
                {services.data.map((service) => (
                  <label key={service.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={serviceIds.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                    />
                    {service.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          {selectedPackage && (
            <p className="mt-3 text-sm text-muted-foreground">
              {t(locale, "calc.packagePrice")}:{" "}
              <span className="font-semibold text-foreground">
                {formatMoney(selectedPackage.price)}
              </span>
            </p>
          )}

          <button
            onClick={() => void calculate()}
            disabled={!locationId || !industryId || !ranges.data?.length || isCalculating}
            className="mt-6 bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCalculating ? "Calculating..." : "Calculate estimate"}
          </button>
          {error && (
            <p
              role="alert"
              className="mt-4 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          {total !== null && (
            <div className="mt-6 border-t border-border pt-5">
              <CheckCircle2 className="text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Estimated total</p>
              <p className="font-serif text-4xl">{formatMoney(total)}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
