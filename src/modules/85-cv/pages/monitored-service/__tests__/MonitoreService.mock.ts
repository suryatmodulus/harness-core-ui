export const yamlResponse = {
  metaData: {},
  resource:
    'monitoredService:\n  identifier:\n  type: Application\n  name:\n  desc:\n  projectIdentifier: Demo\n  orgIdentifier: default\n  serviceRef:\n  environmentRef:\n  sources:\n    healthSources:\n    changeSources:\n      - name: Harness CD\n        identifier: harness_cd\n        type: HarnessCD\n        desc: Deployments from Harness CD\n        enabled : true\n',
  responseMessages: []
}

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
