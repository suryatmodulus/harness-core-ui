import React, { useState, useEffect, useCallback, useRef } from 'react'
import cx from 'classnames'
import {
  Container,
  TextInput,
  Button,
  Layout,
  Text,
  Tabs,
  Tab,
  Icon,
  IconName,
  Color,
  Checkbox
} from '@wings-software/uicore'
import { debounce, isEmpty, isEqual } from 'lodash-es'
import { PageError } from '@common/components/Page/PageError'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import css from './EntityReference.module.scss'

export interface ScopedObjectDTO {
  accountIdentifier?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export function getScopeFromDTO<T extends ScopedObjectDTO>(obj: T): Scope {
  if (obj.projectIdentifier) {
    return Scope.PROJECT
  } else if (obj.orgIdentifier) {
    return Scope.ORG
  }
  return Scope.ACCOUNT
}

export function getScopeFromValue(value: string): Scope {
  if (typeof value === 'string' && value.startsWith(`${Scope.ACCOUNT}.`)) {
    return Scope.ACCOUNT
  } else if (typeof value === 'string' && value.startsWith(`${Scope.ORG}.`)) {
    return Scope.ORG
  }
  return Scope.PROJECT
}

export function getIdentifierFromValue(value: string): string {
  const scope = getScopeFromValue(value)
  if ((typeof value === 'string' && scope === Scope.ACCOUNT) || scope === Scope.ORG) {
    return value.replace(`${scope}.`, '')
  }
  return value
}

export type EntityReferenceResponse<T> = {
  name: string
  identifier: string
  record: T
}

export interface EntityReferenceProps<T> {
  onSelect: (reference: T, scope: Scope) => void
  fetchRecords: (
    scope: Scope,
    searchTerm: string | undefined,
    done: (records: EntityReferenceResponse<T>[]) => void
  ) => void
  recordRender: (args: { item: EntityReferenceResponse<T>; selectedScope: Scope; selected?: boolean }) => JSX.Element
  recordClassName?: string
  className?: string
  projectIdentifier?: string
  noRecordsText?: string
  orgIdentifier?: string
  defaultScope?: Scope
  searchInlineComponent?: JSX.Element
  allowMultiSelect?: boolean
  selectedItemsIdentifiers?: string[]
  onMultiSelect?: (reference: T[], scope: Scope) => void
}

function getDefaultScope(orgIdentifier?: string, projectIdentifier?: string): Scope {
  if (!isEmpty(projectIdentifier)) {
    return Scope.PROJECT
  } else if (!isEmpty(orgIdentifier)) {
    return Scope.ORG
  }
  return Scope.ACCOUNT
}

export function EntityReference<T>(props: EntityReferenceProps<T>): JSX.Element {
  const { getString } = useStrings()
  const {
    defaultScope,
    projectIdentifier,
    orgIdentifier,
    fetchRecords,
    className = '',
    recordRender,
    recordClassName = '',
    noRecordsText = getString('entityReference.noRecordFound'),
    searchInlineComponent,
    allowMultiSelect = false,
    selectedItemsIdentifiers,
    onMultiSelect
  } = props
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [selectedScope, setSelectedScope] = useState<Scope>(
    defaultScope || getDefaultScope(orgIdentifier, projectIdentifier)
  )
  const [data, setData] = useState<EntityReferenceResponse<T>[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>()
  const [selectedRecord, setSelectedRecord] = useState<T>()
  const [renderedList, setRenderedList] = useState<JSX.Element>()

  const [checkedItems, setCheckedItems] = useState<T[]>()

  useEffect(() => {
    if (selectedItemsIdentifiers && data) {
      const items = selectedItemsIdentifiers.map(uuid => {
        const item = data.find(el => el.identifier === uuid)?.record
        if (item) {
          return item
        }
      })
      setCheckedItems(items as T[])
    }
  }, [selectedItemsIdentifiers, data])

  const delayedFetchRecords = useRef(
    debounce((scope: Scope, search: string | undefined, done: (records: EntityReferenceResponse<T>[]) => void) => {
      setLoading(true)
      setSelectedRecord(undefined)
      fetchRecords(scope, search, done)
    }, 300)
  ).current

  const fetchData = useCallback(() => {
    try {
      setError(null)
      if (!searchTerm) {
        setLoading(true)
        fetchRecords(selectedScope, searchTerm, records => {
          setData(records)
          setLoading(false)
        })
      } else {
        delayedFetchRecords(selectedScope, searchTerm, records => {
          setData(records)
          setLoading(false)
        })
      }
    } catch (msg) {
      setError(msg)
    }
  }, [selectedScope, delayedFetchRecords, searchTerm, searchInlineComponent])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onScopeChange = (scope: Scope): void => {
    setSelectedRecord(undefined)
    setSelectedScope(scope)
  }

  const iconProps = {
    size: 16
  }

  const enum TAB_ID {
    PROJECT = 'project',
    ORGANIZATION = 'organization',
    ACCOUNT = 'account'
  }

  const defaultTab =
    selectedScope === Scope.ORG
      ? TAB_ID.ORGANIZATION
      : selectedScope === Scope.PROJECT
      ? TAB_ID.PROJECT
      : TAB_ID.ACCOUNT

  const onCheckboxChange = (checked: boolean, item: T) => {
    const tempCheckedItems: T[] = [...((checkedItems as T[]) || [])]
    if (checked) {
      tempCheckedItems.push(item)
    } else {
      tempCheckedItems.splice(
        tempCheckedItems.findIndex(el => isEqual(el, item)),
        1
      )
    }
    setCheckedItems(tempCheckedItems.length ? tempCheckedItems : undefined)
  }

  useEffect(() => {
    let renderedListTemp
    if (loading) {
      renderedListTemp = (
        <Container flex={{ align: 'center-center' }} padding="small">
          <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
        </Container>
      )
    }
    if (!loading && error) {
      renderedListTemp = (
        <Container>
          <PageError message={error} onClick={fetchData} />
        </Container>
      )
    }
    if (!loading && !error && data.length) {
      if (!allowMultiSelect) {
        renderedListTemp = (
          <div className={cx(css.referenceList, { [css.referenceListOverflow]: data.length > 5 })}>
            {data.map((item: EntityReferenceResponse<T>) => (
              <div
                key={item.identifier}
                className={cx(css.listItem, recordClassName, {
                  [css.selectedItem]: selectedRecord === item.record
                })}
                onClick={() => setSelectedRecord(selectedRecord === item.record ? undefined : item.record)}
              >
                {recordRender({ item, selectedScope, selected: selectedRecord === item.record })}
              </div>
            ))}
          </div>
        )
      } else {
        renderedListTemp = (
          <div className={cx(css.referenceList, { [css.referenceListOverflow]: data.length > 5 })}>
            {data.map((item: EntityReferenceResponse<T>) => {
              const checked = !!checkedItems?.find(el => isEqual(el, item.record))
              return (
                <Layout.Horizontal
                  key={item.identifier}
                  className={cx(css.listItem, recordClassName, {
                    [css.selectedItem]: checked
                  })}
                  flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                >
                  <Checkbox
                    onChange={e => onCheckboxChange((e.target as any).checked, item.record)}
                    className={css.checkbox}
                    checked={checked}
                    large
                  />
                  {recordRender({ item, selectedScope, selected: checked })}
                </Layout.Horizontal>
              )
            })}
          </div>
        )
      }
    }
    if (!loading && !error && !data.length) {
      renderedListTemp = (
        <Container padding={{ top: 'xlarge' }} flex={{ align: 'center-center' }}>
          <Text>{noRecordsText}</Text>
        </Container>
      )
    }
    setRenderedList(renderedListTemp)
  }, [selectedScope, loading, error, data, checkedItems, selectedRecord])

  // TODO: add optional tabRenderer prop to EntityRef and render this
  const renderTab = (
    show: boolean,
    id: string,
    scope: Scope,
    icon: IconName,
    title: StringKeys
  ): React.ReactElement | null => {
    const multiSelectCount =
      allowMultiSelect && checkedItems?.length ? (
        <Text
          inline
          height={19}
          margin={{ left: 'small' }}
          padding={{ left: 'xsmall', right: 'xsmall' }}
          flex={{ align: 'center-center' }}
          background={Color.BLUE_600}
          color={Color.WHITE}
          border={{ radius: 100 }}
        >
          {checkedItems.length}
        </Text>
      ) : null
    return show ? (
      <Tab
        id={id}
        title={
          <Layout.Horizontal onClick={() => onScopeChange(scope)} padding={'medium'} flex={{ alignItems: 'center' }}>
            <Text>
              <Icon name={icon} {...iconProps} className={css.iconMargin} />
              {getString(title)}
            </Text>
            {multiSelectCount}
          </Layout.Horizontal>
        }
        panel={renderedList}
      />
    ) : null
  }

  const onSelect = allowMultiSelect
    ? () => onMultiSelect?.(checkedItems as T[], selectedScope)
    : () => props.onSelect(selectedRecord as T, selectedScope)

  const disabled = allowMultiSelect ? !checkedItems : !selectedRecord

  return (
    <Container className={cx(css.container, className)}>
      <Layout.Vertical spacing="medium">
        <div className={css.searchBox}>
          <TextInput
            wrapperClassName={css.search}
            placeholder={getString('search')}
            leftIcon="search"
            value={searchTerm}
            autoFocus
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          {searchInlineComponent}
        </div>
      </Layout.Vertical>
      <div className={cx(css.tabsContainer, { [css.tabWidth]: allowMultiSelect })}>
        <Tabs id={'selectScope'} vertical defaultSelectedTabId={defaultTab}>
          {renderTab(!!projectIdentifier, TAB_ID.PROJECT, Scope.PROJECT, 'cube', 'projectLabel')}
          {renderTab(!!orgIdentifier, TAB_ID.ORGANIZATION, Scope.ORG, 'diagram-tree', 'orgLabel')}
          {renderTab(true, TAB_ID.ACCOUNT, Scope.ACCOUNT, 'layers', 'account')}
        </Tabs>
      </div>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Layout.Horizontal spacing="medium">
          <Button intent="primary" text={getString('entityReference.apply')} onClick={onSelect} disabled={disabled} />
        </Layout.Horizontal>
        {allowMultiSelect ? (
          <Layout.Horizontal spacing={'small'}>
            <Text inline>{getString('entityReference.totalSelected')}</Text>
            <Text
              inline
              padding={{ left: 'xsmall', right: 'xsmall' }}
              flex={{ align: 'center-center' }}
              background={Color.BLUE_600}
              color={Color.WHITE}
              border={{ radius: 100 }}
            >
              {checkedItems?.length || 0}
            </Text>
          </Layout.Horizontal>
        ) : null}
      </Layout.Horizontal>
    </Container>
  )
}

export default EntityReference
