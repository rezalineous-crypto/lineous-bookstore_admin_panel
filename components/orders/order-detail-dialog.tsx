"use client";

import { useState } from "react";
import { CustomModal } from "@/components/ui/custom-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { OrderStatusBadge, PaymentStatusBadge } from "./order-badges";
import { SetShippingDialog } from "./set-shipping-dialog";
import {
  useOrder,
  useUpdateOrderStatus,
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
  ExternalLink,
  CheckCircle2,
  Loader2,
  User,
  MapPin,
  CreditCard,
  Truck,
  AlertTriangle,
} from "lucide-react";

interface OrderDetailDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({ orderId, open, onOpenChange }: OrderDetailDialogProps) {
  const { data: order, isLoading, error } = useOrder(orderId ?? "");
  const updateStatus = useUpdateOrderStatus();
  const { data: receipt } = useReceiptDetails(orderId ?? "");
  const generateReceipt = useGenerateReceipt();
  const downloadReceipt = useDownloadReceipt();
  const [verifyRequested, setVerifyRequested] = useState(false);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const verifyReceipt = useVerifyReceipt(receipt?.receiptNumber ?? "", verifyRequested);

  const nextStatuses = order ? getNextOrderStatuses(order.status) : [];

  const handleStatusChange = async (status: OrderStatus) => {
    if (!orderId) return;
    await updateStatus.mutateAsync({ id: orderId, data: { status } });
  };

  const isShippingStale = order && receipt?.order
    ? parseFloat(receipt.order.shipping) !== parseFloat(order.shipping ?? "0")
    : false;

  const isShippingMissing = order ? parseFloat(order.shipping ?? "0") === 0 : true;

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title={order?.orderNumber ?? "Order details"}
      description={order ? `Placed ${formatDateTime(order.createdAt)}` : undefined}
      className="sm:max-w-3xl"
    >
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !isLoading && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load order"}
          </p>
        </div>
      )}

      {order && !isLoading && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
          </div>

            {/* Amount summary */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/60 bg-muted/30 p-4 sm:grid-cols-4">
              <Summary label="Subtotal" value={formatBDT(order.subtotal)} />
              <Summary label="Discount" value={formatBDT(order.discount)} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Shipping</p>
                  {/* {isShippingMissing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2 text-xs text-amber-600 hover:text-amber-700"
                      onClick={() => setShippingDialogOpen(true)}
                    >
                      <Truck className="mr-1 h-3 w-3" />
                      Set
                    </Button>
                  )} */}
                </div>
                <p className={cn("mt-1 font-medium", isShippingMissing && "text-amber-600")}>
                  {formatBDT(order.shipping)}
                </p>
              </div>
              <Summary label="Total" value={formatBDT(order.total)} emphasize />
            </div>

            {/* Status update */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 p-4">
              <span className="text-sm font-medium text-muted-foreground">Update status:</span>
              {nextStatuses.length > 0 ? (
                <SearchableDropdown
                  items={nextStatuses.map((s) => ({ id: s, label: OrderStatusLabels[s] }))}
                  value=""
                  placeholder="Select next status"
                  onChange={(item) => {
                    if (item) handleStatusChange(item.id as OrderStatus);
                  }}
                  buttonClassName="h-9 w-[180px]"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  No further transitions available
                </span>
              )}
              {updateStatus.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShippingDialogOpen(true)}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Set Delivery Charge
                </Button>
              </div>
            </div>

            <Tabs defaultValue="items" className="w-full">
              <TabsList variant="line" className="w-full justify-start">
                <TabsTrigger value="items">Items</TabsTrigger>
                {/* <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger> */}
                <TabsTrigger value="receipt">Receipt</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="mt-4">
                <OrderItemsTable order={order} />
              </TabsContent>

              {/* <TabsContent value="payments" className="mt-4">
                <PaymentsList order={order} />
              </TabsContent> */}
{/* 
              <TabsContent value="customer" className="mt-4">
                <CustomerAddress order={order} />
              </TabsContent> */}

              <TabsContent value="receipt" className="mt-4">
                <ReceiptSection
                  orderId={order.id}
                  order={order}
                  receipt={receipt}
                  generateReceipt={generateReceipt}
                  downloadReceipt={downloadReceipt}
                  verifyReceipt={verifyReceipt}
                  verifyRequested={verifyRequested}
                  onVerify={() => setVerifyRequested(true)}
                  isShippingStale={isShippingStale}
                  onRegenerateAfterShipping={() => generateReceipt.mutate(order.id)}
                  onSetShipping={() => setShippingDialogOpen(true)}
                />
              </TabsContent>
            </Tabs>

            <SetShippingDialog
              order={order}
              open={shippingDialogOpen}
              onOpenChange={setShippingDialogOpen}
            />
          </div>
        )}
    </CustomModal>
  );
}

