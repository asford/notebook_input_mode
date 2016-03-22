#!/usr/bin/env python
from os import path

from notebook.nbextensions import install_nbextension
from notebook.services.config import ConfigManager

install_nbextension(
    path.join(path.dirname(path.abspath(__file__)), 'notebook_input_mode'), user=True, verbose=2)

cm = ConfigManager().update('notebook', {"load_extensions": {"notebook_input_mode/main": True}})
