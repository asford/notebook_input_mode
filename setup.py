# -*- coding: utf-8 -*-
from setuptools import setup
from jupyterpip import cmdclass

setup(
    name='notebook_input_mode',
    version="0.1b1",
    description="Jupyter notebook extension supporting optional vim-style keybindings.",
    author="Alex Ford",
    author_email="a.sewall.ford@gmail.com",
    license="Unlicense",
    packages=['notebook_input_mode'],
    install_requires=["notebook"],
    cmdclass=cmdclass('notebook_input_mode', 'notebook_input_mode/main'),
)
