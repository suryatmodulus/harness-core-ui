import React from 'react'
import { Container, Icon, Text } from '@wings-software/uikit'
import { Link } from 'react-router-dom'
import { useRouteParams } from 'framework/exports'
import { routeCVMainDashBoardPage } from 'navigation/cv/routes'
import i18n from './DeploymentDrilldownView.i18n'
import styles from './DeploymentDrilldownView.module.scss'

export interface DeploymentDrilldownViewHeaderProps {
  deploymentTag?: string
  environments?: string[]
  service?: string
}

export default function DeploymentDrilldownViewHeader(props: DeploymentDrilldownViewHeaderProps) {
  const {
    params: { projectIdentifier, orgIdentifier }
  } = useRouteParams()
  return (
    <Container className={styles.header} padding="small">
      <Link
        to={routeCVMainDashBoardPage.url({
          projectIdentifier: projectIdentifier as string,
          orgIdentifier: orgIdentifier as string
        })}
      >{`${i18n.dashboard} /`}</Link>
      <Container className={styles.headerWrap}>
        <Icon size={30} name="cd-main" />
        <Text font={{ size: 'medium', weight: 'bold' }}>{props.deploymentTag}</Text>
        <Text margin={{ right: 'small', left: 'small' }}>{i18n.environments}:</Text>
        <Text font={{ weight: 'bold' }}>{props?.environments?.join(', ')}</Text>
        <Text margin={{ right: 'small', left: 'small' }}>{i18n.service}:</Text>
        <Text font={{ weight: 'bold' }}>{props.service}</Text>
      </Container>
    </Container>
  )
}
