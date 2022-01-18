/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { HealthSource } from 'services/cv'

export const formFormik = {
  values: {
    type: 'application',
    name: 'Service101_Prod',
    identifier: 'Service101_Prod',
    serviceRef: 'Service101',
    environmentRef: 'Prod',
    sources: {
      healthSources: [],
      changeSources: []
    }
  }
}

export const editModeProps = {
  formik: formFormik,
  tableData: [{ name: 'oldAppd' }],
  isEdit: true,
  rowData: { name: 'appd' }
}

export const createModeProps = {
  formik: formFormik,
  tableData: [],
  isEdit: false,
  rowData: null
}

export const serviceFormik = {
  isEdit: false,
  name: 'Service_101_Prod',
  identifier: 'Service_101_Prod',
  description: '',
  tags: {},
  serviceRef: 'Service_101',
  type: 'Application',
  environmentRef: 'Prod',
  sources: {
    healthSources: [
      {
        name: 'test appd',
        identifier: 'dasdasdasda',
        type: 'AppDynamics',
        spec: {
          applicationName: 'cv-app',
          tierName: 'python-tier',
          feature: 'Application Monitoring',
          connectorRef: 'account.appdtest',
          metricPacks: [{ identifier: 'Errors' }]
        }
      }
    ],
    changeSources: [
      {
        name: 'Harness CD Next Gen',
        identifier: 'harness_cd_next_gen',
        type: 'HarnessCDNextGen',
        enabled: true,
        category: 'Deployment',
        spec: {}
      }
    ]
  },
  dependencies: []
}

export const healthSourceList: HealthSource = {
  name: 'dasdasdsa',
  identifier: 'dasdasdsa',
  type: 'AppDynamics',
  spec: {
    connectorRef: 'account.appdtest'
  }
}
