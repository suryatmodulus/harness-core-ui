import React from 'react'
import {
  Container,
  Icon,
  Text,
  PageError,
  PageErrorProps,
  CollapseList,
  CollapseListPanel,
  Color
} from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { TableFilter, TableFilterProps } from '@cv/components/TableFilter/TableFilter'
import type { GroupedCreatedMetrics } from '@cv/pages/health-source/connectors/AppDynamics/Components/AppDMappedMetric/AppDMappedMetric.types'
import css from './SelectedAppsSideNav.module.scss'

const LoadingCells = [1, 2, 3, 4, 5]

export interface SelectedAppsSideNavProps {
  selectedApps?: string[]
  loading?: boolean
  error?: PageErrorProps
  filterProps?: TableFilterProps
  headerText?: string
  selectedItem?: string
  onRemoveItem?: (removedItem: string, index: number) => void
  onSelect?: (selectedMetric: string, index: number) => void
  groupedSelectedApps?: GroupedCreatedMetrics
}

export function SelectedAppsSideNav(props: SelectedAppsSideNavProps): JSX.Element {
  const {
    selectedApps,
    groupedSelectedApps,
    loading,
    filterProps,
    error,
    headerText,
    onSelect,
    selectedItem,
    onRemoveItem
  } = props
  let content
  if (error?.message) {
    content = <PageError {...error} />
  } else if (loading) {
    content = LoadingCells.map(loadingCell => (
      <Container key={loadingCell} className={css.seletedAppContainer}>
        <Container className={cx(Classes.SKELETON, css.selectedApp)} height={16} width="100%" />
      </Container>
    ))
  } else {
    content = selectedApps?.map((selectedApp, index) => {
      return (
        <Container key={selectedApp} className={css.seletedAppContainer} onClick={() => onSelect?.(selectedApp, index)}>
          <Text
            className={cx(css.selectedApp, selectedItem && selectedApp === selectedItem ? css.isSelected : false)}
            lineClamp={1}
          >
            {selectedApp}
          </Text>
          {onRemoveItem && (
            <Icon
              name="main-delete"
              onClick={e => {
                e.stopPropagation()
                onRemoveItem(selectedApp, index)
              }}
            />
          )}
        </Container>
      )
    })
  }

  const groupedSelectedAppsList = Object.entries(groupedSelectedApps || {})

  return (
    <Container className={css.main}>
      {headerText && <Text className={css.navHeader}>{headerText}</Text>}
      {filterProps && <TableFilter {...filterProps} />}
      {groupedSelectedAppsList.length ? (
        <>
          {groupedSelectedAppsList.map((groupItem, groupIndex) => {
            if (!groupItem) return
            const [label, items] = groupItem
            return (
              <CollapseList key={label}>
                <CollapseListPanel
                  isOpen
                  collapseHeaderProps={{
                    heading: (
                      <Text
                        className={cx(css.selectedApp, css.collapseHeading)}
                        color={Color.GREY_900}
                        font={{ weight: 'semi-bold', size: 'normal' }}
                      >
                        {label}
                      </Text>
                    ),
                    collapsedIcon: 'main-chevron-right',
                    expandedIcon: 'main-chevron-down',
                    iconProps: { name: 'main-chevron-right', color: 'primary6' }
                  }}
                  key={label}
                  className={css.collapsePanel}
                >
                  {items?.map((selectedApp, index) => {
                    return (
                      <Container
                        key={selectedApp.metricName}
                        className={css.seletedAppContainer}
                        onClick={() => {
                          if (selectedApp.metricName) {
                            onSelect?.(selectedApp.metricName, index + groupIndex)
                          }
                        }}
                      >
                        <Text
                          className={cx(
                            css.selectedApp,
                            selectedItem && selectedApp.metricName === selectedItem ? css.isSelected : false
                          )}
                          lineClamp={1}
                        >
                          {selectedApp.metricName}
                        </Text>
                        {onRemoveItem && (
                          <Icon
                            name="main-delete"
                            onClick={e => {
                              e.stopPropagation()
                              if (selectedApp.metricName) {
                                onRemoveItem(selectedApp.metricName, index + groupIndex)
                              }
                            }}
                          />
                        )}
                      </Container>
                    )
                  })}
                </CollapseListPanel>
              </CollapseList>
            )
          })}
        </>
      ) : (
        content
      )}
    </Container>
  )
}
