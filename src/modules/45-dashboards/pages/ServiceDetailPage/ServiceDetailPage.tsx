import React from 'react'

import { Container, Layout } from '@wings-software/uicore'

import { Page } from '@common/exports'
import ActiveServiceInstances from '@dashboards/components/ActiveServiceInstances/ActiveServiceInstances'
import PipelineDeploymentList from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'

interface ServiceDetailPageProps {
  name: string
  id?: string
}

const ServiceDetailPage: React.FC<ServiceDetailPageProps> = props => {
  const { name } = props
  return (
    <>
      <Page.Header size="large" title={name} toolbar={<Container></Container>} />
      <Page.Body>
        <Layout.Horizontal flex>
          <ActiveServiceInstances />
          <Container style={{ width: '50%', height: '50%' }}>
            <PipelineDeploymentList onRunPipeline={() => undefined} isMinimalView={true} />
          </Container>
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default ServiceDetailPage
