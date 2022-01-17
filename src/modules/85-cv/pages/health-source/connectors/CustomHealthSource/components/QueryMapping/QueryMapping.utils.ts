/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MutateMethod } from 'restful-react'
import { getScopeFromValue, getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import type { UseGetConnectorProps } from 'services/cd-ng'
import type {
  CustomHealthMetricDefinition,
  CustomHealthSampleDataRequest,
  FetchSampleDataQueryParams,
  ResponseObject,
  TimestampInfo
} from 'services/cv'
import { Scope } from '@common/interfaces/SecretsInterface'

export const onFetchRecords = async (
  urlPath?: string,
  endTime?: TimestampInfo,
  startTime?: TimestampInfo,
  requestMethod?: CustomHealthMetricDefinition['method'],
  query?: string,
  getSampleData?: MutateMethod<ResponseObject, CustomHealthSampleDataRequest, FetchSampleDataQueryParams, void>,
  onFetchRecordsSuccess?: (data: { [key: string]: { [key: string]: any } }) => void
): Promise<void> => {
  if (!urlPath || !endTime || !startTime) {
    return
  }

  const payload: CustomHealthSampleDataRequest = {
    method: requestMethod || 'GET',
    urlPath,
    endTime,
    startTime
  }

  if (query && requestMethod === 'POST') {
    payload['body'] = query
  }
  const recordsvalue = await getSampleData?.(payload)
  if (recordsvalue?.data) {
    onFetchRecordsSuccess?.(recordsvalue?.data)
  }
}

export const connectorParams = (
  connectorIdentifier: string,
  {
    projectIdentifier,
    orgIdentifier,
    accountId
  }: { projectIdentifier: string; orgIdentifier: string; accountId: string }
): UseGetConnectorProps => {
  const queryParams = { accountIdentifier: accountId } as {
    projectIdentifier: string
    orgIdentifier: string
    accountIdentifier: string
  }
  let scope = getScopeFromValue(connectorIdentifier)
  const identifier = getIdentifierFromValue(connectorIdentifier)
  if (scope === Scope.PROJECT) {
    queryParams.projectIdentifier = projectIdentifier
    scope = Scope.ORG
  }
  if (scope === Scope.ORG) {
    queryParams.orgIdentifier = orgIdentifier
  }
  return {
    identifier,
    queryParams
  }
}
