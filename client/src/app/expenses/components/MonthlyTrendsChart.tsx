"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for monthly trends (replace with real data as needed)
const data = [
	{ month: "Jan", expenses: 18000 },
	{ month: "Feb", expenses: 22000 },
	{ month: "Mar", expenses: 19500 },
	{ month: "Apr", expenses: 21000 },
	{ month: "May", expenses: 25000 },
	{ month: "Jun", expenses: 23000 },
];

export default function MonthlyTrendsChart() {
	return (
		<Card className="bg-white border border-border/30 shadow-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-medium">
					Monthly Expense Trends
				</CardTitle>
			</CardHeader>
			<CardContent className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip />
						<Line
							type="monotone"
							dataKey="expenses"
							stroke="#2563eb"
							strokeWidth={2}
							dot={{ r: 4 }}
							activeDot={{ r: 6 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
