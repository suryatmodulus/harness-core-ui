import React from 'react'
import { act, fireEvent, getByText, render } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'

import { SelectArtifactModal } from '../views/modals'

const defaultProps = {
  isModalOpen: true,
  formikProps: {
    values: {
      originalPipeline: {
        identifier: 'stagea',
        name: 'stagea',
        orgIdentifier: 'default',
        stages: [
          {
            stage: {
              name: 'stagea',
              identifier: 'stagea',
              spec: {
                execution: {
                  steps: [],
                  rollbackSteps: []
                },
                infrastructure: {
                  allowSimultaneousDeployments: false,
                  environmentRef: 'TestEnv',
                  infrastructureDefinition: {
                    provisioner: {
                      steps: [],
                      rollbackSteps: []
                    },
                    spec: {
                      connectorRef: 'test',
                      namespace: 'test',
                      releaseName: 'test-name'
                    },
                    type: 'KubernetesDirect'
                  },
                  serviceConfig: {
                    serviceRef: 'seveice',
                    serviceDefinition: {
                      spec: {
                        manifests: [
                          {
                            manifest: {
                              identifier: 'testhelmmanifest',
                              spec: {
                                chartName: '<+input>',
                                chartVersion: '<+input>',
                                helmVersion: 'V2',
                                skipResourceVersioning: false
                              },
                              store: {
                                type: 's3',
                                spec: {
                                  bucketName: '<+input>',
                                  connectorRef: 'testecr2',
                                  folderPath: '<+input>',
                                  region: '<+input>'
                                }
                              }
                            }
                          }
                        ],
                        variables: []
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  },
  artifactTableData: [
    {
      artifactId: 'dsfds',
      artifactLabel: 'stagea: dsfds',
      artifactRepository: undefined,
      hasRuntimeInputs: true,
      stageId: 'stagea'
    }
  ],
  closeModal: jest.fn(),
  isManifest: true,
  runtimeData: [
    {
      stage: {
        identifier: 'stagea',
        spec: {
          serviceConfig: {
            serviceDefinition: {
              spec: {
                manifests: [
                  {
                    manifest: {
                      identifier: 'testhelmmanifest',
                      spec: {
                        chartName: '<+input>',
                        chartVersion: '<+input>',
                        helmVersion: 'V2',
                        skipResourceVersioning: false
                      },
                      store: {
                        type: 's3',
                        spec: {
                          bucketName: '<+input>',
                          connectorRef: 'testecr2',
                          folderPath: '<+input>',
                          region: '<+input>'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  ]
}

jest.mock('@pipeline/factories/ArtifactTriggerInputFactory', () => ({
  getTriggerFormDetails: jest.fn().mockImplementation(() => () => {
    return {
      component: <div>ABC</div>
    }
  })
}))
describe('Select Artifact Modal tests', () => {
  test('inital Render', () => {
    render(
      <TestWrapper>
        <SelectArtifactModal {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement

    expect(dialog).toMatchSnapshot()
  })

  test('on click of cancel button', async () => {
    render(
      <TestWrapper>
        <SelectArtifactModal {...defaultProps} />
      </TestWrapper>
    )
    await act(async () => {
      const dialog = findDialogContainer() as HTMLElement
      const cancelBtn = getByText(dialog, 'cancel')

      fireEvent.click(cancelBtn!)

      expect(defaultProps.closeModal).toBeCalled()
    })
  })

  test('on click of select button', async () => {
    render(
      <TestWrapper>
        <SelectArtifactModal {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement

    await act(async () => {
      const firstRow = dialog.querySelector('.table .body .row:first-child')
      const radioBtn = firstRow?.querySelector('input[name=artifactLabel]')
      fireEvent.click(radioBtn!)
    })

    await act(async () => {
      const selectBtn = getByText(dialog, 'select')

      expect(selectBtn).not.toBeDisabled()
    })
  })
})
