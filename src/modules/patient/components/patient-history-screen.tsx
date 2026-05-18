"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import {
  Alert,
  Box,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { SectionCard } from "@/modules/app-shell/components/section-card";
import { useAuth } from "@/modules/auth/auth-context";
import { getPatientProgressHistory } from "@/modules/patient/patient.api";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";
import type {
  PatientProgressHistory,
  PatientProgressHistoryDay,
} from "@/modules/shared/types/api";

const RANGE_QUERY_KEY = "range";
const METRIC_OPTIONS = [
  { key: "calories", label: "Calorias", color: "#12746b", goalColor: "#8bc2bb" },
  { key: "protein", label: "Proteína", color: "#de8a3d", goalColor: "#f1c089" },
  { key: "carbs", label: "Carboidratos", color: "#6ca7c4", goalColor: "#b7d7e7" },
  { key: "fat", label: "Gorduras", color: "#c95d52", goalColor: "#e9a59d" },
] as const;

type RangeOption = 7 | 30 | 90;
type MetricKey = (typeof METRIC_OPTIONS)[number]["key"];

function resolveRange(value: string | null): RangeOption {
  const parsed = Number(value);

  if (parsed === 7 || parsed === 30 || parsed === 90) {
    return parsed;
  }

  return 7;
}

