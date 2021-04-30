import json
from os import path

import setuptools

with open(path.join(path.dirname(__file__), "..", "..", "README.md"), "r") as fh:
    long_description = fh.read()

with open(path.join(path.dirname(__file__), "package.json"), "r") as f:
    package_conf = json.load(f)

setuptools.setup(
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/appannie/ab-testing",
    packages=setuptools.find_packages(),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=2.7, !=3.0.*, !=3.1.*, !=3.2.*, !=3.3.*, !=3.4.*, !=3.5.*",
    install_requires=[
        'crc32c>=2.0,<=3.0',
        'typing'
    ],
    **package_conf
)
