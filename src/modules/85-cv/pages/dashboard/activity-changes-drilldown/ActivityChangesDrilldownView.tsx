import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import DeploymentDrilldownViewHeader from '../deployment-drilldown/DeploymentDrilldownViewHeader'
import { VerificationInstancePostDeploymentView } from '../deployment-drilldown/VerificationInstancePostDeploymentView'
import styles from './ActivityChangesDrilldownView.module.scss'

export default function ActivityChangesDrilldownView(): React.ReactElement {
  const { activityId }: any = useParams()
  const [activity, setActivity] = useState<any>()
  return (
    <>
      <Page.Header
        title={
          <DeploymentDrilldownViewHeader
            deploymentTag={activity?.activityName}
            environments={[activity?.environmentIdentifier]}
            service={activity?.serviceIdentifier}
            sourceType={activity?.activityType}
          />
        }
      />
      <Page.Body className={styles.main}>
        <VerificationInstancePostDeploymentView
          selectedActivityId={activityId as string}
          environmentIdentifier={activity?.environmentIdentifier ?? ''}
          activityStartTime={activity?.activityStartTime ?? 0}
          durationMs={activity ? activity.endTime - activity.activityStartTime : 0}
          onActivityLoaded={setActivity}
        />
      </Page.Body>
    </>
  )
}
