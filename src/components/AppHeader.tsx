import { Link, useRouterState } from "@tanstack/react-router";

export function AppHeader() {
  const { location } = useRouterState();
  const path = location.pathname;

  const navItems = [
    { to: "/receitas", label: "receitas" },
    { to: "/minhas-receitas", label: "minhas receitas" },
    { to: "/minha-despensa", label: "minha despensa" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-charcoal/85 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 grid grid-cols-3 items-center">
        <Link to="/" className="font-display italic text-2xl text-blush tracking-tight font-mono">
          receitahub
        </Link>

        <nav className="flex items-center justify-center gap-10">
          {navItems.map((item) => {
            const active = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative text-sm transition ${
                  active ? "text-blush" : "text-cream/70 hover:text-cream"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-blush" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-6 text-sm">
          <button className="text-cream/70 hover:text-cream transition">logar</button>
          <button className="text-blush hover:text-blush-deep transition italic font-display">
            cadastrar
          </button>
        </div>
      </div>
    </header>
  );
}
