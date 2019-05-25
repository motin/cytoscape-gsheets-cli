/* tslint:disable:no-console */

// import {relatedEdges} from "./common";
import { Network, Node } from "./networksJs";

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
];

export const nodesExport = async (
  existingRows,
  network: Network,
): Promise<any[][]> => {
  if (network.elements.nodes.length === 0) {
    return [];
  }

  const dataKeys = [];
  network.elements.nodes.map(node => {
    for (const dataKey of Object.keys(node.data).concat(
      Object.keys(node.position),
    )) {
      if (!dataKeys.includes(dataKey)) {
        dataKeys.push(dataKey);
      }
    }
  });

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
    valueRow[nameColIndex] = node.data.name;

    // for each property in node.data
    for (const key of Object.keys(node.data)) {
      if (["id", "name"].includes(key)) {
        continue;
      }
      valueRow[ensuredColumnIndex(key)] = String(node.data[key]);
    }
    for (const key of Object.keys(node.position)) {
      valueRow[ensuredColumnIndex(key)] = String(node.position[key]);
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
  return [expectedHeaderRow].concat(valueRows);
};
