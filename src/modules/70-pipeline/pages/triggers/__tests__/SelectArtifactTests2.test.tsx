import React from 'react'
import { act, fireEvent, getByText, render } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'

import TriggerFactory from '@pipeline/factories/ArtifactTriggerInputFactory/index'
// eslint-disable-next-line no-restricted-imports
import { ArtifactInputForm } from '@cd/components/ArtifactInputForm/ArtifactInputForm'

import { TriggerFormType } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { SelectArtifactModal } from '../views/modals'

const defaultProps = {
  isModalOpen: true,
  identifier: '',
  stageIdentifier: 'stagea',
  manifestType: 'Gcr',
  name: '',
  formikProps: {
    setValues: jest.fn(),
    values: {
      selectedArtifact: {},
      originalPipeline: {
        name: 'TestPipeline-ABC',
        identifier: 'TestPipelineABC',
        projectIdentifier: 'test',
        orgIdentifier: 'default',
        timeout: '10m',
        tags: {},
        stages: [
          {
            stage: {
              name: 'stagea',
              identifier: 'stagea',
              description: '',
              type: 'Deployment',
              spec: {
                serviceConfig: {
                  serviceRef: 'seveice',
                  serviceDefinition: {
                    type: 'Kubernetes',
                    spec: {
                      variables: [],
                      manifests: [
                        {
                          manifest: {
                            identifier: 'sdfds',
                            type: 'HelmChart',
                            spec: {
                              store: {
                                type: 'S3',
                                spec: {
                                  connectorRef: 'testecr2',
                                  bucketName: '<+input>',
                                  folderPath: '<+input>',
                                  region: 'us-east-1'
                                }
                              },
                              chartName: '<+input>',
                              chartVersion: 'test-chart-verion',
                              helmVersion: 'V2',
                              skipResourceVersioning: false
                            }
                          }
                        },
                        {
                          manifest: {
                            identifier: 'testhelmmanifest',
                            type: 'HelmChart',
                            spec: {
                              store: {
                                type: 'S3',
                                spec: {
                                  connectorRef: 'testecr2',
                                  bucketName: 'sdfds',
                                  folderPath: 'sdfdsf',
                                  region: 'us-gov-east-1'
                                }
                              },
                              chartName: '<+input>',
                              chartVersion: '<+input>',
                              helmVersion: 'V2',
                              skipResourceVersioning: false
                            }
                          }
                        },
                        {
                          manifest: {
                            identifier: 'werewr',
                            type: 'HelmChart',
                            spec: {
                              store: {
                                type: 'S3',
                                spec: {
                                  connectorRef: 'ertretr',
                                  bucketName: 'wewer',
                                  folderPath: 'werew',
                                  region: 'us-gov-east-1'
                                }
                              },
                              chartName: 'werew',
                              chartVersion: '<+input>',
                              helmVersion: 'V2',
                              skipResourceVersioning: false
                            }
                          }
                        }
                      ],
                      artifacts: {
                        sidecars: [
                          {
                            sidecar: {
                              type: 'Gcr',
                              spec: {
                                connectorRef: '<+input>',
                                imagePath: '<+input>',
                                registryHostname: '<+input>',
                                tag: '<+input>'
                              },
                              identifier: 'testsideid'
                            }
                          },
                          {
                            sidecar: {
                              type: 'Gcr',
                              spec: {
                                connectorRef: 'tst',
                                imagePath: '<+input>',
                                registryHostname: '<+input>',
                                tag: 'test'
                              },
                              identifier: 'artifactgcrida'
                            }
                          },
                          {
                            sidecar: {
                              type: 'DockerRegistry',
                              spec: {
                                connectorRef: 'testdockder2',
                                imagePath: 'sdfd',
                                tag: '<+input>'
                              },
                              identifier: 'sdfsdf'
                            }
                          }
                        ],
                        primary: {
                          type: 'Gcr',
                          spec: {
                            connectorRef: 'testgcp1a',
                            imagePath: '<+input>',
                            registryHostname: '<+input>',
                            tag: 'sdfdafd'
                          }
                        }
                      }
                    }
                  }
                },
                infrastructure: {
                  environmentRef: 'TestEnv',
                  infrastructureDefinition: {
                    type: 'KubernetesDirect',
                    spec: {
                      connectorRef: 'testk8s',
                      namespace: 'sdfds',
                      releaseName: 'release-<+INFRA_KEY>'
                    },
                    provisioner: {
                      steps: [
                        {
                          step: {
                            type: 'TerraformDestroy',
                            name: 'xzcxcx',
                            identifier: 'xzcxcx',
                            spec: {
                              provisionerIdentifier: 'xcxzcx',
                              configuration: {
                                type: 'InheritFromApply'
                              }
                            },
                            timeout: '10m'
                          }
                        }
                      ],
                      rollbackSteps: []
                    }
                  },
                  allowSimultaneousDeployments: false
                },
                execution: {
                  steps: [
                    {
                      step: {
                        name: 'Rollout Deployment',
                        identifier: 'rolloutDeployment',
                        type: 'K8sRollingDeploy',
                        timeout: '10m',
                        spec: {
                          skipDryRun: false
                        }
                      }
                    }
                  ],
                  rollbackSteps: [
                    {
                      step: {
                        name: 'Rollback Rollout Deployment',
                        identifier: 'rollbackRolloutDeployment',
                        type: 'K8sRollingRollback',
                        timeout: '10m',
                        spec: {}
                      }
                    }
                  ]
                }
              },
              tags: {},
              failureStrategies: [
                {
                  onFailure: {
                    errors: ['AllErrors'],
                    action: {
                      type: 'StageRollback'
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      pipeline: {
        identifier: 'TestPipelineABC',
        stages: [
          {
            stage: {
              identifier: 'stagea',
              type: 'Deployment',
              spec: {
                serviceConfig: {
                  serviceDefinition: {
                    type: 'Kubernetes',
                    spec: {
                      manifests: [
                        {
                          manifest: {
                            identifier: 'sdfds',
                            type: 'HelmChart',
                            spec: {
                              store: {
                                type: 'S3',
                                spec: {
                                  bucketName: '',
                                  folderPath: ''
                                }
                              },
                              chartName: ''
                            }
                          }
                        },
                        {
                          manifest: {
                            identifier: 'testhelmmanifest',
                            type: 'HelmChart',
                            spec: {
                              chartName: '',
                              chartVersion: ''
                            }
                          }
                        },
                        {
                          manifest: {
                            identifier: 'werewr',
                            type: 'HelmChart',
                            spec: {
                              chartVersion: ''
                            }
                          }
                        }
                      ],
                      artifacts: {
                        sidecars: [
                          {
                            sidecar: {
                              identifier: 'testsideid',
                              type: 'Gcr',
                              spec: {
                                connectorRef: '',
                                imagePath: '',
                                registryHostname: '',
                                tag: ''
                              }
                            }
                          },
                          {
                            sidecar: {
                              identifier: 'artifactgcrida',
                              type: 'Gcr',
                              spec: {
                                imagePath: '',
                                registryHostname: ''
                              }
                            }
                          },
                          {
                            sidecar: {
                              identifier: 'sdfsdf',
                              type: 'DockerRegistry',
                              spec: {
                                tag: ''
                              }
                            }
                          }
                        ],
                        primary: {
                          type: 'Gcr',
                          spec: {
                            imagePath: '',
                            registryHostname: ''
                          }
                        }
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
      artifactId: 'Primary',
      artifactLabel: 'stagea: Primary',
      artifactRepository: 'Runtime Input',
      buildTag: undefined,
      disabled: false,
      hasRuntimeInputs: true,
      isStageOverrideManifest: false,
      location: undefined,
      stageId: 'stagea',
      version: undefined
    }
  ],
  closeModal: jest.fn(),
  isManifest: false,

  runtimeData: []
}

const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: mockRegions, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Select Artifact - For Artifact tests', () => {
  beforeAll(() => {
    TriggerFactory.registerTriggerForm(TriggerFormType.Artifact, {
      component: ArtifactInputForm
    })
  })

  test('initial render', () => {
    render(
      <TestWrapper>
        <SelectArtifactModal {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement

    expect(dialog).toMatchSnapshot()
  })
  test('on click of select button', async () => {
    render(
      <TestWrapper>
        <SelectArtifactModal {...defaultProps} />
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
      expect(dialog).toMatchSnapshot()
    })
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

    const dialog = findDialogContainer() as HTMLElement

    await act(async () => {
      const firstRow = dialog.querySelector('.TableV2--table .TableV2--body .TableV2--row:first-child')
      const radioBtn = firstRow?.querySelector('input[name=artifactLabel]')
      fireEvent.click(radioBtn!)
    })

    await act(async () => {
      const selectBtn = getByText(dialog, 'select')

      expect(selectBtn).not.toBeDisabled()

      fireEvent.click(selectBtn!)
    })

    await act(async () => {
      const applyBtn = getByText(dialog, 'filters.apply')

      fireEvent.click(applyBtn!)

      expect(defaultProps.closeModal).toBeCalled()
      expect(dialog).toMatchSnapshot()
    })
  })

  test('when selected tag is not runtime input', async () => {
    const props = {
      isModalOpen: true,
      identifier: '',
      stageIdentifier: 'stagea',
      manifestType: 'Gcr',
      name: '',
      formikProps: {
        setValues: jest.fn(),
        values: {
          selectedArtifact: {},
          originalPipeline: {
            name: 'TestPipeline-ABC',
            identifier: 'TestPipelineABC',
            projectIdentifier: 'test',
            orgIdentifier: 'default',
            timeout: '10m',
            tags: {},
            stages: [
              {
                stage: {
                  name: 'stagea',
                  identifier: 'stagea',
                  description: '',
                  type: 'Deployment',
                  spec: {
                    serviceConfig: {
                      serviceRef: 'seveice',
                      serviceDefinition: {
                        type: 'Kubernetes',
                        spec: {
                          variables: [],
                          manifests: [
                            {
                              manifest: {
                                identifier: 'sdfds',
                                type: 'HelmChart',
                                spec: {
                                  store: {
                                    type: 'S3',
                                    spec: {
                                      connectorRef: 'testecr2',
                                      bucketName: '<+input>',
                                      folderPath: '<+input>',
                                      region: 'us-east-1'
                                    }
                                  },
                                  chartName: '<+input>',
                                  chartVersion: 'test-chart-verion',
                                  helmVersion: 'V2',
                                  skipResourceVersioning: false
                                }
                              }
                            },
                            {
                              manifest: {
                                identifier: 'testhelmmanifest',
                                type: 'HelmChart',
                                spec: {
                                  store: {
                                    type: 'S3',
                                    spec: {
                                      connectorRef: 'testecr2',
                                      bucketName: 'sdfds',
                                      folderPath: 'sdfdsf',
                                      region: 'us-gov-east-1'
                                    }
                                  },
                                  chartName: '<+input>',
                                  chartVersion: '<+input>',
                                  helmVersion: 'V2',
                                  skipResourceVersioning: false
                                }
                              }
                            },
                            {
                              manifest: {
                                identifier: 'werewr',
                                type: 'HelmChart',
                                spec: {
                                  store: {
                                    type: 'S3',
                                    spec: {
                                      connectorRef: 'ertretr',
                                      bucketName: 'wewer',
                                      folderPath: 'werew',
                                      region: 'us-gov-east-1'
                                    }
                                  },
                                  chartName: 'werew',
                                  chartVersion: '<+input>',
                                  helmVersion: 'V2',
                                  skipResourceVersioning: false
                                }
                              }
                            }
                          ],
                          artifacts: {
                            sidecars: [
                              {
                                sidecar: {
                                  type: 'Gcr',
                                  spec: {
                                    connectorRef: '<+input>',
                                    imagePath: '<+input>',
                                    registryHostname: '<+input>',
                                    tag: '<+input>'
                                  },
                                  identifier: 'testsideid'
                                }
                              },
                              {
                                sidecar: {
                                  type: 'Gcr',
                                  spec: {
                                    connectorRef: 'tst',
                                    imagePath: '<+input>',
                                    registryHostname: '<+input>',
                                    tag: 'test'
                                  },
                                  identifier: 'artifactgcrida'
                                }
                              },
                              {
                                sidecar: {
                                  type: 'DockerRegistry',
                                  spec: {
                                    connectorRef: 'testdockder2',
                                    imagePath: 'sdfd',
                                    tag: 'test'
                                  },
                                  identifier: 'sdfsdf'
                                }
                              }
                            ],
                            primary: {
                              type: 'Gcr',
                              spec: {
                                connectorRef: 'testgcp1a',
                                imagePath: '<+input>',
                                registryHostname: '<+input>',
                                tag: 'sdfdafd'
                              }
                            }
                          }
                        }
                      }
                    },
                    infrastructure: {
                      environmentRef: 'TestEnv',
                      infrastructureDefinition: {
                        type: 'KubernetesDirect',
                        spec: {
                          connectorRef: 'testk8s',
                          namespace: 'sdfds',
                          releaseName: 'release-<+INFRA_KEY>'
                        },
                        provisioner: {
                          steps: [
                            {
                              step: {
                                type: 'TerraformDestroy',
                                name: 'xzcxcx',
                                identifier: 'xzcxcx',
                                spec: {
                                  provisionerIdentifier: 'xcxzcx',
                                  configuration: {
                                    type: 'InheritFromApply'
                                  }
                                },
                                timeout: '10m'
                              }
                            }
                          ],
                          rollbackSteps: []
                        }
                      },
                      allowSimultaneousDeployments: false
                    },
                    execution: {
                      steps: [
                        {
                          step: {
                            name: 'Rollout Deployment',
                            identifier: 'rolloutDeployment',
                            type: 'K8sRollingDeploy',
                            timeout: '10m',
                            spec: {
                              skipDryRun: false
                            }
                          }
                        }
                      ],
                      rollbackSteps: [
                        {
                          step: {
                            name: 'Rollback Rollout Deployment',
                            identifier: 'rollbackRolloutDeployment',
                            type: 'K8sRollingRollback',
                            timeout: '10m',
                            spec: {}
                          }
                        }
                      ]
                    }
                  },
                  tags: {},
                  failureStrategies: [
                    {
                      onFailure: {
                        errors: ['AllErrors'],
                        action: {
                          type: 'StageRollback'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          },
          pipeline: {
            identifier: 'TestPipelineABC',
            stages: [
              {
                stage: {
                  identifier: 'stagea',
                  type: 'Deployment',
                  spec: {
                    serviceConfig: {
                      serviceDefinition: {
                        type: 'Kubernetes',
                        spec: {
                          manifests: [
                            {
                              manifest: {
                                identifier: 'sdfds',
                                type: 'HelmChart',
                                spec: {
                                  store: {
                                    type: 'S3',
                                    spec: {
                                      bucketName: '',
                                      folderPath: ''
                                    }
                                  },
                                  chartName: ''
                                }
                              }
                            },
                            {
                              manifest: {
                                identifier: 'testhelmmanifest',
                                type: 'HelmChart',
                                spec: {
                                  chartName: '',
                                  chartVersion: ''
                                }
                              }
                            },
                            {
                              manifest: {
                                identifier: 'werewr',
                                type: 'HelmChart',
                                spec: {
                                  chartVersion: ''
                                }
                              }
                            }
                          ],
                          artifacts: {
                            sidecars: [
                              {
                                sidecar: {
                                  identifier: 'testsideid',
                                  type: 'Gcr',
                                  spec: {
                                    connectorRef: '',
                                    imagePath: '',
                                    registryHostname: '',
                                    tag: ''
                                  }
                                }
                              },
                              {
                                sidecar: {
                                  identifier: 'artifactgcrida',
                                  type: 'Gcr',
                                  spec: {
                                    imagePath: '',
                                    registryHostname: ''
                                  }
                                }
                              },
                              {
                                sidecar: {
                                  identifier: 'sdfsdf',
                                  type: 'DockerRegistry',
                                  spec: {
                                    tag: ''
                                  }
                                }
                              }
                            ],
                            primary: {
                              type: 'Gcr',
                              spec: {
                                imagePath: '',
                                registryHostname: ''
                              }
                            }
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
          artifactId: 'Primary',
          artifactLabel: 'stagea: Primary',
          artifactRepository: 'Runtime Input',
          buildTag: 'test',
          disabled: false,
          hasRuntimeInputs: true,
          isStageOverrideManifest: false,
          location: undefined,
          stageId: 'stagea',
          version: undefined
        }
      ],
      closeModal: jest.fn(),
      isManifest: false,

      runtimeData: []
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
