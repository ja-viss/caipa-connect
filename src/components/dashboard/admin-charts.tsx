'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminChartsProps {
  studentsByArea: { name: string; studentCount: number }[];
  studentsByGender: { name: string; count: number }[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
const CHART_CONFIG = {
  studentCount: {
    label: "Estudiantes",
    color: "hsl(var(--chart-1))",
  },
}

export function AdminCharts({ studentsByArea, studentsByGender }: AdminChartsProps) {
  const isMobile = useIsMobile();
  const pieRadius = isMobile ? 60 : 80;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estudiantes por Área</CardTitle>
          <CardDescription>
            Cantidad de estudiantes asignados a cada área de especialización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={CHART_CONFIG} className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={studentsByArea}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
                >
                <CartesianGrid horizontal={false} />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={80}
                    className="text-xs"
                />
                <XAxis dataKey="studentCount" type="number" hide />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="studentCount" fill="var(--color-studentCount)" radius={4}>
                   {studentsByArea.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
                </BarChart>
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
          <ChartContainer config={{}} className="h-64">
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
    </div>
  );
}
