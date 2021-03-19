import React from 'react'
import { Container, Text, Link } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useGetRecentDeploymentActivityVerifications } from 'services/cv'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/exports'
import CVProgressBar from '@cv/components/CVProgressBar/CVProgressBar'
import i18n from './ActivityVerifications.i18n'
import VerificationItem from './VerificationItem'
import css from './ActivityVerifications.module.scss'

const RECENT_VERIFICATIONS_COLUMN_NAMES = Object.values(i18n.activityVerificationsColumns).map(columnName => (
  <Text
    width={columnName === i18n.activityVerificationsColumns.deployments ? 200 : 300}
    key={columnName}
    font={{ weight: 'bold', size: 'small' }}
    style={{ textTransform: 'uppercase' }}
  >
    {columnName}
  </Text>
))

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

  if (!loading && !data?.resource?.length) {
    return (
      <ul className={css.activityList}>
        <li className={css.headerRow}>{RECENT_VERIFICATIONS_COLUMN_NAMES}</li>
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
              {i18n.setup}
            </Link>
          </div>
          <div style={{ width: 295 }}>
            {i18n.verificationResultText.verificationNotStarted}
            <div style={{ width: 200 }}>
              <CVProgressBar value={0} riskScore={0} />
            </div>
          </div>
          <div style={{ width: 295 }}>
            {i18n.verificationResultText.verificationNotStarted}
            <div style={{ width: 200 }}>
              <CVProgressBar value={0} riskScore={0} />
            </div>
          </div>
          <div style={{ width: 300 }}>
            {i18n.verificationResultText.verificationNotStarted}
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
        <li className={css.headerRow}>{RECENT_VERIFICATIONS_COLUMN_NAMES}</li>
        {data?.resource?.map(item => {
          const { serviceIdentifier, tag } = item
          return (
            <VerificationItem
              key={`${tag}-${serviceIdentifier}`}
              item={item}
              onSelect={phase =>
                history.push(
                  routes.toCVDeploymentPage({
                    projectIdentifier: projectIdentifier as string,
                    orgIdentifier: orgIdentifier as string,
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
