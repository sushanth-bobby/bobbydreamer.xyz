---
title: Process to read file into dataframe
date: 2020-07-06
description: Using function to read file and load dataframe
tags:
  - python
  - pandas
slug: "/29-python-process-to-read-files"
---

Its easy to read csv files in python into a dataframe. Problem i am encountering is, i have a file with many columns, in the program, i don't need all the columns at once, i want to process, specific set of columns for one set of logic and use other set of columns somewhere in the program, similarly i had to write many programs. So, when i looked into the code for review, i saw too many pd.read_csv()

```py {9}
filename = 'movies_metadata.csv'
all_cols = ['adult', 'belongs_to_collection', 'budget', 'genres', 'homepage', 'id',
       'imdb_id', 'original_language', 'original_title', 'overview',
       'popularity', 'poster_path', 'production_companies',
       'production_countries', 'release_date', 'revenue', 'runtime',
       'spoken_languages', 'status', 'tagline', 'title', 'video',
       'vote_average', 'vote_count']

use_cols = ['imdb_id', 'original_language', 'original_title', 'overview']

osfp_file  = os.path.join(os.getcwd(), '..', 'data', 'mc_files', filename)
df = pd.read_csv(osfp_file, sep='|', names=all_cols, usecols=use_cols ,skip_blank_lines=True, dtype=object)
```

Somewhere else, 
```py {9}
filename = 'movies_metadata.csv'
all_cols = ['adult', 'belongs_to_collection', 'budget', 'genres', 'homepage', 'id',
       'imdb_id', 'original_language', 'original_title', 'overview',
       'popularity', 'poster_path', 'production_companies',
       'production_countries', 'release_date', 'revenue', 'runtime',
       'spoken_languages', 'status', 'tagline', 'title', 'video',
       'vote_average', 'vote_count']

use_cols = ['imdb_id', 'tagline', 'title', 'popularity', 'vote_count', 'vote_average']

osfp_file  = os.path.join(os.getcwd(), '..', 'data', 'mc_files', filename)
df = pd.read_csv(osfp_file, sep='|', names=all_cols, usecols=use_cols ,skip_blank_lines=True, dtype=object)
```

Like this i have to read many csv files. So, if any input files change, i have to change in many places. So, to cut all these multiple changes, i have created a module(single python file) and added a UDF to read CSV file and pass use_cols as argument. 
```py {19-20}
# Table : movie_meta
def read_movie_meta(use_cols):    
    filename = 'movie_metadata.csv'
    print('Reading {}'.format(filename))
    all_cols = ['adult', 'belongs_to_collection', 'budget', 'genres', 'homepage', 'id',
          'imdb_id', 'original_language', 'original_title', 'overview',
          'popularity', 'poster_path', 'production_companies',
          'production_countries', 'release_date', 'revenue', 'runtime',
          'spoken_languages', 'status', 'tagline', 'title', 'video',
          'vote_average', 'vote_count']

    #use_cols = ['imdb_id', 'original_language', 'original_title', 'overview']

    osfp_file  = os.path.join(os.getcwd(), '..', 'data', 'mc_files', filename)
    df = pd.read_csv(osfp_file, sep='|', names=all_cols, usecols=use_cols ,skip_blank_lines=True, dtype=object)
    return df

# Get data from movie_meta
use_cols = ['imdb_id', 'original_language', 'original_title', 'overview']
df_mm = read_movie_meta(use_cols)
print('{} = {}'.format('df_mm', df_mm.shape))
```

Now, my code is small and any change to input file, i have to change in only one place. 

This might look basic, but helped a lot. 