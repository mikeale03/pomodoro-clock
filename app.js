var time;
var stat = document.getElementById("status");
var sesInptBtn = document.getElementById("ses-btn-wrap");
var brkInptBtn = document.getElementById("brk-btn-wrap");
var alarm = new Audio("http://free-screensavers-backgrounds.com/ringtones/funny/alarm-clock.mp3");
var pomodoro = {
  analog: {display: $("#analog"), pos: 0},
  timeDisplay: document.getElementById("timer"),
  inc:1,
  sessionLen: {min:25, sec: 0},
  breakLen: {min:5, sec: 0},
  isStart: false,
  isRunning: false,
  onBreak: false,
  onSession: true,
  curTime : {min:25, sec: 0},
  set setCurTime(min) {
    this.curTime.min = min;
    this.curTime.sec = 0;
  },

  set setAnalog(time) {
      this.inc = 630/(time*60);
      this.analog.pos = 0;
      this.analog.display.css({"stroke-dasharray":this.analog.pos+" 630"})
      if(this.onBreak) {
        this.analog.display.css({"stroke":"#005502"});
        this.analog.display.parent().css({"background":"OrangeRed"});
      } else {
        this.analog.display.css({"stroke":"OrangeRed"});
        this.analog.display.parent().css({"background":"#005502"});
      }
  },

  set setDisplay(curTime) {
    this.timeDisplay.innerHTML = curTime.min+":"+("0" + curTime.sec).slice(-2);
  },

  start: function() {
    if(this.sessionLen.min != 0) {
      this.isStart = true;
      this.isRunning = true;
      this.setAnalog = this.sessionLen.min;
      this.setCurTime = this.sessionLen.min;
      this.run();
      sesInptBtn.className = "disabled";
    }
  },

  pause: function() {
    this.isRunning = false;
    document.getElementById("ses-btn-wrap").classList.remove("disabled");
    document.getElementById("brk-btn-wrap").classList.remove("disabled");
    clearInterval(time);
  },

  resume: function() {
    this.isRunning = true;
    if(this.onBreak) {
      brkInptBtn.className = "disabled";
      sesInptBtn.classList.remove("disabled");
    } else {
      sesInptBtn.className = "disabled";
      brkInptBtn.classList.remove("disabled");
    }
    this.run();
  },

  stop: function() {
    this.isStart = false;
    this.onSession = true;
    this.onBreak = false;
    stat.innerHTML = "SESSION";
    sesInptBtn.classList.remove("disabled");
    brkInptBtn.classList.remove("disabled");
    this.pause();
    this.setAnalog = this.sessionLen.min;

  },

  run: function() {
      ob = this;
      time = setInterval(function() {
        if(ob.curTime.min <= 0 && ob.curTime.sec <= 0){
          if(ob.onSession) {
            ob.onBreak = true;
            ob.onSession = false;
            ob.setCurTime = ob.breakLen.min;
            ob.setAnalog = ob.breakLen.min;
            brkInptBtn.className = "disabled";
            sesInptBtn.classList.remove("disabled");
            stat.innerHTML = "BREAK";
          } else {
            ob.onBreak = false;
            ob.onSession = true;
            ob.setCurTime = ob.sessionLen.min;
            ob.setAnalog = ob.sessionLen.min;
            sesInptBtn.className = "disabled";
            brkInptBtn.classList.remove("disabled");
            stat.innerHTML = "SESSION";
          }
          alarm.play();
        }
        ob.analog.pos += ob.inc;
        ob.curTime.sec -= 1;
        if(ob.curTime.sec < 0) {
          ob.curTime.min -=1;
          ob.curTime.sec = 59;
        }
        ob.timeDisplay.innerHTML = ob.curTime.min+":"+("0" + ob.curTime.sec).slice(-2);
        ob.analog.display.css({"stroke-dasharray":ob.analog.pos+" 630"});
      }, 1000);
  }
}


$("input").keypress(function(e) {
  if( !(e.which>47 && e.which<58) ) return false;
}).focusout(function() {
  if(this.value == "" || this.value == "0") {
    this.value = 1;
    if(this.id == "break-len") {
      pomodoro.breakLen = {min:this.value, sec:0};
      if(pomodoro.onBreak) pomodoro.setDisplay = pomodoro.breakLen;
    } else {
      pomodoro.sessionLen = {min:this.value, sec:0};
      if(pomodoro.onSession) pomodoro.setDisplay = pomodoro.sessionLen;
    }
  }
});

$("input").keyup(function () {
  if (this.id === "break-len") {
    update("break", parseInt(this.value));
  } else {
    update("session", parseInt(this.value));
  }
});


$(".timer-container").on("click", function() {
  if(pomodoro.isStart) {
    if(pomodoro.isRunning) {
      pomodoro.pause();
      document.getElementById("pause-wrap").classList.add("show-pause");
      document.getElementById("pause").textContent = "RESUME?";
    } else {
      document.getElementById("pause-wrap").classList.remove("show-pause");
      pomodoro.resume();
    }
  } else {
    pomodoro.start();
    document.getElementById("pause-wrap").classList.remove("show-pause");
  }
});


$("#reset").on("click", function() {
  pomodoro.stop();
  pomodoro.timeDisplay.innerHTML = pomodoro.sessionLen.min+":"+("0" + pomodoro.sessionLen.sec).slice(-2);
  document.getElementById("pause").textContent = "START?";
  document.getElementById("pause-wrap").classList.add("show-pause");
})

$(".plus-minus").on("click", function() {
  var $btn = $(this);
  var inpt = $btn.siblings("input").val();
  var status = $btn.parent("div").attr("id");
  if($btn.text() === "+") {
    if(inpt != "99") {
      inpt = parseInt(inpt)+1;
      $btn.siblings("input").val(inpt);
    }
  } else {
    if(inpt != "1") {
     inpt = parseInt(inpt)-1;
     $btn.siblings("input").val(inpt);
    }
  }
  if (status == "brk-btn-wrap") {
    update("break", parseInt(inpt));
  } else {
    update("session", parseInt(inpt));
  }
});

function update(status, value) {
  value = value ? value:1;
  if (status == "break") {
    if( !(pomodoro.isRunning) && (pomodoro.onBreak)) {
      pomodoro.breakLen = {min:value, sec:0};
      pomodoro.setDisplay = pomodoro.breakLen;
      pomodoro.setAnalog = pomodoro.breakLen.min;
      pomodoro.setCurTime = pomodoro.breakLen.min;
    } else {
      pomodoro.breakLen = {min:value, sec:0};
    }
  } else {
    if(!pomodoro.isRunning && pomodoro.onSession) {
      pomodoro.sessionLen = {min:value, sec:0};
      pomodoro.setDisplay = pomodoro.sessionLen;
      pomodoro.setAnalog = pomodoro.sessionLen.min;
      pomodoro.setCurTime = pomodoro.sessionLen.min;
    } else {
      pomodoro.sessionLen = {min:value, sec:0};
    }
  }
}
