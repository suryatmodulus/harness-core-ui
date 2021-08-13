import React from 'react'
import { Layout } from '@wings-software/uicore'
import SourceCodeManagerList from '@user-profile/components/UserSummary/SourceCodeManagerList'
import MyProjectsList from '@user-profile/components/UserSummary/MyProjectsList'
import ApiKeyList from '@rbac/components/ApiKeyList/ApiKeyList'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

const UserSummaryTab: React.FC = () => {
  const { currentUserInfo } = useAppStore()
  return (
    <Layout.Vertical spacing="large">
      <MyProjectsList />
      {/* <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('userProfile.myGroups')}
      </Text> */}
      <SourceCodeManagerList />
      <ApiKeyList apiKeyType="USER" parentIdentifier={currentUserInfo.uuid} />
      {/* <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('userProfile.myTools')}
      </Text> */}
    </Layout.Vertical>
  )
}

export default UserSummaryTab
