import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITES } from "@/lib/sites";
import { DemoClient } from "./DemoClient";

export function generateStaticParams() {
  return SITES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const site = SITES.find((s) => s.id === id);
  if (!site) return { title: "Demo not found" };
  return {
    title: `${site.name} — Dimension`,
    description: site.summary,
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = SITES.find((s) => s.id === id);
  if (!site) notFound();
  return <DemoClient site={site} />;
}
