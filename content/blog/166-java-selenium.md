---
title: Scraping using Java Selenium
description: Java Selenium Scraping Example
date: 2024-11-22
tags:
  - scraping
slug: /166-java-selenium
---

#### Setting up Selenium

For selenium to work, all this 3 has to match up. 
1. Selenium Version
	1. groupId: org.seleniumhq.selenium
	2. artifactId: selenium-java
	3. version: 4.20.0
2. ChromeDriver - version: "124.0.6325.0"
3. Chrome - version: "124.0.6325.0"
	1. Using custom chrome otherwise default chrome is getting picked which doesn't match up with Selenium/ChromeDriver

**Selenium - from Maven Repository**
* [Maven Repository: org.seleniumhq.selenium » selenium-java](https://mvnrepository.com/artifact/org.seleniumhq.selenium/selenium-java)
* Picking the right chrome version for selenium matters, once you select the version of selenium, click the version. 

![[166-Pasted image 20241019144926.png]]

* In next page, in compiled dependencies, you can see "selenium-devtools-v127", "selenium-devtools-v128", "selenium-devtools-v129". Those are actually chrome versions. 
![[166-Pasted image 20241019144742.png]]

**Chrome and Chrome Driver can be downloaded from:**
* [Chrome for Testing availability](https://googlechromelabs.github.io/chrome-for-testing/)
* [GitHub - GoogleChromeLabs/chrome-for-testing](https://github.com/GoogleChromeLabs/chrome-for-testing)
	* Endpoint - [`known-good-versions-with-downloads.json`](https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json)

* * *
#### Java - HTML Table to JSON

Below is the full pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>

  

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"

xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

<modelVersion>4.0.0</modelVersion>
<groupId>org.sample</groupId>
<artifactId>maven</artifactId>
<version>0.0.1-SNAPSHOT</version>

  
<name>maven</name>
<description>A simple maven.</description>

<!-- FIXME change it to the project's website -->
<url>http://www.example.com</url>

<properties>
	<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	
	<maven.compiler.source>8</maven.compiler.source>
	
	<maven.compiler.target>8</maven.compiler.target>
</properties>


<dependencies>

	<dependency>
		<groupId>junit</groupId>
		<artifactId>junit</artifactId>
		<version>3.8.1</version>	
	</dependency>
	
	<dependency>
		<groupId>org.seleniumhq.selenium</groupId>
		<artifactId>selenium-java</artifactId>
		<version>4.20.0</version>
	</dependency>

	<!-- JSON library for Java -->
	<dependency>
		<groupId>org.json</groupId>
		<artifactId>json</artifactId>
		<version>20230227</version>
	</dependency>

	<!-- Reading JSONs -->
	<dependency>
		<groupId>org.jsoup</groupId>
		<artifactId>jsoup</artifactId>
		<version>1.14.3</version>
	</dependency>

	<dependency>
		<groupId>com.google.code.gson</groupId>
		<artifactId>gson</artifactId>
		<version>2.8.8</version>
	</dependency>

</dependencies>

  

<build>
	<pluginManagement><!-- lock down plugins versions to avoid using Maven defaults (may be moved to parent pom) -->

		<plugins>
		
			<plugin>
				<artifactId>maven-clean-plugin</artifactId>
				<version>3.4.0</version>
			</plugin>
		
			<plugin>
				<artifactId>maven-site-plugin</artifactId>
				<version>3.12.1</version>
			</plugin>
		
			<plugin>
				<artifactId>maven-project-info-reports-plugin</artifactId>
				<version>3.6.1</version>
			</plugin>
		
			<!-- see http://maven.apache.org/ref/current/maven-core/default-bindings.html#Plugin_bindings_for_jar_packaging -->
			<plugin>
				<artifactId>maven-resources-plugin</artifactId>
				<version>3.3.1</version>
			</plugin>
		
			<plugin>
				<artifactId>maven-compiler-plugin</artifactId>
				<version>3.13.0</version>
			</plugin>
		
			<plugin>
				<artifactId>maven-surefire-plugin</artifactId>
				<version>3.3.0</version>
			</plugin>
		
			<plugin>
				<artifactId>maven-jar-plugin</artifactId>
				<version>3.4.2</version>
			</plugin>
		
			<plugin>
				<artifactId>maven-install-plugin</artifactId>
				<version>3.1.2</version>
			</plugin>
		
			<plugin>
				<artifactId>maven-deploy-plugin</artifactId>
				<version>3.1.2</version>
			</plugin>
		
		</plugins>

	</pluginManagement>

</build>

  

<reporting>
	<plugins>
	
		<plugin>
			<artifactId>maven-project-info-reports-plugin</artifactId>
		</plugin>
	
	</plugins>
</reporting>

</project>
```

Below is the Java Code
```java
package org.sample.maven;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;
import java.time.Duration;

public class TableScraper {
    public static void main(String[] args) {

    	// Setting userAgent is !important otherwise you can get Access Denied messages
    	String userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.517 Safari/537.36";
    	
        // Set the path for the WebDriver (e.g., ChromeDriver) - Uses - version: "124.0.6325.0"
        System.setProperty("webdriver.chrome.driver", "D:\\20230422 - BigData\\3. Java\\chromedriver-win64\\chromedriver.exe");
        
        // Set ChromeOptions to run in headless mode        
        ChromeOptions options = new ChromeOptions();
        options.setBinary("D:\\20230422 - BigData\\3. Java\\chrome-win64\\chrome.exe");
        options.addArguments("--headless=new");  // Run Chrome in headless mode
        options.addArguments("--disable-gpu");  // Disable GPU (optional but recommended for headless mode)
        options.addArguments("--window-size=1920,1080");  // Optional: Set window size for headless mode
        options.addArguments("--user-agent="+userAgent);
        
        // Initialize WebDriver
        WebDriver driver = new ChromeDriver(options);

        WebElement table;
    	try {
	        // Replace with the URL you want to scrape (can handle HTTP and HTTPS)
	        String url = "https://www.w3schools.com/html/html_tables.asp";
	        driver.get(url);        
        
	        // Wait for the table to become visible (modify selector based on your page structure)
	        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(3));
	        
	        // Save the entire HTML content of the page to a local file
	        String pageSource = driver.getPageSource();  // Get the current page's HTML content	        
//	        System.out.println(pageSource);

	        table = wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("ws-table-all")));

	        // Get all rows of the table
	        List<WebElement> rows = table.findElements(By.tagName("tr"));
	
	        // Create a JSON Array to hold the table data
	        JSONArray tableData = new JSONArray();
	
	        // Iterate over the rows and get data
	        for (WebElement row : rows) {
	            List<WebElement> cells = row.findElements(By.tagName("td"));
	
	            // Create a JSON object for each row
	            JSONObject rowData = new JSONObject();
	            int cellIndex = 0;
	
	            for (WebElement cell : cells) {
	                // Add cell data to JSON object
	                rowData.put("column" + cellIndex, cell.getText());
	                cellIndex++;
	            }
	
	            // Add row data to the table JSON array
	            tableData.put(rowData);
	        }
	
	        // Convert to JSON string and print
	        System.out.println(tableData.toString(4));
	        
    	} finally {
            // Close the browser is important otherwise Chrome.exeand ChromeDriver.exe tasks will active in Task Manager
            driver.quit();
        }
        
    }
}
```

Output:
```shell
[

{},

{

"column1": "Maria Anders",

"column0": "Alfreds Futterkiste",

"column2": "Germany"

},

{

"column1": "Francisco Chang",

"column0": "Centro comercial Moctezuma",

"column2": "Mexico"

},

{

"column1": "Roland Mendel",

"column0": "Ernst Handel",

"column2": "Austria"

},

{

"column1": "Helen Bennett",

"column0": "Island Trading",

"column2": "UK"

},

{

"column1": "Yoshi Tannamuri",

"column0": "Laughing Bacchus Winecellars",

"column2": "Canada"

},

{

"column1": "Giovanni Rovelli",

"column0": "Magazzini Alimentari Riuniti",

"column2": "Italy"

}

]
```
