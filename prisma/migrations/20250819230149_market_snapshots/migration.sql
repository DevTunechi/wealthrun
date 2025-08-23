-- CreateTable
CREATE TABLE "public"."MarketSnapshot" (
    "id" SERIAL NOT NULL,
    "crypto" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);
