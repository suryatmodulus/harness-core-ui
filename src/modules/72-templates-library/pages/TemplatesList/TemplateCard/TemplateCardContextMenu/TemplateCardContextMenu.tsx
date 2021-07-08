import React from 'react'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { TemplatesSummaryResponse } from '@templates-library/temporary-mock/model'

interface ContextMenuProps {
  template: TemplatesSummaryResponse
}

export const TemplateCardContextMenu: React.FC<ContextMenuProps> = ({ template: _template }): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
      <Menu.Item
        text={getString('templatesLibrary.previewTemplate')}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
        }}
      />
      <Menu.Item
        text={getString('templatesLibrary.openEditTemplate')}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
        }}
      />
      <Menu.Item
        text={getString('templatesLibrary.useTemplate')}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
        }}
      />
      <Menu.Item
        text={getString('templatesLibrary.copyToNewPipeline')}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
        }}
      />
      <Menu.Item
        text={getString('templatesLibrary.templatesSettings')}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
        }}
      />
    </Menu>
  )
}
