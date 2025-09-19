-- AlterTable
ALTER TABLE "domains" ADD COLUMN "vercelDomainId" TEXT;
ALTER TABLE "domains" ADD COLUMN "vercelProjectId" TEXT;
ALTER TABLE "domains" ADD COLUMN "verificationHost" TEXT;
ALTER TABLE "domains" ADD COLUMN "verificationRecord" TEXT;
ALTER TABLE "domains" ADD COLUMN "verificationTxt" TEXT;
