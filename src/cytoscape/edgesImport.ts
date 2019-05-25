/* tslint:disable:no-console */

// import {relatedNodes} from "./common";
import {
  convertSpreadsheetRowsToJsObjects,
  getExpectedColumns,
} from "../common";
import { columns, getEdgeDataKeys } from "./edges";
import { Edge, Network } from "./networksJs";

export const edgesImport = async (
  existingNetwork: Network,
  spreadsheetRows,
): Promise<Edge[]> => {
  if (spreadsheetRows.length === 0) {
    return [];
  }

  // prepare export
  const headerRows: any[][] = spreadsheetRows.slice(0, 1);
  const valueRows: any[][] = spreadsheetRows.slice(1);

  // set up expected keys and headers
  const dataKeys = getEdgeDataKeys(existingNetwork);
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

  const mapSpreadsheetItemToEdge = async (
    spreadsheetItem: any,
  ): Promise<Edge> => {
    return {
      data: spreadsheetItem,
      selected: false,
    };
  };

  const edgePromises: Array<Promise<Edge>> = spreadsheetItems.map(
    mapSpreadsheetItemToEdge,
  );
  return Promise.all(edgePromises);
};
