"use server";

import { revalidatePath } from "next/cache";

import {
  addFirebaseFoodItem,
  addFirebaseShoppingItem,
  deleteFirebaseFoodItem,
  deleteFirebaseShoppingItem,
  updateFirebaseFoodStatus,
  updateFirebaseShoppingItem,
} from "@/lib/firebase/server";

export async function addFoodItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    revalidatePath("/");
    return;
  }

  await addFirebaseFoodItem({
    name,
    category: String(formData.get("category") ?? "Other").trim() || "Other",
    quantityLabel: String(formData.get("quantityLabel") ?? "1 item").trim() || "1 item",
    storageLocation: String(formData.get("storageLocation") ?? "fridge").trim() || "fridge",
    expiryDate: String(formData.get("expiryDate") ?? "").trim() || null,
  });

  revalidatePath("/");
}

export async function toggleFoodStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "used");

  if (!id) {
    revalidatePath("/");
    return;
  }

  await updateFirebaseFoodStatus(id, nextStatus);
  revalidatePath("/");
}

export async function deleteFoodItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    revalidatePath("/");
    return;
  }

  await deleteFirebaseFoodItem(id);
  revalidatePath("/");
}

export async function addShoppingItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    revalidatePath("/");
    return;
  }

  await addFirebaseShoppingItem({
    name,
    note: String(formData.get("note") ?? "Manual add").trim() || "Manual add",
  });

  revalidatePath("/");
}

export async function addRecipeMissingItems(formData: FormData) {
  const items = formData
    .getAll("item")
    .map((item) => String(item).trim())
    .filter(Boolean);
  const recipe = String(formData.get("recipe") ?? "Recipe").trim() || "Recipe";

  await Promise.all(
    items.map((name) =>
      addFirebaseShoppingItem({
        name,
        note: `Needed for ${recipe}`,
      }),
    ),
  );

  revalidatePath("/");
}

export async function toggleShoppingItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const completed = String(formData.get("completed") ?? "false") === "true";

  if (!id) {
    revalidatePath("/");
    return;
  }

  await updateFirebaseShoppingItem(id, !completed);
  revalidatePath("/");
}

export async function deleteShoppingItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    revalidatePath("/");
    return;
  }

  await deleteFirebaseShoppingItem(id);
  revalidatePath("/");
}
