define([
    'base/js/namespace',
    'jquery',
    'base/js/utils',
    'base/js/keyboard',
    'services/config',
    'notebook/js/cell',
    'notebook/js/outputarea',
    'notebook/js/completer',
    'notebook/js/celltoolbar',
    'codemirror/lib/codemirror',
    'codemirror/mode/python/python',
    'notebook/js/codemirror-ipython',
    'codemirror/keymap/vim',
    'codemirror/mode/meta',
    'codemirror/addon/comment/comment',
    'codemirror/addon/dialog/dialog',
    'codemirror/addon/edit/closebrackets',
    'codemirror/addon/edit/matchbrackets',
    'codemirror/addon/search/searchcursor',
    'codemirror/addon/search/search',
], function(IPython,
    $,
    utils,
    keyboard,
    configmod,
    cell,
    outputarea,
    completer,
    celltoolbar,
    CodeMirror,
    cmpython,
    cmip,
    cmvim
    ) {
    "use strict";

    function set_default_mode() {
      console.log("Unable to reset to default mode, refresh notebook to set input mode.");
    }

    function set_vim_mode() {
      CodeMirror.commands.leaveCurrentMode = function(cm) {
        if ( cm.state.vim.insertMode ) {
            // Move from insert mode into command mode.
            CodeMirror.keyMap['vim-insert'].call('Esc', cm);
        } else if ( cm.state.vim.visualMode ) {
            // Move from visual mode to command mode.
            CodeMirror.keyMap['vim'].call('Esc', cm);
        } else {
            // Move to notebook command mode.
            IPython.notebook.command_mode();
            IPython.notebook.focus_cell();
        }
      };

      var update_cm_config = function(cm_config) {
        cm_config["vimMode"] = true;
        cm_config["keyMap"] = 'vim';
        cm_config["extraKeys"]["Esc"] = 'leaveCurrentMode';
        cm_config["extraKeys"]["Ctrl-["] = 'leaveCurrentMode';
      }

      var update_cm_to_default = function(code_mirror) {
          code_mirror.setOption("vimMode", cell.Cell.options_default.cm_config["vimMode"]);
          code_mirror.setOption("keyMap", cell.Cell.options_default.cm_config["keyMap"]);
          code_mirror.setOption("extraKeys", cell.Cell.options_default.cm_config["extraKeys"]);
      }

      update_cm_config( cell.Cell.options_default.cm_config );

      IPython.notebook.get_cells().map(
        function(cell) {
          update_cm_config( cell.cm_config );
          update_cm_to_default( cell.code_mirror);
          return cell;
        });

      // Disable keyboard manager for code mirror dialogs, handles ':' triggered ex-mode dialog box in vim mode.
      // Manager is re-enabled by re-entry into notebook edit mode + cell normal mode after dialog closes
      function openDialog_keymap_wrapper(target, template, callback, options) {
        IPython.keyboard_manager.disable();
        return target.call(this, template, callback, options);
      }
      CodeMirror.defineExtension("openDialog", _.wrap(CodeMirror.prototype.openDialog, openDialog_keymap_wrapper ));

      // Rebind shortcuts to more vim-like nature
      var edit = IPython.keyboard_manager.edit_shortcuts;
      var default_edit = IPython.keyboard_manager.get_default_edit_shortcuts();
      edit.remove_shortcut("esc")
      edit.add_shortcut("shift-esc", default_edit["esc"])

      var cmd = IPython.keyboard_manager.command_shortcuts;
      var default_cmd = IPython.keyboard_manager.get_default_command_shortcuts();

      cmd.remove_shortcut("i,i")
      cmd.set_shortcut("ctrl-c", default_cmd["i,i"])

      cmd.remove_shortcut("0,0")
      cmd.add_shortcut("ctrl-z", default_cmd["0,0"])

      cmd.remove_shortcut("d,d")
      cmd.add_shortcut("d,d", default_cmd["x"]);
      
      cmd.remove_shortcut("z")
      cmd.add_shortcut("u", default_cmd["z"]);

      cmd.remove_shortcut("y")
      cmd.add_shortcut("`", default_cmd['y'])

      cmd.remove_shortcut("m")
      cmd.add_shortcut("0", default_cmd['m'])

      cmd.add_shortcut("y,y", default_cmd["c"])
      cmd.add_shortcut("p", default_cmd["v"])
      cmd.add_shortcut("shift-p", default_cmd["shift-v"])

      cmd.add_shortcut("i", default_cmd["enter"]);

      cmd.remove_shortcut("h")
      cmd.add_shortcut("shift-/", default_cmd["h"])

      cmd.remove_shortcut("o")
      cmd.add_shortcut("h", default_cmd["o"])
      cmd.add_shortcut("shift-h", default_cmd["shift-o"])

      cmd.add_shortcut("o", default_cmd["b"])
      cmd.add_shortcut("shift-o", default_cmd["a"])
    };

    function apply_input_mode(target_mode) {
      if (target_mode == 'vim') {
        set_vim_mode();
      } else if( target_mode == 'default' ) {
        set_default_mode();
      } else {
        console.log("Unknown input mode:", target_mode)
      }

    }

    function update_mode_menu( ) {
      var input_mode = IPython.notebook.config.data.notebook_input_mode || "default";

      $("#edit_menu").find(".selected_input_mode").removeClass("selected_input_mode");
      $("#edit_menu").find("#menu-keymap-" + input_mode).addClass("selected_input_mode");
    }

    function update_input_mode(target_mode) {
      apply_input_mode( target_mode );
      IPython.notebook.config.update({ notebook_input_mode : target_mode }).then( IPython.notebook.events.trigger("config_changed.notebook_input_mode"));
    };

    return {
      // this will be called at extension loading time
      //---
      load_ipython_extension: function(){
        $('head').append('<link rel="stylesheet" href="/nbextensions/notebook_input_mode/styles.css" type="text/css" />');
        
        $("#edit_menu").append('<li class="divider"></li>');
        $("#edit_menu").append('<li class="dropdown-header">Key Map</li>');
        $("#edit_menu").append('<li id="menu-keymap-default"><a href="#">Default<i class="fa"></i></a></li>');
        $("#edit_menu").append('<li id="menu-keymap-vim"><a href="#">Vim<i class="fa"></i></a></li>');

        $('#menu-keymap-vim').click(function () { update_input_mode('vim'); });
        $('#menu-keymap-default').click(function () { update_input_mode('default'); });
        IPython.notebook.events.on("config_changed.notebook_input_mode", update_mode_menu);

        var input_mode = IPython.notebook.config.data.notebook_input_mode || "default";
        apply_input_mode(input_mode);
        IPython.notebook.events.trigger("config_changed.notebook_input_mode");
    }
  };
})
