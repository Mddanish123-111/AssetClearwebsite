import { Router } from "express";
import { z } from "zod";
import { prisma } from "@assetclear/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const clientsRouter = Router();

const clientSchema = z.object({
  companyName: z.string().min(1),
  billingEmail: z.string().email(),
  billingAddress: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

// List clients (internal staff only)
clientsRouter.get("/", requireAuth, requireRole("ADMIN", "OPS_MANAGER", "CREW"), async (_req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { companyName: "asc" },
      include: { _count: { select: { jobs: true } } },
    });
    res.json(clients);
  } catch (err) {
    next(err);
  }
});

clientsRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: { contacts: true, jobs: true },
    });
    if (!client) throw new ApiError(404, "Client not found");

    // CLIENT role can only view their own record
    if (req.auth!.role === "CLIENT" && req.auth!.clientId !== client.id) {
      throw new ApiError(403, "Insufficient permissions for this action");
    }

    res.json(client);
  } catch (err) {
    next(err);
  }
});

clientsRouter.post("/", requireAuth, requireRole("ADMIN", "OPS_MANAGER"), async (req, res, next) => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
});

clientsRouter.patch("/:id", requireAuth, requireRole("ADMIN", "OPS_MANAGER"), async (req, res, next) => {
  try {
    const data = clientSchema.partial().parse(req.body);
    const client = await prisma.client.update({ where: { id: req.params.id }, data });
    res.json(client);
  } catch (err) {
    next(err);
  }
});

clientsRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
