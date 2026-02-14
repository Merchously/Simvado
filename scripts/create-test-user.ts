import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Create a test user in Clerk + DB for local development
async function main() {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) {
    console.error("CLERK_SECRET_KEY not found in environment");
    process.exit(1);
  }

  const email = "admin@simvado.com";
  const password = "Simvado2024!";
  const firstName = "Julius";
  const lastName = "Admin";

  // Create user in Clerk
  console.log("Creating Clerk user...");
  const res = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [email],
      password,
      first_name: firstName,
      last_name: lastName,
      skip_password_checks: true,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    // If user already exists, find them
    if (err.errors?.[0]?.code === "form_identifier_exists") {
      console.log("Clerk user already exists, finding...");
      const searchRes = await fetch(
        `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${clerkSecretKey}` },
        }
      );
      const users = await searchRes.json();
      if (users.length > 0) {
        const clerkId = users[0].id;
        console.log(`Found Clerk user: ${clerkId}`);
        await syncToDb(clerkId, email, `${firstName} ${lastName}`);
        return;
      }
    }
    console.error("Failed to create Clerk user:", JSON.stringify(err, null, 2));
    process.exit(1);
  }

  const clerkUser = await res.json();
  console.log(`Created Clerk user: ${clerkUser.id}`);

  await syncToDb(clerkUser.id, email, `${firstName} ${lastName}`);
}

async function syncToDb(clerkId: string, email: string, name: string) {
  const db = new PrismaClient();
  try {
    // Create or update DB user
    const user = await db.user.upsert({
      where: { clerkId },
      update: {
        role: "platform_admin",
        subscriptionTier: "pro_annual",
      },
      create: {
        clerkId,
        email,
        name,
        role: "platform_admin",
        subscriptionTier: "pro_annual",
      },
    });

    // Link to Simvado studio if exists
    const studio = await db.studio.findUnique({ where: { slug: "simvado" } });
    if (studio) {
      await db.studioMember.upsert({
        where: {
          studioId_userId: { studioId: studio.id, userId: user.id },
        },
        update: {},
        create: {
          studioId: studio.id,
          userId: user.id,
          role: "admin",
        },
      });
      console.log("Linked to Simvado studio as admin");
    }

    console.log(`\nDB user ready: ${user.email} (${user.role}, ${user.subscriptionTier})`);
    console.log("\n========================================");
    console.log("  LOGIN CREDENTIALS");
    console.log("========================================");
    console.log(`  Email:    ${email}`);
    console.log(`  Password: Simvado2024!`);
    console.log("========================================\n");
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
