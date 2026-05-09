import { AppLayout } from "@/modules/app-shell/components/app-layout";
import { PageContainer } from "@/modules/app-shell/components/page-container";
import { ProtectedRoute } from "@/modules/app-shell/components/protected-route";
import { NutritionistPatientDetailScreen } from "@/modules/nutritionist/components/nutritionist-patient-detail-screen";

type NutritionistPatientDetailPageProps = {
  params: Promise<{
    patientId: string;
  }>;
};

export default async function NutritionistPatientDetailPage({
  params,
}: NutritionistPatientDetailPageProps) {
  const { patientId } = await params;

  return (
    <ProtectedRoute allowedRoles={["NUTRI"]}>
      <AppLayout role="NUTRI" title="Patient setup">
        <PageContainer>
          <NutritionistPatientDetailScreen patientId={patientId} />
        </PageContainer>
      </AppLayout>
    </ProtectedRoute>
  );
}
