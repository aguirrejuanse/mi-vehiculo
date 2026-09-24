import {
  deleteUser,
  deleteVehiclesForUsers,
  listUsersByEmailQuery,
  SEEDED_USER_EMAIL,
} from "./helpers";

// Guest-wizard specs sign up a fresh `+clerk_test` user per run — those would
// accumulate in the Clerk dev instance (and their vehicles in the dev DB)
// without cleanup. The seeded dashboard user is kept: it exists so reviewers
// can open the app after a run and inspect a full garage.
export default async function globalTeardown() {
  try {
    const users = await listUsersByEmailQuery("clerk_test");
    const guests = users.filter((user) =>
      user.email_addresses.some(
        (entry) =>
          entry.email_address.includes("+clerk_test") &&
          entry.email_address !== SEEDED_USER_EMAIL,
      ),
    );
    if (guests.length === 0) return;

    await deleteVehiclesForUsers(guests.map((user) => user.id));
    for (const user of guests) {
      await deleteUser(user.id);
    }
  } catch (error) {
    // Teardown must never mask test results — a stray test user is harmless.
    console.warn("e2e teardown cleanup failed:", error);
  }
}
