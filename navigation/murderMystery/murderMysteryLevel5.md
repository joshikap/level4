---
layout: opencs
title: Murder Mystery Level 5
permalink: /gamify/murderMysteryL5
microblog: true
---

<div id="gameContainer" style="position: relative;">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <canvas id='gameCanvas' width="800" height="600"></canvas>
</div>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
</style>

<script type="module">
    // Mansion Game assets locations (use central core + GameControl)
    import Core from "{{site.baseurl}}/assets/js/murderMysteryGame/murderMysteryGameLogic";
    import GameControl from "{{site.baseurl}}/assets/js/murderMysteryGame/GameControl.js";
    import murderMysteryL5 from "{{site.baseurl}}/assets/js/murderMysteryGame/muderMysteryL5.js";
    import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

    // Web Server Environment data

    const environment = {
        path:"{{site.baseurl}}",
        pythonURI: pythonURI,
        javaURI: javaURI,
        fetchOptions: fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameCanvas: document.getElementById("gameCanvas"),
        gameLevelClasses: [murderMysteryL5]

    }
    // Launch Mansion Game using the central core and mansion GameControl
    Core.main(environment, GameControl);
</script>