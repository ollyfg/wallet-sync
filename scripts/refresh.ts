import moment from "moment-timezone";
import { akahuEnv, runtimeEnv } from "../src/env";
import { AkahuClient } from "akahu";

(async () => {
  const Akahu = new AkahuClient({
    appToken: akahuEnv.AKAHU_APP_TOKEN,
  });

  await Akahu.accounts.refresh(
    akahuEnv.AKAHU_USER_TOKEN,
    runtimeEnv.WALLET_AKAHU_ID,
  );
  console.log("Refresh initiated.");
})();
