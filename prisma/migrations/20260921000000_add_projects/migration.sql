-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "projectId" TEXT;

-- Backfill: contas antes geridas via managedByUserId (modelo antigo de
-- "cliente") viram colaboradoras de um projeto padrão "Projeto 1", criado
-- automaticamente por dono que já tinha alguma conta gerida.
DO $$
DECLARE
  owner_row RECORD;
  new_project_id TEXT;
BEGIN
  FOR owner_row IN SELECT DISTINCT "managedByUserId" AS owner_id FROM "users" WHERE "managedByUserId" IS NOT NULL LOOP
    new_project_id := 'proj_' || substr(md5(random()::text || clock_timestamp()::text), 1, 20);
    INSERT INTO "projects" ("id", "name", "ownerId") VALUES (new_project_id, 'Projeto 1', owner_row.owner_id);
    UPDATE "users" SET "projectId" = new_project_id WHERE "managedByUserId" = owner_row.owner_id;
  END LOOP;
END $$;

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_managedByUserId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "managedByUserId";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