function Summary({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-medium", emphasize && "text-lg font-semibold text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function OrderItemsTable({ order }: { order: Order }) {
  const items = order.orderItems ?? [];
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No items</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <table className="w-full text-sm">
       <thead className="bg-gray-100 font-bold">
          <tr className="border-b border-border/60 bg-muted/30 text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">Book</th>
            <th className="px-4 py-3 font-medium">Paper</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 text-center font-medium">Qty</th>
            <th className="px-4 py-3 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-medium">{item.bookTitle}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {item.paperName ?? item.paper?.name ?? "-"}
              </td>
              <td className="px-4 py-3">
                {item.category ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                    {item.category.name}
                  </span>
                ) : item.categoryId ? (
                  <span className="text-xs text-muted-foreground">Category ID: {item.categoryId.slice(0, 8)}...</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatBDT(item.paperPrice)}</td>
              <td className="px-4 py-3 text-center">{item.quantity}</td>
              <td className="px-4 py-3 text-right font-medium">{formatBDT(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsList({ order }: { order: Order }) {
  const payments = order.payments ?? [];
  if (payments.length === 0)
    return <p className="text-sm text-muted-foreground">No payments recorded</p>;

  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <div key={p.id} className="rounded-xl border border-border/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{p.gateway}</span>
            </div>
            <PaymentStatusBadge status={p.status} />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount</p>
              <p className="font-medium text-foreground">
                {formatBDT(p.amount)} {p.currency}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Transaction</p>
              <p className="font-medium text-foreground">{p.transactionId ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Paid at</p>
              <p className="font-medium text-foreground">{formatDateTime(p.paidAt)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomerAddress({ order }: { order: Order }) {
  const user = order.user;
  const address = order.address;
  const customerName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"
    : "—";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border/60 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">Customer</span>
        </div>
        <div className="mt-2 space-y-1 text-sm">
          <p className="font-medium text-foreground">{customerName}</p>
          <p className="text-muted-foreground">{user?.email ?? "-"}</p>
          <p className="text-muted-foreground">{user?.phone ?? "-"}</p>
        </div>
      </div>
      <div className="rounded-xl border border-border/60 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">Shipping Address</span>
        </div>
        <div className="mt-2 space-y-1 text-sm">
          <p className="font-medium text-foreground">{address?.name ?? "-"}</p>
          <p className="text-muted-foreground">{address?.phone ?? "-"}</p>
          <p className="text-muted-foreground">{address?.addressLine ?? "-"}</p>
          <p className="text-muted-foreground">{address?.district ?? "-"}</p>
        </div>
      </div>
    </div>
  );
}

function ReceiptSection({
  orderId,
  order,
  receipt,
  generateReceipt,
  downloadReceipt,
  verifyReceipt,
  verifyRequested,
  onVerify,
  isShippingStale,
  onRegenerateAfterShipping,
  onSetShipping,
}: {
  orderId: string;
  order: Order;
  receipt?: ReceiptDetails;
  generateReceipt: ReturnType<typeof useGenerateReceipt>;
  downloadReceipt: ReturnType<typeof useDownloadReceipt>;
  verifyReceipt: ReturnType<typeof useVerifyReceipt>;
  verifyRequested: boolean;
  onVerify: () => void;
  isShippingStale: boolean;
  onRegenerateAfterShipping: () => void;
  onSetShipping: () => void;
}) {
  const isShippingMissing = order ? parseFloat(order.shipping ?? "0") === 0 : true;
  const isPending = order.status === "PENDING";

  if (!receipt) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 p-8 text-center">
        <FileText className="h-8 w-8 text-muted-foreground" />
        {isShippingMissing ? (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Set the delivery charge before generating the receipt.
            </div>
            <Button variant="outline" onClick={onSetShipping} disabled={generateReceipt.isPending}>
              {generateReceipt.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Truck className="mr-2 h-4 w-4" />
              )}
              Set Delivery Charge First
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              No receipt has been generated for this order yet.
            </p>
            <Button onClick={() => generateReceipt.mutate(orderId)} disabled={generateReceipt.isPending}>
              {generateReceipt.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isPending ? "Generate Receipt & Confirm Order" : "Generate Receipt"}
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isShippingStale && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          The delivery charge has been updated since this receipt was generated. Please regenerate to include the latest amount.
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Receipt Number</p>
          <p className="font-mono font-medium">{receipt.receiptNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Generated {formatDateTime(receipt.generatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReceipt.mutate(orderId)}
            disabled={downloadReceipt.isPending}
          >
            {downloadReceipt.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download
          </Button>
          <Button
            variant={isShippingStale ? "default" : "outline"}
            size="sm"
            onClick={() => generateReceipt.mutate(orderId)}
            disabled={generateReceipt.isPending}
          >
            {generateReceipt.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isShippingStale ? "Regenerate (Updated)" : isPending ? "Regenerate & Confirm" : "Regenerate"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={receipt.pdfUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View PDF
            </a>
          </Button>
        </div>
      </div>

      {receipt.qrCodeUrl && (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={receipt.qrCodeUrl}
            alt="Receipt QR code"
            className="h-20 w-20 rounded-md border border-border/60"
          />
          <div>
            <p className="flex items-center gap-1 text-sm font-medium">
              <QrCode className="h-4 w-4" /> Verification QR Code
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Scan to verify this receipt.</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Public Verification</p>
          <Button variant="ghost" size="sm" onClick={onVerify} disabled={verifyReceipt.isFetching}>
            {verifyReceipt.isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Verify
          </Button>
        </div>
        {verifyRequested && verifyReceipt.isLoading && (
          <p className="mt-2 text-sm text-muted-foreground">Verifying…</p>
        )}
        {verifyReceipt.data && (
          <div className="mt-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <p className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Receipt verified
            </p>
            <p className="mt-1">
              Order {verifyReceipt.data.order.orderNumber} · {formatBDT(verifyReceipt.data.order.total)} ·{" "}
              {verifyReceipt.data.order.status}
            </p>
          </div>
        )}
        {verifyReceipt.isError && (
          <p className="mt-2 text-sm text-destructive">Verification failed.</p>
        )}
      </div>
    </div>
  );
}
