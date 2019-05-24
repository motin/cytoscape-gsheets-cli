export const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  // "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file", // Using drive.file instead of drive for less sensitive scope at the expense that the cli needs to create all gsheets that should be accessible
];
