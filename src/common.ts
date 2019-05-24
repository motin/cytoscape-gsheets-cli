/* tslint:disable:no-console */

import { Network, NodeData } from "./cytoscape/networksJs";

export const getExistingRows = async (gsheets, spreadsheetId, sheetName) => {
  const range = `${sheetName}`;
  const existingRows: any[][] = await gsheets
    .getValues(spreadsheetId, range)
    .catch(err => {
      throw new Error(err);
    });
  console.log(
    `CLI: Rows count in sheet "${sheetName}": ${existingRows.length}`,
  );
  return existingRows;
};

export const relatedEdges = (_network: Network, _node: NodeData) => {
  return [];
};
