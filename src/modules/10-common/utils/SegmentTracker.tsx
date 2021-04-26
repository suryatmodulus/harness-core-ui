/* global analytics */
import { useParams } from 'react-router-dom'
import AppStorage from 'framework/utils/AppStorage'

const { accountId } = useParams<{
  accountId: string
}>()

class SegmentTracker {
  static identify(id: string) {
    analytics.identify(id, { accountId })
  }

  static track(eventName: string, properties: Record<string, any> = {}) {
    if (typeof analytics === 'undefined') {
      return
    }

    const data: any = {
      ...properties,
      email: AppStorage.get('email'),
      url: window.location.href
    }
    if (accountId) {
      data.accountId = accountId
    }

    analytics.track(eventName, data)
  }

  static page(name: string, properties: Record<string, any> = {}) {
    if (typeof analytics === 'undefined') {
      return
    }

    const data: any = {
      ...properties,
      email: AppStorage.get('email'),
      url: window.location.href
    }
    if (accountId) {
      data.accountId = accountId
    }

    analytics.page(name, data)
  }
}

export default SegmentTracker
