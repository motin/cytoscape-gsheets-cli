/* tslint:disable:no-console */

import { Network, NodeData } from "./cytoscape/networksJs";
import { Gsheets } from "./Gsheets";

export const getExistingRows = async (
  gsheets: Gsheets,
  spreadsheetId,
  sheetName,
) => {
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

export const writeUpdatedValues = async (
  gsheets,
  spreadsheetId,
  sheetName,
  updatedValues,
) => {
  // target range
  const range = `${sheetName}`;

  console.info(`CLI: Writing ${updatedValues.length} rows to "${sheetName}"`);
  await gsheets
    .writeSpreadsheetValues(spreadsheetId, updatedValues, range)
    .catch(err => {
      console.error({ err });
      throw new Error(err);
    });

  // read back the current contents of the sheet
  const rows = await gsheets.getValues(spreadsheetId, range).catch(err => {
    console.error({ err });
    throw new Error(err);
  });
  console.log("CLI: Rows count in exported sheet after export", rows.length);
};

export const getExpectedColumns = (
  columns,
  existingHeaderRows: any[][],
  dataKeys,
) => {
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
  return expectedColumns;
};

export const getColumnByName = ($columns, name: string) => {
  const column = $columns.find($column => $column.name === name);
  if (!column) {
    throw new Error(`Column not found: name='${name}'`);
  }
  return column;
};

export const naiveAutoCastFromAndToSpreadsheetAwarePrimitives = value =>
  ["boolean", "undefined"].includes(typeof value)
    ? value
    : value === "undefined"
    ? undefined
    : String(value);

export const convertSpreadsheetRowsToJsObjects = (
  spreadsheetRows,
  headerRows,
  expectedColumns,
) => {
  return spreadsheetRows.map(valueRow => {
    return headerRows[0].reduce((_, header, index) => {
      const value = valueRow[index];
      const castValue = naiveAutoCastFromAndToSpreadsheetAwarePrimitives(value);
      _[getColumnByName(expectedColumns, header).key] = castValue;
      return _;
    }, {});
  });
};

export const relatedEdges = (_network: Network, _node: NodeData) => {
  return [];
};
