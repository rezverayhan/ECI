function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

interface UserAvatarProps {
  fullName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Profile photo rendering (profile_photo_path, served from the private
// profile-photos bucket via a signed URL) is wired up once the profile
// photo upload feature exists; initials are the correct fallback either way.
export function UserAvatar({ fullName, size = 'md', className = '' }: UserAvatarProps) {
  const dimension =
    size === 'sm' ? 'size-7 text-xs' : size === 'lg' ? 'size-16 text-xl' : 'size-9 text-sm'
  return (
    <span
      className={`inline-flex ${dimension} shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary ${className}`}
      aria-hidden
    >
      {getInitials(fullName) || '?'}
    </span>
  )
}
