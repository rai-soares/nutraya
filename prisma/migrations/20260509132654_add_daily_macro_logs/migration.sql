-- CreateTable
CREATE TABLE "DailyMacroLog" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "caloriesConsumed" INTEGER NOT NULL,
    "proteinConsumed" INTEGER NOT NULL,
    "carbsConsumed" INTEGER NOT NULL,
    "fatConsumed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMacroLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyMacroLog_patientId_date_key" ON "DailyMacroLog"("patientId", "date");

-- AddForeignKey
ALTER TABLE "DailyMacroLog" ADD CONSTRAINT "DailyMacroLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
