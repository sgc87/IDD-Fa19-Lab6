/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hello I am Mr. Car Guru. I will help you choose the perfect vehicle for you! :)"); //We start with the introduction;
    setTimeout(timedQuestion, 5000, socket, "What shall I address you by?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;
  var temp; // For recording if more concerned about cold or hot weather
  var seats; // Record number of car seats wanted
  var drive; // Record driving style
  var boogie; // Record if want luxury brand car

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    answer = 'Hello, ' + input + 'I hope you are having a wonderful day!'; // output response
    waitTime = 5000;
    question = 'Do you currently have a car? If so, what kind?'; // load next question
  } else if (questionNum == 1) {
    if (input === 'no') {
      answer = 'Oh, I see! Well, that is what I am here for! To help you choose a ride ;)';
      waitTime = 5000;
    } else {
      answer = 'Okay, a ' + input + ' you said? Sweet, but today, you will find an even sweeter ride. I can look into the trade-in value for you if you as well!';
      waitTime = 5000;
    }
    question = 'Do you worry about hot weather or cold weather more?'; // load next question
  } else if (questionNum == 2) {
    if (input.toLowerCase() === 'cold' || input.toLowerCase() === 'cold weather') {
      answer = 'Cold weather I see. In that case, I recommend getting heated seats, usually a $500 option by itself. I also recommend getting AWD or 4WD if it snows where you live. ';
      temp = 'cold';
      waitTime = 5000;
    } else if (input.toLowerCase() === 'hot' || input.toLowerCase() === 'hot weather') {
      answer = 'Hot weather I see. In that case, I recommend getting cooled seats. However, this is usually part of a premium package as cooled seats are currently available with leather seats. ';
      temp = 'hot';
      waitTime = 5000;
    }
    question = 'How many people are you looking to seat excluding yourself? For passenger cars, the limit is 7. ';
  } else if (questionNum == 3) {
    if (input === 0 || input === 1 || input === 2) {
      answer = 'Okay, in that case, I would recommend a 2 door car like a coupe. ';
      waitTime = 5000;
    } else if (input === 3 || input === 4) {
      answer = 'Okay, in that case, I would recommend any car with four doors. ';
      waitTime = 5000;
    } else if (input === 5 || input === 6 || input === 7) {
      answer = 'Okay, in that case, I would recommend an SUV, crossover, or a minivan. ';
      waitTime = 5000;
    } else {
      answer = 'I literally just said 7 is the limit. Please pick a number from 0-7. :|';
      questionNum--;
      waitTime = 5000;
    }
    seats = input;
    question = 'Are you a sporty or eco driver?';
  } else if (questionNum == 4) {
    if (input.toLowerCase() === 'sporty') {
      answer = 'Oooh, ;) I like your . ';
      drive = 'sporty';
      waitTime = 5000;
    } else if (input.toLowerCase() === 'eco') {
      answer = 'Mmh, I was hoping you would want some spice, but eco driving does save you money!!';
      drive = 'eco';
      waitTime = 5000;
    }
    question = 'Are you interested in luxury cars?';
  } else if (questionNum == 5) {
    if (input.toLowerCase() === 'yes') {
      answer = 'Oh wow! We got a high roller here!! XD';
      boogie = 'luxury';
      waitTime = 5000;
    } else if (input.toLowerCase() === 'no') {
      answer = 'Very nice, I know plenty of value packed cars that are basically luxury cars without the brand name!';
      boogie = 'non-luxury';
      waitTime = 5000;
    }
    answer = 'So, you said you are a ' + drive + ' kind of a driver, who is concerned about ' + temp + ' weather, who wants a car that can seat ' + seats + ' number of people, and is ' + boogie + '!!!'; // output response
    waitTime = 5000;
    question = 'I hope my suggestions were helpful. Leave your email address, and I will send you a list of cars that meet your criteria!!';
  } else {
    answer = 'Thanks!! Keep in touch, and I will keep you posted on listings!!';
    waitTime = 0;
    question = '';
  }


  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
