"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

export async function createEvent(formData: FormData) {
  const admin = createAdminClient();
  await admin.from("events").insert({
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "social"),
    price_baht: Number(formData.get("price") || 0),
    day: String(formData.get("day") || "").trim(),
    month: String(formData.get("month") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    details: String(formData.get("details") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    image_url: String(formData.get("image_url") || "").trim(),
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function updateEvent(formData: FormData) {
  const id = String(formData.get("id"));
  const admin = createAdminClient();
  await admin
    .from("events")
    .update({
      title: String(formData.get("title") || "").trim(),
      category: String(formData.get("category") || "social"),
      price_baht: Number(formData.get("price") || 0),
      day: String(formData.get("day") || "").trim(),
      month: String(formData.get("month") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      details: String(formData.get("details") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      image_url: String(formData.get("image_url") || "").trim(),
    })
    .eq("id", id);
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function deleteEvent(id: string) {
  const admin = createAdminClient();
  await admin.from("events").delete().eq("id", id);
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function approveSubmission(id: string) {
  const admin = createAdminClient();
  const { data: sub } = await admin.from("submissions").select("*").eq("id", id).single();
  if (!sub) return;

  await admin.from("events").insert({
    title: sub.title,
    category: sub.category,
    price_baht: sub.price_baht,
    day: sub.day,
    month: sub.month,
    location: sub.location,
    details: sub.details,
    description: sub.description,
    image_url: sub.image_url,
  });
  await admin.from("submissions").update({ status: "approved" }).eq("id", id);
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function dismissSubmission(id: string) {
  const admin = createAdminClient();
  await admin.from("submissions").update({ status: "dismissed" }).eq("id", id);
  revalidatePath("/admin/dashboard");
}

export async function signOutAdmin() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
