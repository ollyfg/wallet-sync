import { runtimeEnv, akahuEnv } from "./env";
import { AkahuClient } from "akahu";
import moment from "moment-timezone";

// Sync the last day of transactions. Expected to run at the end of the day (near midnight)
(async () => {
  const Akahu = new AkahuClient({ appToken: akahuEnv.AKAHU_APP_TOKEN });

  const now = moment.tz("Pacific/Auckland").toISOString();
  const oneDayAgo = moment(now).subtract(1, "day").toISOString();

  // Assume that today's transactions fit into one page (currently 100 transactions)
  const { items: todaysTransactions } = await Akahu.accounts.listTransactions(
    akahuEnv.AKAHU_USER_TOKEN,
    runtimeEnv.WALLET_AKAHU_ID,
    {
      start: oneDayAgo,
      end: now,
    }
  );

  const debits = todaysTransactions.filter((x) => x.amount < 0);
  const credits = todaysTransactions.filter((x) => x.amount > 0);
  console.log(
    `Found ${todaysTransactions.length} transactions today (${debits.length} debits, ${credits.length} credits)`
  );

  for (const debit of debits) {
    console.log(
      `Syncing ${debit._id} '${debit.description}' (${debit.amount})`
    );

    const cleanDescription = debit.description.replaceAll(
      /^[a-zA-Z0-9 \-\_]/g,
      ""
    );

    await Akahu.payments.create(akahuEnv.AKAHU_USER_TOKEN, {
      amount: debit.amount,
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

  console.log("Done for the day.");
})();
