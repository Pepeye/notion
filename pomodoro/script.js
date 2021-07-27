//Using jQuery Timer 2:  https://jchavannes.com/jquery-timer and jQuery Circle Progress: https://github.com/kottenator/jquery-circle-progress

//Set break length based on input from + and - buttons

$('#break-length .decrease').on('click', function() {
  var $breakNum = parseInt($('.break-num').html());

  /*Check to see that breakNum is greater than one and that the BreakPom timer is either not active OR has no active property (happens on initial load before timer has been started)*/

  if ($breakNum > 1 && BreakPom.Timer.isActive === false || $breakNum > 1 && BreakPom.Timer.hasOwnProperty('isActive') === false) {
    $(".break-num").html($breakNum - 1);
    BreakPom.resetTime();
  } else {
    $(this).prop("disabled");
  }
});

$('#break-length .increase').on('click', function() {
  var $breakNum = parseInt($('.break-num').html());
  if ($breakNum < 15 && BreakPom.Timer.isActive === false || $breakNum < 15 && BreakPom.Timer.hasOwnProperty('isActive') === false) {
    $(".break-num").html($breakNum + 1);
    BreakPom.resetTime();
  } else {
    $(this).prop("disabled");
  }

});

//Set session length based on input from + and - buttons

$('#session-length .decrease').on('click', function() {
  var $sessNum = parseInt($('.session-num').html());
  if ($sessNum > 1 && Pomodoro.Timer.isActive === false || $sessNum > 1 && Pomodoro.Timer.hasOwnProperty('isActive') === false) {
    $(".session-num").html($sessNum - 1);

    Pomodoro.resetTime();
  } else {
    $(this).prop("disabled");
  }
})

$('#session-length .increase').on('click', function() {
  var $sessNum = parseInt($('.session-num').html());
  if ($sessNum < 60 && Pomodoro.Timer.isActive === false || $sessNum < 60 && Pomodoro.Timer.hasOwnProperty('isActive') === false) {
    $(".session-num").html($sessNum + 1);
    Pomodoro.resetTime();
  } else {
    $(this).prop("disabled");
  }
});

//Break timer

var BreakPom = new(function() {
  //Get break length num from break num choice
  var $breakNum = parseInt($('.break-num').html());
  //Turn number into milliseconds
  var breakMilliseconds = $breakNum * 60 * 1000;
  /* Turn number into seconds; necessary for initial call of timer */
  var breakSeconds = $breakNum * 60;
  var $countdown;

  //Create audio element to play bell
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'https://s3.amazonaws.com/showcase.knanthony.com/pomodorotimer/bell.wav');

  $(function() {
    // Setup the timer
    $countdown = $('#break-countdown');
    BreakPom.Timer = $.countDown(function() {
      $countdown.html(this.getFormattedTime());

      if (this.isFinished()) {
        audioElement.play();
        BreakPom.Timer.stop();
        //Increment up the counter in Pomodoro
        Pomodoro.increment();
        //Update the counter number in pomType
        $(".counter").html(Pomodoro.counter());
        $('#pomBreak').hide();
        $('#pomSess').fadeIn("slow");
        Pomodoro.Timer.start();
        Pomodoro.pomCircle();
        return;
      }
    }, breakSeconds);
    BreakPom.Timer.stop();
  });

  this.resetTime = function() {
    $breakNum = parseInt($('.break-num').html());
    breakMilliseconds = $breakNum * 60 * 1000;
    $countdown.html($breakNum);
    BreakPom.Timer.countdown = breakMilliseconds;
  }
});

