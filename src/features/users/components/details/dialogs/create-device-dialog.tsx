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
import { ManagerCombobox } from '../../manager-combobox'
import { useCreateDevice } from '../../../hooks/user-details-mutations'
import type { DeviceTypeEnum } from '../../../api/user-details-api'

const DEVICE_TYPE_OPTIONS: { value: DeviceTypeEnum; label: string }[] = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'other', label: 'Other' },
]

interface CreateDeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (deviceId: string) => void
}

export function CreateDeviceDialog({ open, onOpenChange, onCreated }: CreateDeviceDialogProps) {
  const [deviceType, setDeviceType] = useState<DeviceTypeEnum>('laptop')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [assetId, setAssetId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchasedBy, setPurchasedBy] = useState<string | undefined>(undefined)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [warrantyMonths, setWarrantyMonths] = useState('')
  const [warrantyStart, setWarrantyStart] = useState('')
  const [warrantyEnd, setWarrantyEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createDevice = useCreateDevice()

  function reset() {
    setDeviceType('laptop')
    setBrand('')
    setModel('')
    setSerialNumber('')
    setAssetId('')
    setPurchaseDate('')
    setPurchasedBy(undefined)
    setPurchasePrice('')
    setWarrantyMonths('')
    setWarrantyStart('')
    setWarrantyEnd('')
    setNotes('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!model.trim()) {
      setError('Model is required.')
      return
    }
    if (!assetId.trim()) {
      setError('Asset ID is required. Do not invent one — use the real inventory tag.')
      return
    }

    setError(null)
    try {
      const created = await createDevice.mutateAsync({
        deviceType,
        brand: brand.trim() || null,
        model: model.trim(),
        serialNumber: serialNumber.trim() || null,
        assetId: assetId.trim(),
        purchaseDate: purchaseDate || null,
        purchasedBy: purchasedBy ?? null,
        purchasePrice: purchasePrice ? Number(purchasePrice) : null,
        warrantyDurationMonths: warrantyMonths ? Number(warrantyMonths) : null,
        warrantyStartDate: warrantyStart || null,
        warrantyEndDate: warrantyEnd || null,
        notes: notes.trim() || null,
      })
      reset()
      onOpenChange(false)
      onCreated?.(created.id)
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
        setError('A device with this Asset ID or Serial Number already exists in the inventory.')
      } else {
        setError('Failed to create device. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>
            Add a real hardware asset to the IT inventory. Only enter information you can verify —
            leave a field blank rather than guessing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Device Type</Label>
              <Select value={deviceType} onValueChange={(val) => setDeviceType((val as DeviceTypeEnum) ?? 'laptop')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="device-brand">Brand</Label>
              <Input id="device-brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Dell, Lenovo" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="device-model">Model *</Label>
              <Input id="device-model" value={model} onChange={(e) => setModel(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="device-asset-id">Asset ID *</Label>
              <Input id="device-asset-id" value={assetId} onChange={(e) => setAssetId(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="device-serial">Serial Number</Label>
            <Input id="device-serial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="device-purchase-date">Purchase Date</Label>
              <Input id="device-purchase-date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="device-purchase-price">Purchase Price</Label>
              <Input id="device-purchase-price" type="number" min="0" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Purchased By</Label>
            <ManagerCombobox value={purchasedBy} onChange={setPurchasedBy} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="device-warranty-months">Warranty (Months)</Label>
              <Input id="device-warranty-months" type="number" min="0" value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="device-warranty-start">Warranty Start</Label>
              <Input id="device-warranty-start" type="date" value={warrantyStart} onChange={(e) => setWarrantyStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="device-warranty-end">Warranty End</Label>
              <Input id="device-warranty-end" type="date" value={warrantyEnd} onChange={(e) => setWarrantyEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="device-notes">Notes (Optional)</Label>
            <Textarea id="device-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createDevice.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDevice.isPending}>
              {createDevice.isPending ? 'Registering…' : 'Register Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
