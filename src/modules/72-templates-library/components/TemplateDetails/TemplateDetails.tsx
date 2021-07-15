import React from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Drawer, Menu, Position } from '@blueprintjs/core'
import { Button, Color, Layout, Popover, Select, SelectOption, Tag, Text, Tabs, Tab } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { TemplateInputs } from '../TemplateInputs/TemplateInputs'

import css from './TemplateDetails.module.scss'

export interface TemplateDetailsProps {
  templateIdentifier: string | undefined
  onClose: () => void
}
export const TemplateDetails: React.FC<TemplateDetailsProps> = props => {
  const { templateIdentifier, onClose } = props
  const { getString } = useStrings()

  const template: { tags: { [key: string]: string }; version: string } = {
    tags: { tag1: '', tag2: '', tag3: '' },
    version: 'V4.6'
  }

  const versionOptions: SelectOption[] = [
    {
      label: 'Default (V4.6)',
      value: 'V4.6'
    },
    {
      label: 'V4.4',
      value: 'V4.4'
    },
    {
      label: 'V4.3',
      value: 'V4.3'
    }
  ]

  const ContextMenu = () => {
    return (
      <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
        <Menu.Item
          text={getString('templatesLibrary.templateSettings')}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        />
      </Menu>
    )
  }

  return (
    <Drawer
      onClose={onClose}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={600}
      isOpen={!!templateIdentifier}
      position={Position.RIGHT}
      className={css.drawer}
    >
      <div className={css.main}>
        <div>
          <Layout.Horizontal spacing="medium" flex={true} style={{ justifyContent: 'flex-end' }}>
            <Popover content={<ContextMenu />} minimal>
              <Button icon="Options" minimal />
            </Popover>
          </Layout.Horizontal>

          <div className={cx(css.row, css.titleHolder)}>
            <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
              Template title
            </Text>
            <Button small className={css.openBtn}>
              Open template in Pipeline Studio
            </Button>
          </div>

          <div className={css.row}>
            <Text font={{ size: 'small' }} color={Color.GREY_500} className={css.smallTitle}>
              Description
            </Text>
            <Text color={Color.GREY_700}>
              Template description...Template description...Template description...Template description...Template
              description...Template description...Template description...
            </Text>
          </div>

          <div className={css.row}>
            <Text font={{ size: 'small' }} color={Color.GREY_500}>
              Tags
            </Text>
            <div className={css.tags}>
              {!isEmpty(template.tags) &&
                template.tags &&
                Object.keys(template.tags).map(key => {
                  const value = template?.tags?.[key]
                  return (
                    <Tag className={css.tag} key={key}>
                      {value ? `${key}:${value}` : key}
                    </Tag>
                  )
                })}
            </div>
          </div>

          <div className={css.row}>
            <Text font={{ size: 'small' }} color={Color.GREY_500}>
              Version
            </Text>
            <div className={css.tags}>
              <Select items={versionOptions} value={versionOptions[0]} />
            </div>
          </div>
        </div>
      </div>
      <div className={cx(css.tabsContainer)}>
        <Tabs id="template-details">
          <Tab id="template-input" title={getString('templatesLibrary.templateInputs')} panel={<TemplateInputs />} />
          <Tab id="template-yaml" title={getString('yaml')} panel={<div>YAML</div>} />
          <Tab
            id="template-referenced-by"
            title={
              <>
                {getString('templatesLibrary.referencedBy')} &nbsp; <Tag>5</Tag>
              </>
            }
            panel={<div>Referenced By</div>}
          />
          <Tab
            id="template-version-log"
            title={getString('templatesLibrary.versionLog')}
            panel={<div>Version Log</div>}
          />
        </Tabs>
      </div>
    </Drawer>
  )
}
