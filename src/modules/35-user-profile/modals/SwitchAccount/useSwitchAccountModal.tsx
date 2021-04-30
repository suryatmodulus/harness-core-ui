import React, { useState } from 'react'
import { Dialog } from '@blueprintjs/core'
import { useModalHook, Layout, ExpandingSearchInput, Text, Color } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'

import type { RestResponseUser } from 'services/portal'
import type { UseGetMockData } from '@common/utils/testUtils'
import SwitchAccount from './SwitchAccount'
import css from './SwitchAccount.module.scss'

interface ModalReturn {
  openSwitchAccountModal: () => void
  closeSwitchAccountModal: () => void
}

interface SwitchAccountModalProps {
  mock?: UseGetMockData<RestResponseUser>
}

const useSwitchAccountModal = (props: SwitchAccountModalProps): ModalReturn => {
  const { mock } = props
  const [searchString, setSearchString] = useState<string>('')
  const { getString } = useStrings()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        title={
          <Layout.Horizontal spacing="small" className={css.alignCenter}>
            <Text color={Color.BLACK} font={{ size: 'medium' }}>
              <String stringID="userProfile.switchAccount" />
            </Text>
            <ExpandingSearchInput
              placeholder={getString('userProfile.switchAccountSearch')}
              defaultValue={searchString}
              onChange={str => setSearchString(str.trim())}
            />
          </Layout.Horizontal>
        }
        onClose={hideModal}
        className={css.modal}
      >
        <SwitchAccount hideModal={hideModal} searchString={searchString} mock={mock} />
      </Dialog>
    ),
    [searchString]
  )

  return {
    openSwitchAccountModal: () => {
      setSearchString('')
      showModal()
    },
    closeSwitchAccountModal: hideModal
  }
}

export default useSwitchAccountModal
