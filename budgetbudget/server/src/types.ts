/**
 * IPC message types for communication between WebView ⇄ Swift ⇄ Deno
 * Uses newline-delimited JSON (JSONL) with SuperJSON encoding for values.
 */

import {
  enum as zEnum,
  type infer as Infer,
  instanceof as zInstanceOf,
  literal,
  number,
  object,
  string,
  union,
  unknown,
  type ZodType,
} from "zod";
import type { Operation } from "@trpc/client";

export const objectWithIdSchema = object({
  id: number(),
});

/**
 * Zod schema for validating IPC requests
 */
export const operationSchema: ZodType<Operation> = object({
  type: zEnum(["query", "mutation", "subscription"]),
  path: string(),
  input: unknown(),
  context: object({}),
  id: number(),
  signal: zInstanceOf(AbortSignal).nullable().default(null),
});

export const ipcResponseOkSchema = objectWithIdSchema.extend({
  ok: literal(true),
  data: unknown(),
});

export const ipcResponseErrorSchema = objectWithIdSchema.extend({
  ok: literal(false),
  error: zInstanceOf(Error),
});

export const ipcResponseSchema = union([
  ipcResponseOkSchema,
  ipcResponseErrorSchema,
]);

export type IpcResponseOk = Infer<typeof ipcResponseOkSchema>;
export type IpcResponseError = Infer<typeof ipcResponseErrorSchema>;
export type IpcResponse = IpcResponseOk | IpcResponseError;

export type IpcResultOk = Omit<IpcResponseOk, "id">;
export type IpcResultError = Omit<IpcResponseError, "id">;
export type IpcResult = IpcResultOk | IpcResultError;
