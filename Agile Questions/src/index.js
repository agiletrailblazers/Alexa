'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
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

// map storing text related to certain states
var categories = new Object();
categories['agile glossary'] = Object.freeze({
  msg: 'Agile Glossary - You can ask me What does X mean? For example what does agile mean? Go ahead, ask me.',
  state: states.AGILEGLOSSARY,
  repromt: 'Ask me more agile terms, or say: main menu.',
  invalidTerm: 'Sorry, I am not fully developed yet. I can only handle basic agile terms.',
  wrongQuestion: 'Wow, that was different.  Try again by asking: What Does X mean?'
});
categories['digital transformation'] = Object.freeze({
  msg: 'Digital Transformation - You can ask me What does X mean? For example what does Digital Transformation mean? Go ahead, ask me.',
  state: states.DIGITALTRANSFORM,
  repromt: 'Ask me more digital transformation terms, or say: main menu.',
  invalidTerm: 'Sorry, I am not fully developed yet. I can only handle basic agile terms.',
  wrongQuestion: 'Wow, that was different.  Try again by asking: What Does X mean?'
});
categories['innovation'] = Object.freeze({
  msg: 'Innovation - You can ask me What does X mean? For example what does D T mean? Go ahead, ask me.',
  state: states.INNOVATION,
  repromt: 'Go ahead, ask me.'
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

    'NewSession': function() {
        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME")) + ' ' + this.t("WELCOME_REPROMPT");
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },

    'Unhandled': function () {
      this.attributes['speechOutput'] = this.t('Wow, that was different. ') + this.t("WELCOME_REPROMPT");
      this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },

    'AMAZON.StopIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    'AMAZON.CancelIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    'CategoriesIntent': function () {
      var categorySlot = this.event.request.intent.slots.Category;
      var categoryName;
      if (categorySlot && categorySlot.value) {
          categoryName = categorySlot.value.toLowerCase();
      }

      var category = categories[categoryName];
      if (category){
        this.handler.state = category.state;
        this.attributes['speechOutput'] = category.msg
        this.attributes['repromptSpeech'] = category.repromt;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
      } else {
        this.attributes['speechOutput'] = this.t('Wow, that was different. ') + this.t("WELCOME_REPROMPT");
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
      }
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", "Goodbye!");
    }

});

// handler for agile glossary state
var glossaryHandlers = Alexa.CreateStateHandler(states.AGILEGLOSSARY, {
    'RecipeIntent': function () {
        var itemSlot = this.event.request.intent.slots.Item;
        var itemName;
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        var cardTitle = this.t("DISPLAY_CARD_TITLE", this.t("SKILL_NAME"), itemName);
        var recipes = this.t("RECIPES");
        var recipe = recipes[itemName];
        var category = categories['agile glossary'];
        if (recipe) {
            this.attributes['speechOutput'] = recipe;
            this.attributes['repromptSpeech'] = category.repromt;
            this.emit(':askWithCard', recipe, this.attributes['repromptSpeech'], cardTitle, recipe);
        } else {
            var speechOutput = category.wrongQuestion;;
            var repromptSpeech = category.repromt;;
            if (itemName) {
                speechOutput = category.invalidTerm;;
            }

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'AMAZON.StopIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    'AMAZON.CancelIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest':function () {
        this.emit(":tell", "Goodbye!");
    },
    'MainMenuIntent': function () {
      this.handler.state = states.MAINCATEGORIES;
      this.emitWithState('NewSession');
    },
    'Unhandled': function () {
        var category = categories['agile glossary'];
        this.attributes['speechOutput'] = category.wrongQuestion;
        this.attributes['repromptSpeech'] = category.repromt;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

// handler for digital transformation terms
var digitalHandlers = Alexa.CreateStateHandler(states.DIGITALTRANSFORM, {
    'DigitalTransformIntent': function () {
        var digitalSlot = this.event.request.intent.slots.Digital;
        var digitalName;
        if (digitalSlot && digitalSlot.value) {
            digitalName = digitalSlot.value.toLowerCase();
        }

        var cardTitle = this.t("DISPLAY_CARD_TITLE", this.t("SKILL_NAME"), digitalName);
        var digitals = this.t("DIGITALTRANSFORM");
        var digital = digitals[digitalName];

        if (digital) {
            this.attributes['speechOutput'] = digital;
            this.attributes['repromptSpeech'] = categories['digital transformation'].repromt;
            this.emit(':askWithCard', digital, this.attributes['repromptSpeech'], cardTitle, digital);
        } else {
            var speechOutput = category.wrongQuestion;
            var repromptSpeech = category.repromt;;
            if (itemName) {
                speechOutput = category.invalidTerm;;
            }

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'AMAZON.StopIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    'AMAZON.CancelIntent': function() {
      this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest':function () {
        this.emit(":tell", "Goodbye!");
    },
    'MainMenuIntent': function () {
      this.handler.state = states.MAINCATEGORIES;
      this.emitWithState('NewSession');
    },
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
            "WELCOME_REPROMPT": "Here are your Categories: Agile Glossary, Digital transformation, or Innovation? Which one do you want?",
            "DISPLAY_CARD_TITLE": "%s  - Description for %s.",
            "STOP_MESSAGE": "Goodbye!"
        }
    }
};
