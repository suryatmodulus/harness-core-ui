import React from 'react'
import { Container, Icon, IconName, Text } from '@wings-software/uicore'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import i18n from './DeploymentDrilldownView.i18n'
import { getIconBySourceType } from '../../admin/setup/SetupUtils'
import styles from './DeploymentDrilldownView.module.scss'

export interface DeploymentDrilldownViewHeaderProps {
  deploymentTag?: string
  environments?: string[]
  service?: string
  sourceType?: string
}

export default function DeploymentDrilldownViewHeader(props: DeploymentDrilldownViewHeaderProps): React.ReactElement {
  const { projectIdentifier, orgIdentifier, accountId }: any = useParams()
  return (
    <Container className={styles.header} padding="small">
      <Link
        to={routes.toCVProjectOverview({
          projectIdentifier: projectIdentifier as string,
          orgIdentifier: orgIdentifier as string,
          accountId
        })}
      >{`${i18n.dashboard} /`}</Link>
      <Container className={styles.headerWrap}>
        {!!getIconBySourceType(props.sourceType!) && (
          <Icon size={30} margin="xsmall" name={getIconBySourceType(props.sourceType!) as IconName} />
        )}
        <Text font={{ size: 'medium', weight: 'bold' }}>{props.deploymentTag}</Text>
        <Text margin={{ right: 'small', left: 'small' }}>{i18n.environments}:</Text>
        <Text font={{ weight: 'bold' }}>{props?.environments?.join(', ')}</Text>
        <Text margin={{ right: 'small', left: 'small' }}>{i18n.service}:</Text>
        <Text font={{ weight: 'bold' }}>{props.service}</Text>
      </Container>
    </Container>
  )
}
