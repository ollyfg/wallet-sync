import moment from "moment-timezone";
import { akahuEnv, runtimeEnv } from "../src/env";
import { AkahuClient } from "akahu";

(async () => {
  const Akahu = new AkahuClient({
    appToken: akahuEnv.AKAHU_APP_TOKEN,
  });

  const { items: transactions } = await Akahu.accounts.listTransactions(
    akahuEnv.AKAHU_USER_TOKEN,
    runtimeEnv.WALLET_AKAHU_ID
  );

  // Show this many transactions
  const limit = 10;

  for (const txn of transactions.slice(0, limit)) {
    console.log(
      `${moment
        .tz(txn.date, "Pacific/Auckland")
        .format("YYYY/MM/DD")} ${txn.amount
        .toFixed(2)
        .padEnd(9)} ${txn.type.padEnd(10)} ${txn.description}`
    );
  }
})();
