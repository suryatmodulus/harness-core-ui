import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { Scope } from '@common/interfaces/SecretsInterface'
import ManifestDetails from '../ManifestDetails'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  handleSubmit: jest.fn(),
  selectedManifest: 'Values'
}
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
describe('Manifest Details tests', () => {
  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <ManifestDetails {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when branch is runtime input', () => {
    const defaultProps = {
      ...props,
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
        <ManifestDetails {...defaultProps} initialValues={initialValues} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('submits with right payload', async () => {
    const prevStepData = {
      connectorRef: {
        connector: {
          spec: {
            connectionType: 'Account',
            url: 'accounturl-test'
          }
        }
      },
      store: 'Git'
    }
    const { container } = render(
      <TestWrapper>
        <ManifestDetails {...props} prevStepData={prevStepData} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })
      fireEvent.change(queryByNameAttribute('repoName')!, { target: { value: 'repo-name' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledTimes(1)
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
                paths: ['test-path'],
                repoName: 'repo-name'
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
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Git'
      },
      selectedManifest: 'Values',
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ManifestDetails {...defaultProps} />
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
              commitId: 'test-commit',
              connectorRef: '',
              gitFetchType: 'Commit',
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Git'
      },
      selectedManifest: 'Values',
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ManifestDetails {...defaultProps} />
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
              commitId: 'test-commit',
              connectorRef: '',
              gitFetchType: 'Commit',
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Git',
        connectorRef: '<+input>'
      },
      selectedManifest: 'Values',
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ManifestDetails {...defaultProps} />
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
              commitId: 'test-commit',
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
              gitFetchType: 'Commit',
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
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
      selectedManifest: 'Values',
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ManifestDetails {...defaultProps} />
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
              commitId: 'test-commit',
              connectorRef: 'account.test',
              gitFetchType: 'Commit',
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Git',
        connectorRef: {
          label: 'test',
          value: 'test',
          scope: Scope.ACCOUNT,
          connector: {
            identifier: 'test'
          }
        }
      },
      selectedManifest: 'Values',
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ManifestDetails {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when selected manifest is of type K8sManifest', async () => {
    const defaultProps = {
      ...props,
      prevStepData: {
        store: 'Git',
        connectorRef: {
          connector: {
            spec: {
              connectionType: 'Account',
              url: 'accounturl-test'
            }
          }
        }
      },
      initialValues,
      selectedManifest: 'K8sManifest',
      handleSubmit: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <ManifestDetails {...defaultProps} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })
      fireEvent.change(queryByNameAttribute('repoName')!, { target: { value: 'repo-name' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledTimes(1)
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
                paths: ['test-path'],
                repoName: 'repo-name'
              },
              type: 'Git'
            }
          }
        }
      })
    })
  })

  test('expand advanced section - when type is k8smanifest', () => {
    const defaultProps = {
      ...props,
      prevStepData: {
        store: 'Git',
        connectorRef: {
          label: 'test',
          value: 'test',
          scope: Scope.ACCOUNT,
          connector: {
            identifier: 'test'
          }
        }
      },
      initialValues,
      selectedManifest: 'K8sManifest',
      handleSubmit: jest.fn()
    }

    const { container, getByText } = render(
      <TestWrapper>
        <ManifestDetails {...defaultProps} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })
})
