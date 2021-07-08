import React from 'react'
import { Menu, Position } from '@blueprintjs/core'
import { Button, Popover } from '@wings-software/uicore'
import { String } from 'framework/strings'

import css from './TemplatesListHeader.module.scss'

export function TemplatesListHeader(): React.ReactElement {
  const handleAddTemplate = () => undefined

  const renderMenu = () => {
    return (
      <Menu style={{ width: '120px' }} onClick={e => e.stopPropagation()}>
        <Menu.Item
          text={'Pipeline'}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        />
        <Menu.Item
          text={'Stage'}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        />
        <Menu.Item
          text={'Service'}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        />
        <Menu.Item
          text={'Infrastructure'}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        />
        <Menu.Item
          text={'Step'}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        />
        <Menu.Item
          text={'Step group'}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        />
        <Menu.Item
          text={'Execution'}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        />
      </Menu>
    )
  }
  return (
    <div className={css.main}>
      <div className={css.lhs}>
        <Popover
          modifiers={{
            arrow: { enabled: false }
          }}
          content={renderMenu()}
          position={Position.BOTTOM}
        >
          <Button rightIcon={'caret-down'} intent={'primary'} onClick={handleAddTemplate} withoutBoxShadow>
            {<String stringID="templatesLibrary.addNewTemplate" />}
          </Button>
        </Popover>
      </div>
      {/*<div className={css.rhs}>{'<TemplatesFilters />'}</div>*/}
    </div>
  )
}
