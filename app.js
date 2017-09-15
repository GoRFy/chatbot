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

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    //session.send("You said: %s", session.message.text);

    /*bot.on('typing', function(){
        session.send('You are writting');
    });*/

});

bot.on('conversationUpdate', function(message) {
    
    if (message.membersAdded && message.membersAdded.length > 0) {
        
        const isGroup = message.address.conversation.isGroup;
        const txt = isGroup ? "Bienvenue inconnu!" : `Bienvenue ${message.membersAdded.map(curUser => curUser.name).toString()}`;
        const reply = new builder.Message()
            .address(message.address)
            .text(txt);
        bot.send(reply);
    }  
});

bot.dialog('doheavywork', function (session) {
    session.sendTyping();
    var intervalId = setInterval(
        function () {
            session.sendTyping();
        },
        1000
    );
    setTimeout(
        function () {
            session.send("Fin du travail");
            clearInterval(intervalId);
        },
        2500
    );
}).triggerAction({
    matches:  /^doheavywork$/,
});

