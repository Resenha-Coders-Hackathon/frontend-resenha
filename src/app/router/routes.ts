import type { RouteRecordRaw } from 'vue-router'
import { authRoutes } from '@/modules/auth/router'
import { calendarRoutes } from '@/modules/calendar'
import { chatRoutes } from '@/modules/chat/router'
import { configRoutes } from '@/modules/config/router'
import { geolocationRoutes } from '@/modules/geolocation/router'
import { invitationRoutes } from '@/modules/invitations/router'
import { mapboxRoutes } from '@/modules/mapbox/router'
import { moduleRoutes } from '@/modules/module/router'
import { notificationsRoutes } from '@/modules/notifications/router'
import { organizationRoutes } from '@/modules/organizations/router'
import { paymentsRoutes } from '@/modules/payments/router'

import { reportsRoutes } from '@/modules/reports/router'

import { teamsRoutes } from '@/modules/teams/router'

import { uploadsRoutes } from '@/modules/uploads/router'

export const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...calendarRoutes,
  ...chatRoutes,
  ...configRoutes,
  ...organizationRoutes,
  ...invitationRoutes,
  ...geolocationRoutes,
  ...mapboxRoutes,
  ...moduleRoutes,
  ...notificationsRoutes,
  ...paymentsRoutes,
  ...uploadsRoutes,
  ...teamsRoutes,
  ...reportsRoutes,
]
