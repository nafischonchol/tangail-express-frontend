import { z } from "zod";

export const courierCredentialSchema = z.object({
  courier: z.enum(["pathao", "steadfast", "redx", "carrybee"], {
    message: "Please select a valid courier.",
  }),
  user: z.string().trim().optional(),
  password: z.string().optional(),
  phone: z.string().trim().optional(),
  business_id: z.string().trim().optional(),
  status: z.enum(["active", "rate_limited", "inactive"]),
  isEdit: z.boolean().default(false),
}).superRefine((data, ctx) => {
  // Password validation: on creation password is required
  if (!data.isEdit) {
    if (!data.password || data.password.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required.",
      });
    }
  }

  // Courier specific validation
  if (data.courier === "pathao" || data.courier === "steadfast") {
    if (!data.user || data.user.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["user"],
        message: "Username / Email is required.",
      });
    }
  } else if (data.courier === "redx") {
    if (!data.phone || data.phone.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number is required.",
      });
    }
  } else if (data.courier === "carrybee") {
    if (!data.phone || data.phone.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number is required.",
      });
    }
    if (!data.business_id || data.business_id.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["business_id"],
        message: "Business ID is required.",
      });
    }
  }
});
