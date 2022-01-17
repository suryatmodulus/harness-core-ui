/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { PipelineResponse } from '@pipeline/pages/pipeline-details/__tests__/PipelineDetailsMocks'
import { accountPathProps, pipelineModuleParams, triggerPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import TriggersDetailPage from '../TriggersDetailPage'
import { GetTriggerResponse, GetTriggerDetailsResponse } from './TriggerDetailPageMock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const mockUpdateTrigger = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))

jest.mock('services/pipeline-ng', () => ({
  useGetTrigger: jest.fn(() => GetTriggerResponse),
  useGetPipelineSummary: jest.fn(() => PipelineResponse),
  useGetTriggerDetails: jest.fn(() => GetTriggerDetailsResponse),
  useUpdateTrigger: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTrigger })),
  useGetSchemaYaml: jest.fn(() => ({}))
}))
const TEST_PATH = routes.toTriggersDetailPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })

describe('Test Trigger Details Page Test', () => {
  test('should test snapshot view', () => {
    const datespy = jest.spyOn(Date.prototype, 'toLocaleDateString')
    const timespy = jest.spyOn(Date.prototype, 'toLocaleTimeString')

    datespy.mockImplementation(() => 'MOCK_DATE')
    timespy.mockImplementation(() => 'MOCK_TIME')

    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          triggerIdentifier: 'triggerIdentifier',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <TriggersDetailPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    datespy.mockRestore()
    timespy.mockRestore()
  })
})
