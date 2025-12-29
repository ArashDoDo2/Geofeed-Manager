import { prisma } from '@/lib/db'

type ActivityLogInput = {
  userId: string
  action: string
  message: string
  geofeedId?: string | null
  geofeedName?: string | null
}

export async function logActivity({
  userId,
  action,
  message,
  geofeedId,
  geofeedName,
}: ActivityLogInput) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        message,
        geofeedId: geofeedId || null,
        geofeedName: geofeedName || null,
      },
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}
