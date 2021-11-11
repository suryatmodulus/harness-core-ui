import React from 'react'
import { act, fireEvent, getByText, render } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'

import TriggerFactory from '@pipeline/factories/ArtifactTriggerInputFactory/index'
// eslint-disable-next-line no-restricted-imports
import { ManifestInputForm } from '@cd/components/ManifestInputForm/ManifestInputForm'

import { TriggerFormType } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { SelectArtifactModal } from '../views/modals'

const defaultProps = {
  isModalOpen: true,
  identifier: 'testhelmmanifest',
  stageIdentifier: 'stagea',
  manifestType: 'HelmChart',
  name: 'testhelmmanifest',
  formikProps: {
    setValues: jest.fn(),
    values: {
      selectedArtifact: {
        identifier: 'testhelmmanifest',
        spec: {
          chartName: 'test',
          chartVersion: '<+trigger.manifest.version>'
        },
        store: {
          type: 's3',
          spec: {
            bucketName: 'test-bucket',
            connectorRef: 'testecr2',
            folderPath: 'test-path-1',
            region: 'regionA'
          }
        }
      },
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
      },
      pipeline: {
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

const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: mockRegions, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Select Artifact Modal tests', () => {
  beforeAll(() => {
    TriggerFactory.registerTriggerForm(TriggerFormType.Manifest, {
      component: ManifestInputForm
    })
  })
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

  test('on click of apply button', async () => {
    render(
      <TestWrapper>
        <SelectArtifactModal {...defaultProps} />
      </TestWrapper>
    )

    await act(async () => {
      const dialog = findDialogContainer() as HTMLElement
      const applyBtn = getByText(dialog, 'filters.apply')

      fireEvent.click(applyBtn!)

      expect(defaultProps.closeModal).toBeCalled()
    })
  })

  test('on click of select button', async () => {
    const props = {
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

    render(
      <TestWrapper>
        <SelectArtifactModal {...props} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement

    await act(async () => {
      expect(dialog).toMatchSnapshot()
      const firstRow = dialog.querySelector('.TableV2--table .TableV2--body .TableV2--row:first-child')
      const radioBtn = firstRow?.querySelector('input[name=artifactLabel]')
      fireEvent.click(radioBtn!)
    })

    await act(async () => {
      const selectBtn = getByText(dialog, 'select')

      expect(selectBtn).not.toBeDisabled()
    })
  })

  test('when selected manifest-chart is not runtime input', async () => {
    const props = {
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

                                    store: {
                                      type: 's3',
                                      spec: {
                                        bucketName: '<+input>',
                                        folderPath: '<+input>'
                                      }
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
          artifactId: 'testhelmmanifest',
          artifactLabel: 'stagea: testhelmmanifest',
          artifactRepository: 'testecr2',
          disabled: true,
          hasRuntimeInputs: true,
          isStageOverrideManifest: false,
          location: 'Runtime Input',
          stageId: 'stagea',
          version: 'Runtime Input'
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

                            store: {
                              type: 's3',
                              spec: {
                                bucketName: '<+input>',
                                folderPath: '<+input>'
                              }
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

    render(
      <TestWrapper>
        <SelectArtifactModal {...props} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement

    await act(async () => {
      const firstRow = dialog.querySelector('.TableV2--table .TableV2--body .TableV2--row:first-child')
      const radioBtn = firstRow?.querySelector('input[name=artifactLabel]')
      fireEvent.click(radioBtn!)
    })

    await act(async () => {
      const selectBtn = getByText(dialog, 'select')

      expect(selectBtn).not.toBeDisabled()
    })

    expect(dialog).toMatchSnapshot()
  })
})
