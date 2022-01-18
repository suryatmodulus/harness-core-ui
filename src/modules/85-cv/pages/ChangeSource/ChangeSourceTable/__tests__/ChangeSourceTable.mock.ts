/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const ChangeSourceOptions = [
  {
    name: 'Harness CD',
    identifier: 'harness_cd',
    type: 'HarnessCD' as any,
    desc: 'Deployments from Harness CD',
    enabled: true,
    category: 'Deployment' as any,
    spec: {}
  }
]

export const onEditCalledWith = {
  isEdit: true,
  onSuccess: jest.fn(),
  rowdata: {
    category: 'Deployment',
    desc: 'Deployments from Harness CD',
    enabled: true,
    identifier: 'harness_cd',
    name: 'Harness CD',
    spec: {},
    type: 'HarnessCD'
  },
  tableData: [
    {
      category: 'Deployment',
      desc: 'Deployments from Harness CD',
      enabled: true,
      identifier: 'harness_cd',
      name: 'Harness CD',
      spec: {},
      type: 'HarnessCD'
    }
  ]
}
