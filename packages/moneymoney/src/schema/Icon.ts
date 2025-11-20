import { Buffer } from "node:buffer";
import { z } from "zod";

const IconSchemaInternal = z.union([
  z
    .instanceof(Uint8Array)
    .transform(
      (buf): string =>
        `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
    ),
  z.string(),
]);

/**
 * zod schema for a MoneyMoney icon
 *
 * @example
 * ```typescript
 * import { IconSchema } from "@xph/moneymoney/schema";
 *
 * const icon = IconSchema.parse("data:image/png;base64,iVBORw0KGgo=");
 * ```
 */
export const IconSchema: z.ZodType<string> = IconSchemaInternal as z.ZodType<
  string
>;
