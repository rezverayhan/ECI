import { useState } from 'react'
import { Settings2, LifeBuoy, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { LoadingState } from '@/components/shared/loading-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSystemConfiguration, useUpdateSystemConfiguration } from '../hooks/use-system-config'
import type { SystemConfigurationRow } from '../api/system-config-api'

interface SystemConfigurationFormProps {
  initialConfig: SystemConfigurationRow
  isPendingMigration: boolean
}

function SystemConfigurationForm({ initialConfig, isPendingMigration }: SystemConfigurationFormProps) {
  const updateMutation = useUpdateSystemConfiguration()

  const [appName, setAppName] = useState(initialConfig.app_name)
  const [maintenanceMode, setMaintenanceMode] = useState(initialConfig.maintenance_mode)
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialConfig.maintenance_message ?? '')
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(initialConfig.max_booking_advance_days)
  const [maxDurationHours, setMaxDurationHours] = useState(initialConfig.max_booking_duration_hours)
  const [supportAutoAcknowledge, setSupportAutoAcknowledge] = useState(initialConfig.support_auto_acknowledge)
  const [supportTicketPrefix, setSupportTicketPrefix] = useState(initialConfig.support_ticket_prefix)

  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)

    if (maxAdvanceDays < 1 || maxAdvanceDays > 365) {
      setSaveError('Max advance booking days must be between 1 and 365.')
      return
    }

    if (maxDurationHours < 1 || maxDurationHours > 24) {
      setSaveError('Max booking duration must be between 1 and 24 hours.')
      return
    }

    try {
      await updateMutation.mutateAsync({
        app_name: appName.trim() || 'ECI User Management',
        maintenance_mode: maintenanceMode,
        maintenance_message: maintenanceMessage.trim() || null,
        max_booking_advance_days: maxAdvanceDays,
        max_booking_duration_hours: maxDurationHours,
        support_auto_acknowledge: supportAutoAcknowledge,
        support_ticket_prefix: supportTicketPrefix.trim() || 'ECI-IT',
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save system configuration.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {isPendingMigration && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="font-semibold">Pending Database Migration (0047)</p>
              <p className="mt-1 leading-relaxed">
                Table <code className="font-mono text-xs">public.system_configuration</code> does not exist on the database yet. Migration <code className="font-mono text-xs">20261009123000_0047_system_configuration_and_notification_preferences.sql</code> has been prepared. Current defaults are shown below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* General System Settings */}
      <SectionPanel>
        <SectionHeader
          icon={Settings2}
          title="General System Settings"
          description="Application metadata and global operational status."
        />
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="app-name">Application Name</Label>
            <Input
              id="app-name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="ECI User Management"
              required
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                id="maintenance-mode"
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="maintenance-mode" className="cursor-pointer font-medium">
                Enable Maintenance Mode
              </Label>
            </div>
            <p className="text-xs text-text-muted pl-6">
              When enabled, displays an informational maintenance banner across the application.
            </p>
          </div>

          {maintenanceMode && (
            <div className="space-y-1.5 pl-6">
              <Label htmlFor="maintenance-message">Maintenance Banner Message</Label>
              <Textarea
                id="maintenance-message"
                rows={2}
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="The system is undergoing scheduled IT maintenance."
              />
            </div>
          )}
        </div>
      </SectionPanel>

      {/* Resource Booking Settings */}
      <SectionPanel>
        <SectionHeader
          icon={Calendar}
          title="Resource Booking Limits"
          description="System-wide boundaries for meeting room and car bookings."
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="max-advance-days">Max Advance Booking Window (Days)</Label>
            <Input
              id="max-advance-days"
              type="number"
              min={1}
              max={365}
              value={maxAdvanceDays}
              onChange={(e) => setMaxAdvanceDays(parseInt(e.target.value, 10) || 1)}
              required
            />
            <p className="text-xs text-text-muted">How far in advance employees can reserve resources.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="max-duration-hours">Max Booking Duration (Hours)</Label>
            <Input
              id="max-duration-hours"
              type="number"
              min={1}
              max={24}
              value={maxDurationHours}
              onChange={(e) => setMaxDurationHours(parseInt(e.target.value, 10) || 1)}
              required
            />
            <p className="text-xs text-text-muted">Maximum allowed duration for a single continuous reservation.</p>
          </div>
        </div>
      </SectionPanel>

      {/* IT Support Settings */}
      <SectionPanel>
        <SectionHeader
          icon={LifeBuoy}
          title="IT Support Defaults"
          description="Default behaviors for the IT support queue and issue lifecycle."
        />
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="ticket-prefix">Support Ticket Prefix</Label>
            <Input
              id="ticket-prefix"
              value={supportTicketPrefix}
              onChange={(e) => setSupportTicketPrefix(e.target.value)}
              placeholder="ECI-IT"
              required
            />
            <p className="text-xs text-text-muted">Prefix used in generated ticket numbers (e.g. ECI-IT-001).</p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                id="auto-ack"
                type="checkbox"
                checked={supportAutoAcknowledge}
                onChange={(e) => setSupportAutoAcknowledge(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="auto-ack" className="cursor-pointer font-medium">
                Auto-Acknowledge Tickets on Submission
              </Label>
            </div>
            <p className="text-xs text-text-muted pl-6">
              Automatically advances submitted issues to Acknowledged status upon receipt.
            </p>
          </div>
        </div>
      </SectionPanel>

      {/* Actions & Feedback */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div>
          {saveSuccess && (
            <p className="flex items-center gap-1.5 text-xs text-success font-medium">
              <CheckCircle2 className="size-4" aria-hidden />
              Configuration changes saved successfully.
            </p>
          )}
          {saveError && (
            <p className="flex items-center gap-1.5 text-xs text-error font-medium">
              <AlertCircle className="size-4" aria-hidden />
              {saveError}
            </p>
          )}
        </div>

        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving…' : 'Save Configuration'}
        </Button>
      </div>
    </form>
  )
}

export function SystemConfigurationPage() {
  const { data, isPending, isError, refetch } = useSystemConfiguration()

  if (isPending) {
    return <LoadingState label="Loading system configuration…" />
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="System Configuration"
          description="Operational settings for IT Administrators."
        />
        <div className="rounded-lg border border-error/30 bg-error/10 p-5 text-sm text-error">
          <p className="font-medium">Failed to load system configuration.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System Configuration"
        description="Operational settings for IT Administrators."
      />
      <SystemConfigurationForm
        key={data.config.id + data.config.updated_at}
        initialConfig={data.config}
        isPendingMigration={data.isPendingMigration}
      />
    </div>
  )
}
