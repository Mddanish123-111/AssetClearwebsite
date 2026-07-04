import { PrismaClient, Role, JobStatus, AssetCategory, AssetCondition, Disposition } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("ChangeMe123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@assetclear.io",
      passwordHash,
      firstName: "Dana",
      lastName: "Reyes",
      role: Role.ADMIN,
    },
  });

  const opsManager = await prisma.user.create({
    data: {
      email: "ops@assetclear.io",
      passwordHash,
      firstName: "Marcus",
      lastName: "Okafor",
      role: Role.OPS_MANAGER,
    },
  });

  const crew1 = await prisma.user.create({
    data: {
      email: "crew1@assetclear.io",
      passwordHash,
      firstName: "Lena",
      lastName: "Vogt",
      role: Role.CREW,
    },
  });

  const client = await prisma.client.create({
    data: {
      companyName: "Northbridge Financial",
      billingEmail: "ap@northbridgefinancial.com",
      billingAddress: "400 Market St, Suite 900, San Francisco, CA",
      contacts: {
        create: [{ name: "Priya Anand", email: "priya@northbridgefinancial.com", title: "Facilities Director" }],
      },
    },
  });

  const job = await prisma.job.create({
    data: {
      jobNumber: "AC-2026-0001",
      clientId: client.id,
      siteAddress: "400 Market St, Floor 12, San Francisco, CA",
      status: JobStatus.IN_PROGRESS,
      scheduledStart: new Date("2026-07-08T08:00:00Z"),
      scheduledEnd: new Date("2026-07-10T17:00:00Z"),
      leadId: opsManager.id,
      crew: { create: [{ userId: crew1.id, role: "Lead Dismantler" }] },
      statusHistory: {
        create: [
          { status: JobStatus.QUOTED, note: "Initial walkthrough completed" },
          { status: JobStatus.SCHEDULED, note: "Client approved quote" },
          { status: JobStatus.IN_PROGRESS, note: "Crew on site" },
        ],
      },
    },
  });

  await prisma.asset.createMany({
    data: [
      {
        assetTag: "AC-A0001",
        jobId: job.id,
        category: AssetCategory.FURNITURE,
        description: "Herman Miller Aeron chairs (x24)",
        condition: AssetCondition.GOOD,
        disposition: Disposition.RESELL,
        estimatedValue: 4800,
      },
      {
        assetTag: "AC-A0002",
        jobId: job.id,
        category: AssetCategory.IT_EQUIPMENT,
        description: "Dell OptiPlex desktops (x18)",
        condition: AssetCondition.FAIR,
        disposition: Disposition.DATA_DESTRUCTION,
        estimatedValue: 900,
      },
      {
        assetTag: "AC-A0003",
        jobId: job.id,
        category: AssetCategory.FIXTURE,
        description: "Conference room glass partition wall",
        condition: AssetCondition.EXCELLENT,
        disposition: Disposition.PENDING,
      },
    ],
  });

  console.log("Seed complete.");
  console.log({ admin: admin.email, opsManager: opsManager.email, crew1: crew1.email, job: job.jobNumber });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
