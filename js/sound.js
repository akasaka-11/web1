/* sound.js — one shared sound player for the whole site.
   Exposes window.playSound(name). Each sound is a single <audio> object that is
   rewound before playing, and any other sound still playing is stopped first,
   so effects never overlap or pile up. */
(function () {
  const sources = {
    click:   'sounds/click.wav',
    add:     'sounds/add.wav',
    success: 'sounds/success.wav'
  };

  // Build the Audio objects once (preloaded) and keep them in an object.
  const library = {};
  Object.keys(sources).forEach(function (name) {
    library[name] = new Audio(sources[name]);
    library[name].preload = 'auto';
  });

  window.playSound = function (name) {
    const sound = library[name];
    if (!sound) return;

    // Stop whatever else is playing so sounds never overlap
    Object.values(library).forEach(function (other) {
      other.pause();
      other.currentTime = 0;
    });

    // play() returns a promise that can be rejected by browser autoplay rules
    sound.play().catch(function () {});
  };
})();
