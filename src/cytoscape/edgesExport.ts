/* tslint:disable:no-console */

// import {relatedNodes} from "./common";
import { getExpectedColumns } from "../common";
import { edgeConversionFunctions } from "./edgeConversionFunctions";
import { columns, getEdgeDataKeys } from "./edges";
import { Edge, Network } from "./networksJs";

export const edgesExport = async (
  existingRows,
  network: Network,
): Promise<any[][]> => {
  if (network.elements.edges.length === 0) {
    return [];
  }

  // prepare graceful export
  const existingHeaderRows: any[][] = existingRows.slice(0, 1);
  const existingValueRows: any[][] = existingRows.slice(1);

  // set up expected keys and headers
  const dataKeys = getEdgeDataKeys(network);
  const expectedColumns = getExpectedColumns(
    columns,
    existingHeaderRows,
    dataKeys,
  );
  const expectedHeaderRow = expectedColumns.map(
    expectedColumn => expectedColumn.name,
  );

  console.log({ expectedColumns, expectedHeaderRow });

  const {
    idColIndex,
    nameColIndex,
    syncStatusColIndex,
    noopUpdateRow,
    mapEdgeToValueRow,
  } = edgeConversionFunctions(expectedColumns);

  // build the updated content based on the existing rows
  const mergeWithExistingValueRow = async (
    existingValueRow: any[],
  ): Promise<any[]> => {
    const existingId = existingValueRow[idColIndex];

    let mergedRow: any[];

    // check if we can safely update this row with new edge-based attributes
    const matchingEdge = network.elements.edges.find((edge: Edge) => {
      if (edge.data.id_original) {
        return String(edge.data.id_original) === String(existingId);
      }
      return String(edge.data.id) === String(existingId);
    });
    if (matchingEdge) {
      // remove the edge from the edges array
      network.elements.edges.splice(
        network.elements.edges.indexOf(matchingEdge),
        1,
      );
      // update the pre-existing rows - being sure to set undefined for columns that we do not want to modify
      mergedRow = await mapEdgeToValueRow(matchingEdge);
    } else {
      // annotate the rows that have no corresponding hash in the database
      mergedRow = noopUpdateRow();
      mergedRow[syncStatusColIndex] = "Orphaned";
      mergedRow[idColIndex] = existingId;
      mergedRow[nameColIndex] = existingValueRow[nameColIndex];
    }

    return mergedRow;
  };

  const mergedValueRowPromises: Array<Promise<any[]>> = existingValueRows.map(
    mergeWithExistingValueRow,
  );
  const mergedValueRows: any[][] = await Promise.all(mergedValueRowPromises);

  // append the db rows that are not in the gsheet
  const newRowPromises: Array<Promise<any[]>> = network.elements.edges.map(
    mapEdgeToValueRow,
  );
  const newRows: any[][] = await Promise.all(newRowPromises);

  const valueRows = mergedValueRows.concat(newRows);

  // export the updated content
  return [expectedHeaderRow].concat(valueRows);
};
