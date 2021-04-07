import React from 'react'
import { Text, Layout, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import SourceCodeManagerList from '@user-profile/components/UserSummary/SourceCodeManagerList'

const UserSummaryTab: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="large">
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('userProfile.myProjects')}
      </Text>
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('userProfile.myGroups')}
      </Text>
      <SourceCodeManagerList />
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('userProfile.myTools')}
      </Text>
    </Layout.Vertical>
  )
}

export default UserSummaryTab
