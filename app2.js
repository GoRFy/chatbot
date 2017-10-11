var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
   console.log('server name: ${server.name} | server url: ${server.url}');
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, [

    function (session) {
        session.beginDialog('greetings');
    },


]);

bot.dialog('greetings',[
    function (session) {
        session.beginDialog('askName');
    },
]);

bot.dialog('askName', [
    function (session) {
        session.send("Bienvenue dans le bot Resa");
        builder.Prompts.text(session, 'Bonjour, quel est votre nom?');
    },
    function (session, results){
        session.privateConversationData.nomUser = results.response;
        //session.send(`Bonjour ${session.dialogData.nomUser}`);
        session.beginDialog('reservation');
        //session.endDialogWithResult(results);
    }
]);

bot.dialog('reservation', [
    function (session, results) {
        builder.Prompts.time(session, "Quel jour ?");
    },
    function (session, results) {
        session.privateConversationData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.number(session, "Combien de personne ?");
    },
    function (session, results) {
        session.privateConversationData.reservationNb = results.response;
        builder.Prompts.text(session, "Sous quel nom ?");
    },
    function (session, results) {
        session.privateConversationData.reservationName = results.response;

        session.send(`Reservation effectuée ${session.privateConversationData.nomUser}. <br/>Date: ${session.privateConversationData.reservationDate} <br/>Nb de personne: ${session.privateConversationData.reservationNb} <br/>Réservé au nom de : ${session.privateConversationData.reservationName}`);
        session.endDialog();
    }
])



