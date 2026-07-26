/**
 * Route d'initialisation de la DB — accessible une seule fois en production.
 * Protégée par un token secret.
 * GET /api/init-db?token=VOTRE_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const secret = process.env.AUTH_SECRET;

  if (!token || token !== secret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL ?? "";
  const needsSsl = dbUrl.includes("neon.tech") || dbUrl.includes("supabase") || dbUrl.includes("sslmode=require");
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT, email TEXT NOT NULL UNIQUE, phone TEXT,
        password TEXT NOT NULL, referral_code TEXT UNIQUE,
        referred_by_id UUID, is_active BOOLEAN DEFAULT false,
        role TEXT DEFAULT 'user', created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        balance NUMERIC(12,2) DEFAULT 0, task_balance NUMERIC(12,2) DEFAULT 0,
        invest_balance NUMERIC(12,2) DEFAULT 0, affiliate_earnings NUMERIC(12,2) DEFAULT 0,
        task_earnings NUMERIC(12,2) DEFAULT 0, total_deposits NUMERIC(12,2) DEFAULT 0,
        total_withdrawals NUMERIC(12,2) DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        type TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL,
        status TEXT DEFAULT 'pending', method TEXT, phone TEXT,
        description TEXT, admin_note TEXT, created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL, description TEXT,
        reward NUMERIC(12,2) NOT NULL, type TEXT DEFAULT 'general',
        is_active BOOLEAN DEFAULT true
      );
      CREATE TABLE IF NOT EXISTS user_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        task_id UUID REFERENCES tasks(id) NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS investment_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL, investment_amount NUMERIC(12,2) NOT NULL,
        daily_reward NUMERIC(12,2) NOT NULL, duration_days INTEGER NOT NULL,
        total_return NUMERIC(12,2), is_active BOOLEAN DEFAULT true
      );
      CREATE TABLE IF NOT EXISTS user_investments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        plan_id UUID REFERENCES investment_plans(id) NOT NULL,
        status TEXT DEFAULT 'active', total_earned NUMERIC(12,2) DEFAULT 0,
        days_claimed INTEGER DEFAULT 0, started_at TIMESTAMP DEFAULT NOW(),
        last_claimed_at TIMESTAMP, ends_at TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS spin_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        reward INTEGER NOT NULL, created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed
    await client.query(`
      INSERT INTO investment_plans (name, investment_amount, daily_reward, duration_days, total_return)
      VALUES
        ('Bronze', 2500,  600,  75, 45000),
        ('Silver', 4500,  1200, 75, 90000),
        ('Gold',   7000,  1600, 75, 120000),
        ('VIP 1',  5000,  1500, 60, 90000),
        ('VIP 2',  10000, 3000, 60, 180000),
        ('VIP 3',  15000, 4500, 60, 270000),
        ('VIP 4',  20000, 6000, 60, 360000)
      ON CONFLICT DO NOTHING;

      INSERT INTO tasks (title, description, reward, type)
      VALUES
        ('Quiz quotidien',     '3 questions · 50 FCFA chacune · 150 FCFA si tout correct', 150, 'quiz'),
        ('Canal Telegram',     'Rejoins le canal officiel et reste abonné',                  50, 'telegram'),
        ('Jeu des bouteilles', 'Trouve la bouteille cachant la boule · 100 FCFA si gagné',  100, 'bottle'),
        ('Lucky Spin',         'Tourne la roue · Gain aléatoire',                             0, 'spin')
      ON CONFLICT DO NOTHING;
    `);

    return NextResponse.json({ success: true, message: "Base de données initialisée avec succès !" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
    await pool.end();
  }
}
