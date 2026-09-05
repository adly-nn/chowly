export type EffectiveOrderStatus = "PLACED" | "PREPARING" | "DELAYED" | "SERVED" | "PAID";

export function isPastDeadline(orderDateTime: Date, waitTimeMinutes: number): boolean {
  return Date.now() > orderDateTime.getTime() + waitTimeMinutes * 60_000;
}

/**
 * DELAYED is never stored — it is derived from OrderDateTime + OrderWaitTime
 * on every read, per the brief (no background job keeps it in sync).
 */
export function computeEffectiveStatus(order: {
  OrderStatus: string;
  OrderDateTime: Date;
  OrderWaitTime: number;
}): EffectiveOrderStatus {
  if (order.OrderStatus === "SERVED" || order.OrderStatus === "PAID") {
    return order.OrderStatus as EffectiveOrderStatus;
  }
  if (isPastDeadline(order.OrderDateTime, order.OrderWaitTime)) {
    return "DELAYED";
  }
  return order.OrderStatus as EffectiveOrderStatus;
}

export function computeEffectiveItemStatus(
  itemStatus: string,
  orderEffectiveStatus: EffectiveOrderStatus,
): string {
  if (itemStatus === "PENDING" && orderEffectiveStatus === "DELAYED") return "DELAYED";
  return itemStatus;
}
