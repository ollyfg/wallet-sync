(async () => {
  process.env.DRY_RUN = "true";
  await import("../src/index");
})();
