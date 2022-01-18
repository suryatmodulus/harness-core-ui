import React, { ReactElement } from 'react'
import type { ButtonProps as CoreButtonProps } from '@harness/uicore'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'

export interface AddToFlagButtonProps extends CoreButtonProps {
  handleClick: () => void
}

const AddToFlagButton = (props: AddToFlagButtonProps): ReactElement => {
  const { handleClick } = props
  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const { activeEnvironment } = useActiveEnvironment()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  return (
    <RbacButton
      data-testid="add-feature-flags-button"
      onClick={handleClick}
      {...props}
      permission={{
        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
        permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
      }}
      {...planEnforcementProps}
    />
  )
}

export default AddToFlagButton