function formatHistoryDate(date: string) {
  const [weekday, rest] = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${date}T00:00:00.000Z`))
    .split(", ");

  return `${weekday[0]?.toUpperCase() ?? ""}${weekday.slice(1)}, ${rest.replace(".", "")}`;
}

function formatCompactDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function formatMetricValue(metric: MetricKey, value: number) {
  if (metric === "calories") {
    return `${value} kcal`;
  }

  return `${value} g`;
}

function buildChartData(history: PatientProgressHistory["history"]) {
  return history.map((day) => ({
    date: day.date,
    shortDate: formatCompactDate(day.date),
    adherencePercentage: day.adherencePercentage,
    caloriesConsumed: day.calories.consumed,
    caloriesGoal: day.calories.goal,
    proteinConsumed: day.protein.consumed,
    proteinGoal: day.protein.goal,
    carbsConsumed: day.carbs.consumed,
    carbsGoal: day.carbs.goal,
    fatConsumed: day.fat.consumed,
    fatGoal: day.fat.goal,
  }));
}

function HistorySummaryCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <AppCard
      sx={{
        flex: 1,
        minWidth: 0,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,251,249,0.96) 100%)",
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          sx={{
            width: 48,
            height: 48,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            backgroundColor: "rgba(18, 116, 107, 0.10)",
          }}
        >
          {icon}
        </Stack>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h2">{value}</Typography>
        <Typography color="text.secondary">{helper}</Typography>
      </Stack>
    </AppCard>
  );
}

function HistoryLoadingState() {
  return (
    <Stack spacing={3}>
      <AppCard
        sx={{
          background:
            "linear-gradient(135deg, rgba(18, 116, 107, 0.12) 0%, rgba(108, 167, 196, 0.14) 100%)",
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="text" width="48%" height={48} />
          <Skeleton variant="text" width="62%" height={28} />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={128}
                sx={{ flex: 1, borderRadius: 6 }}
              />
            ))}
          </Stack>
        </Stack>
      </AppCard>
      <SectionCard title="Carregando histórico..." description="Estamos preparando sua evolução recente.">
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 6 }} />
      </SectionCard>
    </Stack>
  );
}

export function PatientHistoryScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const token = session?.token ?? "";
  const selectedRange = resolveRange(searchParams.get(RANGE_QUERY_KEY));
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("calories");

  useEffect(() => {
    if (searchParams.get(RANGE_QUERY_KEY) === String(selectedRange)) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set(RANGE_QUERY_KEY, String(selectedRange));
    router.replace(`${pathname}?${nextSearchParams.toString()}`);
  }, [pathname, router, searchParams, selectedRange]);

  const historyQuery = useQuery({
    queryKey: ["patient-progress-history", session?.user.id, selectedRange],
    enabled: Boolean(token && session?.user.id),
    queryFn: () => getPatientProgressHistory(selectedRange, { token }),
  });

  const chartData = useMemo(
    () => buildChartData(historyQuery.data?.history ?? []),
    [historyQuery.data?.history],
  );

  const selectedMetricConfig = METRIC_OPTIONS.find(
    (metric) => metric.key === selectedMetric,
  )!;

  const emptyHistory = historyQuery.data?.summary.daysTracked === 0;

  if (historyQuery.isLoading) {
    return <HistoryLoadingState />;
  }

  if (historyQuery.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar seu histórico."
        message={getErrorMessage(
          historyQuery.error,
          "Tente novamente em alguns instantes.",
        )}
        onRetry={() => void historyQuery.refetch()}
      />
    );
  }

  if (!historyQuery.data) {
    return (
      <ErrorState
        title="Não foi possível carregar seu histórico."
        message="Tente novamente em alguns instantes."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Histórico"
        title="Seu progresso"
        subtitle="Veja sua evolução ao longo do tempo."
      />

      <AppCard
        sx={{
          background:
            "linear-gradient(135deg, rgba(18, 116, 107, 0.12) 0%, rgba(108, 167, 196, 0.14) 100%)",
          position: "relative",
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="primary.dark">
              Resumo do período
            </Typography>
            <Typography variant="h2">Constância que vira resultado</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
              Acompanhe aderência, ritmo das refeições e a evolução dos seus macros
              com uma visão clara dos últimos {historyQuery.data.range} dias.
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <HistorySummaryCard
              icon={<TimelineRoundedIcon />}
              label="Aderência média"
              value={`${historyQuery.data.summary.averageAdherence}%`}
              helper="Média dos dias com progresso registrado."
            />
            <HistorySummaryCard
              icon={<RestaurantRoundedIcon />}
              label="Refeições concluídas"
              value={`${historyQuery.data.summary.completedMeals}/${historyQuery.data.summary.totalMeals}`}
              helper="Total concluído dentro do período selecionado."
            />
            <HistorySummaryCard
              icon={<QueryStatsRoundedIcon />}
              label="Dias acompanhados"
              value={String(historyQuery.data.summary.daysTracked)}
              helper="Dias com refeições ou macros registrados."
            />
          </Stack>
        </Stack>
      </AppCard>

      <SectionCard
        title="Período"
        description="Escolha a janela de análise que faz mais sentido para o seu momento."
      >
        <Tabs
          value={selectedRange}
          onChange={(_, nextValue: RangeOption) => {
            const nextSearchParams = new URLSearchParams(searchParams.toString());
            nextSearchParams.set(RANGE_QUERY_KEY, String(nextValue));
            router.replace(`${pathname}?${nextSearchParams.toString()}`);
          }}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-flexContainer": {
              gap: 1,
            },
            "& .MuiTab-root": {
              borderRadius: 999,
              minHeight: 48,
            },
          }}
        >
          <Tab value={7} label="7 dias" />
          <Tab value={30} label="30 dias" />
          <Tab value={90} label="90 dias" />
        </Tabs>
      </SectionCard>

      {emptyHistory ? (
        <EmptyState
          title="Nenhum histórico disponível"
          description="Comece registrando suas refeições para acompanhar sua evolução."
        />
      ) : (
        <>
          <SectionCard
            title="Evolução dos macros"
            description="Compare consumo e meta diária sem poluir a leitura do período."
            action={
              <ToggleButtonGroup
                exclusive
                value={selectedMetric}
                size="small"
                onChange={(_, nextValue: MetricKey | null) => {
                  if (nextValue) {
                    setSelectedMetric(nextValue);
                  }
                }}
              >
                {METRIC_OPTIONS.map((metric) => (
                  <ToggleButton key={metric.key} value={metric.key}>
                    {metric.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            }
          >
            <Box sx={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(18, 116, 107, 0.12)" />
                  <XAxis dataKey="shortDate" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={52} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "consumido") {
                        return [
                          formatMetricValue(selectedMetric, value),
                          "Consumido",
                        ];
                      }

                      return [formatMetricValue(selectedMetric, value), "Meta"];
                    }}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.date
                        ? formatHistoryDate(payload[0].payload.date)
                        : ""
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey={`${selectedMetric}Consumed`}
                    name="consumido"
                    stroke={selectedMetricConfig.color}
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={`${selectedMetric}Goal`}
                    name="meta"
                    stroke={selectedMetricConfig.goalColor}
                    strokeDasharray="6 6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>

          <SectionCard
            title="Tendência de aderência"
            description="Uma leitura simples para enxergar consistência ao longo dos dias."
          >
            <Box sx={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(18, 116, 107, 0.12)" />
                  <XAxis dataKey="shortDate" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Aderência"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.date
                        ? formatHistoryDate(payload[0].payload.date)
                        : ""
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="adherencePercentage"
                    stroke="#12746b"
                    strokeWidth={3}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>

          <SectionCard
            title="Resumo diário"
            description="Veja cada dia de forma objetiva, com metas, consumo e refeições concluídas."
          >
            <Box
              sx={{
                maxHeight: { xs: 480, md: 560 },
                overflowY: "auto",
                pr: { xs: 0.5, md: 1 },
              }}
            >
              <Stack spacing={1.5}>
                {historyQuery.data.history.map((day) => (
                  <DailyHistoryCard key={day.date} day={day} />
                ))}
              </Stack>
            </Box>
          </SectionCard>
        </>
      )}

      <Alert severity="info">
        A aderência combina metas de macros e refeições concluídas para oferecer uma
        visão simples da sua consistência.
      </Alert>
    </Stack>
  );
}

function DailyHistoryCard({ day }: { day: PatientProgressHistoryDay }) {
  return (
    <AppCard
      sx={{
        backgroundColor: "rgba(255,255,255,0.9)",
        flexShrink: 0,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
          }}
        >
          <div>
            <Typography variant="h3">{formatHistoryDate(day.date)}</Typography>
            <Typography color="text.secondary">
              {day.completedMeals} de {day.totalMeals} refeições concluídas
            </Typography>
          </div>
          <Box
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              backgroundColor: "rgba(18, 116, 107, 0.10)",
              color: "primary.dark",
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              {day.adherencePercentage}% de aderência
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          <MacroPill label="Calorias" value={`${day.calories.consumed}/${day.calories.goal} kcal`} />
          <MacroPill label="Proteína" value={`${day.protein.consumed}/${day.protein.goal} g`} />
          <MacroPill label="Carboidratos" value={`${day.carbs.consumed}/${day.carbs.goal} g`} />
          <MacroPill label="Gorduras" value={`${day.fat.consumed}/${day.fat.goal} g`} />
        </Stack>
      </Stack>
    </AppCard>
  );
}

function MacroPill({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 4,
        minWidth: { xs: "100%", sm: "calc(50% - 6px)", lg: "calc(25% - 9px)" },
        border: "1px solid rgba(18, 116, 107, 0.10)",
        backgroundColor: "rgba(246, 251, 249, 0.92)",
      }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ mt: 0.75, fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