//Session Pom Timer
var Pomodoro = new(function() {
  //Get number from session-num choice
  var $sessNum = parseInt($('.session-num').html());
  //Change number to milliseconds
  var sessionMilliseconds = $sessNum * 60 * 1000;
  //Change number to seconds, necessary for initial call of the countdown timer
  var sessionSeconds = $sessNum * 60;
  var $countdown;
  //create audio element to play bell
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'https://s3.amazonaws.com/showcase.knanthony.com/pomodorotimer/bell.wav');
  var n = 1; //initial number for counter

  //function to increment counter
  this.increment = function() {
    return n++;
  };

  /* function to return counter number
  necessary to separate functions so that increment is only done when necessary, while making n available outside of this function */
  this.counter = function() {
    return n;
  }

  $(function() {
    // Setup the timer
    $countdown = $('#sess-countdown');
    //using new countdown class
    Pomodoro.Timer = $.countDown(function() {
      //Updates display every tick
      $countdown.html(this.getFormattedTime());

      if (this.isFinished()) {
        //Changes # number in pomType
        $(".counter").html(Pomodoro.counter());
        audioElement.play(); //Plays bell
        Pomodoro.Timer.stop();
        $('#pomSess').hide();
        $('#pomBreak').fadeIn("slow");
        BreakPom.Timer.start();
        return;
      }
    }, sessionSeconds);
    Pomodoro.Timer.stop(); //necessary to prevent autostart
  });

  //Used to refresh milliseconds and Timer countdown parameter
  this.resetTime = function() {
    $sessNum = parseInt($('.session-num').html());
    sessionMilliseconds = $sessNum * 60 * 1000;
    //must refresh these variables
    $countdown.html($sessNum);
    Pomodoro.Timer.countdown = sessionMilliseconds;
    n = 1;
  };

  //Function to create the circle progress bars
  this.pomCircle = function() {

    var counter = Pomodoro.counter();
    //After 11 sessions, stop
    if (counter < 11) {
      //give each circle div a unique id from the counter
      var pomProgressDiv = '<div id="' + counter + '" class="pomProgressTimer"></div>';
      //append a new .pomProgressTimer div with each session
      $(pomProgressDiv).appendTo('#tomatoes').show('fast');
    } else {
      Pomodoro.Timer.stop();
      BreakPom.Timer.stop();
      $('#stop-countdown').click();
    }
    var pomCurrent = '#' + Pomodoro.counter();
    //Use counter id to control only the the current progress bar
    $(pomCurrent).circleProgress({
      value: 1.0,
      thickness: '25',
      size: 50,
      fill: {
       image: "https://s3.amazonaws.com/showcase.knanthony.com/pomodorotimer/tomato.png",
      },
      emptyFill:"#2f3437",
      animation: {
        duration: sessionMilliseconds,
      },
    });
  };

});

//Hide all the uncessary stuff initially
$('#pomBreak').hide();
$('#tomatoes').hide();
$('#pause-countdown').hide();
$('#stop-countdown').hide();
$('#resume-countdown').hide();

//Start button
$('#start-countdown').on('click', function() {
  $("#timer-lengths").hide("slow");
  $('#tomatoes').show();
  Pomodoro.Timer.start();

  Pomodoro.pomCircle();

  $(this).hide();
  $('#pause-countdown').show();
});

//Pause button only shows after start

$('#pause-countdown').on('click', function() {
  if (Pomodoro.Timer.isActive === true) {
    Pomodoro.Timer.pause();
    var pomCurrent = '#' + Pomodoro.counter();
    var el = $(pomCurrent);
    $(el.circleProgress('widget')).stop();
  } else if (BreakPom.Timer.isActive === true) {
    BreakPom.Timer.pause();
  }

  $(this).hide();
  $('#stop-countdown').show();
  $('#resume-countdown').show();
});

//Stop button only shows after pause

$('#stop-countdown').on('click', function() {
  $('#timer-lengths').show("slow");
  $('#pomSess').show();
  $('#pomBreak').hide();
  Pomodoro.resetTime();
  $(".counter").html(Pomodoro.counter());
  $(".pomProgressTimer").remove();
  $('#tomatoes').hide();
  $(this).hide();
  $('#pause-countdown').hide();
  $('#resume-countdown').hide();
  $('#start-countdown').show();
});

$('#resume-countdown').on('click', function() {
  $("#timer-lengths").hide("slow");
  if ($('#pomBreak').is(":hidden")) {
    Pomodoro.Timer.start();
    var pomCurrent = '#' + Pomodoro.counter();
    var obj = $(pomCurrent).data('circle-progress'),
      progress = obj.lastFrameValue;
    var sessionMilliseconds = Pomodoro.Timer.getTime(); //only within this function

    $(pomCurrent).circleProgress({
      animation: {
        duration: sessionMilliseconds,
      },
      animationStartValue: progress,
    });

  } else if ($('#pomSess').is(":hidden")) {
    BreakPom.Timer.start();
  }

  $('#stop-countdown').hide();
  $('#resume-countdown').hide();
  $('#pause-countdown').show();
});