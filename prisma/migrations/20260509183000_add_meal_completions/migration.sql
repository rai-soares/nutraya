CREATE TABLE "MealCompletion" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MealCompletion_patientId_mealId_date_key" ON "MealCompletion"("patientId", "mealId", "date");
CREATE INDEX "MealCompletion_patientId_date_idx" ON "MealCompletion"("patientId", "date");
CREATE INDEX "MealCompletion_mealId_idx" ON "MealCompletion"("mealId");

ALTER TABLE "MealCompletion" ADD CONSTRAINT "MealCompletion_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MealCompletion" ADD CONSTRAINT "MealCompletion_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
