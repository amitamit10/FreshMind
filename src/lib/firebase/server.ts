import "server-only";

import { cookies } from "next/headers";

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

type FirebaseAuthContext = {
  idToken: string;
  uid: string;
  source: "browser" | "demo";
};

const DEMO_UID = process.env.FIREBASE_DEMO_UID;
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_REFRESH_TOKEN = process.env.FIREBASE_DEMO_REFRESH_TOKEN;
const FIREBASE_SESSION_COOKIE = "freshmind_firebase_id_token";

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
  return Boolean(FIREBASE_API_KEY && FIREBASE_PROJECT_ID);
}

function hasDemoUserEnv() {
  return Boolean(DEMO_UID && FIREBASE_API_KEY && FIREBASE_REFRESH_TOKEN);
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

function parseFirebaseToken(idToken: string) {
  const [, payload] = idToken.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(Buffer.from(normalized, "base64").toString("utf8")) as {
      exp?: number;
      sub?: string;
      user_id?: string;
    };
    const uid = decoded.user_id ?? decoded.sub;

    if (!uid || !decoded.exp || decoded.exp * 1000 < Date.now() + 60_000) {
      return null;
    }

    return { uid };
  } catch {
    return null;
  }
}

async function getDemoAuthContext(): Promise<FirebaseAuthContext | null> {
  if (!hasDemoUserEnv()) return null;

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
    throw new Error(payload.error?.message ?? "Unable to refresh Firebase demo ID token.");
  }

  if (payload.user_id && payload.user_id !== DEMO_UID) {
    throw new Error("Firebase demo user does not match FIREBASE_DEMO_UID.");
  }

  return {
    idToken: payload.id_token,
    uid: DEMO_UID!,
    source: "demo",
  };
}

async function getFirebaseAuthContext() {
  if (!hasFirebaseServerEnv()) {
    throw new Error("Missing Firebase server environment variables.");
  }

  const cookieStore = await cookies();
  const browserIdToken = cookieStore.get(FIREBASE_SESSION_COOKIE)?.value;
  const browserToken = browserIdToken ? parseFirebaseToken(browserIdToken) : null;

  if (browserIdToken && browserToken) {
    return {
      idToken: browserIdToken,
      uid: browserToken.uid,
      source: "browser" as const,
    };
  }

  return getDemoAuthContext();
}

async function firestoreFetch(auth: FirebaseAuthContext, path: string, init: RequestInit = {}) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${auth.idToken}`,
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

async function listCollection(auth: FirebaseAuthContext, collection: "foodItems" | "shoppingItems") {
  const response = await firestoreFetch(auth, `users/${auth.uid}/${collection}?pageSize=100`);
  return (await response.json()) as FirestoreListResponse;
}

async function createDocument(
  auth: FirebaseAuthContext,
  collection: "foodItems" | "shoppingItems",
  data: Record<string, string | boolean | null>,
  documentId?: string,
) {
  const suffix = documentId ? `?documentId=${encodeURIComponent(documentId)}` : "";
  await firestoreFetch(auth, `users/${auth.uid}/${collection}${suffix}`, {
    method: "POST",
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
}

async function deleteDocument(auth: FirebaseAuthContext, collection: "foodItems" | "shoppingItems", id: string) {
  if (!id) return;
  await firestoreFetch(auth, `users/${auth.uid}/${collection}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function seedFreshMindDataIfNeeded(auth: FirebaseAuthContext) {
  if (!hasFirebaseServerEnv()) return;

  const [foodItems, shoppingItems] = await Promise.all([
    listCollection(auth, "foodItems"),
    listCollection(auth, "shoppingItems"),
  ]);

  await Promise.all([
    ...(foodItems.documents?.length
      ? []
      : demoFoodItems.map((item) =>
          createDocument(
            auth,
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
            auth,
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

  const auth = await getFirebaseAuthContext();
  if (!auth) {
    return {
      mode: "demo" as const,
      message: "Running on demo data until Firebase Auth starts in this browser.",
      householdName: "FreshMind Demo Home",
      items: demoFoodItems,
      shoppingItems: demoShoppingItems,
    };
  }

  await seedFreshMindDataIfNeeded(auth);

  const [foodItems, shoppingItems] = await Promise.all([
    listCollection(auth, "foodItems"),
    listCollection(auth, "shoppingItems"),
  ]);

  return {
    mode: "live" as const,
    message:
      auth.source === "browser"
        ? "Connected to your Firebase anonymous workspace."
        : "Connected to Firebase Firestore demo data.",
    householdName: auth.source === "browser" ? "My FreshMind Kitchen" : "FreshMind Firebase Home",
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
  const auth = await getFirebaseAuthContext();
  if (!auth) return;

  await createDocument(auth, "foodItems", {
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
  const auth = await getFirebaseAuthContext();
  if (!auth) return;

  await firestoreFetch(
    auth,
    `users/${auth.uid}/foodItems/${id}?updateMask.fieldPaths=status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields: toFirestoreFields({ status }),
      }),
    },
  );
}

export async function deleteFirebaseFoodItem(id: string) {
  const auth = await getFirebaseAuthContext();
  if (!auth) return;

  await deleteDocument(auth, "foodItems", id);
}

export async function addFirebaseShoppingItem(data: { name: string; note: string }) {
  const auth = await getFirebaseAuthContext();
  if (!auth) return;

  await createDocument(auth, "shoppingItems", {
    name: data.name,
    note: data.note,
    completed: false,
  });
}

export async function updateFirebaseShoppingItem(id: string, completed: boolean) {
  const auth = await getFirebaseAuthContext();
  if (!auth) return;

  await firestoreFetch(
    auth,
    `users/${auth.uid}/shoppingItems/${id}?updateMask.fieldPaths=completed`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields: toFirestoreFields({ completed }),
      }),
    },
  );
}

export async function deleteFirebaseShoppingItem(id: string) {
  const auth = await getFirebaseAuthContext();
  if (!auth) return;

  await deleteDocument(auth, "shoppingItems", id);
}
