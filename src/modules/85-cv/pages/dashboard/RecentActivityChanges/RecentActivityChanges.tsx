import React from 'react'
import { Text, Container, IconName, Color, Link } from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { isNumber } from 'lodash-es'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/exports'
import {
  MetricCategoryNames,
  MetricCategoriesWithRiskScore
} from '@cv/components/MetricCategoriesWithRiskScore/MetricCategoriesWithRiskScore'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CVProgressBar from '@cv/components/CVProgressBar/CVProgressBar'
import { useGetRecentActivityVerificationResults, ActivityVerificationResultDTO, CategoryRisk } from 'services/cv'
import i18n from './RecentActivityChanges.i18n'
import ActivityType from '../ActivityType/ActivityType'
import css from './RecentActivityChanges.module.scss'

interface ActivityVerificationProgressWithRiskProps {
  activityStartTime?: number
  status?: ActivityVerificationResultDTO['status']
  overallRisk?: number
  progressPercentage?: number
  remainingTime?: number
}

const ACTIVITY_COLUMN_NAMES = Object.values(i18n.activityChangesColumnNames).map(columnName => (
  <Text
    width={columnName === i18n.activityChangesColumnNames.otherChanges ? 200 : 300}
    key={columnName}
    font={{ weight: 'bold', size: 'small' }}
    style={{ textTransform: 'uppercase' }}
  >
    {columnName}
  </Text>
))

const LOADING_SKELETON_DATA: ActivityVerificationResultDTO[] = [
  {
    activityType: 'DEPLOYMENT',
    activityName: 'Configuration Change',
    serviceIdentifier: 'Manager',
    preActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'IN_PROGRESS',
    postActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
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
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'IN_PROGRESS',
    postActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
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
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'IN_PROGRESS',
    postActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ]
  }
]

const EmptyCategoryRiskArray = [
  {
    category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
    risk: -1
  },
  {
    category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
    risk: -1
  },
  {
    category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
    risk: -1
  }
]

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
    progressStatus = i18n.verificationProgressText.initiated
  } else if (status === 'IN_PROGRESS') {
    progressStatus = `${i18n.verificationProgressText.inProgress} (${
      remainingTime ? Math.floor(remainingTime / (1000 * 60)) : ''
    } ${i18n.verificationProgressText.remainingTime})`
  } else if (status === 'VERIFICATION_FAILED') {
    progressStatus = `${i18n.verificationProgressText.verification} ${i18n.verificationProgressText.failed} (${i18n.verificationProgressText.riskScore}: ${overallRisk})`
  } else if (status === 'VERIFICATION_PASSED') {
    progressStatus = `${i18n.verificationProgressText.verification} ${i18n.verificationProgressText.passed} (${i18n.verificationProgressText.riskScore}: ${overallRisk})`
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
        <Text style={{ fontSize: 12 }}>{`${i18n.verificationProgressText.startedOn} ${new Date(
          activityStartTime
        ).toLocaleString()}`}</Text>
      )}
    </Container>
  )
}

export default function RecentActivityChanges(): JSX.Element {
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { loading, error, data, refetch: refetchActivities } = useGetRecentActivityVerificationResults({
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
        <li className={css.headerRow}>{ACTIVITY_COLUMN_NAMES}</li>
        <NoDataCard
          icon="error"
          iconSize={30}
          message={error.message}
          className={css.noData}
          buttonText={i18n.retryText}
          onClick={() => refetchActivities()}
        />
      </ul>
    )
  }

  if (!loading && !data?.resource?.length) {
    return (
      <ul className={css.activityList}>
        <li className={css.headerRow}>{ACTIVITY_COLUMN_NAMES}</li>
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
          <MetricCategoriesWithRiskScore categoriesWithRiskScores={EmptyCategoryRiskArray} className={css.dataColumn} />
          <div style={{ width: 290 }}>
            {getString('cv.dashboard.notStarted')}
            <div style={{ width: 200 }}>
              <CVProgressBar value={0} riskScore={0} />
            </div>
          </div>
          <MetricCategoriesWithRiskScore categoriesWithRiskScores={EmptyCategoryRiskArray} className={css.dataColumn} />
        </li>
      </ul>
    )
  }

  const recentActivities = !loading ? data?.resource : LOADING_SKELETON_DATA
  return (
    <ul className={css.activityList}>
      <li className={css.headerRow}>{ACTIVITY_COLUMN_NAMES}</li>
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
              categoriesWithRiskScores={preActivityRisks || EmptyCategoryRiskArray}
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
              categoriesWithRiskScores={postActivityRisks || EmptyCategoryRiskArray}
              className={css.dataColumn}
            />
          </li>
        )
      })}
    </ul>
  )
}
