import { Suspense } from 'react'
import { AppShell } from '@/components/app-shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {/* Pages read the query string with useSearchParams, which needs a Suspense boundary */}
      <Suspense>{children}</Suspense>
    </AppShell>
  )
}
