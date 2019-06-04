/* tslint:disable:no-console */

// import {relatedEdges} from "./common";
import { getExpectedColumns } from "../common";
import { Network, Node } from "./networksJs";
import { columns, getNodeDataKeys } from "./nodes";

export const nodesExport = async (
  existingSpreadsheetRows: any[][],
  network: Network,
): Promise<any[][]> => {
  if (network.elements.nodes.length === 0) {
    return [];
  }

  // prepare graceful export
  const existingHeaderRows: any[][] = existingSpreadsheetRows.slice(0, 1);
  const existingValueRows: any[][] = existingSpreadsheetRows.slice(1);

  // set up expected keys and headers
  const dataKeys = getNodeDataKeys(network);
  const expectedColumns = getExpectedColumns(
    columns,
    existingHeaderRows,
    dataKeys,
  );
  const expectedHeaderRow = expectedColumns.map(
    expectedColumn => expectedColumn.name,
  );

  console.log({ expectedColumns, expectedHeaderRow });

  const ensuredColumnIndex = (key: string) => {
    const index = expectedColumns.findIndex(column => column.key === key);
    if (index < 0) {
      throw new Error(`Column not found: key='${key}'`);
    }
    return index;
  };
  const idColIndex = ensuredColumnIndex("id");
  const syncStatusColIndex = ensuredColumnIndex("sync_status");
  const noopUpdateRow = (): any[] => {
    return Array(expectedColumns.length).fill(undefined);
  };
  const mapNodeToValueRow = async (node: Node): Promise<any[]> => {
    const valueRow = noopUpdateRow();

    // information about the node's egdes...
    /*
    let edge: Edge;
    let firstFoundAccessibleEdge;
    const edges = await relatedEdges(network, node);
    try {
      firstFoundAccessibleEdge = firstAccessibleEdge(
        edges,
      );
      edge = firstFoundAccessibleEdge;
    } catch (err) {
      if (err.message.indexOf("No accessible node found") > -1) {
        console.log("No accessible edge found for node", node.id);
        console.log("Nodes: ", { edges });
        edge = edges[0];
      } else {
        throw err;
      }
    }
    */

    // for each property in node.data
    for (const key of Object.keys(node.data)) {
      // ignore those that are formulas - they should not be overwritten
      if (columns.find(column => column.key === key && column.formula)) {
        continue;
      }
      valueRow[ensuredColumnIndex(key)] = String(node.data[key]);
    }
    for (const key of Object.keys(node.position)) {
      valueRow[ensuredColumnIndex(key)] = String(node.position[key]);
    }

    // use original ids if available
    if (node.data.id_original) {
      valueRow[idColIndex] = node.data.id_original;
    }

    return valueRow;
  };

  // build the updated content based on the existing rows
  const mergeWithExistingValueRow = async (
    existingValueRow: any[],
  ): Promise<any[]> => {
    const existingId = existingValueRow[idColIndex];

    let mergedRow: any[];

    // check if we can safely update this row with new node-based attributes
    const matchingNode = network.elements.nodes.find((node: Node) => {
      if (node.data.id_original) {
        return String(node.data.id_original) === String(existingId);
      }
      return String(node.data.id) === String(existingId);
    });
    if (matchingNode) {
      // remove the node from the nodes array
      network.elements.nodes.splice(
        network.elements.nodes.indexOf(matchingNode),
        1,
      );
      // update the pre-existing rows - being sure to set undefined for columns that we do not want to modify
      mergedRow = await mapNodeToValueRow(matchingNode);
      mergedRow[syncStatusColIndex] = "Merged";
    } else {
      // annotate the rows that have no corresponding hash in the database
      mergedRow = noopUpdateRow();
      mergedRow[syncStatusColIndex] = "Orphaned";
      mergedRow[idColIndex] = existingId;
    }

    return mergedRow;
  };

  const mergedValueRowPromises: Array<Promise<any[]>> = existingValueRows.map(
    mergeWithExistingValueRow,
  );
  const mergedValueRows: any[][] = await Promise.all(mergedValueRowPromises);

  // append the db rows that are not in the gsheet
  const newRowPromises: Array<Promise<any[]>> = network.elements.nodes.map(
    mapNodeToValueRow,
  );
  const newRows: any[][] = await Promise.all(newRowPromises);

  const valueRows = mergedValueRows.concat(newRows);

  // export the updated content
  return [expectedHeaderRow].concat(valueRows);
};
