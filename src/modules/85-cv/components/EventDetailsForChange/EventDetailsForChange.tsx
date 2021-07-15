import React, { useState } from 'react'
import { IDrawerProps, Position, Drawer } from '@blueprintjs/core'
import cx from 'classnames'
import { Container, Heading, Text, Color, Link, Icon, Button } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import { PageError } from '@common/components/Page/PageError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import {
  useGetEventDetails,
  KubernetesActivityDetail,
  ActivityVerificationResultDTO,
  useGetDeploymentActivitySummary
} from 'services/cv'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import VerificationStatusCard from '@pipeline/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/VerificationStatusCard/VerificationStatusCard'
import { DeploymentProgressAndNodes } from '@pipeline/components/ExecutionVerification/components/DeploymentProgressAndNodes/DeploymentProgressAndNodes'
import { VerificationActivityRiskCardWithApi } from '../VerificationActivityRiskCard/VerificationActivityRiskCard'
import type { EventData } from '../ActivitiesTimelineView/ActivitiesTimelineView'
import css from './EventDetailsForChange.module.scss'

type SummaryCardInfo = {
  kind?: string
  eventCount?: number
  namespace?: string
  workload?: string
  sourceName?: string
  connectorIdentifier?: string
}
interface EventDetailsForChangeProps {
  onCloseCallback: () => void
  selectedActivityInfo?: {
    selectedActivityId: string
    selectedActivityType: ActivityVerificationResultDTO['activityType']
  }
  selectedActivities?: EventData[]
}

interface KeyValuePairProps {
  name: string
  value?: string
}

interface EventsListProps {
  events: KubernetesActivityDetail[]
}

interface KubernetesContentProps {
  selectedActivityId: string
  displayJSON: boolean
  onViewJSONClick: () => void
}

interface ChangeSourceSummaryCardProps {
  onViewJSONClick: () => void
  displayViewJSONOption: boolean
  data: SummaryCardInfo
}

interface ActivitiesListProps {
  activities: EventData[]
  onSelectActivity: (updatedActivityId: string) => void
  selectedActivityId?: string
  onBackToChangesClick?: () => void
}

const DrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: false,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '70%'
}

function getDrawerHeading(getString: UseStringsReturn['getString'], selectedActivities?: EventData[]): string {
  if (!selectedActivities?.length) {
    return ''
  }

  if (selectedActivities.length === 1) {
    return `${getString('change').toUpperCase()}: ${selectedActivities[0]?.name}`
  }

  if (selectedActivities[0]?.activityType === 'DEPLOYMENT') {
    return `${getString('change').toUpperCase()}: ${selectedActivities.length} ${getString(
      'deploymentText'
    )} ${getString('changes')}`
  }

  return `${getString('change').toUpperCase()}: ${selectedActivities.length} ${getString('kubernetesText')} ${getString(
    'changes'
  )}`
}

function KeyValuePair(props: KeyValuePairProps): JSX.Element {
  const { name, value } = props
  return (
    <Container width="100%" className={css.keyValPair}>
      <Text font={{ size: 'small' }} lineClamp={1} className={css.key}>
        {name}
      </Text>
      <Text color={Color.BLACK} lineClamp={1}>
        {value}
      </Text>
    </Container>
  )
}

function KuberenetesChangeSourceSummaryCard(props: ChangeSourceSummaryCardProps): JSX.Element {
  const { onViewJSONClick, displayViewJSONOption, data } = props
  const { getString } = useStrings()
  return (
    <Container className={css.summaryCard}>
      <Container className={css.changeSourceDetails}>
        <Heading level={2} className={css.heading} color={Color.BLACK}>
          {getString('cv.changesPage.changeSourceDetails')}
        </Heading>
        <KeyValuePair name={getString('source')} value={data?.sourceName} />
        <KeyValuePair name={getString('connector')} value={data?.connectorIdentifier} />
      </Container>
      <Container className={css.changeSummary}>
        <Container flex>
          <Heading level={2} className={css.heading} color={Color.BLACK}>
            {getString('cv.changesPage.changeSummary')}
          </Heading>
          {displayViewJSONOption && (
            <Container className={css.viewJson}>
              <Link minimal withoutHref text={getString('viewJSON')} onClick={() => onViewJSONClick()} />
              <Icon name="view-json" size={25} />
            </Container>
          )}
        </Container>
        <Container className={css.summaryRow}>
          <KeyValuePair name={getString('pipelineSteps.workload')} value={data?.workload} />
          <KeyValuePair name={getString('kind')} value={data?.kind} />
        </Container>
        <Container className={css.summaryRow}>
          <KeyValuePair name={getString('pipelineSteps.build.infraSpecifications.namespace')} value={data?.namespace} />
          <KeyValuePair
            name={getString('cv.changesPage.eventCount')}
            value={data?.eventCount ? data.eventCount.toString() : ''}
          />
        </Container>
      </Container>
    </Container>
  )
}

