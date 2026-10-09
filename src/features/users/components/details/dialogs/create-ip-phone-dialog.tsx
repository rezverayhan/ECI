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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDepartments } from '../../../hooks/users-queries'
import { useCreateIpPhone } from '../../../hooks/user-details-mutations'

interface CreateIpPhoneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (ipPhoneId: string) => void
}

export function CreateIpPhoneDialog({ open, onOpenChange, onCreated }: CreateIpPhoneDialogProps) {
  const { data: departments = [] } = useDepartments()
  const [extension, setExtension] = useState('')
  const [phoneType, setPhoneType] = useState('')
  const [departmentId, setDepartmentId] = useState<string>('')
  const [ipAddress, setIpAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createPhone = useCreateIpPhone()

  function reset() {
    setExtension('')
    setPhoneType('')
    setDepartmentId('')
    setIpAddress('')
    setNotes('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!extension.trim()) {
      setError('Extension is required. Do not invent one — use the real assigned extension number.')
      return
    }

    setError(null)
    try {
      const created = await createPhone.mutateAsync({
        extension: extension.trim(),
        phoneType: phoneType.trim() || null,
        departmentId: departmentId || null,
        ipAddress: ipAddress.trim() || null,
        notes: notes.trim() || null,
      })
      reset()
      onOpenChange(false)
      onCreated?.(created.id)
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
        setError('An IP Phone with this extension already exists in the catalog.')
      } else {
        setError('Failed to register the extension. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register IP Phone Extension</DialogTitle>
          <DialogDescription>
            Add a real extension to the catalog. Only enter the actual assigned extension number —
            never invent one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone-extension">Extension *</Label>
            <Input id="phone-extension" value={extension} onChange={(e) => setExtension(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone-type">Phone Type</Label>
              <Input id="phone-type" value={phoneType} onChange={(e) => setPhoneType(e.target.value)} placeholder="e.g. VoIP Desktop Phone" />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={(val) => setDepartmentId(val ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone-ip">Phone IP Address (Optional)</Label>
            <Input id="phone-ip" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} placeholder="e.g. 10.200.198.50" className="font-mono" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone-notes">Notes (Optional)</Label>
            <Textarea id="phone-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createPhone.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPhone.isPending}>
              {createPhone.isPending ? 'Registering…' : 'Register Extension'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
