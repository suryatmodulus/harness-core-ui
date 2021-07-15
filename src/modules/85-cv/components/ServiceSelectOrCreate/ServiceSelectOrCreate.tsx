import React, { useMemo } from 'react'
import { Formik } from 'formik'
import { Container, Text, Select, SelectOption, useModalHook, FormikForm, Layout, Button } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { AddDescriptionAndTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useCreateService, ServiceResponseDTO, CreateServiceQueryParams } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

export interface ServiceSelectOrCreateProps {
  item?: SelectOption
  options: Array<SelectOption>
  onSelect(value: SelectOption): void
  className?: string
  onNewCreated(value: ServiceResponseDTO): void
  disabled?: boolean
}

const ADD_NEW_VALUE = '@@add_new'

export function generateOptions(response?: ServiceResponseDTO[]): SelectOption[] {
  return response
    ? (response
        .filter(entity => entity && entity.identifier && entity.name)
        .map(entity => ({ value: entity.identifier, label: entity.name })) as SelectOption[])
    : []
}

export const ServiceSelectOrCreate: React.FC<ServiceSelectOrCreateProps> = props => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { mutate: createService, loading } = useCreateService({
    queryParams: { accountId } as CreateServiceQueryParams
  })

  const selectOptions = useMemo(
    () => [
      {
        label: '+ Add New',
        value: ADD_NEW_VALUE
      },
      ...props.options
    ],
    [props.options]
  )

  const onSubmit = async (values: any): Promise<void> => {
    if (loading) {
      return
    }
    const res = await createService({
      name: values.name,
      identifier: values.identifier,
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string
    })
    if (res.status === 'SUCCESS') {
      props.onNewCreated(res.data!)
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
          tags: []
        }}
        validationSchema={Yup.object().shape({
          name: NameSchema(),
          identifier: IdentifierSchema()
        })}
        onSubmit={onSubmit}
      >
        {() => (
          <FormikForm>
            <Container margin="medium">
              <Text font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'large' }}>
                {getString('newService')}
              </Text>
              <AddDescriptionAndTagsWithIdentifier identifierProps={{ inputLabel: 'Name' }} />

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
      props.onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <Select
        value={props.item}
        className={props.className}
        disabled={props.disabled}
        items={selectOptions}
        inputProps={{ placeholder: getString('cv.selectCreateService') }}
        onChange={onSelectChange}
      />
    </Container>
  )
}
