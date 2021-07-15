import React, { useMemo } from 'react'
import { Formik } from 'formik'
import { Container, Text, Select, SelectOption, useModalHook, FormikForm, Layout, Button } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import * as Yup from 'yup'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { AddDescriptionAndTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import { EnvironmentResponseDTO, useCreateEnvironment, CreateEnvironmentQueryParams } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { EnvironmentTypes } from '../../utils'

export interface EnvironmentSelectProps {
  item?: SelectOption
  options: Array<SelectOption>
  onSelect(value: SelectOption): void
  disabled?: boolean
  className?: string
  onNewCreated(value: EnvironmentResponseDTO): void
}

const ADD_NEW_VALUE = '@@add_new'

export function generateOptions(response?: EnvironmentResponseDTO[]): SelectOption[] {
  return response
    ? (response
        .filter(entity => entity && entity.identifier && entity.name)
        .map(entity => ({ value: entity.identifier, label: entity.name })) as SelectOption[])
    : []
}

export function EnvironmentSelect({
  item,
  options,
  onSelect,
  disabled,
  onNewCreated,
  className
}: EnvironmentSelectProps) {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { mutate: createEnvironment, loading } = useCreateEnvironment({
    queryParams: { accountId } as CreateEnvironmentQueryParams
  })
  const selectOptions = useMemo(
    () => [
      {
        label: '+ Add New',
        value: ADD_NEW_VALUE
      },
      ...options
    ],
    [options]
  )

  const onSubmit = async (values: any): Promise<void> => {
    if (loading) {
      return
    }
    const res = await createEnvironment({
      name: values.name,
      identifier: values.identifier,
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string,
      type: values.environmentType
    })
    if (res.status === 'SUCCESS') {
      onNewCreated(res.data!)
    }
  }

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog
      isOpen
      usePortal
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      enforceFocus={false}
      onClose={hideModal}
      style={{ width: 600, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }}
    >
      <Formik
        initialValues={{
          name: '',
          description: '',
          identifier: '',
          tags: [],
          environmentType: EnvironmentTypes[0].value
        }}
        validationSchema={Yup.object().shape({
          name: NameSchema(),
          identifier: IdentifierSchema()
        })}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <FormikForm>
            <Container margin="medium">
              <Text font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'large' }}>
                {getString('newEnvironment')}
              </Text>
              <Text font={{ size: 'small' }} margin={{ bottom: 'xxxlarge' }}>
                {getString('cv.monitoringSources.appD.envDescription')}
              </Text>
              <AddDescriptionAndTagsWithIdentifier identifierProps={{ inputLabel: 'Name' }} />
              <Layout.Vertical spacing="large" margin={{ top: 'large' }}>
                <Text>{getString('envType')}</Text>
                <Layout.Horizontal spacing="medium">
                  {EnvironmentTypes.map((type: any, index: number) => {
                    return (
                      <CVSelectionCard
                        isSelected={values.environmentType === type.value}
                        key={index}
                        isLarge
                        cardLabel={type.label}
                        iconProps={{
                          name: 'service-appdynamics',
                          size: 30
                        }}
                        onCardSelect={selected => selected && setFieldValue('environmentType', type.value)}
                      />
                    )
                  })}
                </Layout.Horizontal>
              </Layout.Vertical>
              <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'large' }}>
                <Button text="Submit" type="submit" intent="primary" />
                <Button text="Cancel" onClick={hideModal} />
              </Layout.Horizontal>
            </Container>
          </FormikForm>
        )}
      </Formik>
    </Dialog>
  ))

  const onSelectChange = (val: SelectOption) => {
    if (val.value === ADD_NEW_VALUE) {
      openModal()
    } else {
      onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <Select
        value={item}
        className={className}
        disabled={disabled}
        items={selectOptions}
        inputProps={{ placeholder: getString('cv.selectOrCreateEnv') }}
        onChange={onSelectChange}
      />
    </Container>
  )
}
