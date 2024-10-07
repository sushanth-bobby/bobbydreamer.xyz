---
title: Upgrading Java and Installing Maven
date: 2021-07-28
description: Upgrading Java and Installing Maven
tags: ['java', 'maven']
slug: "/117-install-java-and-maven"
---

* Uninstalled older version of Java using `JavaUninstallTool.exe` 

* Upgraded from Java 8 to Java 16 `jdk-16.0.2_windows-x64_bin.exe`
  - Had to manually update the environment variable for JAVA_HOME from Java 8 to Java 16

* Installed Maven by downloading the *binary zip archive* `apache-maven-3.8.1-bin.zip`
  - Unzip it and copy the folder to `C:\Program Files\Java\apache-maven-3.8.1` and sub-folder `bin` has the *mvn* file. 

##### Create environment variables

1. In windows, in the search bar, type-in *environm* you will get the *Edit the System Environment Variables*. Click it. 

2. In system properties window, click Environment Variables button. 

3. In System Variables section, add a new variable called 
  - `MAVEN_HOME` : `C:\Program Files\Java\apache-maven-3.8.1`

4. Update `Path` with `%MAVEN_HOME%\bin`

![Setting up Java and Maven environment variables](assets/117-environment-variable.png)

##### Verification 

![Java and Maven verification](assets/117-install-java-maven.png)

##### Effects of this
* Eclipse Oxygen stopped working. It seems there is a Java Compatibility issue and was suggested to use newer version of Eclipse(eclipse-java-2021-06-R-win32-x86_64)

* * * 

**Thats all folks**