import React from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Layout } from '@wings-software/uicore'
import { PageHeader } from '@common/components/Page/PageHeader'

const PerspectiveHeader: React.FC = () => {
  const { perspectiveName } = useParams<{
    perspectiveId: string
    perspectiveName: string
  }>()
  return (
    <Layout.Horizontal>
      <Layout.Vertical>
        <Heading color="grey800" level={2}>
          {perspectiveName}
        </Heading>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const PerspectiveDetailsPage: React.FC = () => {
  return (
    <>
      <PageHeader title={<PerspectiveHeader />} />
    </>
  )
}

export default PerspectiveDetailsPage
