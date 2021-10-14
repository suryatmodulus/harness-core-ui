import React, { useState } from 'react'
import { IDrawerProps, Position, Drawer } from '@blueprintjs/core'
import cx from 'classnames'
import { Container, Text, Color, Icon, Button } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { PageError } from '@common/components/Page/PageError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { ActivityVerificationResultDTO, useGetDeploymentActivitySummary } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import VerificationStatusCard from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/VerificationStatusCard/VerificationStatusCard'
import { DeploymentProgressAndNodes } from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/DeploymentProgressAndNodes'
import { VerificationActivityRiskCardWithApi } from '../VerificationActivityRiskCard/VerificationActivityRiskCard'
import type { EventData } from '../ActivitiesTimelineView/ActivitiesTimelineView'
import css from './EventDetailsForChange.module.scss'

interface EventDetailsForChangeProps {
  onCloseCallback: () => void
  selectedActivityInfo?: {
    selectedActivityId: string
    selectedActivityType: ActivityVerificationResultDTO['activityType']
  }
  selectedActivities?: EventData[]
}

interface KubernetesContentProps {
  selectedActivityId: string
  displayJSON: boolean
  onViewJSONClick: () => void
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

function KubernetesContent(props: KubernetesContentProps): JSX.Element {
  const { selectedActivityId } = props
  const {
    projectIdentifier,
    orgIdentifier,
    accountId,
    activityId: routeActivityId
  } = useParams<ProjectPathProps & { activityId?: string }>()

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
