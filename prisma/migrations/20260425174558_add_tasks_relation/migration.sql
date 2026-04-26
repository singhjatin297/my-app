/*
  Warnings:

  - Added the required column `authorEmail` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "authorEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_authorEmail_fkey" FOREIGN KEY ("authorEmail") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
