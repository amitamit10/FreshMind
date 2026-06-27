# FreshMind – AI Food Expiry & Family Kitchen Manager

## Overview

FreshMind is a smart web app that helps families reduce food waste, save money, and decide what to cook before products expire.

The user can scan or upload a photo of a food product and its expiry date. The app uses AI to identify the product, read the expiration date, save it into a shared virtual fridge, and send reminders before the product expires.

The app also suggests recipes using products that are close to expiring, while allowing additional common ingredients if needed.

FreshMind is designed for:

* Families
* Couples
* Roommates
* People living alone
* Anyone who wants to stop throwing away food

---

# Core Idea

Most people throw away food because they forget what they have at home or do not know what to cook with products that are about to expire.

FreshMind solves this by turning the fridge into a smart AI-powered food system.

The app does not only remind the user that food is expiring. It also gives a practical solution:

> “Here is what you can cook tonight with the food that will expire soon.”

---

# Main Problem

People often:

* Forget products in the fridge
* Buy duplicate items
* Throw away food that expired
* Waste money on groceries
* Do not know what to cook
* Lose track of expiry dates
* Struggle to manage food for the whole family

---

# Main Solution

FreshMind allows users to:

1. Scan a product
2. Detect the product name
3. Detect the expiry date
4. Save it in a virtual fridge
5. Get alerts before expiration
6. Receive AI recipe suggestions
7. Manage food together as a family
8. Build a smart shopping list
9. Track food waste and money saved

---

# App Name Ideas

Possible names:

* FreshMind
* FridgeHero
* ExpiryAI
* FreshKeeper
* BeforeItExpires
* SaveMyFood
* KitchenGuard
* RescueMeal
* SmartFridge AI

Recommended name:

## FreshMind

Reason:

It sounds modern, simple, and smart. It is not only about expiry dates, but about managing food intelligently.

---

# Main App Modules

| Module               | Purpose                                |
| -------------------- | -------------------------------------- |
| Smart Scan           | Scan products and expiry dates         |
| Virtual Fridge       | Store all food items                   |
| Family Mode          | Shared food management for families    |
| AI Recipe Engine     | Suggest recipes from expiring products |
| Smart Shopping List  | Build shared grocery lists             |
| Notifications        | Reminders before food expires          |
| Food Waste Analytics | Track saved food and money             |
| Meal Planner         | Plan meals using existing products     |
| Activity Feed        | See what family members changed        |
| AI Kitchen Assistant | Ask questions and get cooking help     |

---

# Smart Product Scanner

## Feature Description

The user takes a photo of a product and its expiry date.

The AI tries to detect:

* Product name
* Product type
* Expiry date
* Quantity
* Category
* Brand if visible

Example:

```text
Product: Milk 3%
Expiry Date: 26/08/2026
Quantity: 1L
Category: Dairy
Confidence: 92%
```

---

## User Confirmation

If the AI is not fully sure, it asks the user to confirm.

Example:

```text
I detected:
Milk 3%
Expires on:
26/08/2026

Is this correct?
```

Buttons:

* Confirm
* Edit
* Scan Again

---

## Manual Backup

If the image is unclear, the user can manually enter:

* Product name
* Expiry date
* Quantity
* Category
* Notes

This makes the app usable even when AI detection fails.

---

# Virtual Fridge

The virtual fridge is the main place where all food items are stored.

## Food Item Fields

Each item includes:

* Name
* Category
* Expiry date
* Quantity
* Storage location
* Added by
* Added date
* Status
* Notes

---

## Storage Locations

The app supports different storage areas:

* Fridge
* Freezer
* Pantry
* Cabinet
* Other

This is important because not all food is stored in the fridge.

---

## Categories

Food categories:

* Dairy
* Meat
* Fish
* Vegetables
* Fruits
* Drinks
* Frozen Food
* Pantry
* Snacks
* Sauces
* Other

---

## Expiry Priority System

Each item gets a priority level.

| Status    | Meaning                   |
| --------- | ------------------------- |
| Expired   | Already expired           |
| Urgent    | Expires today or tomorrow |
| Soon      | Expires in 2–3 days       |
| Safe      | Expires later             |
| Long Term | Freezer or pantry item    |

Example UI:

