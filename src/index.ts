import { runtimeEnv, akahuEnv } from "./env";
import { AkahuClient } from "akahu";
import moment from "moment-timezone";

// Sync the last day of transactions. Expected to run at the end of the day (near midnight)
(async () => {
  const Akahu = new AkahuClient({ appToken: akahuEnv.AKAHU_APP_TOKEN });

  const now = moment.tz("Pacific/Auckland").toISOString();
  const oneDayAgo = moment(now).subtract(1, "day").toISOString();

  // Assume that today's transactions fit into one page (currently 100 transactions)
  const [{ items: settledTransactions }, pendingTransactions] =
    await Promise.all([
      Akahu.accounts.listTransactions(
        akahuEnv.AKAHU_USER_TOKEN,
        runtimeEnv.WALLET_AKAHU_ID,
        {
          start: oneDayAgo,
          end: now,
        },
      ),
      Akahu.accounts.listPendingTransactions(
        akahuEnv.AKAHU_USER_TOKEN,
        runtimeEnv.WALLET_AKAHU_ID,
      ),
    ]);

  const todaysTransactions = [
    ...settledTransactions,
    ...pendingTransactions.filter(
      (txn) => txn.date > oneDayAgo && txn.date <= now,
    ),
  ];

  const debits = todaysTransactions.filter((x) => x.amount < 0);
  const toRefund = debits.filter((x) => !["TRANSFER"].includes(x.type));
  const credits = todaysTransactions.filter((x) => x.amount > 0);
  console.log(
    `Found ${todaysTransactions.length} transactions today (${debits.length} debits, ${credits.length} credits), ${pendingTransactions.length} pending. ${toRefund.length} should be refunded.`,
  );

  for (const debit of toRefund) {
    console.log(
      `Syncing ${"_id" in debit ? debit._id : "Pending"} '${debit.description}' (${debit.amount})`,
    );

    const cleanDescription = debit.description.replaceAll(
      /[^a-zA-Z0-9 \-\_]/g,
      "",
    );

    if (runtimeEnv.DRY_RUN) {
      console.log("Skipping because this is a dry run");
    } else {
      await Akahu.payments.create(akahuEnv.AKAHU_USER_TOKEN, {
        amount: Math.abs(debit.amount),
        from: runtimeEnv.BANK_AKAHU_ID,
        to: {
          name: runtimeEnv.WALLET_ACCOUNT_NAME,
          account_number: runtimeEnv.WALLET_ACCOUNT_NUMBER,
        },
        meta: {
          source: {
            code: cleanDescription.slice(0, 12).trim() || "Unknown",
            reference: cleanDescription.slice(12).trim() || "Repayment",
          },
          destination: {
            particulars: "Repayment",
          },
        },
      });
    }
  }

  console.log("Done for the day.");
})();
