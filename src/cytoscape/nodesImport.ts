/* tslint:disable:no-console */

// import {relatedEdges} from "./common";
import { getColumnByName, getExpectedColumns } from "../common";
import { Network, Node } from "./networksJs";
import { columns, getNodeDataKeys } from "./nodes";

export const nodesImport = async (
  existingNetwork: Network,
  spreadsheetRows,
): Promise<Node[]> => {
  if (spreadsheetRows.length === 0) {
    return [];
  }

  // prepare import
  const headerRows: any[][] = spreadsheetRows.slice(0, 1);
  const valueRows: any[][] = spreadsheetRows.slice(1);

  // set up expected keys and headers
  const dataKeys = getNodeDataKeys(existingNetwork);
  const expectedColumns = getExpectedColumns(columns, headerRows, dataKeys);
  const expectedHeaderRow = expectedColumns.map(
    expectedColumn => expectedColumn.name,
  );

  console.log({ expectedColumns, expectedHeaderRow });

  // convert spreadsheet rows to js objects
  const spreadsheetItems = valueRows.map(valueRow => {
    return headerRows[0].reduce((_, header, index) => {
      const value = valueRow[index];
      _[getColumnByName(expectedColumns, header).key] =
        typeof value === "boolean" ? value : String(valueRow[index]);
      return _;
    }, {});
  });
  console.log({ spreadsheetItems });

  const mapSpreadsheetItemToNode = async (
    spreadsheetItem: any,
  ): Promise<Node> => {
    const position = {
      x: parseInt(spreadsheetItem.x, 10),
      y: parseInt(spreadsheetItem.y, 10),
    };
    delete spreadsheetItem.x;
    delete spreadsheetItem.y;
    return {
      data: spreadsheetItem,
      position,
      selected: false,
    };
  };

  const nodePromises: Array<Promise<Node>> = spreadsheetItems.map(
    mapSpreadsheetItemToNode,
  );
  return Promise.all(nodePromises);
};
