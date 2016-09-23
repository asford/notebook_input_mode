# notebook_input_mode
Jupyter nbextension supporting alternate input modes such as vim mode

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