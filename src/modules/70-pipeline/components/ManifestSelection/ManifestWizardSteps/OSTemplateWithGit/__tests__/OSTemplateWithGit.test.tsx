import React from 'react'
import { render, fireEvent, act, wait, queryByAttribute } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import OpenShiftTemplateWithGit from '../OSTemplateWithGit'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  initialValues: {
    identifier: 'test',
    branch: 'master',
    commitId: 'test-commit',
    gitFetchType: 'Branch',
    paths: ['test'],
    skipResourceVersioning: false,
    repoName: 'repo-test'
  },
  handleSubmit: jest.fn()
}
describe('Open shift template with git tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <OpenShiftTemplateWithGit {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with right payload', async () => {
    const { container } = render(
      <TestWrapper>
        <OpenShiftTemplateWithGit {...props} />
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
    await wait(() => {
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
