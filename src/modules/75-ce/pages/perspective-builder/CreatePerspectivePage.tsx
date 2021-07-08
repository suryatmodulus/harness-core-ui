import React from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Layout } from '@wings-software/uicore'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'

import PerspectiveBuilder from '../../components/PerspectiveBuilder'

const PerspectiveHeader: React.FC = () => {
  const { perspectiveId } = useParams<{
    perspectiveId: string
  }>()
  return (
    <Layout.Horizontal>
      <Layout.Vertical>
        <Heading color="grey800" level={2}>
          {perspectiveId}
        </Heading>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const CreatePerspectivePage: React.FC = () => {
  return (
    <>
      <PageHeader title={<PerspectiveHeader />} />
      <PageBody>
        <PerspectiveBuilder />
      </PageBody>
    </>
  )
}

export default CreatePerspectivePage
