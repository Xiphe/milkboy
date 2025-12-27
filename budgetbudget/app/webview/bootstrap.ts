// deno-lint-ignore-file no-window
import {
  createClient,
  createIpcResponseHandler,
  type UserMessageHandler,
  type PendingRequest,
  type SuperJSONResult,
} from "@xph/budgetbudget-server/client";
import { mount } from "@xph/budgetbudget-ui";

declare global {
  interface Window {
    __bb_resolveIpc?: (response: SuperJSONResult) => void;
    webkit?: {
      messageHandlers?: {
        bbIpc?: UserMessageHandler;
      };
    };
  }
}

if (typeof window.webkit?.messageHandlers?.bbIpc === "undefined") {
  throw new Error("Swift IPC bridge not available.");
}

const pendingRequests = new Map<number, PendingRequest>();

window.__bb_resolveIpc = createIpcResponseHandler(pendingRequests);

mount(createClient(pendingRequests, window.webkit.messageHandlers.bbIpc));
