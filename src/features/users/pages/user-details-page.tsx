import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/shared/error-state'
import { LoadingState } from '@/components/shared/loading-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { emptyToNull } from '@/lib/forms'
import { translateSupabaseError } from '@/lib/supabase/translate-error'
import { useAuth } from '@/features/auth/context/auth-context'
import { useUserDetail } from '../hooks/users-queries'
import { useUpdateUser } from '../hooks/users-mutations'
import { UserForm } from '../components/user-form'
import type { UserFormValues } from '../schemas/user-schema'

// Employee 360 Feature Hooks
import {
  useUserApplications,
  useUserAuditLogs,
  useUserCurrentDevice,
  useUserCurrentIpPhone,
  useUserCurrentNetwork,
  useUserCurrentPrinter,
  useUserDeviceHistory,
  useUserDeviceServiceHistory,
  useUserIpPhoneHistory,
  useUserLicenses,
  useUserMachine,
  useUserPrinterHistory,
  useUserSupportIssues,
} from '../hooks/user-details-queries'

// Employee 360 Components
import { EmployeeHeader } from '../components/details/employee-header'
import { ItSnapshotStrip } from '../components/details/it-snapshot-strip'
import { SectionNavigation } from '../components/details/section-navigation'
import { EmployeeInfoSection } from '../components/details/employee-info-section'
import { MachineNetworkSection } from '../components/details/machine-network-section'
import { CurrentDeviceSection } from '../components/details/current-device-section'
import { IpPhoneSection } from '../components/details/ip-phone-section'
import { IpPhoneHistorySection } from '../components/details/ip-phone-history-section'
import { PrinterSection } from '../components/details/printer-section'
import { PurchaseWarrantySection } from '../components/details/purchase-warranty-section'
import { DeviceHistorySection } from '../components/details/device-history-section'
import { PrinterHistorySection } from '../components/details/printer-history-section'
import { ServiceHistorySection } from '../components/details/service-history-section'
import { ApplicationsSection } from '../components/details/applications-section'
import { SupportHistorySection } from '../components/details/support-history-section'
import { AccountLicenseSection } from '../components/details/account-license-section'
import { ProfileSecuritySection } from '../components/details/profile-security-section'

// Right Contextual Rail Components
import { ItHealthCard } from '../components/details/it-health-card'
import { QuickContextCard } from '../components/details/quick-context-card'
import { IpPhoneCard } from '../components/details/ip-phone-card'
import { RecentActivityCard } from '../components/details/recent-activity-card'

// Dialogs
import { CreateIssueDialog } from '../components/details/dialogs/create-issue-dialog'

