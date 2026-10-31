"use client";

import { useState } from "react";
import { CustomModal } from "@/components/ui/custom-modal";
import { Button } from "@/components/ui/button";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { OrderStatusBadge, PaymentStatusBadge } from "./order-badges";
import { SetShippingDialog } from "./set-shipping-dialog";

import {
  useOrder,
  useUpdateOrderStatus,
  useCancelOrder,
  useReturnOrder,
  useReceiptDetails,
  useGenerateReceipt,
  useDownloadReceipt,
  useVerifyReceipt,
} from "@/lib/hooks/use-orders";

import { getNextOrderStatuses, OrderStatusLabels } from "@/constants/status";
import { cn, formatBDT, formatDateTime } from "@/lib/utils";

import type { Order, OrderStatus, ReceiptDetails } from "@/lib/types/book";

import {
  FileText,
  Download,
  RefreshCw,
  QrCode,
  CheckCircle2,
  Loader2,
  User,
  MapPin,
  CreditCard,
  Truck,
  AlertTriangle,
  Package,
  Receipt,
  Phone,
  Mail,
  XCircle,
  RotateCcw,
  StickyNote,
} from "lucide-react";

/**
 * Layout, top to bottom:
 *
 *  1. Needs attention   (only when something requires action)
 *  2. Status bar        (status, payment status/method, items, total  +  "move order to")
 *  3. Two columns
 *       Left  : Items & totals  ->  Payment  ->  Receipt
 *       Right : Customer  ->  Shipping address  ->  Notes  ->  Other actions
 *
 * Primary actions live in the status bar, destructive ones are last on the right.
 */

