import { BottomNav } from '@/components/ui/BottomNav';

export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col">
      {children}
      <BottomNav />
    </div>
  );
}
