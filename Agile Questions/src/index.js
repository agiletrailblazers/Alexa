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
    alexa.registerHandlers(newSessionHandlers, glossaryHandlers, digitalHandlers);
    alexa.execute();
};

var states = {
    CATEGORIES: '_CATEGORIES',
    AGILEGLOSSARY: '_AGILEGLOSSARY',
    DIGITALTRANSFORM: '_DIGITALTRANSFORM',
    INNOVATION: '_INNOVATION'
};

var categories = new Object();
categories['agile glossary'] = {
  msg: 'Agile Glossary - You can ask me What does X mean? For example what does agile mean? Go ahead, ask me.',
  state: states.AGILEGLOSSARY,
  repromt: 'Go ahead, ask me.'
};
categories['digital transformation'] = {
  msg: 'Digital Transformation - You can ask me What does X mean? For example what does Digital Transformation mean? Go ahead, ask me.',
  state: states.DIGITALTRANSFORM,
  repromt: 'Go ahead, ask me.'
};
categories['innovation'] = {
  msg: 'Innovation - You can ask me What does X mean? For example what does D T mean? Go ahead, ask me.',
  state: states.INNOVATION,
  repromt: 'Go ahead, ask me.'
};

var newSessionHandlers = {
    'NewSession': function() {
        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME")) + ' ' + this.t("WELCOME_REPROMPT");
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function() {
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
        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME")) + ' ' + this.t("WELCOME_REPROMPT");
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
      }

    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", "Goodbye!");
    },
    'Unhandled': function () {
        this.attributes['speechOutput'] = this.t("WELCOME_REPROMPT");
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
};

var glossaryHandlers = Alexa.CreateStateHandler(states.AGILEGLOSSARY, {
    'RecipeIntent': function () {
        console.log('gloassary state');
        var itemSlot = this.event.request.intent.slots.Item;
        var itemName;
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        var cardTitle = this.t("DISPLAY_CARD_TITLE", this.t("SKILL_NAME"), itemName);
        var recipes = this.t("RECIPES");
        var recipe = recipes[itemName];

        if (recipe) {
            this.attributes['speechOutput'] = recipe;
            this.attributes['repromptSpeech'] = this.t("RECIPE_REPROMPT_MESSAGE");
            this.emit(':askWithCard', recipe, this.attributes['repromptSpeech'], cardTitle, recipe);
        } else {
            var speechOutput = this.t("RECIPE_NOT_FOUND_MESSAGE");
            var repromptSpeech = this.t("RECIPE_NOT_FOUND_REPROMPT");
            if (itemName) {
                speechOutput += this.t("RECIPE_NOT_FOUND_WITH_ITEM_NAME", itemName);
            } else {
                speechOutput += this.t("RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME");
            }
            speechOutput += repromptSpeech;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'Unhandled': function () {
        var category = categories['agile glossary'];
        this.attributes['speechOutput'] = category.msg
        this.attributes['repromptSpeech'] = category.repromt;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

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
            this.attributes['repromptSpeech'] = this.t("RECIPE_REPROMPT_MESSAGE");
            this.emit(':askWithCard', digital, this.attributes['repromptSpeech'], cardTitle, digital);
        } else {
            var speechOutput = this.t("RECIPE_NOT_FOUND_MESSAGE");
            var repromptSpeech = this.t("RECIPE_NOT_FOUND_REPROMPT");
            if (digitalName) {
                speechOutput += this.t("RECIPE_NOT_FOUND_WITH_ITEM_NAME", digitalName);
            } else {
                speechOutput += this.t("RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME");
            }
            speechOutput += repromptSpeech;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'Unhandled': function () {
        var category = categories['digital transformation'];
        this.attributes['speechOutput'] = category.msg
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
            "WELCOME_REPROMPT": "Here are your Categories: Digital transformation, Agile Glossary or Innovation? Which one do you want?",
            "DISPLAY_CARD_TITLE": "%s  - Description for %s.",
            "STOP_MESSAGE": "Goodbye!",
            "RECIPE_REPROMPT_MESSAGE": "Go ahead, ask me.",
            "RECIPE_NOT_FOUND_MESSAGE": "I\'m sorry, I currently do not know ",
            "RECIPE_NOT_FOUND_WITH_ITEM_NAME": "the description for %s. ",
            "RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME": "that description. ",
            "RECIPE_NOT_FOUND_REPROMPT": "What else can I help with?"
        }
    }
};
