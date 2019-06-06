/* tslint:disable:no-console */

// import {relatedEdges} from "./common";
import {
  convertSpreadsheetRowsToJsObjects,
  getExpectedColumns,
} from "../common";
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
  const spreadsheetItems = convertSpreadsheetRowsToJsObjects(
    valueRows,
    headerRows,
    expectedColumns,
  );
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
    if (spreadsheetItem.size) {
      spreadsheetItem.size = parseInt(spreadsheetItem.size, 10);
    }
    if (spreadsheetItem.label_width) {
      spreadsheetItem.label_width = parseInt(
        spreadsheetItem.label_width,
        10,
      );
    }
    if (spreadsheetItem.label_font_size) {
      spreadsheetItem.label_font_size = parseInt(
        spreadsheetItem.label_font_size,
        10,
      );
    }
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
