import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import ReactTimeago from 'react-timeago'
import { Button, Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import { useMutateAsGet } from '@common/hooks'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { AuditEventDTO, useGetAuditList } from 'services/audit'
import type { TemplateSummaryResponse } from 'services/template-ng'

import css from './TemplateActivityLog.module.scss'

export interface TemplateActivityLogProps {
  accountIdentifier: string
  orgIdentifier?: string
  projectIdentifier?: string
  selectedTemplate: TemplateSummaryResponse
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
      accountIdentifier: props.accountIdentifier,
      orgIdentifier: props.orgIdentifier,
      projectIdentifier: props.projectIdentifier
    }
  ],
  resources: [
    {
      type: 'TEMPLATE',
      identifier: props.selectedTemplate.identifier
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
  const { action, authenticationInfo, resource, timestamp } = auditEvent
  const { labels } = authenticationInfo
  const { getString } = useStrings()

  return (
    <div className={css.activity}>
      <TimelineIndicators last={last} />
      <div>
        <Layout.Horizontal spacing="xsmall" margin={{ left: 'small', top: 'xsmall' }}>
          <Text intent="primary">{labels?.username || getString('rbac.user')}</Text>
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
            {getString('templatesLibrary.sampleTemplateAuditComment')}
          </Text>
        </Container>
      </div>
    </div>
  )
}

export const TemplateActivityLog = (props: TemplateActivityLogProps) => {
  const { getString } = useStrings()
  const {
    data: templateActivityLogs,
    loading: fetchingTemplateActivityLogs,
    error: templateActivityLogsFetchError,
    refetch: fetchTemplateActivityLogs,
    cancel
  } = useMutateAsGet(useGetAuditList, {
    queryParams: {
      accountIdentifier: props.accountIdentifier
    },
    body: getRequestBody(props),
    lazy: true
  })

  useEffect(() => {
    if (fetchingTemplateActivityLogs) {
      cancel()
    }
    fetchTemplateActivityLogs()
  }, [props.selectedTemplate.stableTemplate])

  const [activityLogs, setActivityLogs] = useState<AuditEventDTO[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (templateActivityLogs?.data?.content) {
      setActivityLogs(templateActivityLogs?.data?.content)
      setErrorMessage('')
    } else if (templateActivityLogsFetchError?.message) {
      setActivityLogs([])
      setErrorMessage(templateActivityLogsFetchError?.message)
    }
  }, [templateActivityLogs, templateActivityLogsFetchError])

  if (fetchingTemplateActivityLogs) {
    return <PageSpinner className={css.fetchingSpinner} message={getString('templatesLibrary.fetchingActivityLogs')} />
  }

  if (errorMessage) {
    return (
      <Text intent="danger" padding="huge" font={{ align: 'center' }}>
        {errorMessage}
      </Text>
    )
  }

  return (
    <Container padding={{ left: 'huge' }}>
      {activityLogs.map((auditEvent, index) => (
        <TemplateActivity key={auditEvent.auditId} auditEvent={auditEvent} last={index === activityLogs.length - 1} />
      ))}
    </Container>
  )
}
