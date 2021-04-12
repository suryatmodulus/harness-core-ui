import React from 'react'
import { render, fireEvent, act, queryByAttribute, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import OpenShiftTemplateWithGit from '../OSTemplateWithGit'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  handleSubmit: jest.fn()
}
describe('Open shift template with git tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      branch: '',
      commitId: '',
      gitFetchType: 'Branch',
      paths: [],
      skipResourceVersioning: false,
      repoName: ''
    }
    const { container } = render(
      <TestWrapper>
        <OpenShiftTemplateWithGit {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'test',
      commitId: 'test-commit',
      gitFetchType: 'Commit',
      paths: ['test'],
      skipResourceVersioning: false,
      repoName: 'repo-test'
    }
    const { container } = render(
      <TestWrapper>
        <OpenShiftTemplateWithGit {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with right payload', async () => {
    const initialValues = {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: [],
      skipResourceVersioning: false,
      repoName: ''
    }
    const { container } = render(
      <TestWrapper>
        <OpenShiftTemplateWithGit {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('path')!, { target: { value: 'test-path' } })
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
                commitId: undefined,
                connectorRef: '',
                gitFetchType: 'Branch',
                paths: ['test-path'],
                repoName: ''
              },
              type: undefined
            },
            skipResourceVersioning: false
          }
        }
      })
    })
  })
})
