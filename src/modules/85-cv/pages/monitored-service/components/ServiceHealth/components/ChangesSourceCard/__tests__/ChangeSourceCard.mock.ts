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
    label: 'cv.changeSource.tooltip.incident',
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
    label: 'cv.changeSource.tooltip.incident',
    percentage: 50
  }
]

export const expectedPositiveTextContent = [
  'changes50%',
  'deploymentText50%',
  'infrastructureText50%',
  'cv.changeSource.tooltip.incident50%'
]

export const expectedNegativeTextContent = [
  'changes33.3%',
  'deploymentText33.3%',
  'infrastructureText33.3%',
  'cv.changeSource.tooltip.incident33.3%'
]
