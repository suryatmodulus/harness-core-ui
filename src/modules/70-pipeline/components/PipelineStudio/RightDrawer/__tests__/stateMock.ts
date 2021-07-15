const mock = {
  pipeline: {
    name: 'stage1',
    identifier: 'stage1',
    projectIdentifier: 'Milos2',
    orgIdentifier: 'CV',
    tags: {},
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'CI',
          spec: {
            cloneCodebase: false,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'account.yogesh',
                namespace: 'harness-delegate'
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'step1',
                    identifier: 'step1',
                    spec: {
                      connectorRef: 'harnessImage',
                      image: 'alpine',
                      command: "echo 'run'",
                      privileged: false
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]
  },
  originalPipeline: {
    name: 'stage1',
    identifier: 'stage1',
    projectIdentifier: 'Milos2',
    orgIdentifier: 'CV',
    tags: {},
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'CI',
          spec: {
            cloneCodebase: false,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'account.yogesh',
                namespace: 'harness-delegate'
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'step1',
                    identifier: 'step1',
                    spec: {
                      connectorRef: 'harnessImage',
                      image: 'alpine',
                      command: "echo 'run'",
                      privileged: false
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]
  },
  pipelineIdentifier: '-1',
  pipelineView: {
    isSplitViewOpen: true,
    isDrawerOpened: true,
    splitViewData: {
      type: 'StageView'
    },
    drawerData: {
      type: 'StepConfig',
      data: {
        stepConfig: {
          node: {
            type: 'Run',
            name: 'step1',
            identifier: 'step1',
            spec: {
              connectorRef: 'harnessImage',
              image: 'alpine',
              command: "echo 'run'",
              privileged: false
            }
          },
          stepsMap: new Map(),
          isStepGroup: false,
          addOrEdit: 'edit'
        }
      }
    }
  },
  schemaErrors: false,
  gitDetails: {},
  isLoading: false,
  isBEPipelineUpdated: false,
  isDBInitialized: true,
  isUpdated: true,
  isInitialized: true,
  selectionState: {
    selectedStageId: 's1',
    selectedStepId: 'step1'
  },
  error: ''
}

export default mock
