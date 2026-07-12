import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";
import { BCRYPT_ROUNDS } from "@/lib/constants";
import { AuthUser, isMockDataMode, mockUsers, now } from "./shared";

export async function getAllUsers(): Promise<User[]> {
  if (isMockDataMode()) {
    return [...mockUsers()].sort((a, b) => a.email.localeCompare(b.email));
  }

  return getDb().select().from(users).orderBy(asc(users.email));
}

export async function getUserById(id: string): Promise<User | null> {
  if (isMockDataMode()) {
    return mockUsers().find((u) => u.id === id) ?? null;
  }

  const [user] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.toLowerCase();

  if (isMockDataMode()) {
    return mockUsers().find((u) => u.email === normalized) ?? null;
  }

  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  return user ?? null;
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string | null;
  role: User["role"];
}): Promise<User> {
  const normalized = data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  if (isMockDataMode()) {
    const user: User = {
      id: randomUUID(),
      email: normalized,
      passwordHash,
      name: data.name ?? null,
      role: data.role,
      createdAt: now(),
      updatedAt: now(),
    };
    mockUsers().push(user);
    return user;
  }

  const [user] = await getDb()
    .insert(users)
    .values({
      email: normalized,
      passwordHash,
      name: data.name,
      role: data.role,
    })
    .returning();
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (isMockDataMode()) {
    const index = mockUsers().findIndex((u) => u.id === id);
    if (index === -1) return false;
    mockUsers().splice(index, 1);
    return true;
  }

  await getDb().delete(users).where(eq(users.id, id));
  return true;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const normalized = email.toLowerCase();

  if (isMockDataMode()) {
    if (normalized === "admin@cat4.com" && password === "changeme123") {
      const admin =
        mockUsers().find((u) => u.email === "admin@cat4.com") ?? mockUsers()[0];
      if (!admin) return null;
      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };
    }

    if (normalized === "jane.doe@example.com" && password === "ambassador123") {
      const ambassadorUser = mockUsers().find((u) => u.email === "jane.doe@example.com");
      if (!ambassadorUser) return null;
      return {
        id: ambassadorUser.id,
        email: ambassadorUser.email,
        name: ambassadorUser.name,
        role: ambassadorUser.role,
      };
    }

    const user = mockUsers().find((u) => u.email === normalized);
    if (!user) return null;

    if (user.passwordHash === "$mock$") return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  const user = await getUserByEmail(normalized);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
