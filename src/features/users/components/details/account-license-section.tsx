import { useState } from 'react'
import { KeyRound, ShieldCheck, Lock, Pencil, RefreshCcw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionPanel, SectionHeader } from '@/components/shared/section-panel'
import { InfoMatrix, InfoField } from '@/components/shared/info-matrix'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ACCESS_LEVEL_LABELS } from '@/features/auth/access-level-labels'
import { formatDate } from './details-types'
import { CreateLicenseDialog } from './dialogs/create-license-dialog'
import { EditLicenseDialog } from './dialogs/edit-license-dialog'
import { RenewLicenseDialog } from './dialogs/renew-license-dialog'
import type { UserLicenseWithRenewals } from '../../api/user-details-api'
import type { UserDetail } from '../../api/users-api'

interface AccountLicenseSectionProps {
  user: UserDetail
  licenses: UserLicenseWithRenewals[]
  isItAdmin: boolean
}

export function AccountLicenseSection({ user, licenses, isItAdmin }: AccountLicenseSectionProps) {
  const primaryLicense = licenses[0]
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [renewOpen, setRenewOpen] = useState(false)

  return (
    <SectionPanel id="sec-account" ariaLabelledby="heading-account-license">
      <SectionHeader
        icon={KeyRound}
        title="Account & License"
        description="Authentication security profile, IAM directory identity, and enterprise software renewals."
        headingId="heading-account-license"
      />

      <div className="space-y-6">
        {/* Subsection 1: Account Information */}
        <div>
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-border/60">
            <Lock className="size-3.5 text-text-muted" aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Account & Directory Identity
            </h3>
          </div>

          <InfoMatrix columns={3}>
            <InfoField label="Account Email" value={user.official_email} />
            <InfoField
              label="Access Level"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" aria-hidden />
                  <span>{ACCESS_LEVEL_LABELS[user.access_level]}</span>
                </span>
              }
            />
            <InfoField
              label="Account Status"
              value={
                <StatusBadge
                  status={user.is_active ? 'active' : 'inactive'}
                  labelOverride={user.is_active ? 'Active' : 'Suspended'}
                />
              }
            />
            <InfoField label="Auth Provider" value="Supabase Auth (SSO / Directory)" />
            <InfoField label="Profile Created" value={formatDate(user.created_at)} />
          </InfoMatrix>
        </div>

        {/* Subsection 2: Current License */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <KeyRound className="size-3.5 text-text-muted" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Current License
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {primaryLicense ? <StatusBadge status={primaryLicense.status} /> : null}
              {isItAdmin && (
                primaryLicense ? (
                  <>
                    <Button size="xs" variant="ghost" onClick={() => setEditOpen(true)} className="gap-1 h-6 px-1.5">
                      <Pencil className="size-3" aria-hidden />
                      Edit
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => setRenewOpen(true)} className="gap-1 h-6 px-1.5">
                      <RefreshCcw className="size-3" aria-hidden />
                      Renew
                    </Button>
                  </>
                ) : (
                  <Button size="xs" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1 h-6 px-1.5">
                    <Plus className="size-3" aria-hidden />
                    Create License
                  </Button>
                )
              )}
            </div>
          </div>

          {!primaryLicense ? (
            <EmptyState
              icon={KeyRound}
              title="No account license is currently recorded for this employee."
              action={
                isItAdmin ? (
                  <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1.5">
                    <Plus className="size-3.5" aria-hidden />
                    Create License
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              <InfoMatrix columns={3}>
                <InfoField label="License Package" value={primaryLicense.license_name} />
                <InfoField label="License Tier" value={primaryLicense.license_type} />
                <InfoField label="Start Date" value={formatDate(primaryLicense.start_date)} />
                <InfoField label="Expiration Date" value={formatDate(primaryLicense.expiry_date)} />
                <InfoField label="Auto Renew" value={primaryLicense.auto_renew ? 'Enabled' : 'Disabled'} />
                {primaryLicense.notes ? <InfoField label="Notes" value={primaryLicense.notes} /> : null}
              </InfoMatrix>

              {/* Subsection 3: Renewal History — kept visually distinct from current license above */}
              <div className="rounded-md border border-border bg-canvas/40 p-3 mt-3">
                <span className="text-[11px] font-semibold text-text-secondary block mb-1.5">
                  Renewal History
                </span>
                {!primaryLicense.renewals || primaryLicense.renewals.length === 0 ? (
                  <p className="text-xs text-text-secondary py-1">No license renewal history found.</p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {primaryLicense.renewals.map((ren) => (
                      <div key={ren.id} className="py-1.5 text-xs text-text-secondary first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span>Renewed on {formatDate(ren.renewed_on)}</span>
                          <span className="font-medium text-text">New Expiry: {formatDate(ren.new_expiry_date)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5 text-text-muted">
                          <span>Previous Expiry: {formatDate(ren.previous_expiry_date)}</span>
                          {ren.renewer ? <span>by {ren.renewer.full_name}</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isItAdmin && (
        <>
          <CreateLicenseDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            userId={user.id}
            employeeName={user.full_name}
          />
          {primaryLicense && (
            <>
              <EditLicenseDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                userId={user.id}
                license={primaryLicense}
              />
              <RenewLicenseDialog
                open={renewOpen}
                onOpenChange={setRenewOpen}
                userId={user.id}
                license={primaryLicense}
              />
            </>
          )}
        </>
      )}
    </SectionPanel>
  )
}
