import { Express, Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || "scheduler-secret-key";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    
    const user = await storage.getUser(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    (req as any).user = user;
    (req as any).workspaceId = decoded.organizationId;
    (req as any).role = decoded.role;
    next();
  });
}

// Global user data for backward compatibility if needed
declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  // Global login
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const workspaces = await storage.getWorkspacesForUser(user.id);
    
    // Generate an initial token for the user
    const token = generateToken({ userId: user.id });
    
    res.json({ token, user, workspaces });
  });

  // Global register
  app.post("/api/register", async (req, res) => {
    const { name, email, password, organizationName } = req.body;
    
    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({ name, email, password: hashedPassword });

    const wsSlug = organizationName?.toLowerCase().replace(/ /g, "-") || `ws-${user.id}`;
    const workspace = await storage.createWorkspace({
      name: organizationName || `${name}'s Workspace`,
      slug: wsSlug,
    }, user.id);

    const token = generateToken({ 
      userId: user.id, 
      organizationId: workspace.id, 
      role: "OWNER" 
    });

    res.status(201).json({ token, user, workspace });
  });

  // Switch workspace
  app.post("/api/auth/switch-workspace", authenticateToken, async (req, res) => {
    const { organizationId } = req.body;
    const user = (req as any).user;

    const workspaces = await storage.getWorkspacesForUser(user.id);
    const membership = workspaces.find(w => w.id === organizationId);

    if (!membership) return res.status(403).json({ message: "Access denied to this workspace" });

    const token = generateToken({ 
      userId: user.id, 
      organizationId: membership.id, 
      role: membership.role 
    });

    res.json({ token, role: membership.role });
  });

  app.get("/api/me", authenticateToken, (req, res) => {
    res.json((req as any).user);
  });
}
