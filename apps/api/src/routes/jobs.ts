import { Router } from "express";
import { z } from "zod";
import { prisma, JobStatus } from "@assetclear/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const jobsRouter = Router();

const jobSchema = z.object({
  clientId: z.string().min(1),
  siteAddress: z.string().min(1),
  siteNotes: z.string().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  leadId: z.string().optional(),
});

async function nextJobNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.job.count({ where: { jobNumber: { startsWith: `AC-${year}-` } } });
  return `AC-${year}-${String(count + 1).padStart(4, "0")}`;
}

jobsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const where = req.auth!.role === "CLIENT" ? { clientId: req.auth!.clientId ?? "__none__" } : {};
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { client: true, _count: { select: { assets: true } } },
    });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

jobsRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        assets: true,
        crew: { include: { user: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
        certificates: true,
      },
    });
    if (!job) throw new ApiError(404, "Job not found");
    if (req.auth!.role === "CLIENT" && req.auth!.clientId !== job.clientId) {
      throw new ApiError(403, "Insufficient permissions for this action");
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
});

jobsRouter.post("/", requireAuth, requireRole("ADMIN", "OPS_MANAGER"), async (req, res, next) => {
  try {
    const data = jobSchema.parse(req.body);
    const jobNumber = await nextJobNumber();
    const job = await prisma.job.create({
      data: {
        jobNumber,
        clientId: data.clientId,
        siteAddress: data.siteAddress,
        siteNotes: data.siteNotes,
        leadId: data.leadId,
        scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : undefined,
        scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : undefined,
        statusHistory: { create: [{ status: "QUOTED", note: "Job created" }] },
      },
    });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

const statusSchema = z.object({
  status: z.nativeEnum(JobStatus),
  note: z.string().optional(),
});

jobsRouter.post("/:id/status", requireAuth, requireRole("ADMIN", "OPS_MANAGER", "CREW"), async (req, res, next) => {
  try {
    const { status, note } = statusSchema.parse(req.body);
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
        statusHistory: { create: [{ status, note }] },
      },
    });
    res.json(job);
  } catch (err) {
    next(err);
  }
});
