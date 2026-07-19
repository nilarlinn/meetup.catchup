"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { uploadEventPhoto } from "@/lib/upload";

export async function createEvent(formData: FormData) {
  const admin = createAdminClient();
  const photo = formData.get("photo") as File | null;
  const imageUrl = await uploadEventPhoto(admin, photo);

  await admin.from("events").insert({
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "social"),
    price_baht: Number(formData.get("price") || 0),
    day: String(formData.get("day") || "").trim(),
    month: String(formData.get("month") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    details: String(formData.get("details") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    image_url: imageUrl,
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function updateEvent(formData: FormData) {
  const id = String(formData.get("id"));
  const admin = createAdminClient();

  // Keep the existing photo unless a new one was uploaded.
  const existingImageUrl = String(formData.get("existing_image_url") || "");
  const photo = formData.get("photo") as File | null;
  const newImageUrl = await uploadEventPhoto(admin, photo);
  const imageUrl = newImageUrl || existingImageUrl;

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
      image_url: imageUrl,
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
