/* tslint:disable:no-console */

import fs from "fs";
import { getExistingRows } from "./common";
import { edgesImport } from "./cytoscape/edgesImport";
import { Convert, Network } from "./cytoscape/networksJs";
import { nodesImport } from "./cytoscape/nodesImport";
import { Gsheets } from "./Gsheets";
import { acquireAuthenticatedGoogleOauth2Client } from "./runGoogleDriveAuth";
import { scopes } from "./scopes";

export async function runGsheetImport(
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

  // Use the target network js file as the base for the imported data
  const networksJsFileContents = fs.readFileSync(networksJsPath, "utf8");
  const networksJsJson = networksJsFileContents.substring(
    networksJsFileContents.indexOf("{"),
  );
  const networksJs = JSON.parse(networksJsJson);
  if (!networksJs[networkName]) {
    throw new Error(`No network with name "${networkName}" in networks JSON`);
  }
  const network: Network = Convert.toNetwork(
    JSON.stringify(networksJs[networkName]),
  );

  // Insert our modifications
  network.elements.nodes = await nodesImport(network, spreadsheetData.nodes);
  network.elements.edges = await edgesImport(network, spreadsheetData.edges);
  networksJs[networkName] = network;

  // Save the imported data to the target networkjs file
  fs.writeFileSync(
    networksJsPath,
    "var networks = " + JSON.stringify(networksJs, null, 2),
  );
  console.info(`CLI: Saved imported data in "${networksJsPath}"`);

  // Also save in Cytoscape networks.js format directly
  const cyJsPath = networksJsPath + ".cyjs";
  fs.writeFileSync(cyJsPath, Convert.networkToJson(network));
  console.info(`CLI: Saved imported data also in "${cyJsPath}"`);

  return true;
}
