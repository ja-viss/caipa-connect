'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
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

interface AdminChartsProps {
  studentsByArea: { name: string; studentCount: number }[];
  studentsByGender: { name: string; count: number }[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function AdminCharts({ studentsByArea, studentsByGender }: AdminChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estudiantes por Área</CardTitle>
          <CardDescription>
            Cantidad de estudiantes asignados a cada área de especialización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64">
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
                    className="text-sm"
                />
                <XAxis dataKey="studentCount" type="number" hide />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="studentCount" fill="hsl(var(--chart-1))" radius={4} />
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
                    outerRadius={80}
                    label
                >
                    {studentsByGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
