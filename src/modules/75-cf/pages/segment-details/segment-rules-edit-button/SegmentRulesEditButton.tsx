import React, { ReactElement } from 'react'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier, ResourceType } from 'microfrontends'
import RbacButton from '@rbac/components/Button/Button'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'

export interface SegmentRulesEditButtonProps {
  onEdit: () => void
}

const SegmentRulesEditButton = (props: SegmentRulesEditButtonProps): ReactElement => {
  const { onEdit } = props

  const { isPlanEnforcementEnabled } = usePlanEnforcement()
  const { activeEnvironment } = useActiveEnvironment()
  const { getString } = useStrings()

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
      text={getString('cf.featureFlags.rules.editRules')}
      icon="edit"
      onClick={onEdit}
      permission={{
        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
        permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
      }}
      {...planEnforcementProps}
    />
  )
}

export default SegmentRulesEditButton
