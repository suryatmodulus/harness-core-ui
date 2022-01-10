import React from 'react'
import {
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  useModalHook,
  Text,
  Button,
  Label
} from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import JsonSelector from '@cv/components/JsonSelector/JsonSelector'
import { NoRecordForm, InputWithDynamicModalForJsonProps, DialogProps } from './InputWithDynamicModalForJson.types'
import { formatJSONPath, validate } from './InputWithDynamicModalForJson.utils'
import css from './InputWithDynamicModalForJson.module.scss'

export function InputWithDynamicModalForJson(props: InputWithDynamicModalForJsonProps): JSX.Element {
  const {
    onChange,
    isQueryExecuted,
    isDisabled,
    sampleRecord,
    inputLabel,
    inputName,
    noRecordModalHeader,
    noRecordInputLabel,
    recordsModalHeader,
    showExactJsonPath,
    fieldValue
  } = props
  const { getString } = useStrings()

  const handleOnClickAddField = (): void => {
    if (sampleRecord && isQueryExecuted) {
      openModalForSelectingField()
    } else {
      openModalforEnteringField()
    }
  }

  const [openModalforEnteringField, hideModalForEnteringField] = useModalHook(
    () => (
      <Dialog {...DialogProps} onClose={hideModalForEnteringField}>
        <Formik<NoRecordForm>
          initialValues={{ name: '' }}
          validate={value => validate(value, getString)}
          formName="noRecordForm"
          onSubmit={value => {
            hideModalForEnteringField()
            onChange(inputName, value.name)
          }}
        >
          <FormikForm>
            <Container margin="medium">
              <Text font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'large' }}>
                {noRecordModalHeader}
              </Text>
              <FormInput.Text name="name" label={noRecordInputLabel} />
              <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'large' }}>
                <Button text={getString('submit')} type="submit" intent="primary" />
                <Button text={getString('cancel')} onClick={hideModalForEnteringField} />
              </Layout.Horizontal>
            </Container>
          </FormikForm>
        </Formik>
      </Dialog>
    ),
    []
  )

  const [openModalForSelectingField, hideModalForSelectingField] = useModalHook(
    () => (
      <Dialog {...DialogProps} onClose={hideModalForSelectingField}>
        <Container margin="medium">
          <Text font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'large' }}>
            {recordsModalHeader}
          </Text>
          <JsonSelector
            json={sampleRecord as Record<string, any>}
            onPathSelect={(pathSelected: string) => {
              hideModalForSelectingField()
              const selectedValue = showExactJsonPath ? formatJSONPath(pathSelected) : pathSelected
              onChange(inputName, selectedValue)
            }}
          />
        </Container>
      </Dialog>
    ),
    [sampleRecord]
  )

  return (
    <FormInput.CustomRender
      name={inputName}
      render={() => {
        return (
          <Layout.Vertical spacing={'small'} style={{ marginBottom: 'var(--spacing-medium)' }}>
            <Label style={{ fontSize: 13, fontWeight: 'normal' }}>{inputLabel}</Label>
            <Button
              minimal
              className={css.container}
              withoutCurrentColor={true}
              rightIcon="plus"
              iconProps={{ size: 14 }}
              disabled={isDisabled}
              onClick={handleOnClickAddField}
            >
              {fieldValue ? fieldValue : recordsModalHeader}
            </Button>
          </Layout.Vertical>
        )
      }}
    />
  )
}
