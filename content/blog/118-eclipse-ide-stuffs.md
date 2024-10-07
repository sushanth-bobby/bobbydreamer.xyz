---
title: Eclipse IDE Stuffs
date: 2021-07-29
description: Some standard settings in eclipse
tags: ['java', 'maven']
slug: "/118-eclipse-ide-stuffs"
---

##### Workspaces
Create different workspaces for different projects

File ➔ Switch Workspace ➔ Other ➔ Click Browse in the dialog box and create a new folder and select

Remove the unused workspaces by      
Window ➔ Preferences ➔ General ➔ Startup and Shutdown ➔ Workspaces 

* * * 

##### Eclipse Configuration details

Help ➔ Above Eclipse IDE ➔ Installation details ➔ Configuration tab

Look for -vm line
```sh {2-3}
-vm
D:\BigData\3. Java\Eclipse Java\eclipse-java-2021-06-R-win32-x86_64\eclipse\\plugins/org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_16.0.1.v20210528-1205/jre/bin\server\jvm.dll
eclipse.vm=D:\BigData\3. Java\Eclipse Java\eclipse-java-2021-06-R-win32-x86_64\eclipse\\plugins/org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_16.0.1.v20210528-1205/jre/bin\server\jvm.dll
eclipse.vmargs=-Dosgi.requiredJavaVersion=11
java.vm.compressedOopsMode=32-bit
java.vm.info=mixed mode
java.vm.name=OpenJDK 64-Bit Server VM
java.vm.specification.name=Java Virtual Machine Specification
java.vm.specification.vendor=Oracle Corporation
java.vm.specification.version=16
java.vm.vendor=Oracle Corporation
java.vm.version=16.0.1+9-24
```

* * * 

##### Building package using Maven

Package Explorer ➔ Right click on package ➔ Run as ➔ Maven Build...

In the Goal input type in `clean package`

Click RUN

* * * 

##### Command to run java program from eclipse

Debug Perspective = Windows ➔ Show view ➔ Debug 

![Ecliipse Enabling Debug view](assets/118-eclipse-debug.png)

Right click on the executing program in debug view and select properties. 
![Ecliipse Debug Properties](assets/118-eclipse-debug-properties.png)

Raw command would look like this     
```sh
"D:\BigData\3. Java\Eclipse Java\eclipse-java-2021-06-R-win32-x86_64\eclipse\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_16.0.1.v20210528-1205\jre\bin\javaw.exe" -Dfile.encoding=Cp1252 -classpath "C:\Users\Sushanth\Java\Workspace\Java Hello World\bin;D:\BigData\3. Java\Zips & Installers\gson-2.6.2.jar;D:\BigData\3. Java\Zips & Installers\commons-lang3-3.4.jar;D:\BigData\3. Java\Zips & Installers\univocity-parsers-2.0.0.jar;D:\BigData\3. Java\Zips & Installers\velocity-1.7\velocity-1.7\velocity-1.7-dep.jar;D:\BigData\3. Java\Zips & Installers\jsoup-1.8.3.jar;D:\BigData\3. Java\Zips & Installers\juniversalchardet-1.0.3.jar;D:\BigData\3. Java\Zips & Installers\json-20170516.jar;D:\BigData\3. Java\Zips & Installers\commons-io-2.4.jar;D:\BigData\3. Java\Zips & Installers\mysql-connector-java-8.0.12.jar" -XX:+ShowCodeDetailsInExceptionMessages BTD.files2download
```
To see the console messages(System.out.println), you need to update from javaw.exe to java.exe,     

* javaw.exe - doesn't show the console.log outputs
* java.exe - shows the console.log outputs

* * * 

**Thank you for reading**