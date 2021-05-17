import React, { useState, useEffect } from 'react'
import YAML from 'yaml'
import { Text, Icon, Layout, Button, Card, IconName, Switch } from '@wings-software/uicore'
import { get, startCase } from 'lodash-es'
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
import BlueGreen from './images/BlueGreen.png'
import Rolling from './images/Rolling.png'
import Canary from './images/Canary.png'
import Default from './images/BlankCanvas.png'
import css from './ExecutionStrategy.module.scss'

export interface ExecutionStrategyProps {
  selectedStage: Record<string, any>
}

const iconMap: { [key: string]: IconName } = {
  Rolling: 'rolling',
  Canary: 'canary',
  BlueGreen: 'bluegreen',
  Default: 'step-group'
}

const imageByType: { [key: string]: string } = {
  BlueGreen,
  Rolling,
  Canary,
  Default
}

type StrategyType = GetExecutionStrategyYamlQueryParams['strategyType'] | 'BlankCanvas'

export const ExecutionStrategy: React.FC<ExecutionStrategyProps> = ({ selectedStage }): JSX.Element => {
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
  const serviceDefinitionType: GetExecutionStrategyYamlQueryParams['serviceDefinitionType'] = get(
    selectedStage,
    'stage.spec.serviceConfig.serviceDefinition.type',
    'Kubernetes'
  )

  const infoByType: { [key: string]: string } = {
    BlueGreen: getString('executionStrategy.strategies.blueGreen'),
    Rolling: getString('executionStrategy.strategies.rolling'),
    Canary: getString('executionStrategy.strategies.canary'),
    Default: getString('executionStrategy.strategies.default')
  }

  const { data: strategies } = useGetExecutionStrategyList({})

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
        produce<StageElementWrapperConfig>(selectedStage, (draft: StageElementWrapperConfig) => {
          const jsonFromYaml = YAML.parse(yamlSnippet?.data || '') as StageElementConfig
          if (draft.stage && draft.stage.spec) {
            draft.stage.failureStrategies = jsonFromYaml.failureStrategies
            ;(draft.stage.spec as DeploymentStageConfig).execution =
              (jsonFromYaml.spec as DeploymentStageConfig)?.execution || {}
          }
        }).stage as StageElementConfig
      )
    }
  }, [yamlSnippet?.data, selectedStrategy])

  return (
    <Layout.Vertical padding="xxlarge" spacing="large">
      <Layout.Horizontal>
        <Text font={{ size: 'medium' }} style={{ color: 'var(--grey-600)' }}>
          {getString('pipeline.failureStrategies.selectStrategy')}
        </Text>
      </Layout.Horizontal>

      <Layout.Horizontal>
        <Layout.Vertical width={500}>
          <section className={css.patterns}>
            <section className={css.strategies} data-section-id="strategy-selection">
              {strategiesByDeploymentType.map((v: StrategyType) => (
                // <div>{v}</div>
                <Card
                  className={cx(css.card, selectedStrategy === v && css.active)}
                  elevation={0}
                  key={v}
                  interactive={true}
                  onClick={() => setSelectedStrategy(v)}
                >
                  <Icon name={iconMap[v] as IconName} size={24} />
                  <section className={css.strategyName}>{startCase(v)}</section>
                  <section className={css.strategyType}>
                    {v !== 'Default' ? startCase(serviceDefinitionType) : getString(`executionStrategy.strategyType`)}
                  </section>
                </Card>
              ))}
            </section>
          </section>
          <Button
            intent="primary"
            text={getString('filters.apply')}
            className={css.selectBtn}
            onClick={() => {
              return updateStage(
                produce<StageElementWrapperConfig>(selectedStage, (draft: StageElementWrapperConfig) => {
                  const jsonFromYaml = YAML.parse(yamlSnippet?.data || '') as StageElementConfig
                  if (draft.stage && draft.stage.spec) {
                    draft.stage.failureStrategies = jsonFromYaml.failureStrategies
                    ;(draft.stage.spec as DeploymentStageConfig).execution =
                      (jsonFromYaml.spec as DeploymentStageConfig)?.execution || {}
                  }
                }).stage as StageElementConfig
              ).then(() => {
                updatePipelineView({
                  ...pipelineView,
                  isDrawerOpened: false,
                  drawerData: { type: DrawerTypes.ExecutionStrategy }
                })
              })
            }}
            disabled={isSubmitDisabled}
          />
        </Layout.Vertical>
        <Layout.Vertical width={500}>
          <section className={css.preview}>
            <Text style={{ color: 'var(--grey-600)' }}>{getString('executionStrategy.preview')}</Text>
            <section className={css.previewContainer}>
              <Layout.Horizontal padding="xlarge" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Text font={{ size: 'medium' }} style={{ color: 'var(--grey-700)' }}>
                  {selectedStrategy.replace(/([a-z])([A-Z])/g, '$1 $2')}
                </Text>
                <Icon name={iconMap[selectedStrategy] as IconName} size={24} />
              </Layout.Horizontal>
              <section className={css.info}>{infoByType[selectedStrategy]}</section>
              <section className={css.image}>
                <img src={imageByType[selectedStrategy]} />
              </section>
              <Switch
                label={getString('pipeline.enableVerificationOptions')}
                checked={isVerifyEnabled}
                onChange={() => setIsVerifyEnabled(prevIsVerifyEnabled => !prevIsVerifyEnabled)}
                defaultChecked={false}
                className={css.toggleVerify}
                margin={{ bottom: 'small' }}
              />
            </section>
          </section>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
