/* tslint:disable:no-console */

// import {relatedNodes} from "./common";
import { getExpectedColumns } from "../common";
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

  const ensuredColumnIndex = (key: string) => {
    const index = expectedColumns.findIndex(column => column.key === key);
    if (index < 0) {
      throw new Error(`Column not found: key='${key}'`);
    }
    return index;
  };
  const idColIndex = ensuredColumnIndex("id");
  const nameColIndex = ensuredColumnIndex("name");
  const syncStatusColIndex = ensuredColumnIndex("sync_status");
  const noopUpdateRow = (): any[] => {
    return Array(expectedColumns.length).fill(undefined);
  };
  const mapEdgeToValueRow = async (edge: Edge): Promise<any[]> => {
    const valueRow = noopUpdateRow();

    // information about the edge's nodes...
    /*
    let node: Node;
    let firstFoundAccessibleNode;
    const nodes = await relatedNodes(network, node);
    try {
      firstFoundAccessibleNode = firstAccessibleNode(
        nodes,
      );
      node = firstFoundAccessibleNode;
    } catch (err) {
      if (err.message.indexOf("No accessible node found") > -1) {
        console.log("No accessible node found for edge", node.id);
        console.log("Nodes: ", { nodes });
        node = nodes[0];
      } else {
        throw err;
      }
    }
    */

    // for each property in edge.data
    for (const key of dataKeys) {
      // ignore those that are formulas - they should not be overwritten
      if (
        columns.find((column) => column.key === key && column.formula)
      ) {
        continue;
      }
      valueRow[ensuredColumnIndex(key)] = String(edge.data[key]);
    }

    // use original ids if available
    if (edge.data.id_original) {
      valueRow[idColIndex] = edge.data.id_original;
    }
    if (edge.data.source_original) {
      valueRow[ensuredColumnIndex("source")] = edge.data.source_original;
    }
    if (edge.data.target_original) {
      valueRow[ensuredColumnIndex("target")] = edge.data.target_original;
    }

    return valueRow;
  };

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
