import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { Container, useModalHook, Button, StepWizard, Color } from '@wings-software/uicore'
import type { Budget } from 'services/ce'
import { useStrings } from 'framework/strings'

import SetBudgetAmount from './CreateBudgetSteps/SetBudgetAmount'
import ConfigureAlerts from './CreateBudgetSteps/ConfigureAlerts'
import SelectPerspective from './CreateBudgetSteps/SelectPerspective'
import css from './PerspectiveCreateBudget.module.scss'

interface OpenModalArgs {
  isEdit?: boolean
  selectedBudget: Budget
  perspectiveName?: string
  perspective?: string
}

interface BudgetModalProps {
  onSuccess: () => void
  onError?: () => void
}

const useBudgetModal = ({ onSuccess }: BudgetModalProps) => {
  const { getString } = useStrings()
  const [isEditMode, setIsEditMode] = useState(false)
  const [perspectiveInfo, setPerspectiveInfo] = useState<any>()
  const [budget, setBudget] = useState<Budget>()
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()

  const modalPropsLight: IDialogProps = {
    isOpen: true,
    autoFocus: true,
    enforceFocus: false,
    canOutsideClickClose: false,
    className: cx(Classes.DIALOG, css.dialog),
    style: {
      minWidth: 1175,
      minHeight: 640,
      paddingBottom: 0
    }
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalPropsLight}>
        <Container>
          <StepWizard
            icon={'vertical-bar-chart-asc'}
            iconProps={{ size: 40, color: Color.WHITE }}
            title={
              isEditMode
                ? getString('ce.perspectives.budgets.wizardTitleEdit')
                : getString('ce.perspectives.budgets.wizardTitle')
            }
          >
            <SelectPerspective
              perspective={perspectiveInfo?.id}
              name={getString('ce.perspectives.budgets.defineTarget.title')}
              isEditMode={isEditMode}
              budget={budget}
            />
            <SetBudgetAmount
              name={getString('ce.perspectives.budgets.setBudgetAmount.title')}
              budget={budget}
              isEditMode={isEditMode}
            />
            <ConfigureAlerts
              isEditMode={isEditMode}
              viewId={perspectiveId}
              name={getString('ce.perspectives.budgets.configureAlerts.title')}
              accountId={accountId}
              budget={budget}
              onSuccess={onSuccess}
            />
          </StepWizard>
        </Container>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [perspectiveInfo?.name, budget, isEditMode]
  )

  return {
    hideModal,
    openModal: (args?: OpenModalArgs) => {
      const { isEdit, selectedBudget, perspectiveName, perspective } = args || {}
      setIsEditMode(!!isEdit)
      setBudget(selectedBudget)
      setPerspectiveInfo({
        name: perspectiveName,
        id: perspective
      })
      openModal()
    }
  }
}

export default useBudgetModal
