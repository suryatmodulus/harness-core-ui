import React, { useCallback, useMemo } from 'react'
import { SelectOption, useToaster, Utils } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'

import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import { HarnessServiceAsFormField } from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import { useGetAllJourneys, useSaveUserJourney } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { LIST_USER_JOURNEYS_OFFSET, LIST_USER_JOURNEYS_PAGESIZE } from '@cv/pages/slos/CVSLOsListingPage.constants'
import type { SLONameProps } from './SLOName.types'
import { getUserJourneysData } from './SLOName.utils'
import css from './SLOName.module.scss'

export default function SLOName(props: SLONameProps): JSX.Element {
  const {
    formikProps: { values, setFieldValue },
    formikProps,
    children,
    identifier
  } = props
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const userJourneyLabel = getString('cv.slos.userJourney')

  const {
    data: userJourneysData,
    refetch: fetchUserJourneys,
    loading: userJourneysLoading
  } = useGetAllJourneys({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId,
      offset: LIST_USER_JOURNEYS_OFFSET,
      pageSize: LIST_USER_JOURNEYS_PAGESIZE
    }
  })

  const { mutate: createUserJourney } = useSaveUserJourney({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId
    }
  })

  const handleCreateUserJourney = useCallback(async newOption => {
    if (newOption?.identifier && newOption?.name) {
      try {
        // creating new user journey
        await createUserJourney({ name: newOption.name, identifier: newOption.identifier })

        // listing all user journeys
        await fetchUserJourneys()

        // selecting the current user journey
        setFieldValue('userJourneyRef', newOption.identifier)

        clear()
        showSuccess(getString('cv.slos.userJourneyCreated'))
      } catch (e) {
        showError(getErrorMessage(e))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keys = useMemo(() => [Utils.randomId()], [values.userJourneyRef])

  const userJourneysOptions = useMemo((): SelectOption[] => {
    return getUserJourneysData(userJourneysData)
  }, [userJourneysData])

  return (
    <>
      <CardWithOuterTitle className={css.sloNameContainer}>
        <NameIdDescriptionTags
          formikProps={formikProps}
          className={css.nameTagsDescription}
          identifierProps={{
            inputLabel: getString('cv.slos.sloName'),
            isIdentifierEditable: !identifier
          }}
        />
        <HarnessServiceAsFormField
          key={keys[0]}
          customRenderProps={{
            name: 'userJourneyRef',
            label: userJourneyLabel
          }}
          serviceProps={{
            className: css.dropdown,
            item: userJourneysOptions.find(item => item?.value === values.userJourneyRef),
            options: userJourneysOptions,
            onSelect: selectedUserJourney => setFieldValue('userJourneyRef', selectedUserJourney.value),
            modalTitle: userJourneyLabel,
            placeholder: getString('cv.slos.userJourneyPlaceholder'),
            skipServiceCreateOrUpdate: true,
            onNewCreated: newOption => handleCreateUserJourney(newOption),
            loading: userJourneysLoading,
            name: userJourneyLabel
          }}
        />
      </CardWithOuterTitle>
      {children}
    </>
  )
}
