/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Steps from '../Steps'

describe('Steps test', () => {
  test('snapshot testing for Rolling strategy', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage',
          sectionId: 'EXECUTION'
        }}
      >
        <Steps strategy="Rolling" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('snapshot testing for Blue Green strategy', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio/"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage',
          sectionId: 'EXECUTION'
        }}
      >
        <Steps strategy="BlueGreen" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('snapshot testing for Canary strategy', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio/"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage',
          sectionId: 'EXECUTION'
        }}
      >
        <Steps strategy="Canary" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
