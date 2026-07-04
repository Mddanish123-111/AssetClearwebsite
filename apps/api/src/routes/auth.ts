import { Router } from "express";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "@assetclear/db";
import { env } from "../lib/env";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) throw new ApiError(401, "Invalid email or password");

    const valid = await compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid email or password");

    const token = jwt.sign(
      { sub: user.id, role: user.role, clientId: user.clientId },
      env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.sub } });
    if (!user) throw new ApiError(404, "User not found");
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
});
