import React, { useState, useEffect } from 'react'
import YAML from 'yaml'
import { Classes, Switch } from '@blueprintjs/core'
import { Text, Icon, Layout, Button, Card, IconName, Color, ButtonVariation, Container } from '@wings-software/uicore'
import { defaultTo, get, isEmpty, set, startCase } from 'lodash-es'
import cx from 'classnames'
import produce from 'immer'
import {
  DeploymentStageConfig,
  GetExecutionStrategyYamlQueryParams,
  StageElementConfig,
  StageElementWrapperConfig,
  useGetExecutionStrategyList,
  useGetExecutionStrategyYaml
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerTypes } from '../PipelineContext/PipelineActions'
import Default from './resources/BlankCanvas.png'
import Steps from './Steps'
import RollingUpdateVideo from './resources/Rolling-Update-deployment.mp4'
import BlueGreenVideo from './resources/Blue-Green-deployment.mp4'
import CanaryVideo from './resources/Canary-deployment.mp4'
import Rolling from './resources/Rolling-Update-deployment.png'
import BlueGreen from './resources/Blue-Green-deployment.png'
import Canary from './resources/Canary-deployment.png'
import css from './ExecutionStrategy.module.scss'

export interface ExecutionStrategyProps {
  selectedStage: StageElementWrapperConfig
  ref?: ExecutionStrategyForwardRef
}

const iconMap: { [key: string]: IconName } = {
  Rolling: 'rolling-update',
  Canary: 'canary-icon',
  BlueGreen: 'blue-green',
  Default: 'blank-canvas-card-icon'
}

const imageByType: { [key: string]: string } = {
  BlueGreen,
  Rolling,
  Canary,
  Default
}

const videoByType: { [key: string]: string } = {
  BlueGreen: BlueGreenVideo,
  Rolling: RollingUpdateVideo,
  Canary: CanaryVideo
}

type StrategyType = GetExecutionStrategyYamlQueryParams['strategyType'] | 'BlankCanvas'

export interface ExecutionStrategyRefInterface {
  cancelExecutionStrategySelection: () => void
}

export type ExecutionStrategyForwardRef =
  | ((instance: ExecutionStrategyRefInterface | null) => void)
  | React.MutableRefObject<ExecutionStrategyRefInterface | null>
  | null

