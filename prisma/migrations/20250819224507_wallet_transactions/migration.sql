/*
  Warnings:

  - You are about to drop the column `balance` on the `Wallet` table. All the data in the column will be lost.
  - Added the required column `crypto` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "crypto" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Wallet" DROP COLUMN "balance",
ADD COLUMN     "btcBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ethBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "piBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "usdtBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
