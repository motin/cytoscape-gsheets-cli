# generic-gsheets-cli

## Typical run commands

Import data from Gsheets:
```
source .env.example
npm run build && npm run cli -- \
  --googleOauth2ClientId "$GOOGLE_OAUTH2_CLIENT_ID" \
  --gsheetsApiCredentialsFile "$GSHEETS_API_CREDENTIALS_FILE" \
  --gsheetImport 1 \
  --spreadsheetId "<use-one-created-using-gsheetCreate>" \
  --targetPath "imported-data.json"
```

Create a Google Spreadsheet to use with this cli:
```
source .env.example
npm run build && npm run cli -- \
  --googleOauth2ClientId "$GOOGLE_OAUTH2_CLIENT_ID" \
  --gsheetsApiCredentialsFile "$GSHEETS_API_CREDENTIALS_FILE" \
  --gsheetCreate 1
```
