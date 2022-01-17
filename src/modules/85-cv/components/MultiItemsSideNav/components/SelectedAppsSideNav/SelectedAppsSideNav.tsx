/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Text, PageError, PageErrorProps } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { TableFilter, TableFilterProps } from '@cv/components/TableFilter/TableFilter'
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
}

export function SelectedAppsSideNav(props: SelectedAppsSideNavProps): JSX.Element {
  const { selectedApps, loading, filterProps, error, headerText, onSelect, selectedItem, onRemoveItem } = props
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

  return (
    <Container className={css.main}>
      {headerText && <Text className={css.navHeader}>{headerText}</Text>}
      {filterProps && <TableFilter {...filterProps} />}
      {content}
    </Container>
  )
}
