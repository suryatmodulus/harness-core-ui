export const BLUE_500 = '#22A5F7'
export const ORANGE = '#F35E13'
export const PURPLE = '#A82CCA'
export const LIGHT_GREEN = '#36D0AF'

export enum ResourceType {
  CPU = 'CPU',
  MEMORY = 'MEMORY'
}

enum ResourceChartLabels {
  USED = 'Used',
  LIMIT = 'Limit',
  REQUESTED = 'Requested'
}

export const POD_COUNT_CHART_NAME = 'Pods'

enum ResourceChartTypeEnums {
  CPU_USED = 'CPU_USED',
  CPU_LIMIT = 'CPU_LIMIT',
  CPU_REQUESTED = 'CPU_REQUESTED',
  MEMORY_USED = 'MEMORY_USED',
  MEMORY_LIMIT = 'MEMORY_LIMIT',
  MEMORY_REQUESTED = 'MEMORY_REQUESTED'
}

export const podCountConfig = {
  name: POD_COUNT_CHART_NAME,
  color: BLUE_500,
  showInLegend: true
}

type ChartConfigType = {
  name: string
  color: string
  showInLegend: boolean
}

export const chartOptionsMapping: Record<string, Record<string, ChartConfigType>> = {
  [ResourceChartTypeEnums.CPU_USED]: {
    MAX: {
      name: ResourceChartLabels.USED,
      color: LIGHT_GREEN,
      showInLegend: true
    },
    AVG: {
      name: ResourceChartLabels.USED,
      color: LIGHT_GREEN,
      showInLegend: true
    }
  },

  [ResourceChartTypeEnums.CPU_LIMIT]: {
    LIMIT: {
      name: ResourceChartLabels.LIMIT,
      color: PURPLE,
      showInLegend: true
    }
  },

  [ResourceChartTypeEnums.CPU_REQUESTED]: {
    REQUEST: {
      name: ResourceChartLabels.REQUESTED,
      color: ORANGE,
      showInLegend: true
    },
    DEFAULT: {
      name: ResourceChartLabels.REQUESTED,
      color: ORANGE,
      showInLegend: true
    }
  },

  [ResourceChartTypeEnums.MEMORY_USED]: {
    MAX: {
      name: ResourceChartLabels.USED,
      color: LIGHT_GREEN,
      showInLegend: true
    },
    AVG: {
      name: ResourceChartLabels.USED,
      color: LIGHT_GREEN,
      showInLegend: true
    }
  },

  [ResourceChartTypeEnums.MEMORY_LIMIT]: {
    LIMIT: {
      name: ResourceChartLabels.LIMIT,
      color: PURPLE,
      showInLegend: true
    }
  },

  [ResourceChartTypeEnums.MEMORY_REQUESTED]: {
    REQUEST: {
      name: ResourceChartLabels.REQUESTED,
      color: ORANGE,
      showInLegend: true
    },
    DEFAULT: {
      name: ResourceChartLabels.REQUESTED,
      color: ORANGE,
      showInLegend: true
    }
  }
}

export const chartConfigMapping: Record<
  string,
  {
    chartType: string
    resource: string
  }
> = {
  cpuUtilValues: {
    chartType: ResourceChartTypeEnums.CPU_USED,
    resource: ResourceType.CPU
  },
  cpuLimit: {
    chartType: ResourceChartTypeEnums.CPU_LIMIT,
    resource: ResourceType.CPU
  },
  cpuRequest: {
    chartType: ResourceChartTypeEnums.CPU_REQUESTED,
    resource: ResourceType.CPU
  },
  memoryUtilValues: {
    chartType: ResourceChartTypeEnums.MEMORY_USED,
    resource: ResourceType.MEMORY
  },
  memoryLimit: {
    chartType: ResourceChartTypeEnums.MEMORY_LIMIT,
    resource: ResourceType.MEMORY
  },
  memoryRequest: {
    chartType: ResourceChartTypeEnums.MEMORY_REQUESTED,
    resource: ResourceType.MEMORY
  }
}
