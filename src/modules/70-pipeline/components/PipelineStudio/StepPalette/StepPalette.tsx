import React, { useState, useEffect } from 'react'
import { ExpandingSearchInput, Text, Icon, Layout, Color, Container, Heading } from '@wings-software/uicore'
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
import { useStrings } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StepPopover } from '@pipeline/components/PipelineStudio/StepPalette/StepPopover/StepPopover'
import type { AbstractStepFactory, StepData as FactoryStepData } from '../../AbstractSteps/AbstractStepFactory'

import { iconMapByName } from './iconMap'
// TODO: Mock API
import featureStageSteps from './mock/featureStageSteps.json'
import buildStageStepsWithRunTestsStep from './mock/buildStageStepsWithRunTestsStep.json'
import css from './StepPalette.module.scss'

export const getAllStepsCountForPalette = (originalData: StepCategory[]): number => {
  let count = 0
  originalData.forEach((data: StepCategory) => {
    const { stepCategories, stepsData } = data
    if (isEmpty(stepCategories)) {
      /*
        Ex - Kubernetes -> No nested categories -> add all the steps
      */
      count += stepsData ? stepsData.length : 0
    } else {
      /**
        Ex - Utilities -> nested categories -> add all steps of each category
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
        loading: false,
        data: featureStageSteps as unknown as ResponseStepCategory
      }
    }
  )
}

// TODO: This should be removed once the DTO is available
const useGetBuildSteps = (props: UseGetStepsProps) => {
  return useGet<ResponseStepCategory, Failure | Error, GetStepsQueryParams, void>(
    `/pipelines/configuration/buildsteps`,
    {
      base: getConfig('ng/api'),
      ...props,
      mock: {
        loading: false,
        data: buildStageStepsWithRunTestsStep as unknown as ResponseStepCategory
      }
    }
  )
}

// TODO: move to StepPaletteUtils.ts
const dataSourceFactory = (stageType: StageType): any => {
  switch (stageType) {
    case StageType.BUILD:
      return useGetBuildSteps
    case StageType.DEPLOY:
      return useGetSteps
    case StageType.APPROVAL:
      return useGetSteps
    case StageType.FEATURE:
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
  selectedStage: any
  stageType: StageType
  isProvisioner?: boolean
}
export const StepPalette: React.FC<StepPaletteProps> = ({
  onSelect,
  selectedStage,
  stepsFactory,
  stageType,
  isProvisioner = false
}): JSX.Element => {
  const [stepCategories, setStepsCategories] = useState<StepCategory[]>([])
  const [originalData, setOriginalCategories] = useState<StepCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState(primaryTypes.SHOW_ALL)
  // Need this when we have same names for category and sub category
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const { module, accountId } = useParams<{ module: string; accountId: string }>()
  let categoryForStepPalette
  if ((selectedStage as any).stage?.type === StageType.APPROVAL) {
    categoryForStepPalette = StageType.APPROVAL
  } else if (isProvisioner) {
    categoryForStepPalette = 'Provisioner'
  } else {
    categoryForStepPalette = get(selectedStage, 'stage.spec.serviceConfig.serviceDefinition.type', 'Kubernetes')
  }

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

  const { data: stepsData, loading: stepsDataLoading } = dataSourceFactory(stageType)({
    queryParams: { category: categoryForStepPalette, module, accountId }
  })
  const { getString } = useStrings()
  useEffect(() => {
    const stepsCategories = stepsData?.data?.stepCategories
    /* istanbul ignore else */ if (stepsCategories) {
      setStepsCategories(stepsCategories)
      setOriginalCategories(stepsCategories)
    }
  }, [stepsData?.data?.stepCategories])

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
          <Layout.Vertical padding="xlarge" spacing="large">
            <Layout.Horizontal spacing="medium" className={css.paletteCardHeader}>
              <Layout.Vertical>
                <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }} className={css.title}>
                  {getString('stepPalette.title')}
                </Heading>
              </Layout.Vertical>

              <ExpandingSearchInput
                flip
                width={232}
                throttle={200}
                onChange={(text: string) => filterSteps(text, FilterContext.SEARCH)}
              />
            </Layout.Horizontal>

            <Message stepsDataLoading={stepsDataLoading} />

            {stepCategories?.map((stepCategory: StepCategory, i) => {
              const categorySteps: JSX.Element[] = []
              /* istanbul ignore else */ if (stepCategory?.stepsData) {
                stepCategory.stepsData.forEach((stepData: StepData) => {
                  categorySteps.push(
                    <section
                      className={css.step}
                      key={`${stepData.name}-${i}`}
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
                      <StepPopover stepData={stepData} stepsFactory={stepsFactory} />
                      <section className={css.stepName}>{stepData.name}</section>
                    </section>
                  )
                })
              }

              if (stepCategory?.stepCategories && stepCategory.stepCategories.length > 0) {
                stepCategory.stepCategories.forEach((subStepData: StepCategory, j) => {
                  subStepData?.stepsData?.map((stepData: StepData) => {
                    categorySteps.push(
                      <section
                        className={css.step}
                        key={`${stepData.name}-${j}`}
                        onClick={() => {
                          /* istanbul ignore else */ if (stepData.type !== 'Placeholder') {
                            onSelect({
                              name: stepData.name || /* istanbul ignore next */ '',
                              type: stepData.type || /* istanbul ignore next */ '',
                              icon: stepsFactory.getStepIcon(stepData.type || '')
                            })
                          }
                        }}
                      >
                        <StepPopover stepData={stepData} stepsFactory={stepsFactory} />
                        <section className={css.stepName}>{stepData.name}</section>
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
                      className={cx(
                        css.category,
                        selectedCategory === category.name && selectedLevel === 'category' && css.active,
                        !iconMapByName[category.name || '']?.keepOriginal && css.fillWhite
                      )}
                      onClick={() => {
                        setSelectedLevel('category')
                        filterSteps(category.name || /* istanbul ignore next */ '')
                      }}
                      key={category.name}
                    >
                      <Icon
                        size={14}
                        name={iconMapByName[category.name || /* istanbul ignore next */ '']?.icon}
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
                      className={cx(
                        css.category,
                        selectedCategory === category.name && selectedLevel === 'category' && css.active,
                        subCategory.length && css.hasSubCategories,
                        !iconMapByName[category.name || '']?.keepOriginal && css.fillWhite
                      )}
                      onClick={() => {
                        setSelectedLevel('category')
                        filterSteps(category.name || '')
                      }}
                      key={category.name}
                    >
                      <Icon
                        size={14}
                        name={iconMapByName[category.name || /* istanbul ignore next */ '']?.icon}
                        className={css.paletteIcon}
                      />
                      {category.name}({subCategory.length})
                    </section>
                  )
                  subCategory.forEach((subCat: StepCategory, k) =>
                    stepRenderer.push(
                      <section
                        className={cx(
                          css.category,
                          css.subCategory,
                          css.offset,
                          selectedCategory === subCat.name && selectedLevel === 'subCategory' && css.active,
                          k === subCategory.length - 1 && css.lastSubCategory
                        )}
                        onClick={() => {
                          setSelectedLevel('subCategory')
                          filterSteps(subCat.name || /* istanbul ignore next */ '')
                        }}
                        key={`${subCat.name}-${k}`}
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
