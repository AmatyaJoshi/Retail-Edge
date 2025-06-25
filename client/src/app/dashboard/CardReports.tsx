import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from 'react';

interface Buyer {
  rank: number;
  buyer: string;
  purchases: number;
  totalSpent: number;
}

const fetchBuyerRankingData = async (): Promise<Buyer[]> => {
  const response = await fetch('http://localhost:3001/api/customers/ranking');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

const productReturnData = [
  { product: 'Prescription Lenses', returns: 5, sales: 200, returnRate: 2.5 },
  { product: 'Sunglasses', returns: 10, sales: 300, returnRate: 3.3 },
  { product: 'Contact Lenses', returns: 2, sales: 150, returnRate: 1.3 },
  { product: 'Eyeglass Frames', returns: 8, sales: 250, returnRate: 3.2 },
  { product: 'Cleaning Kits', returns: 1, sales: 100, returnRate: 1.0 },
];

const salesByPaymentMethodData = [
  { name: 'Credit Card', value: 850000 },
  { name: 'UPI', value: 720000 },
  { name: 'Cash', value: 300000 },
  { name: 'Debit Card', value: 450000 },
];

const associatePerformanceData = [
  { associate: 'Ramesh', sales: 650000, customersServed: 120, avgRating: 4.8 },
  { associate: 'Priya', sales: 580000, customersServed: 100, avgRating: 4.5 },
  { associate: 'Suresh', sales: 720000, customersServed: 150, avgRating: 4.9 },
  { associate: 'Anita', sales: 400000, customersServed: 80, avgRating: 4.2 },
];

const lowStockProductsData = [
  { product: 'Blue Cut Lenses', currentStock: 15, reorderLevel: 20 },
  { product: 'Kids Frames (Plastic)', currentStock: 8, reorderLevel: 10 },
  { product: 'Anti-Glare Solution', currentStock: 25, reorderLevel: 30 },
  { product: 'Premium Contact Lens Solution', currentStock: 12, reorderLevel: 15 },
];

const customerFeedbackData = [
  { date: '2024-06-01', customer: 'Rajesh K.', rating: 5, feedback: 'Excellent service and variety of frames!' },
  { date: '2024-05-28', customer: 'Pooja S.', rating: 4, feedback: 'Good product, but delivery was a bit slow.' },
  { date: '2024-05-25', customer: 'Vikram D.', rating: 5, feedback: 'Very helpful staff, found the perfect pair.' },
  { date: '2024-05-20', customer: 'Neha L.', rating: 3, feedback: 'Lens quality is okay, expected better for the price.' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const formatIndianNumber = (num: number) => {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num}`;
};

export default function CardReports() {
  const [buyerRanking, setBuyerRanking] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getBuyerRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBuyerRankingData();
        setBuyerRanking(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getBuyerRanking();
  }, []);

  const getRowClassName = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-600 text-white font-bold'; // Darker Gold
      case 2:
        return 'bg-gray-600 text-white font-bold'; // Darker Silver
      case 3:
        return 'bg-orange-700 text-white font-bold'; // Darker Bronze (more coppery)
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Buyer Ranking by Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading buyer ranking...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">Error: {error}</div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto rounded-md border">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <TableRow>
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Purchases</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buyerRanking.map((row) => (
                      <TableRow key={row.rank} className={getRowClassName(row.rank)}>
                        <TableCell className="font-medium">{row.rank}</TableCell>
                        <TableCell>{row.buyer}</TableCell>
                        <TableCell>{row.purchases}</TableCell>
                        <TableCell className="text-right">{formatIndianNumber(row.totalSpent)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Return Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Returns</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Return Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productReturnData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.product}</TableCell>
                      <TableCell>{row.returns}</TableCell>
                      <TableCell>{row.sales}</TableCell>
                      <TableCell>{row.returnRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByPaymentMethodData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-right">{formatIndianNumber(row.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Associate Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Associate</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Customers Served</TableHead>
                    <TableHead>Avg. Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associatePerformanceData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.associate}</TableCell>
                      <TableCell>{formatIndianNumber(row.sales)}</TableCell>
                      <TableCell>{row.customersServed}</TableCell>
                      <TableCell>{row.avgRating.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProductsData.map((row, index) => (
                    <TableRow key={index} className={row.currentStock <= row.reorderLevel ? 'bg-red-50 dark:bg-red-900' : ''}>
                      <TableCell>{row.product}</TableCell>
                      <TableCell>{row.currentStock}</TableCell>
                      <TableCell>{row.reorderLevel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Feedback Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerFeedbackData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.customer}</TableCell>
                      <TableCell>{row.rating} / 5</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.feedback}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
} 