import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Home, Salad, Dumbbell } from 'lucide-react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <span className="font-bold text-gray-900">Fit Log</span>
          <form action={signOut}>
            <button type="submit" className="text-xs text-gray-400 hover:text-gray-600">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-around px-4">
          <NavItem href="/dashboard" icon={<Home size={20} />} label="홈" />
          <NavItem href="/diet" icon={<Salad size={20} />} label="식단" />
          <NavItem href="/exercise" icon={<Dumbbell size={20} />} label="운동" />
        </div>
      </nav>
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  )
}
