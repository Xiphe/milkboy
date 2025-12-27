/**
 * Deno core server - stdio JSONL server loop
 *
 * Reads newline-delimited JSON requests from stdin,
 * calls tRPC procedures, and writes responses to stdout.
 *
 * This file is compiled with `deno compile` and embedded in the macOS app.
 */

import { appRouter } from "./router.ts";
import { z } from "zod";
import superjson from "superjson";
import {
  operationSchema,
  objectWithIdSchema,
  type IpcResponse,
} from "./types.ts";
import type { Operation } from "@trpc/client";

/**
 * Redirect console.log to stderr so it doesn't interfere with JSON responses on stdout
 * This allows debugging output to show up in the Swift app's console
 */
// deno-lint-ignore no-console
console.log = console.error;

main().catch((err) => {
  // deno-lint-ignore no-console
  console.error("Server error:", err);
  Deno.exit(1);
});

/**
 * Main server loop - read from stdin, write to stdout
 */
async function main() {
  const decoder = new TextDecoder();
  const caller = appRouter.createCaller({});

  let buffer = "";

  const reader = Deno.stdin.readable.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        if (line.length === 0) {
          continue;
        }

        try {
          const rawRequest = superjson.parse(line);
          const { id } = objectWithIdSchema.parse(rawRequest);
          const request = operationSchema.safeParse(rawRequest);

          if (!request.success) {
            respond({
              id,
              ok: false,
              error: new Error(
                `Invalid request structure: ${z.prettifyError(request.error)}`,
              ),
            });
            continue;
          }

          respond(processRequest(caller, request.data));
        } catch (parseError) {
          // deno-lint-ignore no-console
          console.error(
            parseError instanceof Error
              ? `Failed to parse request: ${parseError.message}`
              : "Failed to parse request",
          );
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function respond(response: IpcResponse | Promise<IpcResponse>) {
  try {
    const encoder = new TextEncoder();
    return Deno.stdout.write(
      encoder.encode(superjson.stringify(await response) + "\n"),
    );
  } catch (err) {
    // deno-lint-ignore no-console
    console.error("Failed to respond", err);
  }
}

async function processRequest(
  caller: ReturnType<typeof appRouter.createCaller>,
  operation: Operation,
): Promise<IpcResponse> {
  try {
    const procedure = getProcedure(caller, operation.path);
    return {
      id: operation.id,
      ok: true,
      data: await procedure(operation.input),
    };
  } catch (error) {
    return {
      id: operation.id,
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

function getProcedure(
  caller: ReturnType<typeof appRouter.createCaller>,
  path: string,
) {
  const parts = path.split(".");
  let current: unknown = caller;

  for (const part of parts) {
    if (current === null || current === undefined) {
      throw new Error(
        `Invalid procedure path: "${path}" - segment "${part}" is null/undefined`,
      );
    }

    try {
      current = Reflect.get(current as object, part);
    } catch (error) {
      throw new Error(
        `Invalid procedure path: "${path}" - failed to access "${part}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (current === undefined) {
      throw new Error(
        `Procedure "${path}" not found - "${part}" does not exist`,
      );
    }
  }

  if (typeof current !== "function") {
    throw new Error(
      `"${path}" is not a callable procedure (got ${typeof current})`,
    );
  }

  return current;
}