```text
🔥 Chicken
Expires tomorrow

🟠 Tomatoes
Expires in 2 days

🟢 Rice
Expires in 90 days
```

---

# Family Mode

## Concept

FreshMind is built for shared homes.

A user can create a family or home group and invite others.

Example:

```text
The Cohen Family
```

The person who creates the family becomes the owner.

---

## Family Roles

### Owner

The owner can:

* Add family members
* Remove family members
* Change permissions
* Edit all products
* Delete products
* Manage notifications
* Manage family settings
* View analytics

---

### Adult

An adult member can:

* Add products
* Scan products
* Edit quantities
* Mark items as used
* Add shopping list items
* View recipes
* View analytics

---

### Child

A child member can:

* View the fridge
* Mark that they used an item
* Add simple requests to the shopping list
* See recipes

A child cannot:

* Remove family members
* Change settings
* Delete important records
* Manage permissions

---

## Invite System

Family members can be invited using:

* Link
* QR code
* Email invitation
* Family code

Example:

```text
Join The Cohen Family on FreshMind
Code: 482913
```

---

# Shared Fridge

All family members see the same virtual fridge.

Example:

```text
Milk
Added by: Dad
Expires: Tomorrow

Eggs
Added by: Mom
Expires: In 5 days

Tomatoes
Added by: Amit
Expires: In 2 days
```

---

# Activity Feed

The app shows recent actions.

Example:

```text
Mom added Eggs
Amit scanned Milk
Dad removed Chicken
Noa updated Tomato quantity
AI suggested Pasta for tonight
```

This helps the family understand what changed.

---

# Smart Notifications

## Expiry Notifications

The app sends reminders before items expire.

Example:

```text
Your milk expires in 2 days.
AI found 4 recipes you can make with it.
```

---

## Notification Timing

Users can choose:

* 1 day before expiry
* 2 days before expiry
* 3 days before expiry
* Custom reminder

---

## Family Notifications

The owner can choose:

* Notify everyone
* Notify only adults
* Notify the person who added the product
* Notify only owner

---

# Tonight’s Rescue

## Core Feature

This is one of the most important features.

Every evening, the app can suggest one meal based on products that are about to expire.

Example:

```text
Tonight’s Rescue Meal:
Tomato and Cheese Omelet

Uses:
Tomatoes
Cheese
Eggs

Missing:
Onion
Olive oil
```

The goal is not only to remind the user, but to help them take action.

---

# AI Recipe Engine

## How It Works

AI looks at:

* Products close to expiring
* Products already in the house
* Family preferences
* Missing common ingredients
* Meal type
* Time available

Then it suggests recipes.

---

## Recipe Images From The Web

When AI suggests a recipe, it can also search the web for a matching food image.

The goal is to show a realistic dish preview instead of only text.

The system should:

* Search the web for recipe or dish images
* Pick the most relevant image for the suggested meal
* Show the image on the recipe card or recipe details view
* Avoid unrelated or low-quality images

Example:

```text
Creamy Mushroom Pasta
Image: Pulled from the web based on the recipe title
```

---

## Recipe Types

The app can suggest:

* Breakfast
* Lunch
* Dinner
* Snacks
* Quick meals
* Healthy meals
* Kid-friendly meals
* Budget meals

---

## Recipe Ranking

Recipes are ranked by:

1. Saves the most expiring products
2. Uses the most products already at home
3. Requires the fewest missing ingredients
4. Fits family preferences
5. Takes less time to cook

---

## Recipe Example

```text
Best Match:
Creamy Mushroom Pasta

Uses:
Mushrooms
Milk
Cheese

Missing:
Pasta
Garlic

Estimated cooking time:
25 minutes

Why this recipe:
Your mushrooms expire tomorrow and this recipe uses most of them.
```

---

# Cook With What We Have

## Feature Description

A main button in the app:

```text
Cook With What We Have
```

When clicked, AI suggests recipes based only on current products.

---

## Output Sections

### Best Match

A recipe that can be made now without buying anything.

### Almost Ready

A recipe that only requires 1–2 missing ingredients.

### Save Before Expiring

A recipe that uses the most urgent products.

### Family Favorite

A recipe based on meals the family liked before.

---

# Shopping List

## Smart Shopping List

The app includes a shared shopping list.

