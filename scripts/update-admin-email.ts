import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const NEW_EMAIL = "julius@merchously.com";
const OLD_EMAIL = "admin@simvado.com";

async function main() {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) {
    console.error("CLERK_SECRET_KEY not set");
    process.exit(1);
  }

  // 1. Find the Clerk user by old email
  const searchRes = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(OLD_EMAIL)}`,
    { headers: { Authorization: `Bearer ${key}` } }
  );
  const users = await searchRes.json();

  if (!Array.isArray(users) || users.length === 0) {
    console.error("No Clerk user found with", OLD_EMAIL);
    process.exit(1);
  }

  const clerkUser = users[0];
  console.log(`Found Clerk user: ${clerkUser.id}`);

  // 2. Add new email address
  const addRes = await fetch("https://api.clerk.com/v1/email_addresses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: clerkUser.id,
      email_address: NEW_EMAIL,
      verified: true,
      primary: true,
    }),
  });

  if (!addRes.ok) {
    const err = await addRes.json();
    // Check if it already exists
    if (err.errors?.[0]?.code === "form_identifier_exists") {
      console.log("Email already exists in Clerk, setting as primary...");
      // Find the email ID for the new email
      const userRes = await fetch(
        `https://api.clerk.com/v1/users/${clerkUser.id}`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      const userData = await userRes.json();
      const newEmailObj = userData.email_addresses.find(
        (e: { email_address: string }) => e.email_address === NEW_EMAIL
      );
      if (newEmailObj) {
        // Set as primary
        await fetch(
          `https://api.clerk.com/v1/users/${clerkUser.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              primary_email_address_id: newEmailObj.id,
            }),
          }
        );
      }
    } else {
      console.error("Failed to add email:", JSON.stringify(err, null, 2));
      process.exit(1);
    }
  } else {
    console.log(`Added ${NEW_EMAIL} as primary email`);
  }

  // 3. Remove old email
  const oldEmailObj = clerkUser.email_addresses.find(
    (e: { email_address: string }) => e.email_address === OLD_EMAIL
  );
  if (oldEmailObj) {
    const delRes = await fetch(
      `https://api.clerk.com/v1/email_addresses/${oldEmailObj.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${key}` },
      }
    );
    if (delRes.ok) {
      console.log(`Removed ${OLD_EMAIL} from Clerk`);
    } else {
      console.log("Could not remove old email (may be the only one left)");
    }
  }

  // 4. Update DB user
  const db = new PrismaClient();
  try {
    await db.user.updateMany({
      where: { clerkId: clerkUser.id },
      data: { email: NEW_EMAIL, name: "Julius Joaquin" },
    });
    console.log(`\nDB updated: ${NEW_EMAIL}`);
    console.log("\n========================================");
    console.log("  UPDATED LOGIN CREDENTIALS");
    console.log("========================================");
    console.log(`  Email:    ${NEW_EMAIL}`);
    console.log("  Password: Simvado2024!");
    console.log("========================================\n");
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
