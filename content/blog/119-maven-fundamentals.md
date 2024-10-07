---
title: Maven fundamentals
date: 2021-07-29
description: Maven fundaments and thin jar
tags: ['java', 'maven']
slug: "/119-maven-fundamentals"
---

Maven is based around the central concept of a build lifecycle and its made up of phases and these are executed sequentially,     

* **validate** - validate the project is correct and all necessary information is available
* **compile** - compile the source code of the project
* **test** - test the compiled source code using a suitable unit testing framework. These tests should not require the code be packaged or deployed
* **package** - take the compiled code and package it in its distributable format. Some of the valid packaging values are jar, war, ear and pom.
* **verify** - run any checks on results of integration tests to ensure quality criteria are met
* **install** - install the package into the local repository, for use as a dependency in other projects locally
* **deploy** - done in the build environment, copies the final package to the remote repository for sharing with other developers and projects.

If you execute command `mvn verify`, it executes each default lifecycle phase in order (validate, compile, package, etc.), before executing verify. 

Most commonly used command is `mvn clean package`

Each phase is made up of finer **goals** and these goals are grouped together in a **Maven plugin**. A plugin may have one or more goals wherein each goal represents a capability of that plugin. A goal not bound to any build phase could be executed outside of the build lifecycle by direct invocation. The order of execution depends on the order in which the goal(s) and the build phase(s) are invoked. For example, consider the command below. The clean and package arguments are build phases, while the dependency:copy-dependencies is a goal (of a plugin).
```sh
mvn clean dependency:copy-dependencies package
```

If this were to be executed, the clean phase will be executed first, and then the dependency:copy-dependencies goal, before finally executing the package phase.

* * * 

### Setting up a simple maven project

Eclipse ➔ File ➔ New ➔ Project ➔ Maven Project ➔ Next

Don't check *Create a simple project(skip archetype selection)* as in the next screen you will have to filter archetypes `org.apache.maven` and select `maven.archetype.quickstart` ➔ Next

Fill GroupId, ArtifactId, Version and Package
* GroupId – A unique base name of the company or group that created the project. Usually a reverse domain name eg:- com.yahoo, com.google, com.ibm, com.bobbydreamer
* ArtifactId – A unique name of the project. Eg:- slim-maven
* Version – By default it starts with 1.0-SNAPSHOT as you make changes increase the version number like *1.1-SNAPSHOT*. **SNAPSHOT** is a build which can be replaced by another build as the name implies it could change any time as it is actively developed. It can also be called as *beta* but its not. **RELEASE** is the final build for a verion which does not change *1.9-RELEASE*. 
* Package – Package contains the source codes. Say if you set the package to com.foo.bar, the generated maven project will contain a folder com/foo/bar in src/main/java. So think about it. Eg:- com.bobbydreamer.slim_maven

Click Finish

* * * 

It should look like this now

![Ecliipse Maven Project](assets/119-maven1.png)


* * * 

### Adding dependency

Dependency in terms of maven is a packaged piece of classes that your project depends on. It can be jar, war etc. For example, if you want to be able to write JUnit test, you'll have to use JUnit annotations and classes thus you have to declare that your project depends on JUnit.

Here we are going to add dependencies namely,     
* junit
* log4j-api
* log4j-core

