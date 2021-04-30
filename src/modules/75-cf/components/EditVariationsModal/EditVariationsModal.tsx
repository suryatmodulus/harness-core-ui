import React, { useState } from 'react'
import { Dialog, Intent } from '@blueprintjs/core'
import * as yup from 'yup'
import { isEqual, zip, orderBy, clone } from 'lodash-es'
import {
  Button,
  useModalHook,
  Text,
  ButtonProps,
  Container,
  Layout,
  FlexExpander,
  Icon,
  Formik,
  FormikForm as Form,
  FormInput,
  Color,
  SelectOption
} from '@wings-software/uicore'
import { getErrorMessage, useFeatureFlagTypeToStringMapping, useValidateVariationValues } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { FormikEffect, FormikEffectProps } from '@common/components/FormikEffect/FormikEffect'
import { Feature, PatchFeatureQueryParams, usePatchFeature, Variation } from 'services/cf'
import patch from '../../utils/instructions'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'

export interface EditVariationsModalProps extends Omit<ButtonProps, 'onClick' | 'onSubmit'> {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string

  feature: Feature

  submitButtonTitle?: string
  cancelButtonTitle?: string

  onSuccess: () => void
}

export const EditVariationsModal: React.FC<EditVariationsModalProps> = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  feature,
  submitButtonTitle,
  cancelButtonTitle,
  onSuccess,
  ...props
}) => {
  const ModalComponent: React.FC = () => {
    const { getString } = useStrings()
    const validateVariationValues = useValidateVariationValues()
    const { showError, clear } = useToaster()
    const [loading, setLoading] = useState(false)
    const initialValues = {
      defaultOnVariation: feature.defaultOnVariation,
      defaultOffVariation: feature.defaultOffVariation,
      variations: clone(feature.variations),
      defaultOnAppliedToCurrentEnvironment: false,
      defaultOffAppliedToCurrentEnvironment: false
    }
    const [defaultRules, setDefaultRules] = useState<SelectOption[]>(
      initialValues.variations.map(({ identifier, name }) => ({ label: name as string, value: identifier }))
    )
    const typeToStringMapping = useFeatureFlagTypeToStringMapping()
    const { mutate: submitPatch } = usePatchFeature({
      identifier: feature.identifier as string,
      queryParams: {
        project: feature.project as string,
        environment: feature.envProperties?.environment as string,
        account: accountId,
        accountIdentifier: accountId,
        org: orgIdentifier
      } as PatchFeatureQueryParams
    })
    const onFormikEffect: FormikEffectProps['onChange'] = ({ prevValues, nextValues }) => {
      const { variations } = nextValues

      if (!isEqual(variations, prevValues.variations)) {
        setDefaultRules(
          variations
            .filter(
              ({ identifier, name, value }: Variation) =>
                !!(identifier || '').trim() && !!(name || '').trim() && !!(value || '').trim()
            )
            .map(({ identifier, name }: Variation) => ({ label: name, value: identifier }))
        )
      }
    }
    const isBooleanFlag = feature.kind === 'boolean'
    const onSubmit = (values: typeof initialValues): void => {
      const { defaultOffVariation, defaultOnVariation, variations } = values

      if (!isEqual(variations, initialValues.variations) && initialValues.variations.length > variations.length) {
        const _variations = orderBy(variations, 'name', 'asc')
        const initialVariations = orderBy(initialValues.variations, 'name', 'asc')
        const _missing = initialVariations.map(initial => {
          const isVariantAvailable = _variations.filter(el => el.identifier === initial.identifier)
          if (isVariantAvailable && isVariantAvailable.length === 0) {
            return initial?.identifier
          }
        })

        patch.feature.addAllInstructions(_missing.filter(x => x !== undefined).map(patch.creators.deleteVariant))
      }
      if (!isEqual(variations, initialValues.variations) && initialValues.variations.length < variations.length) {
        patch.feature.addAllInstructions(
          zip(variations, initialValues.variations)
            .filter(([cur, prev]) => !isEqual(cur, prev))
            .map(tuple => tuple[0] as NonNullable<Variation>)
            .map(patch.creators.addVariation)
        )
      }
      if (!isEqual(variations, initialValues.variations) && initialValues.variations.length === variations.length) {
        patch.feature.addAllInstructions(
          zip(variations, initialValues.variations)
            .filter(([cur, prev]) => !isEqual(cur, prev))
            .map(tuple => tuple[0] as NonNullable<Variation>)
            .map(patch.creators.updateVariation)
        )
      }
      if (!isEqual(defaultOffVariation, initialValues.defaultOffVariation)) {
        patch.feature.addInstruction(patch.creators.setDefaultOffVariation(defaultOffVariation as string))
      }
      if (!isEqual(defaultOnVariation, initialValues.defaultOnVariation)) {
        patch.feature.addInstruction(patch.creators.setDefaultOnVariation(defaultOnVariation as string))
      }

      clear()
      setLoading(true)

      patch.feature.onPatchAvailable(data => {
        submitPatch(data)
          .then(() => {
            patch.feature.reset()
            setLoading(false)
            hideModal()
            onSuccess()
          })
          .catch(error => {
            setLoading(false)
            showError(getErrorMessage(error), 0)
            patch.feature.reset()
          })
      })
    }

    return (
      <Dialog
        isOpen
        onClose={hideModal}
        title={
          <Text
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--black)',
              lineHeight: '20px',
              padding: 'var(--spacing-large) 0 0 var(--spacing-small)'
            }}
          >
            {getString('cf.editVariation.title')}
            {feature.kind !== FlagTypeVariations.booleanFlag && (
              <Text color={Color.GREY_400} margin={{ top: 'xsmall' }}>
                {getString('cf.editVariation.subTitle', {
                  type: typeToStringMapping[feature.kind] || '',
                  count: feature.variations.length
                })}
              </Text>
            )}
          </Text>
        }
        style={{ width: 800, height: 560 }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={yup.object().shape({
            variations: yup.array().of(
              yup.object().shape({
                name: yup.string().trim().required(getString('cf.creationModal.nameIsRequired')),
                identifier: yup.string().trim().required(getString('cf.creationModal.idIsRequired')),
                value: yup.string().trim().required(getString('cf.creationModal.valueIsRequired'))
              })
            )
          })}
          validate={(values: typeof initialValues) => {
            return validateVariationValues(values.variations, feature.kind)
          }}
          validateOnChange
          validateOnBlur
          onSubmit={onSubmit}
        >
          {formikProps => (
            <Form>
              <FormikEffect onChange={onFormikEffect} formik={formikProps} />
              <Container padding="xlarge">
                <Container height={390} style={{ overflow: 'auto' }} padding="xsmall">
                  {formikProps.values?.variations?.map((_: Variation, index: number) => (
                    <Layout.Horizontal
                      key={`flagElem-${index}`}
                      style={{
                        boxShadow: '0px 0px 1px rgb(40 41 61 / 4%), 0px 2px 4px rgb(96 97 112 / 16%)',
                        borderRadius: '4px',
                        padding: 'var(--spacing-small) var(--spacing-small) 0 var(--spacing-medium)',
                        marginBottom: 'var(--spacing-medium)'
                      }}
                    >
                      <Container style={{ width: 220 }}>
                        <FormInput.InputWithIdentifier
                          inputName={`variations.${index}.name`}
                          idName={`variations.${index}.identifier`}
                          inputLabel={getString('name')}
                          isIdentifierEditable={
                            formikProps.values?.variations[index].identifier !== feature.variations[index]?.identifier
                          }
                          inputGroupProps={{ inputGroup: { autoFocus: true } }}
                        />
                      </Container>
                      <Container width={20} />
                      <FormInput.Text
                        name={`variations.${index}.value`}
                        label={getString('valueLabel')}
                        style={{ width: 220 }}
                        disabled={isBooleanFlag}
                      />
                      <Container width={20} />
                      <FormInput.Text
                        name={`variations.${index}.description`}
                        label={getString('description')}
                        style={{ width: 220 }}
                      />
                      <Container width={5} />
                      <Container flex={{ align: 'center-center' }} height={70}>
                        <Button
                          minimal
                          icon="trash"
                          style={{ visibility: formikProps.values?.variations.length === 2 ? 'hidden' : 'visible' }}
                          onClick={() => {
                            const _variations = clone(formikProps.values?.variations)
                            _variations.splice(index, 1)
                            formikProps.setFieldValue('variations', _variations)
                          }}
                        />
                      </Container>
                    </Layout.Horizontal>
                  ))}
                  {!isBooleanFlag && (
                    <Container style={{ marginTop: '-10px' }}>
                      <Button
                        minimal
                        intent="primary"
                        icon="small-plus"
                        text={getString('cf.shared.variation')}
                        style={{ paddingLeft: 0 }}
                        onClick={() => {
                          formikProps.setFieldValue('variations', [
                            ...formikProps.values?.variations,
                            { identifier: '', name: '', value: '', description: '' }
                          ])
                        }}
                      />
                    </Container>
                  )}
                  <Container margin={{ top: 'xlarge', bottom: 'large' }}>
                    <Text
                      color={Color.BLACK}
                      inline
                      tooltip={getString('cf.creationModal.defaultRulesTooltip')}
                      rightIconProps={{ size: 10, color: Color.BLUE_500 }}
                      rightIcon="info-sign"
                      style={{ fontSize: '14px', fontWeight: 500 }}
                    >
                      {getString('cf.creationModal.defaultRules')}
                    </Text>
                    <Text style={{ color: '#9293AB', lineHeight: '40px' }}>
                      {getString('cf.editVariation.envNote')}
                    </Text>
                    <Container margin={{ top: 'medium' }}>
                      <Layout.Horizontal>
                        <Text width={160} flex style={{ alignItems: 'center' }}>
                          {getString('cf.creationModal.flagOn')}
                        </Text>
                        <FormInput.Select name="defaultOnVariation" items={defaultRules} style={{ marginBottom: 0 }} />
                        <Container
                          flex
                          style={{ alignItems: 'center', transform: 'translateX(45px)', display: 'none' }}
                        >
                          <FormInput.CheckBox
                            name="defaultOnAppliedToCurrentEnvironment"
                            label={getString('cf.editVariation.applyToExistingEnvironments')}
                            style={{ marginBottom: 0 }}
                          />
                        </Container>
                      </Layout.Horizontal>
                      <Container height={10} />
                      <Layout.Horizontal>
                        <Text width={160} flex style={{ alignItems: 'center' }}>
                          {getString('cf.creationModal.flagOff')}
                        </Text>
                        <FormInput.Select name="defaultOffVariation" items={defaultRules} style={{ marginBottom: 0 }} />
                        <Container
                          flex
                          style={{ alignItems: 'center', transform: 'translateX(45px)', display: 'none' }}
                        >
                          <FormInput.CheckBox
                            name="defaultOffAppliedToCurrentEnvironment"
                            label={getString('cf.editVariation.applyToExistingEnvironments')}
                            style={{ marginBottom: 0 }}
                          />
                        </Container>
                      </Layout.Horizontal>
                    </Container>
                  </Container>
                </Container>

                <Layout.Horizontal
                  height={32}
                  spacing="small"
                  style={{ alignItems: 'center' }}
                  padding={{ top: 'xxlarge' }}
                >
                  <Button
                    text={submitButtonTitle || getString('save')}
                    intent={Intent.PRIMARY}
                    type="submit"
                    disabled={isEqual(initialValues, formikProps.values) || loading}
                  />
                  <Button text={cancelButtonTitle || getString('cancel')} minimal onClick={hideModal} />
                  <FlexExpander />
                  {loading && <Icon intent={Intent.PRIMARY} name="spinner" size={16} />}
                </Layout.Horizontal>
              </Container>
            </Form>
          )}
        </Formik>
      </Dialog>
    )
  }

  const [openModal, hideModal] = useModalHook(ModalComponent, [feature])

  return <Button onClick={openModal} {...props} />
}
