import mongoose from 'mongoose';

const addPeriod = (date, frequency) => {
  const next = new Date(date);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

// The next renewal date that falls after "from" (today by default)
export const getNextRenewalDate = (startDate, frequency, from = new Date()) => {
  let next = addPeriod(startDate, frequency);

  while (next <= from) {
    next = addPeriod(next, frequency);
  }

  return next;
};

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, 'Subscription price is required'],
      min: [0, 'Price must be 0 or more'],
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP'],
      default: 'INR',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: [true, 'Frequency is required'],
    },
    category: {
      type: String,
      enum: ['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'education', 'other'],
      required: [true, 'Category is required'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    renewalDate: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Work out the renewal date whenever the start date or frequency is set or changed
subscriptionSchema.pre('save', function () {
  if (this.isNew || this.isModified('startDate') || this.isModified('frequency')) {
    this.renewalDate = getNextRenewalDate(this.startDate, this.frequency);
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;