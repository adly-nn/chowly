import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().min(1),
  lines: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Cart is empty"),
});

export const assignStaffSchema = z.object({
  orderId: z.string().min(1),
  waiterId: z.string().min(1),
  chefId: z.string().min(1),
  bartenderId: z.string().min(1),
});

export const markServedSchema = z.object({
  orderId: z.string().min(1),
});

export const submitComplaintSchema = z.object({
  orderId: z.string().min(1),
  customerId: z.string().min(1),
  description: z.string().trim().min(1, "Complaint cannot be empty").max(1000),
});

export const resolveComplaintSchema = z.object({
  complaintId: z.string().min(1),
});

export const submitRatingSchema = z.object({
  orderId: z.string().min(1),
  customerId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export const recordPaymentSchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(["Card", "Transfer", "Cash"]),
});

export const simulateDelaySchema = z.object({
  orderId: z.string().min(1),
});
