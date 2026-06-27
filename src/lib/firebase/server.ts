import "server-only";

import type { FoodItem, FoodStatus, ShoppingItem, StorageLocation } from "@/lib/freshmind-data";

type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { nullValue: null };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
};

type FirebaseTokenResponse = {
  id_token?: string;
  user_id?: string;
  error?: {
    message?: string;
  };
};

const DEMO_UID = process.env.FIREBASE_DEMO_UID;
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_REFRESH_TOKEN = process.env.FIREBASE_DEMO_REFRESH_TOKEN;

const demoFoodItems: FoodItem[] = [
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

function hasFirebaseServerEnv() {
  return Boolean(DEMO_UID && FIREBASE_API_KEY && FIREBASE_PROJECT_ID && FIREBASE_REFRESH_TOKEN);
}

function getDocumentId(name: string) {
  return name.split("/").pop() ?? crypto.randomUUID();
}

function stringField(fields: FirestoreDocument["fields"], key: string, fallback = "") {
  const value = fields?.[key];
  return value && "stringValue" in value ? value.stringValue : fallback;
}

function nullableStringField(fields: FirestoreDocument["fields"], key: string) {
  const value = fields?.[key];
  if (!value || "nullValue" in value) return null;
  return "stringValue" in value ? value.stringValue : null;
}

function booleanField(fields: FirestoreDocument["fields"], key: string, fallback = false) {
  const value = fields?.[key];
  return value && "booleanValue" in value ? value.booleanValue : fallback;
}

function toFirestoreFields(data: Record<string, string | boolean | null>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (typeof value === "boolean") return [key, { booleanValue: value }];
      if (value === null) return [key, { nullValue: null }];
      return [key, { stringValue: value }];
    }),
  ) as Record<string, FirestoreValue>;
}

async function getFirebaseIdToken() {
  if (!hasFirebaseServerEnv()) {
    throw new Error("Missing Firebase server environment variables.");
  }

  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: FIREBASE_REFRESH_TOKEN!,
      }),
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as FirebaseTokenResponse;

  if (!response.ok || !payload.id_token) {
    throw new Error(payload.error?.message ?? "Unable to refresh Firebase ID token.");
  }

  if (payload.user_id && payload.user_id !== DEMO_UID) {
    throw new Error("Firebase demo user does not match FIREBASE_DEMO_UID.");
  }

  return payload.id_token;
}

async function firestoreFetch(path: string, init: RequestInit = {}) {
  const idToken = await getFirebaseIdToken();
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Firestore request failed: ${response.status} ${detail}`);
  }

  return response;
}

async function listCollection(collection: "foodItems" | "shoppingItems") {
  const response = await firestoreFetch(`users/${DEMO_UID}/${collection}?pageSize=100`);
  return (await response.json()) as FirestoreListResponse;
}

async function createDocument(
  collection: "foodItems" | "shoppingItems",
  data: Record<string, string | boolean | null>,
  documentId?: string,
) {
  const suffix = documentId ? `?documentId=${encodeURIComponent(documentId)}` : "";
  await firestoreFetch(`users/${DEMO_UID}/${collection}${suffix}`, {
    method: "POST",
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
}

export async function seedFreshMindDataIfNeeded() {
  if (!hasFirebaseServerEnv()) return;

  const [foodItems, shoppingItems] = await Promise.all([
    listCollection("foodItems"),
    listCollection("shoppingItems"),
  ]);

  await Promise.all([
    ...(foodItems.documents?.length
      ? []
      : demoFoodItems.map((item) =>
          createDocument(
            "foodItems",
            {
              name: item.name,
              category: item.category,
              quantityLabel: item.quantityLabel,
              storageLocation: item.storageLocation,
              expiryDate: item.expiryDate,
              status: item.status,
              addedBy: item.addedBy,
            },
            item.id,
          ),
        )),
    ...(shoppingItems.documents?.length
      ? []
      : demoShoppingItems.map((item) =>
          createDocument(
            "shoppingItems",
            {
              name: item.name,
              note: item.note,
              completed: item.completed,
            },
            item.id,
          ),
        )),
  ]);
}

export async function getFirebaseFreshMindData() {
  if (!hasFirebaseServerEnv()) {
    return {
      mode: "demo" as const,
      message: "Running on demo data until Firebase env vars are configured.",
      householdName: "FreshMind Demo Home",
      items: demoFoodItems,
      shoppingItems: demoShoppingItems,
    };
  }

  await seedFreshMindDataIfNeeded();

  const [foodItems, shoppingItems] = await Promise.all([
    listCollection("foodItems"),
    listCollection("shoppingItems"),
  ]);

  return {
    mode: "live" as const,
    message: "Connected to Firebase Firestore live data.",
    householdName: "FreshMind Firebase Home",
    items:
      foodItems.documents?.map((doc) => ({
        id: getDocumentId(doc.name),
        name: stringField(doc.fields, "name", "Food item"),
        category: stringField(doc.fields, "category", "Other"),
        quantityLabel: stringField(doc.fields, "quantityLabel", "1 item"),
        storageLocation: stringField(doc.fields, "storageLocation", "other") as StorageLocation,
        expiryDate: nullableStringField(doc.fields, "expiryDate"),
        status: stringField(doc.fields, "status", "active") as FoodStatus,
        addedBy: stringField(doc.fields, "addedBy", "Household"),
      })) ?? [],
    shoppingItems:
      shoppingItems.documents?.map((doc) => ({
        id: getDocumentId(doc.name),
        name: stringField(doc.fields, "name", "Shopping item"),
        note: stringField(doc.fields, "note", "House staple"),
        completed: booleanField(doc.fields, "completed"),
      })) ?? [],
  };
}

export async function addFirebaseFoodItem(data: {
  name: string;
  category: string;
  quantityLabel: string;
  storageLocation: string;
  expiryDate: string | null;
}) {
  if (!hasFirebaseServerEnv()) return;

  await createDocument("foodItems", {
    name: data.name,
    category: data.category,
    quantityLabel: data.quantityLabel,
    storageLocation: data.storageLocation,
    expiryDate: data.expiryDate,
    status: "active",
    addedBy: "Web app",
  });
}

export async function updateFirebaseFoodStatus(id: string, status: string) {
  if (!hasFirebaseServerEnv()) return;

  await firestoreFetch(
    `users/${DEMO_UID}/foodItems/${id}?updateMask.fieldPaths=status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields: toFirestoreFields({ status }),
      }),
    },
  );
}

export async function addFirebaseShoppingItem(data: { name: string; note: string }) {
  if (!hasFirebaseServerEnv()) return;

  await createDocument("shoppingItems", {
    name: data.name,
    note: data.note,
    completed: false,
  });
}

export async function updateFirebaseShoppingItem(id: string, completed: boolean) {
  if (!hasFirebaseServerEnv()) return;

  await firestoreFetch(
    `users/${DEMO_UID}/shoppingItems/${id}?updateMask.fieldPaths=completed`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields: toFirestoreFields({ completed }),
      }),
    },
  );
}
