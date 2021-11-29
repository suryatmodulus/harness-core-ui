import React, { useState } from 'react'
import { Icon, Page } from '@wings-software/uicore'
import { Drawer } from '@blueprintjs/core'
import { useGetYamlDiff } from 'services/audit'
import css from './YamlDiff.module.scss'

interface YamlDiffProps {
  auditId: string
  accountIdentifier: string
  onDrawerClose: () => void
}

const YamlDiff: React.FC<YamlDiffProps> = props => {
  const { data } = useGetYamlDiff({
    queryParams: {
      accountIdentifier: props.accountIdentifier,
      auditId: props.auditId
    }
  })

  return (
    <>
      {
        <Drawer
          autoFocus={true}
          enforceFocus={true}
          hasBackdrop={true}
          usePortal={true}
          canOutsideClickClose={true}
          canEscapeKeyClose={true}
          isOpen={true}
        >
          <Page.Header
            size="small"
            title="Event Summary"
            content={<Icon name="cross" onClick={() => props.onDrawerClose()} />}
          />
          <Page.Body className={css.body}>Page body content</Page.Body>
        </Drawer>
      }
    </>
  )
}

export default YamlDiff
