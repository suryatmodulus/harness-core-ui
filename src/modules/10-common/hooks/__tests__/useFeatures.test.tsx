/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { FeaturesProvider } from 'framework/featureStore/FeaturesContext'
import {
  useGetEnabledFeatureRestrictionDetailByAccountId,
  useGetFeatureRestrictionDetail,
  useGetAllFeatureRestrictionMetadata
} from 'services/cd-ng'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { Editions } from '@common/constants/SubscriptionTypes'
import {
  useFeature,
  useFeatures,
  useFeatureModule,
  useFeatureRequiredPlans,
  useGetFirstDisabledFeature
} from '../useFeatures'
import mocks from './featuresMocks.json'
import metadata from './featureMetaData.json'

const getFeatureListMock = jest.fn()
const getFeatureDetailsMock = jest.fn()
const featureListResponse = mocks.featureList
const featureDetailEnabledResponse = mocks['featureDetail-enabled']
const featureDetailDisabledResponse = mocks['featureDetail-disabled']
const featureMetadataResponse = metadata.featureMetadata

jest.mock('services/cd-ng')
const useGetEnabledFeatureListMock = useGetEnabledFeatureRestrictionDetailByAccountId as jest.MockedFunction<any>
const useGetFeatureDetailsMock = useGetFeatureRestrictionDetail as jest.MockedFunction<any>
const useGetAllFeatureRestrictionMetadataMock = useGetAllFeatureRestrictionMetadata as jest.MockedFunction<any>

let defaultLicenseStoreValues = {}

beforeEach(() => {
  jest.clearAllMocks()
  useGetEnabledFeatureListMock.mockImplementation(() => {
    return {
      refetch: getFeatureListMock,
      data: featureListResponse
    }
  })
  useGetFeatureDetailsMock.mockImplementation(() => {
    return {
      mutate: getFeatureDetailsMock.mockReturnValue(featureDetailEnabledResponse)
    }
  })
  useGetAllFeatureRestrictionMetadataMock.mockImplementation(() => {
    return {
      data: featureMetadataResponse
    }
  })
  defaultLicenseStoreValues = {
    licenseInformation: {
      CD: {
        // BUILDS, AVAILABILITY, Enabled
        edition: Editions.ENTERPRISE
      },
      CI: {
        edition: Editions.TEAM
      },
      CF: {
        // CUSTOM_ROLES, RATE_LIMIT
        edition: Editions.FREE
      },
      CCM: {
        edition: Editions.ENTERPRISE
      }
      // CUSTOM_RESOURCE_GROUPS, CORE, AVAILABILITY, disabled
    }
  }
})

