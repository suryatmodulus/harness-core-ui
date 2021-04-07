import React, { useState, useEffect } from 'react'
import {
  Layout,
  Button,
  Text,
  Formik,
  FormikForm as Form,
  FormInput,
  useModalHook,
  FlexExpander
} from '@wings-software/uicore'
import { Classes, Dialog, Switch } from '@blueprintjs/core'
import cx from 'classnames'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/exports'
import type { Feature } from 'services/cf'
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
  setEditing: Function
}

const TabTargeting: React.FC<TabTargetingProps> = props => {
  const { feature, formikProps, targetData, editing, setEditing, environmentIdentifier, projectIdentifier } = props
  const [isEditRulesOn, setEditRulesOn] = useState(false)
  const { getString } = useStrings()

  useEffect(() => {
    if (!editing && isEditRulesOn) setEditRulesOn(false)
  }, [editing])

  const [, hideTargetModal] = useModalHook(() => (
    <Dialog onClose={hideTargetModal} title="" isOpen={true}>
      <Layout.Vertical>
        <Text>{getString('cf.featureFlags.rules.serveToFollowing')}</Text>

        <Formik initialValues={{}} onSubmit={() => alert('To be implemented...')}>
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
    <Layout.Vertical padding={{ left: 'huge', right: 'large', bottom: 'large' }}>
      <Layout.Horizontal
        className={css.contentHeading}
        style={{ alignItems: 'center' }}
        margin={{ top: 'small', bottom: 'xlarge' }}
      >
        <Switch
          onChange={event => {
            onChangeSwitchEnv(event.currentTarget.value, formikProps)
          }}
          alignIndicator="right"
          className={cx(Classes.LARGE, css.switch)}
          checked={formikProps.values.state === FeatureFlagActivationStatus.ON}
          disabled={feature.archived}
        />
        <Text style={{ fontSize: '12px', color: '#6B6D85' }} padding={{ left: 'small' }}>
          {isFlagSwitchChanged
            ? getString(switchOff ? 'cf.featureFlags.flagWillTurnOff' : 'cf.featureFlags.flagWillTurnOn')
            : switchOff
            ? getString('cf.featureFlags.flagOff')
            : getString('cf.featureFlags.flagOn')}
        </Text>
        <FlexExpander />
        <Button
          text={getString('cf.featureFlags.rules.editRules')}
          icon="edit"
          onClick={onEditBtnHandler}
          style={{
            visibility: isEditRulesOn ? 'hidden' : undefined
          }}
          disabled={feature.archived}
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
            enviroment={environmentIdentifier}
            project={projectIdentifier}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default TabTargeting
