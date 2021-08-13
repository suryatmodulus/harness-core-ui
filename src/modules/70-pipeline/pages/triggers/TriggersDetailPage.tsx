import { Button, Card, Color, Container, Icon, Layout, Switch, Text } from '@wings-software/uicore'
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { parse } from 'yaml'
import { Page, useToaster } from '@common/exports'
import {
  NGTriggerConfigV2,
  useGetTriggerDetails,
  useUpdateTrigger,
  useGetSchemaYaml,
  useGetPipelineSummary
} from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { tagsType } from '@common/utils/types'
import { TagsPopover, PageSpinner } from '@common/components'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import routes from '@common/RouteDefinitions'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useQueryParams } from '@common/hooks'
import VisualYamlToggle, { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { TriggerBreadcrumbs } from '../trigger-details/TriggerDetails'
import { getTriggerIcon, getEnabledStatusTriggerValues } from './utils/TriggersListUtils'
import { clearNullUndefined, ResponseStatus } from './utils/TriggersWizardPageUtils'
import css from './TriggersDetailPage.module.scss'

export interface ConditionInterface {
  key: string
  operator: string
  value: string
}

const getTriggerConditionsStr = (payloadConditions: ConditionInterface[]): string[] => {
  const arr: string[] = []
  payloadConditions.forEach(condition => {
    const { key, operator, value } = condition

    arr.push(`${key} ${operator} ${value}`)
  })
  return arr
}
export default function TriggersDetailPage(): JSX.Element {
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)

  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, triggerIdentifier, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      triggerIdentifier: string
    }>
  >()

  const {
    data: triggerResponse,
    refetch: refetchTrigger,
    loading: loadingTrigger
  } = useGetTriggerDetails({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
  })

  const { mutate: updateTrigger, loading: updateTriggerLoading } = useUpdateTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const [isExecutable] = usePermission(
    {
      resourceScope: {
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EXECUTE_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const isTriggerRbacDisabled = !isExecutable

  const history = useHistory()

  const goToEditWizard = (): void => {
    history.push(
      routes.toTriggersWizardPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        triggerIdentifier,
        triggerType: triggerResponse?.data?.type,
        module,
        repoIdentifier,
        branch
      })
    )
  }

  const { loading, data: pipelineSchema } = useGetSchemaYaml({
    queryParams: {
      entityType: 'Triggers',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  let triggerJSON
  try {
    triggerJSON = parse(triggerResponse?.data?.yaml || '')
  } catch (e) {
    // ignore error
  }

  const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
    fileName: `${triggerResponse?.data?.identifier ?? 'Trigger'}.yaml`,
    entityType: 'Triggers',
    existingJSON: triggerJSON,
    width: 900
  }

  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  useDocumentTitle([getString('pipelines'), getString('pipeline.triggers.triggersLabel')])
  const triggerObj = parse(triggerResponse?.data?.yaml || '')?.trigger as NGTriggerConfigV2
  const pipelineInputSet = triggerObj?.inputYaml
  let conditionsArr: string[] = []
  const headerConditionsArr: string[] = triggerObj?.source?.spec?.spec?.headerConditions?.length
    ? getTriggerConditionsStr(triggerObj.source.spec.spec.headerConditions)
    : []
  const payloadConditionsArr: string[] = triggerObj?.source?.spec?.spec?.payloadConditions?.length
    ? getTriggerConditionsStr(triggerObj.source.spec.spec.payloadConditions)
    : []
  const eventConditionsArr: string[] = triggerObj?.source?.spec?.spec?.eventConditions?.length
    ? getTriggerConditionsStr(triggerObj.source.spec.spec.eventConditions)
    : []
  conditionsArr = conditionsArr.concat(headerConditionsArr)
  conditionsArr = conditionsArr.concat(payloadConditionsArr)
  conditionsArr = conditionsArr.concat(eventConditionsArr)
  const jexlCondition = triggerObj?.source?.spec?.spec?.jexlCondition
  const cronExpression = triggerObj?.source?.spec?.spec?.expression
  const { data: pipeline } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  return (
    <>
      <Container
        style={{ borderBottom: '1px solid var(--grey-200)' }}
        padding={{ top: 'xlarge', left: 'xlarge', bottom: 'medium', right: 'xlarge' }}
        background={Color.PRIMARY_1}
      >
        <Layout.Vertical spacing="medium">
          <TriggerBreadcrumbs pipelineResponse={pipeline} />
          <div>
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <Icon
                name={
                  triggerResponse?.data?.type
                    ? getTriggerIcon({
                        type: triggerResponse.data.type,
                        webhookSourceRepo: triggerResponse?.data?.webhookDetails?.webhookSourceRepo
                      })
                    : 'yaml-builder-trigger'
                }
                size={26}
              />
              <Layout.Horizontal spacing="small" data-testid={triggerResponse?.data?.identifier}>
                <Layout.Vertical padding={{ left: 'small' }}>
                  <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20 }} color={Color.BLACK}>
                      {triggerResponse?.data?.name}
                    </Text>
                    <Text>{getString('enabledLabel')}</Text>
                    <Switch
                      label=""
                      disabled={isTriggerRbacDisabled}
                      checked={triggerResponse?.data?.enabled ?? false}
                      onChange={async () => {
                        const { values, error } = getEnabledStatusTriggerValues({
                          data: triggerResponse?.data,
                          enabled: (triggerResponse?.data && !triggerResponse?.data.enabled) || false,
                          getString
                        })
                        if (error) {
                          showError(error, undefined, 'pipeline.enable.status.error')
                          return
                        }
                        try {
                          const { status, data } = await updateTrigger(
                            yamlStringify({ trigger: clearNullUndefined(values) }) as any
                          )
                          if (status === ResponseStatus.SUCCESS) {
                            showSuccess(
                              getString('pipeline.triggers.toast.toggleEnable', {
                                enabled: data?.enabled ? 'enabled' : 'disabled',
                                name: data?.name
                              })
                            )
                            refetchTrigger()
                          }
                        } catch (err) {
                          showError(err?.data?.message, undefined, 'pipeline.common.trigger.error')
                        }
                      }}
                    />
                  </Layout.Horizontal>
                  <Text>{triggerResponse?.data?.identifier}</Text>
                </Layout.Vertical>
              </Layout.Horizontal>
            </Layout.Horizontal>
          </div>
        </Layout.Vertical>
      </Container>

      <Page.Body loading={loadingTrigger || updateTriggerLoading} className={css.main}>
        <Layout.Horizontal className={css.panel}>
          <Layout.Vertical spacing="medium" className={css.information}>
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              <VisualYamlToggle
                initialSelectedView={selectedView}
                beforeOnChange={(nextMode, callback) => {
                  setSelectedView(nextMode)
                  callback(nextMode)
                }}
              ></VisualYamlToggle>
              <Button
                className={css.edit}
                intent="primary"
                icon="Edit"
                onClick={goToEditWizard}
                minimal
                disabled={isTriggerRbacDisabled}
                text={getString('edit')}
              ></Button>
            </Layout.Horizontal>
            {selectedView === SelectedView.VISUAL ? (
              <Layout.Horizontal spacing="medium">
                <Card interactive={false} elevation={0} selected={false} className={css.overview}>
                  <Text font={{ size: 'medium', weight: 'bold' }}>{getString('overview')}</Text>
                  <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
                    <Text>{getString('pipeline.triggers.triggerConfigurationPanel.triggerName')}</Text>
                    <Text font={{ weight: 'bold' }} lineClamp={1}>
                      {triggerResponse?.data?.name}
                    </Text>
                    <hr />
                    <Text>{getString('description')}</Text>
                    <Text font={{ weight: 'bold' }} lineClamp={1}>
                      {triggerResponse?.data?.description || '-'}
                    </Text>
                    <hr />
                    <Text>{getString('identifier')}</Text>
                    <Text font={{ weight: 'bold' }} lineClamp={1}>
                      {triggerResponse?.data?.identifier}
                    </Text>
                    <hr />
                    <Text>{getString('tagsLabel')}</Text>
                    {!isEmpty(triggerResponse?.data?.tags) ? (
                      <TagsPopover tags={triggerResponse?.data?.tags as tagsType} />
                    ) : null}
                  </Layout.Vertical>
                </Card>
                <Card interactive={false} elevation={0} selected={false} className={css.inputSet}>
                  <Text font={{ size: 'medium', weight: 'bold' }}>{getString('details')}</Text>
                  <Layout.Vertical style={{ overflowX: 'hidden' }} spacing="medium" padding={{ top: 'medium' }}>
                    {conditionsArr.length ? (
                      <>
                        <Text>{getString('conditions')}</Text>
                        {conditionsArr.map(conditionStr => (
                          <Text key={conditionStr} font={{ weight: 'bold' }} lineClamp={1}>
                            {conditionStr}
                          </Text>
                        ))}
                      </>
                    ) : null}
                    {jexlCondition ? (
                      <>
                        <Text>{getString('pipeline.triggers.conditionsPanel.jexlCondition')}</Text>
                        <Text font={{ weight: 'bold' }} lineClamp={1}>
                          {jexlCondition}
                        </Text>
                      </>
                    ) : null}
                    {cronExpression ? (
                      <>
                        <Text>{getString('pipeline.triggers.schedulePanel.cronExpression')}</Text>
                        <Text font={{ weight: 'bold' }} lineClamp={1}>
                          {cronExpression}
                        </Text>
                      </>
                    ) : null}
                    {conditionsArr?.length || cronExpression ? <hr /> : null}
                    <Text>{getString('pipeline.triggers.pipelineExecutionInput')}</Text>
                    {!isEmpty(pipelineInputSet) && <pre>{pipelineInputSet}</pre>}
                  </Layout.Vertical>
                </Card>
              </Layout.Horizontal>
            ) : (
              <div className={css.editor}>
                {loading ? (
                  <PageSpinner />
                ) : (
                  <YAMLBuilder
                    {...yamlBuilderReadOnlyModeProps}
                    isReadOnlyMode={true}
                    showSnippetSection={false}
                    schema={pipelineSchema?.data}
                    onEnableEditMode={goToEditWizard}
                  />
                )}
              </div>
            )}
          </Layout.Vertical>
          <Layout.Vertical style={{ flex: 1 }}>
            <Layout.Horizontal spacing="xxlarge">
              <Text font={{ size: 'medium', weight: 'bold' }}>
                {getString('pipeline.triggers.lastActivationDetails')}
              </Text>
              {triggerResponse?.data?.lastTriggerExecutionDetails?.lastExecutionSuccessful === false ? (
                <Text
                  tooltip={triggerResponse?.data?.lastTriggerExecutionDetails?.message}
                  icon="warning-sign"
                  iconProps={{ color: Color.RED_500 }}
                  color={Color.RED_500}
                >
                  {getString('failed')}
                </Text>
              ) : (
                triggerResponse?.data?.lastTriggerExecutionDetails?.lastExecutionSuccessful === true && (
                  <Text
                    tooltip={triggerResponse?.data?.lastTriggerExecutionDetails?.message}
                    icon="execution-success"
                    color={Color.GREEN_500}
                    iconProps={{ color: Color.GREEN_500 }}
                  >
                    {getString('passed')}
                  </Text>
                )
              )}
            </Layout.Horizontal>
            <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
              <div>
                {triggerResponse?.data?.lastTriggerExecutionDetails?.lastExecutionTime ? (
                  <Text>
                    {`${getString('pipeline.triggers.lastActivationAt')}: ${new Date(
                      triggerResponse.data.lastTriggerExecutionDetails.lastExecutionTime
                    ).toLocaleDateString()} ${new Date(
                      triggerResponse.data.lastTriggerExecutionDetails.lastExecutionTime
                    ).toLocaleTimeString()}`}
                  </Text>
                ) : (
                  <Text>{`${getString('pipeline.triggers.lastActivationAt')}: -`}</Text>
                )}
              </div>
              <hr />
            </Layout.Vertical>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}
