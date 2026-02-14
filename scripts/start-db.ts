import EmbeddedPostgres from "embedded-postgres";

const pg = new EmbeddedPostgres({
  databaseDir: "./data/pg",
  user: "simvado_user",
  password: "localdev",
  port: 5432,
  persistent: true,
});

async function main() {
  console.log("Starting embedded PostgreSQL...");
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("simvado");
  console.log("PostgreSQL running on port 5432");
  console.log("DATABASE_URL=postgresql://simvado_user:localdev@localhost:5432/simvado");
  console.log("\nPress Ctrl+C to stop.\n");
}

main().catch((e) => {
  console.error("Failed to start:", e.message);
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("\nStopping PostgreSQL...");
  await pg.stop();
  process.exit(0);
});
