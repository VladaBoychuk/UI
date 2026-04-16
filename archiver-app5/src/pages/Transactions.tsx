import { useMemo, useState } from 'react';
import { useStore, type TransactionType } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Trash2Icon } from 'lucide-react';
import { cn } from '../lib/utils';

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function Transactions() {
  const transactions = useStore(state => state.transactions);
  const removeTransaction = useStore(state => state.removeTransaction);

  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Отримуємо унікальні категорії та місяці для фільтрів
  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.category)));
  }, [transactions]);

  const months = useMemo(() => {
    const m = new Set(transactions.map(t => t.date.substring(0, 7))); // "YYYY-MM"
    return Array.from(m).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }
    if (filterCategory !== 'all') {
      result = result.filter(t => t.category === filterCategory);
    }
    if (filterMonth !== 'all') {
      result = result.filter(t => t.date.startsWith(filterMonth));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, filterType, filterCategory, filterMonth, sortBy]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Усі операції</h2>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Фільтри та Сортування</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Тип</label>
              <Select value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                <option value="all">Всі типи</option>
                <option value="expense">Витрати</option>
                <option value="income">Доходи</option>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Категорія</label>
              <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">Всі категорії</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Місяць</label>
              <Select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                <option value="all">Усі часи</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Сортування</label>
              <Select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
                <option value="date-desc">Спершу нові</option>
                <option value="date-asc">Спершу старі</option>
                <option value="amount-desc">За сумою (спадання)</option>
                <option value="amount-asc">За сумою (зростання)</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>Операцій не знайдено.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAndSortedTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
                  <div className="flex-1">
                    <p className="font-medium text-base">{t.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <span className="font-medium">{t.category}</span> • {new Date(t.date).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={cn("font-semibold whitespace-nowrap text-right", t.type === 'income' ? 'text-emerald-500' : '')}>
                      {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('uk-UA', { style: 'currency', currency: 'UAH' })}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                      onClick={() => removeTransaction(t.id)}
                      title="Видалити"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
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
