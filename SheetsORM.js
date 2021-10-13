const { google } = require('googleapis');
const axios = require('axios');


const KEYFILE = 'gcredentials.json';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const GOOGLE_SPREADSHEET_ID = '1H4ANspi0tZTSxr19oG9pqh23wvTYJXPFlsP7_dyppbo';

async function getGoogleAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: SCOPES,
  });

  // create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });
  return { auth, googleSheets };
}


async function getSheetsQueryResponse(range, query) {
  console.log('GoogleSheetsService:getSheetsQueryResponse::Fetching Range:', range, 'Query:', query);
  // errors must be caught by calling function

  const { auth, googleSheets } = await getGoogleAuth();
  const spreadsheetId = GOOGLE_SPREADSHEET_ID;
  const gauth = new google.auth.JWT({
    keyFile: KEYFILE,
    scopes: [SCOPES]
  });
  const requestHeaders = await gauth.getRequestHeaders();

  const config = {
    method: 'get',
    url: `https://docs.google.com/spreadsheets/d/${ GOOGLE_SPREADSHEET_ID }/gviz/tq`,
    headers: requestHeaders,
    params: {
      range,
      tqx: 'out:json',
      tq: query
    }
  };

  const response = await axios(config);  
  const startJSONIndex = response.data.indexOf('{');
  const endJSONIndex = response.data.lastIndexOf('}');  
  return JSON.parse(response.data.slice(startJSONIndex, endJSONIndex + 1));
}


async function appendToSheet(range, packet) {
  const { auth, googleSheets } = await getGoogleAuth();
  const spreadsheetId = GOOGLE_SPREADSHEET_ID;
  const response = await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: packet
    }
  });
  return response;
}


async function clearFromSheet(range) {
  const { auth, googleSheets } = await getGoogleAuth();
  const spreadsheetId = GOOGLE_SPREADSHEET_ID;
  const response = await googleSheets.spreadsheets.values.clear({
    auth,
    spreadsheetId,
    range,    
  });
  return response;
}


async function lookup(range, value) {
  const { auth, googleSheets } = await getGoogleAuth();
  const spreadsheetId = GOOGLE_SPREADSHEET_ID;
  const response = await googleSheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    includeValuesInResponse: true,
    range: 'LOOKUP_SHEET!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
         `=MATCH("${ value }", ${ range }, 0)`
        ]
      ]
    }
  });
  try {    
    return parseInt(response.data.updatedData.values[0][0], 10) || -1;
  } catch(error) {
    return -1;
  }
}


async function updateRowInSheet(range, packet) {
  const { auth, googleSheets } = await getGoogleAuth();
  const spreadsheetId = GOOGLE_SPREADSHEET_ID;
  const response = await googleSheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range,
    includeValuesInResponse: true,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        packet
      ]
    }
  });
  try {
    console.log(response);    
    return parseInt(response.data.updatedData.values[0][0], 10) || -1;
  } catch(error) {
    return -1;
  }
}


module.exports = {
  getSheetsQueryResponse,
  appendToSheet,  
  clearFromSheet,
  updateRowInSheet,
  lookup,
}