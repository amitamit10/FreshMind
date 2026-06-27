import type { ReactNode } from "react";
import {
  BellRing,
  Camera,
  ChefHat,
  Clock3,
  Database,
  Home,
  Plus,
  ReceiptText,
  Refrigerator,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
  Upload,
} from "lucide-react";

import {
  addFoodItem,
  addShoppingItem,
  toggleFoodStatus,
  toggleShoppingItem,
} from "@/app/actions";
import {
  type ExpiryStatus,
  type FoodItem,
  formatExpiryCopy,
  getExpiryStatus,
  getFreshMindData,
  type ShoppingItem,
} from "@/lib/freshmind-data";

type StatCardProps = {
  label: string;
  value: string;
  tone: "sage" | "tomato" | "butter";
};

type ProductRowProps = {
  item: FoodItem;
  compact?: boolean;
};

type RecipeCardProps = {
  title: string;
  subtitle: string;
  uses: string[];
  missing: string[];
  time: string;
  tone: "sage" | "tomato" | "berry";
};

const tabs = [
  { label: "Home", icon: Home, active: true },
  { label: "Fridge", icon: Refrigerator },
  { label: "Scan", icon: Camera },
  { label: "Recipes", icon: ChefHat },
  { label: "Shop", icon: ShoppingCart },
];

function toneClass(tone: StatCardProps["tone"] | RecipeCardProps["tone"]) {
  if (tone === "sage") return "tone-sage";
  if (tone === "tomato") return "tone-tomato";
  if (tone === "butter") return "tone-butter";
  return "tone-berry";
}

function statusClass(status: ExpiryStatus) {
  if (status === "Urgent") return "status status-urgent";
  if (status === "Soon") return "status status-soon";
  return "status status-safe";
}

function buildRescueMeal(items: FoodItem[]) {
  const activeItems = items.filter((item) => item.status === "active");
  const urgentItems = activeItems.filter((item) => getExpiryStatus(item.expiryDate) === "Urgent");
  const focus = urgentItems.length > 0 ? urgentItems : activeItems;
  const top = focus.slice(0, 3);

  if (top.length === 0) {
    return {
      title: "Kitchen reset",
      subtitle: "Start by adding what is already in the fridge.",
      uses: [] as string[],
      missing: ["Your first few items"],
      time: "8 min",
    };
  }

  const names = top.map((item) => item.name);
  const title = top.some((item) => item.category.toLowerCase().includes("dairy"))
    ? "Creamy fridge rescue bowl"
    : "Fast pantry rescue plate";

  return {
    title,
    subtitle: `Built from ${names.slice(0, 2).join(" and ")} before they expire.`,
    uses: names,
    missing: ["Salt", "Olive oil"],
    time: `${12 + top.length * 4} min`,
  };
}

function deriveStats(items: FoodItem[], shoppingItems: ShoppingItem[]) {
  const activeItems = items.filter((item) => item.status === "active");
  const urgentCount = activeItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === "Urgent",
  ).length;
  const usedCount = items.filter((item) => item.status === "used" || item.status === "finished").length;
  const savedEstimate = usedCount * 18 + activeItems.length * 6;
  const score = Math.max(62, 96 - urgentCount * 4 - shoppingItems.filter((item) => !item.completed).length);

  return {
    urgentCount,
    savedEstimate,
    score,
  };
}

