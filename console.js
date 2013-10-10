;(function($) {
  "use strict";
  var commands = {};
  commands.ls = function(c) {
    var cmds = getCommands(this);

    for (var i = 0; i < cmds.length; i++) {
      echo(cmds[i], this);
    }

    insertNewLine(this);
  };
  commands.help = commands.ls;
  commands.clear = function(c) {
    $(".line", $(this)).remove();
    insertNewLine(this);
  };

  var defaults = {
    welcome: "Welcome",
    prompt: "$",
    cursor: "▋",
    commands: {}
  }

  function getCommands(el) {
    var keys = [];
    var commands = $(el).data("commands");
    for (var k in commands) {
      keys.push(k);
    }
    return keys;
  }

  function insertNewLine(el) {
    var line = '<span class="line char">' +
      '<span class="prompt char">$</span>' +
      '<span class="text char"></span>' +
      '</span>';

    insertLine(line, el);
  }

  function echo(msg, el) {
    var line = '<span class="line char">' +
      '<span class="text char"></span>' +
      '</span>';

    insertLine(line, el);
    $(".text:last", $(el)).html(msg);
  }

  function insertLine(line, el) {
    $("#mobilehack", $(el)).val("");
    var last = $(".line:last", $(el));
    last.addClass("inactive");

    if (last.length) {
      $(line).insertAfter(last);
      $(window).scrollTop(last.offset().top - last.height());
    } else {
      $(line).insertBefore(".cursor", $(el));
    }
  }

  function echoWithNewLine(msg, el) {
    echo(msg, el);
    insertNewLine(el);
  }

  function backspace(el) {
    var content = $(".text:last", $(el));
    content.html(content.html().substring(0, content.html().length - 1));
  }

  function processLine(line, el) {
    if (!line) {
      insertNewLine(el);
      return;
    }

    var cmd = line.split(' ')[0];
    var commands = $(el).data("commands");

    if (!commands.hasOwnProperty(cmd)) {
      var message = line + ': command not found';
      echoWithNewLine(message, el);
      return;
    }

    if (typeof(commands[cmd]) === 'string') {
      echoWithNewLine(commands[cmd], el);
    } else if (typeof(commands[cmd]) === 'function') {
      $.proxy(commands[cmd], el, {
        echo: function(msg) { echo(msg, el); },
        echoWithNewLine: function(msg) { 
          echoWithNewLine(msg, el); 
        }
      })();
    } 
  }

  $(document).click(function(e) {
    var target = $("#mobilehack");
    if ($.inArray(e.target, target) != -1) return;
    if ($.inArray(e.target, $("#help")) != -1) return;

    $(e.target).closest(".console")
      .find("#mobilehack")
      .focus()
      .click();
  });

  $.fn.console = function(opts) {
    opts = $.extend({}, defaults, opts);
    this.each(function() {
      $(this).addClass("console")
        .data("commands", $.extend({}, commands, opts.commands));

      var html = "<div class='welcome char'>{0}</div><span class='line char'><span class='prompt char'>{1}</span><span class='text char'></span></span><span class='cursor char'>{2}</span><input id='mobilehack' type='text' />";
      
      var args = [opts.welcome, opts.prompt, opts.cursor];
      for (var i = 0; i < args.length; i++) {
        html = html.replace("{" + i + "}", args[i]);
      }
      $(this).html(html);
     
      var self = $(this); 
      $("#mobilehack", self).bind("keydown", function(e) {
        if (e.keyCode == 8 || e.which == 8) {
          e.preventDefault();
          backspace(self);
        }
      });

      $("#mobilehack", self).keypress(function(e) {
        var line = $(".text:last", self);
        if (e.which == 13) {
          processLine(line.html(), self);
          return;
        }

        if (e.which === 32) line.append("&nbsp;");
        else line.append(String.fromCharCode(e.which));
      });
    });

    $("#mobilehack").focus().click();
    return this; 
  } 
})(jQuery);
