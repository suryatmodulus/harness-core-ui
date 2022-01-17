/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { TargetAttributesProvider, useTargetAttributes } from '@cf/hooks/useTargetAttributes'
import * as serviceHooks from 'services/cf'
import { sortStrings } from '@cf/utils/sortStrings'

const sampleTargetAttributes = ['test_1', 'a_sample', 'sample_3']

describe('useTargetAttributes', () => {
  let useGetAllTargetAttributesMock: jest.SpyInstance

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderTargetAttributesHook = ({
    loading = false,
    data = sampleTargetAttributes,
    ...serviceProps
  }: {
    loading?: boolean
    data?: string[]
    project?: string
    org?: string
    accountIdentifier?: string
    environment?: string
  } = {}) => {
    useGetAllTargetAttributesMock = jest
      .spyOn(serviceHooks, 'useGetAllTargetAttributes')
      .mockReturnValue({ loading, data } as any)

    return renderHook(() => useTargetAttributes(), {
      wrapper: TargetAttributesProvider,
      initialProps: {
        project: 'TEST_PROJECT',
        org: 'TEST_ORG',
        accountIdentifier: 'TEST_ACC',
        environment: 'TEST_ENV',
        ...serviceProps
      }
    })
  }

  beforeEach(() => jest.resetAllMocks())

  test('it should return loading and targetAttributes', async () => {
    const { result } = renderTargetAttributesHook()

    expect(result.current).toHaveProperty('loading', false)
    expect(result.current).toHaveProperty('targetAttributes')
  })

  test('it should sort the targetAttributes into alphabetical order', () => {
    const { result } = renderTargetAttributesHook()
    const sortedSampleTargetAttributes = sortStrings(sampleTargetAttributes)

    expect(result.current).toHaveProperty('targetAttributes', sortedSampleTargetAttributes)
  })

  test('it should call the useGetAllTargetAttributes hook with the appropriate params', () => {
    const project = 'TEST_PROJECT_123'
    const org = 'TEST_ORG_123'
    const accountIdentifier = 'TEST_ACC_123'
    const environment = 'ENV_123'

    renderTargetAttributesHook({ project, org, accountIdentifier, environment })

    expect(useGetAllTargetAttributesMock).toHaveBeenCalled()

    const params = useGetAllTargetAttributesMock.mock.calls[0][0].queryParams
    expect(params).toHaveProperty('project', project)
    expect(params).toHaveProperty('org', org)
    expect(params).toHaveProperty('accountIdentifier', accountIdentifier)
    expect(params).toHaveProperty('environment', environment)
  })
})