function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <article className={`stat-card ${toneClass(tone)}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ProductRow({ item, compact = false }: ProductRowProps) {
  const urgency = getExpiryStatus(item.expiryDate);
  const nextStatus = item.status === "active" ? "used" : "active";

  return (
    <div className={compact ? "product-row compact" : "product-row"}>
      <div className="product-art" aria-hidden="true" />
      <div className="product-copy">
        <strong>{item.name}</strong>
        <span>
          {item.category} · {item.storageLocation}
        </span>
        <small>{formatExpiryCopy(item.expiryDate)}</small>
      </div>
      <div className="product-meta">
        <em>{item.quantityLabel}</em>
        <span className={statusClass(urgency)}>{urgency}</span>
        <form action={toggleFoodStatus}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="nextStatus" value={nextStatus} />
          <button className="inline-action" type="submit">
            {item.status === "active" ? "Mark used" : "Restore"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RecipeCard({ title, subtitle, uses, missing, time, tone }: RecipeCardProps) {
  return (
    <article className={`recipe-card ${toneClass(tone)}`}>
      <div className="recipe-image" aria-hidden="true" />
      <div className="recipe-copy">
        <div className="recipe-header">
          <div>
            <h4>{title}</h4>
            <p>{subtitle}</p>
          </div>
          <span className="recipe-time">
            <Clock3 size={14} />
            {time}
          </span>
        </div>
        <p className="recipe-line">
          Uses: <strong>{uses.length > 0 ? uses.join(", ") : "No items yet"}</strong>
        </p>
        <p className="recipe-line">
          Missing: <strong>{missing.join(", ")}</strong>
        </p>
      </div>
    </article>
  );
}

function PhoneFrame({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="phone-wrap">
      <div className="phone-label">
        <span>{eyebrow}</span>
        <h3>{title}</h3>
      </div>
      <div className="phone-shell">
        <div className="phone-notch" />
        <div className="phone-screen">
          <div className="screen-status">
            <span>9:41</span>
            <span>FreshMind</span>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map(({ label, icon: Icon, active }) => (
        <div key={label} className={active ? "nav-item active" : "nav-item"}>
          <Icon size={16} />
          <span>{label}</span>
        </div>
      ))}
    </nav>
  );
}

export default async function HomePage() {
  const data = await getFreshMindData();
  const activeItems = data.items.filter((item) => item.status === "active");
  const shoppingItems = data.shoppingItems;
  const rescue = buildRescueMeal(activeItems);
  const stats = deriveStats(data.items, shoppingItems);
  const incompleteShopping = shoppingItems.filter((item) => !item.completed);
  const recipeCards = [
    {
      title: rescue.title,
      subtitle: rescue.subtitle,
      uses: rescue.uses,
      missing: rescue.missing,
      time: rescue.time,
      tone: "sage" as const,
    },
    {
      title: "Almost-ready skillet",
      subtitle: "A fallback when you only want one-pan cooking.",
      uses: activeItems.slice(0, 2).map((item) => item.name),
      missing: ["Eggs", "Bread"],
      time: "14 min",
      tone: "tomato" as const,
    },
    {
      title: "Save-before-expiring plate",
      subtitle: "Uses the quickest-to-expire items first.",
      uses: activeItems
        .filter((item) => getExpiryStatus(item.expiryDate) !== "Safe")
        .slice(0, 3)
        .map((item) => item.name),
      missing: ["Lemon", "Herbs"],
      time: "11 min",
      tone: "berry" as const,
    },
  ];

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">FreshMind · Supabase slice</span>
          <h1>The mockups are now wired to a real fridge and shopping flow.</h1>
          <p>
            This pass keeps the visual shell, but the Home, Fridge, and Shopping screens now
            share real data when Supabase is configured. Without env vars, the app falls back to
            demo data so the product loop stays visible.
          </p>
        </div>
        <div className="hero-pills">
          <span>Vercel Hobby</span>
          <span>Supabase</span>
          <span>Groq</span>
          <span>Pexels</span>
          <span>{data.mode === "live" ? "Live data" : data.mode === "demo" ? "Demo data" : "Setup needed"}</span>
        </div>
        <section className={data.mode === "error" ? "system-banner error" : "system-banner"}>
          <Database size={16} />
          <span>{data.message}</span>
        </section>
      </section>

      <section className="screen-grid">
        <PhoneFrame eyebrow="01 · Home" title={data.householdName}>
          <div className="screen-body">
            <header className="screen-header">
              <div>
                <span className="screen-kicker">Household overview</span>
                <h2>Good evening, Amit</h2>
              </div>
              <button className="icon-chip" aria-label="Alerts">
                <BellRing size={16} />
              </button>
            </header>

            <section className="hero-card">
              <div>
                <span className="card-tag tone-tomato">{stats.urgentCount} items urgent</span>
                <h3>{rescue.title}</h3>
                <p>{rescue.subtitle}</p>
              </div>
              <div className="hero-meta">
                <span>
                  <ChefHat size={14} />
                  {rescue.time}
                </span>
                <span>
                  <ShoppingCart size={14} />
                  {rescue.missing.length} missing
                </span>
              </div>
            </section>

            <div className="stat-row">
              <StatCard label="Waste score" value={`${stats.score}/100`} tone="sage" />
              <StatCard label="Saved estimate" value={`₪${stats.savedEstimate}`} tone="butter" />
              <StatCard label="Need rescue" value={`${stats.urgentCount} items`} tone="tomato" />
            </div>

            <section className="panel">
              <div className="panel-heading">
                <h3>Expiring soon</h3>
                <button className="text-action">Synced view</button>
              </div>
              <div className="stack">
                {activeItems.slice(0, 3).map((item) => (
                  <ProductRow key={item.id} item={item} compact />
                ))}
                {activeItems.length === 0 ? (
                  <div className="empty-card">
                    <strong>No items yet</strong>
                    <p>Add your first fridge items below and they will show up here.</p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="mini-banner">
              <div>
                <strong>Shopping nudge</strong>
                <p>
                  {incompleteShopping.length > 0
                    ? `${incompleteShopping.length} items are still missing for the next meal.`
                    : "Your shopping list is clear for now."}
                </p>
              </div>
              <button className="primary-pill">
                <Plus size={16} />
                Review list
              </button>
            </section>
          </div>
          <BottomNav />
        </PhoneFrame>

        <PhoneFrame eyebrow="02 · Fridge" title="Searchable shared inventory">
          <div className="screen-body">
            <header className="screen-header">
              <div>
                <span className="screen-kicker">Shared fridge</span>
                <h2>What’s at home</h2>
              </div>
              <button className="icon-chip" aria-label="Filters">
                <Settings2 size={16} />
              </button>
            </header>

            <label className="searchbar">
              <Search size={16} />
              <input value="Search food, brand, or date" readOnly />
            </label>

            <div className="chip-row">
              <span className="filter-chip active">All</span>
              <span className="filter-chip">Urgent</span>
              <span className="filter-chip">Fridge</span>
              <span className="filter-chip">Produce</span>
            </div>

            <section className="panel">
              <div className="panel-heading">
                <h3>Add to fridge</h3>
                <button className="text-action">Manual add</button>
              </div>
              <form action={addFoodItem} className="mini-form">
                <input name="name" placeholder="Milk, tomatoes, yogurt..." required />
                <div className="mini-form-grid">
                  <input name="quantityLabel" placeholder="1 tub" />
                  <input name="expiryDate" type="date" />
                </div>
                <div className="mini-form-grid">
                  <input name="category" placeholder="Dairy" />
                  <select name="storageLocation" defaultValue="fridge">
                    <option value="fridge">Fridge</option>
                    <option value="freezer">Freezer</option>
                    <option value="pantry">Pantry</option>
                    <option value="cabinet">Cabinet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button className="primary-pill full-width" type="submit">
                  <Plus size={16} />
                  Save item
                </button>
              </form>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>This week</h3>
                <button className="text-action">Grouped view</button>
              </div>
              <div className="stack">
                {activeItems.map((item) => (
                  <ProductRow key={item.id} item={item} />
                ))}
                {activeItems.length === 0 ? (
                  <div className="empty-card">
                    <strong>Your fridge is empty</strong>
                    <p>The first saved item will appear here with expiry priority and actions.</p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
          <BottomNav />
        </PhoneFrame>

        <PhoneFrame eyebrow="03 · Scan" title="Ready for Supabase Storage">
          <div className="screen-body">
            <header className="screen-header">
              <div>
                <span className="screen-kicker">Smart scan</span>
                <h2>Add a product</h2>
              </div>
              <button className="icon-chip" aria-label="Upload">
                <Upload size={16} />
              </button>
            </header>

            <section className="scan-preview">
              <div className="scan-photo">
                <div className="scan-tag">Storage-ready</div>
                <div className="scan-packaging">
                  <span>Next step</span>
                  <strong>Photo upload</strong>
                  <em>Use Supabase Storage for package images</em>
                </div>
              </div>
              <div className="scan-actions">
                <button className="secondary-pill">
                  <Camera size={16} />
                  Camera
                </button>
                <button className="secondary-pill">
                  <Upload size={16} />
                  Upload
                </button>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>Implementation note</h3>
                <span className="confidence-pill">Coming next</span>
              </div>
              <div className="notes-stack">
                <p>1. Upload image to a `product-scans` bucket.</p>
                <p>2. Save image path in a scans table.</p>
                <p>3. Send the path and OCR result into Groq for extraction.</p>
              </div>
            </section>
          </div>
          <BottomNav />
        </PhoneFrame>

        <PhoneFrame eyebrow="04 · Recipes" title="Rule-based rescue meals">
          <div className="screen-body">
            <header className="screen-header">
              <div>
                <span className="screen-kicker">Recipe engine v0</span>
                <h2>Cook with what we have</h2>
              </div>
              <button className="icon-chip" aria-label="Chef">
                <ChefHat size={16} />
              </button>
            </header>

            <div className="chip-row">
              <span className="filter-chip active">Best Match</span>
              <span className="filter-chip">Almost Ready</span>
              <span className="filter-chip">Save First</span>
            </div>

            <div className="stack">
              {recipeCards.map((card) => (
                <RecipeCard key={card.title} {...card} />
              ))}
            </div>
          </div>
          <BottomNav />
        </PhoneFrame>

        <PhoneFrame eyebrow="05 · Shopping" title="From recipe to cart">
          <div className="screen-body">
            <header className="screen-header">
              <div>
                <span className="screen-kicker">Shared list</span>
                <h2>Shopping tonight</h2>
              </div>
              <button className="icon-chip" aria-label="Receipts">
                <ReceiptText size={16} />
              </button>
            </header>

            <section className="mini-banner tone-sage banner-tight">
              <div>
                <strong>AI suggestion</strong>
                <p>Add pantry basics that complete the top rescue meal.</p>
              </div>
              <button className="primary-pill">
                <Sparkles size={16} />
                Use recipe picks
              </button>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>Add to list</h3>
                <button className="text-action">Shared add</button>
              </div>
              <form action={addShoppingItem} className="mini-form">
                <input name="name" placeholder="Garlic, pasta, olive oil..." required />
                <input name="note" placeholder="Why this item is needed" />
                <button className="primary-pill full-width" type="submit">
                  <Plus size={16} />
                  Save shopping item
                </button>
              </form>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>To buy</h3>
                <span className="count-pill">{shoppingItems.length} items</span>
              </div>
              <div className="shopping-stack">
                {shoppingItems.map((item) => (
                  <form key={item.id} action={toggleShoppingItem} className={item.completed ? "shopping-row done" : "shopping-row"}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="completed" value={String(item.completed)} />
                    <button className="checkmark" aria-label={item.completed ? "Mark incomplete" : "Mark complete"} type="submit">
                      {item.completed ? "✓" : ""}
                    </button>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.note}</p>
                    </div>
                  </form>
                ))}
                {shoppingItems.length === 0 ? (
                  <div className="empty-card">
                    <strong>Shopping list is clear</strong>
                    <p>Add a missing ingredient and it will show up here instantly.</p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
          <BottomNav />
        </PhoneFrame>
      </section>
    </main>
  );
}
