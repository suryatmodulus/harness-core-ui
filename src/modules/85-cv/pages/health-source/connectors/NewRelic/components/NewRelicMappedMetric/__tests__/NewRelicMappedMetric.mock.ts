/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const connectorIdentifier = 'account.new_relic'
export const mappedMetricsMap = new Map()
export const formikValues = {
  name: 'NR-400',
  identifier: 'NR400',
  connectorRef: 'account.new_relic',
  isEdit: false,
  product: {
    value: 'apm',
    label: 'Full Stack Observability: APM'
  },
  type: 'NewRelic',
  mappedServicesAndEnvs: {},
  newRelicApplication: {
    label: '',
    value: ''
  },
  metricPacks: [],
  metricData: {},
  metricName: 'New Relic Metric',
  showCustomMetric: false
}
