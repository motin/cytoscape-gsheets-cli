# Cytoscape Gsheets cli

Allows using Google Spreadsheets to edit [Cytoscape](https://cytoscape.org/) networks

## Typical run commands

Create a Google Spreadsheet to use with this cli:
```
source .env.example
npm run cli -- \
  --googleOauth2ClientId "$GOOGLE_OAUTH2_CLIENT_ID" \
  --gsheetsApiCredentialsFile "$GSHEETS_API_CREDENTIALS_FILE" \
  --gsheetCreate 1
```

Push Cytoscape networks.js data to Gsheets:
```
source .env.example
npm run cli -- \
  --googleOauth2ClientId "$GOOGLE_OAUTH2_CLIENT_ID" \
  --gsheetsApiCredentialsFile "$GSHEETS_API_CREDENTIALS_FILE" \
  --gsheetExport 1 \
  --spreadsheetId "<use-one-created-using-gsheetCreate>" \
  --networksJsPath "networks.js" \
  --networkName "Foo"
```

Check and fix relational data in Gsheets:
```
source .env.example
npm run cli -- \
  --googleOauth2ClientId "$GOOGLE_OAUTH2_CLIENT_ID" \
  --gsheetsApiCredentialsFile "$GSHEETS_API_CREDENTIALS_FILE" \
  --gsheetFix 1 \
  --spreadsheetId "<use-one-created-using-gsheetCreate>"
```

Import data from Gsheets into networks.js:
```
source .env.example
npm run cli -- \
  --googleOauth2ClientId "$GOOGLE_OAUTH2_CLIENT_ID" \
  --gsheetsApiCredentialsFile "$GSHEETS_API_CREDENTIALS_FILE" \
  --gsheetImport 1 \
  --spreadsheetId "<use-one-created-using-gsheetCreate>" \
  --networksJsPath "networks.js" \
  --networkName "Foo"
```
