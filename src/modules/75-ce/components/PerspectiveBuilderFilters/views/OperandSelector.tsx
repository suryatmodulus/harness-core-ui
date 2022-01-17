/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, Icon, TextInput, Color } from '@wings-software/uicore'
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
import { useStrings } from 'framework/strings'
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
  const { getString } = useStrings()
  const [searchText, setSearchText] = useState('')

  const filteredLabelData = (labelData || []).filter((label: string) =>
    label.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) < 0 ? false : true
  )

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
        <Container color={Color.WHITE} className={css.groupByLabel}>
          <Container
            padding={{
              top: 'small',
              left: 'small',
              right: 'small'
            }}
          >
            <TextInput
              value={searchText}
              onChange={(e: any) => {
                setSearchText(e.target.value)
              }}
              placeholder={getString('ce.perspectives.createPerspective.filters.searchText')}
            />
          </Container>
          <Container className={css.labelValueContainer}>
            {filteredLabelData.length
              ? filteredLabelData.map((label: string) => (
                  <CustomMenuItem
                    hidePopoverOnClick={true}
                    key={label}
                    text={label}
                    onClick={() => {
                      setProviderAndIdentifier(
                        { id: 'LABEL', name: 'label' },
                        { id: 'labels.value', name: label || '' }
                      )
                    }}
                  />
                ))
              : null}
          </Container>
        </Container>
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

export const OperandSelectorPopOverContent: React.FC<PopoverContentProps> = ({
  fieldValuesList,
  setProviderAndIdentifier,
  labelData
}) => {
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
        <OperandSelectorPopOverContent
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
