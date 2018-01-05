# notebook_input_mode
Jupyter nbextension supporting alternate input modes such as vim mode
# Deprecated!

Note that this extension has been deprecated in favor of [Select Codemirror Keymap](http://jupyter-contrib-nbextensions.readthedocs.io/en/latest/nbextensions/select_keymap/README.html), a `jupyter-contrib-nbextensions` sub-project.

# Installation

* `clone` and run `python setup.py develop` 

__or__

* `pip install 'git+https://github.com/asford/notebook_input_mode.git#egg=notebook_input_mode'`

Within a notebook switch on vim mode via the menu bar `Edit -> Vim`.

# Key Mappings
tbd

# Developer References
* http://jupyter-notebook.readthedocs.org/en/latest/extending/frontend_extensions.html
* http://jupyter-notebook.readthedocs.org/en/latest/frontend_config.html

In JavaScript console use the following to get a list of notebook actions:
```javascript
Object.keys(require('base/js/namespace').actions._actions);
```
