/* alexa-my-calendar */

const Alexa = require("ask-sdk-core");
const Axios = require("axios");

const SKILL_NAME = "My Calendar";
const EVENTS_URL = "https://content.googleapis.com/calendar/v3/calendars/primary/events";
const MONTHS = ['January','February','March','April','May','June','July','August',
  'September','October','November','December'];

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Welcome to My Calendar, you can say open my events for today, or a specific date";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_NAME, speechText)
      .getResponse();
  }
};

const GetDateEventsIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetDateEventsIntent"
    );
  },
  async handle(handlerInput) {
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    console.log(accessToken);

    let timeMin = new Date();
    let timeMax = new Date();
    let preamble = "Your events for ";

    if (handlerInput.requestEnvelope.request.intent.slots.date &&
        handlerInput.requestEnvelope.request.intent.slots.date.value) {
      const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
      timeMin = new Date(Date.parse(date + 'T01:00'));
      timeMax = new Date(Date.parse(date + 'T01:00'));
      preamble += MONTHS[timeMin.getMonth()] + " " + timeMin.getDate() + ": ";
    } else {
      preamble += "today: "
    }
    
    timeMin.setHours(0,0,0,0);  
    timeMax.setHours(23,59,59,999);

    console.log("timeMin: " + timeMin.toISOString());
    console.log("timeMax: " + timeMax.toISOString());

    const eventsSpeechText = await getEventsSpeech(accessToken, timeMin.toISOString(), timeMax.toISOString());

    return handlerInput.responseBuilder
      .speak(preamble + eventsSpeechText)
      .withSimpleCard(SKILL_NAME, preamble + eventsSpeechText)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText = "You can say events for today, or say a particular date";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_NAME, speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name === "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "Goodbye!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(SKILL_NAME, speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    );
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  }
};

const getEventsSpeech = async (accessToken, timeMin, timeMax) => {
  const noEvents = 'There are no events';
  const url = EVENTS_URL + "?orderBy=updated&timeMin=" + timeMin + "&timeMax=" + timeMax;
  console.log("URL: " + url);

  const eventsResponse = await getEvents(url, accessToken);

  if (eventsResponse && eventsResponse.data) {
    console.log("Get events OK: " + JSON.stringify(eventsResponse.data));

    const events = eventsResponse.data.items;

    if (events.length > 0) {
      let eventsSpeechText = "";
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        eventsSpeechText += "Event " + (i+1) + ": " + event.summary + ' - ' + event.description + '. ';
        eventsSpeechText += "Location: " + event.location + ". From " + getHour(event.start.dateTime) +
          " to " + getHour(event.end.dateTime) + ". ";
      }
      return eventsSpeechText;
    }
  }
  return noEvents;
};

const getEvents = async (url, accessToken) => {
  try {
    const config = {
      headers: {'Authorization': 'Bearer ' + accessToken}
    };
    return await Axios.get(url, config);

  } catch (error) {
    console.log('Error getting events');
    console.error(error);
  }
}

const getHour = (dateTime) => {
  const date = new Date(Date.parse(dateTime));
  let hour = date.getHours() - (date.getTimezoneOffset()/60);
  let time = 'AM';
  let hourText = '';

  if (hour > 12) {
    hour -=12;
    time = 'PM';
  }
  hourText += hour;
  if (date.getMinutes() > 0) {
    hourText += ":" + date.getMinutes();
  }
  hourText += " " + time;

  return hourText;
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetDateEventsIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
