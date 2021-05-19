import React from 'react'
import {
  Layout,
  Card,
  Icon,
  Text,
  SelectOption,
  IconName,
  Radio,
  Select,
  Checkbox,
  HarnessDocTooltip
} from '@wings-software/uicore'

import isEmpty from 'lodash-es/isEmpty'
import cx from 'classnames'
import { cloneDeep, debounce, get, set } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import produce from 'immer'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ServiceConfig, StageElementConfig } from 'services/cd-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getStageIndexFromPipeline,
  getFlattenedStages
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { K8SDirectServiceStep } from '../../PipelineSteps/K8sServiceSpec/K8sServiceSpec'
import css from './DeployServiceSpecifications.module.scss'
const setupMode = {
  PROPAGATE: 'PROPAGATE',
  DIFFERENT: 'DIFFERENT'
}

export default function DeployServiceSpecifications(props: React.PropsWithChildren<unknown>): JSX.Element {
  const { getString } = useStrings()

  const supportedDeploymentTypes: { name: string; icon: IconName; enabled: boolean }[] = [
    {
      name: getString('serviceDeploymentTypes.kubernetes'),
      icon: 'service-kubernetes',
      enabled: true
    },
    {
      name: getString('serviceDeploymentTypes.amazonEcs'),
      icon: 'service-ecs',
      enabled: false
    },
    {
      name: getString('serviceDeploymentTypes.amazonAmi'),
      icon: 'main-service-ami',
      enabled: false
    },
    {
      name: getString('serviceDeploymentTypes.awsCodeDeploy'),
      icon: 'app-aws-code-deploy',
      enabled: false
    },
    {
      name: getString('serviceDeploymentTypes.winrm'),
      icon: 'command-winrm',
      enabled: false
    },
    {
      name: getString('serviceDeploymentTypes.awsLambda'),
      icon: 'app-aws-lambda',
      enabled: false
    },
    {
      name: getString('serviceDeploymentTypes.pcf'),
      icon: 'service-pivotal',
      enabled: false
    },
    {
      name: getString('serviceDeploymentTypes.ssh'),
      icon: 'secret-ssh',
      enabled: false
    }
  ]
  const [setupModeType, setSetupMode] = React.useState('')
  const [checkedItems, setCheckedItems] = React.useState({ overrideSetCheckbox: false })
  const [isConfigVisible, setConfigVisibility] = React.useState(false)
  const [selectedPropagatedState, setSelectedPropagatedState] = React.useState<SelectOption>()
  const [canPropagate, setCanPropagate] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const previousStageList: { label: string; value: string }[] = []
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    isReadonly,
    getStageFromPipeline,
    updateStage
  } = React.useContext(PipelineContext)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = React.useCallback(
    debounce((stage: StageElementConfig) => {
      return updateStage(stage)
    }, 500),
    [updateStage]
  )

  const { stage = {} } = getStageFromPipeline(selectedStageId || '')
  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { stages } = getFlattenedStages(pipeline)
  const [parentStage, setParentStage] = React.useState<{ [key: string]: any }>({})

  React.useEffect(() => {
    if (stages && stages.length > 0) {
      const currentStageType = stage?.stage?.type
      stages.forEach((item, index) => {
        if (
          index < stageIndex &&
          currentStageType === item?.stage?.type &&
          !get(item.stage, `spec.serviceConfig.useFromStage.stage`)
        ) {
          previousStageList.push({
            label: `Previous Stage ${item.stage.name} [${item.stage.identifier}]`,
            value: item.stage.identifier
          })
        }
      })
    }
    if (isEmpty(parentStage) && stage?.stage?.spec?.serviceConfig?.useFromStage?.stage) {
      const parentStageName = stage?.stage?.spec?.serviceConfig?.useFromStage?.stage
      const { index } = getStageIndexFromPipeline(pipeline, parentStageName)
      setParentStage(stages[index])
    }
  }, [stages])

  React.useEffect(() => {
    if (stage?.stage) {
      const newState = cloneDeep(stage)

      if (!newState.stage.spec) {
        newState.stage.spec = {}
      }
      if (
        !newState.stage.spec.serviceConfig?.serviceDefinition &&
        setupModeType === setupMode.DIFFERENT &&
        !newState.stage.spec.serviceConfig?.useFromStage?.stage
      ) {
        setDefaultServiceSchema()
        setSelectedPropagatedState({ label: '', value: '' })
        setSetupMode(setupMode.DIFFERENT)
      } else if (
        setupModeType === setupMode.PROPAGATE &&
        stageIndex > 0 &&
        !newState.stage.spec.serviceConfig?.serviceDefinition &&
        !newState.stage.spec.serviceConfig?.useFromStage?.stage
      ) {
        newState.stage.spec = {
          serviceConfig: {
            useFromStage: {
              stage: null
            },
            stageOverrides: {}
          }
        }

        debounceUpdateStage(newState.stage)

        setSetupMode(setupMode.PROPAGATE)
      }
    }
  }, [setupModeType, stageIndex, stage?.stage])

  const setDefaultServiceSchema = (): Promise<void> => {
    const newStage = {
      ...stage.stage.spec,
      serviceConfig: {
        serviceRef: '',
        serviceDefinition: {
          type: 'Kubernetes',
          spec: {
            artifacts: {
              // primary: null,
              sidecars: []
            },
            manifests: [],
            // variables: [],
            artifactOverrideSets: [],
            manifestOverrideSets: []
            // variableOverrideSets: []
          }
        }
      }
    }

    return debounceUpdateStage(newStage.stage)
  }

  const setStageOverrideSchema = (): Promise<void> => {
    const newStage = {
      ...stage.stage.spec,
      serviceConfig: {
        ...stage?.stage?.spec.serviceConfig,
        stageOverrides: {
          artifacts: {
            // primary: null,
            sidecars: []
          },
          manifests: [],
          variables: []
        }
      }
    }
    if (stage.stage.spec?.serviceConfig.serviceDefinition) {
      delete stage.stage.spec?.serviceConfig.serviceDefinition
    }
    return debounceUpdateStage(newStage)
  }

  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const _isChecked = (event.target as HTMLInputElement).checked
    setCheckedItems({
      ...checkedItems,
      overrideSetCheckbox: _isChecked
    })
    if (_isChecked) {
      setStageOverrideSchema()
    } else {
      if (stage?.stage?.spec?.serviceConfig?.stageOverrides) {
        delete stage?.stage?.spec?.serviceConfig?.stageOverrides
      }
    }
  }
  React.useEffect(() => {
    const newState = cloneDeep(stage)

    if (
      !newState?.stage?.spec?.serviceConfig?.serviceDefinition?.type &&
      !newState?.stage?.spec.serviceConfig?.useFromStage
    ) {
      set(newState, 'stage.spec.serviceConfig.serviceDefinition.type', 'Kubernetes')
      updateStage(newState as StageElementConfig)
    }
    if (!newState?.stage?.spec?.serviceConfig?.serviceDefinition && !stage?.stage?.spec.serviceConfig?.useFromStage) {
      set(newState, 'stage.spec.serviceConfig.serviceDefinition', {})
      updateStage(newState as StageElementConfig)
    }
    let hasStageOfSameType = false
    const currentStageType = stage?.stage?.type

    for (let index = 0; index < stageIndex; index++) {
      if (stages[index]?.stage?.type === currentStageType) {
        hasStageOfSameType = true
      }
    }

    setCanPropagate(hasStageOfSameType)
  }, [])

  React.useEffect(() => {
    if (stageIndex === 0) {
      setSetupMode(setupMode.DIFFERENT)
    }
  }, [stageIndex])

  React.useEffect(() => {
    const useFromStage = stage?.stage?.spec?.serviceConfig?.useFromStage
    const stageOverrides = stage?.stage?.spec?.serviceConfig?.stageOverrides
    const serviceDefinition = stage?.stage?.spec.serviceConfig?.serviceDefinition

    if (useFromStage) {
      setSetupMode(setupMode.PROPAGATE)
      if (previousStageList && previousStageList.length > 0) {
        const selectedIdentifier = useFromStage?.stage
        const selectedOption = previousStageList.find(v => v.value === selectedIdentifier)

        if (selectedOption?.value !== selectedPropagatedState?.value) {
          setSelectedPropagatedState(selectedOption)
          if (stageOverrides) {
            if (!checkedItems.overrideSetCheckbox) {
              setCheckedItems({
                ...checkedItems,
                overrideSetCheckbox: true
              })
              if (!isConfigVisible) {
                setConfigVisibility(true)
              }
            }
          } else {
            setCheckedItems({
              ...checkedItems,
              overrideSetCheckbox: false
            })
            setConfigVisibility(false)
          }
          // debounceUpdatePipeline(pipeline)
        }
      }
      if (stageOverrides) {
        if (!checkedItems.overrideSetCheckbox) {
          setCheckedItems({
            ...checkedItems,
            overrideSetCheckbox: true
          })
          if (!isConfigVisible) {
            setConfigVisibility(true)
          }
        }
        if (!setupModeType) {
          setSetupMode(setupMode.PROPAGATE)
        }
      }
    } else if (serviceDefinition) {
      setSelectedPropagatedState({ label: '', value: '' })
      setSetupMode(setupMode.DIFFERENT)
    }
  }, [stage?.stage?.spec])
  const selectPropagatedStep = (item: SelectOption): void => {
    const newStage = cloneDeep(stage)
    if (item && item.value) {
      set(newStage, 'stage.spec.serviceConfig.useFromStage', { stage: item.value })

      setSelectedPropagatedState({
        label: `Stage [${item.value as string}] - Service`,
        value: item.value
      })
      if (newStage?.stage?.spec?.serviceConfig?.serviceDefinition) {
        delete newStage.stage.spec.serviceConfig.serviceDefinition
      }
      if (newStage?.stage?.spec?.serviceConfig?.serviceRef !== undefined) {
        delete newStage.stage.spec.serviceConfig.serviceRef
      }

      updateStage(newStage as StageElementConfig)
    }
  }
  const initWithServiceDefinition = (): void => {
    setDefaultServiceSchema().then(() => {
      setSelectedPropagatedState({ label: '', value: '' })
      setSetupMode(setupMode.DIFFERENT)
    })
  }

  return (
    <>
      {stageIndex > 0 && canPropagate && (
        <div className={css.stageSelection}>
          <section className={cx(css.stageSelectionGrid)}>
            <div className={css.radioColumn}>
              <Radio
                checked={setupModeType === setupMode.PROPAGATE}
                onChange={() => setSetupMode(setupMode.PROPAGATE)}
              />
              <Text style={{ fontSize: 14, color: 'var(-grey-300)' }}>
                {getString('pipelineSteps.deploy.serviceSpecifications.propagate')}
              </Text>
            </div>
            <FormGroup
              intent={
                setupModeType === setupMode.PROPAGATE && !selectedPropagatedState?.value ? Intent.DANGER : Intent.NONE
              }
              helperText={
                setupModeType === setupMode.PROPAGATE && !selectedPropagatedState?.value ? 'Stage is required' : ''
              }
            >
              <Select
                disabled={setupModeType === setupMode.DIFFERENT || isReadonly}
                className={css.propagatedropdown}
                items={previousStageList}
                value={selectedPropagatedState}
                onChange={(item: SelectOption) => selectPropagatedStep(item)}
              />
            </FormGroup>
          </section>

          <section className={css.radioColumn}>
            <Radio
              checked={setupModeType === setupMode.DIFFERENT}
              disabled={isReadonly}
              onClick={() => initWithServiceDefinition()}
            />
            <Text style={{ fontSize: 14, color: 'var(-grey-300)' }}>
              {getString('serviceDeploymentTypes.deployDifferentLabel')}
            </Text>
          </section>
        </div>
      )}
      {setupModeType === setupMode.PROPAGATE && selectedPropagatedState?.value && (
        <div className={css.useoverrideCheckbox}>
          <Checkbox
            label="Override artifacts, manifests, service variables for this stage"
            checked={checkedItems.overrideSetCheckbox}
            onChange={handleChange}
          />
        </div>
      )}
      {setupModeType === setupMode.DIFFERENT ? (
        <div className={cx(css.serviceOverrides, { [css.heightStageOverrides2]: stageIndex > 0 })}>
          <div className={css.overFlowScroll} ref={scrollRef}>
            <div className={css.contentSection}>
              <div className={css.tabHeading}>{getString('pipelineSteps.serviceTab.aboutYourService')}</div>
              <Card className={css.sectionCard} id="aboutService">
                <StepWidget
                  type={StepType.DeployService}
                  readonly={isReadonly}
                  initialValues={{ serviceRef: '', ...get(stage, 'stage.spec.serviceConfig', {}) }}
                  onUpdate={(value: ServiceConfig) => {
                    const newStage = produce(stage, draft => {
                      if (value.service) {
                        set(draft, 'stage.spec.serviceConfig.service', value.service)
                      } else if (value.serviceRef) {
                        const selectOptionValue = ((value.serviceRef as unknown) as SelectOption)?.value
                        set(
                          draft,
                          'stage.spec.serviceConfig.serviceRef',
                          selectOptionValue !== undefined ? selectOptionValue : value.serviceRef
                        )

                        if (draft?.stage?.spec?.serviceConfig?.service) {
                          delete draft.stage.spec.serviceConfig.service
                        }
                      }
                    })

                    debounceUpdateStage(newStage.stage)
                  }}
                  factory={factory}
                  stepViewType={StepViewType.Edit}
                />
              </Card>
              <div className={css.tabHeading} id="serviceDefinition">
                {getString('pipelineSteps.deploy.serviceSpecifications.serviceDefinition')}
              </div>

              <Card className={css.sectionCard} id="deploymentType">
                <div
                  className={cx(css.tabSubHeading, 'ng-tooltip-native')}
                  data-tooltip-id="stageOverviewDeploymentType"
                >
                  Deployment Type
                  <HarnessDocTooltip tooltipId="stageOverviewDeploymentType" useStandAlone={true} />
                </div>
                <Layout.Horizontal>
                  {supportedDeploymentTypes.map((type: { name: string; icon: IconName; enabled: boolean }) => (
                    <div key={type.name} className={css.squareCardContainer}>
                      <Card
                        disabled={!type.enabled}
                        interactive={true}
                        selected={type.name === getString('serviceDeploymentTypes.kubernetes')}
                        cornerSelected={type.name === getString('serviceDeploymentTypes.kubernetes')}
                        className={cx({ [css.disabled]: !type.enabled }, css.squareCard)}
                      >
                        <Icon name={type.icon as IconName} size={26} height={26} />
                      </Card>
                      <Text
                        style={{
                          fontSize: '12px',
                          color: type.enabled ? 'var(--grey-900)' : 'var(--grey-350)',
                          textAlign: 'center'
                        }}
                      >
                        {type.name}
                      </Text>
                    </div>
                  ))}
                </Layout.Horizontal>
              </Card>
              <Layout.Horizontal>
                <StepWidget<K8SDirectServiceStep>
                  factory={factory}
                  readonly={isReadonly}
                  initialValues={{ stageIndex, setupModeType }}
                  type={StepType.K8sServiceSpec}
                  stepViewType={StepViewType.Edit}
                />
              </Layout.Horizontal>
            </div>
            <div className={css.navigationButtons}>{props.children}</div>
          </div>
        </div>
      ) : (
        checkedItems.overrideSetCheckbox &&
        selectedPropagatedState?.value && (
          <>
            <div className={cx(css.serviceOverrides, css.heightStageOverrides)}>
              <div className={cx(css.overFlowScroll, css.alignCenter)} ref={scrollRef}>
                <Layout.Horizontal>
                  <StepWidget<K8SDirectServiceStep>
                    factory={factory}
                    readonly={isReadonly}
                    initialValues={{ stageIndex, setupModeType }}
                    type={StepType.K8sServiceSpec}
                    stepViewType={StepViewType.Edit}
                  />
                </Layout.Horizontal>
                <div className={cx(css.navigationButtons, css.overrides)}>{props.children}</div>
              </div>
            </div>
          </>
        )
      )}
    </>
  )
}
