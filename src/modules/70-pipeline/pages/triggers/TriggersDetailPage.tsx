import { Button, Card, Color, Container, Icon, Layout, Switch, Text } from '@wings-software/uicore'
import React from 'react'
import cx from 'classnames'
import { useHistory, useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { parse } from 'yaml'
import { Page, useToaster } from '@common/exports'
import type { NgPipeline } from 'services/cd-ng'
import { NGTriggerConfig, useGetTriggerDetails, useUpdateTriggerStatus, useGetYamlSchema } from 'services/pipeline-ng'
import { useStrings } from 'framework/exports'
import type { tagsType } from '@common/utils/types'
import { TagsPopover, PageSpinner } from '@common/components'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import routes from '@common/RouteDefinitions'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { TriggerBreadcrumbs } from '../trigger-details/TriggerDetails'
import { getTriggerIcon } from './utils/TriggersListUtils'
import css from './TriggersDetailPage.module.scss'

enum SelectedView {
  VISUAL = 'VISUAL',
  YAML = 'YAML'
}

export default function TriggersDetailPage(): JSX.Element {
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

  const { data: triggerResponse, refetch: refetchTrigger, loading: loadingTrigger } = useGetTriggerDetails({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
  })

  const { mutate: updateTriggerStatus, loading: updatingTrigger } = useUpdateTriggerStatus({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      targetIdentifier: pipelineIdentifier,
      status: !triggerResponse?.data?.enabled
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
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
        module
      })
    )
  }

  const { loading, data: pipelineSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Pipelines',
      projectIdentifier,
      orgIdentifier,
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
    // TO DO: update GetYamlSchemaQueryParams to add trigger
    entityType: 'Pipelines',
    existingJSON: triggerJSON,
    width: 900
  }

  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  useDocumentTitle([getString('pipelines'), getString('pipeline-triggers.triggersLabel')])
  const triggerObj = parse(triggerResponse?.data?.yaml || '')?.trigger as NGTriggerConfig
  const pipelineInputSet = triggerObj?.target?.spec?.runtimeInputYaml as NgPipeline

  return (
    <>
      <Container
        padding={{ top: 'xlarge', left: 'xlarge', bottom: 'medium', right: 'xlarge' }}
        background={Color.BLUE_200}
      >
        <Layout.Vertical spacing="medium">
          <TriggerBreadcrumbs triggerResponse={triggerResponse} />
          <div>
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <Icon
                name={
                  triggerResponse?.data?.type
                    ? getTriggerIcon({
                        type: triggerResponse.data.type,
                        webhookSourceRepo: triggerResponse?.data?.webhookDetails?.webhookSourceRepo
                      })
                    : 'deployment-success-new'
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
                      checked={triggerResponse?.data?.enabled ?? false}
                      onChange={async () => {
                        const updated = await updateTriggerStatus()

                        if (updated.status === 'SUCCESS') {
                          showSuccess(
                            getString('pipeline-triggers.toast.toggleEnable', {
                              enabled: !triggerResponse?.data?.enabled ? 'enabled' : 'disabled',
                              name: triggerResponse?.data?.name
                            })
                          )
                          refetchTrigger()
                        } else if (updated.status === 'ERROR') {
                          showError('Error')
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

      <Page.Body loading={loadingTrigger || updatingTrigger} className={css.main}>
        <Layout.Horizontal className={css.panel}>
          <Layout.Vertical spacing="medium" className={css.information}>
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              <div className={css.optionBtns}>
                <div
                  className={cx(css.item, { [css.selected]: selectedView === SelectedView.VISUAL })}
                  onClick={() => setSelectedView(SelectedView.VISUAL)}
                >
                  {getString('visual')}
                </div>
                <div
                  className={cx(css.item, { [css.selected]: selectedView === SelectedView.YAML })}
                  onClick={() => setSelectedView(SelectedView.YAML)}
                >
                  {getString('yaml')}
                </div>
              </div>
              <Button
                className={css.edit}
                intent="primary"
                icon="Edit"
                onClick={goToEditWizard}
                minimal
                text={getString('edit')}
              ></Button>
            </Layout.Horizontal>
            {selectedView === SelectedView.VISUAL ? (
              <Layout.Horizontal spacing="medium">
                <Card interactive={false} elevation={0} selected={false} className={css.overview}>
                  <Text font={{ size: 'medium', weight: 'bold' }}>{getString('overview')}</Text>
                  <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
                    <Text>{getString('pipeline-triggers.triggerConfigurationPanel.triggerName')}</Text>
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
                  <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
                    <Text>{getString('conditions')}</Text>
                    <Text font={{ weight: 'bold' }}>{'<cron expression>'}</Text>
                    <hr />
                    <Text>{getString('pipeline-triggers.pipelineExecutionInput')}</Text>
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
                  />
                )}
              </div>
            )}
          </Layout.Vertical>
          <Layout.Vertical style={{ flex: 1 }}>
            <Layout.Horizontal spacing="xxlarge">
              <Text font={{ size: 'medium', weight: 'bold' }}>
                {getString('pipeline-triggers.lastExecutionDetails')}
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
                    {`${getString('pipeline-triggers.lastExecutionAt')}: ${new Date(
                      triggerResponse.data.lastTriggerExecutionDetails.lastExecutionTime
                    ).toLocaleDateString()} ${new Date(
                      triggerResponse.data.lastTriggerExecutionDetails.lastExecutionTime
                    ).toLocaleTimeString()}`}
                  </Text>
                ) : (
                  <Text>{`${getString('pipeline-triggers.lastExecutionAt')}: -`}</Text>
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
