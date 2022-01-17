/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import services from '@cd/components/PipelineStudio/DeployServiceSpecifications/__test__/servicesMock'
import DeployStageSetupShell from '../DeployStageSetupShell'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({
  validateJSONWithSchema: jest.fn(() => Promise.resolve(new Map()))
}))
const fetchConnectors = () => Promise.resolve({})

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null }
  }),
  useGetServiceListForProject: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

window.HTMLElement.prototype.scrollTo = jest.fn()

describe('DeployStageSetupShell tests', () => {
  test('opens services tab by default', async () => {
    const { container, findByTestId } = render(
      <TestWrapper>
        <DeployStageSetupShell />
      </TestWrapper>
    )

    const serviceTab = await findByTestId('service')

    expect(container).toMatchSnapshot()
    expect(serviceTab.getAttribute('aria-selected')).toBe('true')
  })
})
