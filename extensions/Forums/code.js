class Forums extends Extension {
  constructor() {
    super('Forums');
  }

  static info() {
    return {
      id: 'Forums',
      title: 'Forums',
      author: 'The BetterGaia Team',
      description: 'A more modern forums.',
      homepage: 'http://www.bettergaia.com/',
      version: '1.0',
      match: ['/forum/**', '/news/**']
    };
  }

  static defaultPrefs() {
    return {
      'instants': true,
      'fontSizer': true,
      'previewThreads': true,
      'constrain': true,
      'pollHide': false,
      'reduceTransparency': false,

      'post.optionsBottom': true,
      'post.bgContainer': false,
      'post.offWhite': false,

      'theme.threadHeader': '30',
      'theme.postHeader': '207'
    };
  }

  static settings() {
    return [
      {type: 'title', value: 'General'},
      {type: 'checkbox', pref: 'instants', description: 'Use instant quoting and editing'},
      {type: 'checkbox', pref: 'fontSizer', description: 'Add a font size changer in posts'},
      {type: 'checkbox', pref: 'previewThreads', description: 'Use thread preview in thread listings'},
      {type: 'checkbox', pref: 'constrain', description: 'Constrain width of forums'},
      {type: 'checkbox', pref: 'pollHide', description: 'Show polls collapsed in threads'},
      {type: 'checkbox', pref: 'reduceTransparency', description: 'Reduce transparency in forums'},

      {type: 'title', value: 'Posts'},
      {type: 'checkbox', pref: 'post.optionsBottom', description: 'Show post options at bottom of posts'},
      {type: 'checkbox', pref: 'post.bgContainer', description: 'Show background around posts'},
      {type: 'checkbox', pref: 'post.offWhite', description: 'Show posts with an off-white background'},

      {type: 'title', value: 'Colors'},
      {type: 'hue', pref: 'theme.threadHeader', description: 'Main color'},
      {type: 'hue', pref: 'theme.postHeader', description: 'Posts color'}
    ];
  }

  render() {
    // Adds Instants
    if (this.getPref('instants') === true) {
      $('.post .post-options ul').each(function() {
        if ($(this).find('a.post-quote').length > 0 || $(this).find('a.post-edit').length > 0)
          $(this).prepend('<div class="bg_instant"><li><a class="bg_instanttext"><span>Instant</span></a></li></div>');

        if ($(this).find('a.post-quote').length > 0)
          $(this).find('.bg_instant').append('<li><a class="bg_instantquote" data-action="quote"><span>Quote</span></a></li>');

        if ($(this).find('a.post-edit').length > 0)
          $(this).find('.bg_instant').append('<li><a class="bg_instantedit" data-action="edit"><span>Edit</span></a></li>');
      });

      $('.post .post-options .bg_instant').on('click.Forums', 'a[data-action]', function() {
        let message = $(this).closest('.messagecontent'),
            action = this.getAttribute('data-action');

        if (message.find(`.bg_instantbox.${action}`).length === 0) {
          message.find('.post-bubble').after(`<div class="bg_instantbox ${action} loading">
            <span class="bg_spinner"></span>
          </div>`);

          //get url
          var url = message.find(`.post-options .post-${action}`).attr('href');
          $.get(url).done(function(data) {
            var pageHtml = $('<div>').html(data);
            pageHtml.find('script').remove();

            message.find(`.bg_instantbox.${action}`).removeClass('loading').html(pageHtml.find('form#compose_entry')[0].outerHTML);

            if (typeof BetterGaia.applyPostFormattingToolbar === 'function')
              BetterGaia.applyPostFormattingToolbar(message.find(`.bg_instantbox.${action} textarea[name="message"]`)[0]);
          });
        }
        else {
          $(this).closest('.messagecontent').find(`.bg_instantbox.${action}`).slideToggle('slow');
        }
      });
    }

    // Font Sizer
    if (this.getPref('fontSizer') === true) {
      $('.post .post-options ul').each(function() {
        $(this).append(`<li class="bg_fontsizer" data-scale="default">
          <a class="decrease"><span></span></a>
          <a class="size"><span>100%</span></a>
          <a class="increase"><span></span></a>
          </a>
        </li>`);
      });

      $('.post .post-options .bg_fontsizer').on('click.Forums', 'a.decrease, a.increase', function() {
        let scale = this.parentNode.getAttribute('data-scale');

        if (scale === 'default') {
          $(this).closest('.messagecontent').children('.post-bubble').find('span[style^="font-size"]').each(function() {
            let size = parseInt($(this).css('font-size').replace('px', ''), 10);
            $(this).css('font-size', `${size/13}em`);
          });
          scale = 100;
        }
        else scale = parseInt(scale, 10);

        if (this.classList.contains('decrease')) {
          if (scale <= 25) return;
          else scale -= 25;
        }
        else {
          if (scale >= 300) return;
          else scale += 25;
        }

        this.parentNode.setAttribute('data-scale', scale);
        $(this).siblings('.size').text(`${scale}%`);
        $(this).closest('.messagecontent').children('.post-bubble').css('font-size', `${scale}%`);
      });
    }
  }

  preMount() {
    this.addStyleSheet('style');

    // Full page forum width
    if (this.getPref('constrain') === true)
    this.addCSS(`
      body.forums > #content {width: auto;}
      body.forums #content #content-padding {width: 1140px; padding: 1em 0;}
      body.forums #gaia_content.ss_2Columns_flexiLeft_wideRight {padding: 1em 0; width: 100% !important;}
      body.forums #gaia_content.ss_2Columns_flexiLeft_wideRight > #yui-main {float: none; margin: 0 auto; width: 1140px;}
      body.forums #gaia_content.grid_dizzie_gillespie {padding: 15px 0 5px; width: 1140px !important; margin: 0 auto;}
      body.forums #gaia_content.grid_dizzie_gillespie > #bd {width: 1140px; margin: 0; overflow: visible;}
    `);

    // Poll Drop Down
    if (this.getPref('pollHide') === true)
    this.addCSS('body.forums #content #content-padding > #topic_header_container #thread_poll {height: 40px; overflow: hidden;} body.forums #content #content-padding > #topic_header_container #thread_poll:hover {height: auto; overflow: visible;} body.forums #content #content-padding > #topic_header_container #thread_poll:after {content: "\\25BC"; color: rgba(0,0,0,0.35); display: block; position: absolute; top: 9px; right: 8px; font-size: 17px; text-shadow: 0 1px 1px #FFF;} body.forums #content #content-padding > #topic_header_container #thread_poll:hover:after {color: rgba(0,0,0,0.7); content: "\\25B2";}');

    // Add background to posts
    if (this.getPref('post.bgContainer') === true)
    this.addCSS(`
      body.forums #content #post_container .post > .postcontent {border-radius: 5px 0 0 0; background-image: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.9)); background-size: 130px 130px; background-repeat: repeat-y;}
      body.forums #content #post_container .post.bgpc_hidden > .postcontent {border-radius: 5px;}
      body.forums #content #post_container .post .postcontent .user_info_wrapper .user_info .user_name, body.forums #content #post_container .post .postcontent .user_info_wrapper {border-top-left-radius: 0;}
    `);

    // Make posts off white
    if (this.getPref('post.offWhite') === true)
    this.addCSS('body.forums #content #post_container .post .postcontent .message .messagecontent .post-bubble {background-color: rgba(255,255,255,0.9);} body.forums #content #post_container .post .postcontent .message .messagecontent .post-bubble div.content, body.forums #content #post_container .post .postcontent .message .messagecontent .post-bubble .avi-speech:not(.document) .avi-speech-bd {background-color: transparent;}');

    // Make forums all white
    if (this.getPref('reduceTransparency') === true)
    this.addCSS('body.forums #content #content-padding > #topic_header_container #thread_header, body.forums #content #content-padding > #topic_header_container #thread_poll, body.forums #content #content-padding > #topic_header_container .detail-navlinks, body.forums #content #post_container .post .postcontent .message .messagecontent .post-options, body.forums #content #post_container .post .postcontent .post-signature, body.forums #content #content-padding > #navlinks_pag {background-color: #FFF;}');

    // Put post options on top
    if (this.getPref('post.optionsBottom') === false)
    this.addCSS('body.forums #content #post_container .post .postcontent .message .messagecontent {flex-direction: column-reverse;}');

    // Thread Header Color
    if (this.getPref('theme.threadHeader') != '30')
    this.addCSS(`body.forums #gaia_content:not(.grid_billie_holiday) #forum-header .linklist, body.forums #content #content-padding > .linklist, body.forums #gaia_content .forum-list + #forum_ft_content:before {background-color: hsl(${this.getPref('theme.threadHeader')}, 50%, 42%);}`);

    // Post Theme
    if (this.getPref('theme.postHeader') != '207')
    this.addCSS(`body.forums #content #post_container .post .postcontent .user_info_wrapper {background-color: hsl(${this.getPref('theme.postHeader')}, 78%, 89%);}`);
  }

  mount() {
    // Add thread preview
    if (this.getPref('previewThreads') === true) {
      $("body.forums #gaia_content table.forum-list tr td.title .one-line-title .topic-icon").after('<a class="bgThreadPreview" title="View the first post of this thread">[+]</a>');
      $("body.forums #gaia_content table.forum-list tr td.title .one-line-title a.bgThreadPreview").on("click", function() {
        if ($(this).closest('tr.rowon, tr.rowoff').next('tr.bgThreadPreviewBox').length === 0) {
          $(this).closest('tr.rowon, tr.rowoff').after('<tr class="bgThreadPreviewBox loading"><td colspan="6"><div>Test</div></td></tr>');
          var box = $(this).closest('tr.rowon, tr.rowoff').next('tr.bgThreadPreviewBox');
          $.ajax({
            type: 'GET',
            url: $(this).siblings('a[href]:not(.goto-new-posts)').attr('href'),
            headers: {'X-PJAX': true},
            success: function(data) {
              data = $("<div>").html(data);
              var avi = data.find("#post-1 .avi_box").html();
              var bubble = data.find("#post-1 .post-bubble").html();
              box.removeClass("loading").find('td > div').html("<div class='bgavi'>" + avi + "</div><div class='bgbubble'>" + bubble + "</div>");
            },
            error: function(error) {
              box.html("There was a problem retrieving the post.").removeClass('loading');
            }
          });
        }
        else $(this).closest('tr.rowon, tr.rowoff').next('tr.bgThreadPreviewBox').find('td > div').slideToggle('slow');
      });
    }

    if (document.querySelector('#topic_header_container #thread_header')) {
      this.render();

      // For ajax thread calls
      this.observer = new window.MutationObserver(() => {
        this.render();
      });
      this.observer.observe(document.getElementById('content-padding'), {
        attributes: false,
        childList: true,
        characterData: false
      });
    }
  }

  unMount() {
    this.removeCSS();
    $('.post .post-options .bg_instantquote, .post .post-options .bg_instantedit').off('click.Forums');
    $('.bg_instant, .bg_instantbox').remove();
  }
}
