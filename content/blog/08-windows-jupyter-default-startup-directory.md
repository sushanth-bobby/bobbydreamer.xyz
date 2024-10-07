---
title: Jupyter notebook default startup directory in windows
date: 2020-03-19
slug: "/windows-jupyter-default-startup-directory"
tags:
  - jupyter
---

I want everything organized like i have created a folder in 'D' drive to test Python scripts in Jupyter Notebooks. When starting jupyter notebook, it starts up in ```C:\Users\Sushanth``` . 

I am like "WHAT", there should be a way to change this. There should be a config file or settings somewhere to change this. 

> This is the point, where i am more worked up in changing this directory than coding some python scripts

I google a bit and find out there are two ways to do this and in my head 3 ways get this done, 

#### # Method 1 ( Dont start to try this just yet )
1. Open "Anaconda prompt". It should open up in the default directory
1. Go into folder ```.juypter```
1. Enter the below command and it will generate a file named ```jupyter_notebook_config.py```
    ```python 
    jupyter notebook --generate-config
    ```
1. Open the file in Notepad. Find ```c.NotebookApp.notebook_dir```. Its a commented line, so '#' found beginning of the line, delete it and add the path of your folder. Save the file. 
    ```python 
    c.NotebookApp.notebook_dir = 'D:\\BigData\\12. Python\\4. Jupyter Notebooks'
    ```
1. Close the Jupyter Notebook and Close the Anaconda Terminal 
1. Open Jupyter Notebook again. 
1. Voila ( Nothing happened, it started in same old C:\Users\Sushanth directory )

#### # Method 2
1. Go into the desired folder
    ```sh
    C:\Users\Sushanth>d:

    D:\>cd "BigData\12. Python\4. Jupyter Notebooks"
    ```
2. Enter the command 
    ```sh 
    jupyter notebook 
    ```
3. Voila ( It works )

### # Method 3
You installed Anaconda and started Jupyter Notebook to learn python. Does it matter actually where to you save it. Problem is even before starting Jupyter Notebook, you created a folder structure and decided to save your files there. Expectations. hmm. 

Create a new folder in the default directory and start writing some scripts. 

**Thats it for now, go *PLAY* **