interface OrderDetailDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({
  orderId,
  open,
  onOpenChange,
}: OrderDetailDialogProps) {
  const { data: order, isLoading, error } = useOrder(orderId ?? "");

  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();
  const returnOrder = useReturnOrder();

  const { data: receipt } = useReceiptDetails(orderId ?? "");
  const generateReceipt = useGenerateReceipt();
  const downloadReceipt = useDownloadReceipt();

  const [verifyRequested, setVerifyRequested] = useState(false);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);

  const verifyReceipt = useVerifyReceipt(
    receipt?.receiptNumber ?? "",
    verifyRequested
  );

  const nextStatuses = order ? getNextOrderStatuses(order.status) : [];
  const isClosed = order?.status === "CANCELLED" || order?.status === "RETURNED";

  const isShippingMissing = order
    ? parseFloat(order.shipping ?? "0") === 0
    : true;

  const isReceiptStale =
    order && receipt?.order
      ? parseFloat(receipt.order.shipping) !== parseFloat(order.shipping ?? "0")
      : false;

  const handleStatusChange = async (status: OrderStatus) => {
    if (!orderId) return;
    try {
      await updateStatus.mutateAsync({ id: orderId, data: { status } });
    } catch {
      // Error handled by mutation toast.
    }
  };

  const showShippingAlert = !!order && isShippingMissing && !isClosed;
  const showReceiptAlert = !!order && isReceiptStale && !isClosed;

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title={order?.orderNumber ?? "Order details"}
      description={
        order
          ? `Placed on ${formatDateTime(order.createdAt)}`
          : "Loading order information..."
      }
      className="w-[calc(100vw-16px)] sm:w-[calc(100vw-32px)] sm:max-w-6xl max-h-[94vh] overflow-hidden p-0"
    >
      {isLoading && (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !isLoading && (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="font-medium text-destructive">
            {error instanceof Error ? error.message : "Failed to load order"}
          </p>
        </div>
      )}

      {order && !isLoading && (
        <>
          <div className="">
            <div className="space-y-5 bg-white">
              {/* 1. NEEDS ATTENTION */}
              {(showShippingAlert || showReceiptAlert) && (
                <div className="space-y-2">
                  {showShippingAlert && (
                    <AttentionBanner
                      title="Delivery charge is not set"
                      description="Set it before generating the receipt."
                      actionLabel="Set delivery charge"
                      actionIcon={<Truck className="mr-2 h-4 w-4" />}
                      onAction={() => setShippingDialogOpen(true)}
                    />
                  )}

                  {showReceiptAlert && (
                    <AttentionBanner
                      title="Receipt is out of date"
                      description="The delivery charge changed after the receipt was generated."
                      actionLabel="Regenerate receipt"
                      actionIcon={
                        generateReceipt.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )
                      }
                      disabled={generateReceipt.isPending}
                      onAction={() => generateReceipt.mutate(order.id)}
                    />
                  )}
                </div>
              )}

              {/* 2. STATUS BAR */}
              {/* <StatusBar
                order={order}
                nextStatuses={nextStatuses}
                isUpdating={updateStatus.isPending}
                onChangeStatus={handleStatusChange}
              /> */}

              {/* 3. MAIN GRID */}
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                {/* LEFT */}
                <div className="min-w-0 space-y-5">
                  <ItemsAndTotals
                    order={order}
                    isShippingMissing={isShippingMissing}
                    canEditShipping={!isClosed}
                    onEditShipping={() => setShippingDialogOpen(true)}
                  />

                  <PaymentCard order={order} />

                  <ReceiptCard
                    order={order}
                    receipt={receipt}
                    isStale={isReceiptStale}
                    isShippingMissing={isShippingMissing}
                    generateReceipt={generateReceipt}
                    downloadReceipt={downloadReceipt}
                    verifyReceipt={verifyReceipt}
                    verifyRequested={verifyRequested}
                    onVerify={() => setVerifyRequested(true)}
                  />
                </div>

                {/* RIGHT */}
                <aside className="min-w-0 space-y-5">
                  <CustomerCard order={order} />
                  <AddressCard order={order} />
                  <NotesCard order={order} />

                  {!isClosed && (
                    <OtherActions
                      order={order}
                      cancelOrder={cancelOrder}
                      returnOrder={returnOrder}
                    />
                  )}
                </aside>
              </div>

              <p className="border-t pt-4 text-xs text-muted-foreground">
                Order ID: <span className="font-mono">{order.id}</span>
              </p>
            </div>
          </div>

          <SetShippingDialog
            order={order}
            open={shippingDialogOpen}
            onOpenChange={setShippingDialogOpen}
          />
        </>
      )}
    </CustomModal>
  );
}

// ============================================================
// LAYOUT PRIMITIVES
// ============================================================

