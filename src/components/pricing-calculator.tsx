"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { Industry, Location, Service, WorkerRange } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function PricingCalculator() {
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
  const [workers, setWorkers] = useState("10");
  const [locationId, setLocationId] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

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
          serviceIds: services.data?.slice(0, 1).map((item) => item.id) ?? [],
        }),
      });
      setTotal(result.total);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The estimate could not be calculated.");
    } finally {
      setIsCalculating(false);
    }
  }

  return (
    <section id="calculator" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">
            Pricing calculator
          </p>
          <h2 className="mt-2 font-serif text-4xl">A first estimate, grounded in your details.</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Choose your location, industry, and team size. The API calculates from configured
            database pricing.
          </p>
        </div>
        <div className="border border-border bg-card p-6">
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
                <option value="">Select location</option>
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
                <option value="">Select industry</option>
                {industries.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
