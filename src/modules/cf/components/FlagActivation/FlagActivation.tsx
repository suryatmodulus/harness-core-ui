import React, { useEffect, useState } from 'react'
import { isEqual, isNil } from 'lodash-es'
import {
  Layout,
  Color,
  Container,
  Text,
  Switch,
  Tabs,
  Tab,
  Button,
  FlexExpander,
  Select,
  useModalHook,
  SelectOption,
  Formik,
  FormikForm as Form
} from '@wings-software/uikit'
import { Dialog } from '@blueprintjs/core'
import { Feature, FeatureState, Distribution, usePatchFeatureFlag } from 'services/cf'
import FlagElemTest from '../../components/CreateFlagWizard/FlagElemTest'
import TabTargeting from '../EditFlagTabs/TabTargeting'
import TabActivity from '../EditFlagTabs/TabActivity'
import patch from '../../utils/instructions'
import i18n from './FlagActivation.i18n'
import css from './FlagActivation.module.scss'

interface FlagActivationProps {
  project: string
  environments: SelectOption[]
  environment: SelectOption | null
  flagData: Feature | undefined
  isBooleanFlag: boolean
  onEnvChange: any
  refetchFlag: any
}

interface Values {
  [key: string]: any
  state: string
  defaultOnVariation: string | Distribution
  defaultOffVariation: string
}

export enum envActivation {
  activeOff = 'off',
  activeOn = 'on'
}

const FlagActivation: React.FC<FlagActivationProps> = props => {
  const { flagData, project, environments, environment, isBooleanFlag, refetchFlag } = props

  const [editEnvActivation, seteditEnvActivation] = useState<FeatureState | undefined>(flagData?.envProperties?.state)
  const [editing, setEditing] = useState(false)
  const dirty = editEnvActivation !== flagData?.envProperties?.state
  const { mutate: patchFeature } = usePatchFeatureFlag({
    identifier: flagData?.identifier as string,
    queryParams: {
      project: project as string,
      environment: environment?.value as string
    }
  })

  const toggleFlag = () => {
    seteditEnvActivation(
      editEnvActivation === envActivation.activeOff ? envActivation.activeOn : envActivation.activeOff
    )
  }

  const onChangeSwitchEnv = (_: string, formikProps: any): void => {
    toggleFlag()

    formikProps.setFieldValue(
      'state',
      editEnvActivation === envActivation.activeOff ? envActivation.activeOn : envActivation.activeOff
    )
  }

  const onCancelEditHandler = (): void => {
    setEditing(false)
    patch.feature.reset()
  }

  const initialValues: Values = {
    state: flagData?.envProperties?.state as string,
    defaultOnVariation: flagData?.defaultOnVariation as string,
    defaultOffVariation: flagData?.defaultOffVariation as string
  }

  const onSaveChanges = (values: any): void => {
    if (values.state !== initialValues.state) {
      patch.feature.addInstruction(patch.creators.setFeatureFlagState(values.state))
    }
    if (!isEqual(values.defaultOffVariation, initialValues.defaultOffVariation)) {
      patch.feature.addInstruction(patch.creators.setDefaultOffVariation(values.defaultOffVariation as string))
    }
    if (!isEqual(values.defaultOnVariation, initialValues.defaultOnVariation)) {
      patch.feature.addInstruction(patch.creators.setDefaultOnVariation(values.defaultOnVariation as string))
    }

    patch.feature.onPatchAvailable(data => {
      patchFeature(data)
        .then(() => {
          patch.feature.reset()
          refetchFlag()
        })
        .catch(() => {
          patch.feature.reset()
        })
    })
  }

  const [openModalTestFlag, hideModalTestFlag] = useModalHook(() => (
    <Dialog onClose={hideModalTestFlag} isOpen={true} className={css.testFlagDialog}>
      <Container className={css.testFlagDialogContainer}>
        <FlagElemTest name="" fromWizard={false} />
        <Button
          minimal
          icon="small-cross"
          iconProps={{ size: 20 }}
          onClick={hideModalTestFlag}
          style={{ top: 0, right: '15px', position: 'absolute' }}
        />
      </Container>
    </Dialog>
  ))

  useEffect(() => {
    if (isNil(environment)) {
      props.onEnvChange(environments[0])
    }
  }, [environment])

  return (
    <Formik initialValues={initialValues} onSubmit={onSaveChanges}>
      {formikProps => (
        <Form>
          <Layout.Horizontal flex background={Color.BLUE_300} padding="large">
            <Text margin={{ right: 'medium' }} font={{ weight: 'bold' }}>
              {i18n.env.toUpperCase()}
            </Text>
            <Select
              items={environments}
              className={css.envSelect}
              value={environment ?? environments[0]}
              onChange={props.onEnvChange}
            />
            <FlexExpander />
            <Switch
              label={i18n.changeEditEnv(editEnvActivation as string)}
              onChange={event => {
                onChangeSwitchEnv(event.currentTarget.value, formikProps)
              }}
              alignIndicator="right"
              large={true}
              checked={editEnvActivation === envActivation.activeOn}
            />
          </Layout.Horizontal>
          <Container className={css.tabContainer}>
            {flagData ? (
              <>
                <Tabs id="editFlag">
                  <Tab
                    id="targeting"
                    title={i18n.targeting}
                    panel={
                      <TabTargeting
                        formikProps={formikProps}
                        editing={editing}
                        refetch={refetchFlag}
                        targetData={flagData}
                        isBooleanTypeFlag={isBooleanFlag}
                        projectIdentifier={project}
                        environmentIdentifier={environment?.value as string}
                        setEditing={setEditing}
                      />
                    }
                  />
                  <Tab id="activity" title={i18n.activity} panel={<TabActivity />} />
                </Tabs>
                <Button
                  icon="code"
                  minimal
                  intent="primary"
                  onClick={openModalTestFlag}
                  className={css.tabContainerTestFlagBtn}
                />
              </>
            ) : (
              <Text>No Data</Text>
            )}
          </Container>
          {(editing || dirty) && (
            <Layout.Horizontal className={css.editBtnsGroup} padding="medium">
              <Button
                intent="primary"
                text={i18n.saveChange}
                margin={{ right: 'small' }}
                onClick={formikProps.submitForm}
              />
              <Button minimal text={i18n.cancel} onClick={onCancelEditHandler} />
            </Layout.Horizontal>
          )}
        </Form>
      )}
    </Formik>
  )
}

export default FlagActivation
