import { naiveAutoCastFromAndToSpreadsheetAwarePrimitives } from "../common";
import { columns } from "./edges";
import { Edge } from "./networksJs";

export const edgeConversionFunctions = expectedColumns => {
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

  const edgeToRow = async (
    edge: Edge,
    $idColIndex,
    $noopUpdateRow,
    $expectedColumns,
    $ensuredColumnIndex,
  ): Promise<any[]> => {
    const valueRow = $noopUpdateRow();

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
    for (const key of $expectedColumns.map(
      expectedColumn => expectedColumn.key,
    )) {
      // ignore those that are formulas - they should not be overwritten
      if (columns.find(column => column.key === key && column.formula)) {
        continue;
      }
      valueRow[
        $ensuredColumnIndex(key)
      ] = naiveAutoCastFromAndToSpreadsheetAwarePrimitives(edge.data[key]);
    }

    // use original ids if available
    if (edge.data.id_original) {
      valueRow[$idColIndex] = edge.data.id_original;
    }
    if (edge.data.source_original) {
      valueRow[$ensuredColumnIndex("source")] = edge.data.source_original;
    }
    if (edge.data.target_original) {
      valueRow[$ensuredColumnIndex("target")] = edge.data.target_original;
    }

    return valueRow;
  };

  const mapEdgeToValueRow = async (edge: Edge): Promise<any[]> => {
    return edgeToRow(
      edge,
      idColIndex,
      noopUpdateRow,
      expectedColumns,
      ensuredColumnIndex,
    );
  };

  return {
    ensuredColumnIndex,
    idColIndex,
    mapEdgeToValueRow,
    nameColIndex,
    noopUpdateRow,
    syncStatusColIndex,
  };
};
