import { createRequire } from 'module';
import dayjs from 'dayjs';

import Subscription from '../models/subscription.model.js';
import { sendReminderEmail } from '../utils/send-email.js';

const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;

  const subscription = await fetchSubscription(context, 'get subscription', subscriptionId);

  if (!subscription || subscription.status !== 'active') {
    console.log(`Subscription ${subscriptionId} not found or not active. Stopping workflow.`);
    return;
  }

  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(dayjs())) {
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, 'day');

    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
    }

    if (dayjs().isSame(reminderDate, 'day')) {
      await triggerReminder(context, daysBefore, subscriptionId);
    }
  }
});

const fetchSubscription = async (context, label, subscriptionId) => {
  return await context.run(label, async () => {
    return Subscription.findById(subscriptionId).populate('user', 'name email');
  });
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date.toString()}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, daysBefore, subscriptionId) => {
  const label = `${daysBefore} days before reminder`;

  const subscription = await fetchSubscription(context, `refresh before ${label}`, subscriptionId);

  if (!subscription || subscription.status !== 'active') {
    console.log(`Subscription ${subscriptionId} is no longer active. Skipping ${label}.`);
    return;
  }

  return await context.run(label, async () => {
    console.log(`Triggering ${label} for ${subscription.name}`);

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};