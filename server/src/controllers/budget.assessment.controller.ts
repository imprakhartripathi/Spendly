import { NotificationType } from "../mongodb/schematics/Notifications";
import User, { IUser } from "../mongodb/schematics/User";
import { 
  sendAutopayReminderEmail, 
  sendLargeTransectionEmail, 
  sendLowBalanceEmail, 
  sendSignificantTransectionEmail,
  sendVeryLargeTransectionEmail 
} from "../services/email.service";

export async function assessTransactionAndNotify(
  name: string,
  email: string,
  amount: number,
  income: number,
  spentOn: string,
  time: string,
  type: NotificationType
): Promise<void> {
  const percentage = (amount / income) * 100;

  if (percentage >= 20) {
    await sendVeryLargeTransectionEmail(name, email, amount, spentOn, time, type);
  } else if (percentage >= 15) {
    await sendLargeTransectionEmail(name, email, amount, spentOn, time, type);
  } else if (percentage >= 10) {
    await sendSignificantTransectionEmail(name, email, amount, spentOn, time, type);
  }
}

// balance check (checking for below 20%)
export async function checkAndNotifyLowBalances(): Promise<void> {
  try {
    const users = await User.find();

    for (const user of users) {
      const totalSpent = user.transections.reduce((acc, t) => acc + t.amount, 0);
      const remainingBudget = user.monthlyBudget - totalSpent;

      if (remainingBudget <= user.monthlyBudget * 0.2) {
        await sendLowBalanceEmail(
          user.fullName,
          user.email,
          new Date().toISOString(),
          NotificationType.Budget
        );
      }
    }
  } catch (error) {
    console.error("Error while checking low balances:", error);
  }
}


export const checkAndNotifyAutopayTransactions = async (user: IUser): Promise<void> => {
  try {
    const dueAutopays = user.transections.filter(t => t.isAutopay && t.reoccurance < 5);

    for (const tran of dueAutopays) {
      await sendAutopayReminderEmail(
        user.fullName,
        user.email,
        tran.spentOn,
        tran.amount,
        tran.reoccurance,
        new Date().toISOString()
      );
    }
  } catch (error) {
    console.error("Autopay reminder notification failed:", error);
  }
};