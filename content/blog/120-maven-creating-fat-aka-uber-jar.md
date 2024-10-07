---
title: Creating FAT aka Uber JAR with Maven
date: 2021-07-30
description: Creating fat aka uber jar with maven
tags: ['java', 'maven']
slug: "/120-maven-creating-fat-aka-uber-jar"
---

[Earlier](119-maven-fundamentals) we have seen how to build a JAR file using Maven and see how the dependencies are copied to a separate dependency folder. Here we will see how Maven can create a JAR file which includes all the compiled Java classes from your project, and all compiled Java classes from all JAR files your project depends on. Basically it will be like all files combined into one file like an executable JAR file. 

From what i have read *Maven assembly plugin* is not good in producing fat/uber jar, it may cause name conflict issue. Other recommended options are mentioned below, and does the same thing which is packaging all dependencies into one uber-JAR and with few additional things,     
* **Maven shade plugin** - This plugin is particularly useful as it merges content of specific files instead of overwriting them by [relocating classes](https://maven.apache.org/plugins/maven-shade-plugin/examples/class-relocation.html).
* **Maven one-jar plugin** - This provides a custom class loader that knows how to load classes and resources from jars inside an archive, instead of from jars in the filesystem. **Not actively maintained since 2012**, so not going for this. 

Run below command to create Maven project from command line
```sh
mvn archetype:generate -DgroupId=com.bobbydreamer \
 -DartifactId=uber_jar \
 -DarchetypeArtifactId=maven-archetype-quickstart \
 -DinteractiveMode=false
```
     
You project tree should look like this     
```sh:title=tree
D:\BigData\3. Java\Workspaces\Mavens\uber_jar>tree
Folder PATH listing for volume New Volume
Volume serial number is C415-8F09
D:.
├───.settings
├───logs
└───src
    ├───main
    │   ├───java
    │   │   └───com
    │   │       └───bobbydreamer
    │   └───resources
    └───test
        ├───java
        │   └───com
        │       └───bobbydreamer
        └───resources
```

Below is the Shade plugin configuration part of pom.xml

```xml:title=pom.xml {4,17}
        <!-- Maven Shade Plugin -->
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-shade-plugin</artifactId>
          <version>2.3</version>
          <executions>
             <!-- Run shade goal on package phase -->
            <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
              <transformers>
                <!-- add Main-Class to manifest file -->
                  <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                  <mainClass>com.bobbydreamer.App</mainClass>
                </transformer>
              </transformers>
            </configuration>
              </execution>
          </executions>
        </plugin>
```

Here is the full XML file
```xml:title=pom.xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.bobbydreamer</groupId>
  <artifactId>uber_jar</artifactId>
  <packaging>jar</packaging>
  <version>1.0-SNAPSHOT</version>
  
  <name>uber_jar</name>
  <url>http://www.bobbydreamer.com</url>

  <!-- This is required for building successfully -->
  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.7</maven.compiler.source>
    <maven.compiler.target>1.7</maven.compiler.target>
  </properties>
  
  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>3.8.1</version>
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
        
    <build>
     <!-- <finalName>uber_shade</finalName>  -->  
	    <pluginManagement><!-- lock down plugins versions to avoid using Maven defaults (may be moved to parent pom) -->
	      <plugins>
	        <!-- clean lifecycle, see https://maven.apache.org/ref/current/maven-core/lifecycles.html#clean_Lifecycle -->
	        <plugin>
	          <artifactId>maven-clean-plugin</artifactId>
	          <version>3.1.0</version>
	        </plugin>
	        <!-- default lifecycle, jar packaging: see https://maven.apache.org/ref/current/maven-core/default-bindings.html#Plugin_bindings_for_jar_packaging -->
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
	            
        <plugins>

        <plugin>
          <artifactId>maven-jar-plugin</artifactId>
          <version>3.0.2</version>
	      <configuration>
	        <archive>
	          <manifest>
	            <addClasspath>true</addClasspath>
	            <mainClass>com.bobbydreamer.App</mainClass>
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
        

        <!-- Maven Shade Plugin -->
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-shade-plugin</artifactId>
          <version>2.3</version>
          <executions>
             <!-- Run shade goal on package phase -->
            <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
              <transformers>
                <!-- add Main-Class to manifest file -->
                  <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                  <mainClass>com.bobbydreamer.App</mainClass>
                </transformer>
              </transformers>
            </configuration>
              </execution>
          </executions>
        </plugin>

        </plugins>
    </build>        
        
</project>
```

This is the clean and package output
```sh
[INFO] Scanning for projects...
[INFO] 
[INFO] ---------------------< com.bobbydreamer:uber_jar >----------------------
[INFO] Building uber_jar 1.0-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] --- maven-clean-plugin:3.1.0:clean (default-clean) @ uber_jar ---
[INFO] 
[INFO] --- maven-resources-plugin:2.6:resources (default-resources) @ uber_jar ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] Copying 1 resource
[INFO] 
[INFO] --- maven-compiler-plugin:3.8.0:compile (default-compile) @ uber_jar ---
[INFO] Changes detected - recompiling the module!
[INFO] Compiling 1 source file to D:\BigData\3. Java\Workspaces\Mavens\uber_jar\target\classes
[INFO] 
[INFO] --- maven-resources-plugin:2.6:testResources (default-testResources) @ uber_jar ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] Copying 0 resource
[INFO] 
[INFO] --- maven-compiler-plugin:3.8.0:testCompile (default-testCompile) @ uber_jar ---
[INFO] Changes detected - recompiling the module!
[INFO] Compiling 1 source file to D:\BigData\3. Java\Workspaces\Mavens\uber_jar\target\test-classes
[INFO] 
[INFO] --- maven-surefire-plugin:2.22.1:test (default-test) @ uber_jar ---
[INFO] 
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.bobbydreamer.AppTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.013 s - in com.bobbydreamer.AppTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] 
[INFO] --- maven-jar-plugin:3.0.2:jar (default-jar) @ uber_jar ---
[INFO] Building jar: D:\BigData\3. Java\Workspaces\Mavens\uber_jar\target\uber_jar-1.0-SNAPSHOT.jar
[INFO] 
[INFO] --- maven-dependency-plugin:2.5.1:copy-dependencies (copy-dependencies) @ uber_jar ---
[INFO] Copying log4j-core-2.14.1.jar to D:\BigData\3. Java\Workspaces\Mavens\uber_jar\target\dependency-jars\log4j-core-2.14.1.jar
[INFO] Copying log4j-api-2.14.1.jar to D:\BigData\3. Java\Workspaces\Mavens\uber_jar\target\dependency-jars\log4j-api-2.14.1.jar
[INFO] 
[INFO] --- maven-shade-plugin:2.3:shade (default) @ uber_jar ---
[INFO] Including org.apache.logging.log4j:log4j-api:jar:2.14.1 in the shaded jar.
[INFO] Including org.apache.logging.log4j:log4j-core:jar:2.14.1 in the shaded jar.
[INFO] Replacing original artifact with shaded artifact.
[INFO] Replacing D:\BigData\3. Java\Workspaces\Mavens\uber_jar\target\uber_jar-1.0-SNAPSHOT.jar with D:\BigData\3. Java\Workspaces\Mavens\uber_jar\target\uber_jar-1.0-SNAPSHOT-shaded.jar
[INFO] Dependency-reduced POM written at: D:\BigData\3. Java\Workspaces\Mavens\uber_jar\dependency-reduced-pom.xml
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  30.096 s
[INFO] Finished at: 2021-07-30T22:55:21+05:30
[INFO] ------------------------------------------------------------------------
```

Executing `mvn clean package` generates two JAR files,      

* `uber_jar-1.0-SNAPSHOT.jar`: the self-contained executable JAR
* `original-uber_jar-1.0-SNAPSHOT.jar`: the **normal** JAR without the embedded dependencies but with the use of maven-jar-plugin and maven-dependency-plugin, we have copied the all the dependencies to a separate folder and made it to work. 

![JAR Execution output](assets/120-uber1.png)


### References
* [Maven : Introduction to the Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
* [Maven Fundamentals](119-maven-fundamentals)