function KubernetesEventsList(props: EventsListProps): JSX.Element {
  const { events } = props
  const { getString } = useStrings()
  return (
    <ul className={css.eventsList}>
      <li className={cx(css.listHeader, css.listItem)}>
        <Text className={css.creationDate}>{getString('creationTimestamp').toLocaleUpperCase()}</Text>
        <Text className={css.type}>{getString('typeLabel').toLocaleUpperCase()}</Text>
        <Text className={css.reason}>{getString('reason').toLocaleUpperCase()}</Text>
        <Text className={css.message}>{getString('message').toLocaleUpperCase()}</Text>
      </li>
      {events?.map((event, index) => (
        <li className={css.listItem} key={index}>
          <Text className={css.creationDate} lineClamp={1}>
            {event?.timeStamp ? new Date(event.timeStamp).toLocaleString() : ''}
          </Text>
          <Text className={css.type} lineClamp={1}>
            {event?.eventType}
          </Text>
          <Text className={css.reason} lineClamp={1}>
            {event?.reason}
          </Text>
          <Text className={css.message} lineClamp={3}>
            {event?.message}
          </Text>
        </li>
      ))}
    </ul>
  )
}

function KubernetesContent(props: KubernetesContentProps): JSX.Element {
  const { selectedActivityId, displayJSON, onViewJSONClick } = props
  const {
    projectIdentifier,
    orgIdentifier,
    accountId,
    activityId: routeActivityId
  } = useParams<ProjectPathProps & { activityId?: string }>()
  const { loading, data, error, refetch } = useGetEventDetails({
    queryParams: { projectIdentifier, orgIdentifier, accountId, activityId: selectedActivityId }
  })

  const { namespace, connectorIdentifier, kind, workload, sourceName, details = [] } = data?.data || { details: [] }
  if (loading) {
    return <Icon name="steps-spinner" size={25} color={Color.GREY_600} className={css.contentSpinner} />
  }

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} className={css.contentError} />
  }

  if (displayJSON && selectedActivityId) {
    const concatenedJSON = details?.map(detail => detail?.eventJson).filter(json => (json ? json.length > 0 : false))
    return (
      <Container className={css.eventsEditor} height="100%">
        <MonacoEditor
          language="json"
          value={JSON.stringify(concatenedJSON, null, 4)?.replace(/\\n/g, '\r\n')}
          options={
            {
              readOnly: true,
              wordBasedSuggestions: false,
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 13
            } as any
          }
        />
      </Container>
    )
  }

  return (
    <Container className={css.kubernetesContent}>
      <VerificationActivityRiskCardWithApi
        selectedActivityId={selectedActivityId}
        navigateToURLOnCardClick={
          routeActivityId
            ? undefined
            : routes.toCVActivityChangesPage({
                accountId,
                activityId: selectedActivityId,
                orgIdentifier,
                projectIdentifier
              })
        }
      />
      <KuberenetesChangeSourceSummaryCard
        onViewJSONClick={onViewJSONClick}
        displayViewJSONOption={Boolean(selectedActivityId)}
        data={{
          namespace,
          kind,
          workload,
          eventCount: details?.length ?? undefined,
          connectorIdentifier,
          sourceName
        }}
      />
      <KubernetesEventsList events={loading ? [] : details} />
    </Container>
  )
}

