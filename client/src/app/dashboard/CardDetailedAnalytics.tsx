import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Treemap,
  Rectangle,
} from "recharts";
import { formatIndianNumber } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const salesData = [
  { name: 'Jan', value: 450000 },
  { name: 'Feb', value: 380000 },
  { name: 'Mar', value: 520000 },
  { name: 'Apr', value: 478000 },
  { name: 'May', value: 389000 },
  { name: 'Jun', value: 539000 },
];

const categoryData = [
  { name: 'Sunglasses', value: 450000 },
  { name: 'Contact Lenses', value: 320000 },
  { name: 'Frames', value: 280000 },
  { name: 'Accessories', value: 150000 },
];

const performanceData = [
  { name: 'Mon', sales: 45000, orders: 24 },
  { name: 'Tue', sales: 38000, orders: 18 },
  { name: 'Wed', sales: 52000, orders: 32 },
  { name: 'Thu', sales: 47800, orders: 28 },
  { name: 'Fri', sales: 38900, orders: 19 },
  { name: 'Sat', sales: 53900, orders: 35 },
  { name: 'Sun', sales: 42900, orders: 22 },
];

const scatterData = [
  { x: 1500, y: 2, z: 3000, category: 'Sunglasses' },
  { x: 1200, y: 1, z: 2600, category: 'Prescription' },
  { x: 1700, y: 3, z: 4000, category: 'Contact Lenses' },
  { x: 1400, y: 2, z: 2800, category: 'Frames' },
  { x: 1500, y: 4, z: 5000, category: 'Sunglasses' },
  { x: 1100, y: 2, z: 2000, category: 'Accessories' },
];

const histogramData = [
  { range: '0-1000', count: 8 },
  { range: '1000-2000', count: 12 },
  { range: '2000-3000', count: 15 },
  { range: '3000-4000', count: 10 },
  { range: '4000-5000', count: 5 },
];

const areaData = [
  { name: 'Jan', sales: 450000, profit: 240000 },
  { name: 'Feb', sales: 380000, profit: 198000 },
  { name: 'Mar', sales: 520000, profit: 280000 },
  { name: 'Apr', sales: 478000, profit: 258000 },
  { name: 'May', sales: 389000, profit: 209000 },
  { name: 'Jun', sales: 539000, profit: 289000 },
];

const radarData = [
  { subject: 'Sunglasses', A: 120, B: 110, fullMark: 150 },
  { subject: 'Prescription', A: 98, B: 130, fullMark: 150 },
  { subject: 'Contact Lenses', A: 86, B: 130, fullMark: 150 },
  { subject: 'Frames', A: 99, B: 100, fullMark: 150 },
  { subject: 'Accessories', A: 85, B: 90, fullMark: 150 },
];

const composedData = [
  { name: 'Jan', sales: 450000, profit: 240000, orders: 180 },
  { name: 'Feb', sales: 380000, profit: 198000, orders: 150 },
  { name: 'Mar', sales: 520000, profit: 280000, orders: 210 },
  { name: 'Apr', sales: 478000, profit: 258000, orders: 190 },
  { name: 'May', sales: 389000, profit: 209000, orders: 160 },
  { name: 'Jun', sales: 539000, profit: 289000, orders: 220 },
];

const productSalesData = [
  { name: 'Jan', 'Sunglasses': 150000, 'Prescription': 200000, 'Contact Lenses': 80000, 'Frames': 50000 },
  { name: 'Feb', 'Sunglasses': 120000, 'Prescription': 180000, 'Contact Lenses': 70000, 'Frames': 40000 },
  { name: 'Mar', 'Sunglasses': 180000, 'Prescription': 250000, 'Contact Lenses': 90000, 'Frames': 60000 },
  { name: 'Apr', 'Sunglasses': 160000, 'Prescription': 220000, 'Contact Lenses': 85000, 'Frames': 55000 },
  { name: 'May', 'Sunglasses': 130000, 'Prescription': 190000, 'Contact Lenses': 75000, 'Frames': 45000 },
  { name: 'Jun', 'Sunglasses': 190000, 'Prescription': 260000, 'Contact Lenses': 95000, 'Frames': 70000 },
];

