/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getK8sIngressTemplate, getK8sYamlSchema } from '../GetK8sYamlSchema'

describe('K8s Yaml tests', () => {
  test('should fetch k8s yaml schema', () => {
    const schema = getK8sYamlSchema()
    expect(schema).toBeDefined()
  })

  test('should fetch k8s ingress template', () => {
    const template = getK8sIngressTemplate({
      name: 'ruleName',
      idleTime: 15,
      cloudConnectorId: 'random-id',
      hideProgressPage: false,
      deps: [{}]
    })
    expect(template).toBeDefined()
  })
})
