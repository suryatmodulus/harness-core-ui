import React from 'react'
import { Container, Icon, Text, CollapseList, CollapseListPanel, Color } from '@wings-software/uicore'
import cx from 'classnames'
import type { GroupedMetric } from './GroupedSideNav.types'
import css from '../SelectedAppsSideNav.module.scss'

interface GroupedSideNavInterface {
  onSelect?: (selectedMetric: string, index: number) => void
  selectedItem?: string
  onRemoveItem?: (removedItem: string, index: number) => void
  groupedSelectedAppsList: [string, GroupedMetric[]][]
}
export default function GroupedSideNav({
  groupedSelectedAppsList,
  selectedItem,
  onRemoveItem,
  onSelect
}: GroupedSideNavInterface): JSX.Element {
  return (
    <>
      {groupedSelectedAppsList.map((groupItem, groupIndex) => {
        if (!groupItem) {
          return <></>
        }
        const [label, items] = groupItem
        return (
          <CollapseList key={label}>
            <CollapseListPanel
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
  )
}
