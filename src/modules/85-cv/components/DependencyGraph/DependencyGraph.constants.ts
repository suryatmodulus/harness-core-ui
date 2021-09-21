import { Color } from '@wings-software/uicore'

export const statusColors = [
  {
    status: 'HIGH',
    primary: Color.RED_500,
    secondary: Color.RED_50
  },
  {
    status: 'TBD',
    primary: Color.YELLOW_500,
    secondary: Color.YELLOW_50
  },
  {
    status: 'MEDIUM',
    primary: Color.ORANGE_500,
    secondary: Color.ORANGE_50
  },
  {
    status: 'LOW',
    primary: Color.GREEN_500,
    secondary: Color.GREEN_50
  },
  {
    status: 'NO_ANALYSIS',
    primary: Color.GREY_500,
    secondary: Color.GREY_50
  },
  {
    status: 'NO_DATA',
    primary: Color.GREY_500,
    secondary: Color.GREY_50
  }
]

export const wrappedArrowLength = 5
