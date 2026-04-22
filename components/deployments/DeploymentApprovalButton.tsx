'use client'

import { useState, useTransition } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export function DeploymentApprovalButton({ deploymentId }: { deploymentId: string }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handle = async (action: 'approved' | 'rejected') => {
    await fetch(`/api/deployments/${deploymentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalState: action, approvedBy: 'user' }),
    })
    setDone(true)
    startTransition(() => router.refresh())
  }

  if (done) return <span className="text-xs text-muted">Processing…</span>

  return (
    <div className="flex gap-2">
      <Button variant="danger" size="sm" loading={isPending} onClick={() => handle('rejected')}>
        Reject
      </Button>
      <Button variant="primary" size="sm" loading={isPending} icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => handle('approved')}>
        Approve
      </Button>
    </div>
  )
}
