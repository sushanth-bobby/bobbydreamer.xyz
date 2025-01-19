---
title: Conda - Miniforge
description: Using Conda to handle python packages/libraries
date: 2024-11-08
tags:
  - python
  - jupyter
slug: /168-conda-miniforge
---

## Install Miniforge

* Google *miniforge* and install the latest stable version
* Point the environment variables to python and Conda location and test to see if they are accessible `python --version` in cmd

## Setting up conda environment

Creating new Conda environment
* `conda create -n ` creates new environment
* `btd_env` new environment name
* `-c conda-forge pandas` installs from Channel conda-forge
* `pandas` package to be installed

```
conda create -n btd_env -c conda-forge pandas
```

You can activate the new environment as follows:
```
conda activate btd_env
```

Now take a look at all the modules in your environment:
```
conda list
```

If you want to switch back to your base environment simply type:
```
conda deactivate
```

## Installing new packages

Open the conda environment and enter below commands to install respective libraries

```
conda install -c conda-forge jupyterlab
conda install -c conda-forge duckdb
conda install -c conda-forge matplotlib
```


## Everyday commands

In miniforge prompt
```
d:

cd "20230422 - BigData\12. Python\4. Jupyter Notebooks"

conda activate btd_env

jupyter lab

conda deactivate
```

