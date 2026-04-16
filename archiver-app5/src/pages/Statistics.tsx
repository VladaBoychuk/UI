import { useMemo } from 'react';
import { useStore, calculateSummary } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#aa3bff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Statistics() {
  const transactions = useStore(state => state.transactions);
  
  const summary = useMemo(() => calculateSummary(transactions), [transactions]);

  // Підготовка даних для кругової діаграми (Витрати за категоріями)
  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const topCategory = expenseByCategory.length > 0 ? expenseByCategory[0].name : 'Немає даних';

  // Підготовка даних для графіку по місяцях (Доходи vs Витрати)
  const monthlyData = useMemo(() => {
    const grouped = transactions.reduce((acc, curr) => {
      const month = curr.date.substring(0, 7); // Формат: YYYY-MM
      if (!acc[month]) {
        acc[month] = { name: month, income: 0, expense: 0 };
      }
      if (curr.type === 'income') acc[month].income += curr.amount;
      else acc[month].expense += curr.amount;
      
      return acc;
    }, {} as Record<string, { name: string, income: number, expense: number }>);

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  // Форматування сум
  const formatUAH = (value: number) => 
    new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(value);

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Статистика</h2>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <p>Немає даних для відображення графіків. Додайте спочатку свої операції.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Статистика</h2>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Баланс</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold">{formatUAH(summary.balance)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Доходи</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold text-emerald-500">+{formatUAH(summary.income)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Витрати</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold text-destructive">-{formatUAH(summary.expense)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Найбільша категорія (Витрат)</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold">{topCategory}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Структура витрат</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex min-h-[300px]">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="m-auto text-muted-foreground">Немає витрат для аналізу</div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Доходи vs Витрати (по місяцях)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `${value / 1000}k`} 
                  width={40}
                />
                <Legend />
                <Bar dataKey="income" name="Дохід" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Витрата" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
