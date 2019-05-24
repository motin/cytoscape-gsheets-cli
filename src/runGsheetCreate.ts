/* tslint:disable:no-console */

import { Gsheets } from "./Gsheets";
import { acquireAuthenticatedGoogleOauth2Client } from "./runGoogleDriveAuth";
import { scopes } from "./scopes";

export async function runGsheetCreate(
  googleOauth2ClientId,
  gsheetsApiCredentialsFile,
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

  const title = "CLI-created Spreadsheet Foo"; // TODO: Add current date and time?
  const spreadsheet = await gsheets.createSpreadsheet(title);
  console.log(
    `CLI: Created spreadsheet with id: "${spreadsheet.data.spreadsheetId}"`,
  );

  return true;
}
