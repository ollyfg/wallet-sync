import { akahuEnv } from "../src/env";
import { AkahuClient } from "akahu";

(async () => {
  const Akahu = new AkahuClient({
    appToken: akahuEnv.AKAHU_APP_TOKEN,
  });

  const accounts = await Akahu.accounts.list(akahuEnv.AKAHU_USER_TOKEN);

  for (const account of accounts) {
    console.log(
      `${account._id} - ${account.connection.name.padEnd(15)} ${
        account.name
      } (${account.formatted_account})`
    );
  }
})();
