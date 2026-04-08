var PROCESSED_LABEL = "VoicemailProcessed";

function processVoicemails() {
  var label = GmailApp.getUserLabelByName(PROCESSED_LABEL);
  if (!label) {
    label = GmailApp.createLabel(PROCESSED_LABEL);
  }

  var query = 'from:voice-noreply@google.com subject:"New voicemail from" -label:' + PROCESSED_LABEL;
  var threads = GmailApp.search(query, 0, 20);

  if (threads.length === 0) {
    return;
  }

  var props = PropertiesService.getScriptProperties();
  var apiUrl = props.getProperty("HOUSEFINDER_API_URL");
  var apiKey = props.getProperty("HOUSEFINDER_API_KEY");

  if (!apiUrl || !apiKey) {
    Logger.log("ERROR: HOUSEFINDER_API_URL or HOUSEFINDER_API_KEY not set in Script Properties");
    return;
  }

  // Get previously processed message IDs to prevent duplicates
  var processedIds = JSON.parse(props.getProperty("PROCESSED_IDS") || "[]");

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];

    // Label immediately BEFORE processing to prevent re-processing on next trigger
    thread.addLabel(label);

    var messages = thread.getMessages();
    var message = messages[0];
    var messageId = message.getId();

    // Skip if already processed (belt-and-suspenders with label)
    if (processedIds.indexOf(messageId) > -1) {
      Logger.log("Skipping already processed message: " + messageId);
      continue;
    }

    try {
      var subject = message.getSubject();
      var phoneMatch = subject.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
      var phone = phoneMatch ? phoneMatch[0] : "Unknown";

      var body = message.getPlainBody().trim();

      // Clean up Google Voice email artifacts
      var cleanBody = body;
      // Remove "play message" link text
      var playIdx = cleanBody.indexOf("play message");
      if (playIdx > -1) {
        cleanBody = cleanBody.substring(0, playIdx).trim();
      }
      // Remove Google Voice URLs
      cleanBody = cleanBody.replace(/https?:\/\/voice\.google\.com\S*/g, "").trim();
      cleanBody = cleanBody.replace(/https?:\/\/accounts\.google\.com\S*/g, "").trim();
      // Remove YOUR ACCOUNT footer
      var footerIdx = cleanBody.indexOf("YOUR ACCOUNT");
      if (footerIdx > -1) {
        cleanBody = cleanBody.substring(0, footerIdx).trim();
      }
      // Remove Google LLC footer
      var llcIdx = cleanBody.indexOf("Google LLC");
      if (llcIdx > -1) {
        cleanBody = cleanBody.substring(0, llcIdx).trim();
      }
      // Clean up extra whitespace
      cleanBody = cleanBody.replace(/\n{3,}/g, "\n\n").trim();

      var transcription = cleanBody || "(No transcription available)";

      var payload = {
        phone: phone,
        message: transcription,
        source: "voicemail"
      };

      var options = {
        method: "post",
        contentType: "application/json",
        headers: {
          "x-api-key": apiKey
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      var response = UrlFetchApp.fetch(apiUrl + "/api/leads", options);
      var statusCode = response.getResponseCode();

      if (statusCode === 201) {
        var result = JSON.parse(response.getContentText());
        Logger.log("Lead created: " + result.leadId + " | Phone: " + phone);
      } else {
        Logger.log("API error " + statusCode + ": " + response.getContentText() + " | Phone: " + phone);
      }

    } catch (e) {
      Logger.log("Error processing voicemail: " + e.message);
    }

    // Track message ID as processed
    processedIds.push(messageId);
  }

  // Keep only last 200 IDs to avoid hitting property size limits
  if (processedIds.length > 200) {
    processedIds = processedIds.slice(-200);
  }
  props.setProperty("PROCESSED_IDS", JSON.stringify(processedIds));
}

function testApiConnection() {
  var props = PropertiesService.getScriptProperties();
  var apiUrl = props.getProperty("HOUSEFINDER_API_URL");
  var apiKey = props.getProperty("HOUSEFINDER_API_KEY");

  if (!apiUrl || !apiKey) {
    Logger.log("ERROR: Script properties not set.");
    return;
  }

  var payload = {
    phone: "435-555-0000",
    message: "Test voicemail from Apps Script",
    source: "voicemail"
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "x-api-key": apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(apiUrl + "/api/leads", options);
  Logger.log("Status: " + response.getResponseCode());
  Logger.log("Response: " + response.getContentText());
}

function setupProperties() {
  var props = PropertiesService.getScriptProperties();
  props.setProperty("HOUSEFINDER_API_URL", "https://housefinder-app.azurewebsites.net");
  props.setProperty("HOUSEFINDER_API_KEY", "c5f2f08212e5f057875ad940df396c3aa71aee288c7017a70be1b18047f606d4");
  Logger.log("Properties set successfully");
}
