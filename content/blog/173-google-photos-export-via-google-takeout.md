---
title: Exporting Google Photos via Google Takeout
description: Google Takeout generates .json file for every media file which contains meta-data information about the photos
date: 2025-01-19
tags:
  - commands
  - windows
  - google
slug: /173-google-photos-export-via-google-takeout
---
Once the Google Free Storage is full, you will start getting messages to cleanup or buy storage and after a while, you get messages like this and easiest thing is to buy storage. But thing is, you got backup as those memories in your locally somewhere, so that it doesn't get locked up or get deleted. 

![Google Space Issue Message](assets/173-google-takeout-1.png)

Downloading photos one-by-one from Google Photos is a pain, there is a full blown approach. Thats where Google Takeout comes, its a application which google had built to easily migrate to another Cloud Provider by letting you download all the data from their Cloud Products. So here i *select* only Google Photos. 

![Initiating Google Takeout](assets/173-google-takeout-2.png)

After you initiate the Takeout process, you will get a mail with the details of the downloads within few hours. Each split will be of 2GB of size. So there will be multiple files depending on size of data you have. 

![Email with Download links|500](assets/173-google-takeout-3.png)

If you unzip and check the files, there will be .json file for every media file. 

![Additional JSON for all media files |500](assets/173-google-takeout-4.png)

JSON file contains metadata about the image or video as follows

```
{
  "title": "VID_20190115_141143.mp4",
  "description": "",
  "imageViews": "2",
  "creationTime": {
    "timestamp": "1673689086",
    "formatted": "14 Jan 2023, 09:38:06 UTC"
  },
  "photoTakenTime": {
    "timestamp": "1547541709",
    "formatted": "15 Jan 2019, 08:41:49 UTC"
  },
  "geoData": {
    "latitude": 13.0378,
    "longitude": 80.2376,
    "altitude": 0.0,
    "latitudeSpan": 0.0,
    "longitudeSpan": 0.0
  },
  "geoDataExif": {
    "latitude": 13.0378,
    "longitude": 80.2376,
    "altitude": 0.0,
    "latitudeSpan": 0.0,
    "longitudeSpan": 0.0
  },
  "people": [
	  {"name": "Sushanth"}, 
	  {"name": "Stanley"}
  ],
  "url": "https://photos.google.com/photo/AF",
  "googlePhotosOrigin": {
    "mobileUpload": {
      "deviceFolder": {
        "localFolderName": ""
      },
      "deviceType": "ANDROID_PHONE"
    }
  }
}
```

You may want to merge this information with the image as images can hold all these meta data. 

Couple of tools, you may want to install and setup environment variables
* 7-Zip
* ExifTool

Below are the steps, i had followed
1. Used 7zip to unzip all files to same folder
2. Google Photos does have Duplicates as some pics and videos are in Albums, Favorites and Photos by their year. I had used a python program to find duplicates and delete them. It reduced almost 15GB.  
3. Used ExifTool to add tags and update Modified timestamp of the file itself. 

Below, i will explain on steps (1) and (3) as (2) involves only deleting duplicates. 

#### Used 7zip to unzip all files to same folder

Command: `7z x "*.zip" -o.\Takeout-All`

```
7-Zip 24.09 (x64) : Copyright (c) 1999-2024 Igor Pavlov : 2024-11-29

Scanning the drive for archives:
38 files, 81010681188 bytes (76 GiB)

Extracting archive: takeout-20250111T124838Z-001.zip
--
Path = takeout-20250111T124838Z-001.zip
Type = zip
Physical Size = 2147792492

Everything is Ok

...

Extracting archive: takeout-20250111T124838Z-038.zip
--
Path = takeout-20250111T124838Z-038.zip
Type = zip
Physical Size = 1715446372

Everything is Ok

Archives: 38
OK archives: 38
Files: 14238
Size:       81010330491
Compressed: 81010681188
```

#### Using ExifTool 

1. To add tags : Recursively scans media files(images, videos) applies meta-info in .json files and creates folders in similar structure to source path. 
```
exiftool -r -json -tagsfromfile %d%f.%e.json -o ../Takeout-Tagged/%d .

Note: To debug or verify file matching, add the -v2 flag to above command

--Output
...
   27 directories scanned
   17 directories created
 5898 image files created
   23 image files copied
```

