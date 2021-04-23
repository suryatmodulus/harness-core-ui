import React from 'react'
import { render, fireEvent, act, wait, queryByAttribute } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

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

  test('when branch is runtime input', () => {
    const defaultProps = {
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',

        branch: RUNTIME_INPUT_VALUE,

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
    const { container } = render(
      <TestWrapper>
        <OpenShiftParamWithGit {...defaultProps} />
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

  test('submits with right payload - for nongit types', async () => {
    const defaultProps = {
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',

        branch: 'master',
        gitFetchType: 'Branch',
        paths: ['test'],
        skipResourceVersioning: false
      },
      prevStepData: {
        connectorRef: 'account.github-1',
        store: 'Github'
      },
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <OpenShiftParamWithGit {...defaultProps} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'test' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'master' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    expect(container).toMatchSnapshot()
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

  test('renders form in edit mode - when gitfetchtype is commitid', () => {
    const defaultProps = {
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'testidentifier',
        spec: {
          store: {
            spec: {
              commitId: 'testCommit',
              connectorRef: '',
              gitFetchType: 'Commit',
              paths: ['test', 'test2'],
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

  test('runtime value for connector should make runtime for repo too', () => {
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
        store: 'Git',
        connectorRef: '<+input>'
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

  test('when connectionType is of repo', () => {
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
              connectorRef: {
                label: 'test',
                value: 'test',
                scope: 'Account',
                connector: {
                  spec: {
                    connectionType: 'Repo'
                  }
                }
              },
              gitFetchType: 'Branch',
              paths: [],
              repoName: ''
            },
            type: 'Git'
          }
        }
      },
      prevStepData: {
        store: 'Git',
        connectorRef: {
          label: 'test',
          value: 'test',
          scope: 'Account',
          connector: {
            spec: {
              connectionType: 'Repo'
            }
          }
        }
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

  test('when scope is of account', () => {
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
              connectorRef: 'account.test',
              gitFetchType: 'Branch',
              paths: [],
              repoName: ''
            },
            type: 'Git'
          }
        }
      },
      prevStepData: {
        store: 'Git',
        connectorRef: 'account.test'
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
