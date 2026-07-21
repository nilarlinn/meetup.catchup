import type { SupabaseClient } from "@supabase/supabase-js";

// Uploads a photo to the "event-photos" Supabase Storage bucket and
// returns its public URL. Returns an empty string if no file was given.
// Throws if a file WAS given but the upload failed, so the caller can
// surface the real error instead of silently saving without a photo.
export async function uploadEventPhoto(
  admin: SupabaseClient,
  file: File | null
): Promise<string> {
  if (!file || file.size === 0) return "";

  const ext = file.name.split(".").pop() || "jpg";
  const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await admin.storage.from("event-photos").upload(path, arrayBuffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    console.error("Photo upload failed:", error);
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  const { data } = admin.storage.from("event-photos").getPublicUrl(path);
  return data.publicUrl;
}
