# Home Finance Tracker - Design Guidelines

## Design Approach

**Selected Approach:** Design System with Finance App References (Mint, YNAB, Stripe Dashboard patterns)

**Justification:** This is a data-heavy, utility-focused application requiring clarity, efficiency, and trust. Following established financial dashboard patterns ensures users can quickly understand complex information while maintaining professional credibility.

**Key Design Principles:**
1. Data clarity over visual flourish
2. Scannable information hierarchy
3. Trustworthy, professional aesthetic
4. Mobile-first responsive design for on-the-go access

---

## Core Design Elements

### A. Typography

**Font System:** Inter (via Google Fonts CDN)
- **Display/Headers:** Inter 600-700, tracking tight (-0.02em)
- **Dashboard Metrics:** Inter 700, 2xl-4xl for prominent numbers
- **Body Text:** Inter 400, base size (16px)
- **Labels/Meta:** Inter 500, sm size (14px), uppercase for category labels
- **Tables:** Inter 400, tabular-nums for aligned numbers

**Hierarchy Implementation:**
- Page titles: text-3xl font-bold
- Section headers: text-xl font-semibold
- Card titles: text-lg font-medium
- Metric values: text-4xl font-bold tabular-nums
- Metric labels: text-sm font-medium uppercase tracking-wide

---

## B. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 or p-6
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4 or gap-6
- Large section breaks: py-12 or py-16

**Grid Structure:**
- Desktop dashboard: 3-4 column grid (grid-cols-3 lg:grid-cols-4)
- Tablet: 2 column grid (md:grid-cols-2)
- Mobile: Single column (grid-cols-1)
- Max container width: max-w-7xl mx-auto px-4

**Dashboard Layout Pattern:**
```
[Header with Navigation]
[Financial Summary Cards - 4 across on desktop]
[Main Content Area - 2/3 width] | [Sidebar - 1/3 width]
```

---

## C. Component Library

### Navigation
**Top Navigation Bar:**
- Logo/App name (left)
- Primary nav links: Dashboard, Income, Expenses, Assets, Liabilities, Investments
- User profile/settings (right)
- Sticky positioning on scroll
- Mobile: Hamburger menu with slide-out drawer

### Dashboard Cards (Financial Summary)
**Metric Cards (4-up grid):**
- Card structure: Rounded corners (rounded-lg), shadow-sm
- Content: Label (top), Large number value (center), Trend indicator with percentage (bottom)
- Trend indicators: Use Heroicons arrows (arrow-trending-up, arrow-trending-down)
- Padding: p-6
- Hover: subtle lift effect (hover:shadow-md transition)

### Data Tables
**Transaction Tables:**
- Header row: Sticky, uppercase labels, font-medium
- Row structure: Date | Category | Description | Amount
- Alternating row treatment for scannability
- Right-align numerical values
- Row padding: py-3 px-4
- Mobile: Stack into card format with labels

### Forms & Inputs
**Input Fields:**
- Label above input, text-sm font-medium mb-2
- Input height: h-12
- Border radius: rounded-md
- Focus states: ring treatment (focus:ring-2)
- Category select: Dropdown with icon prefixes
- Date picker: Native input with calendar icon
- Amount input: Right-aligned, tabular-nums

**Excel Upload Component:**
- Drag-and-drop zone with dashed border
- File icon (Heroicons: document-arrow-up)
- Supporting text: "Drop Excel file here or click to browse"
- Height: h-48
- Padding: p-8

### Charts & Visualizations
**Chart Container:**
- Card wrapper: rounded-lg, shadow-sm, p-6
- Header with title and time period selector (dropdown)
- Chart area: min-h-80
- Use Chart.js or Recharts library via CDN
- Chart types: Line (trends), Bar (comparisons), Donut (distributions)

**Chart Specifications:**
- Income vs Expenses: Dual-line chart
- Category Breakdown: Donut chart with legend
- Monthly Trends: Bar chart with gridlines
- Responsive: Maintain aspect ratio on mobile

### Modals & Overlays
**Add Transaction Modal:**
- Centered overlay with backdrop (backdrop-blur-sm)
- Modal width: max-w-md on mobile, max-w-lg on desktop
- Header with title and close button (Heroicons: x-mark)
- Form body with input fields
- Footer with Cancel and Save buttons
- Padding: p-6

### Buttons
**Button Hierarchy:**
- Primary action: Solid fill, font-medium, h-12, px-6, rounded-md
- Secondary action: Outlined border, font-medium, h-12, px-6, rounded-md
- Tertiary/Text: No border, font-medium, underline on hover
- Icon buttons: Square (h-10 w-10), rounded-md
- Mobile: Full width buttons (w-full) for primary actions

### Status Indicators
**Category Badges:**
- Inline badges: text-xs font-medium px-3 py-1 rounded-full
- Icons: Use Font Awesome for category icons (fa-home, fa-car, fa-utensils, fa-briefcase)
- Uppercase text for consistency

---

## D. Mobile Optimization

**Responsive Breakpoints:**
- Mobile-first approach (base styles for mobile)
- Tablet: md: (768px)
- Desktop: lg: (1024px)
- Wide: xl: (1280px)

**Mobile-Specific Patterns:**
- Bottom navigation bar with icons (Dashboard, Add, Reports, Profile)
- Swipeable cards for quick actions
- Collapsible sections with chevron indicators
- Touch-friendly tap targets: minimum h-12
- Sticky "Add Transaction" FAB button (bottom-right, rounded-full, shadow-lg)

**Data Table Mobile Treatment:**
Transform tables into card stacks:
```
[Category Icon] [Category Name]
Amount: $XXX.XX
Date: MM/DD/YYYY
Description: Text here
```

---

## E. Page-Specific Layouts

### Dashboard
- **Hero Section:** Financial summary cards (4-up grid)
- **Main Area:** Recent transactions table + Monthly chart (side-by-side on desktop)
- **Sidebar:** Quick stats, category breakdown donut chart
- No hero image needed

### Income/Expense Pages
- **Filter Bar:** Date range, category filter, search input (sticky)
- **Action Bar:** Add button, Export button
- **Main Content:** Sortable table with pagination
- **Side Panel:** Category totals, monthly average

### Assets/Liabilities/Investments Pages
- **Summary Cards:** Total value, count, recent changes
- **Grid View:** Cards with item details (2-3 columns)
- **List View Toggle:** Switch between grid and table views

---

## F. Icons & Assets

**Icon Library:** Font Awesome (CDN) - comprehensive financial icon set
**Category Icons:**
- Income: fa-dollar-sign, fa-briefcase, fa-gift
- Expenses: fa-shopping-cart, fa-home, fa-car, fa-utensils, fa-heart
- Assets: fa-building, fa-car, fa-landmark
- Investments: fa-chart-line, fa-coins

**No Images Required:** This is a data-focused application. All visual communication through typography, icons, and charts.

---

## G. Animations

**Minimal Motion:**
- Card hover: subtle shadow increase (transition-shadow duration-200)
- Button interactions: scale-95 on active state
- Modal entry: fade-in with slight scale (duration-200)
- Chart animations: Smooth number counting on load (built into Chart.js)
- Loading states: Simple spinner (Heroicons: arrow-path with animate-spin)

**No decorative animations** - maintain professional, focused experience.