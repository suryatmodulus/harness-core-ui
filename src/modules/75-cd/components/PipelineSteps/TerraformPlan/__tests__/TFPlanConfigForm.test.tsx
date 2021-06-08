import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import TFPlanConfigForm from '../TfPlanConfigForm'

const props = {
  onClick: jest.fn(),
  data: {},
  onHide: jest.fn()
}

const connectorMock = {
  data: {
    connector: {
      name: 'Git5',
      identifier: 'Git5',
      description: '',
      orgIdentifier: 'CV',
      projectIdentifier: 'Milos2',
      tags: {},
      type: 'Git',
      spec: {
        url: 'https://github.com/wings-software/template-yaml-bugbash.git',
        branchName: null,
        delegateSelectors: [],
        type: 'Http',
        connectionType: 'Repo',
        spec: {
          username: 'AutoUserHarness1',
          usernameRef: null,
          passwordRef: 'GitPass2'
        },
        gitSync: {
          enabled: false,
          customCommitAttributes: null,
          syncEnabled: false
        }
      }
    }
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => ({
    loading: false,
    data: connectorMock,
    refetch: jest.fn()
  })
}))
describe('TF Config Form tests', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper>
        <TFPlanConfigForm {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('edit view loads correctly', async () => {
    const editProps = {
      onClick: () => jest.fn(),
      data: {
        spec: {
          configuration: {
            configFiles: {
              store: {
                spec: {
                  connectorRef: 'Git5',
                  branch: 'test-branch',
                  folderPath: 'test-folder'
                }
              }
            }
          }
        }
      },
      onHide: () => jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <TFPlanConfigForm {...editProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
