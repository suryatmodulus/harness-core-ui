import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { Container, useModalHook, Button, StepWizard } from '@wings-software/uicore'
import { Budget, useGetPerspective } from 'services/ce'
import { useStrings } from 'framework/strings'

import SetBudgetAmount from './CreateBudgetSteps/SetBudgetAmount'
import ConfigureAlerts from './CreateBudgetSteps/ConfigureAlerts'
import css from './PerspectiveCreateBudget.module.scss'

interface OpenModalArgs {
  isEdit?: boolean
  selectedBudget: Budget
}

interface BudgetModalProps {
  onSuccess: () => void
  onError?: () => void
}

const useBudgetModal = ({ onSuccess }: BudgetModalProps) => {
  const { getString } = useStrings()
  const [isEditMode, setIsEditMode] = useState(false)
  const [budget, setBudget] = useState<Budget>()
  const { perspectiveId, accountId } = useParams<{ perspectiveId: string; accountId: string }>()
  const { data: perspectiveRes } = useGetPerspective({
    queryParams: { perspectiveId } // TODO: accountIdentifier: accountId
  })

  const modalPropsLight: IDialogProps = {
    isOpen: true,
    autoFocus: true,
    enforceFocus: false,
    className: cx(Classes.DIALOG, css.dialog),
    style: {
      minWidth: 1175,
      minHeight: 640,
      paddingBottom: 0
    }
  }

  const perspectiveData = perspectiveRes?.resource
  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalPropsLight}>
        <Container>
          <StepWizard
            icon={'vertical-bar-chart-asc'}
            iconProps={{ size: 40 }}
            title={getString('ce.perspectives.budgets.wizardTitle')}
            className={css.mainCtn}
          >
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
              perspectiveName={perspectiveData?.name || ''}
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
    [perspectiveData?.name, budget, isEditMode]
  )

  return {
    hideModal,
    openModal: (args?: OpenModalArgs) => {
      const { isEdit, selectedBudget } = args || {}
      setIsEditMode(!!isEdit)
      setBudget(selectedBudget)
      openModal()
    }
  }
}

export default useBudgetModal
