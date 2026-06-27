"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseAdmin, hasSupabaseServerEnv } from "@/lib/supabase/admin";

const DEMO_HOUSEHOLD_SLUG = "freshmind-demo";

async function getHouseholdId() {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const lookup = await supabase
    .from("households")
    .select("id")
    .eq("slug", DEMO_HOUSEHOLD_SLUG)
    .maybeSingle();
  const data = lookup.data as { id: string } | null;
  const error = lookup.error;

  if (error) throw error;
  if (data?.id) return data.id;

  const insertResult = await supabase
    .from("households")
    .insert({
      name: "FreshMind Demo Home",
      slug: DEMO_HOUSEHOLD_SLUG,
    })
    .select("id")
    .single();
  const created = insertResult.data as { id: string };
  const createError = insertResult.error;

  if (createError) throw createError;
  return created.id;
}

export async function addFoodItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name || !hasSupabaseServerEnv()) {
    revalidatePath("/");
    return;
  }

  const householdId = await getHouseholdId();
  if (!householdId) {
    revalidatePath("/");
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("food_items").insert({
    household_id: householdId,
    name,
    category: String(formData.get("category") ?? "Other").trim() || "Other",
    quantity_label: String(formData.get("quantityLabel") ?? "1 item").trim() || "1 item",
    storage_location: String(formData.get("storageLocation") ?? "fridge").trim() || "fridge",
    expiry_date: String(formData.get("expiryDate") ?? "").trim() || null,
    status: "active",
    added_by: "Web app",
  });

  if (error) throw error;
  revalidatePath("/");
}

export async function toggleFoodStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "used");

  if (!id || !hasSupabaseServerEnv()) {
    revalidatePath("/");
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("food_items")
    .update({ status: nextStatus })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/");
}

export async function addShoppingItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name || !hasSupabaseServerEnv()) {
    revalidatePath("/");
    return;
  }

  const householdId = await getHouseholdId();
  if (!householdId) {
    revalidatePath("/");
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("shopping_list_items").insert({
    household_id: householdId,
    name,
    note: String(formData.get("note") ?? "Manual add").trim() || "Manual add",
    completed: false,
    source: "manual",
  });

  if (error) throw error;
  revalidatePath("/");
}

export async function toggleShoppingItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const completed = String(formData.get("completed") ?? "false") === "true";

  if (!id || !hasSupabaseServerEnv()) {
    revalidatePath("/");
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ completed: !completed })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/");
}
