'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = 'amzn1.ask.skill.78f18c0c-9f49-403b-b173-370f7ad99dfd'; // TODO replace with your app ID (OPTIONAL).
var recipes = require('./recipes');
var digitalTransform = require('./digitaltransform')

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(newSessionHandlers, categoryHandlers, glossaryHandlers, digitalHandlers);
    alexa.execute();
};

// states of our state machine
var states = Object.freeze({
    MAINCATEGORIES: '_MAINCATEGORIES',
    AGILEGLOSSARY: '_AGILEGLOSSARY',
    DIGITALTRANSFORM: '_DIGITALTRANSFORM',
    INNOVATION: '_INNOVATION'
});

var welcomeReprompt = 'Here are your Categories: Agile Glossary, Digital transformation, or Innovation? Which one do you want?';


// map storing text related to certain states
var categories = new Object();
categories['agile glossary'] = Object.freeze({
  msg: '<emphasis>Agile Glossary</emphasis> - You can ask me What does X mean? For example what does agile mean? Go ahead, ask me.',
  state: states.AGILEGLOSSARY,
  repromt: 'Ask me more agile terms, or say: main menu.',
  invalidTerm: 'Sorry, I am not fully developed yet. I can only handle basic agile terms.',
  wrongQuestion: '<say-as interpret-as="interjection">oh boy!</say-as>, that was different.  Try again by asking: What Does X mean?'
});
categories['digital transformation'] = Object.freeze({
  msg: '<emphasis>Digital Transformation</emphasis> - You can ask me What does X mean? For example what does Digital Transformation mean? Go ahead, ask me.',
  state: states.DIGITALTRANSFORM,
  repromt: 'Ask me more digital transformation terms, or say: main menu.',
  invalidTerm: 'Sorry, I am not fully developed yet. I can only handle basic agile terms.',
  wrongQuestion: '<say-as interpret-as="interjection">oh boy!</say-as>, that was different.  Try again by asking: What Does X mean?'
});
categories['innovation'] = Object.freeze({
  msg: '<emphasis>Innovation</emphasis> - One of the fastest ways to innovation is typically a rapid proof of concept. Agile Trail Blazers can help you build a P O C around any technology; voice, artificial intelligence or blockchain in a rapid low-cost manner.<break time="2s"/>' + welcomeReprompt,
  state: states.MAINCATEGORIES,
  repromt: welcomeReprompt
});

// This seems to be needed to launch the app in default state
var newSessionHandlers = {
  'LaunchRequest': function() {
      this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME")) + ' ' + this.t("WELCOME_REPROMPT");
      this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
      this.handler.state = states.MAINCATEGORIES;
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
  },

  'Unhandled': function () {
    this.emit('LaunchRequest');
  }
}

