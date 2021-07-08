import React from 'react'
import { Container, Layout, Icon } from '@wings-software/uicore'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { QlceViewFieldIdentifierData, ViewFieldIdentifier } from 'services/ce/services'
import CustomMenuItem from '@ce/components/CustomMenu/CustomMenuItem'
import { FIELD_TO_ICON_MAPPING } from '@ce/components/PerspectiveFilters/constants'
import type { ProviderType } from '../PerspectiveBuilderFilter'

import css from '../PerspectiveBuilderFilter.module.scss'

interface PopoverContentProps {
  fieldValuesList: QlceViewFieldIdentifierData[]
  setProvider: React.Dispatch<React.SetStateAction<ProviderType | null | undefined>>
  setService: React.Dispatch<React.SetStateAction<ProviderType | null | undefined>>
  setProviderAndIdentifier: (providerData: ProviderType, serviceData: ProviderType) => void
}

const PopoverContent: React.FC<PopoverContentProps> = ({ fieldValuesList, setProviderAndIdentifier }) => {
  const nonCustomFields = fieldValuesList.filter(field => field.identifier !== ViewFieldIdentifier.Custom)

  const defaultPanelFields = (
    <Layout.Vertical>
      {nonCustomFields.map(field => {
        return (
          <Popover
            key={field.identifier}
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.RIGHT_TOP}
            modifiers={{
              flip: { boundariesElement: 'viewport', padding: 20 },
              offset: { offset: -5 },
              preventOverflow: { boundariesElement: 'viewport', padding: 20 }
            }}
            minimal={true}
            fill={true}
            usePortal={false}
            content={
              <Container>
                {field.values.map(service => {
                  return (
                    <CustomMenuItem
                      hidePopoverOnClick={true}
                      onClick={() => {
                        setProviderAndIdentifier(
                          {
                            id: field.identifier,
                            name: field.identifierName
                          },
                          { id: service?.fieldId || '', name: service?.fieldName || '' }
                        )
                      }}
                      key={service?.fieldId}
                      fontSize={'normal'}
                      text={service?.fieldName || ''}
                    />
                  )
                })}
              </Container>
            }
          >
            <CustomMenuItem
              text={field.identifierName}
              iconName={FIELD_TO_ICON_MAPPING[field.identifier]}
              fontSize={'normal'}
              rightIcon={'caret-right'}
            ></CustomMenuItem>
          </Popover>
        )
      })}
    </Layout.Vertical>
  )

  return (
    <Container>
      {defaultPanelFields}
      {/* <Tabs id={'horizontalTabs'} defaultSelectedTabId={'defaultFields'} className={css.tabsContainer}>
        <Tab
          className={css.tabClass}
          panelClassName={css.panelClass}
          id={'defaultFields'}
          title={'Default fields'}
          panel={defaultPanelFields}
        />
        <Tab
          className={css.tabClass}
          panelClassName={css.panelClass}
          id={'customField'}
          title={'Custom Field'}
          panel={<Container>Blah</Container>}
        />
      </Tabs> */}
    </Container>
  )
}

interface OperandSelectorProps {
  setProvider: React.Dispatch<React.SetStateAction<ProviderType | null | undefined>>
  fieldValuesList: QlceViewFieldIdentifierData[]
  provider: ProviderType | null | undefined
  service: ProviderType | null | undefined
  setService: React.Dispatch<React.SetStateAction<ProviderType | null | undefined>>
  setProviderAndIdentifier: (providerData: ProviderType, serviceData: ProviderType) => void
}

const OperandSelector: React.FC<OperandSelectorProps> = ({
  service,
  provider,
  fieldValuesList,
  setProvider,
  setService,
  setProviderAndIdentifier
}) => {
  return (
    <Popover
      className={css.operandContainer}
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_LEFT}
      modifiers={{
        arrow: { enabled: false },
        flip: { enabled: true },
        keepTogether: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      fill={true}
      usePortal={true}
      content={
        <PopoverContent
          fieldValuesList={fieldValuesList}
          setProvider={setProvider}
          setService={setService}
          setProviderAndIdentifier={setProviderAndIdentifier}
        />
      }
    >
      <div className={css.operandSelectorContainer}>
        {provider?.name && service?.name ? `${provider.name} > ${service.name}` : 'Choose Operand'}
        <Icon name="caret-down" />
      </div>
    </Popover>
  )
}

export default OperandSelector
