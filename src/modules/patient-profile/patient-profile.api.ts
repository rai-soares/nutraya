import { apiClient } from "@/modules/shared/api/api-client";
import type { PatientProfileSummary } from "@/modules/shared/types/api";

type AuthOptions = {
  token: string;
};

export function getPatientProfileSummary(options: AuthOptions) {
  return apiClient.get<PatientProfileSummary>("/api/patient/profile", options);
}
