import React, { useState } from 'react'
import { Menu, Position, Dialog } from '@blueprintjs/core'
import { Button, Popover, useModalHook } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import { getAllowedTemplateTypes } from '@templates-library/utils/templatesUtils'
import { CreateTemplateModal } from '../CreateTemplateModal/CreateTemplateModal'
import css from './TemplatesListHeader.module.scss'

export function TemplatesListHeader(): React.ReactElement {
  const handleAddTemplate = () => undefined
  const { getString } = useStrings()
  const [createTemplateType, setCreateTemplateType] = useState('')
  const allowedTemplateTypes = getAllowedTemplateTypes(getString)

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.createTemplateDialog} onClose={hideModal}>
        <CreateTemplateModal
          initialValues={{ templateEntityType: createTemplateType, name: 'New Template' }}
          onClose={hideModal}
        />
      </Dialog>
    ),
    [createTemplateType]
  )

  const renderMenu = () => {
    return (
      <Menu style={{ width: '120px' }} className={css.templateTypeMenu} onClick={e => e.stopPropagation()}>
        {allowedTemplateTypes.map(templateType => (
          <Menu.Item
            text={templateType.label}
            key={templateType.value}
            className={css.templateTypeMenuItem}
            disabled={templateType.disabled}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              setCreateTemplateType(templateType.value as string)
              showModal()
            }}
          />
        ))}
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
          <Button rightIcon={'chevron-down'} intent={'primary'} onClick={handleAddTemplate} withoutBoxShadow>
            {<String stringID="templatesLibrary.addNewTemplate" />}
          </Button>
        </Popover>
      </div>
      {/*<div className={css.rhs}>{'<TemplatesFilters />'}</div>*/}
    </div>
  )
}
