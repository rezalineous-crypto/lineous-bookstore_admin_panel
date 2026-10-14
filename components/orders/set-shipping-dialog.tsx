"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/custom-input";
import { CustomModal } from "@/components/ui/custom-modal";
import { useUpdateOrderShipping } from "@/lib/hooks/use-orders";
import type { Order } from "@/lib/types/book";

interface SetShippingDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetShippingDialog({ order, open, onOpenChange }: SetShippingDialogProps) {
  const [shippingInput, setShippingInput] = useState("");
  const [wasOpen, setWasOpen] = useState(false);
  const updateShipping = useUpdateOrderShipping();

  // Prefill the input with the current delivery charge whenever the dialog opens.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && order) {
      setShippingInput(order.shipping ?? "0");
    }
  }

  const handleSetShipping = async () => {
    if (!order) return;
    const value = parseFloat(shippingInput);
    if (isNaN(value) || value < 0) {
      alert("Please enter a valid non-negative number.");
      return;
    }
    await updateShipping.mutateAsync({ id: order.id, shipping: value });
    onOpenChange(false);
  };

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title="Set Delivery Charge"
      description={`Enter the delivery charge for order ${order?.orderNumber}. This will be added to the order total and included in the receipt.`}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSetShipping} disabled={updateShipping.isPending}>
            {updateShipping.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Delivery Charge
          </Button>
        </>
      }
    >
      <div className="max-w-xs pt-6">
        <CustomInput
          id="shipping"
          label="Delivery Charge (BDT)"
          type="number"
          min="0"
          step="0.01"
          value={shippingInput}
          onChange={(e) => setShippingInput(e.target.value)}
          placeholder="0.00"
        />
      </div>
    </CustomModal>
  );
}
