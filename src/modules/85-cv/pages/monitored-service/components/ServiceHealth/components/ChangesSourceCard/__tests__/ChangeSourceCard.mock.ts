/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const changeSummary = {
  categoryCountMap: {
    Deployment: { count: 0, countInPrecedingWindow: 0 },
    Infrastructure: { count: 0, countInPrecedingWindow: 0 },
    Alert: { count: 0, countInPrecedingWindow: 0 }
  }
}

export const changeSummaryWithPositiveChange = {
  categoryCountMap: {
    Deployment: { count: 15, countInPrecedingWindow: 10 },
    Infrastructure: { count: 15, countInPrecedingWindow: 10 },
    Alert: { count: 15, countInPrecedingWindow: 10 }
  }
}

export const changeSummaryWithAbove100PositiveChange = {
  categoryCountMap: {
    Deployment: { count: 15000, countInPrecedingWindow: 10 },
    Infrastructure: { count: 15000, countInPrecedingWindow: 10 },
    Alert: { count: 15000, countInPrecedingWindow: 10 }
  }
}

export const changeSummaryWithNegativeChange = {
  categoryCountMap: {
    Deployment: { count: 10, countInPrecedingWindow: 15 },
    Infrastructure: { count: 10, countInPrecedingWindow: 15 },
    Alert: { count: 10, countInPrecedingWindow: 15 }
  }
}

export const changeSoureCardData = [
  {
    count: 0,
    id: 'Changes',
    label: 'changes',
    percentage: 0
  },
  {
    count: 0,
    id: 'Deployment',
    label: 'deploymentText',
    percentage: 0
  },
  {
    count: 0,
    id: 'Infrastructure',
    label: 'infrastructureText',
    percentage: 0
  },
  {
    count: 0,
    id: 'Alert',
    label: 'cv.changeSource.tooltip.incidents',
    percentage: 0
  }
]

export const changeSoureCardDataWithPositiveGrowth = [
  {
    count: 45,
    id: 'Changes',
    label: 'changes',
    percentage: 50
  },
  {
    count: 15,
    id: 'Deployment',
    label: 'deploymentText',
    percentage: 50
  },
  {
    count: 15,
    id: 'Infrastructure',
    label: 'infrastructureText',
    percentage: 50
  },
  {
    count: 15,
    id: 'Alert',
    label: 'cv.changeSource.tooltip.incidents',
    percentage: 50
  }
]

export const expectedPositiveTextContent = [
  'changes50%',
  'deploymentText50%',
  'infrastructureText50%',
  'cv.changeSource.tooltip.incidents50%'
]

export const expectedNegativeTextContent = [
  'changes33.3%',
  'deploymentText33.3%',
  'infrastructureText33.3%',
  'cv.changeSource.tooltip.incidents33.3%'
]

export const expectedAbove100PositiveTextContent = [
  'changes100+ %',
  'deploymentText100+ %',
  'infrastructureText100+ %',
  'cv.changeSource.tooltip.incidents100+ %'
]
