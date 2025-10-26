import { Buffer } from "node:buffer";
import { z } from "zod";

export const IconSchema = z
  .instanceof(Uint8Array)
  .transform(
    (buf) => `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
  );
export type Icon = z.infer<typeof IconSchema>;
