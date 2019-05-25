/* tslint:disable:no-console */

// import {relatedNodes} from "./common";
import { Edge, Network } from "./networksJs";

export const columns = [
  {
    key: "id",
    name: "Id",
  },
  {
    key: "name",
    name: "Name",
  },
  {
    key: "sync_status",
    name: "Sync status",
  },
  {
    key: "source",
    name: "Source",
  },
  {
    key: "target",
    name: "Target",
  },
];

export const edgesExport = async (
  existingRows,
  network: Network,
): Promise<any[][]> => {
  if (network.elements.edges.length === 0) {
    return [];
  }

  const firstElement = network.elements.edges[0];
  const dataKeys = Object.keys(firstElement.data);

  // prepare graceful export
  const existingHeaderRows: any[][] = existingRows.slice(0, 1);
  const existingValueRows: any[][] = existingRows.slice(1);

  // set up expected keys and headers
  const expectedColumns = [];

  // if existingHeaderRows has existing values, use it as basis of map, and tag everything new on the end
  if (existingHeaderRows[0]) {
    existingHeaderRows[0].map(existingHeaderName => {
      const existingHeaderColumn = columns.find(
        column => column.name === existingHeaderName,
      );
      if (existingHeaderColumn) {
        expectedColumns.push(existingHeaderColumn);
      } else {
        expectedColumns.push({
          key: existingHeaderName,
          name: existingHeaderName,
        });
      }
    });
  }
  columns.map(column => {
    if (
      !expectedColumns.find(expectedColumn => expectedColumn.key === column.key)
    ) {
      expectedColumns.push(column);
    }
  });
  for (const dataKey of dataKeys) {
    if (
      !expectedColumns.find(expectedColumn => expectedColumn.key === dataKey)
    ) {
      expectedColumns.push({
        key: dataKey,
        name: dataKey,
      });
    }
  }
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

    valueRow[idColIndex] = edge.data.id;
    valueRow[nameColIndex] = edge.data.name;
    valueRow[ensuredColumnIndex("source")] = edge.data.source;
    valueRow[ensuredColumnIndex("target")] = edge.data.target;

    // for each property in edge.data
    for (const key of dataKeys) {
      if (["id", "name", "source", "target"].includes(key)) {
        continue;
      }
      valueRow[ensuredColumnIndex(key)] = String(edge.data[key]);
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
  return [expectedHeaderRow].concat(valueRows);
};
