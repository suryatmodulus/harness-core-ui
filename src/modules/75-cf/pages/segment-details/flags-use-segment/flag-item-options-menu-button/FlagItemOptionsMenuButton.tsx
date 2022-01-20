import React, { ReactElement } from 'react'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'

export interface FlagItemOptionsMenuButtonProps {
  onClick: () => void
}

const FlagItemOptionsMenuButton = (props: FlagItemOptionsMenuButtonProps): ReactElement => {
  const { onClick } = props

  const { getString } = useStrings()
  const { activeEnvironment } = useActiveEnvironment()

  const { isPlanEnforcementEnabled } = usePlanEnforcement()
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
    <RbacOptionsMenuButton
      items={[
        {
          text: getString('cf.segmentDetail.removeFomFlag'),
          icon: 'cross',
          permission: {
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
            permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
          },
          onClick: onClick,
          ...planEnforcementProps
        }
      ]}
    />
  )
}

export default FlagItemOptionsMenuButton
