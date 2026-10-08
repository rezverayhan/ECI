import { z } from 'zod'

const ACCESS_LEVELS = ['it_administrator', 'general_manager', 'admin', 'general_user'] as const
const EMPLOYMENT_STATUSES = ['active', 'inactive', 'resigned'] as const

const optionalText = z.string().optional()

export const userFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter a full name.'),
  // Nullable in the schema as of the 79-user import: some real employees
  // (e.g. recently joined Country Managers) genuinely have no Employee ID
  // or Designation on record yet. Left blank rather than fabricated.
  employeeId: optionalText,
  userId: z.string().trim().min(1, 'Enter a user ID.'),
  officialEmail: z
    .string()
    .trim()
    .min(1, 'Enter an email address.')
    .email('Enter a valid email address.'),
  phone: optionalText,
  departmentId: z.string().min(1, 'Select a department.'),
  designationId: optionalText,
  managerId: optionalText,
  joinDate: optionalText,
  employmentStatus: z.enum(EMPLOYMENT_STATUSES),
  accessLevel: z.enum(ACCESS_LEVELS),
})

export type UserFormValues = z.infer<typeof userFormSchema>

export const selfProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter a full name.'),
  phone: optionalText,
})

export type SelfProfileFormValues = z.infer<typeof selfProfileSchema>
