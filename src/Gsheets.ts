import { google, sheets_v4 } from "googleapis";
import Params$Resource$Spreadsheets$Values$Update = sheets_v4.Params$Resource$Spreadsheets$Values$Update;
import Schema$ValueRange = sheets_v4.Schema$ValueRange;
const logger = console;

export class Gsheets {
  private oauth2Client;
  private sheetsService;

  constructor(oauth2Client) {
    if (!oauth2Client) {
      throw new Error("oauth2Client must not be empty");
    }
    this.oauth2Client = oauth2Client;
    this.sheetsService = google.sheets({
      auth: this.oauth2Client,
      version: "v4",
    });
  }

  public async ensureAuthorized() {
    await this.oauth2Client.getAccessToken().catch(err => {
      throw new Error(err);
    });
  }

  public async getSpreadsheetMetadata(spreadsheetId) {
    try {
      const res = await this.sheetsService.spreadsheets
        .get({
          spreadsheetId,
        })
        .catch(err => {
          throw new Error(err);
        });
      return res.data;
    } catch (err) {
      logger.info(`The API returned an error: ${err}`);
      throw err;
    }
  }

  public async getValues(spreadsheetId, range): Promise<any[]> {
    try {
      const valueRenderOption = "UNFORMATTED_VALUE";
      const res = await this.sheetsService.spreadsheets.values
        .get({
          range,
          spreadsheetId,
          valueRenderOption,
        })
        .catch(err => {
          throw new Error(err);
        });
      return res.data.values || [];
    } catch (err) {
      logger.info(`The API returned an error: ${err}`);
      throw err;
    }
  }

  public async createSpreadsheet(title) {
    try {
      const resource = {
        properties: {
          title,
        },
      };
      const spreadsheet = await this.sheetsService.spreadsheets
        .create({
          fields: "spreadsheetId",
          resource,
        })
        .catch(err => {
          throw new Error(err);
        });
      logger.info(`Spreadsheet ID: ${spreadsheet.spreadsheetId}`);
      return spreadsheet;
    } catch (err) {
      logger.info(`The API returned an error: ${err}`);
      throw err;
    }
  }

  public writeSpreadsheetValues(
    spreadsheetId,
    values,
    range,
    valueInputOption = "USER_ENTERED",
  ) {
    try {
      const requestBody: Schema$ValueRange = {
        values,
      };
      const params: Params$Resource$Spreadsheets$Values$Update = {
        range,
        requestBody,
        spreadsheetId,
        valueInputOption,
      };
      return this.sheetsService.spreadsheets.values
        .update(params)
        .catch(err => {
          throw new Error(err);
        });
    } catch (err) {
      logger.info(`The API returned an error: ${err}`);
      throw err;
    }
  }
}
