import React from 'react'
import { Text, Layout, Color, Button } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/exports'
import { useSourceCodeModal } from '@common/modals/SourceCodeManager/useSourceCodeManager'

const SourceCodeManagerList: React.FC = () => {
  const { getString } = useStrings()

  const { openSourceCodeModal } = useSourceCodeModal({ onSuccess: noop })

  return (
    <Layout.Vertical spacing="large">
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('userProfile.mysourceCodeManagers')}
      </Text>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Button text={getString('userProfile.plusSCM')} minimal onClick={openSourceCodeModal} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default SourceCodeManagerList
