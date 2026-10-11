// Book type definitions matching backend API

export type BookStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AttachmentType = "IMAGE" | "PDF" | "BANNER" | "THUMBNAIL";

export interface Publication {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  publicationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Category types
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

export interface CreateCategoryDto {
  name: string;
  slug: string;
  parentId?: string | null;
  isHidden?: boolean;
  displayOrder?: number;
  icon?: string;
  route?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  parentId?: string | null;
  isHidden?: boolean;
  displayOrder?: number;
  icon?: string;
  route?: string;
}

export interface CategoryMenuResponse {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  route: string | null;
  displayOrder: number;
  isHidden: boolean;
  children: CategoryMenuResponse[];
}

export interface BookAttachment {
  id: string;
  bookId: string;
  url: string;
  publicId: string;
  type: AttachmentType;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceRange {
  min: number;
  max: number;
  display: string;
}

export interface BookPaper {
  id: string;
  bookId: string;
  code?: string;
  name: string;
  price: number;
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  stock: number;
  isbn?: string;
  pageCount?: number;
  thumbnail?: string;
  sortOrder: number;
  isDefault: boolean;
  status: "DRAFT" | "PUBLISHED";
  effectivePrice: number;
  isInStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  publicationDate?: string;
  edition?: string;
  language?: string;
  status: BookStatus;
  thumbnail?: string;
  publicationId: string;
  subjectId: string;
  categoryIds?: string[];
  createdAt: string;
  updatedAt: string;
  publication?: Publication;
  subject?: Subject;
  categories?: Category[];
  attachments?: BookAttachment[];
  papers?: BookPaper[];
  priceRange?: PriceRange | null;
}

// DTOs for API requests
export interface CreateBookDto {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  publicationDate?: string;
  edition?: string;
  language?: string;
  status?: BookStatus;
  publicationId: string;
  subjectId: string;
  categoryIds?: string[];
}

export interface UpdateBookDto {
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  publicationDate?: string;
  edition?: string;
  language?: string;
  status?: BookStatus;
  publicationId?: string;
  subjectId?: string;
  categoryIds?: string[];
}

export interface CreateBookPaperDto {
  bookId: string;
  code?: string;
  name: string;
  price: number;
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  stock?: number;
  isbn?: string;
  pageCount?: number;
  thumbnail?: string;
  sortOrder?: number;
  isDefault?: boolean;
  status?: "DRAFT" | "PUBLISHED";
}

export interface UpdateBookPaperDto {
  code?: string;
  name?: string;
  price?: number;
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  stock?: number;
  isbn?: string;
  pageCount?: number;
  thumbnail?: string;
  sortOrder?: number;
  isDefault?: boolean;
  status?: "DRAFT" | "PUBLISHED";
}

// Publication DTOs
export interface CreatePublicationDto {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  status?: BookStatus;
  isActive?: boolean;
}

export interface UpdatePublicationDto {
  name?: string;
  slug?: string;
  description?: string;
  logo?: string;
  status?: BookStatus;
  isActive?: boolean;
}

// Subject DTOs
export interface CreateSubjectDto {
  name: string;
  slug: string;
  description?: string;
  publicationId?: string;
  isActive?: boolean;
}

export interface UpdateSubjectDto {
  name?: string;
  slug?: string;
  description?: string;
  publicationId?: string;
  isActive?: boolean;
}

// Review DTOs
export interface CreateReviewDto {
  bookId: string;
  reviewerName: string;
  designation?: string;
  rating: number;
  comment?: string;
  displayOrder?: number;
}

export interface UpdateReviewDto {
  reviewerName?: string;
  designation?: string;
  rating?: number;
  comment?: string;
  displayOrder?: number;
}

export interface Review {
  id: string;
  bookId: string;
  reviewerName: string;
  designation?: string;
  rating: number;
  comment?: string;
  displayOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Order types
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type PaymentMethod = "COD" | "CARD" | "BANK_TRANSFER" | "MOBILE_BANKING";

export interface OrderItemPaper {
  id: string;
  name: string;
  price: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  paperId?: string;
  categoryId?: string;
  bookTitle: string;
  paperName?: string;
  paperPrice?: string;
  quantity: number;
  subtotal: string;
  paper?: OrderItemPaper;
  category?: Category;
}

export interface Payment {
  id: string;
  orderId: string;
  gateway: string;
  transactionId?: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface OrderAddress {
  id: string;
  name?: string;
  phone?: string;
  district?: string;
  addressLine?: string;
}

export interface Order {
  id: string;
  userId: string;
  addressId?: string;
  orderNumber: string;
  subtotal: string;
  discount?: string;
  shipping?: string;
  total: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  orderItems?: OrderItem[];
  payments?: Payment[];
  user?: OrderUser;
  address?: OrderAddress;
}

// Order DTOs
export interface CreateOrderDto {
  addressId: string;
  discount?: number;
  shipping?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface UpdateOrderShippingDto {
  shipping: number;
}

// Receipt types
export interface ReceiptOrder {
  id: string;
  orderNumber: string;
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  orderItems?: OrderItem[];
  address?: OrderAddress;
  user?: OrderUser;
}

export interface Receipt {
  id: string;
  orderId: string;
  receiptNumber: string;
  pdfUrl: string;
  publicId: string;
  qrCodeUrl: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  order?: ReceiptOrder;
}

export type ReceiptDetails = Receipt;

export interface ReceiptVerification {
  id: string;
  orderId: string;
  receiptNumber: string;
  pdfUrl: string;
  qrCodeUrl: string;
  generatedAt: string;
  order: {
    orderNumber: string;
    total: string;
    status: OrderStatus;
    orderItems?: OrderItem[];
  };
}

export interface GenerateReceiptResponse {
  pdfUrl: string;
  receiptNumber: string;
}

// User types
export type UserRole = "ADMIN" | "USER";

export type UserProvider = "EMAIL" | "GOOGLE" | "FACEBOOK" | "APPLE";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  provider: UserProvider;
  providerId?: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// User DTOs
export interface CreateUserDto {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
  provider?: UserProvider;
  providerId?: string;
  avatar?: string;
  status?: UserStatus;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  avatar?: string;
  role?: UserRole;
  status?: UserStatus;
}

// API Response types
export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export interface PaginatedResponse<T> {
  message: string;
  status: string;
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

// Tree structure types
export interface BookTreeBook {
  id: string;
  title: string;
  slug: string;
  priceRange?: PriceRange | null;
  thumbnail?: string;
}

export interface BookTreeSubject {
  subject: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  books: BookTreeBook[];
}

export interface BookTreePublication {
  publication: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  subjects: BookTreeSubject[];
}

// ==================== Dashboard & Analytics Types ====================

export interface DashboardKpis {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  totalCustomers: number;
  totalSubjects: number;
  totalPublications: number;
  pendingOrders: number;
  lowStockBooks: number;
}

export interface OrderStatusBreakdown {
  status: OrderStatus;
  count: number;
  percentage: number;
}

export interface TopSellingBook {
  rank: number;
  bookId: string;
  title: string;
  publication: string;
  subject: string;
  totalQuantitySold: number;
  totalRevenue: number;
  coverImage?: string;
}

export interface RecentOrder {
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface SalesTrend {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  orderStatusBreakdown: OrderStatusBreakdown[];
  topSellingBooks: TopSellingBook[];
  recentOrders: RecentOrder[];
  salesTrend: SalesTrend;
}

export interface DashboardResponse {
  status: string;
  data: DashboardData;
}

// Sales Analytics types
export interface DateRange {
  start: string;
  end: string;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItemsSold: number;
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  rank: number;
  bookId: string;
  title: string;
  quantitySold: number;
  revenue: number;
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  count: number;
  revenue: number;
}

export interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  isHidden: boolean;
  orders: number;
  revenue: number;
  percentage: number;
}

export interface SalesAnalyticsData {
  period: string;
  dateRange: DateRange;
  summary: SalesSummary;
  timeSeriesData: TimeSeriesData[];
  topProducts: TopProduct[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  salesByCategory?: SalesByCategory[];
}

export type SalesAnalyticsResponse = SalesAnalyticsData;

export interface SalesAnalyticsParams {
  period: "day" | "week" | "month" | "year" | "custom";
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}

// Top Selling Books types
export interface TopSellingBookDetail {
  rank: number;
  bookId: string;
  title: string;
  slug: string;
  publication: string;
  subject: string;
  totalQuantitySold: number;
  totalRevenue: number;
  currentStock: number;
  coverImage?: string;
  averageRating?: number;
}

export interface TopSellingBooksResponse {
  status: string;
  data: {
    books: TopSellingBookDetail[];
  };
}

export interface TopSellingBooksParams {
  limit?: number;
  period?: "all" | "month" | "week";
}

// Order Status Stats types
export interface OrderStatusStat {
  status: OrderStatus;
  count: number;
  percentage: number;
}

export interface OrderStatusStatsResponse {
  status: string;
  stats: OrderStatusStat[];
  totalOrders: number;
}

// Sales by Period types
export interface SalesPeriodData {
  period: string;
  date: string;
  totalSales: number;
  totalOrders: number;
  currency: string;
}

export interface SalesPeriodResponse {
  status: string;
  data: SalesPeriodData;
}

export interface SalesPeriodParams {
  period: "day" | "week" | "month";
  date?: string;
}

// Inventory Overview types
export interface InventorySummary {
  totalBooks: number;
  publishedBooks: number;
  draftBooks: number;
  archivedBooks: number;
  outOfStock: number;
  lowStock: number;
}

export interface LowStockBook {
  bookId: string;
  title: string;
  paperName: string;
  currentStock: number;
  threshold: number;
}

export interface OutOfStockBook {
  bookId: string;
  title: string;
  paperName: string;
}

export interface InventoryOverviewData {
  summary: InventorySummary;
  lowStockBooks: LowStockBook[];
  outOfStockBooks: OutOfStockBook[];
}

export interface InventoryOverviewResponse {
  status: string;
  data: InventoryOverviewData;
}

// Customer Insights types
export interface CustomerSummary {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  repeatCustomers: number;
}

export interface TopCustomer {
  userId: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
}

export interface CustomerInsightsData {
  summary: CustomerSummary;
  topCustomers: TopCustomer[];
}

export type CustomerInsightsResponse = CustomerInsightsData;

export interface CustomerInsightsParams {
  period?: "month" | "year" | "all";
}
