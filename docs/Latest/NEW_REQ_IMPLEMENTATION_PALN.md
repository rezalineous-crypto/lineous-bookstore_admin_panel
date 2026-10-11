# Comprehensive Implementation Plan: CLC Resource Integration

Based on the requirements document and your clarifications, this document outlines the complete implementation plan for integrating category management, book classification, order filtering, sales analytics, and navigation management into the CLC Resource admin panel.

## Table of Contents

1. [Data Model Hierarchy](#data-model-hierarchy)
2. [Phase 1: Category Management Foundation](#phase-1-category-management-foundation)
3. [Phase 2: Book Management — Category Integration](#phase-2-book-management--category-integration)
4. [Phase 3: Order Management — Category Filter & Context](#phase-3-order-management--category-filter--context)
5. [Phase 4: Admin Dashboard Analytics — Sales by Category](#phase-4-admin-dashboard-analytics--sales-by-category)
6. [Phase 5: Navigation / Menu Management](#phase-5-navigation--menu-management)
7. [Phase 6: Bulk Actions & Polish](#phase-6-bulk-actions--polish)
8. [File Summary](#file-summary)
9. [Deferred Decisions](#deferred-decisions)
10. [Recommended Starting Point](#recommended-starting-point)

---

## Data Model Hierarchy

### Updated Hierarchy

```text
Category (NEW — top level for navigation/menu)
  └── Publication (existing — publisher: Oxford, Cambridge, etc.)
        └── Subject (existing — academic: Physics, Chemistry, etc.)
              └── Book (existing — links to Publication + Subject + Category[])
```

### Key Design Principle

* **Categories:** Used for customer-facing navbar and menu navigation.
* **Publications:** Represent publishers, such as Oxford and Cambridge.
* **Subjects:** Represent academic classifications, such as Physics and Chemistry.
* **Books:** Link to all three: Category, Publication, and Subject.

Categories are introduced as a new navigation layer. Publications and Subjects retain their academic classification roles.

---

## Phase 1: Category Management Foundation

### 1.1 Types — `lib/types/book.ts`

Add the following interfaces to the existing file.

#### Category

```ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isHidden: boolean;
  displayOrder: number;
  icon: string | null;
  route: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    books: number;
  };
}
```

#### CreateCategoryDto

```ts
export interface CreateCategoryDto {
  name: string;
  slug: string;
  parentId?: string | null;
  isHidden?: boolean;
  displayOrder?: number;
  icon?: string;
  route?: string;
}
```

#### UpdateCategoryDto

```ts
export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  parentId?: string | null;
  isHidden?: boolean;
  displayOrder?: number;
  icon?: string;
  route?: string;
}
```

#### CategoryMenuResponse

```ts
export interface CategoryMenuResponse {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  route: string | null;
  displayOrder: number;
  children: CategoryMenuResponse[];
}
```

### 1.2 API — `lib/api/categories.ts` (New File)

Create a new API module containing the following functions.

| Function                  | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| `getCategories()`         | Retrieve all categories                  |
| `getCategory(id)`         | Retrieve a category by ID                |
| `createCategory(dto)`     | Create a category                        |
| `updateCategory(id, dto)` | Update a category                        |
| `deleteCategory(id)`      | Delete a category                        |
| `getCategoriesMenu()`     | Retrieve the hierarchical menu structure |

Expected function signatures:

```ts
export const getCategories =
  async (): Promise<ApiResponse<Category[]>>;

export const getCategory =
  async (id: string): Promise<ApiResponse<Category>>;

export const createCategory =
  async (dto: CreateCategoryDto): Promise<ApiResponse<Category>>;

export const updateCategory =
  async (
    id: string,
    dto: UpdateCategoryDto
  ): Promise<ApiResponse<Category>>;

export const deleteCategory =
  async (id: string): Promise<ApiResponse<null>>;

export const getCategoriesMenu =
  async (): Promise<CategoryMenuResponse[]>;
```

### 1.3 Hooks — `lib/hooks/use-categories.ts` (New File)

Implement the following hooks:

| Hook                        | Responsibility                            |
| --------------------------- | ----------------------------------------- |
| `useCategories()`           | Fetch categories                          |
| `useCategory(id)`           | Fetch a single category                   |
| `useCreateCategory()`       | Create a category                         |
| `useUpdateCategory()`       | Update a category                         |
| `useDeleteCategory()`       | Delete a category                         |
| `useCategoriesMenu()`       | Fetch the navigation menu                 |
| `useToggleCategoryHidden()` | Optimistically toggle category visibility |
| `useReorderCategories()`    | Bulk-update category display order        |

### 1.4 Components — `components/categories/` (New Folder)

Create the following components.

| File                     | Purpose                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `category-form.tsx`      | Create/edit form with all seven fields                                                                           |
| `category-dialog.tsx`    | Dialog wrapper for the category form                                                                             |
| `categories-table.tsx`   | Table with seven columns, inline visibility toggle, inline `displayOrder` editing, and multi-select bulk actions |
| `category-tree-view.tsx` | Hierarchical tree for the parent-category dropdown                                                               |
| `menu-preview.tsx`       | Side panel that renders the live navbar from `/categories/menu`                                                  |

### 1.5 Pages — `app/admin/categories/`

| File            | Purpose                                                      |
| --------------- | ------------------------------------------------------------ |
| `page.tsx`      | List view with table and side-panel menu preview             |
| `[id]/page.tsx` | Optional detail view; editing can alternatively use a dialog |

### 1.6 Navigation — `config/navigation.ts`

* Uncomment the existing Categories navigation entry.
* Add Categories to the admin sidebar.

### 1.7 Query Keys — `constants/query-key.ts`

Add the following query keys:

```ts
categories: ["categories"],
categoriesMenu: ["categories", "menu"],
```

---

## Phase 2: Book Management — Category Integration

### 2.1 Types — `lib/types/book.ts`

* Add `categoryIds?: string[]` to `CreateBookDto`.
* Add `categoryIds?: string[]` to `UpdateBookDto`.
* Add `categories?: Category[]` to the `Book` interface.

### 2.2 API — `lib/api/books.ts`

Update the book API functions:

* **`createBook`:** Append `categoryIds` to `FormData`.
* **`updateBook`:** Append `categoryIds` to `FormData`, replacing all existing category assignments.

### 2.3 Components

| File                               | Required Changes                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `components/books/book-form.tsx`   | Add a multi-select `SearchableDropdown` for `categoryIds`. Fetch all categories, including hidden categories. |
| `components/books/books-table.tsx` | Add a Categories column displaying comma-separated category names, with a tooltip on hover.                   |
| `components/books/book-dialog.tsx` | Show assigned categories with links to category details.                                                      |
| `app/admin/books/[id]/page.tsx`    | Add a Categories section to the metadata grid, with inline add/remove actions.                                |

---

## Phase 3: Order Management — Category Filter & Context

### 3.1 Types — `lib/types/book.ts`

Add the following fields to `OrderItem`:

```ts
categoryId?: string;
category?: Category;
```

The category information displayed in order details should represent the historical category assignment at the time of purchase.

### 3.2 API — `lib/api/orders.ts`

* Update `getOrders` to accept a `categoryId` query parameter.

### 3.3 Hooks — `lib/hooks/use-orders.ts`

* Update `useOrders` to accept filter parameters, including `categoryId`.

### 3.4 Components

| File                                        | Required Changes                                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `components/orders/orders-table.tsx`        | Add a category filter dropdown above the table. Fetch all categories.                     |
| `components/orders/order-detail-dialog.tsx` | Add a Category column to the Items tab, displaying the historical `OrderItem.categoryId`. |

---

## Phase 4: Admin Dashboard Analytics — Sales by Category

### 4.1 Types — `lib/types/book.ts`

Add the following interfaces.

#### SalesByCategory

```ts
export interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  isHidden: boolean;
  orders: number;
  revenue: number;
  percentage: number;
}
```

#### SalesAnalyticsData

Extend the existing interface with an optional field:

```ts
export interface SalesAnalyticsData {
  // ... existing fields
  salesByCategory?: SalesByCategory[];
}
```

### 4.2 API — `lib/api/analytics.ts`

Choose one of the following approaches during implementation:

* Extend `getSalesAnalytics` to support a `groupBy: "category"` parameter.
* Alternatively, add a dedicated `getSalesByCategory(params: SalesAnalyticsParams)` function.

### 4.3 Hooks — `lib/hooks/use-analytics.ts`

* Add `useSalesByCategory(params)`.

### 4.4 Components — `components/analytics/`

Create `sales-by-category.tsx`.

The component should provide:

* A table with Category, Orders, Revenue, and % of Total columns.
* A CSV export button.

### 4.5 Page — `app/admin/analytics/sales/page.tsx`

Integrate the new sales-by-category widget into the existing sales analytics page.

Requirements:

* Reuse the existing `PeriodFilter`.
* Support the same time ranges: Today, Week, Month, and Custom.

---

## Phase 5: Navigation / Menu Management

### 5.1 Menu Preview — `components/categories/menu-preview.tsx`

Create a side panel on the categories list page that:

* Renders the hierarchical menu from `GET /categories/menu`.
* Displays hidden state, `displayOrder`, icons, and routes.
* Updates live when `isHidden` is toggled or `displayOrder` changes.

### 5.2 Quick Toggle

In `categories-table.tsx`:

* Add a Switch component to the `isHidden` column.
* Implement optimistic updates through `useToggleCategoryHidden`.
* Reflect visibility changes immediately in the menu preview panel.

---

## Phase 6: Bulk Actions & Polish

### 6.1 Bulk Toggle Hidden

* Add multi-select functionality to the categories table.
* Add a **Toggle Hidden** button to the bulk-action toolbar.
* Call `updateCategory` for each selected category.

### 6.2 Bulk Reorder

Support bulk display-order changes through either:

* A **Set Display Order** modal for selected categories.
* Inline editing of the `displayOrder` column with up/down arrows.

**Constraint:** Do not add a drag-and-drop library. Up/down arrows and inline editing are sufficient.

### 6.3 Books Tree Filter — `app/admin/books/tree/page.tsx`

* Add a `categoryId` query parameter.
* Filter the book tree by category.

---

## File Summary

| Area       | New Files                                                                         | Modified Files                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types      | —                                                                                 | `lib/types/book.ts`                                                                                                                                                                         |
| API        | `lib/api/categories.ts`                                                           | `lib/api/books.ts`, `lib/api/orders.ts`, `lib/api/analytics.ts`                                                                                                                             |
| Hooks      | `lib/hooks/use-categories.ts`                                                     | `lib/hooks/use-books.ts`, `lib/hooks/use-orders.ts`, `lib/hooks/use-analytics.ts`                                                                                                           |
| Components | `components/categories/*` (5 files); `components/analytics/sales-by-category.tsx` | `components/books/book-form.tsx`, `components/books/books-table.tsx`, `components/books/book-dialog.tsx`, `components/orders/orders-table.tsx`, `components/orders/order-detail-dialog.tsx` |
| Pages      | `app/admin/categories/page.tsx`, `app/admin/categories/[id]/page.tsx`             | `app/admin/books/page.tsx`, `app/admin/books/[id]/page.tsx`, `app/admin/orders/page.tsx`, `app/admin/analytics/sales/page.tsx`, `app/admin/books/tree/page.tsx`                             |
| Config     | —                                                                                 | `config/navigation.ts`, `constants/query-key.ts`                                                                                                                                            |

---

## Deferred Decisions

The following decisions are intentionally deferred until implementation:

1. **Sales by Category API:** Decide during Phase 4 whether to use a backend `groupBy: "category"` parameter or client-side computation.
2. **Export Format:** CSV only for now; PDF export can be considered later.
3. **Drag-and-Drop Reordering:** Not required. Up/down arrows and inline editing are sufficient.

---

## Recommended Starting Point

**Phase 1: Category Management Foundation** is the logical starting point because every subsequent phase depends on the category data model, API, hooks, and management interface.

### Initial Implementation Checklist

* [ ] Add Category-related interfaces to `lib/types/book.ts`.
* [ ] Create `lib/api/categories.ts`.
* [ ] Create `lib/hooks/use-categories.ts`.
* [ ] Build the five category management components.
* [ ] Create the admin categories page.
* [ ] Add Categories to the admin sidebar.
* [ ] Register the category query keys.
* [ ] Verify category CRUD operations and menu preview behavior.

**Next step:** Begin implementing Phase 1, then proceed sequentially through Phases 2–6.
