import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import { Scope } from '@common/interfaces/SecretsInterface'
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

  test('expand advanced section', () => {
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
    const { container, getByText } = render(
      <TestWrapper>
        <KustomizeWithGIT {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test('runtime value for connector should make runtime for repo too', () => {
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

    const defaultProps = {
      ...props,
      prevStepData: {
        store: 'Git',
        connectorRef: '<+input>'
      }
    }
    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT {...defaultProps} initialValues={initialValues} />
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

  test('when connectiontype is of repo', () => {
    const initialValues = {
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
            folderPath: './temp',
            skipResourceVersioning: true,
            repoName: 'someurl/repoName',
            pluginPath: ''
          }
        }
      }
    }
    const defaultProps = {
      ...props,
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
      }
    }
    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test(`should renderCommit id`, () => {
    const initialValues = {
      identifier: 'id12',

      spec: {
        store: {
          spec: {
            commitId: 'awsd123sd',
            gitFetchType: 'Commit',
            folderPath: './temp',
            skipResourceVersioning: true,
            repoName: 'someurl/repoName',
            pluginPath: ''
          },
          type: 'Git'
        }
      }
    }

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
      }
    }
    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...defaultProps} />
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

  test('when scope is of account', () => {
    const initialValues = {
      identifier: 'id12',

      spec: {
        store: {
          spec: {
            commitId: 'awsd123sd',
            gitFetchType: 'Commit',
            folderPath: './temp',
            connectorRef: 'account.test',
            skipResourceVersioning: true,
            repoName: 'someurl/repoName',
            pluginPath: ''
          },
          type: 'Git'
        }
      }
    }

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
      }
    }

    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...defaultProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload when gitfetchtype is commit', async () => {
    const initialValues = {
      identifier: 'testidentifier',

      spec: {
        store: {
          spec: {
            commitId: 'awsd123sd',
            gitFetchType: 'Commit',
            folderPath: './temp',
            connectorRef: 'account.test',
            skipResourceVersioning: true,
            repoName: 'someurl/repoName',
            pluginPath: ''
          },
          type: 'Git'
        }
      }
    }

    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Commit' } })

      fireEvent.change(queryByNameAttribute('commitId')!, { target: { value: 'test-commit' } })
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
                commitId: 'test-commit',
                connectorRef: '',
                gitFetchType: 'Commit',
                folderPath: 'test-path',
                repoName: ''
              },
              type: undefined
            },
            pluginPath: 'plugin-path',
            skipResourceVersioning: undefined
          }
        }
      })
    })
  })

  test(`should renderCommit id`, () => {
    const initialValues = {
      identifier: 'id12',

      spec: {
        store: {
          spec: {
            commitId: 'awsd123sd',
            gitFetchType: 'Commit',
            folderPath: './temp',
            skipResourceVersioning: true,
            repoName: 'someurl/repoName',
            pluginPath: ''
          },
          type: 'Git'
        }
      }
    }

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
      }
    }
    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...defaultProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
