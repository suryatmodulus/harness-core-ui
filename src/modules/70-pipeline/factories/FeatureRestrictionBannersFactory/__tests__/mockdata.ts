// Prepend with MET_VALUE_ / EXCEEDED_VALUE_ / UNMET_VALUE_
// SOME_VALUE_ / ZERO_ / NOT_ENABLED for count in relation to the limit

export const ZERO_VALUE_MAX_BUILDS_PER_MONTH = {
  enabled: true,
  featureDetail: {
    featureName: 'MAX_BUILDS_PER_MONTH',
    enabled: true,
    limit: 100,
    count: 0,
    apiFail: false,
    moduleType: 'CI'
  }
}

export const MET_VALUE_MAX_BUILDS_PER_MONTH = {
  enabled: true,
  featureDetail: {
    featureName: 'MAX_BUILDS_PER_MONTH',
    enabled: true,
    limit: 100,
    count: 100,
    apiFail: false,
    moduleType: 'CI'
  }
}

export const SOME_VALUE_MAX_BUILDS_PER_MONTH = {
  enabled: true,
  featureDetail: {
    featureName: 'MAX_BUILDS_PER_MONTH',
    enabled: true,
    limit: 100,
    count: 0,
    apiFail: false,
    moduleType: 'CI'
  }
}

export const EXCEEDED_VALUE_MAX_TOTAL_BUILDS = {
  enabled: false,
  featureDetail: {
    featureName: 'MAX_TOTAL_BUILDS',
    enabled: false,
    limit: 2500,
    count: 2600,
    apiFail: false,
    moduleType: 'CI'
  }
}

// 90% Total builds met
export const SOME_VALUE_MAX_TOTAL_BUILDS = {
  enabled: true,
  featureDetail: {
    featureName: 'MAX_TOTAL_BUILDS',
    enabled: true,
    limit: 2500,
    count: 2250,
    apiFail: false,
    moduleType: 'CI'
  }
}

export const SOME_VALUE_ACTIVE_COMMITERS = {
  enabled: true,
  featureDetail: {
    featureName: 'ACTIVE_COMMITTERS',
    enabled: true,
    limit: 200,
    count: 199,
    apiFail: false,
    moduleType: 'CI'
  }
}
export const MET_VALUE_ACTIVE_COMMITERS = {
  enabled: true,
  featureDetail: {
    featureName: 'ACTIVE_COMMITTERS',
    enabled: true,
    limit: 200,
    count: 200,
    apiFail: false,
    moduleType: 'CI'
  }
}

export const NOT_ENABLED_ACTIVE_COMMITTERS = {
  enabled: true,
  featureDetail: {
    featureName: 'ACTIVE_COMMITTERS',
    enabled: true,
    moduleType: 'CI',
    apiFail: false
  }
}

// Not Enforced. E.g. Enterprise customer does not utilize max builds per month
export const NOT_ENABLED_MAX_BUILDS_PER_MONTH = {
  enabled: true,
  featureDetail: {
    featureName: 'MAX_BUILDS_PER_MONTH',
    enabled: true,
    moduleType: 'CI',
    apiFail: false
  }
}

export const NOT_ENABLED_MAX_TOTAL_BUILDS = {
  enabled: true,
  featureDetail: {
    featureName: 'MAX_TOTAL_BUILDS',
    enabled: true,
    moduleType: 'CI',
    apiFail: false
  }
}
