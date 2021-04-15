import React from 'react'
import { render, fireEvent, act, wait, queryByAttribute } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import OpenShiftParamWithGit from '../OSWithGit'

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
  prevStepData: {
    connectorRef: 'connectorRef',
    store: 'Git'
  },
  handleSubmit: jest.fn()
}
describe('Open shift params with git tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <OpenShiftParamWithGit {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('submits with right payload', async () => {
    const { container } = render(
      <TestWrapper>
        <OpenShiftParamWithGit {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
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
                connectorRef: undefined,
                gitFetchType: 'Branch',
                paths: [],
                repoName: undefined
              },
              type: 'Git'
            }
          }
        }
      })
    })
  })

  test('renders form in edit mode', () => {
    const defaultProps = {
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'testidentifier',
        spec: {
          store: {
            spec: {
              branch: 'testBranch',
              commitId: undefined,
              connectorRef: '',
              gitFetchType: 'Branch',
              paths: [],
              repoName: ''
            },
            type: 'Git'
          }
        }
      },
      prevStepData: {
        store: 'Git'
      },
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <OpenShiftParamWithGit {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
