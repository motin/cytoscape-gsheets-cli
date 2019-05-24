/* tslint:disable:no-console */

import fs from "fs";
import { getExistingRows } from "./common";
import { Gsheets } from "./Gsheets";
import { acquireAuthenticatedGoogleOauth2Client } from "./runGoogleDriveAuth";
import { scopes } from "./scopes";

export async function runGsheetImport(
  googleOauth2ClientId,
  gsheetsApiCredentialsFile,
  spreadsheetId,
  targetPath,
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

  const spreadsheetMetadata = await gsheets.getSpreadsheetMetadata(
    spreadsheetId,
  );

  const importedData = new Map();

  await Promise.all(
    spreadsheetMetadata.sheets.map(async sheetInfo => {
      const sheetName = sheetInfo.properties.title;
      console.info(`CLI: Importing data from "${sheetName}"`);
      importedData[sheetName] = await getExistingRows(
        gsheets,
        spreadsheetId,
        sheetName,
      );
    }),
  );

  // Save imported data to file
  fs.writeFileSync(targetPath, JSON.stringify(importedData));
  console.info(`CLI: Saved imported data in "${targetPath}"`);

  return true;
}
