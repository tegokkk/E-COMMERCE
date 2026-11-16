export const metadata = {
  title: 'Panel Pengelolaan — KonterKuota Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({ children }) {
  return <div className="min-h-screen bg-transparent text-content">{children}</div>;
}

