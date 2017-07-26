'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var recipes = require('./recipes');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(newSessionHandlers, glossaryHandlers);
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
  msg: 'Agile Glossary - You can ask me What does X mean? For example what does agile mean?',
  state: states.AGILEGLOSSARY,
  repromt: ' Go ahead, ask me.'
};
categories['digital transformation'] = {
  msg: 'Digital Transformation - You can ask me What does X mean? For example what does D T mean?',
  state: states.DIGITALTRANSFORM,
  repromt: ' Go ahead, ask me.'
};
categories['innovation'] = {
  msg: 'Innovation - You can ask me What does X mean? For example what does D T mean?',
  state: states.INNOVATION,
  repromt: ' Go ahead, ask me.'
};

var newSessionHandlers = {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) {

        }

        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME"));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
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
      console.log("still in categories");
      var categorySlot = this.event.request.intent.slots.Category;
      var categoryName;
      if (categorySlot && categorySlot.value) {
          categoryName = categorySlot.value.toLowerCase();
      }

      var category = categories[categoryName];
      if (category){
        console.log('going to change the state');
        this.handler.state = category.state;
        this.attributes['speechOutput'] = category.msg
        this.attributes['repromptSpeech'] = category.repromt;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
      } else {
        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME"));
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
    }
};

var glossaryHandlers = Alexa.CreateStateHandler(states.AGILEGLOSSARY, {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    // 'NewSession': function () {
    //     console.log('Inside glossary state');
    //     this.attributes['speechOutput'] = this.t("Agile Glossary - You can ask questions such as, what\'s agile? or What does agile mean?, or, you can say exit...Now, what can I help you with?");
    //     // If the user either does not reply to the welcome message or says something that is not
    //     // understood, they will be prompted again with this text.
    //     this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMPT");
    //     this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    // },
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
            this.attributes['repromptSpeech'] = this.t("RECIPE_REPEAT_MESSAGE");
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
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
        this.attributes['repromptSpeech'] = this.t("HELP_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
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
        this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
        this.attributes['repromptSpeech'] = this.t("HELP_REPROMPT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    }
});

var languageStrings = {
    "en": {
        "translation": {
            "RECIPES": recipes.RECIPE_EN_US,
            "SKILL_NAME": "A T B",
            "WELCOME_MESSAGE": "Welcome to %s...... Here are your Categories: Digital transformation, Agile Glossary or Innovation? Which one do you want?",
            "WELCOME_REPROMPT": "For instructions on what you can say, please say help me.",
            "DISPLAY_CARD_TITLE": "%s  - Description for %s.",
            "HELP_MESSAGE": "You can ask questions such as, what\'s agile? or What does agile mean?, or, you can say exit...Now, what can I help you with?",
            "HELP_REPROMPT": "You can say things like, what\'s agile? or What does agile mean?, or you can say exit...Now, what can I help you with?",
            "STOP_MESSAGE": "Goodbye!",
            "RECIPE_REPEAT_MESSAGE": "Try saying repeat.",
            "RECIPE_NOT_FOUND_MESSAGE": "I\'m sorry, I currently do not know ",
            "RECIPE_NOT_FOUND_WITH_ITEM_NAME": "the description for %s. ",
            "RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME": "that description. ",
            "RECIPE_NOT_FOUND_REPROMPT": "What else can I help with?"
        }
    }
};
