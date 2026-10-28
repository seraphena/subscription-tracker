export const generateEmailTemplate = ({ userName, subscription, daysLeft }) => {
  const renewalDate = new Date(subscription.renewalDate).toDateString();

  const subject = `Reminder: your ${subscription.name} subscription renews in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px;">
      <h2>Hi ${userName},</h2>
      <p>Your <strong>${subscription.name}</strong> subscription renews in
         <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong> (${renewalDate}).</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 6px 0;">Plan</td><td>${subscription.name}</td></tr>
        <tr><td style="padding: 6px 0;">Price</td><td>${subscription.currency} ${subscription.price} (${subscription.frequency})</td></tr>
        <tr><td style="padding: 6px 0;">Payment method</td><td>${subscription.paymentMethod}</td></tr>
        <tr><td style="padding: 6px 0;">Renewal date</td><td>${renewalDate}</td></tr>
      </table>
      <p>If you no longer need it, cancel before the renewal date to avoid being charged.</p>
      <p>Subscription Tracker</p>
    </div>
  `;

  return { subject, html };
};