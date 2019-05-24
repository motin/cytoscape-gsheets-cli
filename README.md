# Cytoscape Gsheets cli

Allows using Google Spreadsheets to edit [Cytoscape](https://cytoscape.org/) networks

## Typical run commands

Import data from Gsheets:
```
source .env.example
npm run build && npm run cli -- \
  --googleOauth2ClientId "$GOOGLE_OAUTH2_CLIENT_ID" \
  --gsheetsApiCredentialsFile "$GSHEETS_API_CREDENTIALS_FILE" \
  --gsheetImport 1 \
  --spreadsheetId "<use-one-created-using-gsheetCreate>" \
  --networksJsPath "networks.js" \
  --networkName "Foo"
```

Push Cytoscape data to Gsheets:
```
npm run build && npm run cli -- \
  --googleOauth2ClientId "$GOOGLE_OAUTH2_CLIENT_ID" \
  --gsheetsApiCredentialsFile "$GSHEETS_API_CREDENTIALS_FILE" \
  --gsheetExport 1 \
  --spreadsheetId "<use-one-created-using-gsheetCreate>" \
  --networksJsPath "networks.js" \
  --networkName "Foo"
```

Create a Google Spreadsheet to use with this cli:
```
source .env.example
npm run build && npm run cli -- \
  --googleOauth2ClientId "$GOOGLE_OAUTH2_CLIENT_ID" \
  --gsheetsApiCredentialsFile "$GSHEETS_API_CREDENTIALS_FILE" \
  --gsheetCreate 1
```
