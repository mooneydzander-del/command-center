import { redirect } from 'next/navigation'

// /agents was renamed to /workers
export default function AgentsRedirect() {
  redirect('/workers')
}
