import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import KustomizeWithGIT from '../KustomizeWithGIT'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  handleSubmit: jest.fn()
}
describe('Kustomize with Git/ Github/Gitlab/Bitbucket tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: '',
      skipResourceVersioning: false,
      repoName: '',
      pluginPath: ''
    }
    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: 'id2',
      branch: 'master',
      gitFetchType: 'Branch',
      folderPath: '',
      skipResourceVersioning: false,
      repoName: '',
      pluginPath: ''
    }

    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'id12',
      commitId: 'awsd123sd',
      gitFetchType: 'Commit',
      folderPath: './temp',
      skipResourceVersioning: true,
      repoName: 'someurl/repoName',
      pluginPath: ''
    }

    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload when gitfetchtype is branch', async () => {
    const initialValues = {
      identifier: '',
      branch: undefined,
      gitFetchType: '',
      folderPath: '',
      skipResourceVersioning: true,
      repoName: '',
      pluginPath: ''
    }

    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('folderPath')!, { target: { value: 'test-path' } })
      fireEvent.change(queryByNameAttribute('pluginPath')!, { target: { value: 'plugin-path' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          spec: {
            store: {
              spec: {
                branch: 'testBranch',
                connectorRef: '',
                gitFetchType: 'Branch',
                folderPath: 'test-path',
                repoName: ''
              },
              type: undefined
            },
            pluginPath: 'plugin-path',
            skipResourceVersioning: false
          }
        }
      })
    })
  })
})
