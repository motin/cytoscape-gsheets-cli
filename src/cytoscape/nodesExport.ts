/* tslint:disable:no-console */

// import {relatedEdges} from "./common";
import { Network, Node } from "./networksJs";

export const cytoscapeNodesHeaderRows = [["Id", "Name", "Sync status"]];

export const nodesExport = async (
  existingRows,
  network: Network,
): Promise<any[][]> => {
  // prepare rows to export
  const headerRows = cytoscapeNodesHeaderRows;
  const ensuredColumnIndex = (header: string) => {
    const index = headerRows[0].indexOf(header);
    if (index < 0) {
      throw new Error(`Header not found: '${header}'`);
    }
    return index;
  };
  const idColIndex = ensuredColumnIndex("Id");
  const nameColIndex = ensuredColumnIndex("Name");
  const syncStatusColIndex = ensuredColumnIndex("Sync status");
  const noopUpdateRow = (): any[] => {
    return Array(cytoscapeNodesHeaderRows.length).fill(undefined);
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

    valueRow[idColIndex] = node.data.id;
    valueRow[nameColIndex] = "Foo";
    return valueRow;
  };

  // prepare graceful export
  const existingHeaderRows: any[][] = existingRows.slice(0, 1);
  const existingValueRows: any[][] = existingRows.slice(1);

  // ensure that the columns are laid out the way we expect them to
  // TODO: instead detect existing columns and adapt the export to accommodate the custom layout
  if (JSON.stringify(existingHeaderRows) !== JSON.stringify(headerRows)) {
    console.warn(
      "Existing header rows:",
      "\n",
      JSON.stringify(existingHeaderRows),
      "... must match:",
      "\n",
      JSON.stringify(headerRows),
    );
    throw new Error("Safety stop");
  }

  // build the updated content based on the existing rows
  const mergeWithExistingValueRow = async (
    existingValueRow: any[],
  ): Promise<any[]> => {
    const existingId = existingValueRow[idColIndex];

    let mergedRow: any[];

    // check if we can safely update this row with new node-based attributes
    const matchingNode = network.elements.nodes.find(
      (node: Node) => String(node.data.id) === String(existingId),
    );
    if (matchingNode) {
      // remove the node from the nodes array
      network.elements.nodes.splice(
        network.elements.nodes.indexOf(matchingNode),
        1,
      );
      // update the pre-existing rows - being sure to set undefined for columns that we do not want to modify
      mergedRow = await mapNodeToValueRow(matchingNode);
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
  const newRowPromises: Array<Promise<any[]>> = network.elements.nodes.map(
    mapNodeToValueRow,
  );
  const newRows: any[][] = await Promise.all(newRowPromises);

  const valueRows = mergedValueRows.concat(newRows);

  // export the updated content
  return headerRows.concat(valueRows);
};
