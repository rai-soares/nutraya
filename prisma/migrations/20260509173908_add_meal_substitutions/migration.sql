-- CreateEnum
CREATE TYPE "MealSubstitutionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "MealSubstitution" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nutritionistId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "note" TEXT,
    "status" "MealSubstitutionStatus" NOT NULL DEFAULT 'PENDING',
    "nutritionistFeedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealSubstitution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealSubstitution_patientId_createdAt_idx" ON "MealSubstitution"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "MealSubstitution_nutritionistId_status_createdAt_idx" ON "MealSubstitution"("nutritionistId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MealSubstitution_mealId_idx" ON "MealSubstitution"("mealId");

-- AddForeignKey
ALTER TABLE "MealSubstitution" ADD CONSTRAINT "MealSubstitution_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealSubstitution" ADD CONSTRAINT "MealSubstitution_nutritionistId_fkey" FOREIGN KEY ("nutritionistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealSubstitution" ADD CONSTRAINT "MealSubstitution_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
