import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  Text,
  Card,
  Color,
  Layout,
  FontVariation,
  Toggle,
  Breadcrumbs,
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  useToaster,
  PageSpinner
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { TagsPopover } from '@common/components'
import { useAgentServiceGet, useAgentServiceUpdate, V1Agent } from 'services/gitops'
import type {
  PipelinePathProps,
  ConnectorPathProps,
  SecretsPathProps,
  UserPathProps,
  UserGroupPathProps,
  ResourceGroupPathProps,
  RolePathProps,
  AgentOverViewPathProps
} from '@common/interfaces/RouteInterfaces'
import css from './GitOpsAgentOverviewPage.module.scss'
enum ACCESS_MODES {
  VIEW,
  EDIT
}
const GitOpsAgentOverviewPage = (): React.ReactElement => {
  const { getString } = useStrings()
  const params = useParams<
    PipelinePathProps &
      ConnectorPathProps &
      SecretsPathProps &
      UserPathProps &
      UserGroupPathProps &
      ResourceGroupPathProps &
      RolePathProps &
      AgentOverViewPathProps
  >()
  const [mode, setMode] = useState(ACCESS_MODES.VIEW)
  const toast = useToaster()
  const [agentDetails, setAgentDetails] = useState<V1Agent>({
    name: 'Agent 2',
    identifier: 'agent2',
    description: 'Some random description',
    orgIdentifier: 'default',
    projectIdentifier: 'Argo',
    tags: {
      tag1: 'ok',
      tag2: 'ok',
      tag3: 'ok'
    },
    metadata: { namespace: 'ns1', highAvailability: true }
  })

  const {
    refetch: getAgentDetails,
    data,
    loading
  } = useAgentServiceGet({
    identifier: params.agentId,
    queryParams: {
      accountIdentifier: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier
    }
  })
  const {
    mutate,
    loading: updateAgentLoading,
    error: updateAgentError
  } = useAgentServiceUpdate({
    agentIdentifier: params.agentId
  })
  useEffect(() => {
    getAgentDetails().then(() => {
      data && setAgentDetails(data || {})
    })
  }, [])

  const onSubmitHandler = (updatedAgentDetails: V1Agent): void => {
    mutate(updatedAgentDetails).finally(() => {
      if (updateAgentError) {
        toast.showError(updateAgentError.message, undefined, 'gitops.agent.update.error')
      } else {
        toast.showSuccess('Agent updated successfully', undefined, 'gitops.agent.update.error')
        setMode(ACCESS_MODES.VIEW)
      }
    })
  }
  if (updateAgentLoading || loading) return <PageSpinner />
  return (
    <Formik formName="gitagent-details" onSubmit={onSubmitHandler} initialValues={agentDetails}>
      {({ values }: any) => (
        <FormikForm>
          <div className={css.header}>
            <Breadcrumbs
              links={[
                { url: '/aaa', label: params.projectIdentifier },
                { url: '/aaa1', label: 'GitOps' }
              ]}
            />
            <div className={css.headerTitleSection}>
              <Text color={Color.BLACK} font={{ variation: FontVariation.H4 }}>
                {getString('overview')}
              </Text>
              <div className={css.actions}>
                {mode === ACCESS_MODES.VIEW ? (
                  <Button onClick={() => setMode(ACCESS_MODES.EDIT)} variation={ButtonVariation.SECONDARY} icon="edit">
                    {getString('edit')}
                  </Button>
                ) : (
                  <div className={css.updateActions}>
                    <Button type="submit" className={css.saveButton} inline variation={ButtonVariation.PRIMARY}>
                      {getString('save')}
                    </Button>
                    <Button onClick={() => setMode(ACCESS_MODES.VIEW)} inline variation={ButtonVariation.SECONDARY}>
                      {getString('cancel')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={css.container}>
            <Card className={css.detailsCard}>
              <Text color={Color.BLACK} font={{ variation: FontVariation.CARD_TITLE }}>
                {getString('overview')}
              </Text>
              <Layout.Vertical className={css.detailContainer}>
                <div>
                  <div className={cx(css.detailRow, css.titleRow)}>{getString('name')}</div>
                  <Text
                    color={Color.BLACK}
                    font={{
                      variation: FontVariation.BODY
                    }}
                    className={cx(css.detailRow, css.valueRow, { [css.borderBottom]: mode === ACCESS_MODES.VIEW })}
                  >
                    {mode === ACCESS_MODES.EDIT ? <FormInput.Text name="name" disabled /> : values?.name}
                  </Text>
                </div>
                <div>
                  <div className={cx(css.detailRow, css.titleRow)}>Agent Identifier</div>
                  <Text
                    color={Color.BLACK}
                    font={{
                      variation: FontVariation.BODY
                    }}
                    className={cx(css.detailRow, css.valueRow, { [css.borderBottom]: mode === ACCESS_MODES.VIEW })}
                  >
                    {mode === ACCESS_MODES.EDIT ? <FormInput.Text name="identifier" disabled /> : values?.identifier}
                  </Text>
                </div>
                <div>
                  <div className={cx(css.detailRow, css.titleRow)}>{getString('description')}</div>
                  <Text
                    color={Color.BLACK}
                    font={{
                      variation: FontVariation.BODY
                    }}
                    className={cx(css.detailRow, css.valueRow, { [css.borderBottom]: mode === ACCESS_MODES.VIEW })}
                  >
                    {mode === ACCESS_MODES.EDIT ? <FormInput.Text name="description" /> : values?.description}
                  </Text>
                </div>
                <div>
                  <div className={cx(css.detailRow, css.titleRow)}>{getString('tagsLabel')}</div>

                  {mode === ACCESS_MODES.EDIT ? (
                    <TagsPopover tags={values?.tags || {}} />
                  ) : (
                    //  <FormInput.TagInput
                    //   name="tags"
                    //   labelFor={name => (typeof name === 'string' ? name : '')}
                    //   itemFromNewTag={newTag => newTag}
                    //   items={[]}
                    //   tagInputProps={{
                    //     noInputBorder: true,
                    //     openOnKeyDown: false,
                    //     showAddTagButton: true,
                    //     showClearAllButton: true,
                    //     allowNewTag: true
                    //   }}
                    // />
                    <TagsPopover tags={values?.tags || {}} />
                  )}
                </div>
              </Layout.Vertical>
            </Card>

            <Card className={css.detailsCard}>
              <Text color={Color.BLACK} font={{ variation: FontVariation.CARD_TITLE }}>
                {getString('details')}
              </Text>
              <Layout.Vertical>
                <div>
                  <div className={cx(css.detailRow, css.titleRow)}>{getString('common.namespace')}</div>
                  <Text
                    color={Color.BLACK}
                    font={{
                      variation: FontVariation.BODY
                    }}
                    className={cx(css.detailRow, css.valueRow, css.borderBottom)}
                  >
                    {values?.metadata?.namespace}
                  </Text>
                </div>
                <div>
                  <div className={cx(css.detailRow, css.titleRow)}>High Availability</div>
                  <Toggle disabled checked={values?.metadata?.highAvailability} />
                </div>
              </Layout.Vertical>
            </Card>
            <div></div>
          </div>
        </FormikForm>
      )}
    </Formik>
  )
}

export default GitOpsAgentOverviewPage
