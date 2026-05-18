import { apiClient } from "@/modules/shared/api/api-client";
import type { PatientProgressHistory } from "@/modules/shared/types/api";

type AuthOptions = {
  token: string;
};

export function getPatientProgressHistory(
  range: 7 | 30 | 90,
  options: AuthOptions,
) {
  return apiClient.get<PatientProgressHistory>(
    `/api/patient/progress-history?range=${range}`,
    options,
  );
}
