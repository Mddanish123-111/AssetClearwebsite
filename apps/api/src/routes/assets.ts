import { Router } from "express";
import { z } from "zod";
import { prisma, AssetCategory, AssetCondition, Disposition } from "@assetclear/db";
import { requireAuth, requireRole } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const assetsRouter = Router();

const assetSchema = z.object({
  jobId: z.string().min(1),
  category: z.nativeEnum(AssetCategory),
  description: z.string().min(1),
  condition: z.nativeEnum(AssetCondition),
  disposition: z.nativeEnum(Disposition).optional(),
  estimatedValue: z.number().nonnegative().optional(),
  photoUrl: z.string().url().optional(),
});

async function nextAssetTag() {
  const count = await prisma.asset.count();
  return `AC-A${String(count + 1).padStart(4, "0")}`;
}

assetsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const jobId = req.query.jobId as string | undefined;
    const assets = await prisma.asset.findMany({
      where: jobId ? { jobId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    res.json(assets);
  } catch (err) {
    next(err);
  }
});

assetsRouter.post("/", requireAuth, requireRole("ADMIN", "OPS_MANAGER", "CREW"), async (req, res, next) => {
  try {
    const data = assetSchema.parse(req.body);
    const assetTag = await nextAssetTag();
    const asset = await prisma.asset.create({ data: { ...data, assetTag } });
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
});

const dispositionSchema = z.object({ disposition: z.nativeEnum(Disposition) });

assetsRouter.patch("/:id/disposition", requireAuth, requireRole("ADMIN", "OPS_MANAGER", "CREW"), async (req, res, next) => {
  try {
    const { disposition } = dispositionSchema.parse(req.body);
    const asset = await prisma.asset.update({ where: { id: req.params.id }, data: { disposition } });
    res.json(asset);
  } catch (err) {
    next(err);
  }
});

assetsRouter.delete("/:id", requireAuth, requireRole("ADMIN", "OPS_MANAGER"), async (req, res, next) => {
  try {
    await prisma.asset.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
