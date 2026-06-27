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
  addRecipeMissingItems,
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
    <main className="page-shell app-page">
      <section className="app-hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow">FreshMind · Live Firebase app</span>
          <h1>Save food before it becomes waste.</h1>
          <p>
            Track what is at home, rescue expiring food with recipe suggestions, and keep a shared
            shopping list synced through Firestore.
          </p>
        </div>
        <div className="hero-card app-hero-card">
          <span className="card-tag tone-tomato">{stats.urgentCount} urgent items</span>
          <h3>{rescue.title}</h3>
          <p>{rescue.subtitle}</p>
          <div className="hero-meta">
            <span>
              <ChefHat size={14} />
              {rescue.time}
            </span>
            <span>
              <ShoppingCart size={14} />
              {incompleteShopping.length} to buy
            </span>
          </div>
        </div>
      </section>

      <nav className="app-nav" aria-label="FreshMind sections">
        <a href="#home">
          <Home size={16} />
          Home
        </a>
        <a href="#fridge">
          <Refrigerator size={16} />
          Fridge
        </a>
        <a href="#scan">
          <Camera size={16} />
          Scan
        </a>
        <a href="#recipes">
          <ChefHat size={16} />
          Recipes
        </a>
        <a href="#shopping">
          <ShoppingCart size={16} />
          Shopping
        </a>
      </nav>

      <section className={data.mode === "error" ? "system-banner error" : "system-banner"}>
        <Database size={16} />
        <span>{data.message}</span>
      </section>

      <section className="app-grid">
        <section className="app-main">
          <div className="stat-row">
            <StatCard label="Waste score" value={`${stats.score}/100`} tone="sage" />
            <StatCard label="Saved estimate" value={`₪${stats.savedEstimate}`} tone="butter" />
            <StatCard label="Need rescue" value={`${stats.urgentCount} items`} tone="tomato" />
          </div>

          <section className="panel app-section" id="fridge">
            <div className="panel-heading">
              <div>
                <span className="screen-kicker">Shared fridge</span>
                <h2>What is at home</h2>
              </div>
              <span className="count-pill">{activeItems.length} active</span>
            </div>

            <label className="searchbar">
              <Search size={16} />
              <input value="Search and filters are next; items are sorted by expiry now" readOnly />
            </label>

            <div className="chip-row">
              <span className="filter-chip active">All</span>
              <span className="filter-chip">Urgent {stats.urgentCount}</span>
              <span className="filter-chip">Fridge</span>
              <span className="filter-chip">Produce</span>
            </div>

            <div className="stack app-list">
              {activeItems.map((item) => (
                <ProductRow key={item.id} item={item} />
              ))}
              {activeItems.length === 0 ? (
                <div className="empty-card">
                  <strong>Your fridge is empty</strong>
                  <p>Add your first item manually or confirm the scan result below.</p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="panel app-section" id="scan">
            <div className="panel-heading">
              <div>
                <span className="screen-kicker">Smart scan</span>
                <h2>Confirm detected food</h2>
              </div>
              <span className="confidence-pill">Demo detection</span>
            </div>

            <div className="scan-workflow">
              <div className="scan-photo">
                <div className="scan-tag">AI preview</div>
                <div className="scan-packaging">
                  <span>Detected from photo</span>
                  <strong>Greek Yogurt</strong>
                  <em>Expires 2026-06-29 · 91% confidence</em>
                </div>
              </div>
              <form action={addFoodItem} className="mini-form">
                <input name="name" defaultValue="Greek Yogurt" required />
                <div className="mini-form-grid">
                  <input name="quantityLabel" defaultValue="1 tub" />
                  <input name="expiryDate" type="date" defaultValue="2026-06-29" />
                </div>
                <div className="mini-form-grid">
                  <input name="category" defaultValue="Dairy" />
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
                  Confirm and save
                </button>
              </form>
            </div>
          </section>

          <section className="panel app-section" id="recipes">
            <div className="panel-heading">
              <div>
                <span className="screen-kicker">Recipe rescue</span>
                <h2>Cook with what expires first</h2>
              </div>
              <span className="confidence-pill">Rule-based v0</span>
            </div>

            <div className="recipe-grid">
              {recipeCards.map((card) => (
                <div key={card.title} className="recipe-action-card">
                  <RecipeCard {...card} />
                  <form action={addRecipeMissingItems}>
                    <input type="hidden" name="recipe" value={card.title} />
                    {card.missing.map((item) => (
                      <input key={item} type="hidden" name="item" value={item} />
                    ))}
                    <button className="secondary-pill full-width" type="submit">
                      <Sparkles size={16} />
                      Add missing items
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="app-sidebar">
          <section className="panel app-section">
            <div className="panel-heading">
              <div>
                <span className="screen-kicker">Manual add</span>
                <h2>Add food</h2>
              </div>
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

          <section className="panel app-section" id="shopping">
            <div className="panel-heading">
              <div>
                <span className="screen-kicker">Shared list</span>
                <h2>Shopping</h2>
              </div>
              <span className="count-pill">{shoppingItems.length} items</span>
            </div>

            <form action={addShoppingItem} className="mini-form">
              <input name="name" placeholder="Garlic, pasta, olive oil..." required />
              <input name="note" placeholder="Why this item is needed" />
              <button className="primary-pill full-width" type="submit">
                <Plus size={16} />
                Add to list
              </button>
            </form>

            <div className="shopping-stack app-list">
              {shoppingItems.map((item) => (
                <form
                  key={item.id}
                  action={toggleShoppingItem}
                  className={item.completed ? "shopping-row done" : "shopping-row"}
                >
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="completed" value={String(item.completed)} />
                  <button
                    className="checkmark"
                    aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                    type="submit"
                  >
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
                  <p>Add a missing ingredient or use a recipe suggestion.</p>
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
