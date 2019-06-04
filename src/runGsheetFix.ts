/* tslint:disable:no-console */

import { getExistingRows, writeUpdatedValues } from "./common";
import { fixNodesAndEdges } from "./cytoscape/fixNodesAndEdges";
import { Gsheets } from "./Gsheets";
import { acquireAuthenticatedGoogleOauth2Client } from "./runGoogleDriveAuth";
import { scopes } from "./scopes";

export async function runGsheetFix(
  googleOauth2ClientId,
  gsheetsApiCredentialsFile,
  spreadsheetId,
) {
  const gsheets = new Gsheets(
    await acquireAuthenticatedGoogleOauth2Client(
      gsheetsApiCredentialsFile,
      googleOauth2ClientId,
      scopes,
    ),
  );
  await gsheets.ensureAuthorized().catch(err => {
    console.error("Error occurred in gsheets.ensureAuthorized()", { err });
    throw new Error(err);
  });

  if (!spreadsheetId) {
    throw new Error("Missing spreadsheetId");
  }

  // fetch all spreadsheet data
  const spreadsheetMetadata = await gsheets.getSpreadsheetMetadata(
    spreadsheetId,
  );

  const spreadsheetData: { [k: string]: any[][] } = {};

  await Promise.all(
    spreadsheetMetadata.sheets.map(async sheetInfo => {
      const sheetName = sheetInfo.properties.title;
      console.info(`CLI: Importing data from "${sheetName}"`);
      spreadsheetData[sheetName] = await getExistingRows(
        gsheets,
        spreadsheetId,
        sheetName,
      );
    }),
  );

  // console.log(spreadsheetData.nodes, spreadsheetData.edges);

  const { updatedNodeValues, updatedEdgeValues } = await fixNodesAndEdges(
    spreadsheetData.nodes,
    spreadsheetData.edges,
  );

  // console.log({ updatedNodeValues, updatedEdgeValues });

  if (updatedNodeValues.length > 0) {
    await writeUpdatedValues(
      gsheets,
      spreadsheetId,
      "nodes",
      updatedNodeValues,
    );
  }

  if (updatedEdgeValues.length > 0) {
    await writeUpdatedValues(
      gsheets,
      spreadsheetId,
      "edges",
      updatedEdgeValues,
    );
  }

  return true;
}
