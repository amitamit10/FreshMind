import "server-only";

import { getFirebaseFreshMindData } from "@/lib/firebase/server";

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

export async function getFreshMindData(): Promise<FreshMindData> {
  try {
    const data = await getFirebaseFreshMindData();

    return {
      ...data,
      items: sortItems(data.items),
      shoppingItems: [...data.shoppingItems].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.name.localeCompare(b.name);
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Firebase error.";

    return {
      mode: "error",
      message: `Firebase is configured, but live data is not ready yet. ${message}`,
      householdName: "FreshMind Demo Home",
      items: [],
      shoppingItems: [],
    };
  }
}
