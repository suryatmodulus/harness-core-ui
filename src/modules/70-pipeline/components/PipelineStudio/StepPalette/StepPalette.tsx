import React, { useState, useEffect } from 'react'
import { ExpandingSearchInput, Card, Text, Icon, Layout, Button, Color, Container } from '@wings-software/uicore'
import { useGet } from 'restful-react'
import { get, cloneDeep, uniqBy, isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { getConfig } from 'services/config'
import {
  Failure,
  GetStepsQueryParams,
  ResponseStepCategory,
  StepCategory,
  StepData,
  useGetSteps,
  UseGetStepsProps
} from 'services/pipeline-ng'
import { useGetProvisionerSteps } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import { useLocalStorage } from '@common/hooks/useLocalStorage'
import type { AbstractStepFactory, StepData as FactoryStepData } from '../../AbstractSteps/AbstractStepFactory'

import { iconMap, iconMapByName } from './iconMap'
// TODO: Mock API
import featureStageSteps from './mock/featureStageSteps.json'
import buildStageSteps from './mock/buildStageSteps.json'
import buildStageStepsWithRunTestsStep from './mock/buildStageStepsWithRunTestsStep.json'
import { StageTypes } from '../Stages/StageTypes'
import css from './StepPalette.module.scss'

export const getAllStepsCountForPalette = (originalData: StepCategory[]): number => {
  let count = 0
  originalData.forEach((data: StepCategory) => {
    const { stepCategories, stepsData } = data
    if (isEmpty(stepCategories)) {
      /*
        Ex - Kuberneters -> No nested categories -> add all the steps
      */
      count += stepsData ? stepsData.length : 0
    } else {
      /**
        Ex - Utilities -> ested categories -> add all steps of each category
      */
      stepCategories?.forEach((category: StepCategory) => {
        count += category.stepsData ? category.stepsData.length : 0
      })
    }
  })
  return count
}

// TODO: This should be removed once the DTO is available
const useGetFeatureSteps = (props: UseGetStepsProps) => {
  return useGet<ResponseStepCategory, Failure | Error, GetStepsQueryParams, void>(
    `/pipelines/configuration/featuresteps`,
    {
      base: getConfig('ng/api'),
      ...props,
      mock: {
        data: (featureStageSteps as unknown) as ResponseStepCategory
      }
    }
  )
}

// TODO: This should be removed once the DTO is available
const useGetBuildSteps = (props: UseGetStepsProps) => {
  const [isRunTestsStepEnabled] = useLocalStorage('ENABLE_RUN_TESTS_STEP', false)

  return useGet<ResponseStepCategory, Failure | Error, GetStepsQueryParams, void>(
    `/pipelines/configuration/buildsteps`,
    {
      base: getConfig('ng/api'),
      ...props,
      mock: {
        loading: false,
        data: (isRunTestsStepEnabled
          ? (buildStageStepsWithRunTestsStep as unknown)
          : (buildStageSteps as unknown)) as ResponseStepCategory
      }
    }
  )
}

// TODO: move to StepPaletteUtils.ts
const dataSourceFactory = (stageType: StageTypes, isProvisioner?: boolean): any => {
  switch (stageType) {
    case StageTypes.BUILD:
      return useGetBuildSteps
    case StageTypes.DEPLOY:
      return isProvisioner ? useGetProvisionerSteps : useGetSteps
    case StageTypes.APPROVAL:
      // Replace this with approval step palette API
      return useGetSteps
    case StageTypes.FEATURE:
      return useGetFeatureSteps
  }
}
const primaryTypes = {
  SHOW_ALL: 'show_all',
  RECENTLY_USED: 'recently_used'
}

enum FilterContext {
  NAV = 'NAV',
  SEARCH = 'SEARCH'
}

export interface StepPaletteProps {
  onSelect: (item: FactoryStepData) => void
  onClose: () => void
  stepsFactory: AbstractStepFactory
  selectedStage: object
  stageType: StageTypes
  isProvisioner?: boolean
}
export const StepPalette: React.FC<StepPaletteProps> = ({
  onSelect,
  onClose,
  selectedStage,
  stepsFactory,
  stageType,
  isProvisioner = false
}): JSX.Element => {
  const [stepCategories, setStepsCategories] = useState<StepCategory[]>([])
  const [originalData, setOriginalCategories] = useState<StepCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState(primaryTypes.SHOW_ALL)
  const { module, accountId } = useParams<{ module: string; accountId: string }>()
  const categoryForStepPalette =
    (selectedStage as any).stage?.type === StageTypes.APPROVAL
      ? StageTypes.APPROVAL
      : get(selectedStage, 'stage.spec.serviceConfig.serviceDefinition.type', 'Kubernetes')

  const Message = ({ stepsDataLoading }: { stepsDataLoading: boolean }) => {
    const message = stepsDataLoading
      ? getString('stepPalette.loadingSteps')
      : isEmpty(stepCategories)
      ? getString('stepPalette.noSearchResultsFound')
      : ''
    // Only render this section if we're loading or if we do not have any steps
    return message ? (
      <section style={{ paddingTop: '50%', justifyContent: 'center', textAlign: 'center' }}>{message}</section>
    ) : null
  }

  const { data: stepsData, loading: stepsDataLoading } = dataSourceFactory(
    stageType,
    isProvisioner
  )({
    queryParams: { category: categoryForStepPalette, module, accountId }
  })
  const { getString } = useStrings()
  useEffect(() => {
    const stepsCategories = stepsData?.data?.stepCategories
    /* istanbul ignore else */ if (stepsCategories) {
      const flowControlStep = {
        name: 'Flow Control',
        stepsData: [{ name: 'Barriers', type: 'BARRIER' }],
        stepCategories: []
      }
      setStepsCategories([...stepsCategories, flowControlStep])
      setOriginalCategories([...stepsCategories, flowControlStep])
    }
  }, [stepsData?.data?.stepCategories])

  const renderIcon = () => {
    return <Icon size={8} name="harness" className={css.stepHarnessLogo} />
  }

  const filterSteps = (stepName: string, context = FilterContext.NAV): void => {
    const filteredData: StepCategory[] = []
    const name = stepName.toLowerCase()
    const cloneOriginalData = cloneDeep(originalData)
    if (name !== primaryTypes.SHOW_ALL) {
      cloneOriginalData.forEach((k: StepCategory) => {
        if (k.name?.toLowerCase() === name) {
          filteredData.push(k)
        } else if (k.stepCategories && k.stepCategories.length > 0) {
          const _stepCategories: StepCategory[] = []
          k.stepCategories.forEach((v: StepCategory) => {
            if (v.name?.toLowerCase() === name) {
              _stepCategories.push(v)
            }
          })
          if (_stepCategories?.length) {
            k.stepCategories = _stepCategories

            filteredData.push(k)
          } else {
            const _stepsData: StepData[] = []
            // Each category has steps data inside it
            k.stepCategories.forEach((v: StepCategory) => {
              v?.stepsData?.forEach((m: StepData) => {
                if (m.name?.toLowerCase().search(name) !== -1) {
                  _stepsData.push(m)
                }
              })

              if (_stepsData?.length) {
                // v.stepsData = _stepsData
                filteredData.push(k)
              }
            })
          }
        }

        if (context === FilterContext.SEARCH && k.stepsData) {
          const _stepsData: StepData[] = []
          k.stepsData.forEach((m: StepData) => {
            if (m.name?.toLowerCase().search(name) !== -1) {
              _stepsData.push(m)
            }
          })
          if (_stepsData?.length) {
            k.stepsData = _stepsData
            filteredData.push(k)
          }
        }
      })
      const uniqueData: StepCategory[] = uniqBy(filteredData, 'name')
      setStepsCategories(uniqueData)
      setSelectedCategory(stepName)
    } else {
      setStepsCategories(originalData)
      setSelectedCategory(stepName)
    }
  }

  return (
    <div className={css.stepPalette}>
      <div className={css.stepInside}>
        <section className={css.stepsRenderer}>
          <Layout.Vertical padding="large" spacing="large">
            <Layout.Horizontal spacing="medium" className={css.paletteCardHeader}>
              <Layout.Vertical>
                <Text className={css.title}>{getString('stepPalette.title')}</Text>
                <Text className={css.subTitle}>{getString('stepPalette.subTitle')}</Text>
              </Layout.Vertical>

              <div className={css.expandSearch}>
                <ExpandingSearchInput
                  throttle={200}
                  onChange={(text: string) => filterSteps(text, FilterContext.SEARCH)}
                />
              </div>
            </Layout.Horizontal>

            <Message stepsDataLoading={stepsDataLoading} />

            {stepCategories?.map((stepCategory: StepCategory) => {
              const categorySteps: JSX.Element[] = []
              /* istanbul ignore else */ if (stepCategory?.stepsData) {
                stepCategory.stepsData.forEach((stepData: StepData) => {
                  categorySteps.push(
                    <section
                      className={css.step}
                      key={stepData.name}
                      onClick={() => {
                        if (stepData.type !== 'Placeholder') {
                          onSelect({
                            name: stepData.name || '',
                            type: stepData.type || '',
                            icon: stepsFactory.getStepIcon(stepData.type || '')
                          })
                        }
                      }}
                    >
                      {stepsFactory.getStep(stepData.type || /* istanbul ignore next */ '') ? (
                        <Card interactive={true} elevation={0} selected={false} className={css.paletteCard}>
                          {stepsFactory.getStepIsHarnessSpecific(stepData.type || '') && renderIcon()}
                          <Icon
                            name={stepsFactory.getStepIcon(stepData.type || /* istanbul ignore next */ '')}
                            className={css.paletteIcon}
                            size={25}
                          />
                        </Card>
                      ) : (
                        <Card
                          interactive={false}
                          elevation={0}
                          selected={false}
                          disabled
                          className={css.paletteCard}
                          onClick={e => e.stopPropagation()}
                        >
                          {stepsFactory.getStepIsHarnessSpecific(stepData.type || '') && renderIcon()}
                          <Icon
                            name={iconMap[stepData.name || /* istanbul ignore next */ '']}
                            className={css.paletteIcon}
                            size={25}
                          />
                        </Card>
                      )}
                      <section className={css.stepName}>{stepData.name}</section>
                    </section>
                  )
                })
              }

              if (stepCategory?.stepCategories && stepCategory.stepCategories.length > 0) {
                stepCategory.stepCategories.forEach((subStepData: StepCategory) => {
                  subStepData?.stepsData?.map((step: StepData) => {
                    categorySteps.push(
                      <section
                        className={css.step}
                        key={step.name}
                        onClick={() => {
                          /* istanbul ignore else */ if (step.type !== 'Placeholder') {
                            onSelect({
                              name: step.name || /* istanbul ignore next */ '',
                              type: step.type || /* istanbul ignore next */ '',
                              icon: stepsFactory.getStepIcon(step.type || /* istanbul ignore next */ '')
                            })
                          }
                        }}
                      >
                        {stepsFactory.getStep(step.type || /* istanbul ignore next */ '') ? (
                          <Card interactive={true} elevation={0} selected={false} className={css.paletteCard}>
                            {stepsFactory.getStepIsHarnessSpecific(step.type || '') && renderIcon()}
                            <Icon
                              name={stepsFactory.getStepIcon(step.type || /* istanbul ignore next */ '')}
                              className={css.paletteIcon}
                              size={25}
                            />
                          </Card>
                        ) : (
                          <Card
                            interactive={false}
                            elevation={0}
                            selected={false}
                            disabled
                            onClick={e => e.stopPropagation()}
                            className={css.paletteCard}
                          >
                            {stepsFactory.getStepIsHarnessSpecific(step.type || '') && renderIcon()}
                            <Icon
                              name={iconMap[step.name || /* istanbul ignore next */ '']}
                              className={css.paletteIcon}
                              size={25}
                            />
                          </Card>
                        )}
                        <section className={css.stepName}>{step.name}</section>
                      </section>
                    )
                  })
                })
              }

              return (
                <section className={css.categorySteps} key={stepCategory.name}>
                  <section className={cx(css.categoryName)}>{stepCategory.name}</section>
                  <section className={cx(css.steps)}>{[...categorySteps]}</section>
                </section>
              )
            })}
          </Layout.Vertical>
        </section>
        <section className={css.categoriesRenderer}>
          <section className={css.headerContainer}>
            <Layout.Horizontal flex>
              <Container flex className={css.libraryHeader}>
                <Icon size={14} name="library" className={`${css.paletteIcon} ${css.library}`} />
                <Text color={Color.WHITE} style={{ fontSize: 14 }}>
                  {getString('stepPalette.library')}
                </Text>
              </Container>

              <Button intent="primary" minimal icon="cross" onClick={onClose} color={Color.WHITE} />
            </Layout.Horizontal>

            <section
              onClick={() => {
                filterSteps(primaryTypes.SHOW_ALL)
              }}
              key={primaryTypes.SHOW_ALL}
              className={css.showAllBtn}
            >
              <Text color={Color.WHITE} style={{ fontSize: 11, fontWeight: 'bold' }}>
                {getString('stepPalette.showAllSteps')} ({getAllStepsCountForPalette(originalData)})
              </Text>
            </section>
          </section>
          <hr className={css.separator} />

          <section className={css.secCategories}>
            <Layout.Vertical>
              {originalData?.map((category: StepCategory) => {
                const stepRenderer = []
                if (category?.stepCategories && category.stepCategories.length === 0) {
                  stepRenderer.push(
                    <section
                      className={cx(css.category, selectedCategory === category.name && css.active)}
                      onClick={() => {
                        filterSteps(category.name || /* istanbul ignore next */ '')
                      }}
                      key={category.name}
                    >
                      <Icon
                        size={14}
                        name={iconMapByName[category.name || /* istanbul ignore next */ '']}
                        className={css.paletteIcon}
                      />
                      {category.name} ({category.stepsData?.length})
                    </section>
                  )
                }
                if (category?.stepCategories && category.stepCategories.length > 0) {
                  const subCategory = category.stepCategories
                  stepRenderer.push(
                    <section
                      className={cx(css.category, selectedCategory === category.name && css.active)}
                      onClick={() => {
                        filterSteps(category.name || '')
                      }}
                      key={category.name}
                    >
                      <Icon
                        size={14}
                        name={iconMapByName[category.name || /* istanbul ignore next */ '']}
                        className={css.paletteIcon}
                      />
                      {category.name}({subCategory.length})
                    </section>
                  )
                  subCategory.forEach((subCat: StepCategory) =>
                    stepRenderer.push(
                      <section
                        className={cx(
                          css.category,
                          css.subCategory,
                          css.offset,
                          selectedCategory === subCat.name && css.active
                        )}
                        onClick={() => {
                          filterSteps(subCat.name || /* istanbul ignore next */ '')
                        }}
                        key={subCat.name}
                      >
                        {subCat.name} ({subCat.stepsData?.length})
                      </section>
                    )
                  )
                }
                return [...stepRenderer]
              })}
            </Layout.Vertical>
          </section>
        </section>
      </div>
    </div>
  )
}