Adding those 3 dependencies in pom.xml under `<dependencies></dependencies>` tag, you can get these from [mvnrepository](https://mvnrepository.com/) or by googling *maven library-name*

```xml {3,12,19}
  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.11</version>
      <scope>test</scope>
    </dependency>
    
	<!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-api -->
	<dependency>
	    <groupId>org.apache.logging.log4j</groupId>
	    <artifactId>log4j-api</artifactId>
	    <version>2.14.1</version>
	</dependency>
	
	<!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-core -->
	<dependency>
	    <groupId>org.apache.logging.log4j</groupId>
	    <artifactId>log4j-core</artifactId>
	    <version>2.14.1</version>
	</dependency>    
  </dependencies>
```

When you do Ctrl+S, the dependencies get downloaded to a new folder(symbolic) *Maven Dependencies* but its actually downloaded to `C:\users\Sushanth\.m2\repository\`

##### Setting up log4j configuration

Two things you got to do,     

1. Create a new folder called *resources* under `src/main` and `src/test` - blue box in pic
2. Create a new folder called *logs* under the main project - green box in pic

![Ecliipse Maven Project](assets/119-maven2.png)

```java:title=App.java {3-4,10,15-20}
package com.bobbydreamer.sllim_maven;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * Hello world!
 */
public class App {
    private static final Logger logger = LogManager.getLogger(App.class);
    public static void main( String[] args )
    {
        System.out.println( "Hello World!" );
        
        logger.trace("We've just greeted the user!");
        logger.debug("We've just greeted the user!");
        logger.info("We've just greeted the user!");
        logger.warn("We've just greeted the user!");
        logger.error("We've just greeted the user!");
        logger.fatal("We've just greeted the user!");        
    }
}
```

Create the below log4j configuration file in `src/main/resources` folder. Highlighted line mentions where log file will be created during execution. 
```xml:title=log4j2.xml {7}
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">
    <Appenders>
        <Console name="ConsoleAppender" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n" />
        </Console>
        <File name="FileAppender" fileName="logs/application-${date:yyyyMMdd}.log" immediateFlush="false" append="true">
            <PatternLayout pattern="%d{yyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </File>
    </Appenders>
    <Loggers>
        <Root level="debug">
            <AppenderRef ref="ConsoleAppender" />
            <AppenderRef ref="FileAppender"/>
        </Root>
    </Loggers>
</Configuration>
```

* * * 

### Plugins

Plugins perform tasks for a Maven build. These are not packaged in the application. Any task executed by Maven is performed by plugins. 

There are two categories of plugins,     

* **Build plugins** will be executed during the build and they should be configured in the <build/> element from the POM.
* **Reporting plugins** will be executed during the site generation and they should be configured in the <reporting/> element from the POM.

According to specific goals specified, a specific lifecyle will be used and a specific set of plugins goals will be executed(eg:- mvn clean, mvn package)

All the plugins mentioned under `<build>`, most of which are automatically added by eclipse during maven and build. 

```xml:title=pom.xml
  <build>
    <pluginManagement><!-- lock down plugins versions to avoid using Maven defaults (may be moved to parent pom) -->
      <plugins>
        <!-- clean lifecycle, see https://maven.apache.org/ref/current/maven-core/lifecycles.html#clean_Lifecycle -->
        <plugin>
          <artifactId>maven-clean-plugin</artifactId>
          <version>3.1.0</version>
        </plugin>
        <!-- default lifecycle, jar packaging: see https://maven.apache.org/ref/current/maven-core/default-bindings.html#Plugin_bindings_for_jar_packaging -->
        <plugin>
          <artifactId>maven-resources-plugin</artifactId>
          <version>3.0.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.8.0</version>
        </plugin>
        <plugin>
          <artifactId>maven-surefire-plugin</artifactId>
          <version>2.22.1</version>
        </plugin>
        
        <plugin>
          <artifactId>maven-install-plugin</artifactId>
          <version>2.5.2</version>
        </plugin>
        <plugin>
          <artifactId>maven-deploy-plugin</artifactId>
          <version>2.8.2</version>
        </plugin>
        <!-- site lifecycle, see https://maven.apache.org/ref/current/maven-core/lifecycles.html#site_Lifecycle -->
        <plugin>
          <artifactId>maven-site-plugin</artifactId>
          <version>3.7.1</version>
        </plugin>
        <plugin>
          <artifactId>maven-project-info-reports-plugin</artifactId>
          <version>3.0.0</version>
        </plugin>
        
      </plugins>
    </pluginManagement>
<!-- ... -->
```

Below are plugins mentioned outside of `<pluginManagement>` as you want them to execute. Plugins we have here are, 
1. **maven-jar-plugin** : This plugin provides the capability to build jars
2. **maven-dependency-plugin** : The dependency plugin provides the capability to manipulate artifacts. It can copy and/or unpack artifacts from local or remote repositories to a specified location.
3. **maven-resources-plugin** : The resources plugin copies files from input resource directories to an output directory.

Do note in `maven-jar-plugin` we mention the mainClass, if we don't do that, we get error like below,     
```sh
no main manifest attribute, in slim_maven-0.0.1-SNAPSHOT.jar
``` 

My thoughts are *maven-jar-plugin* and *maven-dependency-plugin* should be used together and *maven-resources-plugin* is optional. 

```xml:title=pom.xml {4,10-11,20,24,32}
<!-- ... -->
    <plugins>
        <plugin>
          <artifactId>maven-jar-plugin</artifactId>
          <version>3.0.2</version>
	      <configuration>
	        <archive>
	          <manifest>
	            <addClasspath>true</addClasspath>
	            <mainClass>com.bobbydreamer.slim_maven.App</mainClass>
                <classpathPrefix>dependency-jars/</classpathPrefix>	            
	          </manifest>
	        </archive>
	      </configuration>          
        </plugin>

        <!-- Copy project dependency -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-dependency-plugin</artifactId>
            <version>2.5.1</version>
            <executions>
              <execution>
                <id>copy-dependencies</id>
                <phase>package</phase>
                <goals>
                    <goal>copy-dependencies</goal>
                </goals>
                <configuration>
                  <!-- exclude junit, we need runtime dependency only -->
                  <includeScope>runtime</includeScope>
                  <outputDirectory>${project.build.directory}/dependency-jars/</outputDirectory>
                </configuration>
              </execution>
            </executions>
        </plugin>    

	<plugin>
         <artifactId>maven-resources-plugin</artifactId>
         <version>3.0.2</version>
         <executions>
          <execution>
            <id>copy-resources</id>
            <phase>package</phase>
            <goals>
                <goal>copy-resources</goal>
            </goals>
            <configuration>
              <outputDirectory>${project.build.directory}/resources/</outputDirectory>
              <resources>
               <resource>
                <directory>${basedir}</directory>    <!-- source directory -->
                <filtering>true</filtering>
                <excludes>      <!--Those files will be excluded-->
                    <exclude>.project</exclude>
                </excludes>
                
       			<includes>      <!--Only those files will be included-->
                    <include>pom.xml</include>
                </includes>                
               </resource>
               
               <resource>
                <directory>${basedir}/src/main/resources</directory>    <!-- source directory -->
                <filtering>true</filtering>
               </resource>               
              </resources>
            </configuration>
          </execution>
         </executions>
     </plugin>

    </plugins>   
  </build>
```
In the below image, i have highlighted few things to note, 
1. `dependency-jars` folder contains the log4j jar files 
2. `logs` folder contains logs written by the application
3. `resources` folder contains log4j2.xml and pom.xml
4. `slim_maven-0.0.1-SNAPSHOT.jar` is the jar file built by Maven

![Java JAR Execution](assets/119-maven3.png)

This is a **thin jar** solution where all project's dependencies are copied to a pre-defined folder called `dependency-jars`. If we extract `slim_maven-0.0.1-SNAPSHOT.jar` using command `tar xvf slim_maven-0.0.1-SNAPSHOT.jar`and see the `META-INF/MANIFEST.MF`, the dependencies are added in the Class-Path.

```sh:title=MANIFEST.MF {5}
Manifest-Version: 1.0
Created-By: Apache Maven 3.8.1
Built-By: Sushanth
Build-Jdk: 16.0.1
Class-Path: dependency-jars/log4j-api-2.14.1.jar dependency-jars/log4j-c
 ore-2.14.1.jar
Main-Class: com.bobbydreamer.slim_maven.App
```

### References
* [Maven : Introduction to the Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
* [Creating FAT aka Uber JAR with Maven](120-maven-creating-fat-aka-uber-jar)