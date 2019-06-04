/* tslint:disable:no-console */

import fs from "fs";
import { getExistingRows, writeUpdatedValues } from "./common";
import { edgesExport } from "./cytoscape/edgesExport";
import { Convert, Network } from "./cytoscape/networksJs";
import { nodesExport } from "./cytoscape/nodesExport";
import { Gsheets } from "./Gsheets";
import { acquireAuthenticatedGoogleOauth2Client } from "./runGoogleDriveAuth";
import { scopes } from "./scopes";

export async function runGsheetExport(
  googleOauth2ClientId,
  gsheetsApiCredentialsFile,
  spreadsheetId,
  networksJsPath,
  networkName,
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

  // prepare data to export
  const networksJsFileContents = fs.readFileSync(networksJsPath, "utf8");
  const networksJsJson = networksJsFileContents.substring(
    networksJsFileContents.indexOf("{"),
  );
  const networksJs = JSON.parse(networksJsJson);
  const network: Network = Convert.toNetwork(
    JSON.stringify(networksJs[networkName]),
  );

  console.log("CLI: Nodes to export", network.elements.nodes.length);
  console.log("CLI: Edges to export", network.elements.edges.length);

  const nodesSheetName = `nodes`;
  console.info(`CLI: Exporting nodes to "${nodesSheetName}"`);

  const existingNodesRows = await getExistingRows(
    gsheets,
    spreadsheetId,
    nodesSheetName,
  );
  const updatedNodesValues = await nodesExport(
    existingNodesRows,
    network,
  ).catch(err => {
    console.error({ err });
    throw err;
  });
  await writeUpdatedValues(
    gsheets,
    spreadsheetId,
    nodesSheetName,
    updatedNodesValues,
  );

  const edgesSheetName = `edges`;
  console.info(`CLI: Exporting edges to "${edgesSheetName}"`);

  const existingEdgesRows = await getExistingRows(
    gsheets,
    spreadsheetId,
    edgesSheetName,
  );
  const updatedEdgesValues = await edgesExport(
    existingEdgesRows,
    network,
  ).catch(err => {
    console.error({ err });
    throw err;
  });
  await writeUpdatedValues(
    gsheets,
    spreadsheetId,
    edgesSheetName,
    updatedEdgesValues,
  );

  return true;
}
