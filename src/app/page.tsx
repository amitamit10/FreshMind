import type { ReactNode } from "react";
import {
  BellRing,
  Camera,
  ChefHat,
  Clock3,  Home,
  Plus,
  ReceiptText,
  Refrigerator,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
  Upload,
} from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  tone: "sage" | "tomato" | "butter";
};

type ProductRowProps = {
  name: string;
  meta: string;
  quantity: string;
  status: "Urgent" | "Soon" | "Safe";
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

const urgencyRows: ProductRowProps[] = [
  { name: "Greek Yogurt", meta: "Dairy · Fridge", quantity: "1 tub", status: "Urgent" },
  { name: "Tomatoes", meta: "Produce · Counter", quantity: "4 left", status: "Soon" },
  { name: "Eggs", meta: "Dairy · Fridge", quantity: "8 eggs", status: "Safe" },
  { name: "Mushrooms", meta: "Produce · Fridge", quantity: "250g", status: "Urgent" },
];

const shoppingList = [
  { name: "Garlic", meta: "Missing from pasta rescue", done: false },
  { name: "Pasta", meta: "Add from recipes", done: false },
  { name: "Olive oil", meta: "House staple", done: true },
  { name: "Parsley", meta: "Fresh garnish", done: false },
];

function toneClass(tone: StatCardProps["tone"] | RecipeCardProps["tone"]) {
  if (tone === "sage") return "tone-sage";
  if (tone === "tomato") return "tone-tomato";
  if (tone === "butter") return "tone-butter";
  return "tone-berry";
}

function statusClass(status: ProductRowProps["status"]) {
  if (status === "Urgent") return "status status-urgent";
  if (status === "Soon") return "status status-soon";
  return "status status-safe";
}

function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <article className={`stat-card ${toneClass(tone)}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ProductRow({ name, meta, quantity, status }: ProductRowProps) {
  return (
    <div className="product-row">
      <div className="product-art" aria-hidden="true" />
      <div className="product-copy">
        <strong>{name}</strong>
        <span>{meta}</span>
      </div>
      <div className="product-meta">
        <em>{quantity}</em>
        <span className={statusClass(status)}>{status}</span>
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
          Uses: <strong>{uses.join(", ")}</strong>
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

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">FreshMind · Free-stack prototype</span>
          <h1>Five mobile product screens turned into the first working app shell.</h1>
          <p>
            The UI is built around a real free-first stack: Supabase for data, Groq for AI,
            and Pexels for recipe imagery. This pass focuses on the product loop before wiring
            live services.
          </p>
        </div>
        <div className="hero-pills">
          <span>Vercel Hobby</span>
          <span>Supabase</span>
          <span>Groq</span>
          <span>Pexels</span>
        </div>
      </section>

      <section className="screen-grid">
        <PhoneFrame eyebrow="01 · Home" title="Rescue tonight’s dinner">
          <div className="screen-body">
            <header className="screen-header">
              <div>
                <span className="screen-kicker">Thursday dinner</span>
                <h2>Good evening, Amit</h2>
              </div>
              <button className="icon-chip" aria-label="Alerts">
                <BellRing size={16} />
              </button>
            </header>

            <section className="hero-card">
              <div>
                <span className="card-tag tone-tomato">2 items urgent</span>
                <h3>Creamy Mushroom Pasta</h3>
                <p>Uses mushrooms, yogurt, and parsley before tomorrow night.</p>
              </div>
              <div className="hero-meta">
                <span>
                  <ChefHat size={14} />
                  22 min
                </span>
                <span>
                  <ShoppingCart size={14} />
                  2 missing
                </span>
              </div>
            </section>

            <div className="stat-row">
              <StatCard label="Waste score" value="92/100" tone="sage" />
              <StatCard label="Saved this week" value="₪148" tone="butter" />
              <StatCard label="Need rescue" value="4 items" tone="tomato" />
            </div>

            <section className="panel">
              <div className="panel-heading">
                <h3>Expiring soon</h3>
                <button className="text-action">See all</button>
              </div>
              <div className="stack">
                {urgencyRows.slice(0, 3).map((row) => (
                  <ProductRow key={row.name} {...row} />
                ))}
              </div>
            </section>

            <section className="mini-banner">
              <div>
                <strong>Shopping nudge</strong>
                <p>Pasta and garlic are missing from tonight’s rescue meal.</p>
              </div>
              <button className="primary-pill">
                <Plus size={16} />
                Add both
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
                <h3>This week</h3>
                <button className="text-action">Grouped view</button>
              </div>
              <div className="stack">
                {urgencyRows.map((row) => (
                  <ProductRow key={row.name} {...row} />
                ))}
              </div>
            </section>

            <section className="hint-card">
              <div className="hint-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <strong>Duplicate check</strong>
                <p>You already have Greek Yogurt. Update quantity instead of adding a new item?</p>
              </div>
            </section>
          </div>
          <BottomNav />
        </PhoneFrame>

        <PhoneFrame eyebrow="03 · Scan" title="Confirm before saving">
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
                <div className="scan-tag">Photo preview</div>
                <div className="scan-packaging">
                  <span>YoCream</span>
                  <strong>Greek Yogurt</strong>
                  <em>Expires 28/06/2026</em>
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
                <h3>AI detected</h3>
                <span className="confidence-pill">92% confidence</span>
              </div>
              <div className="form-grid">
                <label>
                  <span>Product name</span>
                  <input value="Greek Yogurt" readOnly />
                </label>
                <label>
                  <span>Category</span>
                  <input value="Dairy" readOnly />
                </label>
                <label>
                  <span>Expiry date</span>
                  <input value="28/06/2026" readOnly />
                </label>
                <label>
                  <span>Quantity</span>
                  <input value="1 tub" readOnly />
                </label>
              </div>
            </section>

            <div className="action-row">
              <button className="ghost-pill">Scan again</button>
              <button className="secondary-pill">Edit</button>
              <button className="primary-pill">Confirm</button>
            </div>
          </div>
          <BottomNav />
        </PhoneFrame>

        <PhoneFrame eyebrow="04 · Recipes" title="Ranked rescue meals">
          <div className="screen-body">
            <header className="screen-header">
              <div>
                <span className="screen-kicker">AI recipes</span>
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
              <RecipeCard
                title="Creamy Mushroom Pasta"
                subtitle="Uses mushrooms expiring tomorrow"
                uses={["Mushrooms", "Greek Yogurt", "Parsley"]}
                missing={["Pasta", "Garlic"]}
                time="22 min"
                tone="sage"
              />
              <RecipeCard
                title="Tomato Egg Skillet"
                subtitle="No shopping needed"
                uses={["Tomatoes", "Eggs", "Herbs"]}
                missing={["None"]}
                time="14 min"
                tone="tomato"
              />
              <RecipeCard
                title="Pantry Rescue Toasts"
                subtitle="Best for one quick dinner"
                uses={["Tomatoes", "Yogurt"]}
                missing={["Bread"]}
                time="9 min"
                tone="berry"
              />
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
                <p>Add pasta and garlic to unlock the top rescue meal.</p>
              </div>
              <button className="primary-pill">
                <Sparkles size={16} />
                Add from recipe
              </button>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>To buy</h3>
                <span className="count-pill">4 items</span>
              </div>
              <div className="shopping-stack">
                {shoppingList.map((item) => (
                  <div key={item.name} className={item.done ? "shopping-row done" : "shopping-row"}>
                    <span className="checkmark" aria-hidden="true">
                      {item.done ? "✓" : ""}
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>Staples running low</h3>
                <button className="text-action">Auto-add</button>
              </div>
              <div className="chip-row">
                <span className="filter-chip">Eggs</span>
                <span className="filter-chip">Milk</span>
                <span className="filter-chip">Olive oil</span>
              </div>
            </section>
          </div>
          <BottomNav />
        </PhoneFrame>
      </section>
    </main>
  );
}
