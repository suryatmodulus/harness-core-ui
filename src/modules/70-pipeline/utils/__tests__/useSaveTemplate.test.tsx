import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { noop } from 'lodash-es'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { TemplateContextMetadata, useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import { createTemplatePromise, updateExistingTemplateLabelPromise } from 'services/template-ng'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import gitSyncListResponse from '@common/utils/__tests__/mocks/gitSyncRepoListMock.json'

export const stepTemplateMock = {
  name: 'Test Http Template',
  identifier: 'Test_Http_Template',
  versionLabel: 'v1',
  type: 'Step',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {
    type: 'Http',
    timeout: '1m 40s',
    spec: { url: '<+input>', method: 'GET', headers: [], outputVariables: [], requestBody: '<+input>' }
  }
}

jest.mock('services/template-ng', () => ({
  createTemplatePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  updateExistingTemplateLabelPromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.mock('services/cd-ng', () => ({
  useCreatePR: jest.fn(() => noop),
  useGetFileContent: jest.fn(() => noop),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitSyncListResponse, refetch: getListGitSync, loading: false }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))
const Wrapped = (props: TemplateContextMetadata): React.ReactElement => {
  const { saveAndPublish } = useSaveTemplate(props)
  return (
    <>
      <button onClick={() => saveAndPublish(props.template as NGTemplateInfoConfig, {})}>Save</button>
      <button onClick={() => saveAndPublish(props.template as NGTemplateInfoConfig, { isEdit: true })}>Edit</button>
    </>
  )
}

describe('useSaveTemplate Test', () => {
  test('create should work as expected', async () => {
    const props: TemplateContextMetadata = {
      template: stepTemplateMock as NGTemplateInfoConfig,
      deleteTemplateCache: jest.fn()
    }
    const { getByText } = render(
      <TestWrapper>
        <Wrapped {...props} />
      </TestWrapper>
    )

    const saveBtn = getByText('Save')
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    expect(createTemplatePromise).toBeCalled()
    expect(props.deleteTemplateCache).toBeCalled()
  })
  test('edit should work as expected', async () => {
    const props: TemplateContextMetadata = {
      template: stepTemplateMock as NGTemplateInfoConfig,
      fetchTemplate: jest.fn()
    }
    const { getByText } = render(
      <TestWrapper>
        <Wrapped {...props} />
      </TestWrapper>
    )

    const saveBtn = getByText('Edit')
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    expect(updateExistingTemplateLabelPromise).toBeCalled()
    expect(props.fetchTemplate).toBeCalled()
  })

  test('filePath should be expected', async () => {
    const props: TemplateContextMetadata = {
      template: stepTemplateMock as NGTemplateInfoConfig,
      deleteTemplateCache: jest.fn(),
      gitDetails: {
        repoIdentifier: 'testRepo',
        branch: 'testBranch'
      }
    }
    props.template.versionLabel = 'v1.0.0'
    const { getByText } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <Wrapped {...props} />
      </TestWrapper>
    )

    const saveBtn = getByText('Save')
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    const commentsDialog = findDialogContainer()
    expect(commentsDialog).toBeDefined()

    const filePath = commentsDialog!.querySelector('input[name="filePath"]')!
    expect(filePath).toBeDefined()
    expect(filePath?.getAttribute('value')).toBe('Test_Http_Template_v100.yaml')
  })
  test('filePath should be expected for underscore and hyphen', async () => {
    const props: TemplateContextMetadata = {
      template: stepTemplateMock as NGTemplateInfoConfig,
      deleteTemplateCache: jest.fn(),
      gitDetails: {
        repoIdentifier: 'testRepo',
        branch: 'testBranch'
      }
    }
    props.template.versionLabel = 'v1.0.0-0_0'
    const { getByText } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <Wrapped {...props} />
      </TestWrapper>
    )

    const saveBtn = getByText('Save')
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    const commentsDialog = findDialogContainer()
    expect(commentsDialog).toBeDefined()

    const filePath = commentsDialog!.querySelector('input[name="filePath"]')!
    expect(filePath).toBeDefined()
    expect(filePath?.getAttribute('value')).toBe('Test_Http_Template_v100-0_0.yaml')
  })
})
