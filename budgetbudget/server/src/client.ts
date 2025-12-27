/**
 * tRPC client for BudgetBudget
 */

import {
  createTRPCProxyClient,
  type Operation,
  TRPCClientError,
} from "@trpc/client";
import type { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { deserialize, stringify, type SuperJSONResult } from "superjson";
import type { AppRouter } from "./router.ts";
import {
  ipcResponseSchema,
  type IpcResult,
  objectWithIdSchema,
} from "./types.ts";
import { prettifyError } from "zod";

export { type SuperJSONResult, TRPCClientError };
export interface UserMessageHandler {
  postMessage: (data: unknown) => unknown;
}

export type PendingRequest = PromiseWithResolvers<IpcResult>;
export type PendingRequests = Map<number, PendingRequest>;

export function createClient(
  pendingRequests: PendingRequests,
  messageHandler: UserMessageHandler,
) {
  const transport = webviewTransport(pendingRequests, messageHandler);
  const link = createTransportLink(transport);

  return createTRPCProxyClient<AppRouter>({
    links: [link],
  });
}

export function createIpcResponseHandler(
  pendingRequests: Map<number, PendingRequest>,
) {
  return (rawSuperJSONResponse: SuperJSONResult) => {
    try {
      const rawResponse = deserialize(rawSuperJSONResponse);
      const { id } = objectWithIdSchema.parse(rawResponse);
      const pending = pendingRequests.get(id);

      if (!pending) {
        // deno-lint-ignore no-console
        console.warn("Received response for unknown request:", id);
        return;
      }

      pendingRequests.delete(id);
      const response = ipcResponseSchema.safeParse(rawResponse);

      if (!response.success) {
        pending.reject(
          new Error(
            "Invalid response format: " + prettifyError(response.error),
          ),
        );
        return;
      }

      if (response.data.ok) {
        pending.resolve({ ok: true, data: response.data.data });
      } else {
        pending.resolve({ ok: false, error: response.data.error });
      }
    } catch (error) {
      // deno-lint-ignore no-console
      console.error("Error parsing response:", error);
    }
  };
}

export type Client = ReturnType<typeof createClient>;

function createTransportLink(
  transport: ReturnType<typeof webviewTransport>,
): TRPCLink<AppRouter> {
  return () => {
    return ({ op }) => {
      return observable((observer) => {
        transport
          .request(op)
          .then((response) => {
            if (response.ok) {
              observer.next({ result: { data: response.data } });
              observer.complete();
            } else {
              observer.error(
                TRPCClientError.from(response.error, {
                  meta: op.context,
                }),
              );
            }
          })
          .catch((error) => {
            observer.error(
              TRPCClientError.from(error, {
                meta: op.context,
              }),
            );
          });
      });
    };
  };
}

function webviewTransport(
  pendingRequests: PendingRequests,
  messageHandler: UserMessageHandler,
) {
  return {
    request(op: Operation) {
      const id = generateId();
      const d = Promise.withResolvers<IpcResult>();
      const TIMEOUT_MS = 30000;

      pendingRequests.set(id, d);

      const i = setTimeout(() => {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          d.reject(new Error(`Request ${id} timed out after ${TIMEOUT_MS}ms`));
        }
      }, TIMEOUT_MS);

      d.promise.finally(() => clearTimeout(i));

      messageHandler.postMessage(
        stringify({
          ...op,
          id,
        }),
      );

      return d.promise;
    },
  };
}

let i = 0;
function generateId() {
  if (i >= Number.MAX_SAFE_INTEGER) {
    i = 0;
  }
  return i++;
}
