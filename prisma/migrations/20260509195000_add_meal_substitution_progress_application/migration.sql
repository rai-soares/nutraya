ALTER TABLE "MealSubstitution"
ADD COLUMN "appliedToDailyLog" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "appliedAt" TIMESTAMP(3),
ADD COLUMN "appliedByUserId" TEXT,
ADD COLUMN "appliedDailyLogId" TEXT,
ADD COLUMN "applicationDate" DATE;

ALTER TABLE "MealSubstitution"
ADD CONSTRAINT "MealSubstitution_appliedByUserId_fkey"
FOREIGN KEY ("appliedByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MealSubstitution"
ADD CONSTRAINT "MealSubstitution_appliedDailyLogId_fkey"
FOREIGN KEY ("appliedDailyLogId") REFERENCES "DailyMacroLog"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "MealSubstitution_appliedDailyLogId_idx"
ON "MealSubstitution"("appliedDailyLogId");

CREATE INDEX "MealSubstitution_applicationDate_idx"
ON "MealSubstitution"("applicationDate");
