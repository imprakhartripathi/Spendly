import { NotificationType } from "../mongodb/schematics/Notifications";
import { TransectionType } from "../mongodb/schematics/Transections";
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
  spentOn: string,
  time: string,
  nType: NotificationType,
  tType: TransectionType
): Promise<void> {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User not found for email: ${email}`);
      return;
    }

    // If no monthly budget set, skip
    if (!user.monthlyBudget || user.monthlyBudget <= 0) {
      console.log(`Skipping transaction check for ${email} - no budget set`);
      return;
    }

    // Skip if this is a Credit transaction
    if (tType === TransectionType.Credit) {
      console.log(`Skipping transaction check for ${email} - Credit Transaction`);
      return;
    }

    // Only count debit transactions for total spent
    const totalSpent = user.transections
      .filter(t => t.transectionType === TransectionType.Debit)
      .reduce((acc, t) => acc + t.amount, 0);

    const remainingBudget = user.monthlyBudget - totalSpent;

    if (remainingBudget <= 0) {
      console.log(`Skipping transaction check for ${email} - budget already exceeded`);
      return;
    }

    const percentage = (amount / remainingBudget) * 100;

    if (percentage >= 20) {
      await sendVeryLargeTransectionEmail(name, email, amount, spentOn, time, nType);
    } else if (percentage >= 15) {
      await sendLargeTransectionEmail(name, email, amount, spentOn, time, nType);
    } else if (percentage >= 10) {
      await sendSignificantTransectionEmail(name, email, amount, spentOn, time, nType);
    }
  } catch (error) {
    console.error("Error assessing transaction:", error);
  }
}

// balance check (checking for below 20%)
export async function checkAndNotifyLowBalances(): Promise<void> {
  try {
    const users = await User.find();

    for (const user of users) {
      if (!user.monthlyBudget || user.monthlyBudget <= 0) {
        continue; // Skip users without a budget
      }

      // Only count debit transactions for total spent
      const totalSpent = user.transections
        .filter(t => t.transectionType === TransectionType.Debit)
        .reduce((acc, t) => acc + t.amount, 0);

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
