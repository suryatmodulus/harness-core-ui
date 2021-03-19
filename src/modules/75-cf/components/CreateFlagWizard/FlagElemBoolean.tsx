import React, { Dispatch, SetStateAction, useState } from 'react'
import * as yup from 'yup'
import {
  Color,
  Formik,
  FormikForm as Form,
  FormInput,
  StepProps,
  Text,
  Layout,
  SelectOption,
  Container,
  Button,
  ModalErrorHandler,
  FlexExpander
} from '@wings-software/uicore'
import type { FeatureFlagRequestRequestBody } from 'services/cf'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import i18n from './FlagWizard.i18n'
import css from './FlagElemVariations.module.scss'

interface FlagElemVariationsProps {
  toggleFlagType: (newFlag: string) => void
  flagTypeOptions: SelectOption[]
  onWizardStepSubmit: (data: FeatureFlagRequestRequestBody) => void
  projectIdentifier?: string | number | null | undefined
  // FIXME: Check for the right type
  setModalErrorHandler: Dispatch<SetStateAction<any>>
  isLoadingCreateFeatureFlag: boolean
}

const TRUE = 'true'
const FALSE = 'false'
const True = 'True'
const False = 'False'

// FIXME: Change any for StepProps
const FlagElemBoolean: React.FC<StepProps<any> & FlagElemVariationsProps> = props => {
  const {
    toggleFlagType,
    flagTypeOptions,
    prevStepData,
    previousStep,
    // nextStep,
    onWizardStepSubmit,
    projectIdentifier,
    setModalErrorHandler,
    isLoadingCreateFeatureFlag
  } = props

  const handleNewFlagType = (newFlagTypeVal: string): void => {
    toggleFlagType(newFlagTypeVal)
  }

  const [trueFlagOption, setTrueFlagOption] = useState(True)
  const [falseFlagOption, setFalseFlagOption] = useState(False)

  const onTrueFlagChange = (valInput: string): void => {
    setTrueFlagOption(valInput)
  }

  const onFalseFlagChange = (valInput: string): void => {
    setFalseFlagOption(valInput)
  }

  const selectValueTrue = { label: trueFlagOption, value: TRUE }
  const selectValueFalse = { label: falseFlagOption, value: FALSE }

  const flagBooleanRules = [selectValueTrue, selectValueFalse]

  const onClickBack = (): void => {
    previousStep?.({ ...prevStepData })
  }

  return (
    <Formik
      initialValues={{
        kind: FlagTypeVariations.booleanFlag,
        variations: [
          { identifier: TRUE, name: True, value: TRUE },
          { identifier: FALSE, name: False, value: FALSE }
        ],
        defaultOnVariation: TRUE,
        defaultOffVariation: FALSE,
        ...prevStepData
      }}
      validationSchema={yup.object().shape({
        variations: yup.array().of(
          yup.object().shape({
            name: yup.string().trim().required(i18n.nameIsRequired)
          })
        )
      })}
      onSubmit={vals => {
        const data: FeatureFlagRequestRequestBody = { ...prevStepData, ...vals, project: projectIdentifier }
        onWizardStepSubmit(data)
      }}
    >
      {() => (
        <Form>
          <Container
            flex
            height="100%"
            style={{ flexDirection: 'column', alignItems: 'baseline' }}
            className={css.booleanForm}
          >
            <Container style={{ flexGrow: 1, overflow: 'auto' }} width="100%">
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Text style={{ fontSize: '18px', color: Color.GREY_700 }} margin={{ bottom: 'xlarge' }}>
                {i18n.varSettingsFlag.variationSettingsHeading}
              </Text>
              <Layout.Vertical>
                <FormInput.Select
                  name="kind"
                  label={i18n.varSettingsFlag.flagType}
                  items={flagTypeOptions}
                  onChange={newFlagType => handleNewFlagType(newFlagType.value as string)}
                  className={css.inputSelectFlagType}
                />
                <Layout.Horizontal spacing="small">
                  <FormInput.Text
                    name="variations[0].value"
                    label={i18n.variation1}
                    disabled
                    className={css.disabledInput}
                  />
                  <FormInput.Text
                    name="variations[0].name"
                    label={i18n.name}
                    onChange={e => {
                      onTrueFlagChange((e.currentTarget as HTMLInputElement).value)
                    }}
                  />
                </Layout.Horizontal>
                <Layout.Horizontal spacing="small">
                  <FormInput.Text
                    name="variations[1].value"
                    label={i18n.variation2}
                    disabled
                    className={css.disabledInput}
                  />
                  <FormInput.Text
                    name="variations[1].name"
                    label={i18n.name}
                    onChange={e => {
                      onFalseFlagChange((e.currentTarget as HTMLInputElement).value)
                    }}
                  />
                </Layout.Horizontal>

                <Container margin={{ bottom: 'xlarge' }}>
                  <Text color={Color.BLACK} margin={{ top: 'medium' }}>
                    {i18n.varSettingsFlag.defaultRules}
                  </Text>

                  <Layout.Vertical margin={{ top: 'medium' }}>
                    <Container>
                      <Layout.Horizontal>
                        <Text width="25%" className={css.serveTextAlign}>
                          {i18n.varSettingsFlag.flagOn}
                        </Text>
                        <FormInput.Select name="defaultOnVariation" items={flagBooleanRules} />
                      </Layout.Horizontal>
                    </Container>
                    <Container>
                      <Layout.Horizontal>
                        <Text width="25%" className={css.serveTextAlign}>
                          {i18n.varSettingsFlag.flagOff}
                        </Text>
                        <FormInput.Select name="defaultOffVariation" items={flagBooleanRules} />
                      </Layout.Horizontal>
                    </Container>
                  </Layout.Vertical>
                </Container>
              </Layout.Vertical>
            </Container>

            <Layout.Horizontal spacing="small" margin={{ top: 'large' }} width="100%">
              <Button text={i18n.back} onClick={onClickBack} />
              <Button
                type="submit"
                intent="primary"
                text={i18n.varSettingsFlag.saveAndClose}
                disabled={isLoadingCreateFeatureFlag}
                loading={isLoadingCreateFeatureFlag}
              />
              <FlexExpander />
              {/* <Button
                type="button"
                text={i18n.varSettingsFlag.testFlagOption}
                rightIcon="chevron-right"
                minimal
                className={css.testFfBtn}
                onClick={() => {
                  nextStep?.({ ...prevStepData })
                }}
              /> */}
            </Layout.Horizontal>
          </Container>
        </Form>
      )}
    </Formik>
  )
}

export default FlagElemBoolean
