/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useTelemetryInstance } from './useTelemetryInstance'

type TrackEvent = (eventName: string, properties: Record<string, string>) => void
type TrackPage = (name: string, properties: Record<string, string>, category?: string) => void
type IdentifyUser = (email: string | undefined) => void
interface PageParams {
  pageName?: string
  category?: string
  properties?: Record<string, string>
}
interface TelemetryReturnType {
  trackEvent: TrackEvent
  identifyUser: IdentifyUser
  trackPage: TrackPage
}

export function useTelemetry(pageParams: PageParams = {}): TelemetryReturnType {
  const { currentUserInfo } = useAppStore()
  const { accountId: groupId } = useParams<AccountPathProps>()
  const telemetry = useTelemetryInstance()
  const userId = currentUserInfo.email || ''

  useEffect(() => {
    pageParams.pageName &&
      telemetry.page({
        name: pageParams.pageName,
        category: pageParams.category || '',
        properties: { userId, groupId, ...pageParams.properties } || {}
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageParams.pageName, pageParams.category, pageParams.properties])

  const trackEvent: TrackEvent = (eventName: string, properties: Record<string, string>) => {
    telemetry.track({ event: eventName, properties: { userId, groupId, ...properties } })
  }

  const trackPage: TrackPage = (name: string, properties: Record<string, string>, category?: string) => {
    telemetry.page({ name: name, properties: properties, category: category })
  }

  const identifyUser: IdentifyUser = (email: string | undefined) => {
    if (!email) return
    telemetry.identify(email)
  }
  return { trackEvent, identifyUser, trackPage }
}
