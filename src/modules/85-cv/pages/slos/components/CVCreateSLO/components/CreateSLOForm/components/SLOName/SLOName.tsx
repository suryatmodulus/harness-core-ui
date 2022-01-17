/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { Card, Layout, Container, SelectOption, useToaster, Utils } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import { HarnessServiceAsFormField } from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import { useGetAllJourneys, useSaveUserJourney } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { LIST_USER_JOURNEYS_OFFSET, LIST_USER_JOURNEYS_PAGESIZE } from '@cv/pages/slos/CVSLOsListingPage.constants'
import { SLONameProps, SLOFormFields } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { getUserJourneyOptions } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const SLOName: React.FC<SLONameProps> = ({ children, formikProps, identifier }) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const TEXT_USER_JOURNEY = getString('cv.slos.userJourney')
  const { userJourneyRef } = formikProps.values

  const {
    data: userJourneysData,
    refetch: fetchUserJourneys,
    loading: userJourneysLoading
  } = useGetAllJourneys({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      offset: LIST_USER_JOURNEYS_OFFSET,
      pageSize: LIST_USER_JOURNEYS_PAGESIZE
    }
  })

  const { loading: saveUserJourneyLoading, mutate: createUserJourney } = useSaveUserJourney({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const handleCreateUserJourney = useCallback(async newOption => {
    if (newOption?.identifier && newOption?.name) {
      try {
        // creating new user journey
        await createUserJourney({ name: newOption.name, identifier: newOption.identifier })

        // selecting the current user journey
        formikProps.setFieldValue('userJourneyRef', newOption.identifier)

        // listing all user journeys
        await fetchUserJourneys()

        showSuccess(getString('cv.slos.userJourneyCreated'))
      } catch (e) {
        showError(getErrorMessage(e))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const key = useMemo(() => Utils.randomId(), [userJourneyRef])

  const userJourneyOptions = useMemo(
    (): SelectOption[] => getUserJourneyOptions(userJourneysData?.data?.content),
    [userJourneysData?.data?.content]
  )

  const activeUserJourney = useMemo(
    () => userJourneyOptions.find(userJourney => userJourney.value === userJourneyRef),
    [userJourneyOptions, userJourneyRef]
  )

  return (
    <>
      <Card className={css.card}>
        <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Container width={'50%'}>
            <Layout.Vertical width={350}>
              <NameIdDescriptionTags
                formikProps={formikProps}
                identifierProps={{
                  inputLabel: getString('cv.slos.sloName'),
                  inputName: SLOFormFields.NAME,
                  isIdentifierEditable: !identifier
                }}
              />
              <HarnessServiceAsFormField
                key={key}
                customRenderProps={{
                  name: SLOFormFields.USER_JOURNEY_REF,
                  label: TEXT_USER_JOURNEY
                }}
                serviceProps={{
                  item: activeUserJourney,
                  options: userJourneyOptions,
                  onSelect: selectedUserJourney =>
                    formikProps.setFieldValue(SLOFormFields.USER_JOURNEY_REF, selectedUserJourney.value),
                  modalTitle: TEXT_USER_JOURNEY,
                  placeholder: getString('cv.slos.userJourneyPlaceholder'),
                  skipServiceCreateOrUpdate: true,
                  onNewCreated: newOption => handleCreateUserJourney(newOption),
                  loading: userJourneysLoading,
                  name: TEXT_USER_JOURNEY
                }}
                customLoading={saveUserJourneyLoading}
              />
            </Layout.Vertical>
          </Container>
        </Layout.Horizontal>
      </Card>
      {children}
    </>
  )
}

export default SLOName
