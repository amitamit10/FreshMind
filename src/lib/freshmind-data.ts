import "server-only";

import { getSupabaseAdmin, hasSupabaseServerEnv } from "@/lib/supabase/admin";

export type StorageLocation =
  | "fridge"
  | "freezer"
  | "pantry"
  | "cabinet"
  | "other";

export type FoodStatus = "active" | "used" | "finished" | "expired";
export type ExpiryStatus = "Urgent" | "Soon" | "Safe";

export type FoodItem = {
  id: string;
  name: string;
  category: string;
  quantityLabel: string;
  storageLocation: StorageLocation;
  expiryDate: string | null;
  status: FoodStatus;
  addedBy: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  note: string;
  completed: boolean;
};

export type FreshMindData = {
  mode: "demo" | "live" | "error";
  message: string;
  householdName: string;
  items: FoodItem[];
  shoppingItems: ShoppingItem[];
};

const DEMO_HOUSEHOLD = {
  name: "FreshMind Demo Home",
  slug: "freshmind-demo",
};

const demoItems: FoodItem[] = [
  {
    id: "demo-yogurt",
    name: "Greek Yogurt",
    category: "Dairy",
    quantityLabel: "1 tub",
    storageLocation: "fridge",
    expiryDate: "2026-06-29",
    status: "active",
    addedBy: "Amit",
  },
  {
    id: "demo-tomatoes",
    name: "Tomatoes",
    category: "Produce",
    quantityLabel: "4 left",
    storageLocation: "other",
    expiryDate: "2026-06-30",
    status: "active",
    addedBy: "Amit",
  },
  {
    id: "demo-eggs",
    name: "Eggs",
    category: "Dairy",
    quantityLabel: "8 eggs",
    storageLocation: "fridge",
    expiryDate: "2026-07-03",
    status: "active",
    addedBy: "Dana",
  },
  {
    id: "demo-mushrooms",
    name: "Mushrooms",
    category: "Produce",
    quantityLabel: "250g",
    storageLocation: "fridge",
    expiryDate: "2026-06-29",
    status: "active",
    addedBy: "Dana",
  },
];

const demoShoppingItems: ShoppingItem[] = [
  { id: "shop-garlic", name: "Garlic", note: "Missing from rescue meal", completed: false },
  { id: "shop-pasta", name: "Pasta", note: "Add from recipes", completed: false },
  { id: "shop-oil", name: "Olive oil", note: "House staple", completed: true },
  { id: "shop-parsley", name: "Parsley", note: "Fresh garnish", completed: false },
];

function startOfToday() {
  return new Date(new Date().toISOString().slice(0, 10));
}

export function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return "Safe";

  const today = startOfToday();
  const expiry = new Date(expiryDate);
  const diffInDays = Math.floor((expiry.getTime() - today.getTime()) / 86400000);

  if (diffInDays <= 1) return "Urgent";
  if (diffInDays <= 3) return "Soon";
  return "Safe";
}

export function formatExpiryCopy(expiryDate: string | null) {
  if (!expiryDate) return "No expiry set";

  const today = startOfToday();
  const expiry = new Date(expiryDate);
  const diffInDays = Math.floor((expiry.getTime() - today.getTime()) / 86400000);

  if (diffInDays < 0) return "Expired";
  if (diffInDays === 0) return "Expires today";
  if (diffInDays === 1) return "Expires tomorrow";
  return `Expires in ${diffInDays} days`;
}

function sortItems(items: FoodItem[]) {
  return [...items].sort((a, b) => {
    const aScore = getExpiryStatus(a.expiryDate);
    const bScore = getExpiryStatus(b.expiryDate);
    const order = { Urgent: 0, Soon: 1, Safe: 2 };

    if (order[aScore] !== order[bScore]) {
      return order[aScore] - order[bScore];
    }

    return a.name.localeCompare(b.name);
  });
}

async function ensureDemoHousehold() {
  const supabase = getSupabaseAdmin();

  const { data: existing, error: findError } = await supabase
    .from("households")
    .select("id, name")
    .eq("slug", DEMO_HOUSEHOLD.slug)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("households")
    .insert({
      name: DEMO_HOUSEHOLD.name,
      slug: DEMO_HOUSEHOLD.slug,
    })
    .select("id, name")
    .single();

  if (createError) throw createError;
  return created;
}

export async function getFreshMindData(): Promise<FreshMindData> {
  if (!hasSupabaseServerEnv()) {
    return {
      mode: "demo",
      message: "Running on demo data until Supabase env vars are configured.",
      householdName: DEMO_HOUSEHOLD.name,
      items: sortItems(demoItems),
      shoppingItems: demoShoppingItems,
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const household = await ensureDemoHousehold();

    const [{ data: items, error: itemsError }, { data: shoppingItems, error: shoppingError }] =
      await Promise.all([
        supabase
          .from("food_items")
          .select(
            "id, name, category, quantity_label, storage_location, expiry_date, status, added_by",
          )
          .eq("household_id", household.id)
          .order("expiry_date", { ascending: true, nullsFirst: false }),
        supabase
          .from("shopping_list_items")
          .select("id, name, note, completed")
          .eq("household_id", household.id)
          .order("completed", { ascending: true })
          .order("created_at", { ascending: false }),
      ]);

    if (itemsError) throw itemsError;
    if (shoppingError) throw shoppingError;

    return {
      mode: "live",
      message: "Connected to Supabase live data.",
      householdName: household.name,
      items: sortItems(
        (items ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category ?? "Other",
          quantityLabel: item.quantity_label ?? "1 item",
          storageLocation: (item.storage_location ?? "other") as StorageLocation,
          expiryDate: item.expiry_date,
          status: (item.status ?? "active") as FoodStatus,
          addedBy: item.added_by ?? "Household",
        })),
      ),
      shoppingItems: (shoppingItems ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        note: item.note ?? "House staple",
        completed: item.completed,
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase error.";

    return {
      mode: "error",
      message: `Supabase is configured, but the schema is not ready yet. ${message}`,
      householdName: DEMO_HOUSEHOLD.name,
      items: sortItems(demoItems),
      shoppingItems: demoShoppingItems,
    };
  }
}
