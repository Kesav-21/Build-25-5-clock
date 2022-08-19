const projectName = '25-5-clock';

const accurateInterval = (func, time) => {
  var cancel;
  var nextAt;
  var timeout;
  var wrapper;

  nextAt = new Date().getTime() + time;
  timeout = null;

  wrapper = () => {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());

    return func();
  };

  cancel = () => {
    return clearTimeout(timeout);
  };

  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel
  };
};

// COMPONENTS:
class TimerLengthControl extends React.Component {
  render() {
    return (
      <div className="cont bg-secondary length-control rounded-3 text-center">
        <div className="text-light fs-4 fw-bolder" id={this.props.titleID}>{this.props.title}</div>
        <div className="d-inline-flex">
        <button
          className="btn btn-danger"
          id={this.props.minID}
          onClick={this.props.onClick}
          value="-"
        >
          <i className="fa-solid fa-minus" />
        </button>
        <div className="card-body bg-light fs-4" id={this.props.lengthID}>
          {this.props.length}
        </div>
        <button
          className="btn btn-success"
          id={this.props.addID}
          onClick={this.props.onClick}
          value="+"
        >
          <i className="fa-solid fa-plus" />
        </button>
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      breakLen: 5,
      sessionLen: 25,
      timerState: "stopped",
      timerType: "Session",
      timer: 1500,
      intervalID: "",
      alarmColor: { color: "white" },
    };
 ;
  }

  setBreakLen = (e) => {
    this.lengthControl(
      "breakLen",
      e.currentTarget.value,
      this.state.breakLen,
      "Session"
    );
  };

  setSessionLen = (e) => {
    this.lengthControl(
      "sessionLen",
      e.currentTarget.value,
      this.state.sessionLen,
      "Break"
    );
  };

  lengthControl = (stateToChange, sign, currentLength, timerType) => {
    if (this.state.timerState === 'running') {
      return;
    }

    if (this.state.timerType === timerType) {
      if (sign === '-' && currentLength !== 1) {
        this.setState({ [stateToChange]: currentLength - 1 });
      } else if (sign === '+' && currentLength !== 60) {
        this.setState({ [stateToChange]: currentLength + 1 });
      }
    } else if (sign === '-' && currentLength !== 1) {
      this.setState({
        [stateToChange]: currentLength - 1,
        timer: currentLength * 60 - 60
      });
    } else if (sign === '+' && currentLength !== 60) {
      this.setState({
        [stateToChange]: currentLength + 1,
        timer: currentLength * 60 + 60
      });
    }
  }

  timerControl = () => {
    if (this.state.timerState === "stopped") {
      this.beginCountDown();
      this.setState({ timerState: "running" });
    } else {
      this.setState({ timerState: "stopped" });
      if (this.state.intervalID) {
        this.state.intervalID.cancel();
      }
    }
  };

  beginCountDown = () => {
    this.setState({
      intervalID: accurateInterval(() => {
        this.decrementTimer();
        this.phaseControl();
      }, 1000),
    });
  };

  decrementTimer = () => {
    this.setState({ timer: this.state.timer - 1 });
  };

  phaseControl = () => {
    let timer = this.state.timer;
    this.warning(timer);
    this.buzzer(timer);
    if (timer < 0) {
      if (this.state.intervalID) {
        this.state.intervalID.cancel();
      }
      if (this.state.timerType === "Session") {
        this.beginCountDown();
        this.switchTimer(this.state.breakLen * 60, "Break");
      } else {
        this.beginCountDown();
        this.switchTimer(this.state.sessionLen * 60, "Session");
      }
    }
  };

  warning = (_timer) => {
    if (_timer < 61) {
      this.setState({ alarmColor: { color: "#a50d0d" } });
    } else {
      this.setState({ alarmColor: { color: "white" } });
    }
  };

  buzzer = (_timer) => {
    if (_timer === 0) {
      this.audioBeep.play();
    }
  };

  switchTimer = (num, str) => {
    this.setState({
      timer: num,
      timerType: str,
      alarmColor: { color: "white" },
    });
  };

  clockify = () => {
    let minutes = Math.floor(this.state.timer / 60);
    let seconds = this.state.timer - minutes * 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return minutes + ":" + seconds;
  };

  reset = () => {
    this.setState({
      breakLen: 5,
      sessionLen: 25,
      timerState: "stopped",
      timerType: "Session",
      timer: 1500,
      intervalID: "",
      alarmColor: { color: "white" },
    });

    if (this.state.intervalID) {
      this.state.intervalID.cancel();
    }

    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  }

  render() {
    return (
      <div>
        <div className="main-title text-center text-primary fs-1 bg-dark fw-bold">25 + 5 Clock</div>
        <div className="gcont">
        <TimerLengthControl
          addID="break-increment"
          length={this.state.breakLen}
          lengthID="break-length"
          minID="break-decrement"
          onClick={this.setBreakLen}
          title="Break Length"
          titleID="break-label"
        />

        <TimerLengthControl
          addID="session-increment"
          length={this.state.sessionLen}
          lengthID="session-length"
          minID="session-decrement"
          onClick={this.setSessionLen}
          title="Session Length"
          titleID="session-label"
        />

        <div className="timer d-flex bg-dark cont justify-content-center fs-2 border-1 rounded-3" style={this.state.alarmColor}>
          <div className="timer-wrapper text-center">
            <div id="timer-label" className="fw-bolder fs-3">{this.state.timerType}</div>
            <div id="time-left" className="text-danger">{this.clockify()}</div>
          </div>
        </div>

        <div className="timer-control d-flex justify-content-center">
          <button id="start_stop" className="btn btn-success" onClick={this.timerControl}>
            <i className="fa fa-play fa-2x" />
            <i className="fa fa-pause fa-2x" />
          </button>
          <button id="reset" className="btn btn-danger" onClick={this.reset}>
            <i className="fa fa-refresh fa-2x" />
          </button>
        </div>

        

        <audio
          id="beep"
          preload="auto"
          ref={(audio) => {
            this.audioBeep = audio;
          }}
          src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
