import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Layout, Tabs, Tab, Icon } from '@wings-software/uicore'
import { PageSpinner } from '@common/components'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import { useGetPerspective } from 'services/ce/'

import PerspectiveBuilder from '../../components/PerspectiveBuilder'
import ReportsAndBudgets from '../../components/PerspectiveReportsAndBudget/PerspectiveReportsAndBudgets'
import css from './CreatePerspectivePage.module.scss'

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
  const tabHeadings = ['1. Perspective Builder', '2. Reports and Budget']
  const [selectedTabId, setSelectedTabId] = useState(tabHeadings[0])

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
      {loading && <PageSpinner />}
      <PageBody>
        <Tabs
          id="perspectiveBuilder"
          onChange={(id: string) => setSelectedTabId(id)}
          selectedTabId={selectedTabId}
          data-tabId={selectedTabId}
        >
          <Tab
            id={tabHeadings[0]}
            panel={
              <PerspectiveBuilder perspectiveData={perspectiveData} onNext={() => setSelectedTabId(tabHeadings[1])} />
            }
            panelClassName={css.panelClass}
            title={<span className={css.tab}>{tabHeadings[0]}</span>}
            data-testid={tabHeadings[0]}
          />
          <Icon
            name="chevron-right"
            height={20}
            size={20}
            margin={{ right: 'small', left: 'small' }}
            color={'grey400'}
            style={{ alignSelf: 'center' }}
          />
          <Tab
            id={tabHeadings[1]}
            title={<span className={css.tab}>{tabHeadings[1]}</span>}
            panel={<ReportsAndBudgets values={perspectiveData} />}
            data-testid={tabHeadings[1]}
          />
        </Tabs>
      </PageBody>
    </>
  )
}

export default CreatePerspectivePage
