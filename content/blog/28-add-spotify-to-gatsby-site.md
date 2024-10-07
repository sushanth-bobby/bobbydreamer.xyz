---
title: Adding Spotify playlist to your gatsby site
date: 2020-04-26
description: Adding Spotify playlist to your gatsby site
tags:
  - web-development
  - music
slug: "/28-add-spotify-to-gatsby-site"
---
**Last updated** : 26/April/2020     

Follow below steps to setup Spotify Music Player in a Gatsby site,    

1. Create a account in Spotify
1. Create a new playlist
1. Search and Add songs to your playlist
1. Go to [your homepage in Spotify](https://open.spotify.com/), click *Your Library* and then your playlist and then click on the 3 dots(...) and from submenu, copy the playlist link    
  ![Spotify - Copy playlist link](assets/28-spotify1.png)

    For me playlist link look like this,    
    https://open.spotify.com/playlist/0sz2J5ZVROxMv3ZkVMTKuw?si=jN0r2_DTSaal9A92sYf1Vw

    Update the link like below(add `/embed/`),     
    https://open.spotify.com/embed/playlist/0sz2J5ZVROxMv3ZkVMTKuw?si=Tg-Dup3iQ7ivdIGo1R5fAQ

    **Note** : If you miss the above step, you will get to play only 30 seconds of song in Web player    
 
1. Add this to your gatsby mdx file
    ```js:title=content/pages/music/index.mdx
    import SpotifyPlayer from "./SpotifyPlayer";

    <SpotifyPlayer
      uri="spotify:user:Bobby:playlist:0sz2J5ZVROxMv3ZkVMTKuw"
      size="large"
      theme="black"
      view="list"
    />
    ```

  1. `SpotifyPlay.js` looks like this
    ```js:title=content/pages/music/SpotifyPlay.js
      /**
      * Spotify player iframe widget
      *
      * @author Alexander Wallin <office@alexanderwallin.com>
      * @see https://developer.spotify.com/technologies/widgets/spotify-play-button/
      */

      import React, { Component } from "react"

      // Size presets, defined by Spotify
      const sizePresets = {
        large: {
          width: 300,
          height: 380,
        },
        compact: {
          width: 300,
          height: 80,
        },
      }

      /**
      * SpotifyPlayer class
      */
      class SpotifyPlayer extends Component {
        // ------------------------------------------------------
        // Render
        // ------------------------------------------------------

        render() {
          // const { uri, view, theme } = this.props
          let { size } = this.props

          if (typeof size === `string`) {
            size = sizePresets[size]
          }

          return (

            <iframe title="Spotify" 
                    src="https://open.spotify.com/embed/playlist/0sz2J5ZVROxMv3ZkVMTKuw?si=Tg-Dup3iQ7ivdIGo1R5fAQ" 
                    width="300" height="380" frameborder="0" allowtransparency="true" 
                    allow="encrypted-media">
            </iframe>      
          )
        }
      }

      export default SpotifyPlayer
    ```

All this in Spotify comes under **Play Button**.

### # Resources 
* [Spotify for Developers : Widgets -> Guides](https://developer.spotify.com/documentation/widgets/guides/adding-a-spotify-play-button/)