/* script.js — Assignment 6 (jQuery).
   Loaded in the <head> of every page, right after jQuery 4.0.0 from the CDN.
   Everything runs inside $(document).ready(), so the HTML is ready before
   any element is selected. Each task checks that its elements exist on the
   current page, so the same file is safe to load everywhere.

   Part 1  — Task 1 live search, Task 2 autocomplete (menu.html),
             Task 3 search highlighting (contact.html FAQ)
   Part 2  — Task 4 scroll progress bar (all pages),
             Task 5 animated counter (index.html),
             Task 6 loading spinner on submit (all forms)
   Part 3  — Task 7 toast notifications, Task 8 copy to clipboard
             (contact.html), Task 9 image lazy loading */

$(document).ready(function () {

  /* =====================================================================
     TASK 0 — setup check
     ===================================================================== */
  console.log('jQuery is ready!');


  /* =====================================================================
     TASK 7 — Toast notifications (used by Tasks 6 and 8 and the menu)
     A toast is built with jQuery, faded in, kept for 3 s, then faded out
     and removed from the page.
     ===================================================================== */
  const toastIcons = { success: '✓', info: 'i', error: '!' };

  function showToast(message, type) {
    type = type || 'success';

    // One shared container, created the first time a toast is needed
    let $stack = $('#toastStack');
    if (!$stack.length) {
      $stack = $('<div id="toastStack" class="toast-stack" aria-live="polite"></div>')
        .appendTo('body');
    }

    const $toast = $('<div class="cs-toast"></div>').addClass('cs-toast-' + type);
    const $icon = $('<span class="cs-toast-icon" aria-hidden="true"></span>')
      .text(toastIcons[type] || toastIcons.info);
    // .text() (not .html()) so the message can never inject HTML
    const $text = $('<span class="cs-toast-text"></span>').text(message);
    const $close = $('<button type="button" class="cs-toast-close">&times;</button>')
      .attr('aria-label', 'Close notification');

    $toast.append($icon, $text, $close).hide().appendTo($stack);

    // fadeIn -> wait -> fadeOut -> remove (jQuery animation queue)
    $toast.fadeIn(250).delay(3000).fadeOut(400, function () {
      $(this).remove();
    });

    // Closing early: stop the queued animations and fade out now
    $close.on('click', function () {
      $toast.stop(true).fadeOut(200, function () { $(this).remove(); });
    });
  }

  // Shared with the plain-JS files (contact.js), like window.playSound
  window.showToast = showToast;

  // Menu page: confirm every "Add" click with a toast.
  // Delegated handler: the dish cards are re-drawn by menu.js, so the event
  // is caught on the #dishList container that never changes.
  $('#dishList').on('click', '.dish-card button', function () {
    const dishName = $(this).closest('.dish-card').find('h3').text().replace(' *', '');
    showToast(dishName + ' added to your order');
  });


  /* =====================================================================
     TASK 1 — Real-time search and live filter (menu.html)
     As the guest types, dish cards that do not contain the text are
     hidden with .filter() / .hide(). Works together with the category
     buttons from Assignment 5.
     ===================================================================== */
  const $dishSearch = $('#dishSearchInput');
  const $dishList = $('#dishList');
  const $filterStatus = $('#filterStatus');
  const $noResults = $('#noResults');

  function applyDishSearch() {
    const query = $dishSearch.val().trim().toLowerCase();
    const $cards = $dishList.find('.dish-card-wrap');

    // .filter() keeps only the cards whose name or description contains the query
    const $matches = $cards.filter(function () {
      const text = $(this).find('h3, p').text().toLowerCase();
      return text.indexOf(query) !== -1;
    });

    $cards.not($matches).hide();
    $matches.show();

    const total = typeof menuItems !== 'undefined' ? menuItems.length : $cards.length;
    let status = 'Showing ' + $matches.length + ' of ' + total + ' dishes';
    if (query) status += ' matching “' + $dishSearch.val().trim() + '”';
    $filterStatus.text(status);

    $noResults.toggle(query !== '' && $matches.length === 0);
    $noResults.find('span').text($dishSearch.val().trim());
  }

  if ($dishSearch.length) {
    $dishSearch.on('input', function () {
      applyDishSearch();
      buildSuggestions();
    });

    // menu.js re-draws the cards when a category button is clicked.
    // This delegated handler runs after it, so the search is applied again.
    $('#filterButtons').on('click', '.filter-btn', applyDishSearch);
  }


  /* =====================================================================
     TASK 2 — Autocomplete search suggestions (menu.html)
     A dropdown under the search box lists dish names that match what is
     typed. Mouse or keyboard (Up / Down / Enter / Esc) can pick one.
     ===================================================================== */
  const $suggestions = $('#dishSuggestions');
  let activeIndex = -1;

  function hideSuggestions() {
    $suggestions.hide().empty();
    activeIndex = -1;
    $dishSearch.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
  }

  function buildSuggestions() {
    const query = $dishSearch.val().trim().toLowerCase();
    if (!query || typeof menuItems === 'undefined') { hideSuggestions(); return; }

    // Names that start with the query come first, then names that contain it
    const startsWith = menuItems.filter(function (dish) {
      return dish.name.toLowerCase().indexOf(query) === 0;
    });
    const contains = menuItems.filter(function (dish) {
      return dish.name.toLowerCase().indexOf(query) > 0;
    });
    const matches = startsWith.concat(contains).slice(0, 6);

    $suggestions.empty();
    activeIndex = -1;

    if (!matches.length) { hideSuggestions(); return; }

    $.each(matches, function (i, dish) {
      const start = dish.name.toLowerCase().indexOf(query);
      const end = start + query.length;

      // Bold the part of the name that matches what was typed
      const $name = $('<span class="suggestion-name"></span>').append(
        document.createTextNode(dish.name.slice(0, start)),
        $('<strong></strong>').text(dish.name.slice(start, end)),
        document.createTextNode(dish.name.slice(end))
      );
      const category = dish.category.charAt(0).toUpperCase() + dish.category.slice(1);
      const $meta = $('<span class="suggestion-meta"></span>')
        .text(category + ' · $' + dish.price.toFixed(2));

      $('<li class="suggestion" role="option"></li>')
        .attr('id', 'suggestion-' + i)
        .attr('aria-selected', 'false')
        .data('name', dish.name)
        .append($name, $meta)
        .appendTo($suggestions);
    });

    $suggestions.show();
    $dishSearch.attr('aria-expanded', 'true');
  }

  function setActive(index) {
    const $items = $suggestions.children('.suggestion');
    if (!$items.length) return;
    activeIndex = (index + $items.length) % $items.length;     // wrap around
    $items.removeClass('is-active').attr('aria-selected', 'false');
    const $active = $items.eq(activeIndex)
      .addClass('is-active')
      .attr('aria-selected', 'true');
    $dishSearch.attr('aria-activedescendant', $active.attr('id'));
  }

  function chooseSuggestion(name) {
    $dishSearch.val(name);
    hideSuggestions();

    // Make sure the chosen dish is not hidden by a category filter
    const $allButton = $('.filter-btn[data-filter="all"]');
    if (!$allButton.hasClass('is-active')) $allButton.trigger('click');
    applyDishSearch();
  }

  if ($dishSearch.length) {
    $dishSearch.on('keydown', function (e) {
      const isOpen = $suggestions.is(':visible');
      switch (e.key) {
        case 'ArrowDown':
          if (!isOpen) buildSuggestions();
          setActive(activeIndex + 1);
          e.preventDefault();
          break;
        case 'ArrowUp':
          setActive(activeIndex - 1);
          e.preventDefault();
          break;
        case 'Enter':
          if (isOpen && activeIndex > -1) {
            chooseSuggestion($suggestions.children().eq(activeIndex).data('name'));
            e.preventDefault();
          }
          break;
        case 'Escape':
          // First Esc only closes the list
          // (by default Esc in a search box would also clear the text)
          if (isOpen) {
            hideSuggestions();
            e.preventDefault();
          }
          break;
      }
    });

    // mousedown (not click) fires before the input loses focus;
    // preventDefault keeps the focus in the search box
    $suggestions.on('mousedown', '.suggestion', function (e) {
      e.preventDefault();
      chooseSuggestion($(this).data('name'));
    });
    $suggestions.on('mouseenter', '.suggestion', function () {
      setActive($(this).index());
    });

    $dishSearch.on('blur', hideSuggestions);
    $dishSearch.on('focus', buildSuggestions);
  }


  /* =====================================================================
     TASK 3 — Search highlighting (contact.html FAQ)
     Every match of the keyword inside the FAQ questions and answers is
     wrapped in <mark>. A RegExp finds the matches, Text.splitText() cuts
     the text around them and .wrap() puts the <mark> around each piece.
     ===================================================================== */
  const $faqSearch = $('#faqSearch');
  const $faqStatus = $('#faqSearchStatus');
  const $faqTargets = $('.faq-text, .faq-answer p');

  // Characters like . * ? ( ) have a meaning in a RegExp, so escape them
  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function clearHighlights() {
    $faqTargets.find('mark.search-hit').contents().unwrap();
    // join the split text pieces back together
    $faqTargets.each(function () { this.normalize(); });
  }

  function highlightIn($elements, regex) {
    let count = 0;

    // Only text nodes (nodeType 3), so tags and attributes are never touched
    $elements.contents().filter(function () {
      return this.nodeType === 3;
    }).each(function () {
      const textNode = this;
      const found = [];
      let match;

      regex.lastIndex = 0;
      while ((match = regex.exec(textNode.nodeValue)) !== null) {
        found.push({ index: match.index, length: match[0].length });
      }

      // Work backwards so earlier positions stay correct after each split
      for (let i = found.length - 1; i >= 0; i--) {
        const hit = textNode.splitText(found[i].index);   // hit = match + rest of text
        hit.splitText(found[i].length);                    // hit = only the match
        $(hit).wrap('<mark class="search-hit"></mark>');
        count++;
      }
    });

    return count;
  }

  function setFaqOpen($item, open) {
    const answer = $item.find('.faq-answer')[0];
    $item.toggleClass('open', open);
    $item.find('.faq-question').attr('aria-expanded', String(open));
    answer.style.maxHeight = open ? answer.scrollHeight + 'px' : null;
  }

  if ($faqSearch.length) {
    $faqSearch.on('input', function () {
      const query = $(this).val().trim();
      clearHighlights();

      if (!query) {
        $faqStatus.text('');
        // Close the answers that the search opened
        $('.faq-item').each(function () {
          const $item = $(this);
          if ($item.data('openedBySearch')) {
            $item.data('openedBySearch', false);
            setFaqOpen($item, false);
          }
        });
        return;
      }

      const regex = new RegExp(escapeRegExp(query), 'gi');
      let total = 0;
      let itemsWithHits = 0;

      $('.faq-item').each(function () {
        const $item = $(this);
        const inQuestion = highlightIn($item.find('.faq-text'), regex);
        const inAnswer = highlightIn($item.find('.faq-answer p'), regex);

        if (inQuestion + inAnswer > 0) itemsWithHits++;
        total += inQuestion + inAnswer;

        // Open answers that contain the word so the highlight can be seen
        if (inAnswer > 0) {
          if (!$item.hasClass('open')) $item.data('openedBySearch', true);
          setFaqOpen($item, true);
        } else if ($item.data('openedBySearch')) {
          $item.data('openedBySearch', false);
          setFaqOpen($item, false);
        }
      });

      if (total) {
        $faqStatus.text(total + (total === 1 ? ' match' : ' matches') + ' in ' +
          itemsWithHits + (itemsWithHits === 1 ? ' question' : ' questions'));
      } else {
        $faqStatus.text('No matches for “' + query + '”');
      }
    });
  }


  /* =====================================================================
     TASK 4 — Colourful scroll progress bar (every page)
     A fixed bar at the top of the window. Its width is the share of the
     page that has been scrolled: scrollTop / (document height - window height).
     A small % label follows the tip while the page is scrolling.
     ===================================================================== */
  const $progress = $(
    '<div class="scroll-progress" aria-hidden="true">' +
      '<div class="scroll-progress-bar"></div>' +
      '<span class="scroll-progress-label">0%</span>' +
    '</div>'
  ).prependTo('body');
  const $progressBar = $progress.find('.scroll-progress-bar');
  const $progressLabel = $progress.find('.scroll-progress-label');
  let scrollTimer = null;

  function updateProgress() {
    const scrollable = $(document).height() - $(window).height();
    const scrolled = $(window).scrollTop();
    const percent = scrollable > 0 ? Math.min(100, (scrolled / scrollable) * 100) : 0;
    const width = $(window).width();

    $progressBar.css('width', percent + '%');
    $progressLabel
      .text(Math.round(percent) + '%')
      .css('left', Math.max(26, Math.min(width - 26, (width * percent) / 100)) + 'px');
  }

  $(window).on('scroll.progress', function () {
    updateProgress();
    // Show the % label while scrolling, hide it shortly after scrolling stops
    $progress.addClass('is-scrolling');
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { $progress.removeClass('is-scrolling'); }, 900);
  });
  $(window).on('resize.progress', updateProgress);
  updateProgress();


  /* =====================================================================
     TASK 5 — Animated number counter (index.html, "By the Numbers")
     Starts once, when the stats section scrolls into view. jQuery's
     .animate() runs on a plain object { value: 0 } and the step callback
     writes the current value into the page.
     ===================================================================== */
  const $stats = $('#stats');

  function formatNumber(value, decimals) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function countUp($number) {
    const target = parseFloat($number.data('count'));
    const decimals = $number.data('decimals') || 0;
    const suffix = $number.data('suffix') || '';

    $({ value: 0 }).animate({ value: target }, {
      duration: 2200,
      easing: 'swing',
      step: function (now) {
        $number.text(formatNumber(now, decimals) + suffix);
      },
      complete: function () {
        // land exactly on the target number
        $number.text(formatNumber(target, decimals) + suffix);
      }
    });
  }

  function checkStats() {
    const windowBottom = $(window).scrollTop() + $(window).height();
    if (windowBottom > $stats.offset().top + 60) {
      $(window).off('scroll.counter resize.counter');            // run only once
      $stats.find('.stat-number').each(function () { countUp($(this)); });
    }
  }

  if ($stats.length) {
    $(window).on('scroll.counter resize.counter', checkStats);
    checkStats();
  }


  /* =====================================================================
     TASK 6 — Loading spinner on submit
     validation.js (Assignment 4) checks the fields. When a form is valid
     it fires a "form:valid" event; this handler takes over: the button
     shows a spinner + "Please wait…" and is disabled, then after 2 s
     (simulating a server call) everything returns to normal.
     ===================================================================== */
  function setButtonLoading(button, isLoading) {
    const $button = $(button);
    if (isLoading) {
      $button.data('originalHtml', $button.html());             // remember the label
      $button.prop('disabled', true).attr('aria-busy', 'true').html(
        '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>' +
        'Please wait…'
      );
    } else {
      $button.prop('disabled', false).removeAttr('aria-busy')
        .html($button.data('originalHtml'));
    }
  }
  window.setButtonLoading = setButtonLoading;                   // also used by contact.js

  function resetForm($form) {
    $form[0].reset();
    $form.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
    $form.find('.js-error').remove();
  }

  function showSuccessAlert($form) {
    $form.find('.js-success').remove();
    $('<div class="alert alert-success js-success" role="alert"></div>')
      .text($form.data('success') || 'Form submitted successfully!')
      .prependTo($form)
      .delay(5000)
      .fadeOut(400, function () { $(this).remove(); });
  }

  $(document).on('form:valid', 'form', function () {
    const form = this;
    const $form = $(form);
    const $button = $form.find('[type="submit"]');

    setButtonLoading($button, true);

    setTimeout(function () {                                     // pretend server call
      setButtonLoading($button, false);
      resetForm($form);
      showSuccessAlert($form);
      showToast($form.data('toast') || 'Form submitted successfully');   // Task 7

      // Tell popup.js (plain JS) that sending is finished so it can close
      form.dispatchEvent(new CustomEvent('form:sent', { bubbles: true }));
    }, 2000);
  });


  /* =====================================================================
     TASK 8 — Copy to clipboard (contact.html, "Find Us")
     The button runs document.execCommand('copy'), which fires a "copy"
     event. Our .on('copy') handler puts the text into the clipboard.
     The icon then turns into a checkmark and a "Copied to clipboard!"
     tooltip appears for 2 seconds.
     ===================================================================== */
  function copyText(text) {
    let copied = false;

    function onCopy(e) {
      e.originalEvent.clipboardData.setData('text/plain', text);
      e.preventDefault();               // use our text, not the page selection
      copied = true;
    }

    $(document).on('copy', onCopy);
    try { document.execCommand('copy'); } catch (err) { /* not supported */ }
    $(document).off('copy', onCopy);

    // Fallback for browsers that block execCommand: the async Clipboard API
    if (!copied && navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }
    return copied ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
  }

  function showCopied($button) {
    const $icon = $button.find('.bi');
    const $tooltip = $button.find('.copy-tooltip');

    $icon.removeClass('bi-clipboard').addClass('bi-check2');
    $button.addClass('is-copied');
    $tooltip.stop(true, true).fadeIn(150);

    clearTimeout($button.data('resetTimer'));
    $button.data('resetTimer', setTimeout(function () {
      $tooltip.fadeOut(200);
      $icon.removeClass('bi-check2').addClass('bi-clipboard');
      $button.removeClass('is-copied');
    }, 2000));
  }

  $('.copy-btn').on('click', function () {
    const $button = $(this);
    const text = $button.closest('.copy-row').find('.copy-text').text().trim();

    copyText(text).then(function () {
      showCopied($button);
    }, function () {
      showToast('Could not copy. Please select the text and press Ctrl+C.', 'error');
    });
  });

  // If someone selects a snippet and copies it with Ctrl+C, show the same feedback
  $('.copy-text').on('copy', function () {
    showCopied($(this).closest('.copy-row').find('.copy-btn'));
  });


  /* =====================================================================
     TASK 9 — Image lazy loading (index, menu, gallery)
     Images start with a tiny placeholder and keep the real address in
     data-src. On scroll, any image whose .offset().top is close to the
     visible area gets its real src with .attr('src', ...).
     ===================================================================== */
  let $lazyImages = $('img.lazy[data-src]');
  const LAZY_MARGIN = 150;     // start loading 150px before the image is visible

  function loadVisibleImages() {
    const windowBottom = $(window).scrollTop() + $(window).height() + LAZY_MARGIN;

    // Keep in the list only the images that are still waiting
    $lazyImages = $lazyImages.filter(function () {
      const $img = $(this);
      if ($img.offset().top > windowBottom) return true;         // not near the screen yet

      $img.one('load error', function () { $img.addClass('is-loaded'); })
        .attr('src', $img.data('src'))
        .removeAttr('data-src');
      console.log('Lazy-loaded image: ' + $img.attr('alt'));
      return false;
    });

    // Everything loaded: stop listening to scroll
    if (!$lazyImages.length) $(window).off('.lazy');
  }

  if ($lazyImages.length) {
    $(window).on('scroll.lazy resize.lazy load.lazy', loadVisibleImages);
    loadVisibleImages();
  }
});
