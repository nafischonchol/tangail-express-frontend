import { z } from "zod";

/**
 * Schema for Products validation (Add/Edit)
 */
export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  shortDescription: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  unit: z.string().optional(),
  mainImage: z.any().refine((val) => val !== null && val !== undefined, "Thumbnail image is required"),
  hasVariants: z.boolean(),
  colorImagesEnabled: z.boolean().optional(),
  colorImages: z.record(z.string(), z.any().nullable()).optional(),
  selectedColors: z.array(z.string()).optional(),
  generatedVariants: z.array(z.any()).optional(),
}).superRefine((data, ctx) => {
  if (data.generatedVariants && data.generatedVariants.length > 0) {
    data.generatedVariants.forEach((v: any, index: number) => {
      // Skip validation if variant is inactive
      if (v.is_active === false) {
        return;
      }

      if (!v.sku || v.sku.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`variants.${index}.sku`],
          message: "SKU is required",
        });
      }

      const vPriceStr = String(v.price ?? "").trim();
      const vPrice = Number(vPriceStr);
      if (vPriceStr === "" || isNaN(vPrice) || vPrice < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`variants.${index}.price`],
          message: "Valid price number is required",
        });
      }

      const vPurchasePriceStr = String(v.purchasePrice ?? "").trim();
      const vPurchasePrice = Number(vPurchasePriceStr);
      if (vPurchasePriceStr === "" || isNaN(vPurchasePrice) || vPurchasePrice < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`variants.${index}.purchase_price`],
          message: "Valid purchase price number is required",
        });
      }

      const vDiscountStr = String(v.discountPrice ?? "").trim();
      if (vDiscountStr !== "") {
        const discountNum = Number(vDiscountStr);
        if (isNaN(discountNum) || discountNum < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [`variants.${index}.discount_price`],
            message: "Enter a valid discount price (>= 0)",
          });
        } else if (!isNaN(vPrice) && discountNum >= vPrice) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [`variants.${index}.discount_price`],
            message: "Discount price must be less than regular price",
          });
        }
      }
    });
  }

  if (data.hasVariants && data.colorImagesEnabled && data.selectedColors && data.colorImages) {
    data.selectedColors.forEach((color) => {
      const img = data.colorImages?.[color];
      if (!img) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`color_image_${color}`],
          message: `Image is required for color "${color}"`,
        });
      }
    });
  }
});
