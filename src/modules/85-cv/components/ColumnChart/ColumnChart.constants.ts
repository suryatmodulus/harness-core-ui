export const COLUMN_HEIGHT = 90
export const COLUMN_WIDTH = 12
export const TOTAL_COLUMNS = 48

export const LOADING_COLUMN_HEIGHTS = Array(TOTAL_COLUMNS)
  .fill(null)
  .map(() => Math.random() * 101)
