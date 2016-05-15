# Copyright (c) 2015, Jonathan Frederic
# All rights reserved.

# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:

# * Redistributions of source code must retain the above copyright notice, this
  # list of conditions and the following disclaimer.

# * Redistributions in binary form must reproduce the above copyright notice,
  # this list of conditions and the following disclaimer in the documentation
  # and/or other materials provided with the distribution.

# * Neither the name of ipython-pip nor the names of its
  # contributors may be used to endorse or promote products derived from
  # this software without specific prior written permission.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
# CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

def _is_root():
    """Checks if the user is rooted."""
    import ctypes, os
    try:
        return os.geteuid() == 0
    except AttributeError:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    return False

def cmdclass(path, enable=None, user=None):
    """Build nbextension cmdclass dict for the setuptools.setup method.

    Parameters
    ----------
    path: str
        Directory relative to the setup file that the nbextension code lives in.
    enable: [str=None]
        Extension to "enable".  Enabling an extension causes it to be loaded
        automatically by the IPython notebook.
    user: [bool=None]
        Whether or not the nbextension should be installed in user mode.
        If this is undefined, the script will install as user mode IF the
        installer is not sudo.

    Usage
    -----
    For automatic loading:
    # Assuming `./extension` is the relative path to the JS files and
    # `./extension/main.js` is the file that you want automatically loaded.
    setup(
        name='extension',
        ...
        cmdclass=cmdclass('extension', 'extension/main'),
    )

    For manual loading:
    # Assuming `./extension` is the relative path to the JS files.
    setup(
        name='extension',
        ...
        cmdclass=cmdclass('extension'),
    )
    """

    from setuptools.command.install import install
    from setuptools.command.develop import develop
    from os.path import dirname, abspath, join, exists, realpath
    from traceback import extract_stack

    # Check if the user flag was set.
    if user is None:
        user = not _is_root()

    # Get the path of the extension
    calling_file = extract_stack()[-2][0]
    fullpath = realpath(calling_file)
    if not exists(fullpath):
        raise Exception('Could not find path of setup file.')
    extension_dir = join(dirname(fullpath), path)

    # Installs the nbextension
    def run_nbextension_install(develop):
        try:
            # IPython/Jupyter 4.0
            from notebook.nbextensions import install_nbextension
            from notebook.services.config import ConfigManager
        except ImportError:
            # Pre-schism
            from IPython.html.nbextensions import install_nbextension
            from IPython.html.services.config import ConfigManager
        install_nbextension(extension_dir, symlink=develop, user=user, verbose=2)
        if enable is not None:
            print("Enabling the extension ...")
            cm = ConfigManager()
            cm.update('notebook', {"load_extensions": {enable: True}})

    # Command used for standard installs
    class InstallCommand(install):
        def run(self):
            print("Installing Python module...")
            install.run(self)
            print("Installing nbextension ...")
            run_nbextension_install(False)

    # Command used for development installs (symlinks the JS)
    class DevelopCommand(develop):
        def run(self):
            print("Installing Python module...")
            develop.run(self)
            print("Installing nbextension ...")
            run_nbextension_install(True)

    return {
        'install': InstallCommand,
        'develop': DevelopCommand,
    }
