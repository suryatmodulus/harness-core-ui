import React from 'react'
import { Container, Icon, IconName, Text } from '@wings-software/uicore'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getIconBySourceType } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import styles from './DeploymentDrilldownView.module.scss'

export interface DeploymentDrilldownViewHeaderProps {
  deploymentTag?: string
  environments?: string[]
  service?: string
  sourceType?: string
}

export default function DeploymentDrilldownViewHeader(props: DeploymentDrilldownViewHeaderProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  return (
    <Container className={styles.header} padding="small">
      <Link
        to={routes.toCVProjectOverview({
          projectIdentifier,
          orgIdentifier,
          accountId
        })}
      >{`${getString('dashboardLabel')} /`}</Link>
      <Container className={styles.headerWrap}>
        {!!getIconBySourceType(props.sourceType!) && (
          <Icon size={30} margin="xsmall" name={getIconBySourceType(props.sourceType!) as IconName} />
        )}
        <Text font={{ size: 'medium', weight: 'bold' }}>{props.deploymentTag}</Text>
        <Text margin={{ right: 'small', left: 'small' }}>{getString('environments')}:</Text>
        <Text font={{ weight: 'bold' }}>{props?.environments?.join(', ')}</Text>
        <Text margin={{ right: 'small', left: 'small' }}>{getString('service')}:</Text>
        <Text font={{ weight: 'bold' }}>{props.service}</Text>
      </Container>
    </Container>
  )
}