function DeploymentContent({ selectedActivityId }: { selectedActivityId: string }): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { push } = useHistory()
  const { loading, error, data, refetch } = useGetDeploymentActivitySummary({
    queryParams: { accountId },
    activityId: selectedActivityId
  })

  if (loading) {
    return <Icon name="steps-spinner" size={25} color={Color.GREY_600} className={css.contentSpinner} />
  }

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} className={css.contentError} />
  }

  const hasServiceAndDeploymentTag = data?.resource?.deploymentTag && data.resource.serviceIdentifier
  return (
    <Container
      className={css.deploymentInfo}
      onClick={
        hasServiceAndDeploymentTag
          ? () =>
              push(
                routes.toCVDeploymentPage({
                  accountId,
                  projectIdentifier,
                  orgIdentifier,
                  serviceIdentifier: data?.resource?.serviceIdentifier as string,
                  deploymentTag: encodeURIComponent(data?.resource?.deploymentTag as string).replace(
                    /[;,/?:@&=+$#]/g,
                    function (c) {
                      return '%' + c.charCodeAt(0).toString(16)
                    }
                  )
                })
              )
          : undefined
      }
    >
      {data?.resource?.envName && (
        <Container className={css.harnessEntity}>
          <Text>{`${getString('environment')}:`}</Text>
          <Text>{data.resource.envName}</Text>
        </Container>
      )}
      <VerificationStatusCard status={data?.resource?.deploymentVerificationJobInstanceSummary?.status} />
      <DeploymentProgressAndNodes
        deploymentSummary={data?.resource?.deploymentVerificationJobInstanceSummary}
        className={cx(css.deploymentContent, hasServiceAndDeploymentTag ? css.highlightOnHover : undefined)}
      />
    </Container>
  )
}

function ActivitiesList(props: ActivitiesListProps): JSX.Element {
  const { activities, onSelectActivity, selectedActivityId, onBackToChangesClick } = props
  return (
    <Container width={300} height="100%" className={css.activityList}>
      {onBackToChangesClick && (
        <Button
          text="Back to Changes List"
          onClick={onBackToChangesClick}
          className={css.backToChangeList}
          icon="double-chevron-left"
        />
      )}
      {activities?.map(activity => {
        const { name, activityId, verificationResult } = activity || {}
        if (!name || !activityId || !verificationResult) return null
        return (
          <Container
            key={`${name}-${activityId}`}
            className={cx(css.activityItem, activityId === selectedActivityId ? css.selectedActivity : undefined)}
            onClick={() => onSelectActivity?.(activityId)}
          >
            <Container>
              <Text color={Color.BLACK} lineClamp={1}>
                {name}
              </Text>
            </Container>
            <Icon
              name="cv-main"
              data-verification-result={verificationResult}
              className={css.verificationResult}
              size={22}
            />
          </Container>
        )
      })}
    </Container>
  )
}

export function EventDetailsForChange(props: EventDetailsForChangeProps): JSX.Element {
  const { onCloseCallback, selectedActivityInfo, selectedActivities } = props
  const [selectedActivityId, setSelectedActivityId] = useState(
    selectedActivityInfo?.selectedActivityId || selectedActivities?.[0]?.activityId
  )
  const [displayJSON, setDisplayJSON] = useState(false)
  const { getString } = useStrings()
  const activityType = selectedActivityInfo?.selectedActivityType || selectedActivities?.[0]?.activityType

  return (
    <Drawer {...DrawerProps} isOpen={true} onClose={onCloseCallback} className={css.main}>
      <Text color={Color.BLACK} className={css.drawerHeading}>
        {getDrawerHeading(getString, selectedActivities)}
      </Text>
      <Container className={css.mainContent}>
        <ActivitiesList
          activities={selectedActivities || []}
          onSelectActivity={updatedActivityId => setSelectedActivityId(updatedActivityId)}
          selectedActivityId={selectedActivityId}
          onBackToChangesClick={displayJSON ? () => setDisplayJSON(false) : undefined}
        />
        <Container width="100%" padding="medium" height="100%">
          {(activityType === 'KUBERNETES' || activityType === 'INFRASTRUCTURE') && (
            <KubernetesContent
              selectedActivityId={selectedActivityId}
              displayJSON={displayJSON}
              onViewJSONClick={() => setDisplayJSON(true)}
            />
          )}
          {activityType === 'DEPLOYMENT' && <DeploymentContent selectedActivityId={selectedActivityId} />}
        </Container>
      </Container>
    </Drawer>
  )
}
