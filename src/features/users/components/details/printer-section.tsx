import { useState } from 'react'
import {
  Printer,
  Plus,
  RotateCcw,
  Barcode,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { InfoMatrix, InfoField } from '@/components/shared/info-matrix'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate } from './details-types'
import { AssignPrinterDialog } from './dialogs/assign-printer-dialog'
import { ReturnPrinterDialog } from './dialogs/return-printer-dialog'
import type { UserCurrentPrinterData } from '../../api/user-details-api'
import type { UserDetail } from '../../api/users-api'

interface PrinterSectionProps {
  user: UserDetail
  currentPrinter: UserCurrentPrinterData | null | undefined
  isItAdmin: boolean
}

export function PrinterSection({
  user,
  currentPrinter,
  isItAdmin,
}: PrinterSectionProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)

  const hasPrinter = Boolean(currentPrinter)
  const printer = currentPrinter?.printer

  return (
    <SectionPanel id="sec-printer" ariaLabelledby="heading-printer">
      <SectionHeader
        icon={Printer}
        title="Printer Access"
        description="Assigned printing peripheral or designated departmental print queue."
        headingId="heading-printer"
        actions={
          isItAdmin ? (
            <div className="flex items-center gap-2">
              {hasPrinter ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReplaceDialogOpen(true)}
                  >
                    Replace Printer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReturnDialogOpen(true)}
                    className="gap-1.5"
                  >
                    <RotateCcw className="size-3.5" aria-hidden />
                    Return Printer
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAssignDialogOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" aria-hidden />
                  Assign Printer
                </Button>
              )}
            </div>
          ) : null
        }
      />

      {!hasPrinter ? (
        <EmptyState
          icon={Printer}
          title="No printer assigned"
          description="This employee is not currently mapped to an individual or dedicated printer."
          action={
            isItAdmin ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAssignDialogOpen(true)}
                className="gap-1.5"
              >
                <Plus className="size-3.5" aria-hidden />
                Assign Printer
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-canvas px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-surface border border-border text-primary shrink-0">
                <Printer className="size-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text truncate">
                  {printer!.printer_name} {printer!.model ? `· ${printer!.model}` : ''}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary mt-0.5">
                  <span>{printer!.brand || '—'}</span>
                  <span className="text-text-muted">·</span>
                  <span className="capitalize">{printer!.printer_type || '—'}</span>
                  <span className="text-text-muted">·</span>
                  <span className="font-mono">{printer!.asset_id}</span>
                </div>
              </div>
            </div>

            <StatusBadge status="assigned" />
          </div>

          <InfoMatrix columns={4}>
            <InfoField
              label="Asset ID"
              value={
                <span className="flex items-center gap-1 font-mono">
                  <Barcode className="size-3.5 text-text-muted" aria-hidden />
                  {printer!.asset_id}
                </span>
              }
            />
            <InfoField label="Serial Number" value={printer!.serial_number || '—'} mono />
            <InfoField
              label="Assigned Since"
              value={
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5 text-text-muted" aria-hidden />
                  {formatDate(currentPrinter!.assigned_at)}
                </span>
              }
            />
            <InfoField
              label="Warranty Coverage"
              value={printer!.warranty_end_date ? formatDate(printer!.warranty_end_date) : null}
            />
          </InfoMatrix>
        </div>
      )}

      <AssignPrinterDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        userId={user.id}
        employeeName={user.full_name}
      />

      {currentPrinter && (
        <>
          <AssignPrinterDialog
            open={replaceDialogOpen}
            onOpenChange={setReplaceDialogOpen}
            userId={user.id}
            employeeName={user.full_name}
            replacing={{
              assignmentId: currentPrinter.id,
              printerId: currentPrinter.printer_id,
              printerLabel: `${currentPrinter.printer.printer_name} (${currentPrinter.printer.asset_id})`,
            }}
          />
          <ReturnPrinterDialog
            open={returnDialogOpen}
            onOpenChange={setReturnDialogOpen}
            userId={user.id}
            currentPrinter={currentPrinter}
          />
        </>
      )}
    </SectionPanel>
  )
}
