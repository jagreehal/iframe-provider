import { getSessionInSteps } from '@/lib/auth';

// import { SidebarNav } from '@/components/embedded/sidebar-nav';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await getSessionInSteps();
  if (!result.success) {
    return <div>{result.message}</div>;
  }
  const session = result.decrypted;
  if (!session) {
    return <div>No session</div>;
  }
  if (!session.clientId) {
    return <div>No client ID</div>;
  }

  return <>{children}</>;
}
