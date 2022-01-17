/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
