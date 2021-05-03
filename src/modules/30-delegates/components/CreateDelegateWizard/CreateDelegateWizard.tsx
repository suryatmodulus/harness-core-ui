import React from 'react'

import { DelegateTypes } from '@delegates/constants'
import { useStrings } from 'framework/strings'
import CreateK8sDelegate from '@delegates/components/CreateDelegate/K8sDelegate/CreateK8sDelegate'
import DelegateDetailsStep from '../CreateDelegate/commonSteps/DelegateDetailsStep'
interface DelegateWizardProps {
  type?: string
  onBack: any
  onClose?: any
}

interface CreateDelegateWizardProps {
  onClose?: any
}

export const DelegateWizard: React.FC<DelegateWizardProps> = props => {
  const { type, onBack } = props
  switch (type) {
    case DelegateTypes.KUBERNETES_CLUSTER:
      return <CreateK8sDelegate onBack={onBack} onClose={props.onClose} />
    default:
      /* istanbul ignore next */
      return null
  }
}

export const CreateDelegateWizard: React.FC<CreateDelegateWizardProps> = props => {
  const { getString } = useStrings()
  const [showWizard, setShowWizard] = React.useState(false)
  const [delType, setDelType] = React.useState('')
  return (
    <div>
      {!showWizard && (
        <DelegateDetailsStep
          type={delType}
          name={getString('delegate.stepOneWizard')}
          onClick={(selectedCard: any) => {
            if (selectedCard?.type === DelegateTypes.KUBERNETES_CLUSTER) {
              setDelType(selectedCard?.type)
              setShowWizard(true)
            }
          }}
        />
      )}
      {showWizard && (
        <DelegateWizard
          {...props}
          type={delType}
          onBack={() => {
            setShowWizard(false)
          }}
        />
      )}
    </div>
  )
}
