import React, { useState } from 'react'
import { TextInput } from '@wings-software/uicore'
import { Popover, Position, PopoverInteractionKind, Classes, MenuItem } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import {
  ViewFieldIdentifier,
  QlceViewFieldInputInput,
  Maybe,
  QlceViewFieldIdentifierData,
  QlceViewField
} from 'services/ce/services'
import css from './GroupByView.module.scss'

interface BaseGroupByProps {
  groupBy: QlceViewFieldInputInput
  setGroupBy: React.Dispatch<React.SetStateAction<QlceViewFieldInputInput>>
}

interface GroupByDropDownProps {
  data: QlceViewFieldIdentifierData
  setGroupBy: React.Dispatch<React.SetStateAction<QlceViewFieldInputInput>>
}

export const GroupByDropDown: React.FC<GroupByDropDownProps> = ({ data, setGroupBy }) => {
  const values = data.values.filter(val => val) as QlceViewField[]

  return (
    <ul className={css.groupByList}>
      {values.map((value, index) => {
        const onClick: () => void = () => {
          setGroupBy({
            identifier: data.identifier,
            identifierName: data.identifierName,
            fieldId: value.fieldId,
            fieldName: value.fieldName
          })
        }
        return (
          <li key={`fieldName-${index}`} className={cx(css.groupByListItems, Classes.POPOVER_DISMISS)}>
            <MenuItem text={value.fieldName} onClick={onClick} />
          </li>
        )
      })}
    </ul>
  )
}

interface GroupByViewProps extends BaseGroupByProps {
  field: QlceViewFieldIdentifierData
}

export const GroupByView: React.FC<GroupByViewProps> = ({ field, setGroupBy, groupBy }) => {
  return (
    <Popover
      key={`identifierName-${field.identifierName}`}
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_LEFT}
      modifiers={{
        arrow: { enabled: false },
        flip: { enabled: true },
        keepTogether: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      usePortal={false}
      content={<GroupByDropDown setGroupBy={setGroupBy} data={field} />}
    >
      {groupBy.identifier === field.identifier ? (
        <div className={cx(css.groupByItems, css.activeItem)}>{`${field.identifierName}: ${groupBy.fieldName}`}</div>
      ) : (
        <div className={css.groupByItems}>{field.identifierName}</div>
      )}
    </Popover>
  )
}

interface LabelDropDownProps {
  setGroupBy: React.Dispatch<React.SetStateAction<QlceViewFieldInputInput>>
  data: Maybe<string>[]
}

export const LabelDropDown: React.FC<LabelDropDownProps> = ({ data, setGroupBy }) => {
  const values = data.filter(val => val) as string[]
  const [searchText, setSearchText] = useState('')

  const filteredResults = values.filter(val => val.includes(searchText))
  return (
    <section className={css.labelDropDownContainer}>
      <TextInput
        className={css.search}
        autoFocus
        placeholder="Search Value"
        onChange={e => {
          const event = e as any
          const value = event.target.value
          setSearchText(value)
        }}
      />
      <ul className={css.groupByList}>
        {filteredResults.map(value => {
          const onClick: () => void = () => {
            setGroupBy({
              identifier: ViewFieldIdentifier.Label,
              identifierName: 'Label',
              fieldId: 'labels.value',
              fieldName: value
            })
          }
          return (
            <li key={`fieldName-${value}`} className={cx(css.groupByListItems, Classes.POPOVER_DISMISS)}>
              <MenuItem text={value} onClick={onClick} />
            </li>
          )
        })}
      </ul>
      {!filteredResults.length ? <div className={css.noResults}>No results found</div> : null}
    </section>
  )
}

interface LabelViewProps extends BaseGroupByProps {
  labelData: Maybe<string>[]
}

export const LabelView: React.FC<LabelViewProps> = ({ setGroupBy, labelData, groupBy }) => {
  return (
    <Popover
      key={`identifier-name-label`}
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_LEFT}
      modifiers={{
        arrow: { enabled: false },
        flip: { enabled: true },
        keepTogether: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      usePortal={false}
      content={<LabelDropDown setGroupBy={setGroupBy} data={labelData} />}
    >
      {groupBy.identifier === 'LABEL' ? (
        <div className={cx(css.groupByItems, css.activeItem)}>{`Label: ${groupBy.fieldName}`}</div>
      ) : (
        <div className={css.groupByItems}>Label</div>
      )}
    </Popover>
  )
}

interface CommonGroupByViewProps extends BaseGroupByProps {
  value: QlceViewField
}

const CommonGroupByView: React.FC<CommonGroupByViewProps> = ({ groupBy, setGroupBy, value }) => {
  return groupBy.identifier === ViewFieldIdentifier.Common && groupBy.fieldId === value.fieldId ? (
    <div className={cx(css.groupByItems, css.activeItem)}>{value.fieldName}</div>
  ) : (
    <div
      className={css.groupByItems}
      key={`common-${value.fieldId}`}
      onClick={() => {
        setGroupBy({
          identifier: ViewFieldIdentifier.Common,
          identifierName: 'Common',
          fieldId: value.fieldId,
          fieldName: value.fieldName
        })
      }}
    >
      {value.fieldName}
    </div>
  )
}

interface GroupByComponentProps extends BaseGroupByProps {
  labelData: Maybe<string>[]
  fieldIdentifierData: Maybe<QlceViewFieldIdentifierData>[]
}

const GroupByComponent: React.FC<GroupByComponentProps> = ({ labelData, fieldIdentifierData, groupBy, setGroupBy }) => {
  const { getString } = useStrings()
  const commonFields = fieldIdentifierData?.filter(
    field => field && field.identifier === ViewFieldIdentifier.Common
  ) as QlceViewFieldIdentifierData[]
  const otherFields = fieldIdentifierData?.filter(
    field => field && field.identifier !== ViewFieldIdentifier.Common
  ) as QlceViewFieldIdentifierData[]

  return (
    <section className={css.groupByContainer}>
      <label className={css.groupByLabel}> {getString('ce.perspectives.createPerspective.preview.groupBy')}</label>
      <div className={css.groupBys}>
        {otherFields.map(field => {
          return field.values.length ? <GroupByView field={field} setGroupBy={setGroupBy} groupBy={groupBy} /> : null
        })}
        {commonFields.length
          ? commonFields[0].values.map(value => {
              if (value) {
                if (value.fieldId === 'label') {
                  return <LabelView setGroupBy={setGroupBy} labelData={labelData} groupBy={groupBy} />
                } else {
                  return <CommonGroupByView groupBy={groupBy} setGroupBy={setGroupBy} value={value} />
                }
              }
            })
          : null}
      </div>
    </section>
  )
}

export default GroupByComponent
