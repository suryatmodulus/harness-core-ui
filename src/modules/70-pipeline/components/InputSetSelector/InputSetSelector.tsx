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
  TextInput,
  ButtonVariation,
  PageSpinner,
  Container
} from '@wings-software/uicore'
import { clone, defaultTo, isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Classes, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import {
  EntityGitDetails,
  InputSetErrorWrapper,
  InputSetSummaryResponse,
  useGetInputSetsListForPipeline
} from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { Badge } from '@pipeline/pages/utils/Badge/Badge'
import { isInputSetInvalid } from '@pipeline/utils/inputSetUtils'
import css from './InputSetSelector.module.scss'

type InputSetLocal = InputSetSummaryResponse & SelectOption

export interface InputSetValue extends InputSetLocal {
  type: InputSetSummaryResponse['inputSetType']
  gitDetails?: EntityGitDetails
}

export interface InputSetSelectorProps {
  value?: InputSetValue[]
  pipelineIdentifier: string
  onChange?: (value?: InputSetValue[]) => void
  width?: number
  selectedValueClass?: string
  selectedRepo?: string
  selectedBranch?: string
  isOverlayInputSet?: boolean
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
          data-testid={item.value}
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
            data-testid={`button-${item.label}`}
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
        onClick={() => setOpenInputSetsList(true)}
        color={Color.PRIMARY_7}
        minimal
        variation={ButtonVariation.LINK}
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
  selectedValueClass,
  selectedRepo,
  selectedBranch,
  isOverlayInputSet
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

  const getGitQueryParams = React.useCallback(() => {
    if (!isEmpty(selectedRepo) && !isEmpty(selectedBranch)) {
      return {
        repoIdentifier: selectedRepo,
        branch: selectedBranch
      }
    }
    if (!isEmpty(repoIdentifier) && !isEmpty(branch)) {
      return {
        repoIdentifier,
        branch,
        getDefaultFromOtherRepo: true
      }
    }
    return {}
  }, [repoIdentifier, branch, selectedRepo, selectedBranch])

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
      inputSetType: isOverlayInputSet ? 'INPUT_SET' : undefined,
      ...getGitQueryParams()
    },
    debounce: 300,
    lazy: true
  })

  React.useEffect(() => {
    refetch()
  }, [repoIdentifier, branch, selectedRepo, selectedBranch, refetch])

  const { showError } = useToaster()

  const onCheckBoxHandler = React.useCallback(
    (
      checked: boolean,
      label: string,
      val: string,
      type: InputSetSummaryResponse['inputSetType'],
      inputSetGitDetails: EntityGitDetails | null,
      inputSetErrorDetails?: InputSetErrorWrapper,
      overlaySetErrorDetails?: { [key: string]: string }
    ) => {
      const selected = clone(selectedInputSets)
      const removedItem = selected.filter(set => set.value === val)[0]
      if (checked && !removedItem) {
        selected.push({
          label,
          value: val,
          type,
          gitDetails: defaultTo(inputSetGitDetails, {}),
          inputSetErrorDetails,
          overlaySetErrorDetails
        })
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
        onCheckBoxHandler(
          false,
          selected.label,
          selected.value as string,
          selected.type,
          defaultTo(selected.gitDetails, {}),
          selected.inputSetErrorDetails,
          selected.overlaySetErrorDetails
        )
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
            <Layout.Horizontal flex={{ alignItems: 'center' }} padding={{ left: true }}>
              <Icon name={getIconByType(selected.type)}></Icon>
              <Container margin={{ left: true }} className={css.nameIdContainer}>
                <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.GREY_800}>
                  {selected.label}
                </Text>
                <Text font="small" lineClamp={1} margin={{ top: 'xsmall' }} color={Color.GREY_450}>
                  {getString('idLabel', { id: selected.value })}
                </Text>
              </Container>
            </Layout.Horizontal>
          }
          checked={true}
        />
        {selected.gitDetails?.repoIdentifier ? <InputSetGitDetails gitDetails={selected.gitDetails} /> : null}
        {isInputSetInvalid(selected) && (
          <Container padding={{ left: 'large' }}>
            <Badge
              text={'common.invalid'}
              iconName="error-outline"
              showTooltip={true}
              entityName={selected.name}
              entityType={selected.inputSetType === 'INPUT_SET' ? 'Input Set' : 'Overlay Input Set'}
              uuidToErrorResponseMap={selected.inputSetErrorDetails?.uuidToErrorResponseMap}
              overlaySetErrorDetails={selected.overlaySetErrorDetails}
            />
          </Container>
        )}
      </Layout.Horizontal>
      <span className={css.order}>
        <Text className={css.orderText}>{index + 1}</Text>
        <Icon name="drag-handle-vertical" className={css.drag} size={16} />
      </span>
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
      .filter(set => defaultTo(set.identifier, '').toLowerCase().indexOf(searchParam.toLowerCase()) > -1)
      .map(inputSet => (
        <li
          className={cx(css.item)}
          key={inputSet.identifier}
          onClick={() => {
            if (isInputSetInvalid(inputSet)) {
              return
            }
            onCheckBoxHandler(
              true,
              defaultTo(inputSet.name, ''),
              defaultTo(inputSet.identifier, ''),
              defaultTo(inputSet.inputSetType, 'INPUT_SET'),
              defaultTo(inputSet.gitDetails, null),
              inputSet.inputSetErrorDetails,
              inputSet.overlaySetErrorDetails
            )
          }}
        >
          <Layout.Horizontal flex={{ distribution: 'space-between' }}>
            <Layout.Horizontal flex={{ alignItems: 'center' }}>
              <Checkbox
                className={css.checkbox}
                disabled={isInputSetInvalid(inputSet)}
                labelElement={
                  <Layout.Horizontal flex={{ alignItems: 'center' }} padding={{ left: true }}>
                    <Icon name={getIconByType(inputSet.inputSetType)}></Icon>
                    <Container margin={{ left: true }} className={css.nameIdContainer}>
                      <Text
                        data-testid={`popover-${inputSet.name}`}
                        lineClamp={1}
                        font={{ weight: 'bold' }}
                        color={Color.GREY_800}
                      >
                        {inputSet.name}
                      </Text>
                      <Text font="small" lineClamp={1} margin={{ top: 'xsmall' }} color={Color.GREY_450}>
                        {getString('idLabel', { id: inputSet.identifier })}
                      </Text>
                    </Container>
                  </Layout.Horizontal>
                }
              />
              {isInputSetInvalid(inputSet) && (
                <Container padding={{ left: 'large' }}>
                  <Badge
                    text={'common.invalid'}
                    iconName="error-outline"
                    showTooltip={true}
                    entityName={inputSet.name}
                    entityType={inputSet.inputSetType === 'INPUT_SET' ? 'Input Set' : 'Overlay Input Set'}
                    uuidToErrorResponseMap={inputSet.inputSetErrorDetails?.uuidToErrorResponseMap}
                    overlaySetErrorDetails={inputSet.overlaySetErrorDetails}
                  />
                </Container>
              )}
            </Layout.Horizontal>
            {inputSet.gitDetails?.repoIdentifier ? <InputSetGitDetails gitDetails={inputSet.gitDetails} /> : null}
          </Layout.Horizontal>
        </li>
      ))

  const [openInputSetsList, setOpenInputSetsList] = useState(false)

  return (
    <Popover
      position={Position.BOTTOM}
      usePortal={false}
      isOpen={openInputSetsList}
      minimal={true}
      className={css.isPopoverParent}
      onOpening={() => {
        refetch()
        setOpenInputSetsList(true)
      }}
      onInteraction={interaction => {
        if (!interaction) {
          setOpenInputSetsList(false)
        }
      }}
      onClosing={() => {
        setOpenInputSetsList(false)
        onChange?.(selectedInputSets)
      }}
    >
      <RenderValue
        value={defaultTo(value, [])}
        onChange={onChange}
        setSelectedInputSets={setSelectedInputSets}
        setOpenInputSetsList={setOpenInputSetsList}
        selectedValueClass={selectedValueClass}
      />
      {openInputSetsList ? (
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
          <Container className={css.overlayIsHelperTextContainer} border={{ bottom: true }}>
            <Text className={css.overlayIsHelperText}>{getString('pipeline.inputSets.overlayISHelperText')}</Text>
          </Container>
          {!inputSets ? (
            <PageSpinner className={css.spinner} />
          ) : (
            <Layout.Vertical padding={{ bottom: 'medium' }}>
              {inputSets && inputSets.length > 0 ? (
                <>
                  <ul className={cx(Classes.MENU, css.list, { [css.multiple]: inputSets.length > 0 })}>
                    <>
                      {selectedMultipleList}
                      {multipleInputSetList}
                    </>
                  </ul>
                  <Button
                    margin="small"
                    text={
                      selectedInputSets?.length > 1
                        ? getString('pipeline.inputSets.applyInputSets')
                        : getString('pipeline.inputSets.applyInputSet')
                    }
                    variation={ButtonVariation.PRIMARY}
                    disabled={!selectedInputSets?.length}
                    onClick={() => {
                      setOpenInputSetsList(false)
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
      ) : null}
    </Popover>
  )
}
