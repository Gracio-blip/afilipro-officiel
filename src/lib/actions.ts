"use server";

import { db } from "@/db";
import { users, wallets, investmentPlans, userInvestments, transactions, tasks, userTasks, spinHistory } from "@/db/schema";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { getMinWithdrawal } from "@/lib/utils";
import { sendTelegram, lomeTime, fmtMoney as fmtM } from "@/lib/telegram";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function genCode(base = "USER") {
  const clean = base.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}${rand}${Date.now().toString().slice(-2)}`;
}

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const uRows = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (!uRows[0]) return null;
  const wRows = await db.select().from(wallets).where(eq(wallets.userId, uRows[0].id)).limit(1);
  return { user: uRows[0], wallet: wRows[0] ?? null };
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export async function registerUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? email.split("@")[0]);
  const phone = String(formData.get("phone") ?? "");
  const refCode = String(formData.get("refCode") ?? "").trim().toUpperCase();

  if (!email || !password || password.length < 6) throw new Error("Email et mot de passe (min 6 car.) requis");

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) throw new Error("Email déjà utilisé");

  let referredById: string | null = null;
  if (refCode) {
    const ref = await db.select().from(users).where(eq(users.referralCode, refCode)).limit(1);
    if (ref[0]) referredById = ref[0].id;
  }

  const hashed = await bcrypt.hash(password, 10);
  const myCode = genCode(name);
  const inserted = await db.insert(users).values({ name, email, phone, password: hashed, referralCode: myCode, referredById, isActive: false, role: "user" }).returning();

  // Créer le wallet — PAS de solde de bienvenue, l'utilisateur doit déposer
  await db.insert(wallets).values({ userId: inserted[0].id, balance: "0", taskBalance: "0", investBalance: "0" });
  redirect("/login");
}

export async function loginAction(formData: FormData) {
  const { signIn } = await import("@/lib/auth");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard?success=1" });
  } catch {
    redirect("/login?error=invalid");
  }
}

export async function logoutAction() {
  const { signOut } = await import("@/lib/auth");
  await signOut({ redirectTo: "/login" });
}

// ─────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────
export async function seedIfEmpty() {
  // Plans
  const plans = await db.select().from(investmentPlans);
  if (plans.length === 0) {
    await db.insert(investmentPlans).values([
      { name: "Bronze", investmentAmount: "2500", dailyReward: "600",  durationDays: 75, totalReturn: "45000" },
      { name: "Silver", investmentAmount: "4500", dailyReward: "1200", durationDays: 75, totalReturn: "90000" },
      { name: "Gold",   investmentAmount: "7000", dailyReward: "1600", durationDays: 75, totalReturn: "120000" },
      { name: "VIP 1",  investmentAmount: "5000", dailyReward: "1500", durationDays: 60, totalReturn: "90000" },
      { name: "VIP 2",  investmentAmount: "10000",dailyReward: "3000", durationDays: 60, totalReturn: "180000" },
      { name: "VIP 3",  investmentAmount: "15000",dailyReward: "4500", durationDays: 60, totalReturn: "270000" },
      { name: "VIP 4",  investmentAmount: "20000",dailyReward: "6000", durationDays: 60, totalReturn: "360000" },
    ]);
  }

  // Tasks — quiz: 3 questions × 50 FCFA = 150 FCFA total
  const t = await db.select().from(tasks);
  if (t.length === 0) {
    await db.insert(tasks).values([
      { title: "Quiz quotidien",          description: "3 questions · 50 FCFA chacune · 150 FCFA si tout correct", reward: "150", type: "quiz" },
      { title: "Canal Telegram",          description: "Rejoins le canal officiel et reste abonné",                  reward: "50",  type: "telegram" },
      { title: "Jeu des bouteilles",      description: "Trouve la bouteille cachant la boule · 100 FCFA si gagné",  reward: "100", type: "bottle" },
      { title: "Lucky Spin",              description: "Tourne la roue · Gain aléatoire",                            reward: "0",   type: "spin" },
    ]);
  }
}

// ─────────────────────────────────────────────
// DEPOSIT
// ─────────────────────────────────────────────
export async function createDeposit(formData: FormData) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "");
  const phone  = String(formData.get("phone") ?? "");
  if (!Number.isFinite(amount) || amount < 2500) throw new Error("Minimum 2 500 FCFA");
  if (!method || !phone) throw new Error("Méthode et numéro requis");

  const inserted = await db.insert(transactions).values({
    userId: current.user.id, type: "deposit",
    amount: amount.toString(), status: "pending",
    method, phone, description: `Dépôt ${method} — ${phone}`,
  }).returning();

  // Notification Telegram
  await sendTelegram(
    `💰 <b>NOUVEAU DÉPÔT EN ATTENTE</b>\n\n` +
    `👤 Utilisateur : <code>${current.user.email}</code>\n` +
    `📞 Numéro : <code>${phone}</code>\n` +
    `💳 Méthode : ${method}\n` +
    `💵 Montant : <b>${fmtM(amount)}</b>\n` +
    `🕐 Heure : ${lomeTime()}\n` +
    `🆔 ID Transaction : <code>${inserted[0]?.id ?? "—"}</code>\n\n` +
    `➡️ Rendez-vous sur /admin pour valider ou refuser.`
  );
  redirect("/deposit?pending=1");
}

export async function approveDeposit(tid: string) {
  const rows = await db.select().from(transactions).where(eq(transactions.id, tid)).limit(1);
  const tr = rows[0];
  if (!tr || tr.type !== "deposit" || tr.status === "completed") return;

  await db.transaction(async (tx) => {
    await tx.update(transactions).set({ status: "completed" }).where(eq(transactions.id, tr.id));
    const w = await tx.select().from(wallets).where(eq(wallets.userId, tr.userId)).limit(1);
    const wallet = w[0];
    await tx.update(wallets).set({
      balance: (Number(wallet.balance) + Number(tr.amount)).toString(),
      totalDeposits: (Number(wallet.totalDeposits ?? 0) + Number(tr.amount)).toString(),
    }).where(eq(wallets.userId, tr.userId));

    const u = await tx.select().from(users).where(eq(users.id, tr.userId)).limit(1);
    if (!u[0].isActive) {
      await tx.update(users).set({ isActive: true }).where(eq(users.id, tr.userId));
      // Bonus parrain 300 FCFA
      if (u[0].referredById) {
        const rw = await tx.select().from(wallets).where(eq(wallets.userId, u[0].referredById!)).limit(1);
        if (rw[0]) {
          await tx.update(wallets).set({
            balance: (Number(rw[0].balance) + 300).toString(),
            affiliateEarnings: (Number(rw[0].affiliateEarnings ?? 0) + 300).toString(),
            taskBalance: (Number(rw[0].taskBalance ?? 0) + 300).toString(),
          }).where(eq(wallets.userId, u[0].referredById!));
          await tx.insert(transactions).values({
            userId: u[0].referredById!, type: "referral_bonus",
            amount: "300", status: "completed",
            description: `Bonus parrainage — ${u[0].email}`,
          });
        }
      }
    }
  });
}

export async function rejectDeposit(tid: string, note: string) {
  await db.update(transactions).set({ status: "rejected", adminNote: note }).where(eq(transactions.id, tid));
}

// ─────────────────────────────────────────────
// WITHDRAWAL
// ─────────────────────────────────────────────
export async function requestWithdrawal(formData: FormData) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "");
  const phone  = String(formData.get("phone") ?? "");
  if (!Number.isFinite(amount)) throw new Error("Montant invalide");
  if (!method || !phone) throw new Error("Méthode et numéro requis");

  const wallet = current.wallet;
  const taskBal = Number(wallet?.taskBalance ?? 0);
  const minW = getMinWithdrawal(wallet ?? {});
  if (amount < minW) throw new Error(`Minimum actuel : ${minW} FCFA`);
  if (amount > taskBal) throw new Error(`Solde tâches insuffisant : ${taskBal} FCFA`);

  let txId = "";
  await db.transaction(async (tx) => {
    await tx.update(wallets).set({
      taskBalance: (taskBal - amount).toString(),
      balance: (Number(wallet?.balance ?? 0) - amount).toString(),
    }).where(eq(wallets.userId, current.user.id));
    const inserted2 = await tx.insert(transactions).values({
      userId: current.user.id, type: "withdrawal",
      amount: amount.toString(), status: "pending",
      method, phone, description: `Retrait ${method} — ${phone}`,
    }).returning();
    txId = inserted2[0]?.id ?? "";
  });

  // Notification Telegram — retrait
  await sendTelegram(
    `🏧 <b>NOUVELLE DEMANDE DE RETRAIT</b>\n\n` +
    `👤 Utilisateur : <code>${current.user.email}</code>\n` +
    `📞 Numéro de réception : <code>${phone}</code>\n` +
    `💳 Méthode : ${method}\n` +
    `💵 Montant : <b>${fmtM(amount)}</b>\n` +
    `💼 Solde après déduction : <b>${fmtM(taskBal - amount)}</b>\n` +
    `🕐 Heure : ${lomeTime()}\n` +
    `🆔 ID Transaction : <code>${txId}</code>\n\n` +
    `⚡️ Action requise : Approuver ou Refuser sur /admin`
  );
  redirect("/withdrawals?requested=1");
}

export async function approveWithdrawal(tid: string) {
  const rows = await db.select().from(transactions).where(eq(transactions.id, tid)).limit(1);
  const tr = rows[0];
  if (!tr || tr.type !== "withdrawal" || tr.status !== "pending") return;
  await db.transaction(async (tx) => {
    await tx.update(transactions).set({ status: "completed" }).where(eq(transactions.id, tr.id));
    const w = await tx.select().from(wallets).where(eq(wallets.userId, tr.userId)).limit(1);
    await tx.update(wallets).set({
      totalWithdrawals: (Number(w[0]?.totalWithdrawals ?? 0) + 1).toString(),
    }).where(eq(wallets.userId, tr.userId));
  });
}

export async function rejectWithdrawal(tid: string, note: string) {
  const rows = await db.select().from(transactions).where(eq(transactions.id, tid)).limit(1);
  const tr = rows[0];
  if (!tr) return;
  const w = await db.select().from(wallets).where(eq(wallets.userId, tr.userId)).limit(1);
  if (!w[0]) return;
  await db.transaction(async (tx) => {
    await tx.update(transactions).set({ status: "rejected", adminNote: note }).where(eq(transactions.id, tr.id));
    await tx.update(wallets).set({
      taskBalance: (Number(w[0].taskBalance ?? 0) + Number(tr.amount)).toString(),
      balance: (Number(w[0].balance) + Number(tr.amount)).toString(),
    }).where(eq(wallets.userId, tr.userId));
  });
}

// ─────────────────────────────────────────────
// INVESTMENT
// ─────────────────────────────────────────────
export async function investInPlan(planId: string) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  if (!current.user.isActive) throw new Error("Déposez 2 500 FCFA pour activer votre compte");
  const pRows = await db.select().from(investmentPlans).where(eq(investmentPlans.id, planId)).limit(1);
  const plan = pRows[0];
  if (!plan) throw new Error("Plan introuvable");
  const bal = Number(current.wallet?.balance ?? 0);
  if (bal < Number(plan.investmentAmount)) throw new Error("Solde insuffisant");
  const ends = new Date();
  ends.setDate(ends.getDate() + plan.durationDays);

  await db.transaction(async (tx) => {
    await tx.update(wallets).set({
      balance: (bal - Number(plan.investmentAmount)).toString(),
    }).where(eq(wallets.userId, current.user.id));
    await tx.insert(userInvestments).values({
      userId: current.user.id, planId: plan.id, status: "active",
      totalEarned: "0", daysClaimed: 0, lastClaimedAt: new Date(), endsAt: ends,
    });
    await tx.insert(transactions).values({
      userId: current.user.id, type: "investment",
      amount: plan.investmentAmount, status: "completed",
      description: `Investissement ${plan.name}`,
    });
  });
  redirect("/investments?invested=1");
}

export async function claimDailyRewards() {
  const current = await getCurrentUser();
  if (!current) return 0;
  const investments = await db.select().from(userInvestments)
    .where(and(eq(userInvestments.userId, current.user.id), eq(userInvestments.status, "active")));
  let totalClaimed = 0;

  for (const inv of investments) {
    const pRows = await db.select().from(investmentPlans).where(eq(investmentPlans.id, inv.planId)).limit(1);
    const plan = pRows[0];
    if (!plan) continue;
    const last = inv.lastClaimedAt ? new Date(inv.lastClaimedAt) : new Date(inv.startedAt!);
    const diffH = (Date.now() - last.getTime()) / (1000 * 60 * 60);
    if (diffH < 20) continue;
    const days = Math.min(Math.max(1, Math.floor(diffH / 24)), plan.durationDays - (inv.daysClaimed ?? 0));
    if (days <= 0) continue;
    const reward = Number(plan.dailyReward) * days;

    await db.transaction(async (tx) => {
      const wRows = await tx.select().from(wallets).where(eq(wallets.userId, current.user.id)).limit(1);
      const w = wRows[0];
      await tx.update(wallets).set({
        investBalance: (Number(w.investBalance ?? 0) + reward).toString(),
      }).where(eq(wallets.userId, current.user.id));
      const newDays = (inv.daysClaimed ?? 0) + days;
      await tx.update(userInvestments).set({
        totalEarned: (Number(inv.totalEarned ?? 0) + reward).toString(),
        daysClaimed: newDays,
        lastClaimedAt: new Date(),
        status: newDays >= plan.durationDays ? "completed" : "active",
      }).where(eq(userInvestments.id, inv.id));
      await tx.insert(transactions).values({
        userId: current.user.id, type: "earning",
        amount: reward.toString(), status: "completed",
        description: `Revenu quotidien ${plan.name} ×${days}j`,
      });
    });
    totalClaimed += reward;
  }
  return totalClaimed;
}

// ─────────────────────────────────────────────
// TASKS — 50 FCFA par question (3 questions = 150 FCFA)
// ─────────────────────────────────────────────
export async function completeTask(taskId: string) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  if (!current.user.isActive) throw new Error("Déposez 2 500 FCFA pour accéder aux tâches");

  const existing = await db.select().from(userTasks)
    .where(and(eq(userTasks.userId, current.user.id), eq(userTasks.taskId, taskId))).limit(1);
  if (existing[0]) throw new Error("Tâche déjà validée");

  const tRows = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  const task = tRows[0];
  if (!task) throw new Error("Tâche introuvable");

  const reward = Number(task.reward);

  await db.transaction(async (tx) => {
    await tx.insert(userTasks).values({ userId: current.user.id, taskId });
    const wRows = await tx.select().from(wallets).where(eq(wallets.userId, current.user.id)).limit(1);
    const w = wRows[0];
    await tx.update(wallets).set({
      balance:      (Number(w.balance)      + reward).toString(),
      taskBalance:  (Number(w.taskBalance ?? 0)  + reward).toString(),
      taskEarnings: (Number(w.taskEarnings ?? 0) + reward).toString(),
    }).where(eq(wallets.userId, current.user.id));
    await tx.insert(transactions).values({
      userId: current.user.id, type: "earning",
      amount: task.reward, status: "completed",
      description: `Mission : ${task.title}`,
    });
  });
}

// ─────────────────────────────────────────────
// LUCKY SPIN — 3 tentatives par 24h, compte actif requis
// Probabilités : 0=60%, 500=27%, 800=13% — l'utilisateur PEUT perdre
// ─────────────────────────────────────────────
export async function playSpin(): Promise<{ reward: number; message: string; attemptsLeft: number }> {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  if (!current.user.isActive) {
    return { reward: 0, message: "⛔ Dépôt de 2 500 FCFA requis pour jouer.", attemptsLeft: 0 };
  }

  // Compter les tentatives sur les 24 dernières heures
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentSpins = await db.select().from(spinHistory).where(eq(spinHistory.userId, current.user.id));
  const spinsLast24h = recentSpins.filter(s => new Date(s.createdAt!) >= since24h);

  const MAX_ATTEMPTS = 3;
  const used = spinsLast24h.length;
  const left = MAX_ATTEMPTS - used;

  if (left <= 0) {
    return { reward: -1, message: "Vous avez utilisé vos 3 tentatives. Revenez dans 24h !", attemptsLeft: 0 };
  }

  // Tirage — l'utilisateur PEUT perdre (60% de chance de perdre)
  const rand = Math.random() * 100;
  let reward: number;
  if (rand < 60) reward = 0;        // 60% — perte
  else if (rand < 87) reward = 500; // 27% — 500 FCFA
  else reward = 800;                 // 13% — 800 FCFA

  // Enregistrer la tentative
  await db.insert(spinHistory).values({ userId: current.user.id, reward });

  const newLeft = left - 1;

  if (reward > 0) {
    const wRows = await db.select().from(wallets).where(eq(wallets.userId, current.user.id)).limit(1);
    const w = wRows[0];
    if (w) {
      await db.transaction(async (tx) => {
        await tx.update(wallets).set({
          balance:      (Number(w.balance)          + reward).toString(),
          taskBalance:  (Number(w.taskBalance ?? 0)  + reward).toString(),
          taskEarnings: (Number(w.taskEarnings ?? 0) + reward).toString(),
        }).where(eq(wallets.userId, current.user.id));
        await tx.insert(transactions).values({
          userId: current.user.id, type: "earning",
          amount: reward.toString(), status: "completed",
          description: `Lucky Spin — Gain de ${reward} FCFA`,
        });
      });
    }
    const msg = reward === 800
      ? `🎉 JACKPOT ! Vous gagnez 800 FCFA ! (${newLeft} tentative${newLeft > 1 ? "s" : ""} restante${newLeft > 1 ? "s" : ""})`
      : `✨ Bravo ! Vous gagnez 500 FCFA ! (${newLeft} tentative${newLeft > 1 ? "s" : ""} restante${newLeft > 1 ? "s" : ""})`;
    return { reward, message: msg, attemptsLeft: newLeft };
  }

  const msg = newLeft > 0
    ? `😔 Pas de chance cette fois. Il vous reste ${newLeft} tentative${newLeft > 1 ? "s" : ""}.`
    : "😔 Pas de chance et plus de tentatives. Revenez dans 24h !";
  return { reward: 0, message: msg, attemptsLeft: newLeft };
}

// ─────────────────────────────────────────────
// BOTTLE GAME — cherche la boule sous les bouteilles
// Le serveur détermine la position réelle de la boule (anti-triche)
// Gagne 100 FCFA si bon choix, perd sinon (1/3 de chance)
// ─────────────────────────────────────────────
export async function playBottleGame(
  taskId: string,
  chosen: number
): Promise<{ won: boolean; reward: number; message: string; ballPosition: number }> {
  const current = await getCurrentUser();
  if (!current) return { won: false, reward: 0, message: "Non connecté", ballPosition: 0 };
  if (!current.user.isActive) return { won: false, reward: 0, message: "⛔ Compte non actif — Déposez 2 500 FCFA", ballPosition: 0 };

  // Le serveur choisit la position de la boule de façon indépendante — le client ne peut pas tricher
  const ballPosition = Math.floor(Math.random() * 3);
  const won = chosen === ballPosition;
  const reward = won ? 100 : 0;

  if (won) {
    const wRows = await db.select().from(wallets).where(eq(wallets.userId, current.user.id)).limit(1);
    const w = wRows[0];
    if (w) {
      await db.transaction(async (tx) => {
        await tx.update(wallets).set({
          balance:      (Number(w.balance)          + reward).toString(),
          taskBalance:  (Number(w.taskBalance ?? 0)  + reward).toString(),
          taskEarnings: (Number(w.taskEarnings ?? 0) + reward).toString(),
        }).where(eq(wallets.userId, current.user.id));
        await tx.insert(transactions).values({
          userId: current.user.id, type: "earning",
          amount: reward.toString(), status: "completed",
          description: `Jeu des bouteilles — Gain de ${reward} FCFA`,
        });
      });
    }
    return { won: true, reward, message: "🎉 Bravo ! Vous avez trouvé la boule ! +100 FCFA", ballPosition };
  }

  return { won: false, reward: 0, message: "😔 Raté ! La boule n'était pas là. Réessayez !", ballPosition };
}
