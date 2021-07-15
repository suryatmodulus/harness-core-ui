import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import type { FormikActions } from 'formik'
import { cloneDeep, get, isEqual } from 'lodash-es'
import {
  Layout,
  Container,
  Text,
  Tabs,
  Tab,
  Button,
  FlexExpander,
  useModalHook,
  Formik,
  FormikForm as Form
} from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import {
  Feature,
  FeatureState,
  usePatchFeature,
  ServingRule,
  Clause,
  Serve,
  VariationMap,
  WeightedVariation,
  TargetMap,
  PatchFeatureQueryParams
} from 'services/cf'
import { useStrings } from 'framework/strings'
import { extraOperatorReference } from '@cf/constants'
import { useToaster } from '@common/exports'
import { useQueryParams } from '@common/hooks'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import { FFDetailPageTab, getErrorMessage, rewriteCurrentLocationWithActiveEnvironment } from '@cf/utils/CFUtils'
import routes from '@common/RouteDefinitions'
import { PageError } from '@common/components/Page/PageError'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import type { FeatureFlagPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import FlagElemTest from '../CreateFlagWizard/FlagElemTest'
import TabTargeting from '../EditFlagTabs/TabTargeting'
import TabActivity from '../EditFlagTabs/TabActivity'
import { CFEnvironmentSelect } from '../CFEnvironmentSelect/CFEnvironmentSelect'
import patch, { ClauseData, getDiff } from '../../utils/instructions'
import { MetricsView } from './views/MetricsView'
import { NoEnvironment } from '../NoEnvironment/NoEnvironment'
import css from './FlagActivation.module.scss'

// Show loading and wait 3s when the first environment is created before reloading
// current detail page. See https://harness.atlassian.net/browse/FFM-565
const WAIT_TIME_FOR_NEWLY_CREATED_ENVIRONMENT = 3000

interface FlagActivationProps {
  project: string
  flagData: Feature
  isBooleanFlag: boolean
  refetchFlag: () => Promise<any>
}

interface Values {
  [key: string]: any
  state: string
  offVariation: string
  defaultServe: Serve
  customRules: ServingRule[]
  variationMap: VariationMap[]
}

const fromVariationMapToObj = (variationMap: VariationMap[]) =>
  variationMap.reduce((acc: any, vm: VariationMap) => {
    if (acc[vm.variation]) {
      acc[vm.variation].targets = acc[vm.variation].targets.concat(vm.targets || [])
      acc[vm.variation].targetSegments = acc[vm.variation].targetSegments.concat(vm.targetSegments || [])
    } else {
      acc[vm.variation] = { targets: vm.targets, targetSegments: vm.targetSegments }
    }
    return acc
  }, {})

const FlagActivation: React.FC<FlagActivationProps> = props => {
  const { flagData, project, isBooleanFlag, refetchFlag } = props
  const { showError } = useToaster()
  const [editing, setEditing] = useState(false)
  const [loadingFlags, setLoadingFlags] = useState(false)
  const { orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { activeEnvironment, withActiveEnvironment } = useActiveEnvironment()
  const { mutate: patchFeature } = usePatchFeature({
    identifier: flagData.identifier as string,
    queryParams: {
      project: project as string,
      environment: activeEnvironment,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier
    } as PatchFeatureQueryParams
  })
  const {
    EnvironmentSelect,
    loading: envsLoading,
    error: envsError,
    refetch: refetchEnvironments,
    environments
  } = useEnvironmentSelectV2({
    selectedEnvironmentIdentifier: activeEnvironment,
    onChange: (_value, _environment, _userEvent) => {
      rewriteCurrentLocationWithActiveEnvironment(_environment)

      if (_userEvent) {
        setLoadingFlags(true)
        refetchFlag().finally(() => setLoadingFlags(false))
      }
    }
  })
  const initialValues = useMemo(
    () =>
      cloneDeep({
        state: flagData.envProperties?.state as string,
        onVariation: flagData.envProperties?.defaultServe.variation
          ? flagData.envProperties?.defaultServe.variation
          : flagData.envProperties?.defaultServe.distribution
          ? 'percentage'
          : flagData.defaultOnVariation,
        offVariation: flagData.envProperties?.offVariation as string,
        defaultServe: flagData.envProperties?.defaultServe as Serve,
        customRules: flagData.envProperties?.rules ?? [],
        variationMap: cloneDeep(flagData.envProperties?.variationMap ?? [])
      }),
    []
  )

  const noEnvironmentExists = !envsLoading && !envsError && environments?.length === 0

  const onCancelEditHandler = (): void => {
    setEditing(false)
    patch.feature.reset()
  }

  const onSaveChanges = useCallback(
    (values: Values, formikActions: FormikActions<Values>): void => {
      if (values.state !== initialValues.state) {
        patch.feature.addInstruction(patch.creators.setFeatureFlagState(values?.state as FeatureState))
      }
      if (!isEqual(values.offVariation, initialValues.offVariation)) {
        patch.feature.addInstruction(patch.creators.updateOffVariation(values.offVariation as string))
      }
      if (!isEqual(values.onVariation, initialValues.onVariation)) {
        if (values.onVariation !== 'percentage') {
          patch.feature.addInstruction(patch.creators.updateDefaultServeByVariation(values.onVariation as string))
        }
      }
      if (!isEqual(values.defaultServe, initialValues.defaultServe) && values.onVariation === 'percentage') {
        patch.feature.addInstruction(
          patch.creators.updateDefaultServeByBucket(
            values.defaultServe.distribution?.bucketBy || '',
            values.defaultServe.distribution?.variations || []
          )
        )
      }
      if (!isEqual(values.customRules, initialValues.customRules)) {
        const toClauseData = (c: Clause): ClauseData => {
          if (c.op === extraOperatorReference.customRules.matchSegment.value) {
            return {
              op: c.op,
              values: c.values
            }
          } else {
            return {
              attribute: c.attribute as string,
              op: c.op,
              values: c.values
            }
          }
        }

        patch.feature.addAllInstructions(
          initialValues.customRules
            .filter(rule => !values.customRules.find(r => r.ruleId === rule.ruleId))
            .map(r => patch.creators.removeRule(r.ruleId))
        )

        patch.feature.addAllInstructions(
          values.customRules
            .filter(rule =>
              initialValues.customRules.find(
                oldRule => oldRule.ruleId === rule.ruleId && oldRule.serve.variation !== rule.serve.variation
              )
            )
            .map(rule => {
              const variation =
                (rule.serve.distribution as { bucketBy: string; variations: WeightedVariation[] }) ??
                rule.serve.variation
              return patch.creators.updateRuleVariation(rule.ruleId, variation)
            })
        )

        const newRuleIds: string[] = []
        values.customRules = values.customRules.map(rule => {
          if (!rule.ruleId) {
            const newId = uuid()
            newRuleIds.push(newId)
            rule.ruleId = newId
          }
          return rule
        })
        const isNewRule = (id: string) => newRuleIds.includes(id)

        patch.feature.addAllInstructions(
          values.customRules
            .filter(rule => isNewRule(rule.ruleId))
            .map(rule =>
              patch.creators.addRule({
                uuid: rule.ruleId,
                priority: rule.priority,
                serve: rule.serve,
                clauses: rule.clauses.map(toClauseData)
              })
            )
        )

        values.customRules
          .filter(rule => !isNewRule(rule.ruleId))
          .map(rule => [initialValues.customRules.find(r => r.ruleId === rule.ruleId), rule])
          .filter(([initial, current]) => !isEqual(initial, current))
          .map(([initial, current]) => {
            current?.clauses
              .filter(c => !c.id)
              .forEach(c => patch.feature.addInstruction(patch.creators.addClause(current.ruleId, toClauseData(c))))

            initial?.clauses
              .filter(c => !current?.clauses.find(cl => cl.id === c.id))
              .forEach(c => patch.feature.addInstruction(patch.creators.removeClause(initial.ruleId, c.id)))

            initial?.clauses
              .reduce((acc: any, prev) => {
                const currentValue = current?.clauses.find(c => c.id === prev.id)
                if (currentValue && !isEqual(prev, currentValue)) {
                  return [...acc, [prev, currentValue]]
                }
                return acc
              }, [])
              .forEach(([c, updated]: [Clause, Clause]) =>
                patch.feature.addInstruction(patch.creators.updateClause(initial.ruleId, c.id, toClauseData(updated)))
              )
          })
      }

      // TODO: this whole complication needs to be refactored
      const normalize = (variationMap: VariationMap[]) =>
        (variationMap || []).map(item => {
          if (item.targets?.length) {
            item.targets = item.targets?.map(target => target?.identifier || target) as unknown as TargetMap[]
          }
          return item
        })
      const normalizedInitialVariationMap = normalize(initialValues.variationMap)
      const normalizedVariationMap = normalize(values.variationMap)

      if (!isEqual(normalizedVariationMap, normalizedInitialVariationMap)) {
        const initial = fromVariationMapToObj(normalizedInitialVariationMap)
        const updated = fromVariationMapToObj(normalizedVariationMap)

        const variations = Array.from(new Set(Object.keys(initial).concat(Object.keys(updated))))
        variations.forEach((variation: string) => {
          const [added, removed] = getDiff<string, string>(
            initial[variation]?.targets || [],
            updated[variation]?.targets || []
          )
          if (added.length > 0) {
            patch.feature.addInstruction(patch.creators.addTargetsToVariationTargetMap(variation, added))
          }
          if (removed.length > 0) {
            patch.feature.addInstruction(patch.creators.removeTargetsToVariationTargetMap(variation, removed))
          }
        })
      }

      const prevOrder = initialValues.customRules.map(x => x.ruleId)
      const newOrder = values.customRules.map(x => x.ruleId)
      if (!isEqual(prevOrder, newOrder)) {
        patch.feature.addInstruction(patch.creators.reorderRules(newOrder))
      }

      patch.feature
        .onPatchAvailable(data => {
          patchFeature(data)
            .then(() => {
              setEditing(false)
              return refetchFlag()
            })
            .then(() => {
              formikActions.resetForm()
            })
            .catch(err => {
              showError(get(err, 'data.message', err?.message), 0)
            })
            .finally(() => {
              patch.feature.reset()
            })
        })
        .onEmptyPatch(() => setEditing(false))
    },
    [initialValues, patchFeature, refetchFlag, showError]
  )

  type RuleErrors = { [K: number]: { [P: number]: 'required' } }
  const validateRules = (rules: ServingRule[]): [RuleErrors, boolean] => {
    const errors: RuleErrors = {}
    let valid = true
    rules.forEach((rule: ServingRule, ruleIdx: number) => {
      rule.clauses.map((clause: Clause, clauseIdx: number) => {
        if (clause.values.length === 0) {
          if (!errors[ruleIdx]) {
            errors[ruleIdx] = {}
          }
          errors[ruleIdx][clauseIdx] = 'required'
          valid = false
        }
      })
    })
    return [errors, valid]
  }

  type VariationMapErrors = { [K: number]: { variation?: 'required'; targets?: 'required' } }
  const validateVariationMap = (variationMap: VariationMap[]): [VariationMapErrors, boolean] => {
    let valid = true
    const errors = variationMap.reduce((acc: VariationMapErrors, next: VariationMap, idx: number) => {
      if (!next.variation.length) {
        valid = false
        acc[idx] = {
          variation: 'required'
        }
      }
      if (!next.targets?.length) {
        valid = false
        acc[idx] = {
          ...(acc[idx] || {}),
          targets: 'required'
        }
      }
      return acc
    }, {})
    return [errors, valid]
  }

  type FormErrors = {
    rules?: RuleErrors
    variationMap?: VariationMapErrors
  }
  const validateForm = (values: Values) => {
    const errors: FormErrors = {}

    const [rules, validRules] = validateRules(values.customRules)
    if (!validRules) {
      errors.rules = rules
    }

    const [variationMap, validVariationMap] = validateVariationMap(values.variationMap)
    if (!validVariationMap) {
      errors.variationMap = variationMap
    }

    return errors
  }
  const [openModalTestFlag, hideModalTestFlag] = useModalHook(() => (
    <Dialog enforceFocus={false} onClose={hideModalTestFlag} isOpen={true} className={css.testFlagDialog}>
      <Container className={css.testFlagDialogContainer}>
        <FlagElemTest name="" fromWizard={false} />
        <Button
          minimal
          icon="small-cross"
          iconProps={{ size: 20 }}
          onClick={hideModalTestFlag}
          style={{ top: 0, right: '15px', position: 'absolute' }}
        />
      </Container>
    </Dialog>
  ))
  const { tab = FFDetailPageTab.TARGETING } = useQueryParams<{ tab?: string }>()
  const [activeTabId, setActiveTabId] = useState(tab)
  const [newEnvironmentCreateLoading, setNewEnvironmentCreateLoading] = useState(false)
  const { getString } = useStrings()
  const history = useHistory()
  const pathParams = useParams<ProjectPathProps & FeatureFlagPathProps>()

  useEffect(() => {
    if (tab !== activeTabId) {
      history.replace(withActiveEnvironment(routes.toCFFeatureFlagsDetail(pathParams) + `?tab=${activeTabId}`))
    }
  }, [activeTabId, history, pathParams, tab, withActiveEnvironment])

  if (envsLoading || newEnvironmentCreateLoading || loadingFlags) {
    return (
      <Container
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 1
        }}
      >
        <ContainerSpinner />
      </Container>
    )
  }

  if (envsError) {
    return <PageError message={getErrorMessage(envsError)} onClick={() => refetchEnvironments()} />
  }

  if (noEnvironmentExists) {
    return (
      <Container style={{ height: '100%', display: 'grid', alignItems: 'center' }}>
        <NoEnvironment
          style={{ marginTop: '-100px' }}
          onCreated={response => {
            history.replace(
              withActiveEnvironment(
                routes.toCFFeatureFlagsDetail({
                  orgIdentifier,
                  projectIdentifier: flagData.project,
                  featureFlagIdentifier: flagData.identifier,
                  accountId
                }),
                response?.data?.identifier
              )
            )

            // See https://harness.atlassian.net/browse/FFM-565
            setNewEnvironmentCreateLoading(true)
            setTimeout(() => {
              setNewEnvironmentCreateLoading(false)
              refetchEnvironments()
            }, WAIT_TIME_FOR_NEWLY_CREATED_ENVIRONMENT)
          }}
        />
      </Container>
    )
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      formName="flagActivation"
      initialValues={cloneDeep(initialValues)}
      validate={validateForm}
      onSubmit={onSaveChanges}
    >
      {formikProps => {
        return (
          <Form>
            <Container className={css.formContainer}>
              <Layout.Horizontal
                flex
                padding="large"
                style={{
                  backgroundColor: '#F4F6FF',
                  mixBlendMode: 'normal',
                  boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                  paddingLeft: 'var(--spacing-huge)'
                }}
              >
                <FlexExpander />
                <CFEnvironmentSelect component={<EnvironmentSelect />} />
              </Layout.Horizontal>
              <Container
                className={cx(css.tabContainer, (!editing || activeTabId !== FFDetailPageTab.TARGETING) && css.noEdit)}
              >
                {flagData && (
                  <>
                    <Tabs
                      id="editFlag"
                      defaultSelectedTabId={activeTabId}
                      onChange={(tabId: string) => setActiveTabId(tabId)}
                    >
                      <Tab
                        id={FFDetailPageTab.TARGETING}
                        title={<Text className={css.tabTitle}>{getString('cf.featureFlags.targeting')}</Text>}
                        panel={
                          <TabTargeting
                            formikProps={formikProps}
                            editing={editing}
                            refetch={refetchFlag}
                            targetData={flagData}
                            isBooleanTypeFlag={isBooleanFlag}
                            projectIdentifier={project}
                            environmentIdentifier={activeEnvironment}
                            setEditing={setEditing}
                            feature={flagData}
                            org={orgIdentifier}
                            accountIdentifier={accountId}
                          />
                        }
                      />
                      <Tab
                        id={FFDetailPageTab.METRICS}
                        title={<Text className={css.tabTitle}>{getString('cf.featureFlags.metrics.title')}</Text>}
                        panel={<MetricsView flagData={flagData} />}
                      />

                      <Tab
                        id={FFDetailPageTab.ACTIVITY}
                        title={<Text className={css.tabTitle}>{getString('cf.featureFlags.activity')}</Text>}
                        panel={<TabActivity flagData={flagData} />}
                      />
                    </Tabs>
                    <Button
                      icon="code"
                      disabled
                      minimal
                      intent="primary"
                      onClick={openModalTestFlag}
                      className={css.btnCode}
                      title={getString('cf.featureNotReady')}
                    />
                  </>
                )}
              </Container>
              {(editing || formikProps.values.state !== flagData.envProperties?.state) &&
                activeTabId === FFDetailPageTab.TARGETING && (
                  <Layout.Horizontal className={css.actionButtons} padding="medium">
                    <Button
                      intent="primary"
                      text={getString('save')}
                      margin={{ right: 'small' }}
                      onClick={formikProps.submitForm}
                    />
                    <Button
                      minimal
                      text={getString('cancel')}
                      onClick={() => {
                        onCancelEditHandler()
                        formikProps.handleReset()
                      }}
                    />
                  </Layout.Horizontal>
                )}
            </Container>
          </Form>
        )
      }}
    </Formik>
  )
}

export default FlagActivation