describe('useFeatures', () => {
  test('feature call should fetch from cache when skipCondition is true', async () => {
    useGetEnabledFeatureListMock.mockImplementation(() => {
      return {
        refetch: getFeatureListMock
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.BUILDS
          },
          options: {
            skipCondition: () => true
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).not.toHaveBeenCalled())
    expect(getFeatureDetailsMock).not.toHaveBeenCalled()
    expect((result as any).current.enabled).toBe(false)
  })

  test('useFeature should get highest edition from all module license when moduleType is CORE: disabled feature', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.CUSTOM_RESOURCE_GROUPS
          },
          options: {
            skipCache: true
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).toHaveBeenCalledTimes(1))
    expect(getFeatureDetailsMock).not.toHaveBeenCalled()
    expect((result as any).current.enabled).toBe(false)
  })

  test('feature call should fetch from apiCall when skipCache is true: enabled feature', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.BUILDS
          },
          options: {
            skipCache: true
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).toHaveBeenCalledTimes(1))
    expect(getFeatureDetailsMock).not.toHaveBeenCalled()
    expect((result as any).current.enabled).toBe(true)
  })

  test('useFeature should make the get feature detail call if restrictionType is NOT AVAILABILITY: enabled feature', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.CUSTOM_ROLES
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).not.toHaveBeenCalled())
    expect(getFeatureDetailsMock).toHaveBeenCalledTimes(1)
    const resolvedValue = await result.current
    expect(resolvedValue.enabled).toBe(true)
  })

  test('useFeature should make the get feature detail call if restrictionType is NOT AVAILABILITY: disabled feature', async () => {
    useGetFeatureDetailsMock.mockImplementation(() => {
      return {
        mutate: getFeatureDetailsMock.mockReturnValue(featureDetailDisabledResponse)
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.CUSTOM_ROLES
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).not.toHaveBeenCalled())
    expect(getFeatureDetailsMock).toHaveBeenCalledTimes(1)
    const resolvedValue = await result.current
    expect(resolvedValue.enabled).toBe(false)
  })

  test('useFeature should return true if exception occurs getting enabled feature list', async () => {
    useGetEnabledFeatureListMock.mockImplementation(() => {
      return {
        refetch: getFeatureListMock,
        data: null,
        error: new Error('api call failed')
      }
    })

    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.BUILDS
          }
        }),
      { wrapper }
    )
    expect((result as any).current.enabled).toBe(true)
  })

  test('useFeature should return true  if exception occurs getting feature detail', async () => {
    useGetFeatureDetailsMock.mockImplementation(() => {
      return {
        mutate: getFeatureDetailsMock.mockRejectedValue('api call failed')
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeature({
          featureRequest: {
            featureName: FeatureIdentifier.CUSTOM_ROLES
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureDetailsMock).toHaveBeenCalledTimes(1))
    expect(getFeatureListMock).not.toHaveBeenCalled()
    const resolvedValue = await result.current
    expect(resolvedValue.enabled).toBe(true)
  })

  test('list inquiry should return a list with feature returns', async () => {
    useGetFeatureDetailsMock.mockImplementation(() => {
      return {
        mutate: getFeatureDetailsMock.mockReturnValue(featureDetailDisabledResponse)
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useFeatures({
          featuresRequest: {
            featureNames: [
              FeatureIdentifier.CUSTOM_ROLES,
              FeatureIdentifier.BUILDS,
              FeatureIdentifier.CUSTOM_RESOURCE_GROUPS
            ]
          },
          options: {
            skipCache: true
          }
        }),
      { wrapper }
    )

    await waitFor(() => expect(getFeatureListMock).toHaveBeenCalledTimes(1))
    expect(getFeatureDetailsMock).toHaveBeenCalledTimes(1)
    const resolvedValue = await result.current
    expect(resolvedValue.features.size).toBe(3)
    expect(resolvedValue.features.get(FeatureIdentifier.CUSTOM_ROLES)?.enabled).toBeFalsy()
    expect(resolvedValue.features.get(FeatureIdentifier.BUILDS)?.enabled).toBeTruthy()
    expect(resolvedValue.features.get(FeatureIdentifier.CUSTOM_RESOURCE_GROUPS)?.enabled).toBeFalsy()
  })

  test('useFeatureModule', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(() => useFeatureModule(FeatureIdentifier.CUSTOM_ROLES), { wrapper })
    expect(result.current).toBe('CF')
  })

  test('useFeatureRequiredPlans', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )
    const { result } = renderHook(() => useFeatureRequiredPlans(FeatureIdentifier.CUSTOM_ROLES), { wrapper })
    expect(result.current).toStrictEqual(['Team', 'Enterprise'])
  })

  test('useGetFirstDisabledFeature', async () => {
    useGetFeatureDetailsMock.mockImplementation(() => {
      return {
        mutate: getFeatureDetailsMock.mockReturnValue(featureDetailDisabledResponse)
      }
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'dummy' })}
        pathParams={{ accountId: 'dummy' }}
        defaultLicenseStoreValues={defaultLicenseStoreValues}
      >
        <FeaturesProvider>{children}</FeaturesProvider>
      </TestWrapper>
    )

    const featuresRequest = {
      featureNames: [FeatureIdentifier.CUSTOM_ROLES, FeatureIdentifier.BUILDS, FeatureIdentifier.CUSTOM_RESOURCE_GROUPS]
    }
    const { result } = renderHook(() => useGetFirstDisabledFeature(featuresRequest), { wrapper })

    const resolvedValue = await result.current
    expect(resolvedValue.disabledFeatureName).toBe(FeatureIdentifier.CUSTOM_ROLES)
    expect(resolvedValue.featureEnabled).toBeFalsy()
  })
})
