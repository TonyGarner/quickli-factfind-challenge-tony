import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // Simple redirect for demo
    const isAuthed = typeof document !== 'undefined' && document.cookie.includes('demo-auth=true');
    router.replace(isAuthed ? '/dashboard' : '/login');
  }, [router]);
  return null;
}