export function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { accessLevel, appUser } = useAuth()
  const isItAdmin = accessLevel === 'it_administrator'

  // Primary user query
  const { data: user, isPending, isError, refetch } = useUserDetail(userId)

  // Secondary parallel queries for Employee 360 modules
  const { data: machine } = useUserMachine(userId)
  const { data: currentDevice } = useUserCurrentDevice(userId)
  const { data: currentNetwork } = useUserCurrentNetwork(userId)
  const { data: currentIpPhone } = useUserCurrentIpPhone(userId)
  const { data: currentPrinter } = useUserCurrentPrinter(userId)
  const { data: deviceHistory = [] } = useUserDeviceHistory(userId)
  const { data: ipPhoneHistory = [] } = useUserIpPhoneHistory(userId)
  const { data: printerHistory = [] } = useUserPrinterHistory(userId)
  const { data: serviceHistory = [] } = useUserDeviceServiceHistory(currentDevice?.device_id)
  const { data: applications = [] } = useUserApplications(userId)
  const { data: supportIssues = [] } = useUserSupportIssues(userId)
  const { data: licenses = [] } = useUserLicenses(userId)
  const { data: auditLogs = [] } = useUserAuditLogs(userId)

  // Edit and Dialog state
  const [isEditing, setIsEditing] = useState(false)
  const [createIssueOpen, setCreateIssueOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const updateUser = useUpdateUser()

  if (isPending) {
    return <LoadingState label="Loading Employee 360 profile…" />
  }

  if (isError) {
    return (
      <ErrorState
        title="Employee record couldn't be loaded"
        description="Unable to connect or retrieve this user's details. Please verify your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ErrorState
          title="User not found"
          description="This employee record may have been removed, or your account does not have authorization to view it."
        />
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/app/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  // Permission checks
  const canEdit = isItAdmin || (user.id === appUser?.id)
  const canCreateIssue = isItAdmin || (user.id === appUser?.id)

  async function handleUpdate(values: UserFormValues) {
    setServerError(null)
    try {
      await updateUser.mutateAsync({
        id: user!.id,
        input: {
          full_name: values.fullName,
          employee_id: values.employeeId,
          user_id: values.userId,
          official_email: values.officialEmail,
          phone: emptyToNull(values.phone),
          department_id: values.departmentId,
          designation_id: values.designationId,
          manager_id: emptyToNull(values.managerId),
          join_date: emptyToNull(values.joinDate),
          employment_status: values.employmentStatus,
          access_level: values.accessLevel,
        },
        previous: user!,
        auditAction: 'USER_UPDATED',
      })
      setIsEditing(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        setServerError(translateSupabaseError(error as never))
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    }
  }

  if (isEditing) {
    return (
      <div className="flex max-w-3xl flex-col gap-6 mx-auto py-2">
        <PageHeader
          title={`Edit ${user.full_name}`}
          description="Update employee organizational data and IT account profile."
        />
        <div className="rounded-lg border border-border bg-surface p-6">
          <UserForm
            excludeUserId={user.id}
            defaultValues={{
              fullName: user.full_name,
              employeeId: user.employee_id ?? undefined,
              userId: user.user_id,
              officialEmail: user.official_email,
              phone: user.phone ?? undefined,
              departmentId: user.department_id,
              designationId: user.designation_id ?? undefined,
              managerId: user.manager_id ?? undefined,
              joinDate: user.join_date ?? undefined,
              employmentStatus: user.employment_status,
              accessLevel: user.access_level,
            }}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
            submittingLabel="Saving…"
            serverError={serverError}
          />
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* A. Employee Header */}
      <EmployeeHeader
        user={user}
        onEdit={() => setIsEditing(true)}
        onCreateIssue={() => setCreateIssueOpen(true)}
      />

      {/* B. IT Snapshot Strip */}
      <ItSnapshotStrip
        machine={machine}
        currentDevice={currentDevice}
        currentNetwork={currentNetwork}
        currentIpPhone={currentIpPhone}
        licenses={licenses}
        userIdFallback={user.user_id}
      />

      {/* C. Sticky Section Navigation */}
      <SectionNavigation />

      {/* D. Main Workspace (68%) + Contextual Side Rail (32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Workspace Column */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* E. Employee Information */}
          <EmployeeInfoSection
            user={user}
            canEdit={canEdit}
            onEdit={() => setIsEditing(true)}
          />

          {/* F. Machine & Network Identity */}
          <MachineNetworkSection
            user={user}
            machine={machine}
            currentNetwork={currentNetwork}
            currentDevice={currentDevice}
            isItAdmin={isItAdmin}
          />

          {/* G. Current Device */}
          <CurrentDeviceSection
            user={user}
            currentDevice={currentDevice}
            isItAdmin={isItAdmin}
          />

          {/* G2. IP Phone / Extension */}
          <IpPhoneSection
            userId={user.id}
            employeeName={user.full_name}
            currentIpPhone={currentIpPhone}
            isItAdmin={isItAdmin}
          />

          {/* H. Printer */}
          <PrinterSection
            user={user}
            currentPrinter={currentPrinter}
            isItAdmin={isItAdmin}
          />

          {/* I. Purchase & Warranty */}
          <PurchaseWarrantySection currentDevice={currentDevice} />

          {/* J. Device Assignment History */}
          <DeviceHistorySection deviceHistory={deviceHistory} />

          {/* J2. IP Phone Assignment History */}
          <IpPhoneHistorySection history={ipPhoneHistory} />

          {/* J3. Printer Assignment History */}
          <PrinterHistorySection history={printerHistory} />

          {/* K. Service & Maintenance History */}
          <ServiceHistorySection
            serviceHistory={serviceHistory}
            userId={user.id}
            currentDeviceId={currentDevice?.device_id}
            currentDeviceLabel={
              currentDevice
                ? `${currentDevice.device.brand ? currentDevice.device.brand + ' ' : ''}${currentDevice.device.model} (${currentDevice.device.asset_id})`
                : null
            }
            isItAdmin={isItAdmin}
          />

          {/* L. Applications & Software */}
          <ApplicationsSection
            user={user}
            applications={applications}
            isItAdmin={isItAdmin}
          />

          {/* M. IT Support History */}
          <SupportHistorySection
            supportIssues={supportIssues}
            onCreateIssue={() => setCreateIssueOpen(true)}
            canCreateIssue={canCreateIssue}
          />

          {/* N. Account & License */}
          <AccountLicenseSection user={user} licenses={licenses} isItAdmin={isItAdmin} />

          {/* O. Profile & Security Actions */}
          <ProfileSecuritySection
            user={user}
            isItAdmin={isItAdmin}
            onEdit={() => setIsEditing(true)}
          />
        </div>

        {/* Contextual Side Rail Column (Desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-14">
          <QuickContextCard
            user={user}
            currentDevice={currentDevice}
            currentNetwork={currentNetwork}
            applications={applications}
            supportIssues={supportIssues}
          />

          <ItHealthCard
            currentDevice={currentDevice}
            currentNetwork={currentNetwork}
            applications={applications}
            supportIssues={supportIssues}
          />

          <IpPhoneCard currentIpPhone={currentIpPhone} />

          <RecentActivityCard auditLogs={auditLogs} />
        </div>
      </div>

      {/* Global Create Issue Dialog */}
      <CreateIssueDialog
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
        userId={user.id}
        employeeName={user.full_name}
      />
    </div>
  )
}
