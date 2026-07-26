import { pgTable, text, integer, boolean, timestamp, decimal, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  referralCode: text("referral_code").unique(),
  referredById: uuid("referred_by_id"),
  isActive: boolean("is_active").default(false),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  taskBalance: decimal("task_balance", { precision: 12, scale: 2 }).default("0"),
  investBalance: decimal("invest_balance", { precision: 12, scale: 2 }).default("0"),
  affiliateEarnings: decimal("affiliate_earnings", { precision: 12, scale: 2 }).default("0"),
  taskEarnings: decimal("task_earnings", { precision: 12, scale: 2 }).default("0"),
  totalDeposits: decimal("total_deposits", { precision: 12, scale: 2 }).default("0"),
  totalWithdrawals: decimal("total_withdrawals", { precision: 12, scale: 2 }).default("0"),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  method: text("method"),
  phone: text("phone"),
  description: text("description"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  reward: decimal("reward", { precision: 12, scale: 2 }).notNull(),
  type: text("type").default("general"),
  isActive: boolean("is_active").default(true),
});

export const userTasks = pgTable("user_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const investmentPlans = pgTable("investment_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  investmentAmount: decimal("investment_amount", { precision: 12, scale: 2 }).notNull(),
  dailyReward: decimal("daily_reward", { precision: 12, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  totalReturn: decimal("total_return", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true),
});

export const userInvestments = pgTable("user_investments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  planId: uuid("plan_id").references(() => investmentPlans.id).notNull(),
  status: text("status").default("active"),
  totalEarned: decimal("total_earned", { precision: 12, scale: 2 }).default("0"),
  daysClaimed: integer("days_claimed").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  lastClaimedAt: timestamp("last_claimed_at"),
  endsAt: timestamp("ends_at"),
});

// Lucky Spin — stores each spin result with reward and timestamp
export const spinHistory = pgTable("spin_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  reward: integer("reward").notNull(), // 0, 50, 100, 500, 800
  createdAt: timestamp("created_at").defaultNow(),
});
