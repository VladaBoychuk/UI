import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, ListOrdered, PlusCircle, PieChart, Wallet, Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore, calculateSummary } from '../../store/useStore';
import { useMemo } from 'react';

const navItems = [
  { icon: Home, label: 'Головна', path: '/' },
  { icon: ListOrdered, label: 'Операції', path: '/transactions' },
  { icon: PlusCircle, label: 'Додати', path: '/add' },
  { icon: PieChart, label: 'Статистика', path: '/statistics' },
];

export function Layout() {
  const location = useLocation();
  const transactions = useStore(state => state.transactions);
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const balance = useMemo(() => calculateSummary(transactions).balance, [transactions]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col md:min-h-screen">
        <div className="p-6 md:p-8 flex items-center gap-3 border-b border-border">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">MoneyTrack</h1>
            <p className="text-xs text-muted-foreground font-medium">Ваш бюджет</p>
          </div>
        </div>
        
        <div className="px-6 py-4 md:hidden flex justify-between items-center border-b border-border bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">Поточний баланс</span>
          <span className={cn("text-lg font-bold", balance >= 0 ? "text-emerald-500" : "text-destructive")}>
            {balance.toLocaleString('uk-UA', { style: 'currency', currency: 'UAH' })}
          </span>
        </div>

        <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap md:whitespace-normal",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border mt-auto hidden md:block">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Світла тема' : 'Темна тема'}
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
