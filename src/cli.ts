/* tslint:disable:no-console */

import { ArgumentParser } from "argparse";
import stackman from "stackman";
import { runGsheetCreate } from "./runGsheetCreate";
import { runGsheetImport } from "./runGsheetImport";

process.once("unhandledRejection", (err: Error, _p) => {
  console.log("Event: Unhandled Rejection");

  stackman().callsites(err, (stackmanErr, callsites) => {
    if (stackmanErr) {
      throw stackmanErr;
    }
    callsites.forEach(callsite => {
      console.log(
        "Error occured in at %s line %d",
        callsite.getFileName(),
        callsite.getLineNumber(),
      );
    });
  });

  console.error(err.stack, err);
  // debugger;
  process.exit(1);
});

process.once("uncaughtException", err => {
  console.log("Event: Uncaught Exception");

  stackman().callsites(err, (stackmanErr, callsites) => {
    if (stackmanErr) {
      throw stackmanErr;
    }
    callsites.forEach(callsite => {
      console.log(
        "Error occured in at %s line %d",
        callsite.getFileName(),
        callsite.getLineNumber(),
      );
    });
  });

  console.error(err.stack, err);
  // debugger;
  process.exit(1);
});

Error.stackTraceLimit = Infinity;

try {
  // const packageInfo = require("./package.json");
  const parser = new ArgumentParser({
    // version: packageInfo.version,
    // description: packageInfo.description,
    addHelp: true,
  });
  parser.addArgument(["--googleOauth2ClientId"], {
    help: "googleOauth2ClientId",
    required: false,
  });
  parser.addArgument(["--gsheetsApiCredentialsFile"], {
    help: "gsheetsApiCredentialsFile",
    required: false,
  });
  parser.addArgument(["--gsheetCreate"], {
    help: "gsheetCreate",
    required: false,
  });
  parser.addArgument(["--gsheetImport"], {
    help: "gsheetImport",
    required: false,
  });
  parser.addArgument(["--spreadsheetId"], {
    help: "spreadsheetId",
    required: false,
  });
  parser.addArgument(["--targetPath"], {
    help: "targetPath",
    required: false,
  });
  const args = parser.parseArgs();
  console.log("CLI arguments: ", args, "\n");

  const {
    googleOauth2ClientId,
    gsheetsApiCredentialsFile,
    gsheetCreate,
    gsheetImport,
    spreadsheetId,
    targetPath,
  } = args;

  (async () => {
    if (gsheetCreate) {
      await runGsheetCreate(
        googleOauth2ClientId,
        gsheetsApiCredentialsFile,
      ).catch(error => {
        throw new Error(error);
      });
    }

    if (gsheetImport) {
      await runGsheetImport(
        googleOauth2ClientId,
        gsheetsApiCredentialsFile,
        spreadsheetId,
        targetPath,
      ).catch(error => {
        throw new Error(error);
      });
    }
  })();
} catch (e) {
  console.log("CLI: Caught error:");
  console.error(e);
}
