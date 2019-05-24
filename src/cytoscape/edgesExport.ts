/* tslint:disable:no-console */

// import {relatedNodes} from "./common";
import { Edge, Network } from "./networksJs";

export const cytoscapeEdgesHeaderRows = [["Id", "Name", "Sync status"]];

export const edgesExport = async (
  existingRows,
  network: Network,
): Promise<any[][]> => {
  // prepare rows to export
  const headerRows = cytoscapeEdgesHeaderRows;
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
    return Array(cytoscapeEdgesHeaderRows.length).fill(undefined);
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

    valueRow[idColIndex] = edge.data.id;
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

    // check if we can safely update this row with new edge-based attributes
    const matchingEdge = network.elements.edges.find(
      (edge: Edge) => String(edge.data.id) === String(existingId),
    );
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
  return headerRows.concat(valueRows);
};
