---
title: Python - Adding timestamp to images
description: Adding timestamp watermark to images
date: 2024-12-16
tags:
  - python
slug: /172-adding-timestamp-to-images
---
I have taken lots of family pictures but i never thought of adding timestamp watermark to them. But when planning to make a Family Album, i thought it would be good to have a timestamp. 

Below is a simple python program, which would add timestamp to images. 

```cmd
# This library needs to be installed
conda install -c conda-forge Pillow
```

```python
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
import os

def add_timestamp(image_path, output_path):
    # Open the image
    image = Image.open(image_path)
    
    # Get the image dimensions
    width, height = image.size

    # Create a drawing object
    draw = ImageDraw.Draw(image)

    # Define the font and size (Adjust path to your font if necessary)
    font_size = int(height * 0.03)  # Font size proportional to image height
    font = ImageFont.truetype("arial.ttf", font_size)

    # Get the current timestamp
    # timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    # Get the file's last modified timestamp
    file_mod_time = os.path.getmtime(image_path)
    timestamp = datetime.fromtimestamp(file_mod_time).strftime("%Y-%m-%d %H:%M")


    # Determine text size
    text_bbox = draw.textbbox((0, 0), timestamp, font=font)  # Get bounding box of text
    text_width = text_bbox[2] - text_bbox[0]  # Calculate width
    text_height = text_bbox[3] - text_bbox[1]  # Calculate height

    # Define position for the bottom-right corner
    x = width - text_width - 60  # 10-pixel padding
    y = height - text_height - 60

    # Add the timestamp to the image
    draw.text((x, y), timestamp, fill="orange", font=font)

    # Save the new image
    image.save(output_path)

# Example usage
input_image = "IMG_20191227_132930-Test.jpg"  # Replace with your image path
output_image = "output.jpg"  # Replace with desired output path
add_timestamp(input_image, output_image)

```

Later would convert this program to loop it for all images in a folder

* * * 
That's all for now
