(function($) {
  $.fn.rangeSlider = function(options) {

    var _this = $(this);
    // 使用传入的值覆盖默认的值
    var opt = $.extend({}, $.fn.rangeSlider.defaults, options);
    // 初始化变量
    var isTime = opt.isTime;
    var accuracy = opt.accuracy;
    var start = opt.start || _this.start;
    var end = opt.end || _this.end;
    var cur = opt.current || _this.val();
    var endTime = opt.endTime;
    var endSeconds = endTime;
    // 计算结束时间
    if (isTime) {
      endSeconds = toSeconds(endTime);
      endTime = toTimecode(endSeconds, accuracy);
    } else {
      endSeconds = roundTime(endTime, accuracy);
      endTime = endSeconds;
    }
    var satrtSeconds = start * endSeconds / end;
    var curSeconds = cur * endSeconds / end;
    // 计算开始时间和当前时间
    var startTime = satrtSeconds;
    var curTime = curSeconds;
    if (isTime) {
      startTime = toTimecode(satrtSeconds, accuracy);
      curTime = toTimecode(curSeconds, accuracy);
    } else {
      startTime = roundTime(satrtSeconds, accuracy);
      curTime = roundTime(curSeconds, accuracy);
    }
    // 取出Jquery对象的选择器
    var startHtml = opt.startHtml;
    var endHtml = opt.endHtml;
    var curHtml = opt.curHtml;
    // 取出Jquery对象
    var startEle = $(startHtml);
    var endEle = $(endHtml);
    var curEle = $(curHtml);
    // 设置对象的值
    setValue(startEle, startTime);
    setValue(endEle, endTime);
    setValue(curEle, curTime);
    
    var moving=false;

    _this.mousedown(function(){
      moving=true;
    });
    _this.mouseup(function(){
      moving=false;
    });
    _this.mousemove(function(event){
      if(moving){
        resetValue();
      }
    });
    
    _this.click(resetValue);
    
    /**
     * 用户改变数值时触发的事件
     */
    function resetValue(){
      var cur=_this.val();
      var curSeconds=cur*endSeconds/end;
      var curTime=curSeconds;
      if(isTime){
        curTime=toTimecode(curSeconds, accuracy);
      }else{
        curTime=roundTime(curSeconds, accuracy);
      }
      // 设置对应的表单的值
      setValue(curEle,curTime);
      opt.callback(curSeconds);
    }
    
    /**
     * 设置Jquery对象的值
     * @param ele Jquery对象
     * @param value需要设置的值
     */
    function setValue(ele,value){
      if(ele==null||ele.length===0){
        return false;
      }
      if(ele.is("input")){
        ele.val(value);
      }else{
        ele.text(value);
      }
    }

    /**
     * Member: toSeconds
     *
     * toSeconds converts a timecode string to seconds.
     * "HH:MM:SS.DD" -> seconds
     * examples:
     * "1:00:00" -> 3600
     * "-1:00:00" -> -3600
     * it also converts strings with seconds to seconds
     * " 003600.00" -> 3600
     * " 003600.99" -> 3600.99
     *
     * @param {String} time: Timecode to be converted to seconds
     */
    function toSeconds(time) {
      var splitTime, seconds, minutes, hours, isNegative = 1;

      if (typeof time === "number") { return time; }

      if (typeof time !== "string") { return 0; }

      time = time.trim();
      if (time.substring(0, 1) === "-") {
        time = time.replace("-", "");
        isNegative = -1;
      }

      splitTime = time.split(":");
      seconds = +splitTime[splitTime.length - 1] || 0;
      minutes = +splitTime[splitTime.length - 2] || 0;
      hours = +splitTime[splitTime.length - 3] || 0;

      seconds += hours * 3600;
      seconds += minutes * 60;

      return seconds * isNegative;
    }

    /**
     * Member: toTimecode
     *
     * toTimecode converts seconds to a timecode string.
     * seconds -> "HH:MM:SS.DD"
     * examples:
     * 3600 -> "1:00:00"
     * -3600 -> "-1:00:00"
     * it also converts strings to timecode
     * "  00:00:01" -> "1"
     * "  000:01:01.00" -> "1:01"
     * "3600" -> "1:00:00"
     *
     * Accuracy of 5:
     * 1.012345 -> "0:01.01234"
     * Accuracy of 2:
     * 1.012345 -> "0:01.01"
     * Defaults to 2
     *
     * @param {Number} time: Seconds to be converted to timecode
     * @param {Number} accuracy: A one time accuracy to round to
     */
    function toTimecode(time, accuracy) {
      var hours, minutes, seconds, timeString, isNegative = "";

      if (!accuracy && accuracy !== 0) {
        accuracy = 2;
      }

      if (typeof time === "string") {
        time = toSeconds(time);
      }

      if (typeof time !== "number") { return 0; }

      if (time < 0) {
        isNegative = "-";
        time = -time;
      }

      time = roundTime(time, accuracy);
      hours = Math.floor(time / 3600);
      minutes = Math.floor((time % 3600) / 60);
      seconds = roundTime(time % 60, accuracy);
      timeString = seconds + "";

      if (!minutes && !hours) {
        if (seconds < 10) {
          timeString = "0" + timeString;
        }
        return isNegative + "0:" + timeString;
      }

      if (!seconds) {
        timeString = ":00";
      } else if (seconds < 10) {
        timeString = ":0" + seconds;
      } else {
        timeString = ":" + timeString;
      }

      if (!minutes) {
        timeString = "00" + timeString;
      } else if (hours && minutes < 10) {
        timeString = "0" + minutes + timeString;
      } else {
        timeString = minutes + timeString;
      }

      if (hours) {
        timeString = hours + ":" + timeString;
      }

      return isNegative + timeString;
    }

    /**
     * Member: roundTime
     *
     * Rounds a number to a set accuracy
     * Accuracy of 5:
     * 1.012345 -> 1.01234
     * Accuracy of 2:
     * 1.012345 -> 1.01
     *
     * @param {Number} time: Time which will be rounded
     * @param {Number} accuracy: A one time accuracy to round to
     */
    function roundTime(time, accuracy) {
      accuracy = accuracy >= 0 ? accuracy : __timeAccuracy;
      return Math.round(time * (Math.pow(10, accuracy)))
              / Math.pow(10, accuracy);
    }
  };

  /**
   * 默认参数
   */
  $.fn.rangeSlider.defaults = {
    start: "0",
    end: "100",
    startTime:"0:00",
    curTime:"0:30",
    accuracy:5,
    isTime: true
  };
})(jQuery);

/**
      $("#time_line_cap").rangeSlider({
        endTime:AVEdit.setting.text.getCurDur(),
        accuracy:0,
        callback:function(curSeconds){
          AVEdit.setting.text.timeLineCallback(curSeconds);
        },
        isTime: true,
        startHtml:"#start_time_cap",
        endHtml:"#set_time_dur_cap",
        curHtml:"#cur_time_cap"
      });

 */