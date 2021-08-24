import React from 'react'
import { Text, Container, IconName, Color, Link } from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { isNumber } from 'lodash-es'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { MetricCategoriesWithRiskScore } from '@cv/components/MetricCategoriesWithRiskScore/MetricCategoriesWithRiskScore'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CVProgressBar from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/CVProgressBar/CVProgressBar'
import { useGetRecentActivityVerificationResults, ActivityVerificationResultDTO, CategoryRisk } from 'services/cv'
import ActivityType from '../ActivityType/ActivityType'
import css from './RecentActivityChanges.module.scss'

interface ActivityVerificationProgressWithRiskProps {
  activityStartTime?: number
  status?: ActivityVerificationResultDTO['status']
  overallRisk?: number
  progressPercentage?: number
  remainingTime?: number
}

function getActivityColumnNames(getString: UseStringsReturn['getString']) {
  return [
    getString('cv.activityTimeline.otherChanges'),
    getString('cv.activityChanges.riskBeforeChange'),
    getString('cv.verificationStatus'),
    getString('cv.activityChanges.riskAfterChange')
  ].map(columnName => (
    <Text
      width={columnName === getString('cv.activityTimeline.otherChanges') ? 200 : 300}
      key={columnName}
      font={{ weight: 'bold', size: 'small' }}
      style={{ textTransform: 'uppercase' }}
    >
      {columnName}
    </Text>
  ))
}

function getLoadingData(getString: UseStringsReturn['getString']): ActivityVerificationResultDTO[] {
  return [
    {
      activityType: 'DEPLOYMENT',
      activityName: 'Configuration Change',
      serviceIdentifier: 'Manager',
      preActivityRisks: [
        {
          category: getString('infrastructureText') as CategoryRisk['category'],
          risk: 55
        },
        {
          category: getString('errors') as CategoryRisk['category'],
          risk: 25
        },
        {
          category: getString('performance') as CategoryRisk['category'],
          risk: 30
        }
      ],
      progressPercentage: 43,
      activityStartTime: new Date().getTime(),
      status: 'IN_PROGRESS',
      postActivityRisks: [
        {
          category: getString('infrastructureText') as CategoryRisk['category'],
          risk: 55
        },
        {
          category: getString('errors') as CategoryRisk['category'],
          risk: 25
        },
        {
          category: getString('performance') as CategoryRisk['category'],
          risk: 30
        }
      ]
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityName: 'Infrastruture Update',
      serviceIdentifier: 'Delegate',
      preActivityRisks: [
        {
          category: getString('infrastructureText') as CategoryRisk['category'],
          risk: 55
        },
        {
          category: getString('errors') as CategoryRisk['category'],
          risk: 25
        },
        {
          category: getString('performance') as CategoryRisk['category'],
          risk: 30
        }
      ],
      progressPercentage: 43,
      activityStartTime: new Date().getTime(),
      status: 'IN_PROGRESS',
      postActivityRisks: [
        {
          category: getString('infrastructureText') as CategoryRisk['category'],
          risk: 55
        },
        {
          category: getString('errors') as CategoryRisk['category'],
          risk: 25
        },
        {
          category: getString('performance') as CategoryRisk['category'],
          risk: 30
        }
      ]
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityName: 'Database Upgrade',
      serviceIdentifier: 'MongoDB',
      preActivityRisks: [
        {
          category: getString('infrastructureText') as CategoryRisk['category'],
          risk: 55
        },
        {
          category: getString('errors') as CategoryRisk['category'],
          risk: 25
        },
        {
          category: getString('performance') as CategoryRisk['category'],
          risk: 30
        }
      ],
      progressPercentage: 43,
      activityStartTime: new Date().getTime(),
      status: 'IN_PROGRESS',
      postActivityRisks: [
        {
          category: getString('infrastructureText') as CategoryRisk['category'],
          risk: 55
        },
        {
          category: getString('errors') as CategoryRisk['category'],
          risk: 25
        },
        {
          category: getString('performance') as CategoryRisk['category'],
          risk: 30
        }
      ]
    }
  ]
}

function getEmptyRiskArray(getString: UseStringsReturn['getString']) {
  return [
    {
      category: getString('errors') as CategoryRisk['category'],
      risk: -1
    },
    {
      category: getString('performance') as CategoryRisk['category'],
      risk: -1
    },
    {
      category: getString('infrastructureText') as CategoryRisk['category'],
      risk: -1
    }
  ]
}

function activityTypeToIcon(activityType: ActivityVerificationResultDTO['activityType']): IconName {
  switch (activityType) {
    case 'DEPLOYMENT':
      return 'nav-cd'
    case 'KUBERNETES':
    case 'INFRASTRUCTURE':
      return 'service-kubernetes'
    case 'CONFIG':
    case 'OTHER':
    case 'CUSTOM':
      return 'config-change'
    default:
      return 'custom-service'
  }
}

