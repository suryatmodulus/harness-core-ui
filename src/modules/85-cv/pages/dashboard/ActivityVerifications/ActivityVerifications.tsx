import React, { useMemo } from 'react'
import { Container, Text, Link } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useGetRecentDeploymentActivityVerifications } from 'services/cv'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import CVProgressBar from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/CVProgressBar/CVProgressBar'
import VerificationItem from './VerificationItem'
import css from './ActivityVerifications.module.scss'

export default function ActivityVerifications(): JSX.Element {
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const { getString } = useStrings()
  const { data, loading } = useGetRecentDeploymentActivityVerifications({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      size: 5
    } as any // Size not supported ?
  })

  const recentVerificationColumnNames = useMemo(
    () =>
      [
        getString('deploymentText'),
        getString('cv.activityChanges.preProduction'),
        getString('cv.activityChanges.productionDeployment'),
        getString('cv.activityChanges.postProdDeployment')
      ].map(columnName => (
        <Text
          width={columnName === getString('deploymentText') ? 200 : 300}
          key={columnName}
          font={{ weight: 'bold', size: 'small' }}
          style={{ textTransform: 'uppercase' }}
        >
          {columnName}
        </Text>
      )),
    []
  )

  if (!loading && !data?.resource?.length) {
    return (
      <ul className={css.activityList}>
        <li className={css.headerRow}>{recentVerificationColumnNames}</li>
        <li className={css.emptyBar}>
          <div style={{ width: 210 }}>
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
          <div style={{ width: 295 }}>
            {getString('cv.dashboard.notStarted')}
            <div style={{ width: 200 }}>
              <CVProgressBar value={0} riskScore={0} />
            </div>
          </div>
          <div style={{ width: 295 }}>
            {getString('cv.dashboard.notStarted')}
            <div style={{ width: 200 }}>
              <CVProgressBar value={0} riskScore={0} />
            </div>
          </div>
          <div style={{ width: 300 }}>
            {getString('cv.dashboard.notStarted')}
            <div style={{ width: 200 }}>
              <CVProgressBar value={0} riskScore={0} />
            </div>
          </div>
        </li>
      </ul>
    )
  }

  return (
    <Container className={css.main}>
      <Text className={css.headerText}>{getString('cv.overviewPage.recentChangeVerifications')}</Text>
      <ul className={css.activityList}>
        <li className={css.headerRow}>{recentVerificationColumnNames}</li>
        {data?.resource?.map(item => {
          const { serviceIdentifier, tag } = item
          return (
            <VerificationItem
              key={`${tag}-${serviceIdentifier}`}
              item={item}
              onSelect={phase =>
                history.push(
                  routes.toCVDeploymentPage({
                    projectIdentifier,
                    orgIdentifier,
                    deploymentTag: encodeURIComponent(tag!),
                    serviceIdentifier: encodeURIComponent(serviceIdentifier!),
                    accountId
                  }) + (phase ? `?phase=${phase}` : '')
                )
              }
            />
          )
        })}
      </ul>
    </Container>
  )
}
