import React from 'react'
import { Text, Tab, Container, Tabs, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import UserSummaryTab from './UserSummaryTab'

const UserOverView: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Container padding={{ left: 'xlarge', right: 'xlarge' }}>
      <Tabs id="overview">
        <Tab id="summary" title={<Text color={Color.BLACK}>{getString('summary')}</Text>} panel={<UserSummaryTab />} />
        {/* <Tab
          id="authentication"
          title={<Text color={Color.BLACK}>{getString('authentication')}</Text>}
          panel={<UserAuthenticationTab />}
        />
        <Tab
          id="permissions"
          title={<Text color={Color.BLACK}>{getString('permissions')}</Text>}
          panel={<UserPermissionsTab />}
        />
        <Tab
          id="activityLog"
          title={<Text color={Color.BLACK}>{getString('activityLog')}</Text>}
          panel={<UserActivityLogTab />}
        /> */}
      </Tabs>
    </Container>
  )
}

export default UserOverView
