/* tslint:disable:no-console */

import {
  convertSpreadsheetRowsToJsObjects,
  getExpectedColumns,
} from "../common";
import { edgeConversionFunctions } from "./edgeConversionFunctions";
import { columns as edgeColumns } from "./edges";
import { Edge, Node } from "./networksJs";
import { columns as nodeColumns } from "./nodes";

export const fixNodesAndEdges = async (
  existingNodeSpreadsheetRows: any[][],
  existingEdgeSpreadsheetRows: any[][],
): Promise<{ updatedNodeValues: any[][]; updatedEdgeValues: any[][] }> => {
  return ensureEachChildNodeHasAParentMemberEdge(
    existingNodeSpreadsheetRows,
    existingEdgeSpreadsheetRows,
  );
};

export const ensureEachChildNodeHasAParentMemberEdge = async (
  existingNodeSpreadsheetRows: any[][],
  existingEdgeSpreadsheetRows: any[][],
): Promise<{ updatedNodeValues: any[][]; updatedEdgeValues: any[][] }> => {
  // const updatedNodeValues = fixSpreadsheetRows(existingNodeSpreadsheetRows)

  const nodes = await getSpreadsheetRowsAsObjects(
    existingNodeSpreadsheetRows,
    nodeColumns,
  );
  // console.log({ nodes });

  const edges = await getSpreadsheetRowsAsObjects(
    existingEdgeSpreadsheetRows,
    edgeColumns,
  );
  // console.log({ edges });

  const memberEdges = edges.filter(
    ($edge: Edge) => $edge.data.interaction === "member",
  );

  const unaccountedForMemberEdges: Edge[] = memberEdges.slice(0);
  const edgesToAdd: Edge[] = [];

  const childNodes = nodes.filter((node: Node) => node.data.parent_id !== "");

  childNodes.map((node: Node) => {
    // find the parent member edge
    const existingParentEdge = memberEdges.filter(
      (edge: Edge) =>
        edge.data.target === node.data.id &&
        edge.data.source === node.data.parent_id,
    );

    if (existingParentEdge.length === 1) {
      unaccountedForMemberEdges.splice(
        unaccountedForMemberEdges.indexOf(existingParentEdge[0]),
        1,
      );
    } else {
      if (existingParentEdge.length > 1) {
        throw new Error(
          `Node ${
            node.data.id
          } has multiple parent member edges. Fix manually and re-run.`,
        );
      } else {
        // create new
        const newId =
          Math.max(
            ...nodes
              .map(($node: Node) => $node.data.id)
              .concat(edges.map(($edge: Edge) => $edge.data.id))
              .concat(edgesToAdd.map(($edge: Edge) => $edge.data.id)),
          ) + 1;
        edgesToAdd.push({
          data: {
            id: String(newId),
            interaction: "member",
            source: node.data.parent_id,
            target: node.data.id,
          },
        });
      }
    }
  });

  const expectedNodeColumns = getExpectedColumnsFromSpreadsheetRows(
    existingNodeSpreadsheetRows,
    nodeColumns,
  );
  const expectedEdgeColumns = getExpectedColumnsFromSpreadsheetRows(
    existingEdgeSpreadsheetRows,
    edgeColumns,
  );
  const {
    idColIndex,
    syncStatusColIndex,
    noopUpdateRow,
    mapEdgeToValueRow,
  } = edgeConversionFunctions(expectedEdgeColumns);

  // summarize the updated set of nodes
  const existingNodeValueRows: any[][] = existingNodeSpreadsheetRows.slice(1);
  const nodeHeaders = expectedNodeColumns.map(
    expectedColumn => expectedColumn.name,
  );
  const updatedNodeValues = [nodeHeaders].concat(
    existingNodeValueRows.map(_existingNodeSpreadsheetRow => noopUpdateRow()),
  );

  // mark member edges that are not accounted for above as invalid
  const existingEdgeValueRows: any[][] = existingEdgeSpreadsheetRows.slice(1);
  const updatedExistingEdgeSpreadsheetRows = existingEdgeValueRows.map(
    existingEdgeSpreadsheetRow => {
      const valueRow = noopUpdateRow();
      if (
        unaccountedForMemberEdges.find(
          (unaccountedForMemberEdge: Edge) =>
            String(unaccountedForMemberEdge.data.id) ===
            String(existingEdgeSpreadsheetRow[idColIndex]),
        )
      ) {
        valueRow[syncStatusColIndex] = "Invalid";
      }
      return valueRow;
    },
  );

  // add the new edges to the bottom of the edge rows
  const newEdgeRowPromises: Array<Promise<any[]>> = edgesToAdd.map(
    mapEdgeToValueRow,
  );
  const newEdgeRows: any[][] = await Promise.all(newEdgeRowPromises);

  // summarize the updated set of edges
  const edgeHeaders = expectedEdgeColumns.map(
    expectedColumn => expectedColumn.name,
  );
  const updatedEdgeValues = [edgeHeaders].concat(
    updatedExistingEdgeSpreadsheetRows,
    newEdgeRows,
  );

  return { updatedNodeValues, updatedEdgeValues };
};

const getExpectedColumnsFromSpreadsheetRows = (
  spreadsheetRows: any[][],
  columns,
) => {
  const headerRows: any[][] = spreadsheetRows.slice(0, 1);

  // set up expected keys and headers
  return getExpectedColumns(columns, headerRows, []);
};
export const getSpreadsheetRowsAsObjects = async (
  spreadsheetRows: any[][],
  columns,
): Promise<any> => {
  if (spreadsheetRows.length === 0) {
    return [];
  }

  const expectedColumns = getExpectedColumnsFromSpreadsheetRows(
    spreadsheetRows,
    columns,
  );

  /*
  const expectedHeaderRow = expectedColumns.map(
    expectedColumn => expectedColumn.name,
  );
  */

  // console.log({ expectedColumns, expectedHeaderRow });

  // convert spreadsheet rows to js objects
  const headerRows: any[][] = spreadsheetRows.slice(0, 1);
  const valueRows: any[][] = spreadsheetRows.slice(1);
  const spreadsheetItems = convertSpreadsheetRowsToJsObjects(
    valueRows,
    headerRows,
    expectedColumns,
  );
  // console.log({ spreadsheetItems });

  return spreadsheetItems.map((spreadsheetItem, i) => {
    return {
      data: spreadsheetItem,
      originalSpreadsheetRow: spreadsheetRows[i],
    };
  });
};
