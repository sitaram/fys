const ENDPOINT = "https://api.openai.com/v1/completions";
const SECRET_KEY = "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";
const MAX_TOKENS = 200;
const BATCH_SIZE = 3;
const NUM_TRIES = 10;
const SLEEP_SECS = 1;

function Prompt(title) {
  return "max three word summary containing brand name and other infrequent words from this string that may uniquely identify it, without the perid at the end: " + title;
}

function Q(title) {
  return GPT3(Prompt((title || '').replace(/amazon.com:* */i, ""))).replace(/\.$/, "");
}
/**
 * A custom function for generating text using GPT-3 in Google Sheets
 * @param {string} prompt The text you want GPT-3 to complete
 * @param {string} model The GPT-3 model to use (text-davinci-003 is the default)
 * @param {number} temperature The sampling temperature to use (0.4 is the default)
 * @return {string} The generated text
 * @customfunction
 */
function GPT3(prompt, model="text-davinci-003", temperature=0.4) {
  var apiKey = SECRET_KEY;
  var payload = {
    model: model,
    prompt: prompt,
    max_tokens: MAX_TOKENS,
    temperature: temperature
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: {
      "Authorization": "Bearer " + apiKey
    }
  };

  for (var i = 0; i < 10; i++) {
    try {
      var response = UrlFetchApp.fetch(ENDPOINT, options);
      var json = response.getContentText();
      var data = JSON.parse(json);
      return data.choices[0].text.trim();
    } catch (e) {
      Utilities.sleep(1000);
    }
  }
  return "ERR";
}

function GPT3Batch(prompts, model="text-davinci-003", temperature=0.4) {
  var requests = [];
  var errs = [];

  for (var i = 0; i < prompts.length; i++) {
    requests.push({
      url: ENDPOINT,
      contentType: "application/json",
      headers: { "Authorization": "Bearer " + SECRET_KEY },
      method: "post",
      // 'muteHttpExceptions': true,
      payload: JSON.stringify({
    	  model: model,
	      prompt: prompts[i],
      	max_tokens: MAX_TOKENS,
	      temperature: temperature
      }),
    });
    errs.push("ERR");
  }

  for (var i = 0; i < NUM_TRIES; i++) {
    try {
      var responses = UrlFetchApp.fetchAll(requests);
      var outs = [];
      for (var j = 0; j < responses.length; j++) {
        var json = responses[j].getContentText();
        var data = JSON.parse(json);
        outs.push(data.choices[0].text.trim().replace(/\.$/, ""));
      }
      return outs;
    } catch (e) {
      Utilities.sleep(SLEEP_SECS * 1000);
    }
  }
  return errs;
}

function DoBatch(sheet, lines, prompts) {
  for (var i = 0; i < lines.length; i++) {
    sheet.getRange(lines[i] + 1, 2).setValue("loading...");
  }
  SpreadsheetApp.flush();

  const outs = GPT3Batch(prompts);

  for (var i = 0; i < lines.length && i < outs.length; i++) {
    // write the output to the adjacent cell in column B
    // i+1 because arrays are 0-indexed
    sheet.getRange(lines[i] + 1, 2).setValue(outs[i]);
  }
  SpreadsheetApp.flush();
}

function DoAll() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange("A1:B");
  var values = range.getValues();

  var lines = [];
  var prompts = [];

  for (var i = 0; i < values.length; i++) {
    const input = values[i][0];
    const output = values[i][1];

    if (input == '') continue;
    if (output != '' && output != 'ERR' && output != 'loading...') continue;

    lines.push(i);
    prompts.push(Prompt((input || '').replace(/amazon.com:* */i, "")));

    if (lines.length > BATCH_SIZE) {
      DoBatch(sheet, lines, prompts);
      lines = [];
      prompts = [];
    }
  }

  if (lines.length > 0)
    DoBatch(sheet, lines, prompts);
}

DoAll()
