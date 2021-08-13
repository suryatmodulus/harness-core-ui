import React, { useState, useEffect, useCallback, useRef } from 'react'
import cx from 'classnames'
import { Container, TextInput, Button, Layout, Text, Tabs, Tab, Icon, IconName, Color } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import { debounce, isEmpty } from 'lodash-es'
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
  fetchRecords: (scope: Scope, searchTerm: string, done: (records: EntityReferenceResponse<T>[]) => void) => void
  recordRender: (args: { item: EntityReferenceResponse<T>; selectedScope: Scope; selected?: boolean }) => JSX.Element
  recordClassName?: string
  className?: string
  projectIdentifier?: string
  noRecordsText?: string
  orgIdentifier?: string
  defaultScope?: Scope
  searchInlineComponent?: JSX.Element
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
    searchInlineComponent
  } = props
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedScope, setSelectedScope] = useState<Scope>(
    defaultScope || getDefaultScope(orgIdentifier, projectIdentifier)
  )
  const [data, setData] = useState<EntityReferenceResponse<T>[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>()
  const [selectedRecord, setSelectedRecord] = useState<T>()

  React.useEffect(() => {
    setSelectedScope(getDefaultScope(orgIdentifier, projectIdentifier))
  }, [projectIdentifier, orgIdentifier])

  const delayedFetchRecords = useRef(debounce((fn: () => void) => fn(), 300)).current

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
        delayedFetchRecords(() => {
          setLoading(true)
          setSelectedRecord(undefined)
          fetchRecords(selectedScope, searchTerm, records => {
            setData(records)
            setLoading(false)
          })
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

  const defaultTab = projectIdentifier ? TAB_ID.PROJECT : orgIdentifier ? TAB_ID.ORGANIZATION : TAB_ID.ACCOUNT

  const renderedList = loading ? (
    <Container flex={{ align: 'center-center' }} padding="small">
      <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
    </Container>
  ) : error ? (
    <Container>
      <PageError message={error} onClick={fetchData} />
    </Container>
  ) : data.length ? (
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
  ) : (
    <Container padding={{ top: 'xlarge' }} flex={{ align: 'center-center' }}>
      <Text>{noRecordsText}</Text>
    </Container>
  )

  const renderTab = (
    show: boolean,
    id: string,
    scope: Scope,
    icon: IconName,
    title: StringKeys
  ): React.ReactElement | null => {
    return show ? (
      <Tab
        id={id}
        title={
          <Text onClick={() => onScopeChange(scope)} padding={'medium'}>
            <Icon name={icon} {...iconProps} className={css.iconMargin} />
            {getString(title)}
          </Text>
        }
        panel={renderedList}
      />
    ) : null
  }

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
      <div className={css.tabsContainer}>
        <Tabs id={'selectScope'} vertical defaultSelectedTabId={defaultTab}>
          {renderTab(!!projectIdentifier, TAB_ID.PROJECT, Scope.PROJECT, 'cube', 'projectLabel')}
          {renderTab(!!orgIdentifier, TAB_ID.ORGANIZATION, Scope.ORG, 'diagram-tree', 'orgLabel')}
          {renderTab(true, TAB_ID.ACCOUNT, Scope.ACCOUNT, 'layers', 'account')}
        </Tabs>
      </div>
      <Layout.Horizontal>
        <Button
          intent="primary"
          text={getString('entityReference.apply')}
          onClick={() => props.onSelect(selectedRecord as T, selectedScope)}
          disabled={!selectedRecord}
          className={cx(css.applyButton, Classes.POPOVER_DISMISS)}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export default EntityReference