const ExecutionStrategyRef = (
  props: ExecutionStrategyProps,
  executionStrategyRef: ExecutionStrategyForwardRef
): JSX.Element => {
  const { selectedStage } = props
  const {
    state: { pipelineView },
    updateStage,
    updatePipelineView
  } = React.useContext(PipelineContext)
  const { getString } = useStrings()
  const [strategiesByDeploymentType, setStrategies] = useState([])
  const [isSubmitDisabled, disableSubmit] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('Rolling')
  const [isVerifyEnabled, setIsVerifyEnabled] = useState(false)
  const [showPlayButton, setShowPlayButton] = useState<boolean>(false)

  const serviceDefinitionType: GetExecutionStrategyYamlQueryParams['serviceDefinitionType'] = get(
    selectedStage,
    'stage.spec.serviceConfig.serviceDefinition.type',
    'Kubernetes'
  )

  const infoByType: { [key: string]: string } = {
    BlueGreen: getString('pipeline.executionStrategy.strategies.blueGreen.description'),
    Rolling: getString('pipeline.executionStrategy.strategies.rolling.description'),
    Canary: getString('pipeline.executionStrategy.strategies.canary.description'),
    Default: getString('pipeline.executionStrategy.strategies.default.description')
  }

  const learnMoreLinkByType: { [key: string]: string } = {
    BlueGreen: getString('pipeline.executionStrategy.strategies.blueGreen.learnMoreLink'),
    Rolling: getString('pipeline.executionStrategy.strategies.rolling.learnMoreLink'),
    Canary: getString('pipeline.executionStrategy.strategies.canary.learnMoreLink'),
    Default: getString('pipeline.executionStrategy.strategies.default.learnMoreLink')
  }

  const { data: strategies } = useGetExecutionStrategyList({})

  // Video related
  let vidWrapper: HTMLElement | null = document.querySelector('[data-testid="player"]')
  let videoPlayer: HTMLVideoElement | undefined | null = vidWrapper?.querySelector('[data-testid="videoPlayer"]')

  useEffect(() => {
    if (!executionStrategyRef) return
    if (typeof executionStrategyRef === 'function') {
      return
    }
    executionStrategyRef.current = {
      cancelExecutionStrategySelection: cancelSelection
    }
    vidWrapper = document.querySelector('[data-testid="player"]')
    videoPlayer = vidWrapper?.querySelector('[data-testid="videoPlayer"]')
    videoPlayer?.addEventListener('ended', () => setShowPlayButton(true), false)
    if (videoPlayer?.ended) {
      setShowPlayButton(true)
    } else {
      setShowPlayButton(false)
    }
  })

  useEffect(() => {
    const _strategies = strategies?.data
    /* istanbul ignore else */ if (_strategies) {
      setStrategies(_strategies[serviceDefinitionType] as any)
    }
  }, [strategies?.data, serviceDefinitionType])

  const { data: yamlSnippet, error } = useGetExecutionStrategyYaml({
    queryParams: {
      serviceDefinitionType,
      strategyType: selectedStrategy !== 'BlankCanvas' ? selectedStrategy : 'Rolling',
      ...(isVerifyEnabled && { includeVerify: true })
    }
  })

  useEffect(() => {
    if (error) {
      disableSubmit(true)
    } else {
      disableSubmit(false)
    }
  }, [error])

  useEffect(() => {
    if (yamlSnippet?.data) {
      updateStage(
        produce(selectedStage, draft => {
          const jsonFromYaml = YAML.parse(defaultTo(yamlSnippet?.data, '{}')) as StageElementConfig
          set(draft, 'stage.failureStrategies', jsonFromYaml.failureStrategies)
          set(draft, 'stage.spec.execution', defaultTo((jsonFromYaml.spec as DeploymentStageConfig)?.execution, {}))
        }).stage as StageElementConfig
      )
    }
    if (selectedStrategy === getString('pipeline.executionStrategy.strategies.default.actualName')) {
      setIsVerifyEnabled(false)
    }
  }, [yamlSnippet?.data, selectedStrategy])

  const updatePipelineViewState = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: { type: DrawerTypes.ExecutionStrategy }
    })
  }

  const cancelSelection = (): void => {
    updateStage(
      produce(selectedStage, draft => {
        const jsonFromYaml = YAML.parse(defaultTo(yamlSnippet?.data, '{}')) as StageElementConfig
        set(draft, 'stage.failureStrategies', jsonFromYaml.failureStrategies)
        set(draft, 'stage.spec.execution', { steps: [], rollbackSteps: [] })
      }).stage as StageElementConfig
    ).then(() => {
      updatePipelineViewState()
    })
  }

  const toggleVideo = (): void => {
    videoPlayer?.play()
    setShowPlayButton(false)
  }

  const getStrategyNameByType = (type: string): string => {
    return type === 'Default' ? getString('pipeline.executionStrategy.strategies.default.displayName') : startCase(type)
  }

  return (
    <Layout.Horizontal>
      <Layout.Vertical width={448} className={css.strategySelectionPanel}>
        <Layout.Horizontal className={css.header}>
          <Text className={css.headerText}>{getString('pipeline.executionStrategy.executionStrategies')}</Text>
        </Layout.Horizontal>
        <section className={css.patterns}>
          <section className={css.strategies} data-section-id="strategy-selection">
            {strategiesByDeploymentType.map((v: StrategyType) => (
              <Card
                className={cx(css.card, selectedStrategy === v && css.active)}
                elevation={0}
                key={v}
                interactive={true}
                onClick={() => setSelectedStrategy(v)}
                data-testid={`${v}-Card`}
              >
                <Icon name={iconMap[v] as IconName} size={40} border={false} />
                <section className={css.strategyName}>{getStrategyNameByType(v)}</section>
                <section className={css.strategyType}>
                  {v !== 'Default' ? startCase(serviceDefinitionType) : null}
                </section>
              </Card>
            ))}
          </section>
        </section>
      </Layout.Vertical>

      <Layout.Vertical width={688} className={css.strategyDetailsPanel}>
        <Container className={css.strategyDetailsBody}>
          <Layout.Horizontal className={css.header} flex>
            <Layout.Horizontal>
              <Text
                className={css.headerText}
                data-testid={`${selectedStrategy}DetailsHeader`}
                tooltipProps={{ dataTooltipId: `${selectedStrategy}DetailsHeader` }}
              >
                {getStrategyNameByType(selectedStrategy)}
              </Text>
              {selectedStrategy === 'Default' && (
                <Icon name="blank-canvas-header-icon" size={24} color={Color.PRIMARY_6} />
              )}
            </Layout.Horizontal>
            <Button
              variation={ButtonVariation.LINK}
              href={learnMoreLinkByType[selectedStrategy]}
              target="_blank"
              withoutBoxShadow={true}
            >
              {getString('learnMore')}
            </Button>
          </Layout.Horizontal>
          <section className={css.preview}>
            <section className={css.previewContainer}>
              <section className={css.info} data-testid="info">
                {infoByType[selectedStrategy]}
              </section>
              {!isEmpty(videoByType[selectedStrategy]) ? (
                <section className={css.player} data-testid="player">
                  <video
                    key={selectedStrategy}
                    className={css.videoPlayer}
                    autoPlay
                    poster={imageByType[selectedStrategy]}
                    data-testid="videoPlayer"
                  >
                    <source src={videoByType[selectedStrategy]} type="video/mp4"></source>
                    <Text tooltipProps={{ dataTooltipId: 'videoNotSupportedError' }}>
                      {getString('common.videoNotSupportedError')}
                    </Text>
                  </video>
                  {showPlayButton && (
                    <div className={css.playerControls}>
                      <Button
                        minimal
                        variation={ButtonVariation.ICON}
                        className={css.playButton}
                        onClick={toggleVideo}
                        data-testid="playButton"
                        icon="play-circle"
                        iconProps={{ size: 42 }}
                        withoutCurrentColor
                      />
                    </div>
                  )}
                </section>
              ) : (
                <section className={css.image}>
                  <img src={imageByType[selectedStrategy]} data-testid="blank-canvas-image" />
                </section>
              )}
              {selectedStrategy !== 'Default' && (
                <>
                  <Steps strategy={selectedStrategy} />
                  <section className={css.enableVerificationSection}>
                    <Switch
                      checked={isVerifyEnabled}
                      onChange={() => setIsVerifyEnabled(prevIsVerifyEnabled => !prevIsVerifyEnabled)}
                      className={cx(Classes.SMALL, css.toggleVerify)}
                      data-testid="enable-verification-options-switch"
                    />
                    <Text className={css.enableVerification}>{getString('pipeline.enableVerificationOptions')}</Text>
                  </section>
                </>
              )}
            </section>
          </section>
        </Container>
        <Container className={css.strategyDetailsFooter}>
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('pipeline.executionStrategy.useStrategy')}
            onClick={() => {
              const newStage = produce(selectedStage, draft => {
                const jsonFromYaml = YAML.parse(yamlSnippet?.data || '') as StageElementConfig
                if (draft.stage && draft.stage.spec) {
                  draft.stage.failureStrategies = jsonFromYaml.failureStrategies
                  ;(draft.stage.spec as DeploymentStageConfig).execution = (jsonFromYaml.spec as DeploymentStageConfig)
                    ?.execution ?? { steps: [], rollbackSteps: [] }
                }
              }).stage

              if (newStage) {
                updateStage(newStage).then(() => {
                  updatePipelineViewState()
                })
              }
            }}
            disabled={isSubmitDisabled}
          />
        </Container>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export const ExecutionStrategy = React.forwardRef(ExecutionStrategyRef)
