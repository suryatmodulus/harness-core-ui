import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import KubernetesRuleYamlEditor from '../KubernetesRuleYamlEditor'

const mockedYamlData = {
  apiVersion: 'lightwing.lightwing.io/v1',
  kind: 'AutoStoppingRule',
  metadata: {
    annotations: {},
    name: 'test-rule-ry5',
    namespace: 'default'
  },
  spec: {
    rules: [
      {
        http: {
          paths: [
            {
              backend: {
                service: {
                  name: 'frontend',
                  port: {
                    number: 80
                  }
                }
              },
              path: '/ry-test',
              pathType: 'Prefix'
            }
          ]
        }
      }
    ]
  },
  status: {}
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Kubernetes Yaml Editor', () => {
  test('edit mode', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesRuleYamlEditor existingData={mockedYamlData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('read mode', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesRuleYamlEditor existingData={mockedYamlData} mode={'read'} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
