import { wrap } from './hooks';

/**
 *  A matrix that represents the positions of adjacent points around a point
 *  Used to generate 8 new points around a center point
 */
export const matrix = [
  // Clockwise order starting from top left (Center position excluded)
  [-1, 1], //[x, y]
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
];

/**
 * Generate a matrix from items array,
 * trying to keep it as symmetrical as possible, and alternating between items and empty cells
 * @param arr The items to convert to a 2D matrix
 * @returns The resulting matrix
 */
export function generateMatrix(arr) {
  // Alternate between items and null in the array
  const itemsArray = arr.flatMap((x) => [x, null]);
  const length = itemsArray.length;

  // Find the optimal number of rows and columns to keep it symmetrical
  let rows = Math.ceil(Math.sqrt(length));
  let cols = Math.ceil(length / rows);

  // Rows and columns number should be even
  if (rows % 2 !== 0) {
    rows++;
  }

  if (cols % 2 !== 0) {
    cols++;
  }

  const matrix = [];
  let index = 0;
  let isLastItemNull = false;

  // Cache the filtered non-null items array to avoid redundant filtering inside the loop
  const filteredItemsArray = itemsArray.filter((x) => x !== null);

  for (let i = 0; i < rows; i++) {
    const row = [];

    // Shift the odd rows by one cell to the right
    if (i % 2 !== 0) {
      row.push(null);
      isLastItemNull = true;
    }

    for (let j = 0; j < cols; j++) {
      if (index < length) {
        const item = itemsArray[index];
        row.push(item);
        isLastItemNull = item === null;
        index++;
      } else {
        // Fill the rest of the row deterministically, alternating between null and the next item in the filtered array
        if (!isLastItemNull) {
          row.push(null);
          isLastItemNull = true;
        } else {
          const nextItem =
            filteredItemsArray[(i * cols + j) % filteredItemsArray.length];
          row.push(nextItem);
          isLastItemNull = false;
        }
      }
    }

    matrix.push(row);
  }

  return matrix;
}

/**
 * Get an item from a matrix, with wrapping around when out of bounds
 * @param matrix The matrix to get the item from
 * @param row The row index
 * @param col The column index
 * @returns The item from the matrix
 */
export function getMatrixItem(matrix, row, col) {
  const firstRow = matrix[0];

  if (!firstRow) {
    throw new Error('Matrix is empty');
  }

  const numRows = matrix.length;
  const numCols = firstRow.length;

  // Wrap around the row/columns index if out of bounds
  const wrappedRow = wrap(0, numRows, row);
  const wrappedCol = wrap(0, numCols, col);

  return matrix[wrappedRow]?.[wrappedCol];
}

/**
 * Get the distance of an item from the container bounds
 * @param itemCenterPoint The point to calculate the distance from.
 * @param itemWidth The width of the item.
 * @param itemHeight The height of the item.
 * @param bounds The rectangle bounds.
 * @returns The distance of the item from the container bounds.
 */
export function getItemDistanceFromContainer(
  itemCenterPoint,
  itemWidth,
  itemHeight,
  bounds
) {
  let distanceX = 0;
  let distanceY = 0;

  if (itemCenterPoint.x < bounds.left - itemWidth) {
    distanceX = bounds.left - itemWidth - itemCenterPoint.x;
  } else if (itemCenterPoint.x > bounds.right + itemWidth) {
    distanceX = itemCenterPoint.x - (bounds.right + itemWidth);
  }

  if (itemCenterPoint.y < bounds.top - itemHeight) {
    distanceY = bounds.top - itemHeight - itemCenterPoint.y;
  } else if (itemCenterPoint.y > bounds.bottom + itemHeight) {
    distanceY = itemCenterPoint.y - (bounds.bottom + itemHeight);
  }

  return Math.floor(Math.hypot(distanceX, distanceY));
}

/**
 * Check if a point is inside a rectangle bounds
 * @param point The point to check
 * @param bounds The rectangle bounds
 * @returns Whether the point is inside the bounds or not
 */
export function isPointInsideBounds(point, bounds) {
  return (
    point.x >= bounds.left &&
    point.x <= bounds.right &&
    point.y >= bounds.top &&
    point.y <= bounds.bottom
  );
}
