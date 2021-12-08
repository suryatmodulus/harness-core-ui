import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { Editions } from '@common/constants/SubscriptionTypes'

export function useCommunity(): boolean {
  const { licenseInformation } = useLicenseStore()
  return licenseInformation?.CD?.edition === Editions.COMMUNITY
}