Family members can:

* Add products
* Check items as bought
* Remove items
* Add missing recipe ingredients
* Add regular weekly items

---

## AI Shopping Suggestions

AI can suggest what to buy based on:

* Products that are running low
* Products the family buys often
* Planned meals
* Missing ingredients
* Expiring product recipes

Example:

```text
Suggested shopping list:

Milk
Eggs
Bread
Garlic
Pasta
Tomatoes
```

---

## From Recipe To Shopping List

If a recipe requires missing items, the user can add them to the shopping list with one click.

Example:

```text
Missing ingredients:
Garlic
Pasta
Cream

Add all to shopping list
```

---

# Meal Planner

## Weekly Meal Plan

The family can plan meals for the week.

Example:

```text
Monday: Pasta
Tuesday: Chicken salad
Wednesday: Shakshuka
Thursday: Rice bowl
Friday: Pizza night
```

---

## AI Meal Planning

AI can generate a weekly meal plan that prioritizes:

* Expiring products
* Balanced meals
* Family preferences
* Budget-friendly meals
* Reusing ingredients efficiently

---

# Family Preferences

The app learns or stores preferences.

Examples:

* Vegetarian
* Kosher
* Gluten-free
* Dairy-free
* High protein
* Kid-friendly
* No spicy food
* Quick meals only

AI uses these preferences when suggesting recipes.

---

# Allergy System

Users can define allergies.

Examples:

* Peanuts
* Milk
* Eggs
* Gluten
* Fish

The AI must avoid recipes that contain restricted ingredients.

This is important for family safety.

---

# Food Waste Analytics

## Dashboard

The app tracks:

* Products saved
* Products expired
* Estimated money saved
* Food waste reduced
* Most wasted category
* Best saving streak

Example:

```text
This month:
Products saved: 18
Money saved: ₪146
Food waste prevented: 4.3 kg
Waste score: 92/100
```

---

# Waste Score

The family gets a score from 0–100.

The score improves when:

* Products are used before expiry
* Fewer products expire
* Recipes use urgent products
* Shopping list prevents duplicate buying

---

# Achievements

Gamification features:

```text
No Food Wasted For 7 Days
Saved ₪100
Used 20 Expiring Products
Perfect Fridge Week
Family Rescue Streak
```

This makes the app more fun and motivating.

---

# AI Kitchen Assistant

## Chat Feature

The user can ask:

```text
What should I cook today?
```

```text
What can I make with eggs, tomatoes, and cheese?
```

```text
What is expiring soon?
```

```text
Build me a shopping list for this week.
```

```text
What food are we wasting the most?
```

---

## Assistant Abilities

The assistant can:

* Suggest recipes
* Explain what is expiring
* Build shopping lists
* Give storage tips
* Suggest meal plans
* Help reduce waste

---

# Storage Tips

AI can give tips for keeping food fresh longer.

Examples:

```text
Store tomatoes outside the fridge for better flavor.
```

```text
Keep herbs in a cup of water to extend freshness.
```

```text
Freeze bread before it expires to avoid waste.
```

---

# Product Status Actions

Each product can be marked as:

* Used
* Finished
* Expired
* Frozen
* Donated
* Thrown away

This improves analytics.

---

# Duplicate Product Detection

If the user scans a product that already exists, the app can ask:

```text
You already have Milk in the fridge.
Do you want to update the quantity instead of adding a new item?
```

This prevents messy data.

---

# Quantity Management

Users can update quantities.

Examples:

* Full
* Half
* Low
* 1 unit
* 2 packs
* 500g
* 1L

---

# Search And Filters

Users can search and filter by:

* Product name
* Category
* Expiry date
* Storage location
* Added by
* Status

Example:

```text
Show all products expiring this week
```

---

# Scan History

The app keeps a history of scanned products.

This helps users review:

* Recently added items
* Failed scans
* Edited AI results
* Past expired products

---

# Manual Entry

Not everything needs AI.

Users can manually add a product quickly.

Fields:

* Product name
* Expiry date
* Category
* Quantity
* Storage location

---

# Quick Add

A fast mode for adding products:

```text
Milk, expires in 3 days
```

AI turns it into:

```text
Product: Milk
Expiry: 3 days from today
Category: Dairy
```

