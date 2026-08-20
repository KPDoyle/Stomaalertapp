import type { AppAction, AppData, CareLogData, CareTaskData, CheckInData, ContentSettingsData, DiaryEntryData, InventoryItemData, MessageData, ProfileData, SupplyRequestData } from "@/lib/app-types";

type RunResult<T = unknown> = { results?: T[] };
type Statement = {
  bind: (...values: unknown[]) => Statement;
  run: () => Promise<unknown>;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  all: <T = Record<string, unknown>>() => Promise<RunResult<T>>;
};
type Database = { prepare: (sql: string) => Statement; batch: (statements: Statement[]) => Promise<unknown> };

async function database() {
  const { env } = await import("cloudflare:workers");
  const db = (env as unknown as { DB?: Database }).DB;
  if (!db) throw new Error("Persistent data is unavailable");
  return db;
}

export function requestOwner(request: Request) {
  return (request.headers.get("oai-authenticated-user-email") || "kevin-demo")
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "-");
}

export async function ensureAppData(owner: string) {
  const db = await database();
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS profiles (owner TEXT PRIMARY KEY, first_name TEXT NOT NULL, email TEXT NOT NULL, stoma_type TEXT NOT NULL, duration TEXT NOT NULL, date_created TEXT NOT NULL, nurse TEXT NOT NULL, supplier TEXT NOT NULL, products TEXT NOT NULL, learning TEXT NOT NULL, home_subtitle TEXT NOT NULL, checkin_heading TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS checkins (id TEXT PRIMARY KEY, owner TEXT NOT NULL, output INTEGER NOT NULL, skin INTEGER NOT NULL, comfort INTEGER NOT NULL, mood INTEGER NOT NULL, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS checkins_owner_created_idx ON checkins (owner, created_at)"),
    db.prepare("CREATE TABLE IF NOT EXISTS diary_entries (id TEXT PRIMARY KEY, owner TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, detail TEXT NOT NULL, file_key TEXT, file_name TEXT, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS diary_owner_created_idx ON diary_entries (owner, created_at)"),
    db.prepare("CREATE TABLE IF NOT EXISTS supply_requests (id TEXT PRIMARY KEY, owner TEXT NOT NULL, supplier TEXT NOT NULL, product TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS supply_owner_created_idx ON supply_requests (owner, created_at)"),
    db.prepare("CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, owner TEXT NOT NULL, sender TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS messages_owner_created_idx ON messages (owner, created_at)"),
    db.prepare("CREATE TABLE IF NOT EXISTS care_logs (id TEXT PRIMARY KEY, owner TEXT NOT NULL, output_ml INTEGER NOT NULL, consistency TEXT NOT NULL, hydration_ml INTEGER NOT NULL, skin_status TEXT NOT NULL, pain INTEGER NOT NULL, leak INTEGER NOT NULL, pouch_changed INTEGER NOT NULL, food TEXT NOT NULL, symptoms TEXT NOT NULL, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS care_logs_owner_created_idx ON care_logs (owner, created_at)"),
    db.prepare("CREATE TABLE IF NOT EXISTS inventory_items (id TEXT PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL, product_code TEXT NOT NULL, quantity INTEGER NOT NULL, reorder_at INTEGER NOT NULL, unit TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS inventory_owner_idx ON inventory_items (owner)"),
    db.prepare("CREATE TABLE IF NOT EXISTS care_tasks (id TEXT PRIMARY KEY, owner TEXT NOT NULL, category TEXT NOT NULL, title TEXT NOT NULL, detail TEXT NOT NULL, due_date TEXT NOT NULL, completed INTEGER NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS care_tasks_owner_due_idx ON care_tasks (owner, due_date)"),
    db.prepare("CREATE TABLE IF NOT EXISTS content_settings (owner TEXT PRIMARY KEY, learning_intro TEXT NOT NULL, product_help TEXT NOT NULL, safety_message TEXT NOT NULL, updated_at TEXT NOT NULL)"),
  ]);

  const existing = await db.prepare("SELECT owner FROM profiles WHERE owner = ?").bind(owner).first();
  const now = new Date();
  const iso = (daysAgo: number, hours: number) => new Date(now.getTime() - daysAgo * 86400000 - hours * 3600000).toISOString();
  if (existing) {
    const [careCount, inventoryCount, taskCount, contentRow] = await Promise.all([
      db.prepare("SELECT COUNT(*) AS count FROM care_logs WHERE owner = ?").bind(owner).first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) AS count FROM inventory_items WHERE owner = ?").bind(owner).first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) AS count FROM care_tasks WHERE owner = ?").bind(owner).first<{ count: number }>(),
      db.prepare("SELECT owner FROM content_settings WHERE owner = ?").bind(owner).first(),
    ]);
    const statements: Statement[] = [];
    if (!Number(careCount?.count)) {
      statements.push(db.prepare("INSERT INTO care_logs (id, owner, output_ml, consistency, hydration_ml, skin_status, pain, leak, pouch_changed, food, symptoms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, 650, "usual", 1800, "comfortable", 1, 0, 1, "Porridge, soup and a light evening meal", "No new concerns", iso(0, 8)));
    }
    if (!Number(inventoryCount?.count)) {
      statements.push(
        db.prepare("INSERT INTO inventory_items (id, owner, name, product_code, quantity, reorder_at, unit) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "Drainable pouches · 60mm", "SA-DR60", 8, 10, "pouches"),
        db.prepare("INSERT INTO inventory_items (id, owner, name, product_code, quantity, reorder_at, unit) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "Barrier spray", "SA-BS50", 2, 1, "bottles"),
        db.prepare("INSERT INTO inventory_items (id, owner, name, product_code, quantity, reorder_at, unit) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "Adhesive remover wipes", "SA-AR30", 14, 8, "wipes"),
      );
    }
    if (!Number(taskCount?.count)) {
      statements.push(
        db.prepare("INSERT INTO care_tasks (id, owner, category, title, detail, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "routine", "Review pouch-change routine", "Check the seal, skin and wear time", iso(-1, 0).slice(0, 10), 0),
        db.prepare("INSERT INTO care_tasks (id, owner, category, title, detail, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "appointment", "Video review with Sarah", "Bring your care summary and product questions", iso(-6, 0).slice(0, 10), 0),
        db.prepare("INSERT INTO care_tasks (id, owner, category, title, detail, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "travel", "Prepare an emergency change kit", "Pouches, wipes, disposal bags and spare clothes", iso(-12, 0).slice(0, 10), 0),
        db.prepare("INSERT INTO care_tasks (id, owner, category, title, detail, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "recovery", "Gentle movement goal", "A short walk if your care team has confirmed it is suitable", iso(-2, 0).slice(0, 10), 1),
      );
    }
    if (!contentRow) {
      statements.push(db.prepare("INSERT INTO content_settings (owner, learning_intro, product_help, safety_message, updated_at) VALUES (?, ?, ?, ?, ?)").bind(owner, "Clear, trusted guidance that meets you where you are in recovery.", "Track what you have at home, prevent shortages and contact your care team when a product is not working well.", "Use your individual care plan. New, worsening or concerning symptoms should be discussed with your stoma care team.", now.toISOString()));
    }
    if (statements.length) await db.batch(statements);
    return;
  }

  await db.batch([
    db.prepare("INSERT INTO profiles (owner, first_name, email, stoma_type, duration, date_created, nurse, supplier, products, learning, home_subtitle, checkin_heading, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(owner, "Kevin", "Kevin.doyle@commerceworks.net", "Colostomy", "Permanent", "2026-03-14", "Sarah Whitfield", "Fittleworth", JSON.stringify(["Drainable pouch", "Barrier spray"]), JSON.stringify([true, false, false]), "A 60-second check-in keeps you and your care team in the loop.", "How are things today?", now.toISOString()),
    ...[
      [4, 4, 4, 5, iso(0, 9)], [3, 4, 3, 4, iso(2, 8)], [3, 3, 4, 4, iso(3, 9)], [3, 3, 3, 4, iso(5, 7)], [2, 3, 3, 3, iso(7, 8)],
    ].map(([output, skin, comfort, mood, createdAt]) => db.prepare("INSERT INTO checkins (id, owner, output, skin, comfort, mood, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, output, skin, comfort, mood, createdAt)),
    db.prepare("INSERT INTO diary_entries (id, owner, type, title, detail, file_key, file_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "checkin", "Daily check-in", "Output 4 · Skin 4 · Comfort 4 · Mood 5", null, null, iso(0, 9)),
    db.prepare("INSERT INTO diary_entries (id, owner, type, title, detail, file_key, file_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "note", "Recovery note", "Appliance felt comfortable during a short walk.", null, null, iso(1, 6)),
    db.prepare("INSERT INTO messages (id, owner, sender, body, created_at) VALUES (?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "patient", "Morning Sarah. Everything feels comfortable today.", iso(1, 7)),
    db.prepare("INSERT INTO messages (id, owner, sender, body, created_at) VALUES (?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "nurse", "That is good to hear, Kevin. Keep an eye on the skin and let me know if anything changes.", iso(1, 6)),
    db.prepare("INSERT INTO care_logs (id, owner, output_ml, consistency, hydration_ml, skin_status, pain, leak, pouch_changed, food, symptoms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, 650, "usual", 1800, "comfortable", 1, 0, 1, "Porridge, soup and a light evening meal", "No new concerns", iso(0, 8)),
    db.prepare("INSERT INTO care_logs (id, owner, output_ml, consistency, hydration_ml, skin_status, pain, leak, pouch_changed, food, symptoms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, 720, "loose", 1600, "itchy", 2, 0, 0, "Toast, yoghurt and pasta", "Mild itch at the lower edge", iso(2, 7)),
    db.prepare("INSERT INTO inventory_items (id, owner, name, product_code, quantity, reorder_at, unit) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "Drainable pouches · 60mm", "SA-DR60", 8, 10, "pouches"),
    db.prepare("INSERT INTO inventory_items (id, owner, name, product_code, quantity, reorder_at, unit) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "Barrier spray", "SA-BS50", 2, 1, "bottles"),
    db.prepare("INSERT INTO inventory_items (id, owner, name, product_code, quantity, reorder_at, unit) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "Adhesive remover wipes", "SA-AR30", 14, 8, "wipes"),
    db.prepare("INSERT INTO care_tasks (id, owner, category, title, detail, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "routine", "Review pouch-change routine", "Check the seal, skin and wear time", iso(-1, 0).slice(0, 10), 0),
    db.prepare("INSERT INTO care_tasks (id, owner, category, title, detail, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "appointment", "Video review with Sarah", "Bring your care summary and product questions", iso(-6, 0).slice(0, 10), 0),
    db.prepare("INSERT INTO care_tasks (id, owner, category, title, detail, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "travel", "Prepare an emergency change kit", "Pouches, wipes, disposal bags and spare clothes", iso(-12, 0).slice(0, 10), 0),
    db.prepare("INSERT INTO care_tasks (id, owner, category, title, detail, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "recovery", "Gentle movement goal", "A short walk if your care team has confirmed it is suitable", iso(-2, 0).slice(0, 10), 1),
    db.prepare("INSERT INTO content_settings (owner, learning_intro, product_help, safety_message, updated_at) VALUES (?, ?, ?, ?, ?)").bind(owner, "Clear, trusted guidance that meets you where you are in recovery.", "Track what you have at home, prevent shortages and contact your care team when a product is not working well.", "Use your individual care plan. New, worsening or concerning symptoms should be discussed with your stoma care team.", now.toISOString()),
  ]);
}

function parseList<T>(value: unknown, fallback: T): T {
  try { return JSON.parse(String(value)) as T; } catch { return fallback; }
}

export async function readAppData(owner: string): Promise<AppData> {
  await ensureAppData(owner);
  const db = await database();
  const [profileRow, checkinsRows, diaryRows, supplyRows, messageRows, careLogRows, inventoryRows, taskRows, contentRow] = await Promise.all([
    db.prepare("SELECT * FROM profiles WHERE owner = ?").bind(owner).first<Record<string, unknown>>(),
    db.prepare("SELECT id, output, skin, comfort, mood, created_at AS createdAt FROM checkins WHERE owner = ? ORDER BY created_at DESC LIMIT 90").bind(owner).all<CheckInData>(),
    db.prepare("SELECT id, type, title, detail, file_key AS fileKey, file_name AS fileName, created_at AS createdAt FROM diary_entries WHERE owner = ? ORDER BY created_at DESC LIMIT 100").bind(owner).all<DiaryEntryData>(),
    db.prepare("SELECT id, supplier, product, status, created_at AS createdAt FROM supply_requests WHERE owner = ? ORDER BY created_at DESC LIMIT 30").bind(owner).all<SupplyRequestData>(),
    db.prepare("SELECT id, sender, body, created_at AS createdAt FROM messages WHERE owner = ? ORDER BY created_at ASC LIMIT 100").bind(owner).all<MessageData>(),
    db.prepare("SELECT id, output_ml AS outputMl, consistency, hydration_ml AS hydrationMl, skin_status AS skinStatus, pain, leak, pouch_changed AS pouchChanged, food, symptoms, created_at AS createdAt FROM care_logs WHERE owner = ? ORDER BY created_at DESC LIMIT 90").bind(owner).all<CareLogData>(),
    db.prepare("SELECT id, name, product_code AS productCode, quantity, reorder_at AS reorderAt, unit FROM inventory_items WHERE owner = ? ORDER BY name").bind(owner).all<InventoryItemData>(),
    db.prepare("SELECT id, category, title, detail, due_date AS dueDate, completed FROM care_tasks WHERE owner = ? ORDER BY completed, due_date").bind(owner).all<CareTaskData>(),
    db.prepare("SELECT learning_intro AS learningIntro, product_help AS productHelp, safety_message AS safetyMessage FROM content_settings WHERE owner = ?").bind(owner).first<ContentSettingsData>(),
  ]);
  if (!profileRow) throw new Error("Profile could not be loaded");
  const profile: ProfileData = {
    firstName: String(profileRow.first_name), email: String(profileRow.email), stomaType: String(profileRow.stoma_type), duration: String(profileRow.duration), dateCreated: String(profileRow.date_created), nurse: String(profileRow.nurse), supplier: String(profileRow.supplier),
    products: parseList<string[]>(profileRow.products, []), learning: parseList<boolean[]>(profileRow.learning, [false, false, false]), homeSubtitle: String(profileRow.home_subtitle), checkinHeading: String(profileRow.checkin_heading),
  };
  if (!contentRow) throw new Error("Content settings could not be loaded");
  return { profile, checkins: checkinsRows.results || [], diaryEntries: diaryRows.results || [], supplyRequests: supplyRows.results || [], messages: messageRows.results || [], careLogs: (careLogRows.results || []).map((log) => ({ ...log, leak: Boolean(log.leak), pouchChanged: Boolean(log.pouchChanged) })), inventory: inventoryRows.results || [], careTasks: (taskRows.results || []).map((task) => ({ ...task, completed: Boolean(task.completed) })), content: contentRow };
}

export async function applyAppAction(owner: string, action: AppAction) {
  await ensureAppData(owner);
  const db = await database();
  const now = new Date().toISOString();
  if (action.type === "save_checkin") {
    const scores = action.scores.map(Number);
    if (scores.length !== 4 || scores.some((score) => !Number.isInteger(score) || score < 1 || score > 5)) throw new Error("Complete all four check-in questions");
    await db.batch([
      db.prepare("INSERT INTO checkins (id, owner, output, skin, comfort, mood, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, ...scores, now),
      db.prepare("INSERT INTO diary_entries (id, owner, type, title, detail, file_key, file_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "checkin", "Daily check-in", `Output ${scores[0]} · Skin ${scores[1]} · Comfort ${scores[2]} · Mood ${scores[3]}`, null, null, now),
    ]);
  } else if (action.type === "update_profile") {
    const current = await readAppData(owner);
    const profile = { ...current.profile, ...action.profile };
    await db.prepare("UPDATE profiles SET first_name = ?, email = ?, stoma_type = ?, duration = ?, date_created = ?, nurse = ?, supplier = ?, products = ?, learning = ?, home_subtitle = ?, checkin_heading = ?, updated_at = ? WHERE owner = ?")
      .bind(profile.firstName, profile.email, profile.stomaType, profile.duration, profile.dateCreated, profile.nurse, profile.supplier, JSON.stringify(profile.products), JSON.stringify(profile.learning), profile.homeSubtitle, profile.checkinHeading, now, owner).run();
  } else if (action.type === "request_supplies") {
    const supplier = action.supplier.trim();
    const product = action.product?.trim() || "Drainable pouch · 60mm";
    if (!supplier) throw new Error("Choose a supplier");
    if (product.length > 160) throw new Error("Product description is too long");
    await db.batch([
      db.prepare("INSERT INTO supply_requests (id, owner, supplier, product, status, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, supplier, product, "Requested", now),
      db.prepare("UPDATE profiles SET supplier = ?, updated_at = ? WHERE owner = ?").bind(supplier, now, owner),
    ]);
  } else if (action.type === "update_supply_status") {
    const statuses = ["Requested", "Approved", "Dispatched", "Delivered"];
    if (!statuses.includes(action.status)) throw new Error("Supply status is not valid");
    const request = await db.prepare("SELECT id FROM supply_requests WHERE id = ? AND owner = ?").bind(action.id, owner).first();
    if (!request) throw new Error("Supply request not found");
    await db.prepare("UPDATE supply_requests SET status = ? WHERE id = ? AND owner = ?").bind(action.status, action.id, owner).run();
  } else if (action.type === "toggle_guide") {
    const current = await readAppData(owner);
    const learning = [...current.profile.learning];
    if (action.index < 0 || action.index > 2) throw new Error("Guide not found");
    learning[action.index] = !learning[action.index];
    await db.prepare("UPDATE profiles SET learning = ?, updated_at = ? WHERE owner = ?").bind(JSON.stringify(learning), now, owner).run();
  } else if (action.type === "send_message") {
    const body = action.body.trim();
    if (!body || body.length > 1000) throw new Error("Enter a message up to 1,000 characters");
    await db.prepare("INSERT INTO messages (id, owner, sender, body, created_at) VALUES (?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, action.sender, body, now).run();
  } else if (action.type === "add_diary_note") {
    const title = action.title.trim();
    const detail = action.detail.trim();
    if (!title || title.length > 80) throw new Error("Enter a note title up to 80 characters");
    if (!detail || detail.length > 1000) throw new Error("Enter a note up to 1,000 characters");
    await db.prepare("INSERT INTO diary_entries (id, owner, type, title, detail, file_key, file_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), owner, "note", title, detail, null, null, now).run();
  } else if (action.type === "save_care_log") {
    const log = action.log;
    if (!Number.isInteger(log.outputMl) || log.outputMl < 0 || log.outputMl > 10000) throw new Error("Enter an output amount between 0 and 10,000 ml");
    if (!Number.isInteger(log.hydrationMl) || log.hydrationMl < 0 || log.hydrationMl > 10000) throw new Error("Enter a fluid amount between 0 and 10,000 ml");
    if (!Number.isInteger(log.pain) || log.pain < 0 || log.pain > 10) throw new Error("Choose a pain score between 0 and 10");
    const id = crypto.randomUUID();
    const detail = `${log.outputMl} ml output · ${log.consistency} · ${log.hydrationMl} ml fluids${log.leak ? " · leak reported" : ""}${log.pouchChanged ? " · pouch changed" : ""}`;
    await db.batch([
      db.prepare("INSERT INTO care_logs (id, owner, output_ml, consistency, hydration_ml, skin_status, pain, leak, pouch_changed, food, symptoms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, owner, log.outputMl, log.consistency, log.hydrationMl, log.skinStatus, log.pain, Number(log.leak), Number(log.pouchChanged), log.food.trim(), log.symptoms.trim(), now),
      db.prepare("INSERT INTO diary_entries (id, owner, type, title, detail, file_key, file_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), owner, "note", "Daily care log", detail, null, null, now),
    ]);
  } else if (action.type === "adjust_inventory") {
    if (!Number.isInteger(action.change) || Math.abs(action.change) > 100) throw new Error("Invalid stock adjustment");
    const item = await db.prepare("SELECT quantity FROM inventory_items WHERE id = ? AND owner = ?").bind(action.id, owner).first<{ quantity: number }>();
    if (!item) throw new Error("Supply item not found");
    await db.prepare("UPDATE inventory_items SET quantity = ? WHERE id = ? AND owner = ?").bind(Math.max(0, Number(item.quantity) + action.change), action.id, owner).run();
  } else if (action.type === "add_inventory_item") {
    const item = action.item;
    const name = item.name.trim();
    const productCode = item.productCode.trim();
    const unit = item.unit.trim();
    if (!name || name.length > 100) throw new Error("Enter a product name up to 100 characters");
    if (!productCode || productCode.length > 40) throw new Error("Enter a product code up to 40 characters");
    if (!unit || unit.length > 30) throw new Error("Enter a unit up to 30 characters");
    if (!Number.isInteger(item.quantity) || item.quantity < 0 || item.quantity > 999) throw new Error("Quantity must be between 0 and 999");
    if (!Number.isInteger(item.reorderAt) || item.reorderAt < 0 || item.reorderAt > 999) throw new Error("Reorder level must be between 0 and 999");
    await db.prepare("INSERT INTO inventory_items (id, owner, name, product_code, quantity, reorder_at, unit) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), owner, name, productCode, item.quantity, item.reorderAt, unit).run();
  } else if (action.type === "remove_inventory_item") {
    const item = await db.prepare("SELECT id FROM inventory_items WHERE id = ? AND owner = ?").bind(action.id, owner).first();
    if (!item) throw new Error("Supply item not found");
    await db.prepare("DELETE FROM inventory_items WHERE id = ? AND owner = ?").bind(action.id, owner).run();
  } else if (action.type === "toggle_care_task") {
    const task = await db.prepare("SELECT completed FROM care_tasks WHERE id = ? AND owner = ?").bind(action.id, owner).first<{ completed: number }>();
    if (!task) throw new Error("Care task not found");
    await db.prepare("UPDATE care_tasks SET completed = ? WHERE id = ? AND owner = ?").bind(task.completed ? 0 : 1, action.id, owner).run();
  } else if (action.type === "add_care_task") {
    const task = action.task;
    const categories = ["routine", "appointment", "travel", "recovery"];
    if (!categories.includes(task.category)) throw new Error("Care task category is not valid");
    if (!task.title.trim() || task.title.trim().length > 100) throw new Error("Enter a task title up to 100 characters");
    if (!task.detail.trim() || task.detail.trim().length > 300) throw new Error("Enter task details up to 300 characters");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) throw new Error("Choose a due date");
    await db.prepare("INSERT INTO care_tasks (id, owner, category, title, detail, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), owner, task.category, task.title.trim(), task.detail.trim(), task.dueDate, 0).run();
  } else if (action.type === "remove_care_task") {
    const task = await db.prepare("SELECT id FROM care_tasks WHERE id = ? AND owner = ?").bind(action.id, owner).first();
    if (!task) throw new Error("Care task not found");
    await db.prepare("DELETE FROM care_tasks WHERE id = ? AND owner = ?").bind(action.id, owner).run();
  } else if (action.type === "update_content") {
    const values = [action.homeSubtitle, action.checkinHeading, action.learningIntro, action.productHelp, action.safetyMessage].map((value) => value.trim());
    if (values.some((value) => !value || value.length > 500)) throw new Error("Content fields are required and must be under 500 characters");
    await db.batch([
      db.prepare("UPDATE profiles SET home_subtitle = ?, checkin_heading = ?, updated_at = ? WHERE owner = ?").bind(values[0], values[1], now, owner),
      db.prepare("UPDATE content_settings SET learning_intro = ?, product_help = ?, safety_message = ?, updated_at = ? WHERE owner = ?").bind(values[2], values[3], values[4], now, owner),
    ]);
  }
  return readAppData(owner);
}

export async function addPhotoEntry(owner: string, fileKey: string, fileName: string) {
  await ensureAppData(owner);
  const db = await database();
  await db.prepare("INSERT INTO diary_entries (id, owner, type, title, detail, file_key, file_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), owner, "photo", "Diary photo added", `Image: ${fileName} · Private to this demo workspace`, fileKey, fileName, new Date().toISOString()).run();
  return readAppData(owner);
}
