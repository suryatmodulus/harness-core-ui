import React from 'react'
import {
  Checkbox,
  Color,
  Icon,
  IconName,
  Layout,
  Popover,
  SelectOption,
  Tag,
  Text,
  TextInput
} from '@wings-software/uicore'
import { clone } from 'lodash-es'
import cx from 'classnames'
import { Button, Classes, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { InputSetSummaryResponse, useGetInputSetsListForPipeline } from 'services/pipeline-ng'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import css from './InputSetSelector.module.scss'

interface InputSetValue extends SelectOption {
  type: InputSetSummaryResponse['inputSetType']
}

export interface InputSetSelectorProps {
  value?: InputSetValue[]
  pipelineIdentifier: string
  onChange?: (value?: InputSetValue[]) => void
  width?: number
}

const getIconByType = (type: InputSetSummaryResponse['inputSetType']): IconName => {
  return type === 'OVERLAY_INPUT_SET' ? 'step-group' : 'yaml-builder-input-sets'
}

const RenderValue = React.memo(function RenderValue({
  value,
  onChange
}: {
  value: InputSetValue[]
  onChange?: (value?: InputSetValue[]) => void
}): JSX.Element {
  if (value.length > 1) {
    return (
      <>
        {value.map((item, index) => (
          <Tag minimal className={css.tag} key={index}>
            <Layout.Horizontal spacing="xsmall">
              <Icon
                name={getIconByType(item.type)}
                size={12}
                color={item.type === 'INPUT_SET' ? Color.BLACK : Color.BLUE_500}
              />
              <Text font={{ size: 'small' }}>{item.label}</Text>
            </Layout.Horizontal>
          </Tag>
        ))}
      </>
    )
  }
  return (
    <Layout.Horizontal flex={{ distribution: 'space-between' }} padding={{ right: 'small' }}>
      <Layout.Horizontal spacing="small">
        <Icon intent="primary" name={getIconByType(value[0]?.type)}></Icon>
        <Text>{value[0]?.label}</Text>
      </Layout.Horizontal>
      <div
        className={css.clearButton}
        onClick={event => {
          event.stopPropagation()
          onChange?.()
        }}
      >
        <Icon name="cross" />
      </div>
    </Layout.Horizontal>
  )
})

export const InputSetSelector: React.FC<InputSetSelectorProps> = ({
  width = 300,
  value,
  onChange,
  pipelineIdentifier
}): JSX.Element => {
  const [searchParam, setSearchParam] = React.useState('')
  const [multiple, setMultiple] = React.useState(false)
  const [selectedInputSets, setSelectedInputSets] = React.useState<InputSetValue[]>([])
  const { getString } = useStrings()
  React.useEffect(() => {
    if (value) {
      setSelectedInputSets(value)
      if (value.length > 1) {
        setMultiple(true)
      } else {
        setMultiple(false)
      }
    }
  }, [value])

  const { projectIdentifier, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { data: inputSetResponse, refetch, error } = useGetInputSetsListForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, pipelineIdentifier },
    debounce: 300,
    lazy: true
  })

  const { showError } = useToaster()

  const onSelectHandler = React.useCallback(
    (inputSet: InputSetSummaryResponse) => {
      onChange?.([{ label: inputSet.name || '', value: inputSet.identifier || '', type: inputSet.inputSetType }])
    },
    [onChange]
  )

  const onDragStart = React.useCallback((event: React.DragEvent<HTMLLIElement>, row: InputSetValue) => {
    event.dataTransfer.setData('data', JSON.stringify(row))
    event.currentTarget.classList.add(css.dragging)
  }, [])

  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])

  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>, droppedLocation: InputSetValue) => {
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      if (data) {
        try {
          const dropInputSet: InputSetValue = JSON.parse(data)
          const selected = clone(selectedInputSets)
          const droppedItem = selected.filter(item => item.value === dropInputSet.value)[0]
          if (droppedItem) {
            const droppedItemIndex = selected.indexOf(droppedItem)
            selected.splice(droppedItemIndex, 1)
            const droppedLocationIndex = selected.indexOf(droppedLocation)
            selected.splice(droppedLocationIndex, 0, droppedItem)
            setSelectedInputSets(selected)
          }
          // eslint-disable-next-line no-empty
        } catch {}
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    [selectedInputSets]
  )

  const onCheckBoxHandler = React.useCallback(
    (checked: boolean, label: string, val: string, type: InputSetSummaryResponse['inputSetType']) => {
      const selected = clone(selectedInputSets)
      const removedItem = selected.filter(set => set.value === val)[0]
      if (checked && !removedItem) {
        selected.push({ label, value: val, type })
      } else if (removedItem) {
        selected.splice(selected.indexOf(removedItem), 1)
      }
      setSelectedInputSets(selected)
    },
    [selectedInputSets]
  )

  if (error) {
    showError(error.message)
  }
  const inputSets = inputSetResponse?.data?.content

  const singleSelectList =
    inputSets &&
    inputSets
      .filter(set => (set.identifier || '').toLowerCase().indexOf(searchParam.toLowerCase()) > -1)
      .map(inputSet => (
        <li
          className={cx(Classes.POPOVER_DISMISS, css.item)}
          onClick={() => {
            onSelectHandler(inputSet)
          }}
          key={inputSet.identifier}
        >
          <Icon
            name={getIconByType(inputSet.inputSetType)}
            color={inputSet.inputSetType === 'INPUT_SET' ? Color.BLACK : Color.BLUE_500}
          />
          &nbsp;&nbsp;{inputSet.name}
        </li>
      ))

  const selectedMultipleList = selectedInputSets.map((selected, index) => (
    <li
      className={cx(css.item)}
      draggable={true}
      onDragStart={event => {
        onDragStart(event, selected)
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={event => onDrop(event, selected)}
      onClick={() => {
        onCheckBoxHandler(false, selected.label, selected.value as string, selected.type)
      }}
      key={`${index}-${selected.value as string}`}
    >
      <Layout.Horizontal flex={{ distribution: 'space-between' }}>
        <Checkbox
          className={css.checkbox}
          labelElement={
            <Text font={{ size: 'small' }} icon={getIconByType(selected.type)}>
              {selected.label}
            </Text>
          }
          checked={true}
          onChange={event => {
            onCheckBoxHandler(event.currentTarget.checked, selected.label, selected.value as string, selected.type)
          }}
        />
        <span className={css.order}>
          <Text className={css.orderText}>{index + 1}</Text>
          <Icon name="main-reorder" size={12} />
        </span>
      </Layout.Horizontal>
    </li>
  ))

  const multipleInputSetList =
    inputSets &&
    inputSets
      .filter(set => {
        let filter = true
        selectedInputSets.forEach(selectedSet => {
          if (selectedSet.value === set.identifier) {
            filter = false
          }
        })
        return filter
      })
      .filter(set => (set.identifier || '').toLowerCase().indexOf(searchParam.toLowerCase()) > -1)
      .map(inputSet => (
        <li
          className={cx(css.item)}
          key={inputSet.identifier}
          onClick={() => {
            onCheckBoxHandler(
              true,
              inputSet.name || '',
              inputSet.identifier || '',
              inputSet.inputSetType || 'INPUT_SET'
            )
          }}
        >
          <Layout.Horizontal flex={{ distribution: 'space-between' }}>
            <Checkbox
              className={css.checkbox}
              labelElement={
                <Text font={{ size: 'small' }} icon={getIconByType(inputSet.inputSetType)}>
                  {inputSet.name}
                </Text>
              }
              onChange={event => {
                onCheckBoxHandler(
                  event.currentTarget.checked,
                  inputSet.name || '',
                  inputSet.identifier || '',
                  inputSet.inputSetType || 'INPUT_SET'
                )
              }}
            />
          </Layout.Horizontal>
        </li>
      ))

  return (
    <Popover
      position={Position.BOTTOM}
      minimal={true}
      onOpening={() => {
        refetch()
      }}
      onClosing={() => {
        if (multiple) {
          if (selectedInputSets.length > 0) {
            onChange?.(selectedInputSets)
          } else {
            onChange?.()
          }
        }
      }}
    >
      <Button minimal className={css.container} style={{ width }} rightIcon="caret-down">
        {value ? (
          <RenderValue value={value} onChange={onChange} />
        ) : (
          <span className={css.placeholder}>{getString('inputSets.selectPlaceholder')}</span>
        )}
      </Button>
      <Layout.Vertical spacing="small" padding="medium" className={css.popoverContainer}>
        <Layout.Horizontal spacing="medium">
          <TextInput
            leftIcon="search"
            placeholder={getString('search')}
            className={css.search}
            value={searchParam}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchParam(e.target.value.trim())
            }}
          />
          <Checkbox
            label={getString('inputSets.selectMultipleInputSets')}
            checked={multiple}
            className={css.checkbox}
            onChange={checkbox => {
              setMultiple(checkbox.currentTarget.checked)
            }}
          />
        </Layout.Horizontal>
        {multiple && (
          <Layout.Horizontal
            spacing="small"
            background={Color.GREY_200}
            flex={{ align: 'center-center' }}
            padding="small"
          >
            <Icon name="info-sign" color={Color.PRIMARY_4}></Icon>
            <Text font={{ size: 'small' }}>{getString('inputSets.helpTextForMultiSelect')}</Text>
          </Layout.Horizontal>
        )}
        {!inputSets ? (
          <PageSpinner />
        ) : (
          <Layout.Vertical>
            {multiple && (
              <Layout.Horizontal padding="small" flex={{ distribution: 'space-between' }}>
                <Text color={Color.BLACK}>{getString('inputSets.inputSetLabel')}</Text>
                <Text color={Color.BLACK}>{getString('order')}</Text>
              </Layout.Horizontal>
            )}
            {inputSets && inputSets.length > 0 ? (
              <ul className={cx(Classes.MENU, css.list, { [css.multiple]: multiple })}>
                {!multiple ? (
                  singleSelectList
                ) : (
                  <>
                    {selectedMultipleList}
                    {multipleInputSetList}
                  </>
                )}
              </ul>
            ) : (
              <Layout.Horizontal
                spacing="small"
                background={Color.GREY_200}
                flex={{ align: 'center-center' }}
                padding="small"
                margin="small"
              >
                <Text>{getString('inputSets.noRecord')}</Text>
              </Layout.Horizontal>
            )}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
    </Popover>
  )
}
