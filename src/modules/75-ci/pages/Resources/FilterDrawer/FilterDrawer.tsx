import React from 'react'
import { Drawer, IDrawerProps, Classes } from '@blueprintjs/core'
import { Button, Layout } from '@wings-software/uicore'
import i18n from './FilterDrawer.i18n'
import css from './FilterDrawer.module.scss'

class FilterDrawer extends React.Component<{ isFilterPanelOpen: boolean; onClose?: () => void }> {
  state: IDrawerProps = {
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    hasBackdrop: true,
    usePortal: true,
    isOpen: false,
    size: 550
  }

  render() {
    return (
      <Drawer
        className={css.filterDrawer}
        {...this.state}
        isOpen={this.props.isFilterPanelOpen}
        onClose={this.props.onClose}
        icon="settings"
        title={i18n.filterTitle}
      >
        <div className={Classes.DRAWER_BODY}>
          <div className={Classes.DIALOG_BODY}>{this.props.children}</div>
        </div>
        <div className={Classes.DRAWER_FOOTER}>
          <Layout.Horizontal spacing="medium" flex={true} style={{ justifyContent: 'flex-end' }}>
            <Button text={i18n.saveFilter} intent="none" className={css.secondaryBtn} />
            <Button text={i18n.applyFilter} intent="primary" />
          </Layout.Horizontal>
        </div>
      </Drawer>
    )
  }
}

export default FilterDrawer
