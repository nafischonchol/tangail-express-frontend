import { z } from "zod";

/**
 * Schema for Admin Users validation
 */
export const adminUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim()
    .min(1, "Email is required.")
    .email("Invalid email address format."),
  phone: z.string().trim().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  isEdit: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (!data.isEdit) {
    if (!data.password || data.password.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required for new users.",
      });
    } else if (data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password must be at least 6 characters.",
      });
    }
  } else {
    if (data.password && data.password.trim() !== "" && data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password must be at least 6 characters.",
      });
    }
  }
});

export const vendorUserSchema = adminUserSchema;

