-- CreateEnum
CREATE TYPE "MealMacroConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "MealSubstitution" ADD COLUMN     "aiNotes" TEXT,
ADD COLUMN     "confidence" "MealMacroConfidence",
ADD COLUMN     "estimatedAt" TIMESTAMP(3),
ADD COLUMN     "estimatedCalories" INTEGER,
ADD COLUMN     "estimatedCarbs" INTEGER,
ADD COLUMN     "estimatedFat" INTEGER,
ADD COLUMN     "estimatedFoods" JSONB,
ADD COLUMN     "estimatedProtein" INTEGER,
ADD COLUMN     "portionEstimate" TEXT;
