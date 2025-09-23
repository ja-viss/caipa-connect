
'use client';

import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminChartsProps {
  studentsByArea: { name: string; studentCount: number }[];
  studentsByGender: { name: string; count: number }[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function AdminCharts({ studentsByArea, studentsByGender }: AdminChartsProps) {
  const isMobile = useIsMobile();
  const pieRadius = isMobile ? 60 : 80;
  
  const genderChartConfig = studentsByGender.reduce((acc, gender, index) => {
    acc[gender.name] = {
      label: gender.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);
  
  const areaChartConfig = studentsByArea.reduce((acc, area, index) => {
    acc[area.name] = {
      label: area.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estudiantes por Área</CardTitle>
          <CardDescription>
            Proporción de estudiantes en cada área de especialización.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={areaChartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                    data={studentsByArea}
                    dataKey="studentCount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={pieRadius}
                    labelLine={false}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          className="text-xs font-bold"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                >
                    {studentsByArea.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                 <Legend />
                </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estudiantes por Género</CardTitle>
          <CardDescription>
            Proporción de estudiantes masculinos y femeninos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={genderChartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                    data={studentsByGender}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={pieRadius}
                    labelLine={false}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          className="text-xs font-bold"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                >
                    {studentsByGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                 <Legend />
                </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
