export const QueryKeys = {
    books: ["books"],

    booksTree: ["books", "tree"],

    users: ["users"],

    orders: ["orders"],

    receiptDetails: (orderId: string) => ["orders", orderId, "receipt"],

    verifyReceipt: (receiptNumber: string) => ["receipts", "verify", receiptNumber],

    publications: ["publications"],

    subjects: ["subjects"],

    teachers: ["teachers"],

    categories: ["categories"],
    categoriesMenu: ["categories", "menu"],

    banners: ["banners"],

    reviews: ["reviews"],

    settings: ["settings"],

    bookPapers: ["bookPapers"],

    bookPapersByBook: (bookId: string) => ["bookPapers", "book", bookId],

    // Dashboard & Analytics
    dashboard: ["dashboard"],

    dashboardStats: ["dashboard", "stats"],

    salesAnalytics: (params: { period: string; startDate?: string; endDate?: string; groupBy?: string }) =>
      ["analytics", "sales", params] as const,

    salesPeriod: (params: { period: string; date?: string }) =>
      ["sales", "period", params] as const,

    orderStatusStats: ["orders", "status-stats"],

    topSellingBooks: (params: { limit?: number; period?: string }) =>
      ["books", "top-selling", params] as const,

    inventoryOverview: ["inventory", "overview"],

    customerInsights: (params: { period?: string }) =>
      ["analytics", "customers", params] as const,

    salesByCategory: (params: { period: string; startDate?: string; endDate?: string; groupBy?: string }) =>
      ["analytics", "sales", "by-category", params] as const,
} as const;
