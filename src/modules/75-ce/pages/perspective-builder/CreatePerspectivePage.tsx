import React from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Layout } from '@wings-software/uicore'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import { useGetPerspective } from 'services/ce/'

import PerspectiveBuilder from '../../components/PerspectiveBuilder'

const PerspectiveHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Layout.Horizontal>
      <Layout.Vertical>
        <Heading color="grey800" level={2}>
          {title}
        </Heading>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const CreatePerspectivePage: React.FC = () => {
  const { perspectiveId } = useParams<{
    perspectiveId: string
  }>()

  const { data: perspectiveRes, loading } = useGetPerspective({
    queryParams: {
      perspectiveId: perspectiveId
    }
  })

  const perspectiveData = perspectiveRes?.resource

  return (
    <>
      <PageHeader title={<PerspectiveHeader title={perspectiveData?.name || perspectiveId} />} />
      <PageBody loading={loading}>
        <PerspectiveBuilder perspectiveData={perspectiveData} />
      </PageBody>
    </>
  )
}

export default CreatePerspectivePage
