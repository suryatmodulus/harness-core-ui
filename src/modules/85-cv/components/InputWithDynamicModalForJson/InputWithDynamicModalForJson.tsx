import React from 'react'
import { Container, Formik, FormikForm, FormInput, Layout, useModalHook, Text } from '@wings-software/uicore'
import { Button, Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import JsonSelector from '@cv/components/JsonSelector/JsonSelector'
import { NoRecordForm, InputWithDynamicModalForJsonProps, DialogProps } from './types'
import { validate } from './utils'
import { InputIcon } from './components/InputIcon'

export function InputWithDynamicModalForJson(props: InputWithDynamicModalForJsonProps): JSX.Element {
  const {
    onChange,
    isQueryExecuted,
    isDisabled,
    sampleRecord,
    inputLabel,
    inputName,
    inputPlaceholder,
    noRecordModalHeader,
    noRecordInputLabel,
    recordsModalHeader
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
            onPathSelect={(value: string) => {
              hideModalForSelectingField()
              onChange(inputName, value)
            }}
          />
        </Container>
      </Dialog>
    ),
    [sampleRecord]
  )

  return (
    <FormInput.Text
      disabled={true}
      name={inputName}
      label={inputLabel}
      placeholder={inputPlaceholder}
      inputGroup={{
        rightElement: <InputIcon isDisabled={isDisabled} onClick={handleOnClickAddField} />
      }}
    />
  )
}
