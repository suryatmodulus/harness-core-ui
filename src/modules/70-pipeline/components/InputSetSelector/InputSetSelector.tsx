import React, { Dispatch, SetStateAction, useState } from 'react'
import {
  Checkbox,
  Color,
  Icon,
  IconName,
  Layout,
  Popover,
  SelectOption,
  Button,
  Text,
  TextInput
} from '@wings-software/uicore'
import { clone, isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Classes, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { EntityGitDetails, InputSetSummaryResponse, useGetInputSetsListForPipeline } from 'services/pipeline-ng'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useToaster } from '@common/exports'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import css from './InputSetSelector.module.scss'

export interface InputSetValue extends SelectOption {
  type: InputSetSummaryResponse['inputSetType']
  gitDetails?: EntityGitDetails
}

export interface InputSetSelectorProps {
  value?: InputSetValue[]
  pipelineIdentifier: string
  onChange?: (value?: InputSetValue[]) => void
  width?: number
  selectedValueClass?: string
}

const getIconByType = (type: InputSetSummaryResponse['inputSetType']): IconName => {
  return type === 'OVERLAY_INPUT_SET' ? 'step-group' : 'yaml-builder-input-sets'
}

const RenderValue = React.memo(function RenderValue({
  value,
  onChange,
  setSelectedInputSets,
  setOpenInputSetsList,
  selectedValueClass
}: {
  value: InputSetValue[]
  onChange?: (value?: InputSetValue[]) => void
  setSelectedInputSets: Dispatch<SetStateAction<InputSetValue[]>>
  setOpenInputSetsList: Dispatch<SetStateAction<boolean>>
  selectedValueClass?: string
}): JSX.Element {
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
          const selected = clone(value)
          const droppedItem = selected.filter(item => item.value === dropInputSet.value)[0]
          if (droppedItem) {
            const droppedItemIndex = selected.indexOf(droppedItem)
            const droppedLocationIndex = selected.indexOf(droppedLocation)
            selected.splice(droppedItemIndex, 1)
            selected.splice(droppedLocationIndex, 0, droppedItem)
            onChange?.(selected)
          }
          // eslint-disable-next-line no-empty
        } catch {}
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    [value]
  )

  const { getString } = useStrings()
  return (
    <div className={cx(css.renderSelectedValue, selectedValueClass)}>
      {value?.map((item, index) => (
        <li
          key={item.label}
          className={css.selectedInputSetLi}
          draggable={true}
          onDragStart={event => {
            onDragStart(event, item)
          }}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={event => onDrop(event, item)}
        >
          <Button
            key={item.label}
            round={true}
            rightIcon="cross"
            iconProps={{
              onClick: event => {
                event.stopPropagation()
                const valuesAfterRemoval = value.filter(inputset => inputset.value !== item.value)
                setSelectedInputSets(valuesAfterRemoval)
                onChange?.(valuesAfterRemoval)
              },
              style: {
                cursor: 'pointer'
              }
            }}
            text={
              <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="small">
                <Button
                  round={true}
                  withoutBoxShadow={true}
                  font={{ weight: 'semi-bold' }}
                  width={20}
                  height={20}
                  className={css.selectedInputSetOrder}
                >
                  {index + 1}
                </Button>
                <Text
                  color={Color.PRIMARY_8}
                  icon={getIconByType(item.type)}
                  className={css.selectedInputSetLabel}
                  iconProps={{ className: css.selectedInputSetTypeIcon }}
                >
                  {item.label}
                </Text>
              </Layout.Horizontal>
            }
            margin={{ top: 'small', bottom: 'small', left: 0, right: 'small' }}
            className={css.selectedInputSetCard}
            color={Color.PRIMARY_7}
          />
        </li>
      ))}
      <Button
        icon="small-plus"
        className={css.addInputSetButton}
        onClick={() => setOpenInputSetsList(false)}
        color={Color.PRIMARY_7}
        minimal
        intent="primary"
      >
        {getString('pipeline.inputSets.selectPlaceholder')}
      </Button>
    </div>
  )
})

