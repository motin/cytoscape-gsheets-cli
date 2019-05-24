/* tslint:disable:no-console */

import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import http from "http";
import opn from "opn";
import destroyer from "server-destroy";
import { URL } from "url";

export async function acquireAuthenticatedGoogleOauth2Client(
  credentialsFile,
  clientId,
  scopes,
) {
  if (!clientId || clientId === "") {
    throw new Error("Client id must not be empty");
  }

  let credentials;
  if (credentialsFile && fs.existsSync(credentialsFile)) {
    credentials = JSON.parse(fs.readFileSync(credentialsFile, "utf8"));
  } else {
    credentials = await runGoogleDriveAuth(clientId, scopes).catch(err => {
      console.error({ err });
      throw new Error(err);
    });
    fs.writeFileSync(credentialsFile, JSON.stringify(credentials));
    console.log(
      `CLI: Stored oauth2 access credentials in "${credentialsFile}"`,
    );
  }

  const googleOauth2Client = ($clientId, $credentials) => {
    if (!$clientId || $clientId === "") {
      throw new Error("Client id must not be empty");
    }
    const oauth2Client = new google.auth.OAuth2({
      clientId: $clientId,
    });
    oauth2Client.on("tokens", _tokens => {
      console.log("CLI: Stored refreshed access token: TODO", {
        $credentials,
        _tokens,
      });
      // fs.writeFileSync(credentialsFile, JSON.stringify(_tokens));
    });
    oauth2Client.setCredentials($credentials);
    return oauth2Client;
  };

  return googleOauth2Client(clientId, credentials);
}

/**
 * Acquire a authenticated oAuth2 client
 */
export async function runGoogleDriveAuth(clientId, scopes) {
  const oAuth2Client = await getAuthenticatedClient(clientId, scopes);

  oAuth2Client.on("tokens", tokens => {
    console.log("runGoogleDriveAuth - TOKENS");
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      console.log(tokens.refresh_token);
    }
    console.log(tokens.access_token);
  });

  // Make a simple request to the People API using our pre-authenticated client. The `request()` method
  // takes an GaxiosOptions object.  Visit https://github.com/JustinBeckwith/gaxios.
  /*const res =*/ await oAuth2Client.request({
    url: "https://people.googleapis.com/v1/people/me?personFields=names",
  });
  // console.log(res.data);

  // After acquiring an access_token, you may want to check on the audience, expiration,
  // or original scopes requested.  You can do that with the `getTokenInfo` method.
  /*const tokenInfo =*/ await oAuth2Client.getTokenInfo(
    oAuth2Client.credentials.access_token,
  );
  // console.log(tokenInfo);

  return oAuth2Client.credentials;
}

/**
 * Create a new OAuth2Client, and go through the OAuth2 content
 * workflow.  Return the full client to the callback.
 */
function getAuthenticatedClient(clientId, scopes): Promise<OAuth2Client> {
  return new Promise((resolve, reject) => {
    // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
    // which should be downloaded from the Google Developers Console.
    const oAuth2Client = new OAuth2Client({
      clientId,
      redirectUri: "http://127.0.0.1:3000/oauth2callback",
    });

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      // To get a refresh token, you MUST set access_type to `offline`.
      access_type: "offline",
      // A refresh token is only returned the first time the user
      // consents to providing access.  For illustration purposes,
      // setting the prompt to 'consent' will force this consent
      // every time, forcing a refresh_token to be returned.
      prompt: "consent",
      // set the appropriate scopes
      scope: scopes,
    });

    // Open an http server to accept the oauth callback. In this simple example, the
    // only request to our webserver is to /oauth2callback?code=<code>
    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf("/oauth2callback") > -1) {
            // acquire the code from the querystring, and close the web server.
            const qs = new URL(req.url, "http://127.0.0.1:3000").searchParams;
            const code = qs.get("code");
            console.log(`Code is ${code}`);
            res.end("Authentication successful! Please return to the console.");
            server.destroy();

            // Now that we have the code, use that to acquire tokens.
            const r = await oAuth2Client.getToken(code);

            // Now tokens contains an access_token and an optional refresh_token. Save them.
            // TODO SAVE

            // Make sure to set the credentials on the OAuth2 client.
            oAuth2Client.setCredentials(r.tokens);
            console.info("Tokens acquired.");
            resolve(oAuth2Client);
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(3000, () => {
        // open the browser to the authorize url to start the workflow
        opn(authorizeUrl, { wait: false }).then(cp => cp.unref());
      });
    destroyer(server);
  });
}
