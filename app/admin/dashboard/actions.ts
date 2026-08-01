"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { uploadEventPhoto } from "@/lib/upload";
import { sendTicketConfirmationEmail } from "@/lib/email";

// Turns "2026-08-02" into { day: "02", month: "AUG" } so the existing
// ticket-card display (which shows day/month separately) keeps working
// without needing to reformat a real date on every page.
function splitEventDate(eventDate: string) {
  if (!eventDate) return { day: "", month: "" };
  const d = new Date(`${eventDate}T00:00:00`);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return { day, month };
}

export async function createEvent(formData: FormData) {
  const admin = createAdminClient();
  const photo = formData.get("photo") as File | null;

  let imageUrl = "";
  try {
    imageUrl = await uploadEventPhoto(admin, photo);
  } catch (e: any) {
    redirect(`/admin/dashboard?error=${encodeURIComponent(e.message || "Photo upload failed")}`);
  }

  const eventDate = String(formData.get("event_date") || "").trim();
  const { day, month } = splitEventDate(eventDate);
  const capacityRaw = String(formData.get("capacity") || "").trim();
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const startTime = String(formData.get("start_time") || "").trim() || null;
  const endTime = String(formData.get("end_time") || "").trim() || null;

  const { error } = await admin.from("events").insert({
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "social"),
    price_baht: Number(formData.get("price") || 0),
    day,
    month,
    event_date: eventDate || null,
    capacity,
    start_time: startTime,
    end_time: endTime,
    location: String(formData.get("location") || "").trim(),
    details: String(formData.get("details") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    image_url: imageUrl,
  });

  if (error) {
    console.error("createEvent failed:", error);
    redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  redirect("/admin/dashboard?saved=1");
}

export async function updateEvent(formData: FormData) {
  const id = String(formData.get("id"));
  const admin = createAdminClient();

  // Keep the existing photo unless a new one was uploaded.
  const existingImageUrl = String(formData.get("existing_image_url") || "");
  const photo = formData.get("photo") as File | null;

  let newImageUrl = "";
  try {
    newImageUrl = await uploadEventPhoto(admin, photo);
  } catch (e: any) {
    redirect(`/admin/dashboard?error=${encodeURIComponent(e.message || "Photo upload failed")}`);
  }
  const imageUrl = newImageUrl || existingImageUrl;

  const eventDate = String(formData.get("event_date") || "").trim();
  const { day, month } = splitEventDate(eventDate);
  const capacityRaw = String(formData.get("capacity") || "").trim();
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const startTime = String(formData.get("start_time") || "").trim() || null;
  const endTime = String(formData.get("end_time") || "").trim() || null;

  const { error } = await admin
    .from("events")
    .update({
      title: String(formData.get("title") || "").trim(),
      category: String(formData.get("category") || "social"),
      price_baht: Number(formData.get("price") || 0),
      day,
      month,
      event_date: eventDate || null,
      capacity,
    start_time: startTime,
    end_time: endTime,
      location: String(formData.get("location") || "").trim(),
      details: String(formData.get("details") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      image_url: imageUrl,
    })
    .eq("id", id);

  if (error) {
    console.error("updateEvent failed:", error);
    redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  redirect("/admin/dashboard?saved=1");
}

export async function deleteEvent(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("events").delete().eq("id", id);

  if (error) {
    console.error("deleteEvent failed:", error);
    redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  redirect("/admin/dashboard?saved=1");
}

export async function approveSubmission(id: string) {
  const admin = createAdminClient();
  const { data: sub } = await admin.from("submissions").select("*").eq("id", id).single();
  if (!sub) {
    redirect(`/admin/dashboard?error=${encodeURIComponent("Submission not found")}`);
  }

  const { error: insertError } = await admin.from("events").insert({
    title: sub!.title,
    category: sub!.category,
    price_baht: sub!.price_baht,
    day: sub!.day,
    month: sub!.month,
    location: sub!.location,
    details: sub!.details,
    description: sub!.description,
    image_url: sub!.image_url,
  });

  if (insertError) {
    console.error("approveSubmission failed:", insertError);
    redirect(`/admin/dashboard?error=${encodeURIComponent(insertError.message)}`);
  }

  const { error: statusError } = await admin
    .from("submissions")
    .update({ status: "approved" })
    .eq("id", id);

  if (statusError) {
    console.error("approveSubmission status update failed:", statusError);
    redirect(`/admin/dashboard?error=${encodeURIComponent(statusError.message)}`);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  redirect("/admin/dashboard?saved=1");
}

export async function dismissSubmission(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("submissions").update({ status: "dismissed" }).eq("id", id);

  if (error) {
    console.error("dismissSubmission failed:", error);
    redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard?saved=1");
}

export async function signOutAdmin() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updatePaymentQR(formData: FormData) {
  const admin = createAdminClient();
  const photo = formData.get("qr_photo") as File | null;

  if (!photo || photo.size === 0) {
    redirect(`/admin/dashboard?error=${encodeURIComponent("Choose a QR code image first")}`);
  }

  let qrUrl = "";
  try {
    qrUrl = await uploadEventPhoto(admin, photo);
  } catch (e: any) {
    redirect(`/admin/dashboard?error=${encodeURIComponent(e.message || "QR upload failed")}`);
  }

  const { error } = await admin.from("site_settings").update({ promptpay_qr_url: qrUrl }).eq("id", 1);

  if (error) {
    console.error("updatePaymentQR failed:", error);
    redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/events", "layout");
  redirect("/admin/dashboard?saved=1");
}

// Called when the organizer has checked their bank app and confirms a
// direct-QR payment actually came through. Flips the ticket to "paid"
// and sends the customer their real confirmation email.
export async function confirmManualPayment(ticketId: string) {
  const admin = createAdminClient();

  const { data: ticket } = await admin
    .from("tickets")
    .select("*, events(*)")
    .eq("id", ticketId)
    .single();

  if (!ticket) {
    redirect(`/admin/dashboard?error=${encodeURIComponent("Ticket not found")}`);
  }

  const { error } = await admin.from("tickets").update({ status: "paid" }).eq("id", ticketId);

  if (error) {
    console.error("confirmManualPayment failed:", error);
    redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  const ev = ticket!.events;
  if (ev) {
    await sendTicketConfirmationEmail({
      to: ticket!.email,
      name: ticket!.name,
      eventTitle: ev.title,
      eventWhen: `${ev.day} ${ev.month}`,
      eventWhere: ev.location,
      paid: true,
      priceLabel: `฿${Number(ev.price_baht).toFixed(0)}`,
    });
  }

  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard?saved=1");
}
