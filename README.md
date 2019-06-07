# Alexa Skill My Calendar
Alexa Skill to get the events from Google Calendar for a date.

<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/header._TTH_.png" />

## Skill Architecture
Each skill consists of two basic parts, a front end and a back end.
The front end is the voice interface, or VUI.
The voice interface is configured through the voice interaction model.
The back end is where the logic of your skill resides.

### Backend AWS Lambda

The backend of the skill is an AWS Lambda function written in NodeJS, using the alexa-sdk version 2, and axios to perform a get request to pull the events from Google Calendar.
The Alexa Skill should set up the Account Linking section to allow the user connect the skill to his/her Google Account. For this, please check the instructions here:
[https://developer.amazon.com/docs/account-linking/understand-account-linking.html](https://developer.amazon.com/docs/account-linking/understand-account-linking.html)

Once the Google account is linked to the Skill, Alexa will send a user acces token to be included in the Google Calendar requests:

``
handlerInput.requestEnvelope.context.System.user.accessToken
``

**Get primary calendar details:**

+ **URL:**
https://content.googleapis.com/calendar/v3/calendars/primary

+ **Headers:**
Authorization: Bearer {access-token-from-alexa-request}

**Get events:**

+ **URL:**
https://content.googleapis.com/calendar/v3/calendars/primary/events?orderBy=updated&timeMin=2019-06-08T00:00:00-00:00&timeMax=2019-06-08T23:59:59-00:00
+ **Headers:**
Authorization: Bearer {access-token-from-alexa-request}

## Invocation name and intents
To invoke this Alexa Skill please say:

``
alexa open my events for today
``

``
alexa open my events for {date}
``

---

## Additional Resources

### Community
* [Amazon Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html) - Join the conversation!
* [Hackster.io](https://www.hackster.io/amazon-alexa) - See what others are building with Alexa.

### Tutorials & Guides
* [Voice Design Guide](https://developer.amazon.com/designing-for-voice/) - A great resource for learning conversational and voice user interface design.
* [Codecademy: Learn Alexa](https://www.codecademy.com/learn/learn-alexa) - Learn how to build an Alexa Skill from within your browser with this beginner friendly tutorial on Codecademy!

### Documentation
* [Official Alexa Skills Kit Node.js SDK](https://www.npmjs.com/package/ask-sdk) - The Official Node.js SDK Documentation
*  [Official Alexa Skills Kit Documentation](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html) - Official Alexa Skills Kit Documentation
