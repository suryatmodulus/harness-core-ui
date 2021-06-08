import React from 'react'

import Contribution from '@common/components/Contribution/Contribution'
import { Layout, Tabs, Tab, Card } from '@wings-software/uicore'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import contributions from './mocks/contribution.json'

import css from './UserInsights.module.scss'

interface UserInsightsProps {}

const UserInsights: React.FC<UserInsightsProps> = _props => {
  const { getString } = useStrings()
  const { currentUserInfo } = useAppStore()
  return (
    <Layout.Vertical padding="large">
      {/* TODO add Heatmap component */}
      <Tabs id="insights-view" defaultSelectedTabId="overview">
        <Tab
          id="overview"
          title="Overview"
          panel={
            <Layout.Vertical>
              <Card key="view-1" className={css.card}>
                User viewed project Sample
              </Card>
              <Card key="view-2" className={css.card}>
                User edited project Sample
              </Card>
              <Card key="view-3" className={css.card}>
                User updated project Sample2
              </Card>
            </Layout.Vertical>
          }
        />
        <Tab
          id="contributions"
          title={getString('common.contributions')}
          panel={
            <Layout.Masonry
              center
              gutter={30}
              width={900}
              items={contributions.data}
              renderItem={item => <Contribution view="USER" name={currentUserInfo.name || ''} count={item.total} />}
              keyOf={item => item.timestamp.toString()}
            />
          }
        />
      </Tabs>
    </Layout.Vertical>
  )
}

export default UserInsights
