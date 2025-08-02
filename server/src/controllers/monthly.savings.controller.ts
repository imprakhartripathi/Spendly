import cron from 'node-cron';
import User from '../mongodb/schematics/User';
import { NotificationType } from '../mongodb/schematics/Notifications';

// Function to calculate monthly savings for a user
const calculateMonthlySavings = (user: any, year: number, month: number): number => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of month

  // Get transactions for the specific month
  const monthlyTransactions = user.transections.filter((txn: any) => {
    const txnDate = new Date(txn.onDate);
    return txnDate >= startDate && txnDate <= endDate;
  });

  // Calculate total income for the month (base income + credit transactions)
  const creditTransactions = monthlyTransactions
    .filter((t: any) => t.transectionType === 'credit')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const totalIncome = (user.income || 0) + creditTransactions;

  // Calculate total expenses for the month
  const totalExpenses = monthlyTransactions
    .filter((t: any) => t.transectionType === 'debit')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  // Calculate savings (income - expenses)
  const savings = totalIncome - totalExpenses;

  return Math.max(0, savings); // Only positive savings
};

// Function to process monthly savings for all users
const processMonthlySavings = async (): Promise<void> => {
  try {
    console.log('Processing monthly savings...');
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth();
    const monthName = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Get all users
    const users = await User.find({});
    
    let processedCount = 0;
    let totalSavingsProcessed = 0;

    for (const user of users) {
      try {
        // Calculate savings for the previous month
        const savings = calculateMonthlySavings(user, year, month);
        
        if (savings > 0) {
          // Check if savings transaction already exists for this month
          const existingSavingsTransaction = user.transections.find((txn: any) => {
            const txnDate = new Date(txn.onDate);
            return txn.spentOn === `${monthName} Savings` && 
                   txnDate.getMonth() === now.getMonth() && 
                   txnDate.getFullYear() === now.getFullYear();
          });

          if (!existingSavingsTransaction) {
            // Add savings as a credit transaction
            const savingsTransaction = {
              transectionType: 'credit',
              amount: savings,
              category: 'Savings',
              spentOn: `${monthName} Savings`,
              spentOnDesc: `Automatically calculated savings from ${monthName}`,
              onDate: new Date(), // Current date (start of new month)
              isAutopay: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            user.transections.push(savingsTransaction as any);

            // Add notification
            user.notifications.push({
              title: "Monthly Savings Added",
              desc: `Your savings of ₹${savings.toLocaleString()} from ${monthName} have been added to your account`,
              type: NotificationType.Sys,
              isRead: false,
              createdAt: new Date(),
              updatedAt: new Date()
            } as any);

            await user.save();
            
            processedCount++;
            totalSavingsProcessed += savings;
            
            console.log(`Added ₹${savings} savings for user ${user.email} from ${monthName}`);
          } else {
            console.log(`Savings already processed for user ${user.email} for ${monthName}`);
          }
        } else {
          console.log(`No savings to add for user ${user.email} from ${monthName}`);
        }
      } catch (userError) {
        console.error(`Error processing savings for user ${user.email}:`, userError);
      }
    }

    console.log(`Monthly savings processing completed. Processed ${processedCount} users with total savings of ₹${totalSavingsProcessed}`);
  } catch (error) {
    console.error('Error in processMonthlySavings:', error);
  }
};

// Function to send monthly savings reminders (optional)
const sendMonthlySavingsReminder = async (): Promise<void> => {
  try {
    console.log('Sending monthly savings reminders...');
    
    const users = await User.find({});
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    for (const user of users) {
      try {
        // Add reminder notification
        user.notifications.push({
          title: "Monthly Savings Reminder",
          desc: `Your ${currentMonth} savings will be calculated and added at the end of this month. Keep tracking your expenses!`,
          type: NotificationType.Sys,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);

        await user.save();
      } catch (userError) {
        console.error(`Error sending reminder to user ${user.email}:`, userError);
      }
    }

    console.log('Monthly savings reminders sent successfully');
  } catch (error) {
    console.error('Error in sendMonthlySavingsReminder:', error);
  }
};

// Initialize monthly savings cron jobs
export const initializeMonthlySavingsJobs = (): void => {
  // Process monthly savings on the 1st of every month at 12:01 AM
  // This runs after the month has ended to calculate previous month's savings
  cron.schedule('1 0 1 * *', processMonthlySavings);
  
  // Send monthly savings reminder on the 15th of every month at 10 AM
  cron.schedule('0 10 15 * *', sendMonthlySavingsReminder);
  
  console.log("Monthly savings cron jobs initialized");
};

// Export functions for manual testing
export {
  processMonthlySavings,
  sendMonthlySavingsReminder,
  calculateMonthlySavings
};