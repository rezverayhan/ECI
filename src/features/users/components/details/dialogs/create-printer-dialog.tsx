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
import { ManagerCombobox } from '../../manager-combobox'
import { useCreatePrinter } from '../../../hooks/user-details-mutations'

interface CreatePrinterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (printerId: string) => void
}

export function CreatePrinterDialog({ open, onOpenChange, onCreated }: CreatePrinterDialogProps) {
  const [printerName, setPrinterName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [assetId, setAssetId] = useState('')
  const [printerType, setPrinterType] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchasedBy, setPurchasedBy] = useState<string | undefined>(undefined)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [warrantyMonths, setWarrantyMonths] = useState('')
  const [warrantyStart, setWarrantyStart] = useState('')
  const [warrantyEnd, setWarrantyEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createPrinter = useCreatePrinter()

  function reset() {
    setPrinterName('')
    setBrand('')
    setModel('')
    setSerialNumber('')
    setAssetId('')
    setPrinterType('')
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
    if (!printerName.trim()) {
      setError('Printer Name is required.')
      return
    }
    if (!assetId.trim()) {
      setError('Asset ID is required. Do not invent one — use the real inventory tag.')
      return
    }

    setError(null)
    try {
      const created = await createPrinter.mutateAsync({
        printerName: printerName.trim(),
        brand: brand.trim() || null,
        model: model.trim() || null,
        serialNumber: serialNumber.trim() || null,
        assetId: assetId.trim(),
        printerType: printerType.trim() || null,
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
        setError('A printer with this Asset ID or Serial Number already exists in the inventory.')
      } else {
        setError('Failed to register printer. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Register New Printer</DialogTitle>
          <DialogDescription>
            Add a real printer asset to the IT inventory. Only enter information you can verify —
            leave a field blank rather than guessing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="printer-name">Printer Name *</Label>
              <Input id="printer-name" value={printerName} onChange={(e) => setPrinterName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="printer-type">Printer Type</Label>
              <Input id="printer-type" value={printerType} onChange={(e) => setPrinterType(e.target.value)} placeholder="e.g. Network Laser" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="printer-brand">Brand</Label>
              <Input id="printer-brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="printer-model">Model</Label>
              <Input id="printer-model" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="printer-serial">Serial Number</Label>
              <Input id="printer-serial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="printer-asset-id">Asset ID *</Label>
              <Input id="printer-asset-id" value={assetId} onChange={(e) => setAssetId(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="printer-purchase-date">Purchase Date</Label>
              <Input id="printer-purchase-date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="printer-purchase-price">Purchase Price</Label>
              <Input id="printer-purchase-price" type="number" min="0" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Purchased By</Label>
            <ManagerCombobox value={purchasedBy} onChange={setPurchasedBy} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="printer-warranty-months">Warranty (Months)</Label>
              <Input id="printer-warranty-months" type="number" min="0" value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="printer-warranty-start">Warranty Start</Label>
              <Input id="printer-warranty-start" type="date" value={warrantyStart} onChange={(e) => setWarrantyStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="printer-warranty-end">Warranty End</Label>
              <Input id="printer-warranty-end" type="date" value={warrantyEnd} onChange={(e) => setWarrantyEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="printer-notes">Notes (Optional)</Label>
            <Textarea id="printer-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createPrinter.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPrinter.isPending}>
              {createPrinter.isPending ? 'Registering…' : 'Register Printer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