const InputSetGitDetails = ({ gitDetails }: { gitDetails: GitQueryParams }) => {
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  return (
    <Layout.Vertical margin={{ left: 'xsmall' }} spacing="small" className={css.inputSetGitDetails}>
      <Layout.Horizontal spacing="xsmall">
        <Icon name="repository" size={12}></Icon>
        <Text
          font={{ size: 'small', weight: 'light' }}
          color={Color.GREY_450}
          title={gitDetails?.repoIdentifier}
          lineClamp={1}
        >
          {(!loadingRepos && getRepoDetailsByIndentifier(gitDetails?.repoIdentifier, gitSyncRepos)?.name) || ''}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal spacing="xsmall">
        <Icon size={12} name="git-new-branch"></Icon>
        <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_450} title={gitDetails?.branch} lineClamp={1}>
          {gitDetails?.branch || ''}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const InputSetSelector: React.FC<InputSetSelectorProps> = ({
  value,
  onChange,
  pipelineIdentifier,
  selectedValueClass
}): JSX.Element => {
  const [searchParam, setSearchParam] = React.useState('')
  const [selectedInputSets, setSelectedInputSets] = React.useState<InputSetValue[]>(value || [])
  const { getString } = useStrings()

  const { projectIdentifier, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const {
    data: inputSetResponse,
    refetch,
    error
  } = useGetInputSetsListForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      ...(!isEmpty(repoIdentifier) && !isEmpty(branch)
        ? {
            repoIdentifier,
            branch,
            getDefaultFromOtherRepo: true
          }
        : {})
    },
    debounce: 300,
    lazy: true
  })

  const { showError } = useToaster()

  const onCheckBoxHandler = React.useCallback(
    (
      checked: boolean,
      label: string,
      val: string,
      type: InputSetSummaryResponse['inputSetType'],
      gitDetails: EntityGitDetails | null
    ) => {
      const selected = clone(selectedInputSets)
      const removedItem = selected.filter(set => set.value === val)[0]
      if (checked && !removedItem) {
        selected.push({ label, value: val, type, gitDetails: gitDetails ?? {} })
      } else if (removedItem) {
        selected.splice(selected.indexOf(removedItem), 1)
      }
      setSelectedInputSets(selected)
    },
    [selectedInputSets]
  )

  if (error) {
    showError(error.message, undefined, 'pipeline.get.inputsetlist')
  }

  const inputSets = inputSetResponse?.data?.content

  const onDragStartPreSelect = React.useCallback((event: React.DragEvent<HTMLLIElement>, row: InputSetValue) => {
    event.dataTransfer.setData('data', JSON.stringify(row))
    event.currentTarget.classList.add(css.dragging)
  }, [])

  const onDragEndPreSelect = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])

  const onDragLeavePreSelect = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOverPreSelect = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDropPreSelect = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>, droppedLocation: InputSetValue) => {
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      if (data) {
        try {
          const dropInputSet: InputSetValue = JSON.parse(data)
          const clonedSelectedInputSets = clone(selectedInputSets)
          const droppedItem = clonedSelectedInputSets.filter(item => item.value === dropInputSet.value)[0]
          if (droppedItem) {
            const droppedItemIndex = clonedSelectedInputSets.indexOf(droppedItem)
            const droppedLocationIndex = clonedSelectedInputSets.indexOf(droppedLocation)
            clonedSelectedInputSets.splice(droppedItemIndex, 1)
            clonedSelectedInputSets.splice(droppedLocationIndex, 0, droppedItem)
            setSelectedInputSets(clonedSelectedInputSets)
          }
          // eslint-disable-next-line no-empty
        } catch {}
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    [selectedInputSets]
  )

  const selectedMultipleList = selectedInputSets.map((selected, index) => (
    <li
      className={cx(css.item)}
      onClick={() => {
        onCheckBoxHandler(false, selected.label, selected.value as string, selected.type, selected.gitDetails ?? {})
      }}
      key={`${index}-${selected.value as string}`}
      draggable={true}
      onDragStart={event => {
        onDragStartPreSelect(event, selected)
      }}
      onDragEnd={onDragEndPreSelect}
      onDragOver={onDragOverPreSelect}
      onDragLeave={onDragLeavePreSelect}
      onDrop={event => onDropPreSelect(event, selected)}
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
            onCheckBoxHandler(
              event.currentTarget.checked,
              selected.label,
              selected.value as string,
              selected.type,
              selected.gitDetails ?? null
            )
          }}
        />
        {selected.gitDetails?.repoIdentifier ? <InputSetGitDetails gitDetails={selected.gitDetails} /> : null}
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
              inputSet.inputSetType || 'INPUT_SET',
              inputSet.gitDetails ?? null
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
                  inputSet.inputSetType || 'INPUT_SET',
                  inputSet.gitDetails ?? null
                )
              }}
            />
            {inputSet.gitDetails?.repoIdentifier ? <InputSetGitDetails gitDetails={inputSet.gitDetails} /> : null}
          </Layout.Horizontal>
        </li>
      ))

  const [openInputSetsList, setOpenInputSetsList] = useState(false)
  return (
    <Popover
      position={Position.BOTTOM}
      usePortal={false}
      minimal={true}
      className={css.isPopoverParent}
      onOpening={() => {
        refetch()
      }}
      onClosing={() => {
        onChange?.(selectedInputSets)
      }}
    >
      <RenderValue
        value={value || []}
        onChange={onChange}
        setSelectedInputSets={setSelectedInputSets}
        setOpenInputSetsList={setOpenInputSetsList}
        selectedValueClass={selectedValueClass}
      />
      {openInputSetsList ? null : (
        <Layout.Vertical spacing="small" className={css.popoverContainer}>
          <div className={!inputSets ? css.loadingSearchContainer : css.searchContainer}>
            <TextInput
              placeholder={getString('search')}
              rightElement="chevron-down"
              className={css.search}
              value={searchParam}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchParam(e.target.value.trim())
              }}
            />
          </div>
          {!inputSets ? (
            <PageSpinner className={css.spinner} />
          ) : (
            <Layout.Vertical padding="small">
              {inputSets && inputSets.length > 0 ? (
                <>
                  <ul className={cx(Classes.MENU, css.list, { [css.multiple]: inputSets.length > 0 })}>
                    <>
                      {selectedMultipleList}
                      {multipleInputSetList}
                    </>
                  </ul>
                  <Button
                    text={
                      selectedInputSets?.length > 1
                        ? getString('pipeline.inputSets.applyInputSets')
                        : getString('pipeline.inputSets.applyInputSet')
                    }
                    intent="primary"
                    disabled={!selectedInputSets?.length}
                    onClick={() => {
                      setOpenInputSetsList(true)
                      onChange?.(selectedInputSets)
                    }}
                  />
                </>
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
      )}
    </Popover>
  )
}
