import React, { useEffect, useState } from 'react'
import {
  Button,
  FlexExpander,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  Text,
  useModalHook
} from '@wings-software/uicore'
import { Classes, Dialog, Switch } from '@blueprintjs/core'
import cx from 'classnames'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'
import { TargetAttributesProvider } from '@cf/hooks/useTargetAttributes'
import CustomRulesView from './CustomRulesView'
import { DefaultRulesView } from './DefaultRulesView'
import css from '../FlagActivation/FlagActivation.module.scss'

interface TabTargetingProps {
  feature: Feature
  formikProps: any
  editing: boolean
  refetch: any
  targetData: Feature
  isBooleanTypeFlag?: boolean
  projectIdentifier: string
  environmentIdentifier: string
  setEditing: (flag: boolean) => void
  org: string
  accountIdentifier: string
}

const TabTargeting: React.FC<TabTargetingProps> = props => {
  const {
    feature,
    formikProps,
    targetData,
    editing,
    setEditing,
    environmentIdentifier,
    projectIdentifier,
    org,
    accountIdentifier
  } = props
  const [isEditRulesOn, setEditRulesOn] = useState(false)
  const { getString } = useStrings()
  const [canToggle] = usePermission(
    {
      resource: {
        resourceType: ResourceType.ENVIRONMENT,
        resourceIdentifier: environmentIdentifier
      },
      permissions: [PermissionIdentifier.TOGGLE_FF_FEATUREFLAG]
    },
    [environmentIdentifier]
  )

  useEffect(() => {
    if (!editing && isEditRulesOn) setEditRulesOn(false)
  }, [editing, isEditRulesOn])

  const [, hideTargetModal] = useModalHook(() => (
    <Dialog onClose={hideTargetModal} title="" isOpen={true}>
      <Layout.Vertical>
        <Text>{getString('cf.featureFlags.rules.serveToFollowing')}</Text>

        <Formik initialValues={{}} formName="tabTargeting" onSubmit={() => alert('To be implemented...')}>
          {() => (
            <Form>
              <FormInput.TextArea name="targets" />
            </Form>
          )}
        </Formik>

        <Layout.Horizontal>
          <Button intent="primary" text={getString('save')} onClick={() => alert('To be implemented...')} />
          <Button minimal text={getString('cancel')} onClick={hideTargetModal} />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Dialog>
  ))

  const onEditBtnHandler = (): void => {
    setEditRulesOn(!isEditRulesOn)
    setEditing(true)
  }

  const showCustomRules =
    editing ||
    (targetData?.envProperties?.rules?.length || 0) > 0 ||
    (targetData?.envProperties?.variationMap?.length || 0) > 0
  const isFlagSwitchChanged = targetData.envProperties?.state !== formikProps.values.state
  const switchOff = (formikProps.values.state || FeatureFlagActivationStatus.OFF) === FeatureFlagActivationStatus.OFF

  const onChangeSwitchEnv = (_: string, _formikProps: any): void => {
    _formikProps.setFieldValue(
      'state',
      _formikProps.values.state === FeatureFlagActivationStatus.OFF
        ? FeatureFlagActivationStatus.ON
        : FeatureFlagActivationStatus.OFF
    )
  }

  return (
    <TargetAttributesProvider
      project={projectIdentifier}
      org={org}
      accountIdentifier={accountIdentifier}
      environment={environmentIdentifier}
    >
      <Layout.Vertical padding={{ left: 'huge', right: 'large', bottom: 'large' }}>
        <Layout.Horizontal
          className={css.contentHeading}
          style={{ alignItems: 'center' }}
          margin={{ top: 'small', bottom: 'xlarge' }}
        >
          <Text
            tooltip={
              !canToggle ? (
                <RBACTooltip
                  permission={PermissionIdentifier.TOGGLE_FF_FEATUREFLAG}
                  resourceType={ResourceType.ENVIRONMENT}
                />
              ) : undefined
            }
          >
            <Switch
              onChange={event => {
                onChangeSwitchEnv(event.currentTarget.value, formikProps)
              }}
              alignIndicator="right"
              className={cx(Classes.LARGE, css.switch)}
              checked={formikProps.values.state === FeatureFlagActivationStatus.ON}
              disabled={feature.archived || !canToggle}
            />
          </Text>
          <Text style={{ fontSize: '12px', color: '#6B6D85' }} padding={{ left: 'small' }}>
            {isFlagSwitchChanged
              ? getString(switchOff ? 'cf.featureFlags.flagWillTurnOff' : 'cf.featureFlags.flagWillTurnOn')
              : switchOff
              ? getString('cf.featureFlags.flagOff')
              : getString('cf.featureFlags.flagOn')}
          </Text>
          <FlexExpander />
          <RbacButton
            text={getString('cf.featureFlags.rules.editRules')}
            icon="edit"
            onClick={onEditBtnHandler}
            style={{
              visibility: isEditRulesOn ? 'hidden' : undefined
            }}
            disabled={feature.archived}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT,
                resourceIdentifier: environmentIdentifier
              },
              permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
            }}
          />
        </Layout.Horizontal>
        <Layout.Vertical>
          <DefaultRulesView
            formikProps={formikProps}
            editing={isEditRulesOn}
            defaultOnVariation={targetData.defaultOnVariation}
            bucketBy={targetData.envProperties?.defaultServe.distribution?.bucketBy}
            weightedVariations={targetData.envProperties?.defaultServe.distribution?.variations}
            variations={targetData.variations}
          />
        </Layout.Vertical>
        <Layout.Vertical>
          {showCustomRules && (
            <CustomRulesView
              feature={feature}
              editing={isEditRulesOn}
              formikProps={formikProps}
              target={targetData}
              environment={environmentIdentifier}
              project={projectIdentifier}
            />
          )}
        </Layout.Vertical>
      </Layout.Vertical>
    </TargetAttributesProvider>
  )
}

export default TabTargeting