const topProductsData = [
  { name: 'Ray-Ban Wayfarer', sales: 85, fill: '#8884d8' },
  { name: 'Lenskart AirFlex', sales: 75, fill: '#83a6ed' },
  { name: 'Titan Eye+', sales: 60, fill: '#8dd1e1' },
  { name: 'Fastrack', sales: 50, fill: '#82ca9d' },
  { name: 'Bausch & Lomb', sales: 40, fill: '#a4de6c' },
];

const salesByRegionData = [
  {
    name: 'North India',
    children: [
      { name: 'Delhi', value: 300000, fill: COLORS[0] },
      { name: 'Haryana', value: 200000, fill: COLORS[1] },
      { name: 'Punjab', value: 150000, fill: COLORS[2] },
    ],
  },
  {
    name: 'West India',
    children: [
      { name: 'Maharashtra', value: 400000, fill: COLORS[3] },
      { name: 'Gujarat', value: 250000, fill: COLORS[4] },
    ],
  },
  {
    name: 'South India',
    children: [
      { name: 'Karnataka', value: 350000, fill: COLORS[5] },
      { name: 'Tamil Nadu', value: 280000, fill: COLORS[0] },
    ],
  },
  {
    name: 'East India',
    children: [
      { name: 'West Bengal', value: 180000, fill: COLORS[1] },
      { name: 'Odisha', value: 100000, fill: COLORS[2] },
    ],
  },
];

const ageDistributionData = [
  { ageGroup: '18-24', customers: 120 },
  { ageGroup: '25-34', customers: 250 },
  { ageGroup: '35-44', customers: 180 },
  { ageGroup: '45-54', customers: 90 },
  { ageGroup: '55+', customers: 50 },
];

const CustomizedTreemapContent = (props: any) => {
  const { depth, x, y, width, height, index, name, value, colors } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[index % colors.length] : 'none',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1),
        }}
      />
      {
        depth === 1 ? (
          <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
            {name}
          </text>
        ) : null
      }
      {
        depth === 2 ? (
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={12}>
            {name}
          </text>
        ) : null
      }
    </g>
  );
};

export default function CardDetailedAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-2 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Monthly Sales Performance</CardTitle>
          </CardHeader>
          <CardContent className="bg-gray-50 dark:bg-[#232e41]">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatIndianNumber(value as number)} />
                  <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="profit" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Product Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatIndianNumber(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Order Value Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Product Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" name="Price" label={{ value: 'Price (₹)', position: 'insideBottomRight', offset: 0 }} />
                  <YAxis type="number" dataKey="y" name="Quantity" label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }} />
                  <ZAxis type="number" dataKey="z" range={[100, 600]} name="Revenue" />
                  <Tooltip formatter={(value) => formatIndianNumber(value as number)} />
                  <Legend />
                  <Scatter name="Sunglasses" data={scatterData.filter(d => d.category === 'Sunglasses')} fill="#8884d8" />
                  <Scatter name="Prescription" data={scatterData.filter(d => d.category === 'Prescription')} fill="#00C49F" />
                  <Scatter name="Contact Lenses" data={scatterData.filter(d => d.category === 'Contact Lenses')} fill="#FFBB28" />
                  <Scatter name="Frames" data={scatterData.filter(d => d.category === 'Frames')} fill="#FF8042" />
                  <Scatter name="Accessories" data={scatterData.filter(d => d.category === 'Accessories')} fill="#a4de6c" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Category-wise Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatIndianNumber(value as number)} />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Daily Sales & Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatIndianNumber(value as number)} />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Category Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="Sales" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="Orders" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Sales by Product Type Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productSalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatIndianNumber(value as number)} />
                  <Legend />
                  <Bar dataKey="Sunglasses" stackId="a" fill="#0088FE" />
                  <Bar dataKey="Prescription" stackId="a" fill="#00C49F" />
                  <Bar dataKey="Contact Lenses" stackId="a" fill="#FFBB28" />
                  <Bar dataKey="Frames" stackId="a" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Monthly Business Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={composedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatIndianNumber(value as number)} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
                  <Bar dataKey="orders" fill="#82ca9d" />
                  <Line type="monotone" dataKey="profit" stroke="#ff7300" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" barSize={18} radius={[8, 8, 8, 8]} label={{ position: 'right', fill: '#fff' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Sales by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={salesByRegionData}
                  dataKey="value"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                  content={<CustomizedTreemapContent colors={COLORS} />}
                />
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 bg-white dark:bg-[#232e41]">
          <CardHeader>
            <CardTitle>Customer Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="customers" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 