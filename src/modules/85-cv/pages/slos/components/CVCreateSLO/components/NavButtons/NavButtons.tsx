import { Button, ButtonVariation, Layout } from '@wings-software/uicore'
import React from 'react'
import { isEmpty } from 'lodash-es'
import { CreateSLOEnum, TabsOrder } from '../CreateSLOForm/CreateSLO.constants'
import type { NavButtonsProps } from './NavButtons.types'
import { validateSLOForm } from '../CreateSLOForm/CreateSLO.utils'
import css from '../CreateSLOForm/CreateSLO.module.scss'

export const NavButtons = ({
  selectedTabId,
  setSelectedTabId,
  getString,
  formikProps
}: NavButtonsProps): JSX.Element => {
  return (
    <Layout.Horizontal className={css.navigationBtns}>
      <Button
        text={getString('back')}
        variation={ButtonVariation.SECONDARY}
        icon="chevron-left"
        onClick={() => setSelectedTabId(TabsOrder[Math.max(0, TabsOrder.indexOf(selectedTabId) - 1)])}
      />
      <Button
        text={selectedTabId === CreateSLOEnum.SLO_TARGET_BUDGET_POLICY ? getString('save') : getString('continue')}
        variation={ButtonVariation.PRIMARY}
        rightIcon="chevron-right"
        onClick={() => {
          const errors = validateSLOForm(formikProps, selectedTabId, getString)
          if (isEmpty(errors)) {
            if (selectedTabId === CreateSLOEnum.SLO_TARGET_BUDGET_POLICY) {
              formikProps.submitForm()
            } else {
              setSelectedTabId(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
            }
          }
        }}
      />
    </Layout.Horizontal>
  )
}
