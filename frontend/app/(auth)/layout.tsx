import { cn } from '@/lib/utils';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decorative background for premium aesthetics */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-70" />
      <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 z-0 bg-primary/10 blur-3xl rounded-full" />

      {/* Content layer */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
