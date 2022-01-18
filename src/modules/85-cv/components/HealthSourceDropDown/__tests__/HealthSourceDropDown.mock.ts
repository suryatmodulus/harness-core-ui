/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockedHealthSourcesData = {
  metaData: {},
  resource: [
    {
      identifier: 'Appd_Monitored_service/Appd_Health_source',
      name: 'Appd Health source',
      type: 'APP_DYNAMICS',
      verificationType: 'TIME_SERIES'
    },
    {
      identifier: 'Appd_Monitored_service/GCO_Health_source',
      name: 'GCO Health source',
      type: 'STACKDRIVER_LOG',
      verificationType: 'LOG'
    }
  ],
  responseMessages: []
}

export const mockedMultipleHealthSourcesData = {
  metaData: {},
  resource: [
    {
      identifier: 'Appd_Monitored_service/Appd_Health_source',
      name: 'Appd Health source',
      type: 'APP_DYNAMICS',
      verificationType: 'TIME_SERIES'
    },
    {
      identifier: 'Appd_Monitored_service/Prometheus_Health_source',
      name: 'Prometheus Health source',
      type: 'PROMETHEUS',
      verificationType: 'TIME_SERIES'
    }
  ],
  responseMessages: []
}
