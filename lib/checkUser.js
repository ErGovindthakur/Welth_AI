// import { currentUser } from "@clerk/nextjs/server";
// import { db } from "./prisma";

// export const checkUser = async () => {
//   const user = await currentUser();

//   if (!user) {
//     return null;
//   }

//   try {
//     const loggedInUser = await db.user.findUnique({
//       where: {
//         clerkUserId: user.id,
//       },
//     });

//     if (loggedInUser) {
//       return loggedInUser;
//     }

//     const name = `${user.firstName} ${user.lastName}`;

//     const newUser = await db.user.create({
//       data: {
//         clerkUserId: user.id,
//         name,
//         imageUrl: user.imageUrl,
//         email: user.emailAddresses[0].emailAddress,
//       },
//     });

//     return newUser;
//   } catch (error) {
//     console.log(error.message);
//   }
// };

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) return null;

  try {
    // 1. Try finding by clerkUserId
    let loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) return loggedInUser;

    const email = user.emailAddresses[0].emailAddress;
    const name = `${user.firstName || ""} ${user.lastName || ""}`;

    // 2. Try finding by email (fallback)
    loggedInUser = await db.user.findUnique({
      where: { email },
    });

    if (loggedInUser) {
      // 🔥 Sync clerkUserId if missing/mismatched
      return await db.user.update({
        where: { email },
        data: { clerkUserId: user.id },
      });
    }

    // 3. Create new user safely
    return await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });
  } catch (error) {
    console.log("CHECK USER ERROR:", error.message);
    throw error;
  }
};