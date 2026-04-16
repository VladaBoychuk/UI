import { useStore, calculateSummary } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

export default function Dashboard() {
  const transactions = useStore(state => state.transactions);
  const summary = useMemo(() => calculateSummary(transactions), [transactions]);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Огляд</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Баланс</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", summary.balance >= 0 ? "" : "text-destructive")}>
              {summary.balance.toLocaleString('uk-UA', { style: 'currency', currency: 'UAH' })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Доходи</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              +{summary.income.toLocaleString('uk-UA', { style: 'currency', currency: 'UAH' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Витрати</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -{summary.expense.toLocaleString('uk-UA', { style: 'currency', currency: 'UAH' })}
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">Останні операції</h3>
      <Card>
        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <p>Немає записів.</p>
              <Link to="/add" className="text-primary mt-2 hover:underline">Додати першу операцію</Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{t.category} • {new Date(t.date).toLocaleDateString('uk-UA')}</p>
                  </div>
                  <div className={cn("font-semibold", t.type === 'income' ? 'text-emerald-500' : '')}>
                    {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('uk-UA', { style: 'currency', currency: 'UAH' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
