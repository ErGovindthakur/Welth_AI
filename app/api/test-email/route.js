import { checkUser } from "@/lib/checkUser";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";

export async function GET() {
  const user = await checkUser();

  if (!user) {
    return Response.json({ error: "No user logged in" });
  }

  const result = await sendEmail({
    to: user.email, // ✅ REAL EMAIL FROM CLERK
    subject: "Real User Test 🚀",
    react: EmailTemplate({
      userName: user.name,
      type: "budget-alert",
      data: {
        percentageUsed: 95,
        budgetAmount: 1000,
        totalExpenses: 950,
      },
    }),
  });

  console.log("EMAIL RESULT:", result);

  return Response.json(result);
}