import React from 'react'
import { Container, Layout, Icon } from '@wings-software/uicore'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import {
  QlceViewFieldIdentifierData,
  ViewFieldIdentifier,
  useFetchPerspectiveFiltersValueQuery,
  QlceViewFilterWrapperInput,
  QlceViewField
} from 'services/ce/services'
import CustomMenuItem from '@ce/components/CustomMenu/CustomMenuItem'
import { FIELD_TO_ICON_MAPPING } from '@ce/components/PerspectiveFilters/constants'
import type { ProviderType } from '../PerspectiveBuilderFilter'

import css from '../PerspectiveBuilderFilter.module.scss'

interface LabelSelectorProps {
  service: QlceViewField
  labelData: any
  setProviderAndIdentifier: (providerData: ProviderType, serviceData: ProviderType) => void
}

const LabelSelector: (props: LabelSelectorProps) => JSX.Element = ({
  service,
  labelData,
  setProviderAndIdentifier
}) => {
  return (
    <Popover
      key={service.fieldId}
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.RIGHT_TOP}
      modifiers={{
        flip: { boundariesElement: 'viewport', padding: 20 },
        offset: { offset: -5 },
        preventOverflow: { boundariesElement: 'viewport', padding: 20 }
      }}
      hoverCloseDelay={0}
      minimal={true}
      fill={true}
      usePortal={false}
      content={
        <div className={css.groupByLabel}>
          {labelData.length &&
            labelData.map((label: string) => (
              <CustomMenuItem
                hidePopoverOnClick={true}
                key={label}
                text={label}
                onClick={() => {
                  setProviderAndIdentifier({ id: 'LABEL', name: 'label' }, { id: 'labels.value', name: label || '' })
                }}
              />
            ))}
        </div>
      }
    >
      <CustomMenuItem
        key={service?.fieldId}
        fontSize={'normal'}
        text={service?.fieldName || ''}
        rightIcon={'chevron-right'}
      />
    </Popover>
  )
}

interface PopoverContentProps {
  fieldValuesList: QlceViewFieldIdentifierData[]
  setProviderAndIdentifier: (providerData: ProviderType, serviceData: ProviderType) => void
  labelData: any
  labelFetching: boolean
}

const PopoverContent: React.FC<PopoverContentProps> = ({ fieldValuesList, setProviderAndIdentifier, labelData }) => {
  const nonCustomFields = fieldValuesList.filter(field => field.identifier !== ViewFieldIdentifier.Custom)

  const defaultPanelFields = (
    <Layout.Vertical>
      {nonCustomFields.map(field => {
        return (
          <Popover
            key={field.identifier}
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.RIGHT_TOP}
            hoverCloseDelay={0}
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
                  if (service?.fieldId === 'label') {
                    return (
                      <LabelSelector
                        service={service}
                        labelData={labelData}
                        setProviderAndIdentifier={setProviderAndIdentifier}
                      />
                    )
                  }
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
              rightIcon={'chevron-right'}
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
  fieldValuesList: QlceViewFieldIdentifierData[]
  provider: ProviderType | null | undefined
  service: ProviderType | null | undefined
  setProviderAndIdentifier: (providerData: ProviderType, serviceData: ProviderType) => void
}

const OperandSelector: React.FC<OperandSelectorProps> = ({
  service,
  provider,
  fieldValuesList,
  setProviderAndIdentifier
}) => {
  const [labelResult] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        {
          idFilter: {
            field: {
              fieldId: 'labels.key',
              fieldName: '',
              identifier: 'LABEL'
            },
            operator: 'IN',
            values: []
          }
        } as unknown as QlceViewFilterWrapperInput
      ],
      offset: 0,
      limit: 1000
    }
  })

  const { data: labelResData, fetching: labelFetching } = labelResult

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
      hoverCloseDelay={0}
      fill={true}
      usePortal={true}
      content={
        <PopoverContent
          labelData={labelResData?.perspectiveFilters?.values || []}
          labelFetching={labelFetching}
          fieldValuesList={fieldValuesList}
          setProviderAndIdentifier={setProviderAndIdentifier}
        />
      }
    >
      <div className={css.operandSelectorContainer}>
        {provider?.id && service?.id ? `${provider.name || provider.id} > ${service.name}` : 'Choose Operand'}
        <Icon name="caret-down" />
      </div>
    </Popover>
  )
}

export default OperandSelector