function ActivityVerificationProgressWithRisk(props: ActivityVerificationProgressWithRiskProps): JSX.Element {
  const { progressPercentage, overallRisk = 0, status, remainingTime, activityStartTime } = props
  const { getString } = useStrings()
  let progressStatus = ''
  if (!isNumber(progressPercentage)) {
    progressStatus = ''
  } else if (status === 'NOT_STARTED') {
    progressStatus = getString('cv.initiated')
  } else if (status === 'IN_PROGRESS') {
    progressStatus = `${getString('inProgress')} (${
      remainingTime ? Math.floor(remainingTime / (1000 * 60)) : ''
    } ${getString('cv.activityChanges.minutesRemaining').toLocaleLowerCase()})`
  } else if (status === 'VERIFICATION_FAILED') {
    progressStatus = `${getString('cv.admin.notifications.create.stepThree.verification')} ${getString(
      'failed'
    ).toLocaleLowerCase()} (${getString('cv.riskScore')}: ${overallRisk})`
  } else if (status === 'VERIFICATION_PASSED') {
    progressStatus = `${getString('cv.admin.notifications.create.stepThree.verification')} ${getString(
      'passed'
    ).toLocaleLowerCase()} (${getString('cv.riskScore')}: ${overallRisk})`
  } else if (status === 'ERROR') {
    progressStatus = getString('cv.verificationErrored')
  }

  return (
    <Container className={css.verificationProgress}>
      <Text color={Color.BLACK} style={{ fontSize: 12 }}>
        {progressStatus}
      </Text>
      <CVProgressBar value={progressPercentage} riskScore={overallRisk} />
      {activityStartTime && (
        <Text style={{ fontSize: 12 }}>{`${getString('pipeline.startedOn')} ${new Date(
          activityStartTime
        ).toLocaleString()}`}</Text>
      )}
    </Container>
  )
}

export default function RecentActivityChanges(): JSX.Element {
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const {
    loading,
    error,
    data,
    refetch: refetchActivities
  } = useGetRecentActivityVerificationResults({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      size: 5
    }
  })

  const { getString } = useStrings()

  if (error?.message) {
    return (
      <ul className={css.activityList}>
        <li className={css.headerRow}>{getActivityColumnNames(getString)}</li>
        <NoDataCard
          icon="error"
          iconSize={30}
          message={error.message}
          className={css.noData}
          buttonText={getString('retry')}
          onClick={() => refetchActivities()}
        />
      </ul>
    )
  }

  if (!loading && !data?.resource?.length) {
    return (
      <ul className={css.activityList}>
        <li className={css.headerRow}>{getActivityColumnNames(getString)}</li>
        <li className={css.emptyBar}>
          <div style={{ width: 205 }}>
            <Link
              intent="primary"
              minimal
              onClick={() => {
                history.push(
                  routes.toCVAdminSetup({
                    accountId,
                    projectIdentifier,
                    orgIdentifier
                  })
                )
              }}
            >
              {getString('cv.setup')}
            </Link>
          </div>
          <MetricCategoriesWithRiskScore
            categoriesWithRiskScores={getEmptyRiskArray(getString)}
            className={css.dataColumn}
          />
          <div style={{ width: 290 }}>
            {getString('cv.dashboard.notStarted')}
            <div style={{ width: 200 }}>
              <CVProgressBar value={0} riskScore={0} />
            </div>
          </div>
          <MetricCategoriesWithRiskScore
            categoriesWithRiskScores={getEmptyRiskArray(getString)}
            className={css.dataColumn}
          />
        </li>
      </ul>
    )
  }

  const recentActivities = !loading ? data?.resource : getLoadingData(getString)
  return (
    <ul className={css.activityList}>
      <li className={css.headerRow}>{getActivityColumnNames(getString)}</li>
      {recentActivities?.map(recentActivity => {
        const {
          activityName,
          serviceIdentifier,
          activityType,
          activityStartTime,
          remainingTimeMs,
          status,
          overallRisk,
          progressPercentage,
          preActivityRisks,
          postActivityRisks
        } = recentActivity || {}
        return (
          <li
            key={`${recentActivity.activityType}-${recentActivity.activityName}-${recentActivity.serviceIdentifier}-${recentActivity.activityId}`}
            className={cx(css.dataRow, loading ? Classes.SKELETON : undefined)}
            onClick={() =>
              history.push(
                routes.toCVActivityChangesPage({
                  activityId: recentActivity.activityId as string,
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })
              )
            }
          >
            <ActivityType
              serviceName={serviceIdentifier || ''}
              buildName={activityName || ''}
              iconProps={{ name: activityTypeToIcon(activityType), size: 25 }}
            />
            <MetricCategoriesWithRiskScore
              categoriesWithRiskScores={preActivityRisks || getEmptyRiskArray(getString)}
              className={css.dataColumn}
            />
            <Container className={css.columnWrapp}>
              <ActivityVerificationProgressWithRisk
                activityStartTime={activityStartTime}
                status={status}
                overallRisk={overallRisk}
                progressPercentage={progressPercentage}
                remainingTime={remainingTimeMs}
              />
            </Container>
            <MetricCategoriesWithRiskScore
              categoriesWithRiskScores={postActivityRisks || getEmptyRiskArray(getString)}
              className={css.dataColumn}
            />
          </li>
        )
      })}
    </ul>
  )
}