function Card({
  icon,
  title,
  description,
  action,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-xl border bg-card drop-shadow-sm", className)}>
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3 bg-gray-100">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-500">
            {icon}
          </span>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            {description && (
              <p className="truncate text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {action}
      </header>

      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function IconRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <FieldLabel>{label}</FieldLabel>
        <p
          className={cn(
            "mt-0.5 break-words text-sm",
            !value && "text-muted-foreground"
          )}
        >
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function EmptyNote({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <span className="mb-2 text-muted-foreground">{icon}</span>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

// ============================================================
// 1. ATTENTION BANNER
// ============================================================

function AttentionBanner({
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  disabled,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: React.ReactNode;
  onAction: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950/30">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
            {title}
          </p>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
            {description}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="shrink-0 bg-background"
        onClick={onAction}
        disabled={disabled}
      >
        {actionIcon}
        {actionLabel}
      </Button>
    </div>
  );
}

// ============================================================
// 2. STATUS BAR
// ============================================================

function StatusBar({
  order,
  nextStatuses,
  isUpdating,
  onChangeStatus,
}: {
  order: Order;
  nextStatuses: OrderStatus[];
  isUpdating: boolean;
  onChangeStatus: (status: OrderStatus) => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid grid-cols-4 gap-y-4">
        <div className="space-y-1.5">
          <FieldLabel>Order status</FieldLabel>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Payment</FieldLabel>
          <div className="flex items-center gap-2">
            <PaymentStatusBadge status={order.paymentStatus} />
            <span className="text-xs text-muted-foreground">
              {paymentMethodLabel(order.paymentMethod)}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Items</FieldLabel>
          <p className="text-sm font-semibold">
            {order.orderItems?.length ?? 0}
          </p>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Total</FieldLabel>
          <p className="text-lg font-bold leading-none text-primary">
            {formatBDT(order.total)}
          </p>
        </div>
      </div>

      <div className="w-full space-y-1.5 lg:w-60">
        <FieldLabel>Move order to</FieldLabel>

        {nextStatuses.length > 0 ? (
          <SearchableDropdown
            items={nextStatuses.map((s) => ({
              id: s,
              label: OrderStatusLabels[s],
            }))}
            value=""
            placeholder="Select next status"
            onChange={(item) => {
              if (item) onChangeStatus(item.id as OrderStatus);
            }}
            buttonClassName="w-full bg-background"
          />
        ) : (
          <p className="rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
            No further status changes available.
          </p>
        )}

        {isUpdating && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating status...
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LEFT: ITEMS + TOTALS
// ============================================================

function ItemsAndTotals({
  order,
  isShippingMissing,
  canEditShipping,
  onEditShipping,
}: {
  order: Order;
  isShippingMissing: boolean;
  canEditShipping: boolean;
  onEditShipping: () => void;
}) {
  const items = order.orderItems ?? [];

  return (
    <Card
      icon={<Package className="h-4 w-4" />}
      title="Items"
      description={`${items.length} ${items.length === 1 ? "product" : "products"} in this order`}
    >
      {items.length === 0 ? (
        <EmptyNote
          icon={<Package className="h-6 w-6" />}
          title="No items found"
          description="There are no products associated with this order."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Book</th>
                <th className="px-3 py-2.5 text-right font-medium">Price</th>
                <th className="px-3 py-2.5 text-center font-medium">Qty</th>
                <th className="px-4 py-2.5 text-right font-medium">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => {
                const paper = item.paperName ?? item.paper?.name;
                return (
                  <tr key={item.id} className="border-b last:border-0 align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium leading-5">{item.bookTitle}</p>

                      {(paper || item.category) && (
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          {paper && <span>Paper: {paper}</span>}
                          {item.category && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                              {item.category.name}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right text-muted-foreground">
                      {formatBDT(item.paperPrice)}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex min-w-7 justify-center rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
                        {item.quantity}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                      {formatBDT(item.subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals, receipt-style, right aligned under the items */}
      <dl className="space-y-2 border-t bg-muted/20 px-4 py-4 text-sm sm:ml-auto sm:max-w-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatBDT(order.subtotal)}</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Discount</dt>
          <dd>{formatBDT(order.discount)}</dd>
        </div>

        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Delivery charge</dt>
          <dd className="flex items-center gap-2">
            {isShippingMissing ? (
              <span className="font-medium text-amber-600 dark:text-amber-400">
                Not set
              </span>
            ) : (
              <span>{formatBDT(order.shipping)}</span>
            )}

            {canEditShipping && (
              <button
                type="button"
                onClick={onEditShipping}
                className="text-xs font-medium text-primary hover:underline"
              >
                {isShippingMissing ? "Set" : "Edit"}
              </button>
            )}
          </dd>
        </div>

        <div className="flex justify-between gap-4 border-t pt-3 text-base font-bold">
          <dt>Grand total</dt>
          <dd className="text-primary">{formatBDT(order.total)}</dd>
        </div>
      </dl>
    </Card>
  );
}

// ============================================================
// LEFT: PAYMENTS
// ============================================================

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Cash on delivery",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  MOBILE_BANKING: "Mobile banking",
};

function paymentMethodLabel(method?: string | null) {
  if (!method) return "—";
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

function PaymentCard({ order }: { order: Order }) {
  return (
    <Card icon={<CreditCard className="h-4 w-4" />} title="Payment">
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <div>
          <FieldLabel>Method</FieldLabel>
          <p className="mt-0.5 text-sm font-medium">
            {paymentMethodLabel(order.paymentMethod)}
          </p>
        </div>

        <div>
          <FieldLabel>Status</FieldLabel>
          <div className="mt-1">
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div>
          <FieldLabel>Amount</FieldLabel>
          <p className="mt-0.5 text-sm font-semibold">
            {formatBDT(order.total)}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// LEFT: RECEIPT (no PDF preview)
// ============================================================

function ReceiptCard({
  order,
  receipt,
  isStale,
  isShippingMissing,
  generateReceipt,
  downloadReceipt,
  verifyReceipt,
  verifyRequested,
  onVerify,
}: {
  order: Order;
  receipt?: ReceiptDetails;
  isStale: boolean;
  isShippingMissing: boolean;
  generateReceipt: ReturnType<typeof useGenerateReceipt>;
  downloadReceipt: ReturnType<typeof useDownloadReceipt>;
  verifyReceipt: ReturnType<typeof useVerifyReceipt>;
  verifyRequested: boolean;
  onVerify: () => void;
}) {
  const isPending = order.status === "PENDING";

  // ---- No receipt yet ----
  if (!receipt) {
    return (
      <Card icon={<FileText className="h-4 w-4" />} title="Receipt">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">No receipt generated yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isShippingMissing
                ? "Set the delivery charge first, then generate the receipt."
                : "Generates the receipt and its verification QR code."}
            </p>
          </div>

          <Button
            size="sm"
            className="shrink-0"
            onClick={() => generateReceipt.mutate(order.id)}
            disabled={generateReceipt.isPending || isShippingMissing}
          >
            {generateReceipt.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isPending ? "Generate & confirm order" : "Generate receipt"}
          </Button>
        </div>
      </Card>
    );
  }

  // ---- Receipt exists ----
  return (
    <Card
      icon={<Receipt className="h-4 w-4" />}
      title="Receipt"
      action={
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            isStale
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
          )}
        >
          {isStale ? "Needs update" : "Up to date"}
        </span>
      }
    >
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div>
              <FieldLabel>Receipt number</FieldLabel>
              <p className="mt-0.5 break-all font-mono text-sm font-semibold">
                {receipt.receiptNumber}
              </p>
            </div>

            <div>
              <FieldLabel>Generated</FieldLabel>
              <p className="mt-0.5 text-sm">
                {formatDateTime(receipt.generatedAt)}
              </p>
            </div>
          </div>

          {receipt.qrCodeUrl && (
            <div className="shrink-0 text-center">
              <div className="h-24 w-24 rounded-lg border bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receipt.qrCodeUrl}
                  alt="Receipt verification QR code"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <QrCode className="h-3 w-3" />
                Verification QR
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReceipt.mutate(order.id)}
            disabled={downloadReceipt.isPending}
          >
            {downloadReceipt.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download
          </Button>

          <Button
            variant={isStale ? "default" : "outline"}
            size="sm"
            onClick={() => generateReceipt.mutate(order.id)}
            disabled={generateReceipt.isPending}
          >
            {generateReceipt.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {!isStale && isPending ? "Regenerate & confirm" : "Regenerate"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onVerify}
            disabled={verifyReceipt.isFetching}
          >
            {verifyReceipt.isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Verify
          </Button>
        </div>

        {verifyRequested && verifyReceipt.isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying receipt...
          </p>
        )}

        {verifyReceipt.data && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Receipt verified
            </p>
            <p className="mt-1 text-xs">
              Order {verifyReceipt.data.order.orderNumber}
              {" · "}
              {formatBDT(verifyReceipt.data.order.total)}
              {" · "}
              {verifyReceipt.data.order.status}
            </p>
          </div>
        )}

        {verifyReceipt.isError && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Receipt verification failed. Please try again.
          </p>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// RIGHT: CUSTOMER / ADDRESS
// ============================================================

function CustomerCard({ order }: { order: Order }) {
  const user = order.user;
  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";

  return (
    <Card icon={<User className="h-4 w-4" />} title="Customer">
      <div className="space-y-4 p-4">
        <p
          className={cn(
            "break-words text-sm",
            fullName ? "font-semibold" : "text-muted-foreground"
          )}
        >
          {fullName || "No name on account"}
        </p>

        <IconRow
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={user?.email}
        />
        <IconRow
          icon={<Phone className="h-4 w-4" />}
          label="Phone"
          value={user?.phone}
        />
      </div>
    </Card>
  );
}

function AddressCard({ order }: { order: Order }) {
  const address = order.address;

  const areaLine = [address?.area, address?.district, address?.division]
    .filter(Boolean)
    .join(", ");
  const countryLine = [address?.postalCode, address?.country]
    .filter(Boolean)
    .join(", ");
  const hasAddress = !!(address?.addressLine || areaLine || countryLine);

  return (
    <Card icon={<MapPin className="h-4 w-4" />} title="Shipping address">
      <div className="space-y-4 p-4">
        <p className="break-words text-sm font-semibold">
          {address?.name || "—"}
        </p>

        <IconRow
          icon={<Phone className="h-4 w-4" />}
          label="Phone"
          value={address?.phone}
        />

        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 shrink-0 text-muted-foreground">
            <MapPin className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <FieldLabel>Address</FieldLabel>

            {hasAddress ? (
              <div className="mt-0.5 space-y-0.5 break-words text-sm">
                {address?.addressLine && <p>{address.addressLine}</p>}
                {areaLine && <p>{areaLine}</p>}
                {countryLine && <p>{countryLine}</p>}
              </div>
            ) : (
              <p className="mt-0.5 text-sm text-muted-foreground">
                No address provided
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function NotesCard({ order }: { order: Order }) {
  const notes = order.notes?.trim();

  return (
    <Card icon={<StickyNote className="h-4 w-4" />} title="Order notes">
      <p
        className={cn(
          "whitespace-pre-line break-words p-4 text-sm",
          !notes && "text-muted-foreground"
        )}
      >
        {notes || "No notes added."}
      </p>
    </Card>
  );
}

// ============================================================
// RIGHT: OTHER ACTIONS (destructive, with inline confirmation)
// ============================================================

function OtherActions({
  order,
  cancelOrder,
  returnOrder,
}: {
  order: Order;
  cancelOrder: ReturnType<typeof useCancelOrder>;
  returnOrder: ReturnType<typeof useReturnOrder>;
}) {
  const [confirming, setConfirming] = useState<"cancel" | "return" | null>(null);

  const isBusy = cancelOrder.isPending || returnOrder.isPending;

  const run = async () => {
    try {
      if (confirming === "cancel") await cancelOrder.mutateAsync(order.id);
      if (confirming === "return") await returnOrder.mutateAsync(order.id);
      setConfirming(null);
    } catch {
      // Mutation handles error toast.
    }
  };

  return (
    <Card icon={<XCircle className="h-4 w-4" />} title="Other actions">
      <div className="p-4">
        {confirming ? (
          <div className="space-y-3">
            <p className="text-sm">
              {confirming === "cancel"
                ? "Cancel this order? This changes its status to Cancelled."
                : "Mark this order as returned?"}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={confirming === "cancel" ? "destructive" : "default"}
                onClick={run}
                disabled={isBusy}
              >
                {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {confirming === "cancel" ? "Yes, cancel order" : "Yes, request return"}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirming(null)}
                disabled={isBusy}
              >
                Keep order
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setConfirming("return")}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Request return
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirming("cancel")}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel order
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}