# @xph/money-money

Inofficial typescript client for [MoneyMoney](https://moneymoney.app/).

### Installation

```bash
deno install jsr:@xph/money-money
```

## Usage

```ts
import { getAccounts, getCategories, getTransactions } from "@xph/money-money";

const accounts = await getAccounts();
const transactions = await getTransactions(
  accounts[0].uuid,
  new Date("2025-01-01"),
);
const categories = await getCategories();
```
