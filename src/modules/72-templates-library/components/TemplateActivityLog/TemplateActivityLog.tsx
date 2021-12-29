import React, { useEffect } from 'react'
import cx from 'classnames'
import ReactTimeago from 'react-timeago'
import { Button, Color, Container, Heading, Icon, Layout, PageError, Text } from '@wings-software/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { useMutateAsGet } from '@common/hooks'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { AuditEventDTO, useGetAuditList } from 'services/audit'
import type { TemplateSummaryResponse } from 'services/template-ng'

import css from './TemplateActivityLog.module.scss'

export interface TemplateActivityLogProps {
  template: TemplateSummaryResponse
}

interface TemplateActivityProps {
  auditEvent: AuditEventDTO
  last: boolean
}

/* The request body for the activity logs POST call */
const getRequestBody = (props: TemplateActivityLogProps) => ({
  filterType: 'Audit',
  scopes: [
    {
      accountIdentifier: props.template.accountId,
      orgIdentifier: props.template.orgIdentifier,
      projectIdentifier: props.template.projectIdentifier
    }
  ],
  resources: [
    {
      type: 'TEMPLATE',
      identifier: props.template.identifier
    }
  ],
  modules: ['TEMPLATESERVICE']
})

const HumanizedAction = ({ action }: { action: string }) => {
  /*
  Convert an action enum to human readable text string
  E.g. CREATE mapped to created, UPDATE to updated, etc
  */
  const { getString } = useStrings()
  let actionString = ''
  if (action === 'CREATE') {
    actionString = getString('templatesLibrary.created')
  } else if (action === 'UPDATE') {
    actionString = getString('templatesLibrary.updated')
  } else if (action === 'DEFAULT') {
    actionString = getString('templatesLibrary.default')
  }
  return <Text>{actionString}</Text>
}

const TimelineIndicators = ({ last }: { last: boolean }) => {
  /*
  The icons on the left pane of timeline
  Any change in this component should be sync'd with the right side data too
  */
  return (
    <div>
      <Button iconProps={{ size: 10 }} withoutBoxShadow round className={css.timelineFirstIcon} icon="edit" />
      <div className={css.timelineSeparator}></div>
      <div className={css.dot} />
      <div className={cx(css.timelineSeparator, last ? css.timelineSeparatorLast : '')}></div>
      {last ? <Icon name="double-chevron-down" color={Color.GREY_250} className={css.lastIcon} /> : null}
    </div>
  )
}

const TemplateActivity = ({ auditEvent, last }: TemplateActivityProps) => {
  /* Rendering a single audit activity */
  const { action, authenticationInfo, resource, timestamp, auditEventData } = auditEvent
  const { labels } = authenticationInfo
  const { getString } = useStrings()

  return (
    <div className={css.activity}>
      <TimelineIndicators last={last} />
      <div>
        <Layout.Horizontal spacing="xsmall" margin={{ left: 'small', top: 'xsmall' }}>
          <Text intent="primary">{labels?.username || getString('common.userLabel')}</Text>
          <HumanizedAction action={action} />
          <Text intent="primary">{resource.labels?.versionLabel || ''}</Text>
        </Layout.Horizontal>

        <Text font={{ size: 'small' }} margin={{ left: 'medium' }}>
          <ReactTimeago date={timestamp} />
        </Text>

        <Container
          padding="small"
          margin={{ left: 'medium', top: 'medium' }}
          border={{ radius: 4, color: Color.PRIMARY_6 }}
        >
          <Text font={{ size: 'small' }} width={350} lineClamp={2}>
            {(auditEventData as any)?.comments || getString('templatesLibrary.sampleTemplateAuditComment')}
          </Text>
        </Container>
      </div>
    </div>
  )
}

export const TemplateActivityLog = (props: TemplateActivityLogProps) => {
  const {
    template: { identifier, accountId }
  } = props
  const {
    data: templateActivityLogs,
    loading: fetchingTemplateActivityLogs,
    error: templateActivityLogsFetchError,
    refetch: fetchTemplateActivityLogs
  } = useMutateAsGet(useGetAuditList, {
    queryParams: {
      accountIdentifier: accountId
    },
    body: getRequestBody(props),
    lazy: true
  })

  useEffect(() => {
    fetchTemplateActivityLogs()
  }, [identifier])

  return (
    <Container height={'100%'} className={css.container}>
      <Layout.Vertical flex={{ align: 'center-center' }} height={'100%'}>
        {fetchingTemplateActivityLogs && <PageSpinner />}
        {!fetchingTemplateActivityLogs && templateActivityLogsFetchError && (
          <PageError
            message={defaultTo(
              (templateActivityLogsFetchError.data as Error)?.message,
              templateActivityLogsFetchError.message
            )}
            onClick={fetchTemplateActivityLogs}
          />
        )}
        {!fetchingTemplateActivityLogs &&
          !templateActivityLogsFetchError &&
          isEmpty(templateActivityLogs?.data?.content) && (
            <Heading level={2} font={{ weight: 'bold' }} color={Color.GREY_300}>
              This template has no activity logs
            </Heading>
          )}
        {!fetchingTemplateActivityLogs &&
          !templateActivityLogsFetchError &&
          !isEmpty(templateActivityLogs?.data?.content) && (
            <Container
              style={{ overflow: 'auto' }}
              width={'100%'}
              height={'100%'}
              padding={{ top: 'medium', bottom: 'medium', left: 'xxlarge' }}
            >
              {templateActivityLogs?.data?.content?.map((auditEvent, index) => (
                <TemplateActivity
                  key={auditEvent.auditId}
                  auditEvent={auditEvent}
                  last={index === (templateActivityLogs.data?.content || []).length - 1}
                />
              ))}
            </Container>
          )}
      </Layout.Vertical>
    </Container>
  )
}
