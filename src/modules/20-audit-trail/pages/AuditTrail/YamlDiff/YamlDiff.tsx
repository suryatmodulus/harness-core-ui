import React, { useState } from 'react'
import { Icon, Page } from '@wings-software/uicore'
import { Drawer } from '@blueprintjs/core'
import { useGetYamlDiff } from 'services/audit'
import css from './YamlDiff.module.scss'

interface YamlDiffProps {
  auditId: string
  accountIdentifier: string
}

const YamlDiff: React.FC<YamlDiffProps> = props => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data } = useGetYamlDiff({
    queryParams: {
      accountIdentifier: props.accountIdentifier,
      auditId: props.auditId
    }
  })

  const onYamlDiffClick = () => {
    setDrawerOpen(!drawerOpen)
  }
  return (
    <>
      <Icon name="file" onClick={onYamlDiffClick} />
      {drawerOpen && (
        <Drawer
          autoFocus={true}
          enforceFocus={true}
          hasBackdrop={true}
          usePortal={true}
          canOutsideClickClose={true}
          canEscapeKeyClose={true}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Page.Header
            size="small"
            title="Event Summary"
            content={<Icon name="cross" onClick={() => setDrawerOpen(false)} />}
          />
          <Page.Body className={css.body}>Page body content</Page.Body>
        </Drawer>
      )}
    </>
  )
}

export default YamlDiff
