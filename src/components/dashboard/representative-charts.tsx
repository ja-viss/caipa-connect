'use client';

import { Line, LineChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ActivityLog } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RepresentativeChartsProps {
  activityLogs: ActivityLog[];
}

const chartConfig = {
  activities: {
    label: "Actividades",
    color: "hsl(var(--chart-1))",
  },
};

export function RepresentativeCharts({ activityLogs }: RepresentativeChartsProps) {
  const chartData = activityLogs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => ({
      date: format(new Date(log.date), 'dd MMM', { locale: es }),
      activities: 1, // Count each log as one activity
    }));

  // Aggregate activities by date
  const aggregatedData = chartData.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
      existing.activities += 1;
    } else {
      acc.push({ date: curr.date, activities: 1 });
    }
    return acc;
  }, [] as { date: string; activities: number }[]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Actividad Semanal</CardTitle>
        <CardDescription>
          Número de registros de actividad en los últimos 7 días.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={aggregatedData}
              margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line
                type="monotone"
                dataKey="activities"
                stroke="var(--color-activities)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-activities)",
                }}
                name="Actividades"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
