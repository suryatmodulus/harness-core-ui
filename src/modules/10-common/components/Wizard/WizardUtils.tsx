import React, { RefObject } from 'react'
import { Color, Icon, IconName } from '@wings-software/uicore'
import cx from 'classnames'
import { isUndefined, range } from 'lodash-es'
import css from './Wizard.module.scss'

const renderIcon = ({
  requiredFields,
  checkValidPanel,
  panelIndex,
  touchedPanels,
  isEdit,
  formikValues
}: {
  requiredFields?: string[]
  checkValidPanel?: (formiKValues: any) => boolean
  panelIndex: number
  touchedPanels: number[]
  isEdit: boolean
  formikValues: { [key: string]: any }
}): JSX.Element | undefined => {
  if (!touchedPanels.includes(panelIndex) && !isEdit) return
  let iconName: IconName = 'tick-circle'
  let iconColor = Color.GREEN_500

  let showWarningIcon = requiredFields?.some(requiredField => {
    const val = formikValues[requiredField]
    // empty array should not show warning as valid yaml spec
    // set array to undefined to see warning
    if (isUndefined(val) || (typeof val === 'string' && val === '')) {
      return true
    }
  })

  if (!showWarningIcon && checkValidPanel && !checkValidPanel(formikValues)) {
    showWarningIcon = true
  }
  if (showWarningIcon) {
    iconName = 'warning-sign'
    iconColor = Color.RED_500
  }

  return <Icon size={20} color={iconColor} name={iconName} />
}

export const renderTitle = ({
  tabTitle,
  tabTitleComponent,
  requiredFields,
  checkValidPanel,
  panelIndex,
  touchedPanels,
  isEdit,
  selectedTabIndex,
  ref,
  formikValues
}: {
  tabTitle?: string
  tabTitleComponent?: JSX.Element
  requiredFields: string[]
  checkValidPanel?: (formiKValues: any) => boolean
  panelIndex: number
  touchedPanels: number[]
  isEdit: boolean
  selectedTabIndex: number
  formikValues: { [key: string]: any }
  ref: RefObject<HTMLSpanElement>
}): JSX.Element => {
  let title: string | JSX.Element = ''

  if (tabTitleComponent) title = tabTitleComponent
  else if (tabTitle) title = tabTitle
  const icon = renderIcon({
    requiredFields,
    panelIndex,
    touchedPanels,
    isEdit,
    formikValues,
    checkValidPanel
  })
  return (
    <span ref={ref} className={css.tab}>
      {icon ? (
        icon
      ) : (
        <div className={cx(css.panelIndexCircle, selectedTabIndex === panelIndex && css.activeIndex)}>
          <span className={css.panelIndexNumber}>{panelIndex + 1}</span>
        </div>
      )}
      {title}
    </span>
  )
}

export const setNewTouchedPanel = ({
  upcomingTabIndex,
  touchedPanels,
  selectedTabIndex,
  setTouchedPanels,
  includeSkippedIndexes
}: {
  upcomingTabIndex: number
  touchedPanels: number[]
  selectedTabIndex: number
  setTouchedPanels: (panels: number[]) => void
  includeSkippedIndexes?: boolean
}): void => {
  const movingBackwards = selectedTabIndex && upcomingTabIndex < selectedTabIndex
  if (touchedPanels.includes(upcomingTabIndex) && !movingBackwards) return /* istanbul ignore else */
  if (includeSkippedIndexes) {
    if (movingBackwards && selectedTabIndex) {
      // going backwards from last
      setTouchedPanels([...touchedPanels, selectedTabIndex])
    } else {
      const additionalTabs = range(0, upcomingTabIndex)
      setTouchedPanels([...touchedPanels, ...additionalTabs])
    }
  } else {
    setTouchedPanels([...touchedPanels, selectedTabIndex])
  }
}
