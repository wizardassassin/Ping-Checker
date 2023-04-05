-- CreateTable
CREATE TABLE "PingLog" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "ping" DOUBLE PRECISION,

    CONSTRAINT "PingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PingLog_time_address_key" ON "PingLog"("time", "address");