---

# Design And UI

## Style

The app should feel:

* Clean
* Friendly
* Modern
* Family-oriented
* Food-focused
* Easy to use

---

## Main Navigation

Suggested navigation:

```text
Home
Fridge
Scan
Recipes
Shopping
Family
Analytics
Settings
```

---

# Main Screens

## Home Screen

Shows:

* Expiring soon
* Tonight’s Rescue
* Quick scan button
* Waste score
* Shopping reminders

---

## Fridge Screen

Shows:

* All products
* Filters
* Categories
* Storage locations
* Urgency badges

---

## Scan Screen

Allows:

* Camera scan
* Image upload
* Manual entry

---

## Recipes Screen

Shows:

* Best recipes
* Rescue recipes
* Family favorites
* Recipe pictures from web search
* Missing ingredients

---

## Shopping Screen

Shows:

* Shared shopping list
* AI suggestions
* Items from recipes

---

## Family Screen

Shows:

* Family members
* Roles
* Invite link
* Activity feed

---

## Analytics Screen

Shows:

* Food saved
* Waste score
* Money saved
* Expired products

---

# MVP Version

The first version should include:

* Manual add product
* Image upload placeholder
* Virtual fridge
* Expiry reminders inside app
* Recipe suggestions
* Web-fetched recipe images
* Shopping list
* Family roles UI
* Analytics dashboard
* Local storage

---

# Advanced Version

Future advanced features:

* Real OCR from product image
* Real push notifications
* Multi-user cloud sync
* QR code invites
* AI recipe generation
* Web image search for recipe pictures
* AI shopping planner
* Barcode scanning
* Receipt scanning
* Supermarket price comparison

---

# Development Breakdown

| Phase | Feature                           | Estimated Time |
| ----- | --------------------------------- | -------------: |
| 1     | UI structure and navigation       |             3h |
| 2     | Virtual fridge and product system |             4h |
| 3     | Expiry priority logic             |             2h |
| 4     | Family mode UI and roles          |             3h |
| 5     | Shopping list                     |             2h |
| 6     | Recipe engine mock / AI flow      |             4h |
| 7     | Analytics dashboard               |             3h |
| 8     | Scan flow and confirmation UI     |             3h |
| 9     | Activity feed                     |             2h |
| 10    | Polish and animations             |             3h |

Total estimated time:

## 29 hours

---

# Why This Project Is Strong

FreshMind is strong because it solves a real everyday problem.

It is useful because:

* Families waste food constantly
* Expiry dates are easy to forget
* Recipes are hard to choose
* Shopping lists are often messy
* Food costs are expensive

The app combines practical tools with AI in a natural way.

AI is not added randomly. It is useful because it helps:

* Read expiry dates
* Understand products
* Suggest recipes
* Reduce waste
* Build shopping lists
* Manage the family kitchen

---

# Final Product Vision

FreshMind becomes the smart brain of the family kitchen.

It knows:

* What food exists at home
* What is about to expire
* What should be cooked tonight
* What should be bought next
* How much food the family saved

The final goal:

> Help families save money, waste less food, and cook smarter.

---

# Free Version Dependencies

The first working version should prefer free or free-tier services.

## Hosting

* Vercel Hobby

Reason:

It is a simple default for deploying a Next.js app for free.

---

## Backend

* Supabase Free tier

Use Supabase for:

* Authentication
* Database
* Storage for uploaded product images

Reason:

It gives the app a real backend without forcing a paid plan at the start.

---

## AI Provider

* Groq Free plan

Use Groq for:

* Recipe suggestions
* Cooking assistant answers
* Smart food and ingredient reasoning

Reason:

It is a strong free-first AI option and supports web-enabled model workflows.

Important note:

If the free AI quota is reached, the app should fall back to rule-based recipe suggestions instead of breaking.

---

## Recipe Images

* Pexels API

Use Pexels for:

* Recipe card images
* Dish preview images
* Ingredient and meal visuals

Reason:

It is simpler than generic image search and works well as a free image source for V1.

Important note:

Recipe images should come from Pexels search, not AI image generation.

---

## Summary Of Free Stack

The free-first stack is:

* Vercel Hobby
* Supabase Free tier
* Groq Free plan
* Pexels API
