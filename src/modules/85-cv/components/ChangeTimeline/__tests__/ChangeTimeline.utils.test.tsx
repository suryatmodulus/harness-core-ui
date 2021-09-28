import { TimePeriodEnum } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import {
  changeTimelineResponse,
  singleDeploymentMarker,
  twoDeploymentMarker,
  multipleDeploymentMarker,
  datetimeMock,
  startTimeToEndTimeMock,
  mockDeploymentPayload,
  mockIncidentPayload,
  mockInfraPayload
} from './ChangeTimeline.mock'
import {
  createChangeInfoCardData,
  createMarkerSymbol,
  getStartAndEndTime,
  createTimelineSeriesData
} from '../ChangeTimeline.utils'
import { ChangeSourceTypes } from '../ChangeTimeline.constants'
import { mockTimeData } from './ChangeTimeline.mock'
import { generateMockInfoCardData } from './ChangeTimelineTest.utils'

describe('Verify Util funcitons', () => {
  test('Should create Change InfoCard Data', () => {
    const singleValue = { startTime: 1632009431325, endTime: 1632021768825, count: 1 }
    const multipleValue = { startTime: 1632009431325, endTime: 1632157481325, count: 9 }
    const { Deployment, Infrastructure, Alert } = changeTimelineResponse.resource.categoryTimeline
    const changeInfoCardDataSingleValue = createChangeInfoCardData(
      singleValue.startTime,
      singleValue.endTime,
      Deployment,
      Infrastructure,
      Alert
    )
    expect(changeInfoCardDataSingleValue).toEqual(generateMockInfoCardData(singleValue.count))
    const changeInfoCardDataMultipleValue = createChangeInfoCardData(
      multipleValue.startTime,
      multipleValue.endTime,
      Deployment,
      Infrastructure,
      Alert
    )
    expect(changeInfoCardDataMultipleValue).toEqual(generateMockInfoCardData(multipleValue.count))
  })

  test('should create marker object using createMarkerSymbol', () => {
    const deploymentSingleMarker = createMarkerSymbol(
      { count: 1, startTime: 0, endTime: 0 },
      ChangeSourceTypes.Deployments
    )
    const deploymentTwoMarker = createMarkerSymbol(
      { count: 2, startTime: 0, endTime: 0 },
      ChangeSourceTypes.Deployments
    )
    const deploymentMultipleMarker = createMarkerSymbol(
      { count: 4, startTime: 0, endTime: 0 },
      ChangeSourceTypes.Deployments
    )
    expect(deploymentSingleMarker).toEqual(singleDeploymentMarker)
    expect(deploymentTwoMarker).toEqual(twoDeploymentMarker)
    expect(deploymentMultipleMarker).toEqual(multipleDeploymentMarker)
  })

  test('should return correct start and endtime for getStartAndEndTime', () => {
    Date.now = jest.fn(() => datetimeMock)
    expect(getStartAndEndTime(TimePeriodEnum.FOUR_HOURS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.FOUR_HOURS)
    })
    expect(getStartAndEndTime(TimePeriodEnum.TWENTY_FOUR_HOURS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.TWENTY_FOUR_HOURS)
    })
    expect(getStartAndEndTime(TimePeriodEnum.THREE_DAYS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.THREE_DAYS)
    })
    expect(getStartAndEndTime(TimePeriodEnum.SEVEN_DAYS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.SEVEN_DAYS)
    })
    expect(getStartAndEndTime(TimePeriodEnum.THIRTY_DAYS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.THIRTY_DAYS)
    })
  })

  test('should create correct payload for createTimelineSeriesData', () => {
    const categoryTimeline = {
      Alert: mockTimeData,
      Deployment: mockTimeData,
      Infrastructure: mockTimeData
    }
    expect(createTimelineSeriesData(categoryTimeline?.Deployment, ChangeSourceTypes.Deployments)).toEqual(
      mockDeploymentPayload
    )
    expect(createTimelineSeriesData(categoryTimeline?.Alert, ChangeSourceTypes.Incidents)).toEqual(mockIncidentPayload)
    expect(createTimelineSeriesData(categoryTimeline?.Infrastructure, ChangeSourceTypes.Infrastructure)).toEqual(
      mockInfraPayload
    )
  })
})