// This is the main state handler. The application is navigated to this state at launch
var categoryHandlers = Alexa.CreateStateHandler(states.MAINCATEGORIES, {
    // handles with new session is created
    'NewSession': function() {
        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME")) + ' ' + this.t("WELCOME_REPROMPT");
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    // handles anything not handled explicityly
    'Unhandled': function () {
      // in this case we will ask the user to select from the main categories
      this.attributes['speechOutput'] = this.t('<say-as interpret-as="interjection">oh boy!</say-as>, that was different. ') + this.t("WELCOME_REPROMPT");
      this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    // handles stop intent
    'AMAZON.StopIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    // handles stop intent
    'AMAZON.CancelIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    // handles main menu categories intent
    'CategoriesIntent': function () {
      var categorySlot = this.event.request.intent.slots.Category;
      var categoryName;
      if (categorySlot && categorySlot.value) {
          categoryName = categorySlot.value.toLowerCase();
      }

      var category = categories[categoryName];
      if (category){
        // we found the term they mentioned. Thus provide the message for that category and
        // switch the state to handle the given cagtegory.
        this.handler.state = category.state;
        this.attributes['speechOutput'] = category.msg
        this.attributes['repromptSpeech'] = category.repromt;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
      } else {
        // we didn't find the term. Prompt them with the welcome message
        this.attributes['speechOutput'] = this.t('<say-as interpret-as="interjection">oh boy!</say-as>, that was different. ') + this.t("WELCOME_REPROMPT");
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
      }
    },
    // handles session end
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", "Goodbye!");
    }

});

// handler for agile glossary state
var glossaryHandlers = Alexa.CreateStateHandler(states.AGILEGLOSSARY, {
     // handles intent related to agile glossary
    'RecipeIntent': function () {
        var itemSlot = this.event.request.intent.slots.Item;
        var itemName;
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        var recipes = this.t("RECIPES");
        var recipe = recipes[itemName];
        var category = categories['agile glossary'];
        if (recipe) {
            // we found the term that they inquired. So respond with the answer
            this.attributes['speechOutput'] = recipe;
            this.attributes['repromptSpeech'] = category.repromt;

            var cardTitle = this.t("DISPLAY_CARD_TITLE", this.t("SKILL_NAME"), itemName);
            this.emit(':askWithCard', recipe, this.attributes['repromptSpeech'], cardTitle, recipe);
        } else {
            // we didn't find the term.  So prompt the user that we don't know the term
            var speechOutput = category.invalidTerm;
            var repromptSpeech = category.repromt;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    // handles stop intent
    'AMAZON.StopIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    // handles cancek intent
    'AMAZON.CancelIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    // handles session end
    'SessionEndedRequest':function () {
        this.emit(":tell", "Goodbye!");
    },
    // handles main menu intent
    'MainMenuIntent': function () {
      // switch to main state
      this.handler.state = states.MAINCATEGORIES;
      this.emitWithState('NewSession');
    },
    // anything not handled explicityly will come here
    'Unhandled': function () {
        var category = categories['agile glossary'];
        this.attributes['speechOutput'] = category.wrongQuestion;
        this.attributes['repromptSpeech'] = category.repromt;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

// handler for digital transformation terms
var digitalHandlers = Alexa.CreateStateHandler(states.DIGITALTRANSFORM, {
    // handles digital transformation intent
    'DigitalTransformIntent': function () {
        var digitalSlot = this.event.request.intent.slots.Digital;
        var digitalName;
        if (digitalSlot && digitalSlot.value) {
            digitalName = digitalSlot.value.toLowerCase();
        }

        var digitals = this.t("DIGITALTRANSFORM");
        var digital = digitals[digitalName];

        var category = categories['digital transformation'];
        if (digital) {
            // we found the term that they inquired. So respond with the answer
            this.attributes['speechOutput'] = digital;
            this.attributes['repromptSpeech'] = category.repromt;

            var cardTitle = this.t("DISPLAY_CARD_TITLE", this.t("SKILL_NAME"), digitalName);
            this.emit(':askWithCard', digital, this.attributes['repromptSpeech'], cardTitle, digital);
        } else {
            // we didn't find the term.  So prompt the user that we don't know the term
            var speechOutput = category.invalidTerm;
            var repromptSpeech = category.repromt;;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    // handles stop intent
    'AMAZON.StopIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    // handles cancel intent
    'AMAZON.CancelIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    // handles session end
    'SessionEndedRequest':function () {
        this.emit(":tell", "Goodbye!");
    },
    // handles main menu intent
    'MainMenuIntent': function () {
      this.handler.state = states.MAINCATEGORIES;
      this.emitWithState('NewSession');
    },
    // anything not handled explicityly will come here
    'Unhandled': function () {
        var category = categories['digital transformation'];
        this.attributes['speechOutput'] = category.wrongQuestion;
        this.attributes['repromptSpeech'] = category.repromt;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

var languageStrings = {
    "en": {
        "translation": {
            "RECIPES": recipes.RECIPE_EN_US,
            "DIGITALTRANSFORM": digitalTransform.DIGITALTERM_EN_US,
            "SKILL_NAME": "A T B",
            "WELCOME_MESSAGE": "Welcome to %s......",
            "WELCOME_REPROMPT": welcomeReprompt,
            "DISPLAY_CARD_TITLE": "%s  - Description for %s.",
            "STOP_MESSAGE": "Goodbye!"
        }
    }
};
