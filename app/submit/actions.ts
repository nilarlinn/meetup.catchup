"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";

export async function submitEvent(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const contact = String(formData.get("contact") || "").trim();

  if (!title || !contact) {
    throw new Error("Title and contact info are required.");
  }

  const admin = createAdminClient();
  await admin.from("submissions").insert({
    submitter_name: String(formData.get("name") || "").trim(),
    contact,
    title,
    category: String(formData.get("category") || "social"),
    price_baht: Number(formData.get("price") || 0),
    day: String(formData.get("day") || "").trim(),
    month: String(formData.get("month") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    details: String(formData.get("details") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    status: "pending",
  });

  redirect("/submit/thanks");
}