You can use below command to view details of the image
```
exiftool -s IMG_20240908_201023.jpg

ExifToolVersion                 : 13.12
FileName                        : IMG_20240908_201023.jpg
Directory                       : .
FileSize                        : 5.8 MB
FileModifyDate                  : 2025:01:19 13:44:35+05:30
FileAccessDate                  : 2025:01:19 13:44:35+05:30
FileCreateDate                  : 2025:01:18 16:33:14+05:30
FilePermissions                 : -rw-rw-rw-
FileType                        : JPEG
FileTypeExtension               : jpg
MIMEType                        : image/jpeg
ExifByteOrder                   : Little-endian (Intel, II)
ImageDescription                :
Make                            : vivo
Model                           : V2055
Orientation                     : Unknown (0)
XResolution                     : 72
YResolution                     : 72
ResolutionUnit                  : inches
Software                        : MediaTek Camera Application
ModifyDate                      : 2024:09:08 20:10:25
YCbCrPositioning                : Co-sited
ExposureTime                    : 1/50
FNumber                         : 2.0
ExposureProgram                 : Not Defined
ISO                             : 513
ExifVersion                     : 0220
DateTimeOriginal                : 2024:09:08 20:10:25
CreateDate                      : 2024:09:08 20:10:25
ComponentsConfiguration         : Y, Cb, Cr, -
ShutterSpeedValue               : 1/49
BrightnessValue                 : 7
ExposureCompensation            : 0
MaxApertureValue                : 2.0
MeteringMode                    : Center-weighted average
LightSource                     : Other
Flash                           : Off, Did not fire
FocalLength                     : 3.9 mm
MakerNoteUnknownText            : 1
Warning                         : Invalid EXIF text encoding for UserComment
UserComment                     : filter: 0; jpegRotation: 270; fileterIntensity: 0.000000; filterMask: 0; module:31facing:1; .hw-remosaic: 0; .touch: (-1.0, -1.0); .modeInfo: Beauty ; .sceneMode: Night; .cct_value: 0; .AI_Scene: (-1, -1); .aec_lux: 0.0; .hist255: 0.0; .hist252~255: 0.0; .hist0~15: 0.0; .
SubSecTime                      : 023
SubSecTimeOriginal              : 023
SubSecTimeDigitized             : 023
FlashpixVersion                 : 0100
ColorSpace                      : sRGB
ExifImageWidth                  : 3680
ExifImageHeight                 : 6528
InteropIndex                    : R98 - DCF basic file (sRGB)
ExposureMode                    : Auto
WhiteBalance                    : Auto
DigitalZoomRatio                : 1
FocalLengthIn35mmFormat         : 25 mm
SceneCaptureType                : Standard
Compression                     : JPEG (old-style)
ThumbnailOffset                 : 1238
ThumbnailLength                 : 63744
URL                             : https://photos.google.com/photo/AF
XMPToolkit                      : Image::ExifTool 13.12
Description                     :
Title                           : IMG_20240908_201023.jpg
ProfileCMMType                  : Unknown (mtk)
ProfileVersion                  : 4.0.0
ProfileClass                    : Display Device Profile
ColorSpaceData                  : RGB
ProfileConnectionSpace          : XYZ
ProfileDateTime                 : 2018:01:09 16:16:16
ProfileFileSignature            : acsp
PrimaryPlatform                 : Unknown (MTK)
CMMFlags                        : Not Embedded, Independent
DeviceManufacturer              : Unknown (MTK)
DeviceModel                     :
DeviceAttributes                : Reflective, Glossy, Positive, Color
RenderingIntent                 : Perceptual
ConnectionSpaceIlluminant       : 0.9642 1 0.82491
ProfileCreator                  : Unknown (mtk)
ProfileID                       : 5757fd27eab54605c10d72f26398853b
ProfileDescription              : Display P3
ProfileCopyright                : Copyright Apple Inc., 2015
MediaWhitePoint                 : 0.95045 1 1.08905
RedMatrixColumn                 : 0.51512 0.2412 -0.00105
GreenMatrixColumn               : 0.29198 0.69225 0.04189
BlueMatrixColumn                : 0.1571 0.06657 0.78407
RedTRC                          : (Binary data 32 bytes, use -b option to extract)
ChromaticAdaptation             : 1.04788 0.02292 -0.0502 0.02959 0.99048 -0.01706 -0.00923 0.01508 0.75168
BlueTRC                         : (Binary data 32 bytes, use -b option to extract)
GreenTRC                        : (Binary data 32 bytes, use -b option to extract)
ImageWidth                      : 3680
ImageHeight                     : 6528
EncodingProcess                 : Baseline DCT, Huffman coding
BitsPerSample                   : 8
ColorComponents                 : 3
YCbCrSubSampling                : YCbCr4:2:0 (2 2)
Aperture                        : 2.0
ImageSize                       : 3680x6528
Megapixels                      : 24.0
ScaleFactor35efl                : 6.5
ShutterSpeed                    : 1/50
SubSecCreateDate                : 2024:09:08 20:10:25.023
SubSecDateTimeOriginal          : 2024:09:08 20:10:25.023
SubSecModifyDate                : 2024:09:08 20:10:25.023
ThumbnailImage                  : (Binary data 63744 bytes, use -b option to extract)
CircleOfConfusion               : 0.005 mm
FOV                             : 71.5 deg
FocalLength35efl                : 3.9 mm (35 mm equivalent: 25.0 mm)
HyperfocalDistance              : 1.60 m
LightValue                      : 5.3
```

2. If media files timestamp was to current timestamp, you can use this approach to recursively extract CreateDate meta-info from file itself and update the FileModifyDate meta.
```
exiftool -r -overwrite_original "-FileModifyDate<CreateDate" -api largefilesupport=1 .
```

* * * 
That's all for now
