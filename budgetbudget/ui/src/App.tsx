import { useState } from "preact/hooks";
import type { Client } from "@xph/budgetbudget-server/client";

// deno-lint-ignore no-explicit-any
type Result<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

// deno-lint-ignore no-explicit-any
type State<T extends (...args: any) => any> =
  | {
    type: "success";
    data: Result<T>;
  }
  | {
    type: "error";
    error: string;
  }
  | {
    type: "init";
  };

export function App({ trpc }: { trpc: Client }) {
  const [result, setResult] = useState<State<Client["ping"]["ping"]["query"]>>({
    type: "init",
  });
  const [text, setText] = useState<string>("");

  const handlePing = async () => {
    try {
      setResult({
        type: "success",
        data: await trpc.ping.ping.query(),
      });
    } catch (err) {
      setResult({
        type: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <div class="container">
      <h1>BudgetBudget {process.env.NODE_ENV}</h1>
      <p class="subtitle">Production Spike - Hello World IPC</p>

      <div style="display: block;">
        <input
          style="display: block; width: 100%; padding: 10px; margin-bottom: 20px; font-size: 16px;"
          type="text"
          placeholder="Write to Server"
          value={text}
          onInput={async (e) => {
            setText(await trpc.write.mutate(e.currentTarget.value));
          }}
        />
      </div>

      <button type="button" onClick={handlePing} class="ping-button">
        {"Ping Server"}
      </button>

      {result.type === "success" && (
        <div class="result success">
          <h3>Response from Server:</h3>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
          <p class="timestamp">Timestamp: {result.data.toLocaleString()}</p>
        </div>
      )}

      {result.type === "error" && (
        <div class="result error">
          <h3>Error:</h3>
          <p>{result.error}</p>
        </div>
      )}

      <footer>
        <p>WebView → Swift → Deno → Swift → WebView</p>
      </footer>
    </div>
  );
}
