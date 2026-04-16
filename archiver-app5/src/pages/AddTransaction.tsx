import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, type TransactionType } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { cn } from '../lib/utils';

const CATEGORIES = {
  expense: ['Їжа', 'Транспорт', 'Комунальні', 'Навчання', 'Розваги', 'Покупки', 'Інше'],
  income: ['Зарплата', 'Стипендія', 'Подарунок', 'Пасивний дохід', 'Інше']
};

export default function AddTransaction() {
  const navigate = useNavigate();
  const addTransaction = useStore(state => state.addTransaction);

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES.expense[0]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !date || !category) return;

    addTransaction({
      title,
      amount: parseFloat(amount),
      date,
      type,
      category,
    });

    navigate('/transactions');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Додати операцію</h2>

      <Card>
        <CardHeader>
          <CardTitle>Новий запис</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={type === 'expense' ? 'destructive' : 'outline'}
                className={cn(
                  "flex-1 font-semibold",
                  type !== 'expense' && "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => handleTypeChange('expense')}
              >
                Витрата
              </Button>
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 font-semibold", 
                  type === 'income' 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => handleTypeChange('income')}
              >
                Дохід
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Назва</label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Наприклад: Продукти в Сільпо"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Сума (₴)</label>
                <Input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Дата</label>
                  <Input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Категорія</label>
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES[type].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Зберегти операцію
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
