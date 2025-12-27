import { render } from "preact";
import { App } from "./App.tsx";
import type { Client } from "@xph/budgetbudget-server/client";

export function mount(trpc: Client) {
  render(<App trpc={trpc} />, document.getElementById("app")!);
}
