import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    redirect('/signin')
  }
  
  redirect('/dashboard')
}
