export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/auth-bg.png"
            alt="Authentication Background"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-zinc-950/40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-transparent via-zinc-950/80 to-zinc-950/90" />
        </div>
        <div className="relative z-20 flex items-center text-xl font-bold gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary overflow-hidden">
            <img
              src="/icon-192x192.png"
              alt="Noteqo Logo"
              className="w-full h-full object-cover"
            />
          </div>
          Noteqo
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Noteqo has fundamentally changed how I organize my
              thoughts. The end-to-end encryption gives me complete peace of
              mind.&rdquo;
            </p>
            <footer className="text-sm font-medium text-muted-foreground">
              — Secure Workspace User
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 flex items-center justify-center h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Mobile-only logo */}
          <div className="flex items-center justify-center gap-2 font-bold text-2xl lg:hidden mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary overflow-hidden">
              <img
                src="/icon-192x192.png"
                alt="Noteqo Logo"
                className="w-full h-full object-cover"
              />
            </div>
            Noteqo
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
