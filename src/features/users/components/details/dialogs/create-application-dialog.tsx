import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateApplication } from '../../../hooks/user-details-mutations'

interface CreateApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (applicationId: string) => void
}

export function CreateApplicationDialog({ open, onOpenChange, onCreated }: CreateApplicationDialogProps) {
  const [name, setName] = useState('')
  const [vendor, setVendor] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createApp = useCreateApplication()

  function reset() {
    setName('')
    setVendor('')
    setDescription('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Application name is required.')
      return
    }

    setError(null)
    try {
      const created = await createApp.mutateAsync({
        name: name.trim(),
        vendor: vendor.trim() || null,
        description: description.trim() || null,
      })
      reset()
      onOpenChange(false)
      onCreated?.(created.id)
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
        setError('An application with this name already exists in the catalog.')
      } else {
        setError('Failed to register application. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Application</DialogTitle>
          <DialogDescription>
            Add a real application to the catalog. Only enter information you can verify.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="app-name">Application Name *</Label>
            <Input id="app-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-vendor">Vendor</Label>
            <Input id="app-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-description">Description (Optional)</Label>
            <Textarea id="app-description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createApp.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createApp.isPending}>
              {createApp.isPending ? 'Registering…' : 'Register Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
