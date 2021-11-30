import Telemetry from '@wings-software/telemetry'
import { isCDCommunity, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'

const stubTelemetry = {
  identify: () => void 0,
  track: () => void 0,
  page: () => void 0
}

interface TelemetryStub {
  identify: () => void
  track: () => void
  page: () => void
}

export function useTelemetryInstance(): TelemetryStub | Telemetry {
  const { licenseInformation } = useLicenseStore()
  const isStub = isCDCommunity(licenseInformation) || window.deploymentType === 'ON_PREM' || __DEV__
  return isStub ? stubTelemetry : new Telemetry(window.segmentToken || 'exa6lo7CnJXqKnR83itMpHYLY5fiajft')
}
